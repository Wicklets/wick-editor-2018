/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var InputHandler = function (wickEditor) {

    this.mouse = {};

    var that = this;

/*************************
     Mouse
*************************/

    document.addEventListener('mousemove', function(e) { 
        that.mouse.x = e.clientX;
        that.mouse.y = e.clientY;
    }, false );

    document.addEventListener('mousedown', function(e) { 
        that.mouse.down = true;
    }, false );

    document.addEventListener('mouseup', function(e) { 
        that.mouse.down = false;
    }, false );

/*************************
     Tooltips
*************************/

    $('.tooltipElem').on("mouseover", function(e) {
        $("#tooltipGUI").css('display', 'block');
        $("#tooltipGUI").css('top', wickEditor.inputHandler.mouse.y+5+'px');
        $("#tooltipGUI").css('left', wickEditor.inputHandler.mouse.x+5+'px');
        document.getElementById('tooltipGUI').innerHTML = e.currentTarget.attributes.alt.value;
    });
    $('.tooltipElem').on("mouseout", function(e) {
        $("#tooltipGUI").css('display', 'none');
    });

/*************************
     File Import
*************************/
    
    var loadAnimatedGIF = function (dataURL, callback) {
        var gifSymbol = WickObject.createNewSymbol();
        gifSymbol.x = window.innerWidth /2;
        gifSymbol.y  = window.innerHeight/2;

        //var gif = document.getElementById("gifImportDummyElem");
        var newGifEl = document.createElement("img");
        newGifEl.id = "gifImportDummyElem";
        document.body.appendChild(newGifEl);
        var gif = document.getElementById('gifImportDummyElem')
        gif.setAttribute('src', dataURL);
        gif.setAttribute('height', '467px');
        gif.setAttribute('width', '375px');

        var superGif = new SuperGif({ gif: gif } );
        superGif.load(function () {

            var framesDataURLs = superGif.getFrameDataURLs();
            for(var i = 0; i < framesDataURLs.length; i++) {

                WickObject.fromImage(
                    framesDataURLs[i],
                    (function(frameIndex) { return function(o) {
                        gifSymbol.layers[0].frames[frameIndex].wickObjects.push(o);
                        
                        if(frameIndex == framesDataURLs.length-1) {
                            gifSymbol.width  = gifSymbol.layers[0].frames[0].wickObjects[0].width;
                            gifSymbol.height = gifSymbol.layers[0].frames[0].wickObjects[0].height;
                            callback(gifSymbol);
                        } else {
                            gifSymbol.layers[0].addFrame(new WickFrame);
                        }
                    }; }) (i)
                );
            }
        });
    }

    var loadFileIntoWickObject = function (e,file,fileType) {
        
        if (fileType === 'text/html') {
            WickProject.fromFile(file, function(project) {
                wickEditor.project = project;
                wickEditor.syncInterfaces();
            });
        } else {

            var fromContstructors = {
                'image/png'        : WickObject.fromImage,
                'image/jpeg'       : WickObject.fromImage,
                'application/jpg'  : WickObject.fromImage,
                'image/bmp'        : WickObject.fromImage,
                'image/gif'        : loadAnimatedGIF,
                'audio/mp3'        : WickObject.fromAudioFile,
                'audio/wav'        : WickObject.fromWavFile,
                'audio/wave'       : WickObject.fromWavFile,
                'audio/x-wav'      : WickObject.fromWavFile,
                'audio/x-pn-wav'   : WickObject.fromWavFile,
                'audio/ogg'        : WickObject.fromAudioFile,
                'audio/flac'       : WickObject.fromAudioFile,
                'audio/x-flac'     : WickObject.fromAudioFile,
                "audio/x-m4a"      : WickObject.fromAudioFile,
                "application/json" : WickObject.fromJSONFile
            }
            
            var fr = new FileReader();
            fr.onloadend = function() {
                if(!fromContstructors[fileType]) { 
                    console.error(fileType + " has no constructor!");
                    return;
                }

                fromContstructors[fileType](fr.result, function (newWickObject) {
                    var m
                    if(e && e.originalEvent && e.originalEvent.clientX) {
                        m = wickEditor.interfaces.fabric.screenToCanvasSpace(e.originalEvent.clientX, e.originalEvent.clientY);
                    } else {
                        m = wickEditor.interfaces.fabric.screenToCanvasSpace(window.innerWidth/2, window.innerHeight/2);
                    }
                    newWickObject.x = m.x;
                    newWickObject.y = m.y;
                    wickEditor.actionHandler.doAction('addObjects', {wickObjects:[newWickObject]});
                })
            };
            if(fileType === "application/json") fr.readAsText(file); else fr.readAsDataURL(file);
        }
    }

/*************************
     Drag-to-upload
*************************/
    
    $("#editor").on('dragover', function(e) {
        return false;
    });
    $("#editor").on('dragleave', function(e) {
        return false;
    });
    $("#editor").on('drop', function(e) {

        // prevent browser from opening the file
        e.stopPropagation();
        e.preventDefault();

        var files = e.originalEvent.dataTransfer.files;

        // Retrieve uploaded files data
        for (var i = 0; i < files.length; i++) {

            var file = files[i];
            var fileType = file.type;

            loadFileIntoWickObject(e,file,fileType);

        }

        return false;
    });

/*************************
     Import Files
*************************/

    document.getElementById('importButton').onchange = function (e) {
        var filePath = document.getElementById("importButton");
        if(filePath.files && filePath.files[0]) {
            var reader = new FileReader();
            var file = filePath.files[0];
            var fileType = file.type;

            loadFileIntoWickObject(null,file,fileType);
        }

        var importButton = $("importButton");
        importButton.replaceWith( importButton = importButton.clone( true ) );
    }

/*************************
    Leave page warning
*************************/

    window.addEventListener("beforeunload", function (event) {
        if(wickEditor.actionHandler.undoStack.length === 0) return;
        var confirmationMessage = 'Warning: All unsaved changes will be lost!';
        (event || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    });

}
