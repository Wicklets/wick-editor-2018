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

    this.clearKeys = function () {
        that.keys = [];
    }

    document.body.addEventListener("keydown", function (event) {
        /* Set event keyCode in keys dictionary to true. */
        that.keys[event.keyCode] = true;

        /* Determine controlKeyDown and shiftKeyDown. */
        var controlKeyDown = that.keys[91] || that.keys[224]; // ?

        /* Determine if Text is currently being edited. */
        var activeElem = document.activeElement.nodeName;
        var editingTextBox = activeElem == 'TEXTAREA' || activeElem == 'INPUT';

        guiActions.forEach(function(guiAction) {

            var stringkeys = [];
            for (var numkey in that.keys) {
                if (that.keys.hasOwnProperty(numkey) && that.keys[numkey]) {
                    stringkeys.push(codeToKeyChar[numkey]);
                }
            }

            if(JSON.stringify(guiAction.hotkeys) == JSON.stringify(stringkeys)) {
                var args = { 
                    editingTextBox: editingTextBox
                };
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

    // Space
    var spaceAction = new GuiAction(['Space'], [], { editingTextBox: false }, function(args) {
        oldTool = wickEditor.currentTool;
        wickEditor.currentTool = wickEditor.tools.pan;
        wickEditor.syncInterfaces();
    });

    // Esc
    var escAction = new GuiAction(['Esc'], [], {}, function(args) {
        wickEditor.interfaces.builtinplayer.stopRunningProject();
    });

    // Control + Shift + Z
    var ctrlShiftZAction = new GuiAction(['Ctrl','Shift','Z'], [], { editingTextBox: false }, function(args) {
        event.preventDefault();
        wickEditor.actionHandler.redoAction();
    });

    // Control + Z
    var ctrlZAction = new GuiAction(['Ctrl','Z'], [], { editingTextBox: false }, function(args) {
        event.preventDefault();
        wickEditor.actionHandler.undoAction();
    });

    // Control + Enter
    var ctrlEnterAction = new GuiAction(['Ctrl','Enter'], [], { editingTextBox: false }, function(args) {
        that.clearKeys();
        wickEditor.interfaces.builtinplayer.runProject();
    });

    // Control + 0
    var ctrl0Action = new GuiAction(['Ctrl','0'], [], { editingTextBox: false }, function(args) {
        wickEditor.interfaces.fabric.recenterCanvas();
    });

    // Control + S
    var ctrlSAction = new GuiAction(['Ctrl','S'], [], {}, function(args) {
        event.preventDefault();
        that.clearKeys();
        wickEditor.project.saveInLocalStorage();
        WickProjectExporter.exportProject(wickEditor.project);
    });

    // Control + O
    var ctrlOAction = new GuiAction(['Ctrl','O'], [], {}, function(args) {
        event.preventDefault();
        that.clearKeys();
        $('#importButton').click();
    });

    // Control + A
    var ctrlAAction = new GuiAction(['Ctrl','A'], [], { editingTextBox: false }, function(args) {
        event.preventDefault();
        wickEditor.currentTool = wickEditor.tools.cursor;
        wickEditor.syncInterfaces();
        wickEditor.interfaces['fabric'].deselectAll();
        wickEditor.interfaces['fabric'].selectAll();
    });

    // Up
    var upAction = new GuiAction(['Up'], [], {}, function(args) {
        if(wickEditor.project.getCurrentObject().currentLayer > 0)
            wickEditor.project.getCurrentObject().currentLayer --;
        wickEditor.syncInterfaces();
    });

    // Left
    var leftAction = new GuiAction(['Left'], [], {}, function(args) {
        wickEditor.actionHandler.doAction("movePlayhead", {
            obj: wickEditor.project.getCurrentObject(),
            moveAmount: -1
        })
        wickEditor.syncInterfaces();
    });

    // Right
    var rightAction = new GuiAction(['Right'], [], {}, function(args) {
        wickEditor.actionHandler.doAction("movePlayhead", {
            obj: wickEditor.project.getCurrentObject(),
            moveAmount: 1
        })
        wickEditor.syncInterfaces();
    });

    // Down
    var downAction = new GuiAction(['Down'], [], {}, function(args) {
        if(wickEditor.project.getCurrentObject().currentLayer < wickEditor.project.getCurrentObject().layers.length-1)
            wickEditor.project.getCurrentObject().currentLayer ++;
        wickEditor.syncInterfaces();
    });

    // Backspace
    var backSpace = new GuiAction(['Backspace'], [], {}, function(args) {
        event.preventDefault();
        wickEditor.actionHandler.doAction('deleteObjects', { ids:wickEditor.interfaces['fabric'].getSelectedObjectIDs() });
    });
}