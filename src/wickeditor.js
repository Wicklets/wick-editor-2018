var WickEditor = function () {

/*****************************
    Settings/Consts
*****************************/
    
    this.version = 'pre-alpha';

/*********************************
    Initialize all editor vars
*********************************/

    console.log("WickEditor rev " + this.version);

    // Create new project
    this.project = new WickProject();

    // Try to load autosaved project
    if(localStorage) {
        VerboseLog.log("Loading project from local storage...");
        var autosavedProjectJSON = localStorage.getItem('wickProject');
        if(autosavedProjectJSON) {
            this.project = WickProject.fromJSON(autosavedProjectJSON);
        } else {
            VerboseLog.log("No autosaved project.")
        }
    } else {
        console.error("LocalStorage not available.")
    }

    this.currentObject = this.project.rootObject;
    this.currentObject.currentFrame = 0;

    // Input
    this.mouse = {};
    this.keys = [];

    // Setup fabric
    this.fabricCanvas = new FabricCanvas(this);

    // Setup timeline controller gui
    this.htmlGUIHandler = new WickHTMLGUIHandler(this);

    // Setup action handler
    this.actionHandler = new WickActionHandler(this);

    var that = this;

    document.addEventListener('mousemove', function(e) { 
        that.updateMousePosition(e) 
    }, false );

    document.addEventListener('contextmenu', function (event) { 
        event.preventDefault();
    }, false);

    document.body.addEventListener("keydown", function (event) {
        that.handleKeyboardInput("keydown", event);
    });

    document.body.addEventListener("keyup", function (event) {
        that.handleKeyboardInput("keyup", event);
    });

    window.addEventListener('resize', function(e) {
        that.fabricCanvas.resize();
        that.htmlGUIHandler.syncWithEditor();
    }, false);
    that.fabricCanvas.resize();
    this.htmlGUIHandler.syncWithEditor();

    // Sync fabric and html gui
    this.syncFabricCanvasWithEditor();
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

        if(document.activeElement.nodeName != 'TEXTAREA' ) {
            focusHiddenArea();
            wickEditor.handleCopyEvent(event);
        }
    });

    document.addEventListener("cut", function(event) {

        wickEditor.clearKeys();

        if(document.activeElement.nodeName != 'TEXTAREA' ) {
            focusHiddenArea();
            wickEditor.handleCutEvent(event);
        }
    });

    document.addEventListener("paste", function(event) {

        wickEditor.clearKeys();

        if(document.activeElement.nodeName != 'TEXTAREA' ) {
            focusHiddenArea();
            wickEditor.handlePasteEvent(event);
        }
    });

    $("#editorCanvasContainer").on('drop', function(e) {
        // prevent browser from opening the file
        e.stopPropagation();
        e.preventDefault();

        wickEditor.importFilesDroppedIntoEditor(e.originalEvent.dataTransfer.files);

        return false;
    });

}

/***********************************
    Event handlers
***********************************/

WickEditor.prototype.updateMousePosition = function (event) {
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
}

WickEditor.prototype.clearKeys = function () {
    this.keys = [];
}

WickEditor.prototype.handleKeyboardInput = function (eventType, event) {

    var that = this;

    if(eventType === "keydown") {

        this.keys[event.keyCode] = true;

        //VerboseLog.log("keydown");
        //VerboseLog.log(event.keyCode);
        //VerboseLog.log(this.keys);

        var controlKeyDown = this.keys[91];
        var shiftKeyDown = this.keys[16];

        // Control-shift-z: redo
        if (event.keyCode == 90 && controlKeyDown && shiftKeyDown) {
            this.actionHandler.redoAction();    
        }
        // Control-z: undo
        else if (event.keyCode == 90 && controlKeyDown) {
            this.actionHandler.undoAction();
        }
        // Control-s: save
        else if (event.keyCode == 83 && controlKeyDown) {
            event.preventDefault();
            this.clearKeys();
            this.saveProject();
        }
        // Control-o: open
        else if (event.keyCode == 79 && controlKeyDown) {
            event.preventDefault();
            this.clearKeys();
            $('#importButton').click();
        }

        // Control-a: Select all
        if (event.keyCode == 65 && controlKeyDown) {
            event.preventDefault();
            this.fabricCanvas.selectAll();
        }

        // Backspace: delete selected objects
        if (event.keyCode == 8 && document.activeElement.nodeName != 'TEXTAREA') {
            event.preventDefault();
            this.deleteSelectedObjects();   
        }

        // Delete: delete selected objects
        if (event.keyCode == 46 && document.activeElement.nodeName != 'TEXTAREA') {
            event.preventDefault();
            this.deleteSelectedObjects();
        }

        // Space: Pan viewport
        if (event.keyCode == 32 && document.activeElement.nodeName != 'TEXTAREA') {
            this.fabricCanvas.panTo(this.mouse.x - window.innerWidth/2, 
                                    this.mouse.y - window.innerHeight/2);
        }

        // Tilde: log project state to canvas (for debugging)
        if (event.keyCode == 192) {
            console.log(this.project);
            console.log(this.fabricCanvas);
        }

    } else if(eventType === "keyup") {

        this.keys[event.keyCode] = false;

        //VerboseLog.log("keyup");
        //VerboseLog.log(event.keyCode);
        //VerboseLog.log(this.keys);

    }

}

WickEditor.prototype.copySelectedObjectsToClipboard = function (clipboardData) {

    var obj = this.fabricCanvas.getCanvas().getActiveObject() 
    var group = this.fabricCanvas.getCanvas().getActiveGroup();

    if(group) {
        var objectJSONs = [];
        //group._restoreObjectsState();
        for(var i = 0; i < group._objects.length; i++) {
            objectJSONs.push(group._objects[i].wickObject.getAsJSON());
        }
        clipboardData.setData('text/wickobjectsjson', JSON.stringify(objectJSONs));
    } else {
        var selectedWickObject = obj.wickObject;
        var objJSON = selectedWickObject.getAsJSON();
        clipboardData.setData('text/wickobjectsjson', JSON.stringify([objJSON]));
    }

}

WickEditor.prototype.handleCopyEvent = function (event) {
    if(!this.htmlGUIHandler.scriptingIDEopen) {
        event.preventDefault();
        this.syncEditorWithFabricCanvas();
        this.copySelectedObjectsToClipboard(event.clipboardData);
    }
}

WickEditor.prototype.handleCutEvent = function (event) {
    if(!this.htmlGUIHandler.scriptingIDEopen) {
        event.preventDefault();
        this.syncEditorWithFabricCanvas();
        this.copySelectedObjectsToClipboard();
        this.deleteSelectedObjects(event.clipboardData);
    }
}

WickEditor.prototype.handlePasteEvent = function (event) {
    if(!this.htmlGUIHandler.scriptingIDEopen) { 
        event.preventDefault();

        var clipboardData = event.clipboardData;
        var items = clipboardData.items;

        for (i=0; i<items.length; i++) {

            var fileType = items[i].type;
            var file = clipboardData.getData(items[i].type);

            console.log("pasted filetype: " + fileType);

            if (fileType === 'image/png') {
                var blob = items[i].getAsFile();
                var source = (window.URL || window.webkitURL).createObjectURL(blob);
                this.importImageFile("File names for pasted images not set.", source);
            } else if (fileType == 'text/plain') {
                wickEditor.actionHandler.doAction('addNewText', {text:file}, true);
            } else if (fileType == 'text/wickobjectsjson') {
                for (var i = 0; i < wickObjectJSONArray.length; i++) {
                    var newWickObject = WickObject.fromJSON(wickObjectJSONArray[i], this.currentObject);
                    this.actionHandler.doAction('addWickObjectToFabricCanvas', {wickObject:newWickObject});
                }
            }   
        }
    }
}

/***********************************
      Right click menu methods
***********************************/

WickEditor.prototype.convertSelectedObjectToSymbol = function () {

}

WickEditor.prototype.deleteSelectedObjects = function () {
    this.actionHandler.doAction('delete', {
        obj:   this.fabricCanvas.getCanvas().getActiveObject(),
        group: this.fabricCanvas.getCanvas().getActiveGroup()
    });
}

WickEditor.prototype.editSelectedObject = function () {
    //this.moveInsideObject(this.fabricCanvas.getActiveObject().wickObject);
}

WickEditor.prototype.editScriptsOfSelectedObject = function () {
    this.htmlGUIHandler.openScriptingGUI(this.fabricCanvas.getActiveObject());
}

WickEditor.prototype.finishEditingObject = function () {
    //this.moveOutOfObject();
}

/*****************************
       Import content
*****************************/

WickEditor.prototype.importFilesDroppedIntoEditor = function(files) {

    var that = this;

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
                that.importImageFile(theFile.name, e.target.result)
            } else if(['image/gif'].indexOf(file.type) != -1) {
                that.importAnimatedGifFile(theFile.name, e.target.result);
            } else if(['audio/mp3', 'audio/wav', 'audio/ogg'].indexOf(file.type) != -1) {
                that.importAudioFile(theFile.name, e.target.result);
            } else if(['application/json'].indexOf(file.type) != -1) {
                WickProject.fromFile(file, function(p) {
                    that.project = p;
                });
            }

        }; })(file);
        dataURLReader.readAsDataURL(file);
    }
}

/**********************************
  Project Open/Save/Import/Export
**********************************/

WickEditor.prototype.syncEditorWithFabricCanvas = function () {
    this.currentObject.frames[this.currentObject.currentFrame].wickObjects = this.fabricCanvas.getWickObjectsInCanvas(this.project.resolution);
}

WickEditor.prototype.syncFabricCanvasWithEditor = function () {
    this.fabricCanvas.setBackgroundColor(this.project.backgroundColor);
    this.fabricCanvas.storeObjectsIntoCanvas( this.currentObject.getCurrentFrame().wickObjects, this.project.resolution );
}

WickEditor.prototype.newProject = function () {

    if(confirm("Create a new project? All unsaved changes to the current project will be lost!")) {
        this.project = new WickProject();
        this.currentObject = this.project.rootObject;

        this.syncFabricCanvasWithEditor();
    }

}

WickEditor.prototype.saveProject = function () {

    this.syncEditorWithFabricCanvas();
    this.project.exportAsJSONFile();

}

WickEditor.prototype.openProject = function () {
    var that = this;

    var filePath = document.getElementById("importButton");
    if(filePath.files && filePath.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            that.project = WickProject.fromJSON(e.target.result);
            that.currentObject = that.project.rootObject;
            that.currentObject.currentFrame = 0;
            that.syncFabricCanvasWithEditor();
            that.htmlGUIHandler.syncWithEditor();
        };
        reader.readAsText(filePath.files[0]);
    }
}

WickEditor.prototype.exportProject = function () {
    this.syncEditorWithFabricCanvas();
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
