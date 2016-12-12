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
     Paste images
*************************/

    // We start by checking if the browser supports the 
    // Clipboard object. If not, we need to create a 
    // contenteditable element that catches all pasted data 
    if (!window.Clipboard) {
       var pasteCatcher = document.createElement("div");
        
       // Firefox allows images to be pasted into contenteditable elements
       pasteCatcher.setAttribute("contenteditable", "");
        
       // We can hide the element and append it to the body,
       pasteCatcher.style.opacity = 0;
       document.body.appendChild(pasteCatcher);
     
       // as long as we make sure it is always in focus
       pasteCatcher.focus();
       document.addEventListener("click", function() { pasteCatcher.focus(); });
    } 
    // Add the paste event listener
    window.addEventListener("paste", pasteHandler);
     
    /* Handle paste events */
    function pasteHandler(e) {
       // We need to check if event.clipboardData is supported (Chrome)
       if (e.clipboardData) {
          // Get the items from the clipboard
          var items = e.clipboardData.items;
          if (items) {
             // Loop through all items, looking for any kind of image
             for (var i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") !== -1) {
                   // We need to represent the image as a file,
                   var blob = items[i].getAsFile();
                   // and use a URL or webkitURL (whichever is available to the browser)
                   // to create a temporary URL to the object
                   var URLObj = window.URL || window.webkitURL;
                   var source = URLObj.createObjectURL(blob);
                    
                   // The URL can then be used as the source of an image
                   createImage(source);
                }
             }
          }
       // If we can't handle clipboard data directly (Firefox), 
       // we need to read what was pasted from the contenteditable element
       } else {
          // This is a cheap trick to make sure we read the data
          // AFTER it has been inserted.
          setTimeout(checkInput, 1);
       }
    }
     
    /* Parse the input in the paste catcher element */
    function checkInput() {
       // Store the pasted content in a variable
       var child = pasteCatcher.childNodes[0];
     
       // Clear the inner html to make sure we're always
       // getting the latest inserted content
       pasteCatcher.innerHTML = "";
        
       if (child) {
          // If the user pastes an image, the src attribute
          // will represent the image as a base64 encoded string.
          if (child.tagName === "IMG") {
             createImage(child.src);
          }
       }
    }
     
    /* Creates a new image from a given source */
    function createImage(source) {
        /*var pastedImage = new Image();
        pastedImage.onload = function() {
            // You now have the image!
        }
        pastedImage.src = source;*/
        WickObject.fromImage(source, function (newWickObject) {
            var m = wickEditor.interfaces.fabric.screenToCanvasSpace(window.innerWidth/2, window.innerHeight/2);
            newWickObject.x = m.x;
            newWickObject.y = m.y;
            wickEditor.actionHandler.doAction('addObjects', {wickObjects:[newWickObject]});
        })
    }

/*************************
     File Import
*************************/

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
                'image/gif'        : WickObject.fromAnimatedGIF,
                'audio/mp3'        : WickObject.fromAudioFile,
                'audio/wav'        : WickObject.fromAudioFile,
                'audio/wave'       : WickObject.fromAudioFile,
                'audio/x-wav'      : WickObject.fromAudioFile,
                'audio/x-pn-wav'   : WickObject.fromAudioFile,
                'audio/ogg'        : WickObject.fromAudioFile,
                'audio/flac'       : WickObject.fromAudioFile,
                'audio/x-flac'     : WickObject.fromAudioFile,
                "audio/x-m4a"      : WickObject.fromAudioFile,
                "application/json" : WickObject.fromJSONFile
            }
            
            var fr = new FileReader();
            fr.onloadend = function() {
                if(!fromContstructors[fileType]) { 
                    console.error(fileType + " has no WickObject constructor!");
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
