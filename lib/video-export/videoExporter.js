var VideoExporter = function () {
    
    var self = this; 

    var worker;
    var onFinishedCallback;
    var audioTracks = [];

    this.init = function () {
        worker = new Worker("lib/video-export/worker-asm.js");
        worker.onmessage = function (event) {
            handleMessage(event.data);
        };
    }

    this.addAudioTrack = function (buffer, trimStart, trimEnd, delay) {
        audioTracks.push({
            buffer: buffer,
            trimStart, trimStart,
            trimEnd: trimEnd,
            delay: delay
        })
    }

    this.mergeAudioTracks = function (args) {
        var ffmpegCommandFormat = '-i in1.mp3 -i in2.mp3 -i in3.mp3 -filter_complex "[0]atrim=1:2[a]; [1]adelay=3000|3000[b]; [2]adelay=2000|2000[c]; [a][b][c]amix=3,volume=3" out.ogg'
        var ffmpegCommand = ''

        var sampleFilenames = [];
        for(var i = 0; i < audioTracks.length; i++) {
            var filename = 'in'+(i+1)+'.mp3';
            sampleFilenames.push(filename);
            ffmpegCommand += '-i ' + filename + ' ';
        }

        ffmpegCommand += '-filter_complex "'

        var letters = ['a','b','c']
        var sampleBuffers = [];
        for(var i = 0; i < audioTracks.length; i++) {
            var audioTrack = audioTracks[i];
            sampleBuffers.push(audioTrack.buffer);
            ffmpegCommand += '['+i+']adelay='+audioTrack.delay+'|'+audioTrack.delay+'['+String.fromCharCode(97 + i)+']; '
        }

        var letters = ''
        for(var i = 0; i < audioTracks.length; i++) {
            letters += '[' + String.fromCharCode(97 + i) + ']';
        }
        ffmpegCommand += letters+'amix='+audioTracks.length+',volume='+audioTracks.length+'" out.ogg'

        // set callback for command.
        onFinishedCallback = function (o) {
            audioTracks = [];
            args.callback(o)
        }; 

        // parse command arguments
        var commandArgs = parseArguments(ffmpegCommand);
        var allFiles = []; 

        // Update filenames for fileInfo
        if (sampleFilenames.length !== sampleBuffers.length) {
            console.error("Files are not the same!"); 
            return; 
        }

        for (var i=0; i<sampleFilenames.length; i++) {
            var fileInfo = {
                "name": sampleFilenames[i],
                "data": sampleBuffers[i],
            }
            allFiles.push(fileInfo); 
        }

        // Send command to worker
        worker.postMessage({
            type: "command",
            arguments: commandArgs,
            files: allFiles,
            commandName: 'audio_track_generation', 
        });
    }

    //  renderVideoFromFrames (args)
    //  args.frames,                  type: Image Array
    //  args.framerate,               type: Number
    //  args.width,                   type: Number
    //  args.height,                  type: Number
    //  args.codec,                   type: String
    //  args.bitrate,                 type: String
    //  args.pixel_format,            type: String
    //  args.callback                 type: Function
    this.renderVideoFromFrames = function (args) {
        var commandFormat = '-r <FRAMERATE> -f image2 -s <WIDTH>x<HEIGHT> -i pic%12d.jpg -vcodec <CODEC> -vb <BITRATE> test.mp4';
        
        var framerate = args.framerate || 30;
        var width = args.width || 720;
        var height = args.height || 480;
        var codec = args.codec || 'mpeg4';
        var bitrate = args.bitrate || '20M';
        var frames = args.frames;
        var callback = args.callback;

        onFinishedCallback = args.completedCallback;
        
        var command = commandFormat;
        command = command.replace('<FRAMERATE>', framerate)
        command = command.replace('<WIDTH>', width)
        command = command.replace('<HEIGHT>', height)
        command = command.replace('<BITRATE>', bitrate)
        command = command.replace('<CODEC>', codec)

        var files = [];
        frames.forEach(function (frame) {
            var i = frames.indexOf(frame);
            var paddedIndex = zeroFill(i, 12)
            var frameData = convertDataURIToBinary(frame.src);
            files.push({
                name: 'pic'+paddedIndex+'.jpg',
                data: frameData,
            })
        })

        var parsedArgs = parseArguments(command);
        worker.postMessage({
            commandName: 'convert_frames_to_video',
            type: "command",
            arguments: parsedArgs,
            files: files
        });
    }

    // Requires webm and ogg input. 
    
    //  args parameters
    //  videoBuffer,             type: Uint8Array;           // REQUIRED, video input
    //  soundBuffer,             type: Uint8Array;           // REQUIRED, sound input
    //  framerate,               type: Number;               // desired export framerate
    //  filename,                type: String;               // output filename
    //  videoLengthMs,           type: Number;               // full length of video in milliseconds
    //  percentCallback,         type: function              // function should receive a number of percentage complete
    //  completedCallback,       type: function              // function should receive a Uint8Array buffer with completed video
    this.exportVideo = function(args) {

        console.log(args)
            
        if (args.videoBuffer === undefined) {
            console.log("Error: No video data submitted"); 
            return; 
        } else if (args.soundBuffer === undefined) {
            console.log("Error: No sound data submitted"); 
            return; 
        } 
    
        if (args.framerate === undefined) {
            args.framerate = 30; 
        }

        if (args.filename === undefined) {
            args.filename = "wick-output.mp4"; 
        }

        if (args.videoLengthMs === undefined) {
            videoLength = 5000; // milliseconds
        } else {
            videoLength = args.videoLengthMs; 
        }
    
        if (args.percentCallback !== undefined) {
            self.percentCallback = args.percentCallback; 
        }
    
        if (args.completedCallback !== undefined) {
            onFinishedCallback = args.completedCallback;
        }

        var videoExtension = "mp4"; 
        var soundExtension = "ogg";
        
        var videoFilename = "video." + videoExtension; 
        var soundFilename = "input." + soundExtension;

        var command = "-i " + videoFilename + " -i " + soundFilename + " -vf showinfo -strict -2 " + "-r " + args.framerate + " " + args.filename; 

        var videoArgs = parseArguments(command);
        worker.postMessage({
            commandName: 'video_audio_merge',
            type: "command",
            arguments: videoArgs,
            files: [
                {
                    "name": videoFilename,
                    "data": args.videoBuffer
                },
                {
                    "name": soundFilename,
                    "data": args.soundBuffer
                }
            ]
         });
    }

    function handleMessage (message) {
        console.log(message.data)

        if (message.type == "ready") {
            
        } else if (message.type == "stdout") {
            if (message.data.indexOf("Parsed_showinfo") !== -1) {
                var splitMessage = message.data.split("pts:");
                var pts = splitMessage[1].split(" ")[0];
                console.log('percent complete: ' + pts);
            }
        } else if (message.type == "start") {
            
        } else if (message.type == "done") {
            if(message.data instanceof Array) {
                onFinishedCallback(message.data[0].data);
            } else if(message.data instanceof ArrayBuffer) {
                onFinishedCallback(message.data);
            }
        }
    }

    function parseArguments(text) {
        text = text.replace(/\s+/g, ' ');
        var args = [];
        // Allow double quotes to not split args.
        text.split('"').forEach(function(t, i) {
            t = t.trim();
            if ((i % 2) === 1) {
                args.push(t);
            } else {
                args = args.concat(t.split(" "));
            }
        });
        return args;
    }
}
