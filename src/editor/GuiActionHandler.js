/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/* GuiActionHandler.js - Abstraction for actions which may be performed through
    the WickEditor GUI. */

var GuiActionHandler = function (wickEditor) {

    var that = this;

    /* Set up vars needed for input listening. */
    this.keys = [];
    var editingTextBox = false;

    /* Initialize list of GuiActions. */
    var guiActions = [];

    /* GuiAction definition. All possible actions performable through interacting 
    with the Wick Editor GUI are expected to be well defined by this structure .*/
    var GuiAction = function (hotkeys, elementIds, requiredParams, action) {

        /* Array of key strings which trigger the action function. */
        this.hotkeys = hotkeys;

        /* Array of Wick Editor element ID's which trigger the action function. */
        this.elementIds = elementIds;

        /* Dictionary of required params and their values. */
        this.requiredParams = requiredParams;

        /* Function to be called when either a hotkey or element fires. */
        this.action = action;

        /* Function which runs action if args' parameters match requiredParams. */
        this.runAction = function(args) {

            for (var param in requiredParams) {
                if (requiredParams.hasOwnProperty(param) && requiredParams[param] != args[param])
                    return;
            }
            action(args);
        }

        that.registerGuiAction(this);
    }

    /* Add testin */
    this.registerGuiAction = function(guiAction) {

        guiActions.push(guiAction);
    };

    /* I aint done this yet */
    this.unregisterGuiAction = function(guiAction) {

    };

    /* Reset keys array to the empty array. */
    this.clearKeys = function () {
        that.keys = [];
    };

    this.determineStandardActionArgs = function() {
        /* Determine if Text is currently being edited. */
        var activeElem = document.activeElement.nodeName;
        var editingTextBox = activeElem == 'TEXTAREA' || activeElem == 'INPUT';

        var args = { 
            editingTextBox: editingTextBox
        };

        return args;
    };

    this.fireClickedElement = function(elementId) {

        guiActions.forEach(function(guiAction) {
            guiAction.elementIds.forEach(function(guiActionElementId){
                if(elementId == guiActionElementId) {

                    var args = that.determineStandardActionArgs();
                    guiAction.runAction(args);

                    return;
                }
            });

        });
    };

    /*************************
        Key listeners
    *************************/
    document.body.addEventListener("keydown", function (event) {
        that.keys[event.keyCode] = true;

        guiActions.forEach(function(guiAction) {

            var stringkeys = [];
            for (var numkey in that.keys) {
                if (that.keys.hasOwnProperty(numkey) && that.keys[numkey]) {
                    stringkeys.push(codeToKeyChar[numkey]);
                }
            }

            if(JSON.stringify(guiAction.hotkeys) == JSON.stringify(stringkeys)) {

                var args = that.determineStandardActionArgs();
                guiAction.runAction(args);
            }
        });
    });

    document.body.addEventListener("keyup", function (event) {
        if (wickEditor.interfaces.builtinplayer.running) return;
        
        /* Determine if Text is currently being edited. */
        var activeElem = document.activeElement.nodeName;
        var editingTextBox = activeElem == 'TEXTAREA' || activeElem == 'INPUT';

        if(event.keyCode == 32 && !editingTextBox) {
            wickEditor.currentTool = oldTool;
            wickEditor.syncInterfaces();
        }

        that.keys[event.keyCode] = false;
    });

    /****************************
        GuiAction Definitions
    *****************************/

    // Space
    // Open Pan Tool
    new GuiAction(['Space'], [], { editingTextBox: false }, function(args) {
        oldTool = wickEditor.currentTool;
        wickEditor.currentTool = wickEditor.tools.pan;
        wickEditor.syncInterfaces();
    });

    // Esc
    // Stop Running Project
    new GuiAction(['Esc'], [], {}, function(args) {
        wickEditor.interfaces.builtinplayer.stopRunningProject();
    });

    // Control + Y
    // Redo Action
    new GuiAction(['Ctrl','Y'], [], { editingTextBox: false }, function(args) {
        event.preventDefault();
        wickEditor.actionHandler.redoAction();
    });

    // Control + Z
    // Undo Action
    new GuiAction(['Ctrl','Z'], [], { editingTextBox: false }, function(args) {
        event.preventDefault();
        wickEditor.actionHandler.undoAction();
    });

    // Control + Enter
    // Run Project
    new GuiAction(['Ctrl','Enter'], [], { editingTextBox: false }, function(args) {
        that.clearKeys();
        wickEditor.interfaces.builtinplayer.runProject();
    });

    // Control + 0
    // Recenter Canvas
    new GuiAction(['Ctrl','0'], [], { editingTextBox: false }, function(args) {
        wickEditor.interfaces.fabric.recenterCanvas();
    });

    // Control + S
    // Save Project
    new GuiAction(['Ctrl','S'], [], {}, function(args) {
        event.preventDefault();
        that.clearKeys();
        wickEditor.project.saveInLocalStorage();
        WickProjectExporter.exportProject(wickEditor.project);
    });

    // Control + O
    // Open File
    new GuiAction(['Ctrl','O'], [], {}, function(args) {
        event.preventDefault();
        that.clearKeys();
        $('#importButton').click();
    });

    // Control + A
    // Select All
    new GuiAction(['Ctrl','A'], [], { editingTextBox: false }, function(args) {
        event.preventDefault();
        wickEditor.currentTool = wickEditor.tools.cursor;
        wickEditor.syncInterfaces();
        wickEditor.interfaces['fabric'].deselectAll();
        wickEditor.interfaces['fabric'].selectAll();
    });

    // Up
    // Move Current Object Up Layer
    new GuiAction(['Up'], [], {}, function(args) {
        if(wickEditor.project.getCurrentObject().currentLayer > 0)
            wickEditor.project.getCurrentObject().currentLayer --;
        wickEditor.syncInterfaces();
    });

    // Left
    // Move Playhead Left
    new GuiAction(['Left'], [], {}, function(args) {
        wickEditor.actionHandler.doAction("movePlayhead", {
            obj: wickEditor.project.getCurrentObject(),
            moveAmount: -1
        })
        wickEditor.syncInterfaces();
    });

    // Right
    // Move Playhead Right
    new GuiAction(['Right'], [], {}, function(args) {
        wickEditor.actionHandler.doAction("movePlayhead", {
            obj: wickEditor.project.getCurrentObject(),
            moveAmount: 1
        })
        wickEditor.syncInterfaces();
    });

    // Down
    // Move Current Object Down Layer
    new GuiAction(['Down'], [], {}, function(args) {
        if(wickEditor.project.getCurrentObject().currentLayer < wickEditor.project.getCurrentObject().layers.length-1)
            wickEditor.project.getCurrentObject().currentLayer ++;
        wickEditor.syncInterfaces();
    });

    // Backspace
    // Delete Selected Objects
    new GuiAction(['Backspace'], [], {}, function(args) {
        event.preventDefault();
        wickEditor.actionHandler.doAction('deleteObjects', { ids:wickEditor.interfaces['fabric'].getSelectedObjectIDs() });
    });

    // closeBuildInPlayerButton
    // Stop Running Project
    new GuiAction([], ['closeBuiltinPlayerButton'], {}, function(args) {
        wickEditor.builtinPlayerInterface.stopRunningProject();
    });

/*************************
    Browser Copy/Paste
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
}