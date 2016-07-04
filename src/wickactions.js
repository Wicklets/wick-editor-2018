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

    }

// Register all actions

    this.registerAction('delete', 
        function (args) {
            // Save object(/objects) that were deleted in the WickAction 
            // object so we can restore it later in the undo function.

            var fabCanvas = wickEditor.fabricCanvas.getCanvas();

            if(args.group) {
                this.groupObjs = [];

                var items = args.group._objects;
                args.group._restoreObjectsState();

                for(var i = 0; i < items.length; i++) {
                    this.groupObjs.push(items[i]);
                }
            }

            // Delete the selected object

            var fabCanvas = wickEditor.fabricCanvas.getCanvas();

            if (args.group) {
                args.group.forEachObject(function(o) { 
                    args.originalZIndex = fabCanvas.getObjects().indexOf(o);
                    fabCanvas.remove(o);
                });
                fabCanvas.discardActiveGroup().renderAll(); // stops weird ghost group selection
            } else {
                args.originalZIndex = fabCanvas.getObjects().indexOf(args.obj);
                fabCanvas.remove(args.obj);
            }
        },
        function (args) {
            // Restore the deleted object/s
            // We stored them inside this WickAction object!

            var fabCanvas = wickEditor.fabricCanvas.getCanvas();

            if(args.group) {
                for(var i = 0; i < this.groupObjs.length; i++) {
                    fabCanvas.add(this.groupObjs[i]);
                }
                for(var i = this.groupObjs.length-1; i >= 0; i--) {
                    fabCanvas.moveTo(this.groupObjs[i], args.originalZIndex);
                }
            } else {
                fabCanvas.add(args.obj);
                fabCanvas.moveTo(args.obj, args.originalZIndex);
                fabCanvas.setActiveObject(args.obj);
            }
        });

    this.registerAction('transformFabricCanvasObject', 
        function (args) {
            if(args.transformedState) {
                var fabricObject = wickEditor.fabricCanvas.getCanvas().item(args.id);

                // Set object back to it's state post-transformation
                // This only happens on Redo. Fabric js does the original transformation!
                fabricObject.top    = args.transformedState.top;
                fabricObject.left   = args.transformedState.left;
                fabricObject.scaleX = args.transformedState.scaleX;
                fabricObject.scaleY = args.transformedState.scaleY;
                fabricObject.angle  = args.transformedState.angle;
                if(fabricObject.text) {
                    fabricObject.text = args.transformedState.text;
                }

                args.object.setCoords();
                wickEditor.fabricCanvas.getCanvas().renderAll();
            }
        },
        function (args) {
            var fabricObject = wickEditor.fabricCanvas.getCanvas().item(args.id);

            // Save the original transformed state for redo
            args.transformedState = {
                top:    fabricObject.top,
                left:   fabricObject.left,
                scaleX: fabricObject.scaleX,
                scaleY: fabricObject.scaleY,
                angle:  fabricObject.angle,
                text:   fabricObject.text
            };

            // Revert the object's state to it's original pre-transformation state
            fabricObject.top    = args.originalState.top;
            fabricObject.left   = args.originalState.left;
            fabricObject.scaleX = args.originalState.scaleX;
            fabricObject.scaleY = args.originalState.scaleY;
            fabricObject.angle  = args.originalState.angle;
            if(fabricObject.text) {
                fabricObject.text = args.originalState.text;
            }

            fabricObject.setCoords();
            wickEditor.fabricCanvas.getCanvas().renderAll();
        });

    this.registerAction('gotoFrame', 
        function (args) {
            wickEditor.fabricCanvas.deselectAll();

            // Save current frame
            args.oldFrame = wickEditor.currentObject.currentFrame;

            // Go to the specified frame
            wickEditor.syncEditorWithFabricCanvas();
            wickEditor.currentObject.currentFrame = args.toFrame;
            wickEditor.fabricCanvas.syncWithEditor();

            wickEditor.htmlGUIHandler.syncWithEditor();
            wickEditor.htmlGUIHandler.closeScriptingGUI();
        },
        function (args) {
            wickEditor.fabricCanvas.deselectAll();

            // Go back to the old frame
            wickEditor.syncEditorWithFabricCanvas();
            wickEditor.currentObject.currentFrame = args.oldFrame;
            wickEditor.fabricCanvas.syncWithEditor();

            wickEditor.htmlGUIHandler.syncWithEditor();
            wickEditor.htmlGUIHandler.closeScriptingGUI();
        });

    this.registerAction('addEmptyFrame', 
        function (args) {
            // Add an empty frame
            wickEditor.currentObject.addEmptyFrame(wickEditor.currentObject.frames.length);

            // Move to that new frame
            wickEditor.actionHandler.doAction('gotoFrame', {toFrame:wickEditor.currentObject.frames.length-1}, true);

            wickEditor.htmlGUIHandler.syncWithEditor();
        },
        function (args) {
            // Go to the second-to-last frame and remove the last frame
            wickEditor.actionHandler.doAction('gotoFrame', {toFrame:wickEditor.currentObject.frames.length-2}, true);
            wickEditor.currentObject.frames.pop();

            // Update GUI
            wickEditor.htmlGUIHandler.syncWithEditor();
        });

    this.registerAction('extendFrame', 
        function (args) {
            args.frameNumber = wickEditor.currentObject.currentFrame;
            wickEditor.currentObject.frames[args.frameNumber];
            wickEditor.currentObject.frames[args.frameNumber].__proto__ = WickFrame.prototype;
            wickEditor.currentObject.frames[args.frameNumber].extend(args.nFramesToExtendBy);

            wickEditor.htmlGUIHandler.syncWithEditor();
        },
        function (args) {
            wickEditor.currentObject.frames[args.frameNumber].extend(-args.nFramesToExtendBy); 
            wickEditor.htmlGUIHandler.syncWithEditor();
        });

    this.registerAction('shrinkFrame', 
        function (args) {
            args.frameNumber = wickEditor.currentObject.currentFrame;
            wickEditor.currentObject.frames[args.frameNumber];
            wickEditor.currentObject.frames[args.frameNumber].__proto__ = WickFrame.prototype;
            wickEditor.currentObject.frames[args.frameNumber].shrink(args.nFramesToShrinkBy);

            wickEditor.htmlGUIHandler.syncWithEditor();
        },
        function (args) {
            wickEditor.currentObject.frames[args.frameNumber].__proto__ = WickFrame.prototype;
            wickEditor.currentObject.frames[args.frameNumber].shrink(-args.nFramesToShrinkBy); 

            wickEditor.htmlGUIHandler.syncWithEditor();
        });

    this.registerAction('addWickObjectToFabricCanvas', 
        function (args) {
            wickEditor.fabricCanvas.makeFabricObjectFromWickObject(args.wickObject, function(fabricObject) {
                wickEditor.fabricCanvas.getCanvas().add(fabricObject);

                wickEditor.fabricCanvas.deselectAll();

                wickEditor.syncEditorWithFabricCanvas();
                wickEditor.fabricCanvas.syncWithEditor();
            });
        },
        function (args) {
            wickEditor.fabricCanvas.deselectAll();
            wickEditor.fabricCanvas.removeLastObject();
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

            wickEditor.fabricCanvas.makeFabricObjectFromWickObject(args.symbol, function(fabricObject) {
                wickEditor.fabricCanvas.getCanvas().add(fabricObject);
                args.fabricObjectToRemove = fabricObject;
            });

            wickEditor.htmlGUIHandler.closeScriptingGUI();
        },
        function (args) {
            wickEditor.fabricCanvas.deselectAll();
            wickEditor.fabricCanvas.removeLastObject();

            // add args.selectionWickObjects to fabric canvas
            for(var i = 0; i < args.selectionWickObjects.length; i++) {
                wickEditor.fabricCanvas.makeFabricObjectFromWickObject(args.selectionWickObjects[i], function(fabricObject) {
                    wickEditor.fabricCanvas.getCanvas().add(fabricObject);
                });
            }
        });

    this.registerAction('editObject', 
        function (args) {
            wickEditor.fabricCanvas.deselectAll();

            // Store changes made to current frame in the project
            wickEditor.syncEditorWithFabricCanvas();

            // Set the editor to be editing this object at its first frame
            args.prevEditedObject = wickEditor.currentObject;
            wickEditor.currentObject = args.objectToEdit.wickObject;
            wickEditor.currentObject.currentFrame = 0;

            // Load wickobjects in the frame we moved to into the canvas
            wickEditor.fabricCanvas.syncWithEditor();

            wickEditor.htmlGUIHandler.closeScriptingGUI();
            wickEditor.htmlGUIHandler.syncWithEditor();
        },
        function (args) {
            VerboseLog.error("editobject undo NYI")

            /*wickEditor.fabricCanvas.deselectAll();

            // Store changes made to current frame in the project
            wickEditor.syncEditorWithFabricCanvas();

            // Set the editor to be editing this object at its first frame
            wickEditor.currentObject = args.prevEditedObject;
            wickEditor.currentObject.currentFrame = 0;

            // Load wickobjects in the frame we moved to into the canvas
            wickEditor.fabricCanvas.syncWithEditor();

            wickEditor.htmlGUIHandler.syncWithEditor();

            wickEditor.fabricCanvas.repositionOriginCrosshair(
                wickEditor.project.resolution.x, 
                wickEditor.project.resolution.y,
                wickEditor.currentObject.left,
                wickEditor.currentObject.top
            );*/
        });

    this.registerAction('finishEditingCurrentObject', 
        function (args) {
            wickEditor.fabricCanvas.deselectAll();

            // Store changes made to current frame in the project
            wickEditor.syncEditorWithFabricCanvas();

            // Set the editor to be editing this object at its first frame
            args.prevEditedObject = wickEditor.currentObject;
            wickEditor.currentObject = wickEditor.currentObject.parentObject;

            // Load wickobjects in the frame we moved to into the canvas
            wickEditor.fabricCanvas.syncWithEditor();
            
            wickEditor.htmlGUIHandler.syncWithEditor();
        },
        function (args) {
            VerboseLog.error("finishEditingCurrentObject undo NYI")
        });

    this.registerAction('sendSelectedObjectToBack', 
        function (args) {
            console.log("sendSelectedObjectToBack");
        },
        function (args) {

        });

    this.registerAction('bringSelectedObjectToFront', 
        function (args) {
            console.log("bringSelectedObjectToFront");
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