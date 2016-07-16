/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/* wickactions.js - General Logic for how undo and redo is handled in the Wick editor. */

var WickActionHandler = function (wickEditor) {

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

            for(var i = 0; i < args.ids.length; i++) {
                var obj = wickEditor.project.getCurrentObject().getChildByID(args.ids[i]);
                var zIndex = wickEditor.project.getCurrentObject().getCurrentFrame().wickObjects.indexOf(obj);
                args.oldZIndices.push(zIndex);
                args.restoredWickObjects.push(obj);
                wickEditor.project.getCurrentObject().removeChildByID(args.ids[i]);
            }
        },
        function (args) {
            for(var i = 0; i < args.restoredWickObjects.length; i++) {
                console.log(args.oldZIndices[i]);
                wickEditor.project.addObject(args.restoredWickObjects[i], args.oldZIndices[i]);
            }
        });

    this.registerAction('modifyObjects', 
        function (args) {
            args.originalStates = [];

            for(var i = 0; i < args.ids.length; i++) {
                var wickObj = wickEditor.project.getCurrentObject().getChildByID(args.ids[i]);

                args.originalStates[i] = {};
                args.originalStates[i].x      = wickObj.x;
                args.originalStates[i].y      = wickObj.y;
                args.originalStates[i].scaleX = wickObj.scaleX;
                args.originalStates[i].scaleY = wickObj.scaleY;
                args.originalStates[i].angle  = wickObj.angle;
                if(wickObj.textData) args.originalStates[i].text = wickObj.textData;

                wickObj.x      = args.modifiedStates[i].x;
                wickObj.y      = args.modifiedStates[i].y;
                wickObj.scaleX = args.modifiedStates[i].scaleX;
                wickObj.scaleY = args.modifiedStates[i].scaleY;
                wickObj.angle  = args.modifiedStates[i].angle;
                if(wickObj.textData) wickObj.text = args.modifiedStates[i].text;
            }
        },
        function (args) {
            for(var i = 0; i < args.ids.length; i++) {
                var wickObj = wickEditor.project.getCurrentObject().getChildByID(args.ids[i]);

                // Revert the object's state to it's original pre-transformation state
                wickObj.x      = args.originalStates[i].x;
                wickObj.y      = args.originalStates[i].y;
                wickObj.scaleX = args.originalStates[i].scaleX;
                wickObj.scaleY = args.originalStates[i].scaleY;
                wickObj.angle  = args.originalStates[i].angle;
                if(wickObj.textData) {
                    wickObj.textData.text = args.originalStates[i].text;
                }
            }
        });

    this.registerAction('gotoFrame', 
        function (args) {
            wickEditor.fabricInterface.deselectAll();

            // Save current frame
            args.oldFrame = wickEditor.project.getCurrentObject().currentFrame;

            // Go to the specified frame
            wickEditor.project.getCurrentObject().currentFrame = args.toFrame;

            wickEditor.htmlInterface.closeScriptingGUI();
        },
        function (args) {
            wickEditor.fabricInterface.deselectAll();

            // Go back to the old frame
            wickEditor.project.getCurrentObject().currentFrame = args.oldFrame;

            wickEditor.htmlInterface.closeScriptingGUI();
        });

    this.registerAction('addEmptyFrame', 
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();

            // Add an empty frame
            currentObject.addEmptyFrame(currentObject.frames.length);

            // Move to that new frame
            wickEditor.actionHandler.doAction('gotoFrame', {toFrame:currentObject.frames.length-1}, true);
        },
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();

            // Go to the second-to-last frame and remove the last frame
            wickEditor.actionHandler.doAction('gotoFrame', {toFrame:currentObject.frames.length-2}, true);
            currentObject.frames.pop();
        });

    this.registerAction('extendFrame', 
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();

            args.frameNumber = currentObject.currentFrame;
            currentObject.frames[args.frameNumber];
            currentObject.frames[args.frameNumber].__proto__ = WickFrame.prototype;
            currentObject.frames[args.frameNumber].extend(args.nFramesToExtendBy);
        },
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();

            currentObject.frames[args.frameNumber].extend(-args.nFramesToExtendBy); 
        });

    this.registerAction('shrinkFrame', 
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();

            args.frameNumber = currentObject.currentFrame;
            currentObject.frames[args.frameNumber];
            currentObject.frames[args.frameNumber].__proto__ = WickFrame.prototype;
            currentObject.frames[args.frameNumber].shrink(args.nFramesToShrinkBy);
        },
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();

            currentObject.frames[args.frameNumber].__proto__ = WickFrame.prototype;
            currentObject.frames[args.frameNumber].shrink(-args.nFramesToShrinkBy); 
        });

    this.registerAction('convertSelectionToSymbol', 
        function (args) {
            args.selectionWickObjects = [];

            var symbolLeft = args.selection.left;
            var symbolTop = args.selection.top;

            if (args.selection._objects) {
                symbolLeft = args.selection._objects[0].wickObject.left;
                symbolTop = args.selection._objects[0].wickObject.top;

                // Multiple objects are selected, put them all in the new symbol
                for(var i = 0; i < args.selection._objects.length; i++) {
                    if(args.selection._objects[i].wickObject.left < symbolLeft) {
                        symbolLeft = args.selection._objects[i].wickObject.left;
                    }
                    if(args.selection._objects[i].wickObject.top < symbolTop) {
                        symbolTop = args.selection._objects[i].wickObject.top;
                    }

                    args.selectionWickObjects.push(args.selection._objects[i].wickObject);
                }

                for(var i = 0; i < args.selectionWickObjects.length; i++) {
                    args.selectionWickObjects.left -= symbolLeft;
                    args.selectionWickObjects.top -= symbolTop;
                }

                var max = 0;
                while(args.selection._objects.length > 0 && max < 100) {
                    max++;
                    console.error("Infinite loop is prob happening here");
                    args.selection._objects[0].remove();
                }
            } else {
                // Only one object is selected
                args.selectionWickObjects.push(args.selection.wickObject);
                args.selection.remove();
            }

            args.symbol = WickObject.createSymbolFromWickObjects(
                symbolLeft, 
                symbolTop, 
                args.selectionWickObjects, 
                wickEditor.currentObject
            );

            wickEditor.fabricInterface.makeFabricObjectFromWickObject(args.symbol, function(fabricObject) {
                wickEditor.fabricInterface.canvas.add(fabricObject);
                args.fabricObjectToRemove = fabricObject;
            });

            wickEditor.htmlInterface.closeScriptingGUI();
        },
        function (args) {
            wickEditor.fabricInterface.deselectAll();
            wickEditor.fabricInterface.removeLastObject();

            // add args.selectionWickObjects to fabric canvas
            for(var i = 0; i < args.selectionWickObjects.length; i++) {
                wickEditor.fabricInterface.makeFabricObjectFromWickObject(args.selectionWickObjects[i], function(fabricObject) {
                    wickEditor.fabricInterface.canvas.add(fabricObject);
                });
            }
        });

    this.registerAction('editObject', 
        function (args) {
            wickEditor.fabricInterface.deselectAll();

            // Set the editor to be editing this object at its first frame
            args.prevEditedObjectID = wickEditor.project.getCurrentObject().id;
            wickEditor.project.currentObjectID = args.objectToEdit.id;
            wickEditor.project.getCurrentObject().currentFrame = 0;

            wickEditor.htmlInterface.closeScriptingGUI();
        },
        function (args) {
            VerboseLog.error("editobject undo NYI")

            /*wickEditor.fabricInterface.deselectAll();

            // Store changes made to current frame in the project
            wickEditor.syncEditorWithfabricInterface();

            // Set the editor to be editing this object at its first frame
            wickEditor.currentObject = args.prevEditedObject;
            wickEditor.currentObject.currentFrame = 0;

            // Load wickobjects in the frame we moved to into the canvas
            wickEditor.fabricInterface.syncWithEditor();

            wickEditor.htmlInterface.syncWithEditor();

            wickEditor.fabricInterface.repositionOriginCrosshair(
                wickEditor.project.resolution.x, 
                wickEditor.project.resolution.y,
                wickEditor.currentObject.left,
                wickEditor.currentObject.top
            );*/
        });

    this.registerAction('finishEditingCurrentObject', 
        function (args) {
            wickEditor.fabricInterface.deselectAll();

            // Set the editor to be editing this object at its first frame
            args.prevEditedObjectID = wickEditor.project.getCurrentObject().id;
            wickEditor.project.currentObjectID = 0; console.error("This needs to get the parent, right now it goes straight to root")
        },
        function (args) {
            VerboseLog.error("finishEditingCurrentObject undo NYI")
        });

    this.registerAction('sendObjectToBack', 
        function (args) {
            
        },
        function (args) {  
            
        });

    this.registerAction('bringObjectToFront', 
        function (args) {
            
        },
        function (args) {  
            
        });

}

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