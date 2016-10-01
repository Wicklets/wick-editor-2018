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

        /* 'args' is used to pass any data that the action needs.
           'args' also saves anything that the undo will use later,
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

    this.doAction = function (actionName, args) {

        // Create a new WickAction object
        var action = new WickAction(
            this.doActions[actionName],
            this.undoActions[actionName] 
        );
        action.fname = actionName;
        if(!action.doAction) {
            console.error(actionName + " is not a defined do action!");
        }
        if(!action.undoAction) {
            console.error(actionName + " is not a defined undo action!");
        }

        // Pass the arguments over to the WickAction and call its doAction function
        action.args = args;
        action.doAction(action.args);

        // Put the action on the undo stack to be undone later
        this.undoStack.push(action); 
        this.redoStack = [];

        // Regen parent refs
        wickEditor.project.rootObject.regenerateParentObjectReferences();

        // Sync interfaces
        wickEditor.syncInterfaces();

    }

    this.undoAction = function () {

        // Nothing to undo!
        if (this.undoStack.length == 0) {
            console.log("undoAction(): No actions on the undo stack.");
            return;
        } 

        // Get last action on the undo stack
        var action = this.undoStack.pop(); 

        // Do the action and put it on the redo stack to be redone later
        action.undoAction(action.args);
        this.redoStack.push(action);

        // Also undo actions part of a chain
        var nextUndoAction = this.undoStack[this.undoStack.length - 1];
        if(nextUndoAction && nextUndoAction.args && nextUndoAction.args.partOfChain) {
            this.undoAction();
        }

        // Sync interfaces
        wickEditor.syncInterfaces();
        
    }

    this.redoAction = function () {

        // Nothing to redo!
        if (this.redoStack.length == 0) {
            console.log("redoAction(): No actions on the redo stack.");
            return;
        } 

        // Get last action on the redo stack
        var action = this.redoStack.pop();

        // Do the action and put it back onto the undo stack
        action.doAction(action.args);
        this.undoStack.push(action);

        // Also redo actions part of a chain
        if(action.args && action.args.partOfChain) {
            this.redoAction();
        }

        // Sync interfaces
        wickEditor.syncInterfaces();

    }

// Util functions

    // Makes any actions with partOfChain=true added after calling chainLastCommand part of the same chain.
    this.chainLastCommand = function () {
        this.undoStack[this.undoStack.length-1].args.partOfChain = true;
    }

// Register all actions

    this.registerAction('addObjects', 
        function (args) {
            // Make a new frame if one doesn't exist at the playhead position
            if(!wickEditor.project.getCurrentObject().getCurrentFrame()) {
                wickEditor.actionHandler.doAction('addNewFrame', {
                    partOfChain:true
                });
            }

            // Add those boys and save their IDs so we can remove them on undo
            args.addedObjectIDs = [];
            for(var i = 0; i < args.wickObjects.length; i++) {
                wickEditor.project.addObject(args.wickObjects[i]);
                args.addedObjectIDs.push(args.wickObjects[i].id);
            }
        },
        function (args) {
            // Remove objects we added
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

    this.registerAction('addNewFrame', 
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();

            // Add an empty frame
            currentObject.getCurrentLayer().addNewFrame();

            // Move to that new frame
            wickEditor.actionHandler.doAction('movePlayhead', {
                obj:currentObject,
                newPlayheadPosition:currentObject.getCurrentLayer().getTotalLength()-1,
                partOfChain:true
            });
        },
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();
            currentObject.getCurrentLayer().frames.pop();
        });

    this.registerAction('deleteCurrentFrame', 
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();

            // Add an empty frame
            currentObject.getCurrentLayer().deleteFrame(currentObject.getCurrentFrame());
        },
        function (args) {
            console.error("deleteCurrentFrame undo NYI");
        });

    this.registerAction('addNewLayer', 
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();

            // Add an empty frame
            currentObject.addNewLayer();

            // Go to last added layer
            currentObject.currentLayer = currentObject.layers.length-1;
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
            args.frame.extend(args.nFramesToExtendBy);
        },
        function (args) {
            args.frame.shrink(args.nFramesToExtendBy); 
        });

    this.registerAction('shrinkFrame', 
        function (args) {
            args.frame.shrink(args.nFramesToShrinkBy);
        },
        function (args) {
            args.frame.extend(args.nFramesToShrinkBy); 
        });

    this.registerAction('movePlayhead',
        function (args) {
            wickEditor.interfaces['fabric'].deselectAll();

            args.oldPlayheadPosition = args.obj.playheadPosition;

            if(args.moveAmount) {

                args.obj.playheadPosition += args.moveAmount;
                if(args.obj.playheadPosition < 0) args.obj.playheadPosition = 0;

            } else if (args.newPlayheadPosition) {

                args.oldPlayheadPosition = args.obj.playheadPosition;
                args.obj.playheadPosition = args.newPlayheadPosition;

            }
            
        },
        function (args) {
            wickEditor.interfaces['fabric'].deselectAll();

            args.obj.playheadPosition = args.oldPlayheadPosition;
        });

    this.registerAction('convertSelectionToSymbol', 
        function (args) {
            var selectedObjects = wickEditor.interfaces['fabric'].getSelectedWickObjects();

            selectedObjects.forEach(function (obj) {
                wickEditor.project.getCurrentObject().removeChildByID(obj.id);
            });

            var symbol = new WickObject.createSymbolFromWickObjects(selectedObjects);
            wickEditor.project.addObject(symbol);
        },
        function (args) {
            console.error("convertSelectionToSymbol undo NYI")
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
            console.error("editobject undo NYI")
        });

    this.registerAction('finishEditingCurrentObject', 
        function (args) {
            wickEditor.interfaces['fabric'].deselectAll();
            
            wickEditor.project.getCurrentObject().playheadPosition = 0;
            args.prevEditedObjectID = wickEditor.project.getCurrentObject().id;
            wickEditor.project.currentObjectID = wickEditor.project.getCurrentObject().parentObject.id;
        },
        function (args) {
            console.error("finishEditingCurrentObject undo NYI");
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