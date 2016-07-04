/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var WickEditor = function () {

/*****************************
    Settings/Consts
*****************************/
    
    this.version = 'pre-alpha';

/*********************************
    Initialize all editor vars
*********************************/

    console.log("WickEditor rev " + this.version);

    this.tryToLoadAutosavedProject();

    this.currentObject = this.project.rootObject;
    this.currentObject.currentFrame = 0;

    this.mouse = {};
    this.keys = [];

    this.fabricCanvas = new FabricCanvas(this);
    this.htmlGUIHandler = new WickHTMLGUIHandler(this);

    this.actionHandler = new WickActionHandler(this);

/*********************************
    Page events
*********************************/

    var that = this;

    document.addEventListener('mousemove', function(e) { 
        that.mouse.x = e.clientX;
        that.mouse.y = e.clientY;
    }, false );

    document.addEventListener('contextmenu', function (event) { 
        event.preventDefault();
    }, false);

    this.clearKeys = function () {
        that.keys = [];
    }

    document.body.addEventListener("keydown", function (event) {
        that.keys[event.keyCode] = true;

        //VerboseLog.log("keydown");
        //VerboseLog.log(event.keyCode);
        //VerboseLog.log(this.keys);

        var controlKeyDown = that.keys[91];
        var shiftKeyDown = that.keys[16];

        var editingTextBox = document.activeElement.nodeName == 'TEXTAREA'
                          || document.activeElement.nodeName == 'INPUT';

        if(!editingTextBox) {
            // Control-shift-z: redo
            if (event.keyCode == 90 && controlKeyDown && shiftKeyDown) {
                that.actionHandler.redoAction();    
            }
            // Control-z: undo
            else if (event.keyCode == 90 && controlKeyDown) {
                that.actionHandler.undoAction();
            }
        }

        // Control-s: save
        if (event.keyCode == 83 && controlKeyDown) {
            event.preventDefault();
            that.clearKeys();
            that.syncEditorWithFabricCanvas();
            that.project.saveInLocalStorage();
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
            that.fabricCanvas.deselectAll();
            that.fabricCanvas.selectAll();
        }

        // Backspace: delete selected objects
        if (event.keyCode == 8 && !editingTextBox) {
            event.preventDefault();

            var obj   = that.fabricCanvas.getCanvas().getActiveObject();
            var group = that.fabricCanvas.getCanvas().getActiveGroup();

            if(!obj && !group) {
                VerboseLog.log("Nothing to delete.");
                return;
            }

            that.actionHandler.doAction('delete', { obj:obj, group:group });
        }

        // Space: Pan viewport
        if (event.keyCode == 32 && !editingTextBox) {
            that.fabricCanvas.panTo(that.mouse.x - window.innerWidth/2, 
                                    that.mouse.y - window.innerHeight/2);
        }

        // Tilde: log project state to canvas (for debugging)
        if (event.keyCode == 192) {
            console.log(that.project);
            console.log(that.fabricCanvas);
        }
    });

    document.body.addEventListener("keyup", function (event) {
        that.keys[event.keyCode] = false;

        //VerboseLog.log("keyup");
        //VerboseLog.log(event.keyCode);
        //VerboseLog.log(this.keys);
    });

    window.addEventListener('resize', function(e) {
        that.fabricCanvas.resize();
        that.htmlGUIHandler.syncWithEditor();
    }, false);
    that.fabricCanvas.resize();
    this.htmlGUIHandler.syncWithEditor();

    // Sync fabric and html gui
    this.fabricCanvas.syncWithEditor();
    this.htmlGUIHandler.syncWithEditor();

    window.addEventListener("beforeunload", function (event) {
        var confirmationMessage = 'Warning: All unsaved changes will be lost!';
        (event || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    });

    var focusHiddenArea = function () {
        // In order to ensure that the browser will fire clipboard events, we always need to have something selected
        if($("#scriptingGUI").css('visibility') === 'hidden') {
            $("#hidden-input").val(' ');
            $("#hidden-input").focus().select();
        }
    }

    document.addEventListener("copy", function(event) {

        wickEditor.clearKeys();

        // Don't try to copy from the fabric canvas if user is editing text
        if(document.activeElement.nodeName == 'TEXTAREA' || that.htmlGUIHandler.scriptingIDEopen) {
            return;
        }

        event.preventDefault();
        focusHiddenArea();

        that.syncEditorWithFabricCanvas();

        var clipboardObjectJSON;

        var obj = that.fabricCanvas.getCanvas().getActiveObject() 
        var group = that.fabricCanvas.getCanvas().getActiveGroup();

        if(group) {
            var objectJSONs = [];
            //group._restoreObjectsState();
            for(var i = 0; i < group._objects.length; i++) {
                objectJSONs.push(group._objects[i].wickObject.getAsJSON());
            }
            var clipboardObject = {
                position: {top  : group.top  + group.height/2, 
                           left : group.left + group.width/2},
                wickObjectArray: objectJSONs
            }
            clipboardObjectJSON = JSON.stringify(clipboardObject);
        } else {
            var selectedWickObject = obj.wickObject;
            var objJSON = selectedWickObject.getAsJSON();
            var clipboardObject = {
                position: {top:0, left:0},
                wickObjectArray: [objJSON]
            }
            clipboardObjectJSON = JSON.stringify(clipboardObject);
        }

        event.clipboardData.setData('text/wickobjectsjson', clipboardObjectJSON);
    });

    document.addEventListener("cut", function(event) {
        VerboseLog.error('cut NYI');
    });

    document.addEventListener("paste", function(event) {

        wickEditor.clearKeys();

        if(document.activeElement.nodeName === 'TEXTAREA' || that.htmlGUIHandler.scriptingIDEopen) {
            return;
        }

        event.preventDefault();
        focusHiddenArea();
        
        var clipboardData = event.clipboardData;
        var items = clipboardData.items;

        for (i=0; i<items.length; i++) {

            var fileType = items[i].type;
            var file = clipboardData.getData(items[i].type);

            console.log("pasted filetype: " + fileType);

            if (['image/png', 'image/jpeg', 'image/bmp'].indexOf(fileType) != -1) {

                var data = items[i].getAsFile();
                var fr = new FileReader;
                fr.onloadend = function() {
                    //alert(fr.result.substring(0, 100)); // fr.result is all data
                    WickObject.fromImage(
                        fr.result, 
                        that.project.resolution.x/2, 
                        that.project.resolution.y/2, 
                        that.currentObject,
                        function(newWickObject) {
                            that.actionHandler.doAction('addWickObjectToFabricCanvas', {wickObject:newWickObject});
                        });
                };
                fr.readAsDataURL(data);

            } else if (fileType == 'image/gif') {

                var data = items[i].getAsFile();
                var fr = new FileReader;
                fr.onloadend = function() {
                    //alert(fr.result.substring(0, 100)); // fr.result is all data
                    WickObject.fromAnimatedGIF(
                        fr.result,
                        that.currentObject,
                        function(newWickObject) {
                            that.actionHandler.doAction('addWickObjectToFabricCanvas', {wickObject:newWickObject});
                        });
                };
                fr.readAsDataURL(data);

            } else if (fileType == 'text/plain') {

                var newWickObject = WickObject.fromText(file, that.currentObject);
                that.actionHandler.doAction('addWickObjectToFabricCanvas', {wickObject:newWickObject});

            } else if (fileType == 'text/wickobjectsjson') {

                var clipboardObject = JSON.parse(clipboardData.getData('text/wickobjectsjson'));
                var wickObjectJSONArray = clipboardObject.wickObjectArray;
                var position = wickObjectJSONArray.position;
                for (var i = 0; i < wickObjectJSONArray.length; i++) {
                    
                    var newWickObject = WickObject.fromJSON(wickObjectJSONArray[i], that.currentObject);
                    
                    newWickObject.left += window.innerWidth/2  - that.project.resolution.x/2;
                    newWickObject.top  += window.innerHeight/2 - that.project.resolution.y/2;
                    if(wickObjectJSONArray.length > 1) {
                        newWickObject.left += clipboardObject.position.left;
                        newWickObject.top  += clipboardObject.position.top;
                    }

                    that.actionHandler.doAction('addWickObjectToFabricCanvas', {wickObject:newWickObject});
                }

            }
        }
    });

    $("#editorCanvasContainer").on('drop', function(e) {
        // prevent browser from opening the file
        e.stopPropagation();
        e.preventDefault();

        var files = e.originalEvent.dataTransfer.files;

        // Retrieve uploaded files data
        for (var i = 0; i < files.length; i++) {
            var file = files[i];

            // Read file as data URL
            var dataURLReader = new FileReader();
            dataURLReader.onload = (function(theFile) { return function(e) {

                VerboseLog.log("readAsDataURL():");
                VerboseLog.log("Dropped file: " + theFile.name);
                VerboseLog.log("Dropped filetype: " + file.type);

                if (['image/png', 'image/jpeg', 'image/bmp'].indexOf(file.type) != -1) {

                    WickObject.fromImage(
                        e.target.result, 
                        that.project.resolution.x/2, 
                        that.project.resolution.y/2, 
                        that.currentObject,
                        function(newWickObject) {
                            that.actionHandler.doAction('addWickObjectToFabricCanvas', {wickObject:newWickObject});
                        });

                } else if(['image/gif'].indexOf(file.type) != -1) {

                    WickObject.fromAnimatedGIF(
                    e.target.result,
                    that.currentObject,
                    function(newWickObject) {
                        that.actionHandler.doAction('addWickObjectToFabricCanvas', {wickObject:newWickObject});
                    });

                } else if(['audio/mp3', 'audio/wav', 'audio/ogg'].indexOf(file.type) != -1) {

                    var newWickObject = WickObject.fromAudioFile(e.target.result, that.currentObject);
                    that.actionHandler.doAction('addWickObjectToFabricCanvas', {wickObject:newWickObject});

                } else if(['application/json'].indexOf(file.type) != -1) {

                    var reader = new FileReader();
                    reader.onloadend = function(e) {
                        that.openProject(this.result);
                    };
                    reader.readAsText(file);

                }

            }; })(file);
            dataURLReader.readAsDataURL(file);
        }

        return false;
    });

}

/**********************************
     Editor <-> Fabric Canvas
**********************************/

WickEditor.prototype.syncEditorWithFabricCanvas = function () {
    this.currentObject.frames[this.currentObject.currentFrame].wickObjects = this.fabricCanvas.getWickObjectsInCanvas(this.project.resolution);
}

/**********************************
  Project Open/Save/Import/Export
**********************************/

WickEditor.prototype.tryToLoadAutosavedProject = function () {

    if(!localStorage) {
        console.error("LocalStorage not available. Loading blank project");
        this.project = new WickProject();
        return;
    }

    VerboseLog.log("Loading project from local storage...");
    var autosavedProjectJSON = localStorage.getItem('wickProject');

    if(!autosavedProjectJSON) {
        VerboseLog.log("No autosaved project. Loading blank project.");
        this.project = new WickProject();
        return;
    }

    this.project = WickProject.fromJSON(autosavedProjectJSON);

}

WickEditor.prototype.newProject = function () {

    if(!confirm("Create a new project? All unsaved changes to the current project will be lost!")) {
        return;
    }

    this.project = new WickProject();
    this.currentObject = this.project.rootObject;

    this.fabricCanvas.deselectAll();

    this.fabricCanvas.resize();
    this.fabricCanvas.syncWithEditor();
    this.htmlGUIHandler.syncWithEditor();

}

WickEditor.prototype.openProject = function (projectJSON) {

    this.project = WickProject.fromJSON(projectJSON);
    this.currentObject = this.project.rootObject;
    this.currentObject.currentFrame = 0;
    this.fabricCanvas.resize();
    this.fabricCanvas.syncWithEditor();
    this.htmlGUIHandler.syncWithEditor();

}

WickEditor.prototype.exportProjectAsJSON = function () {

    this.syncEditorWithFabricCanvas();
    this.project.exportAsJSONFile();

}

WickEditor.prototype.exportProjectAsWebpage = function () {
    this.syncEditorWithFabricCanvas();
    this.project.saveInLocalStorage();
    this.project.exportAsHTMLFile();
}

/*************************
      Builtin player
*************************/

WickEditor.prototype.runProject = function () {
    if(this.htmlGUIHandler.projectHasErrors) {
        if(!confirm("There are syntax errors in the code of this project! Are you sure you want to run it?")) {
            return;
        }
    }
    // Hide the editor, show the player
    document.getElementById("editor").style.display = "none";
    document.getElementById("builtinPlayer").style.display = "block";

    // JSONify the project, autosave, and have the builtin player run it
    this.syncEditorWithFabricCanvas();
    this.project.saveInLocalStorage();
    var JSONProject = this.project.getAsJSON();
    WickPlayer.runProject(JSONProject);
}

WickEditor.prototype.closeBuiltinPlayer = function() {
    // Show the editor, hide the player
    document.getElementById("builtinPlayer").style.display = "none";
    document.getElementById("editor").style.display = "block";

    // Clean up player
    WickPlayer.stopRunningCurrentProject();
}
