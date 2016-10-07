/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var InputHandler = function (wickEditor) {

    this.mouse = {};
    this.keys = [];

    var editingTextBox = false;

    var oldTool = null;

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

    document.addEventListener('contextmenu', function (event) { 
        event.preventDefault();
    }, false);

/*************************
     Keys
*************************/

    this.clearKeys = function () {
        that.keys = [];
    }

    document.body.addEventListener("keydown", function (event) {

        that.keys[event.keyCode] = true;

        var controlKeyDown = that.keys[91] || that.keys[224];
        var shiftKeyDown = that.keys[16];

        var activeElem = document.activeElement.nodeName;
        editingTextBox = activeElem == 'TEXTAREA' || activeElem == 'INPUT';

        // Escape: Stop running project
        if(event.keyCode == 27 && !editingTextBox) {
            that.clearKeys();
            wickEditor.interfaces.builtinplayer.stopRunningProject();
        }

        if (wickEditor.interfaces.builtinplayer.running) return;

        if(!editingTextBox) {
            // Control-shift-z: redo
            if (event.keyCode == 90 && controlKeyDown && shiftKeyDown) {
                event.preventDefault();
                wickEditor.actionHandler.redoAction();
            }
            // Control-z: undo
            else if (event.keyCode == 90 && controlKeyDown) {
                event.preventDefault();
                wickEditor.actionHandler.undoAction();
            }
        }

        // Control-Enter: Run project in builtin player
        if(controlKeyDown && event.keyCode == 13 && !editingTextBox) {
            that.clearKeys();
            wickEditor.interfaces.builtinplayer.runProject();
        }

        // Control-0: recenter
        if(controlKeyDown && event.keyCode == 48 && !editingTextBox) {
            wickEditor.interfaces.fabric.recenterCanvas();
        }

        // Control-s: save
        if (event.keyCode == 83 && controlKeyDown) {
            event.preventDefault();
            that.clearKeys();
            wickEditor.project.saveInLocalStorage();
            WickProjectExporter.exportProject(wickEditor.project);
        }
        // Control-o: open
        else if (event.keyCode == 79 && controlKeyDown) {
            event.preventDefault();
            that.clearKeys();
            $('#importButton').click();
        }

        // Control-a: Select all
        if (event.keyCode == 65 && controlKeyDown) {
            event.preventDefault();
            // Switch to cursor tool (shouldn't be able to select stuff with other tools)
            wickEditor.currentTool = wickEditor.tools.cursor;
            wickEditor.syncInterfaces();
            wickEditor.interfaces['fabric'].deselectAll();
            wickEditor.interfaces['fabric'].selectAll();
        }

        // Left arrow key: Move playhead left
        if(event.keyCode == 37) {
            wickEditor.actionHandler.doAction("movePlayhead", {
                obj: wickEditor.project.getCurrentObject(),
                moveAmount: -1
            })
            wickEditor.syncInterfaces();
        }

        // Right arrow key: Move playhead right
        if(event.keyCode == 39) {
            wickEditor.actionHandler.doAction("movePlayhead", {
                obj: wickEditor.project.getCurrentObject(),
                moveAmount: 1
            })
            wickEditor.syncInterfaces();
        }

        // Up arrow key: Move to above layer
        if(event.keyCode == 38) {
            if(wickEditor.project.getCurrentObject().currentLayer > 0)
                wickEditor.project.getCurrentObject().currentLayer --;
            wickEditor.syncInterfaces();
        }

        // Down arrow key: Move to layer below
        if(event.keyCode == 40) {
            if(wickEditor.project.getCurrentObject().currentLayer < wickEditor.project.getCurrentObject().layers.length-1)
                wickEditor.project.getCurrentObject().currentLayer ++;
            wickEditor.syncInterfaces();
        }

        // Space: start panning
        if(event.keyCode == 32 && !editingTextBox && !(wickEditor.currentTool instanceof PanTool)) {
            oldTool = wickEditor.currentTool;
            wickEditor.currentTool = wickEditor.tools.pan;
            wickEditor.syncInterfaces();
        }

        // Backspace: delete selected objects
        if (event.keyCode == 8 && !editingTextBox) {
            event.preventDefault();
            wickEditor.actionHandler.doAction('deleteObjects', { ids:wickEditor.interfaces['fabric'].getSelectedObjectIDs() });
        }
    });

    document.body.addEventListener("keyup", function (event) {
        if (wickEditor.interfaces.builtinplayer.running) return;
        
        if(event.keyCode == 32 && !editingTextBox) {
            wickEditor.currentTool = oldTool;
            wickEditor.syncInterfaces();
        }

        that.keys[event.keyCode] = false;
    });

/*************************
    Leave page warning
*************************/

    // Setup leave page warning
    window.addEventListener("beforeunload", function (event) {
        var confirmationMessage = 'Warning: All unsaved changes will be lost!';
        (event || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    });

/*************************
     Copy/Paste
*************************/

    // In order to ensure that the browser will fire clipboard events, we always need to have something selected
    var focusHiddenArea = function () {
        if($("#scriptingGUI").css('visibility') === 'hidden') {
            $("#hidden-input").val(' ');
            $("#hidden-input").focus().select();
        }
    }

    document.addEventListener("copy", function(event) {

        that.clearKeys();

        // Don't try to copy from the fabric canvas if user is editing text
        if(document.activeElement.nodeName == 'TEXTAREA' || wickEditor.interfaces['scriptingide'].scriptingIDEopen) {
            return;
        }

        event.preventDefault();
        
        // Make sure an element is focused so that copy event fires properly
        //focusHiddenArea();

        // Generate clipboard data
        var ids = wickEditor.interfaces['fabric'].getSelectedObjectIDs();
        var objectJSONs = [];
        for(var i = 0; i < ids.length; i++) {
            objectJSONs.push(wickEditor.project.getObjectByID(ids[i]).getAsJSON());
        }
        var clipboardObject = {
            /*position: {top  : group.top  + group.height/2, 
                       left : group.left + group.width/2},*/
            groupPosition: {x : 0, 
                            y : 0},
            wickObjectArray: objectJSONs
        }
        var copyData =  JSON.stringify(clipboardObject);

        // Send the clipboard data to the clipboard!
        event.clipboardData.setData('text/wickobjectsjson', copyData);
    });

    document.addEventListener("cut", function(event) {
        console.error('cut NYI');
    });

    document.addEventListener("paste", function(event) {

        that.clearKeys();

        if(document.activeElement.nodeName === 'TEXTAREA' || wickEditor.interfaces['scriptingide'].scriptingIDEopen) {
            return;
        }

        event.preventDefault();
        //focusHiddenArea();

        var clipboardData = event.clipboardData;
        var items = clipboardData.items || clipboardData.types;

        for (i=0; i<items.length; i++) {

            var fileType = items[i].type || items[i];
            var file = clipboardData.getData(fileType);

            if(fileType === 'text/wickobjectsjson') {
                var fileWickObject = WickObject.fromJSONArray(JSON.parse(file), function(objs) {
                    wickEditor.actionHandler.doAction('addObjects', {wickObjects:objs});
                });
            } else if (fileType === 'text/plain') {
                wickEditor.actionHandler.doAction('addObjects', {wickObjects:[WickObject.fromText(file)]});
            } else {
                console.error("Pasting files with type " + fileType + "NYI.")
            }

        }
    });

/*************************
     Drag-to-upload
*************************/

    $("#editor").on('dragover', function(e) {
        document.getElementById('dropToUploadFileAlert').style.display = 'block';
        return false;
    });
    $("#editor").on('dragleave', function(e) {
        document.getElementById('dropToUploadFileAlert').style.display = 'none';
        return false;
    });
    $("#editor").on('drop', function(e) {
        document.getElementById('dropToUploadFileAlert').style.display = 'none';

        // prevent browser from opening the file
        e.stopPropagation();
        e.preventDefault();

        var files = e.originalEvent.dataTransfer.files;

        // Retrieve uploaded files data
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var fileType = file.type;

            if (fileType === 'application/json' || fileType === 'text/html') {
                WickProject.fromFile(file, function(project) {
                    wickEditor.project = project;
                    wickEditor.syncInterfaces();
                });
            } else {

                var fromContstructors = {
                    'image/png'  : WickObject.fromImage,
                    'image/jpeg' : WickObject.fromImage,
                    'image/bmp'  : WickObject.fromImage,
                    'image/gif'  : WickObject.fromAnimatedGIF,
                    'audio/mp3'  : WickObject.fromAudioFile,
                    'audio/wav'  : WickObject.fromAudioFile,
                    'audio/ogg'  : WickObject.fromAudioFile
                }
                
                var fr = new FileReader;
                fr.onloadend = function() {
                    fromContstructors[fileType](fr.result, function (newWickObject) {
                        wickEditor.actionHandler.doAction('addObjects', {wickObjects:[newWickObject]});
                    })
                };
                fr.readAsDataURL(file);

            }
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

            WickProject.fromFile(file, function(project) {
                wickEditor.project = project;
                wickEditor.syncInterfaces();
            });
        }

        var importButton = $("importButton");
        importButton.replaceWith( importButton = importButton.clone( true ) );
    }

}
