/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/* wickactions.js - General Logic for how undo and redo is handled in the Wick editor. */

var WickActionHandler = function (wickEditor) {

    /* WickAction definition. All user actions are expected to be well defined by
   this structure in order to properly be done and undone. */

    var WickAction = function (doAction, undoAction) {

        /* To be called when an action is committed by the user. */
        this.doAction = doAction;

        /* To be called when this the user undoes this action. This should revert
           the state of the wickEditor or wickObject back to its original state. */
        this.undoAction = undoAction;

        /* This saves anything that the undo will use later
           For example, to undo a delete we need to bring back that deleted object...
           In this case the object that gets deleted gets stored in args! */
        this.args = {};

    }

// Undo/redo action stacks

    this.undoStack = [];
    this.redoStack = [];

// doActions and undoActions, dicts that store functions for doing and undoing all actions

    this.doActions = {};
    this.undoActions = {};

    /* Call this to define a new action! */
    this.registerAction = function(name, doFunction, undoFunction) {
        this.doActions[name] = doFunction;
        this.undoActions[name] = undoFunction;
    }

    /* - note that dontAddToStack is optional and only to be used for when actions
       call other actions! */
    this.doAction = function (actionName, args, dontAddToStack) {
        
        VerboseLog.log("doAction: " + actionName);
        VerboseLog.log(args)
        VerboseLog.log("dontAddToStack: " + dontAddToStack);

        // Create a new WickAction object
        var action = new WickAction(
            this.doActions[actionName],
            this.undoActions[actionName] 
        );
        if(!action.doAction) {
            VerboseLog.error(actionName + " is not a defined do action!");
        }
        if(!action.undoAction) {
            VerboseLog.error(actionName + " is not a defined undo action!");
        }

        // Pass the arguments over to the WickAction and call its doAction function
        action.args = args;
        action.doAction(action.args);

        // Put the action on the undo stack to be undone later
        if(!dontAddToStack) {
            this.undoStack.push(action); 
            this.redoStack = [];
        }

        // Regen parent refs
        wickEditor.project.rootObject.regenerateParentObjectReferences();

        // Sync interfaces
        wickEditor.syncInterfaces();

    }

    this.undoAction = function () {

        // Nothing to undo!
        if (this.undoStack.length == 0) {
            VerboseLog.log("undoAction(): No actions on the undo stack.");
            return; 
        } 

        // Get last action on the undo stack
        var action = this.undoStack.pop(); 

        VerboseLog.log("undoAction(): " + action);
        VerboseLog.log(action.args)

        // Do the action and put it on the redo stack to be redone later
        action.undoAction(action.args);
        this.redoStack.push(action);

        // Sync interfaces
        wickEditor.syncInterfaces();
        
    }

    this.redoAction = function () {

        // Nothing to redo!
        if (this.redoStack.length == 0) {
            VerboseLog.log("redoAction(): No actions on the redo stack.");
            return;
        } 

        // Get last action on the redo stack
        var action = this.redoStack.pop();

        VerboseLog.log("redoAction: " + action);
        VerboseLog.log(action.args)

        // Do the action and put it back onto the undo stack
        action.doAction(action.args);
        this.undoStack.push(action);

        // Sync interfaces
        wickEditor.syncInterfaces();

    }

// Register all actions

    this.registerAction('addObjects', 
        function (args) {
            args.addedObjectIDs = [];
            for(var i = 0; i < args.wickObjects.length; i++) {
                wickEditor.project.addObject(args.wickObjects[i]);
                args.addedObjectIDs.push(args.wickObjects[i].id);
            }
        },
        function (args) {
            for(var i = 0; i < args.wickObjects.length; i++) {
                wickEditor.project.getCurrentObject().removeChildByID(args.addedObjectIDs[i]);
            }
        });

    this.registerAction('deleteObjects', 
        function (args) {
            args.restoredWickObjects = []
            args.oldZIndices = [];

            // Store the old z index vars for each object. 
            // Must do this before removing them all.
            for(var i = 0; i < args.ids.length; i++) {
                var obj = wickEditor.project.getCurrentObject().getChildByID(args.ids[i]);
                var zIndex = wickEditor.project.getCurrentObject().getCurrentFrame().wickObjects.indexOf(obj);
                args.oldZIndices.push(zIndex);
            }

            // Now remove them
            for(var i = 0; i < args.ids.length; i++) {
                var obj = wickEditor.project.getCurrentObject().getChildByID(args.ids[i]);
                args.restoredWickObjects.push(obj);
                wickEditor.project.getCurrentObject().removeChildByID(args.ids[i]);
            }
        },
        function (args) {
            for(var i = 0; i < args.restoredWickObjects.length; i++) {
                wickEditor.project.addObject(args.restoredWickObjects[i], args.oldZIndices[i]);
            }
        });

    var modifyableAttributes = ["x","y","scaleX","scaleY","angle","opacity"];

    this.registerAction('modifyObjects', 
        function (args) {
            args.originalStates = [];

            for(var i = 0; i < args.ids.length; i++) {
                var wickObj = wickEditor.project.getCurrentObject().getChildByID(args.ids[i]);

                args.originalStates[i] = {};
                modifyableAttributes.forEach(function(attrib) {
                    args.originalStates[i][attrib] = wickObj[attrib];
                });

                // This is silly what's a better way ???
                if(wickObj.fontData) {
                    args.originalStates[i].text = wickObj.fontData.text;
                    args.originalStates[i].fontFamily = wickObj.fontData.fontFamily;
                    args.originalStates[i].fontSize = wickObj.fontData.fontSize;
                    args.originalStates[i].fill = wickObj.fontData.fill;
                }

                modifyableAttributes.forEach(function(attrib) {
                    if(args.modifiedStates[i][attrib] !== undefined) {
                        wickObj[attrib] = args.modifiedStates[i][attrib];
                    }
                });

                // This is silly what's a better way ???
                if(wickObj.fontData) {
                    if(args.modifiedStates[i].text) wickObj.fontData.text = args.modifiedStates[i].text;
                    if(args.modifiedStates[i].fontFamily) wickObj.fontData.fontFamily = args.modifiedStates[i].fontFamily;
                    if(args.modifiedStates[i].fontSize) wickObj.fontData.fontSize = args.modifiedStates[i].fontSize;
                    if(args.modifiedStates[i].fill) wickObj.fontData.fill = args.modifiedStates[i].fill;
                }
            }
        },
        function (args) {
            for(var i = 0; i < args.ids.length; i++) {
                var wickObj = wickEditor.project.getCurrentObject().getChildByID(args.ids[i]);

                // Revert the object's state to it's original pre-transformation state
                modifyableAttributes.forEach(function(attrib) {
                    if(args.originalStates[i][attrib] !== undefined) {
                        wickObj[attrib] = args.originalStates[i][attrib];
                    }
                });

                // This is silly what's a better way ???
                if(wickObj.fontData) {
                    wickObj.fontData.text = args.originalStates[i].text;
                    wickObj.fontData.fontFamily = args.originalStates[i].fontFamily;
                    wickObj.fontData.fontSize = args.originalStates[i].fontSize;
                    wickObj.fontData.fill = args.originalStates[i].fill;
                }
            }
        });

    this.registerAction('movePlayhead', 
        function (args) {
            wickEditor.interfaces['fabric'].deselectAll();

            // Save current frame
            args.oldPlayheadPosition = wickEditor.project.getCurrentObject().playheadPosition;

            // Go to the specified frame
            wickEditor.project.getCurrentObject().playheadPosition = args.newPlayheadPosition;
        },
        function (args) {
            wickEditor.interfaces['fabric'].deselectAll();

            // Go back to the old frame
            wickEditor.project.getCurrentObject().playheadPosition = args.oldPlayheadPosition;
        });

    this.registerAction('addNewFrame', 
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();

            // Add an empty frame
            currentObject.getCurrentLayer().addNewFrame();

            // Move to that new frame
            wickEditor.actionHandler.doAction('movePlayhead', {
                newPlayheadPosition:currentObject.getCurrentLayer().frames.length-1
            }, true);
        },
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();

            // Go to the second-to-last frame and remove the last frame
            wickEditor.actionHandler.doAction('movePlayhead', {
                newPlayheadPosition:currentObject.getCurrentLayer().frames.length-2
            }, true);
            currentObject.getCurrentLayer().frames.pop();
        });

    this.registerAction('addNewLayer', 
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();

            // Add an empty frame
            currentObject.addNewLayer();

            // Go to last added layer
            currentObject.currentLayer = currentObject.layers.length-1;

            console.log(currentObject.currentLayer)
        },
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();

            // Remove last layer added
            currentObject.layers.pop();

            // Go to last added layer
            currentObject.currentLayer = currentObject.layers.length-1;
        });

    this.registerAction('extendFrame', 
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();
            currentObject.getCurrentFrame().extend(args.nFramesToExtendBy);
        },
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();
            currentObject.getCurrentFrame().shrink(args.nFramesToExtendBy); 
        });

    this.registerAction('shrinkFrame', 
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();
            currentObject.getCurrentFrame().shrink(args.nFramesToShrinkBy);
        },
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();
            currentObject.getCurrentFrame().extend(args.nFramesToShrinkBy); 
        });

    this.registerAction('convertSelectionToSymbol', 
        function (args) {
            var symbol = new WickObject.createNewSymbol();

            var selectedObjects = wickEditor.getSelectedWickObjects();
            for(var i = 0; i < selectedObjects.length; i++) {
                symbol.frames[0].wickObjects.push(selectedObjects[i]);
                wickEditor.project.getCurrentObject().removeChildByID(selectedObjects[i].id);
            }

            symbol.width  = symbol.frames[0].wickObjects[0].width;
            symbol.height = symbol.frames[0].wickObjects[0].height;

            wickEditor.project.addObject(symbol);
        },
        function (args) {
            
        });

    this.registerAction('editObject', 
        function (args) {
            wickEditor.interfaces['fabric'].deselectAll();

            // Set the editor to be editing this object at its first frame
            args.prevEditedObjectID = wickEditor.project.getCurrentObject().id;
            wickEditor.project.currentObjectID = args.objectToEdit.id;
            wickEditor.project.getCurrentObject().currentFrame = 0;
        },
        function (args) {
            VerboseLog.error("editobject undo NYI")
        });

    this.registerAction('finishEditingCurrentObject', 
        function (args) {
            wickEditor.interfaces['fabric'].deselectAll();
            
            args.prevEditedObjectID = wickEditor.project.getCurrentObject().id;
            wickEditor.project.currentObjectID = wickEditor.project.getCurrentObject().parentObject.id;
        },
        function (args) {
            VerboseLog.error("finishEditingCurrentObject undo NYI");
        });

    this.registerAction('moveObjectToZIndex', 
        function (args) {
            args.oldZIndexes = [];
            for(var i = 0; i < args.ids.length; i++) {
                var obj = wickEditor.project.getCurrentObject().getChildByID(args.ids[i]);
                args.oldZIndexes.push(wickEditor.project.getCurrentObject().getCurrentFrame().wickObjects.indexOf(obj));
            }
            for(var i = 0; i < args.ids.length; i++) {
                var obj = wickEditor.project.getCurrentObject().getChildByID(args.ids[i]);
                wickEditor.project.getCurrentObject().getCurrentFrame().wickObjects.splice(args.oldZIndexes[i], 1);
                wickEditor.project.getCurrentObject().getCurrentFrame().wickObjects.splice(args.newZIndex, 0, obj);
            }
        },
        function (args) {  
            for(var i = 0; i < args.ids.length; i++) {
                var obj = wickEditor.project.getCurrentObject().getChildByID(args.ids[i]);
                wickEditor.project.getCurrentObject().removeChildByID(args.ids[i]);
                wickEditor.project.getCurrentObject().getCurrentFrame().wickObjects.splice(args.oldZIndexes[i], 0, obj);
            }
        });

}