var VideoExporter = function () {
  
  var VERBOSE = false; 
  var worker;
  
  var self = this; 

  self.videoData; 
  self.soundData; 
  self.exportedVideoData;
  
  self.percentCallback = function (percent) {
    console.log(percent); 
  }
  
  self.completedCallback = function (videoBuffer) {
    self.downloadFile(videoBuffer, "output.mp4"); 
    console.log("Completed!"); 
  }
  
  var downloadItem; 
  var videoLength = 5000; // milliseconds 
  var running = false;
  var isWorkerLoaded = false;
  var isSupported = (function() {
   return document.querySelector && window.URL && window.Worker;
  });

  this.init = function () {
    initWorker(); 
  } 
  
  this.setVerbose = function (bool) {
    VERBOSE = bool; 
  }
  
  this.outputWorkerMessage = function (message) {
     if (message === undefined) {
          if (VERBOSE) {
            console.log("Undefined message from worker.");
          }
      } else if (message.indexOf("Parsed_showinfo") !== -1) {
          self.percentCallback(self.getPercentageComplete(message)); 
      } else {
         if (VERBOSE) {
            console.log(message);  
         }
      }
  }
  
  function initWorker() {
    worker = new Worker("worker-asm.js");
    worker.onmessage = function (event) {
      var message = event.data;
      if (message.type == "ready") {
        isWorkerLoaded = true;
        worker.postMessage({
          type: "command",
          arguments: ["-help"]
        });
      } else if (message.type == "stdout") {
        self.outputWorkerMessage(message.data); 
      } else if (message.type == "start") {
        self.outputWorkerMessage("Worker has received command\n"); 
      } else if (message.type == "done") {
        stopRunning();
        self.outputWorkerMessage("Worker has sent done message."); 
        var buffers = message.data;
        console.log(buffers); 
        buffers.forEach(function(file) {
          // Downloads the video... 
          self.completedCallback(file.data); 
        });
      };
    };
  }
  
  function isReady() {
    return !running && isWorkerLoaded && self.videoData && self.soundData;
  }

  function startRunning() {
    running = true;
  }

  function stopRunning() {
    running = false;
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
        self.completedCallback = args.completedCallback; 
      }
  
      var videoExtension = "webm"; 
      var soundExtension = "ogg";
      if (isReady()) {
        startRunning();
        var videoFilename = "video." + videoExtension; 
        var soundFilename = "input." + soundExtension;

        var command = "-i " + videoFilename + " -i " + soundFilename + " -vf showinfo -strict -2 " + "-r " + args.framerate + " " + args.filename; 

        var videoArgs = parseArguments(command);
        worker.postMessage({
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
    } else {
      if (VERBOSE) console.log("Video Exporter not yet ready"); 
    }
  }

  this.downloadFile = function(fileData, fileName) {
    var dl = document.createElement('a');
    dl.id = "invisibleDownloadElement"; 
    dl.style.display = "none"; 
    var blob = new Blob([fileData]);
    var src = window.URL.createObjectURL(blob);
    dl.download = fileName; 
    dl.href = src; 
    dl.dispatchEvent(new MouseEvent('click'));
  }
  
  this.getPercentageComplete = function(input) {
    var splitInput = input.split("pts:");
    var pts = splitInput[1].split(" ")[0];
    var value = pts/videoLength; 
    
    if (!isNaN(value)) {
      return value; 
    } else {
      return -1; 
    }
  }
}
