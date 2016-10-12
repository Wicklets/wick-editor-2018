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

    /* GuiAction definition. All possible actions performable through interacting 
    with the Wick Editor GUI are expected to be well defined by this structure .*/
    var GuiAction = function (hotkeys, elementIds, requiredParams, action) {

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

        /* Function to be called when either a hotkey or element fires. */
        this.action = action;

        /* Function which runs action  */
        this.runAction = function() {
            action();
        }

        guiActions.push(this);
    }

/*************************
    Key listeners
*************************/

    document.body.addEventListener("keydown", function (event) {
        if (wickEditor.interfaces.builtinplayer.running) return;
        
        var activeElem = document.activeElement.nodeName;
        editingTextBox = activeElem == 'TEXTAREA' || activeElem == 'INPUT';
        if(editingTextBox) return;

        var keyChar = codeToKeyChar[event.keyCode];
        if(modifierKeys.indexOf(keyChar) !== -1) {
            that.specialKeys["Modifier"] = true;
        } else if(shiftKeys.indexOf(keyChar) !== -1) {
            that.specialKeys["Shift"] = true;
        } else {
            that.keys[event.keyCode] = true;
        }

        guiActions.forEach(function(guiAction) {
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
            if ( hotkeysMatch && specialKeysMatch ) {
                guiAction.runAction();
                that.keys = [];
            }
        });
    });

    document.body.addEventListener("keyup", function (event) {
        var activeElem = document.activeElement.nodeName;
        var editingTextBox = activeElem == 'TEXTAREA' || activeElem == 'INPUT';
        if(editingTextBox) return;

        if (wickEditor.interfaces.builtinplayer.running) return;

        var keyChar = codeToKeyChar[event.keyCode];
        if(modifierKeys.indexOf(keyChar) !== -1) {
            that.specialKeys["Modifier"] = false;
        } else if(shiftKeys.indexOf(keyChar) !== -1) {
            that.specialKeys["Shift"] = false;
        } else {
            that.keys[event.keyCode] = false;
        }
        
        if(event.keyCode == 32) {
            wickEditor.currentTool = wickEditor.lastTool;
            wickEditor.syncInterfaces();
        }

    });

    /* Reset keys array to the empty array. */
    this.clearKeys = function () {
        that.keys = [];
    };

/****************************
    GuiAction Definitions
*****************************/

    // Space
    // Open Pan Tool
    new GuiAction(['Space'], [], { editingTextBox: false }, function(args) {
        wickEditor.currentTool = wickEditor.tools.pan;
        wickEditor.syncInterfaces();
    });

    // Esc
    // Stop Running Project
    new GuiAction(['Esc'], [], {}, function(args) {
        if(!wickEditor.interfaces.builtinplayer.running) return;
        wickEditor.interfaces.builtinplayer.stopRunningProject();
    });

    // Control + Y
    // Redo Action
    new GuiAction(['Modifier','Shift','Z'], [], { editingTextBox: false }, function(args) {
        event.preventDefault();
        wickEditor.actionHandler.redoAction();
    });

    // Control + Z
    // Undo Action
    new GuiAction(['Modifier','Z'], [], { editingTextBox: false }, function(args) {
        event.preventDefault();
        wickEditor.actionHandler.undoAction();
    });

    // Control + Enter
    // Run Project
    new GuiAction(['Modifier','Enter'], [], { editingTextBox: false }, function(args) {
        event.preventDefault();
        that.clearKeys();
        that.specialKeys = [];
        wickEditor.interfaces.builtinplayer.runProject();
    });

    // Control + 0
    // Recenter Canvas
    new GuiAction(['Modifier','0'], [], { editingTextBox: false }, function(args) {
        wickEditor.interfaces.fabric.recenterCanvas();
    });

    // Control + S
    // Save Project
    new GuiAction(['Modifier','S'], [], {}, function(args) {
        event.preventDefault();
        that.clearKeys();
        wickEditor.project.saveInLocalStorage();
        WickProjectExporter.exportProject(wickEditor.project);
    });

    // Control + O
    // Open File
    new GuiAction(['Modifier','O'], [], {}, function(args) {
        event.preventDefault();
        that.clearKeys();
        $('#importButton').click();
    });

    // Control + A
    // Select All
    new GuiAction(['Modifier','A'], [], { editingTextBox: false }, function(args) {
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

}