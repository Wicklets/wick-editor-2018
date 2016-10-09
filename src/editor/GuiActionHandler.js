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
    var GuiAction = function (hotkeys, elementIds, action) {

        /* Array of key strings which trigger the action function. */
        this.hotkeys = hotkeys;

        /* Array of Wick Editor element ID's which trigger the action function. */
        this.elementIds = elementIds;

        /* Function to be called when either a hotkey or element fires. */
        this.action = action;
        this.runAction = function(args) { action(args); }
    }

    /* Add testin */
    this.registerGuiAction = function(guiAction) {

        guiActions.push(guiAction);
    };

    /* I aint done this yet */
    this.unregisterGuiAction = function(guiAction) {

    };

    document.body.addEventListener("keydown", function (event) {
        /* Set event keyCode in keys dictionary to true. */
        that.keys[event.keyCode] = true;

        /* Determine controlKeyDown and shiftKeyDown. */
        var controlKeyDown = that.keys[91] || that.keys[224];
        var shiftKeyDown = that.keys[16];

        /* Determine if Text is currently being edited. */
        var activeElem = document.activeElement.nodeName;
        editingTextBox = activeElem == 'TEXTAREA' || activeElem == 'INPUT';

        guiActions.forEach(function(guiAction) {

            var stringkeys = [];
            for (var numkey in that.keys) {
                if (that.keys.hasOwnProperty(numkey)) {
                    stringkeys.push(codeToKeyChar[numkey]);
                }
            }

            if(JSON.stringify(guiAction.hotkeys) == JSON.stringify(stringkeys)) {
                var args = {};
                guiAction.runAction(args);
            }
        });
    });

    document.body.addEventListener("keyup", function (event) {
        
    });

    var testAction = new GuiAction(['Space'], [], function(args) {
        console.log(args);
    });
    this.registerGuiAction(testAction);
}