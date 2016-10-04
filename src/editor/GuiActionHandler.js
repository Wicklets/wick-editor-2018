/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/* GuiActionHandler.js - Abstraction for actions which may be performed through
    the WickEditor GUI. */

var GuiActionHandler = function (wickEditor) {

    var that = this;

    /* GuiAction definition. All possible actions performable through interacting 
    with the Wick Editor GUI are expected to be well defined by this structure .*/
    var GuiAction = function (hotkeys, elementIds, action) {

        /* Array of key strings which trigger the action function. */
        this.hotkeys = hotkeys;

        /* Array of Wick Editor element ID's which trigger the action function. */
        this.elementIds = elementIds;

        /* Function to be called when either a hotkey or element fires. */
        this.action = action;

    }

    /* Dictionary mapping Hotkeys (arrays of key strings) to actions (functions) */
    var actionsByHotkeys = {};
    /* Dictionary mapping ElementIds (arrays of id strings) to actions (functions) */
    var actionsByElementIds = {};

    /* Call this to register a new GuiAction! */
    this.registerGuiAction = function(guiAction) {

        guiAction.hotkeys.forEach(function(hotkey) {
            if(undefined === actionsByHotkeys[hotkey]) {
                actionsByHotkeys[hotkey] = guiAction.action;
            } else {
                console.log('Error registering guiAction- hotkey already registered');
            }
        });

        guiAction.elementIds.forEach(function(elementId) {
            if(undefined === actionsByElementIds[elementId]) {
                actionsByElementIds[elementId] = guiAction.action;
            } else {
                console.log('Error registering guiAction- elementId already registered');
            }
        });
    }

    this.doActionByHotkey = function (hotkey, args) {
        actionsByHotkeys[hotkey](args);
    }

    this.doActionByElementId = function(elementId, args) {
        actionsByElementIds[elementId](args);
    }

    var testAction = new GuiAction(['space'], [], function(){
        console.log("boo ya");
    });
    this.registerGuiAction(testAction);
    this.doActionByHotkey('space', []);
}