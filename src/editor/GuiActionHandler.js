/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/* GuiActionHandler.js - Abstraction for actions which may be performed through
    the WickEditor GUI. */

var GuiActionHandler = function (wickEditor) {

    var that = this;

    /* Set up vars needed for input listening. */
    this.keys = [];
    this.specialKeys = [];
    var editingTextBox = false;

    /* Define special keys */
    var modifierKeys = ["Windows","Command","Ctrl"];
    var shiftKeys = ["Shift"];

    /* Initialize list of GuiActions. */
    var guiActions = [];

    var activeElemIsTextBox = function () {
        var activeElem = document.activeElement.nodeName;
        editingTextBox = activeElem == 'TEXTAREA' || activeElem == 'INPUT';
        return editingTextBox;
    }

    /* GuiAction definition. All possible actions performable through interacting 
    with the Wick Editor GUI are expected to be well defined by this structure .*/
    var GuiAction = function (hotkeys, elementIds, requiredParams, action) {

        var that = this;

        /* Function to be called when either a hotkey or element fires. */
        this.doAction = action;

        /* Options for special cases */
        this.requiredParams = requiredParams;

        /* Array of key strings which trigger the action function. */
        this.hotkeys = hotkeys;
        this.specialKeys = [];
        if(this.hotkeys.indexOf("Modifier") !== -1) {
            this.specialKeys.push("Modifier");
            this.hotkeys.splice(this.hotkeys.indexOf("Modifier"), 1);
        }
        if(this.hotkeys.indexOf("Shift") !== -1) {
            this.specialKeys.push("Shift");
            this.hotkeys.splice(this.hotkeys.indexOf("Shift"), 1);
        }

        /* Array of Wick Editor element ID's which trigger the action function. */
        this.elementIds = elementIds;
        this.elementIds.forEach(function (elementID) {
            document.getElementById(elementID).onclick = function (e) {
                wickEditor.interfaces.rightclickmenu.open = false;
                that.doAction();
            }
        });

        /* Check for DOMEvent in requiredParam */
        if(requiredParams.DOMEvent) {
            document.addEventListener(requiredParams.DOMEvent, function(event) {
                if(activeElemIsTextBox()) return;
                wickEditor.interfaces.rightclickmenu.open = false;
                that.doAction({e:event});
            });
        }

        guiActions.push(this);
    }

/*************************
    Key listeners
*************************/

    document.body.addEventListener("keydown", function (event) {
        handleKeyEvent(event, "keydown");
    });
    document.body.addEventListener("keyup", function (event) {
        handleKeyEvent(event, "keyup");
    });

    var handleKeyEvent = function (event, eventType) {

        var keyChar = codeToKeyChar[event.keyCode];
        var keyDownEvent = eventType === 'keydown';
        if (modifierKeys.indexOf(keyChar) !== -1) {
            that.specialKeys["Modifier"] = keyDownEvent;
        } else if (shiftKeys.indexOf(keyChar) !== -1) {
            that.specialKeys["Shift"] = keyDownEvent;
        } else {
            that.keys[event.keyCode] = keyDownEvent;
        }

        // get this outta here
        if(event.keyCode == 32 && eventType === 'keyup') {
            wickEditor.currentTool = wickEditor.lastTool;
            wickEditor.syncInterfaces();
        }

        guiActions.forEach(function(guiAction) {

            if (wickEditor.interfaces.builtinplayer.running && !guiAction.requiredParams.builtinplayerRunning) return;

            var stringkeys = [];
            for (var numkey in that.keys) {
                if (that.keys.hasOwnProperty(numkey) && that.keys[numkey]) {
                    stringkeys.push(codeToKeyChar[numkey]);
                }
            }
            var stringspecialkeys = [];
            for (var numkey in that.specialKeys) {
                if (that.specialKeys.hasOwnProperty(numkey) && that.specialKeys[numkey]) {
                    stringspecialkeys.push(numkey);
                }
            }

            var cmpArrays = function (a,b) {
                return a.sort().join(',') === b.sort().join(',');
            }

            var hotkeysMatch = cmpArrays(guiAction.hotkeys, stringkeys)
            var specialKeysMatch = cmpArrays(guiAction.specialKeys, stringspecialkeys);

            if(!hotkeysMatch || !specialKeysMatch) return;
            if(guiAction.hotkeys.length === 0) return;
            if(activeElemIsTextBox() && !guiAction.requiredParams.usableInTextBoxes) return;

            wickEditor.interfaces.rightclickmenu.open = false;
            guiAction.doAction();
            that.keys = [];
        });
    };

    // In order to ensure that the browser will fire clipboard events, we always need to have something selected
    var focusHiddenArea = function () {
        if($("#scriptingGUI").css('visibility') === 'hidden') {
            $("#hidden-input").val(' ');
            $("#hidden-input").focus().select();
        }
    }

/****************************
    GuiAction Definitions
*****************************/

    // Space
    // Open Pan Tool
    new GuiAction(
        ['Space'], 
        [], 
        {}, 
        function(args) {
            if(wickEditor.currentTool !== wickEditor.tools.pan) {
                wickEditor.lastTool = wickEditor.currentTool;
                wickEditor.currentTool = wickEditor.tools.pan;
                wickEditor.syncInterfaces();
            }
        });

    // Esc
    // Stop Running Project
    new GuiAction(
        ['Esc'], 
        [], 
        {builtinplayerRunning : true}, 
        function(args) {
            if(!wickEditor.interfaces.builtinplayer.running) return;
            wickEditor.interfaces.builtinplayer.stopRunningProject();
        });

    // Control + Y
    // Redo Action
    new GuiAction(
        ['Modifier','Shift','Z'], 
        [], 
        {}, 
        function(args) {
            event.preventDefault();
            wickEditor.actionHandler.redoAction();
        });

    // Control + Z
    // Undo Action
    new GuiAction(
        ['Modifier','Z'], 
        [], 
        {}, 
        function(args) {
            event.preventDefault();
            wickEditor.actionHandler.undoAction();
        });

    // Control + Enter
    // Run Project
    new GuiAction(
        ['Modifier','Enter'], 
        ['runButton'], 
        {}, 
        function(args) {
            event.preventDefault();
            that.keys = [];
            that.specialKeys = [];
            wickEditor.project.rootObject.getAllChildObjectsRecursive().forEach(function (child) {
                child.causedAnException = false;
            })
            wickEditor.interfaces.scriptingide.clearError();
            wickEditor.project.getAsJSON(function (JSONProject) {
                WickProject.saveProjectJSONInLocalStorage(JSONProject);
                wickEditor.interfaces.builtinplayer.runProject(JSONProject);
            })
        });

    // Control + 0
    // Recenter Canvas
    new GuiAction(
        ['Modifier','0'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.recenterCanvas();
        });

    // Control + S
    // Save Project
    new GuiAction(
        ['Modifier','S'], 
        [], 
        {usableInTextBoxes:true}, 
        function(args) {
            event.preventDefault();
            that.keys = [];
            that.specialKeys = [];
            wickEditor.project.saveInLocalStorage();
        });

    // Export Project
    new GuiAction(
        ['Modifier','Shift','S'], 
        ['exportHTMLButton'], 
        {usableInTextBoxes:true}, 
        function(args) {
            event.preventDefault();
            that.keys = [];
            that.specialKeys = [];
            WickProjectExporter.exportProject(wickEditor.project);
        });

    // Control + O
    // Open File
    new GuiAction(
        ['Modifier','O'], 
        ['openProjectButton'], 
        {}, 
        function(args) {
            event.preventDefault();
            that.keys = [];
            $('#importButton').click();
        });

    // Control + A
    // Select All
    new GuiAction(
        ['Modifier','A'], 
        [], 
        {}, 
        function(args) {
            event.preventDefault();
            wickEditor.currentTool = wickEditor.tools.cursor;
            wickEditor.syncInterfaces();
            wickEditor.interfaces['fabric'].deselectAll();
            wickEditor.interfaces['fabric'].selectAll();
        });

    // Up
    // Move current object up one pixel
    new GuiAction(
        ['Up'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(0,-1);
        });

    // Down
    // Move current object down one pixel
    new GuiAction(
        ['Down'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(0,1);
        });

    // Left
    // Move current object left one pixel
    new GuiAction(
        ['Left'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(-1,0);
        });

    // Right
    // Move current object right one pixel
    new GuiAction(
        ['Right'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(1,0);
        });

    // Modifier+Up
    // Move current object up ten pixels
    new GuiAction(
        ['Shift', 'Up'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(0,-10);
        });

    // Modifier+Down
    // Move current object down ten pixels
    new GuiAction(
        ['Shift', 'Down'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(0,10);
        });

    // Modifier+Left
    // Move current object left ten pixels
    new GuiAction(
        ['Shift', 'Left'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(-10,0);
        });

    // Modifier+Right
    // Move current object right ten pixels
    new GuiAction(
        ['Shift', 'Right'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(10,0);
        });

    // <
    // Move Playhead Left
    new GuiAction(
        [','], 
        [], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction("movePlayhead", {
                obj: wickEditor.project.getCurrentObject(),
                moveAmount: -1
            })
            wickEditor.syncInterfaces();
        });

    // >
    // Move Playhead Right
    new GuiAction(
        ['.'], 
        [], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction("movePlayhead", {
                obj: wickEditor.project.getCurrentObject(),
                moveAmount: 1
            })
            wickEditor.syncInterfaces();
        });

    // Down
    // Move Current Object Down Layer
    new GuiAction(
        ['Down'], 
        [],
        {}, 
        function(args) {
            if(wickEditor.project.getCurrentObject().currentLayer < wickEditor.project.getCurrentObject().layers.length-1)
                wickEditor.project.getCurrentObject().currentLayer ++;
            wickEditor.syncInterfaces();
        });

    // Backspace
    // Delete Selected Objects
    new GuiAction(
        ['Backspace'], 
        ['deleteButton'], 
        {}, 
        function(args) {
            event.preventDefault();
            wickEditor.actionHandler.doAction('deleteObjects', { 
                ids:wickEditor.interfaces['fabric'].getSelectedObjectIDs() 
            });
        });

    // Delete
    // Delete Selected Objects
    new GuiAction(
        ['Delete'], 
        ['deleteButton'], 
        {}, 
        function(args) {
            event.preventDefault();
            wickEditor.actionHandler.doAction('deleteObjects', { 
                ids:wickEditor.interfaces['fabric'].getSelectedObjectIDs() 
            });
        });


    new GuiAction([], [], { DOMEvent: 'copy' }, function(args) {
        that.keys = [];

        console.log(args)
        args.e.preventDefault();
        focusHiddenArea();

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
        args.e.clipboardData.setData('text/wickobjectsjson', copyData);
    });

    new GuiAction([], [], { DOMEvent: 'cut' }, function(args) {
        that.keys = [];

        args.e.preventDefault();
        focusHiddenArea();

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
        args.e.clipboardData.setData('text/wickobjectsjson', copyData);

        wickEditor.actionHandler.doAction('deleteObjects', { ids:ids });
    });

    new GuiAction([], [], { DOMEvent: 'paste' }, function(args) {
        that.keys = [];

        args.e.preventDefault();
        focusHiddenArea();

        var clipboardData = args.e.clipboardData;
        var items = clipboardData.items || clipboardData.types;

        for (i=0; i<items.length; i++) {

            var fileType = items[i].type || items[i];
            var file = clipboardData.getData(fileType);

            if(fileType === 'text/wickobjectsjson') {
                var fileWickObject = WickObject.fromJSONArray(JSON.parse(file), function(objs) {
                    // get rid of IDs (IDs from same/other projects might cause collisions)
                    objs.forEach(function (obj) {
                        obj.id=null;
                        obj.getAllChildObjectsRecursive().forEach(function (child) {
                            child.id = null;
                        });
                    })
                    wickEditor.actionHandler.doAction('addObjects', {wickObjects:objs});
                });
            } else if (fileType === 'text/plain') {
                wickEditor.actionHandler.doAction('addObjects', {wickObjects:[WickObject.fromText(file)]});
            } else {
                console.error("Pasting files with type " + fileType + "NYI.")
            }

        }
    });

    new GuiAction([], ['settingsButton'], {}, function(args) {
        wickEditor.interfaces["settings"].open = true;
        wickEditor.syncInterfaces();
    });

    new GuiAction([], ['newProjectButton'], {}, function(args) {
        if(!confirm("Create a new project? All unsaved changes to the current project will be lost!")) {
            return;
        }
        wickEditor.project = new WickProject();
        localStorage.removeItem("wickProject");
        wickEditor.interfaces.fabric.recenterCanvas();
        wickEditor.syncInterfaces();
    });

    new GuiAction(
        [], 
        ['exportProjectAsJSONButton'], 
        {}, 
        function(args) {
            wickEditor.project.getAsJSON(function(JSONProject) {
                var blob = new Blob([JSONProject], {type: "text/plain;charset=utf-8"});
                saveAs(blob, "project.json");
            });
        });

    new GuiAction(
        [], 
        ['saveProjectToLocalStorageButton'], 
        {}, 
        function(args) {
            wickEditor.project.saveInLocalStorage();
        });

    new GuiAction(
        ['C'], 
        ['cursorToolButton'], 
        {}, 
        function(args) {
            wickEditor.changeTool(wickEditor.tools.cursor);
        });

    new GuiAction(
        ['B'], 
        ['paintbrushToolButton'], 
        {}, 
        function(args) {
            wickEditor.changeTool(wickEditor.tools.paintbrush);
        });

    new GuiAction(
        ['F'], 
        ['fillbucketToolButton'], 
        {}, 
        function(args) {
            wickEditor.changeTool(wickEditor.tools.fillbucket);
        });

    new GuiAction(
        ['R'], 
        ['rectangleToolButton'], 
        {}, 
        function(args) {
            wickEditor.changeTool(wickEditor.tools.rectangle);
        });

    new GuiAction(
        ['E'], 
        ['ellipseToolButton'], 
        {}, 
        function(args) {
            wickEditor.changeTool(wickEditor.tools.ellipse);
        });

    new GuiAction(
        ['D'], 
        ['dropperToolButton'], 
        {}, 
        function(args) {
            wickEditor.changeTool(wickEditor.tools.dropper);
        });

    new GuiAction(
        ['T'], 
        ['textToolButton'], 
        {}, 
        function(args) {
            wickEditor.changeTool(wickEditor.tools.text);
        });

    new GuiAction(
        ['Z'], 
        ['zoomToolButton'], 
        {}, 
        function(args) {
            wickEditor.changeTool(wickEditor.tools.zoom);
        });

    new GuiAction(
        ['P'], 
        ['panToolButton'], 
        {}, 
        function(args) {
            wickEditor.changeTool(wickEditor.tools.pan);
        });

    new GuiAction(
        [], 
        ['editScriptsButton', 'editSymbolScriptsButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces['scriptingide'].open = true;
            wickEditor.syncInterfaces();
        });

    new GuiAction(
        ['Modifier', "Shift", "Up"], 
        ['bringToFrontButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction('moveObjectToZIndex', { 
                ids: wickEditor.interfaces["fabric"].getSelectedObjectIDs(),
                newZIndex: wickEditor.project.getCurrentObject().getCurrentFrame().wickObjects.length
            });
            wickEditor.interfaces['fabric'].deselectAll();
        });

    new GuiAction(
        ['Modifier', "Shift", "Down"], 
        ['sendToBackButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction('moveObjectToZIndex', { 
                ids: wickEditor.interfaces["fabric"].getSelectedObjectIDs(),
                newZIndex: 0
            });
            wickEditor.interfaces['fabric'].deselectAll();
        });

    new GuiAction(
        [], 
        ['editObjectButton', 'editSymbolButton'], 
        {}, 
        function(args) {
            var selectedObject = wickEditor.interfaces['fabric'].getSelectedWickObject();
            wickEditor.actionHandler.doAction('editObject', {objectToEdit:selectedObject});
        });

    new GuiAction(
        [], 
        ['convertToSymbolButton', 'createSymbolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.scriptingide.open = true;
            var fabCanvas = wickEditor.interfaces['fabric'].canvas;
            wickEditor.actionHandler.doAction('convertSelectionToSymbol', 
                {selection:fabCanvas.getActiveObject() || fabCanvas.getActiveGroup()}
            );
        });

    new GuiAction(
        [], 
        ['breakApartButton'], 
        {}, 
        function(args) {
            var selectedObjectIDs = wickEditor.interfaces.fabric.getSelectedObjectIDs();
            wickEditor.actionHandler.doAction('breakApartSymbol', {id:selectedObjectIDs[0]} );
        });

    new GuiAction(
        [], 
        ['finishEditingObjectButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction('finishEditingCurrentObject', {});
        });

    new GuiAction(
        [], 
        ['downloadButton'], 
        {}, 
        function(args) {
            var fileData = wickEditor.interfaces['fabric'].getSelectedWickObject().exportAsFile();
            var blob = new Blob([fileData], {type: "text/plain;charset=utf-8"});
            saveAs(blob, "wickobject.json");
        });

}