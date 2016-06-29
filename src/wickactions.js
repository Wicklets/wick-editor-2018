/* General Logic for how undo and redo is handled in the Wick editor. All inputs
   to a WickActionStack instance should be valid WickActions or the behavior is undefined */

var WickActionHandler = function (wickEditor) {

// Initialize action handler vars

    this.undoStack = []; 
    this.redoStack = [];

// Define all actions

    this.doActions = {};
    this.undoActions = {};

    this.doActions['delete'] = function (args) {

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
                fabCanvas.remove(o);
            });
            fabCanvas.discardActiveGroup().renderAll(); // stops weird ghost group selection
        } else {
            fabCanvas.remove(args.obj);
        }
    };

    this.undoActions['delete'] = function (args) {

        // Restore the deleted object/s
        // We stored them inside this WickAction object!

        var fabCanvas = wickEditor.fabricCanvas.getCanvas();

        if(args.group) {
            for(var i = 0; i < this.groupObjs.length; i++) {
                fabCanvas.add(this.groupObjs[i]);
            }
        } else {
            fabCanvas.add(args.obj);
            fabCanvas.setActiveObject(args.obj);
        }
    };

    this.doActions['transformFabricCanvasObject'] = function (args) {
        
    }

    this.undoActions['transformFabricCanvasObject'] = function (args) {
        
    }

    this.doActions['gotoFrame'] = function (args) {

        wickEditor.fabricCanvas.deselectAll();

        // Save current frame
        args.oldFrame = wickEditor.currentObject.currentFrame;

        // Go to the specified frame
        wickEditor.syncEditorWithFabricCanvas();
        wickEditor.currentObject.currentFrame = args.toFrame;
        wickEditor.syncFabricCanvasWithEditor();

        wickEditor.htmlGUIHandler.syncWithEditor();
        wickEditor.htmlGUIHandler.closeScriptingGUI();
    }

    this.undoActions['gotoFrame'] = function (args) {

        wickEditor.fabricCanvas.deselectAll();

        // Go back to the old frame
        wickEditor.syncEditorWithFabricCanvas();
        wickEditor.currentObject.currentFrame = args.oldFrame;
        wickEditor.syncFabricCanvasWithEditor();

        wickEditor.htmlGUIHandler.syncWithEditor();
        wickEditor.htmlGUIHandler.closeScriptingGUI();
    }


    this.doActions['addEmptyFrame'] = function (args) {
        // Add an empty frame
        wickEditor.currentObject.addEmptyFrame(wickEditor.currentObject.frames.length);

        // Move to that new frame
        wickEditor.actionHandler.doAction('gotoFrame', {toFrame:wickEditor.currentObject.frames.length-1}, true);

        wickEditor.htmlGUIHandler.syncWithEditor();
    }

    this.undoActions['addEmptyFrame'] = function (args) {
        // Go to the second-to-last frame and remove the last frame
        wickEditor.actionHandler.doAction('gotoFrame', {toFrame:wickEditor.currentObject.frames.length-2}, true);
        wickEditor.currentObject.frames.pop();

        // Update GUI
        wickEditor.htmlGUIHandler.syncWithEditor();
    }

// Multiframe Manipulations 

    this.doActions['extendFrame'] = function (args) {
        // TODO : Get this value from the user. 
        this.frameExtension = parseInt(prompt("Extend the frame by...", "1"));

        // TODO : This seems like a generalizable method we should create... 
        // Ensure we've been given good input. 
        if (this.frameExtension == NaN) {
            this.frameExtension = 0;
            alert("Invalid Number!");
            return;
        } 

        // Ensure we've been given a positive integer. 
        if (this.frameExtension < 0) {
            this.frameExtension = 0; 
        }

        this.frameNumber = wickEditor.currentObject.currentFrame;
        this.frame = wickEditor.currentObject.frames[this.frameNumber];
        this.frame.extend(this.frameExtension);
        
    }

    this.undoActions['extendFrame'] = function (args) {
        this.frame.shrink(this.frameExtension); 
    }

    this.doActions['shrinkFrame'] = function (args) {
        // TODO : Get this value from the user. 
        this.frameShrink = 1;
        this.frameNumber = wickEditor.currentObject.currentFrame;
        this.frame = wickEditor.currentObject.frames[this.frameNumber];
        // Ensure we store the actually shrunk number.
        this.actualFrameShrink = this.frame.shrink(this.frameShrink); 
    }

    this.undoActions['shrinkFrame'] = function (args) {
        this.frame.extend(this.actualFrameShrink);
    }

// Object operations 

    this.doActions['addWickObjectToFabricCanvas'] = function (args) {

        wickEditor.fabricCanvas.makeFabricObjectFromWickObject(args.wickObject, function(fabricObject) {
            wickEditor.fabricCanvas.getCanvas().add(fabricObject);
            args.fabricObjectToRemove = fabricObject;
        });

    }

    this.undoActions['addWickObjectToFabricCanvas'] = function (args) {
        
        wickEditor.fabricCanvas.getCanvas().remove(args.fabricObjectToRemove);

    }

    this.doActions['convertSelectionToSymbol'] = function (args) {

        args.selectionWickObjects = [];

        if (args.selection._objects) {
            // Multiple objects are selected, put them all in the new symbol
            for(var i = 0; i < args.selection._objects.length; i++) {
                args.selectionWickObjects.push(args.selection._objects[i].wickObject);
            }
        } else {
            // Only one object is selected
            args.selectionWickObjects.push(args.selection.wickObject);
        }

        var max = 0;
        while(args.selection._objects.length > 0 && max < 100) {
            max++;
            console.error("Infinite loop is prob happening here");
            args.selection._objects[0].remove();
        }

        args.symbol = WickObject.createSymbolFromWickObjects(
            args.selection.left, 
            args.selection.top, 
            args.selectionWickObjects, 
            wickEditor.currentObject
        );

        wickEditor.fabricCanvas.makeFabricObjectFromWickObject(args.symbol, function(fabricObject) {
            wickEditor.fabricCanvas.getCanvas().add(fabricObject);
            args.fabricObjectToRemove = fabricObject;
        });
    }

    this.undoActions['convertSelectionToSymbol'] = function (args) {
        // add args.selectionWickObjects to fabric canvas
        for(var i = 0; i < args.selectionWickObjects.length; i++) {
            wickEditor.fabricCanvas.makeFabricObjectFromWickObject(args.selectionWickObjects[i], function(fabricObject) {
                wickEditor.fabricCanvas.getCanvas().add(fabricObject);
            });
        }
        
        wickEditor.fabricCanvas.getCanvas().remove(args.fabricObjectToRemove);
    }

    this.doActions['editObject'] = function (args) {

        wickEditor.fabricCanvas.deselectAll();

        // Store changes made to current frame in the project
        wickEditor.syncEditorWithFabricCanvas();

        // Set the editor to be editing this object at its first frame
        wickEditor.currentObject = args.objectToEdit;
        wickEditor.currentObject.currentFrame = 0;

        // Load wickobjects in the frame we moved to into the canvas
        wickEditor.syncFabricCanvasWithEditor();

        wickEditor.htmlGUIHandler.updateTimelineGUI(wickEditor.currentObject);

        wickEditor.fabricCanvas.repositionOriginCrosshair(
            wickEditor.project.resolution.x, 
            wickEditor.project.resolution.y,
            wickEditor.currentObject.left,
            wickEditor.currentObject.top
        );

    }

    this.doActions['finishEditingObject'] = function (args) {
        wickEditor.fabricCanvas.deselectAll();

        // Store changes made to current frame in the project
        wickEditor.syncEditorWithFabricCanvas();

        // Set the editor to be editing the parent object
        wickEditor.currentObject = args.objectToEdit.parentObject;

        // Load wickobjects in the frame we moved to into the canvas
        wickEditor.syncFabricCanvasWithEditor();

        wickEditor.htmlGUIHandler.updateTimelineGUI(wickEditor.currentObject);

        wickEditor.fabricCanvas.repositionOriginCrosshair(
            wickEditor.project.resolution.x, 
            wickEditor.project.resolution.y,
            wickEditor.currentObject.left,
            wickEditor.currentObject.top
        );
    }

    this.doActions['sendSelectedObjectToBack'] = function (args) {

    }

    this.undoActions['sendSelectedObjectToBack'] = function (args) {
        
    }

    this.doActions['bringSelectedObjectToFront'] = function (args) {

    }

    this.undoActions['bringSelectedObjectToFront'] = function (args) {
        
    }

    /* doAction */
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