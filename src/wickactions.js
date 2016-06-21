/* General Logic for how undo and redo is handled in the Wick editor. All inputs
   to a WickActionStack instance should be valid WickActions or the behavior is undefined */

var WickActionHandler = function (wickEditor) {

// Initialize action handler vars

	this.undoStack = []; 
	this.redoStack = [];

// Define all actions

	this.doActions = {};
	this.undoActions = {};

	this.doActions['delete'] = function () {

		// Save object(/objects) that were deleted in the WickAction 
		// object so we can restore it later in the undo function.

		var fabCanvas = wickEditor.fabricCanvas.getCanvas();

		if(this.args.group) {
			this.groupObjs = [];

			var items = this.args.group._objects;
			this.args.group._restoreObjectsState();

			for(var i = 0; i < items.length; i++) {
				this.groupObjs.push(items[i]);
			}
		}

		// Delete the selected object

		var fabCanvas = wickEditor.fabricCanvas.getCanvas();

		if (this.args.group) {
			this.args.group.forEachObject(function(o) { 
				fabCanvas.remove(o);
			});
			fabCanvas.discardActiveGroup().renderAll(); // stops weird ghost group selection
		} else {
			fabCanvas.remove(this.args.obj);
		}
	};

	this.undoActions['delete'] = function () {

		// Restore the deleted object/s
		// We stored them inside this WickAction object!

		var fabCanvas = wickEditor.fabricCanvas.getCanvas();

		if(this.args.group) {
			for(var i = 0; i < this.groupObjs.length; i++) {
				fabCanvas.add(this.groupObjs[i]);
			}
		} else {
			fabCanvas.add(this.args.obj);
			fabCanvas.setActiveObject(this.args.obj);
		}
	};

	this.doActions['addWickObjectToFabricCanvas'] = function () {

	}

	this.undoActions['addWickObjectToFabricCanvas'] = function () {
		
	}

	this.doActions['gotoFrame'] = function () {

		wickEditor.fabricCanvas.deselectAll();

		this.oldFrame = wickEditor.currentObject.currentFrame;

		// Store changes made to current frame in the project
		wickEditor.syncProjectWithFabricCanvas();

		// move playhead
		wickEditor.currentObject.currentFrame = this.args.toFrame;

		// Load wickobjects in the frame we moved to into the canvas
		wickEditor.syncFabricCanvasWithProject();

		wickEditor.htmlGUIHandler.updateTimelineGUI(wickEditor.currentObject);
	}

	this.undoActions['gotoFrame'] = function () {

		wickEditor.fabricCanvas.deselectAll();

		// Store changes made to current frame in the project
		wickEditor.syncProjectWithFabricCanvas();

		// move playhead
		var toFrame = this.oldFrame;
		wickEditor.currentObject.currentFrame = toFrame;

		// Load wickobjects in the frame we moved to into the canvas
		wickEditor.syncFabricCanvasWithProject();

		wickEditor.htmlGUIHandler.updateTimelineGUI(wickEditor.currentObject);
	}

	this.doActions['addEmptyFrame'] = function () {
		// Add an empty frame
		wickEditor.currentObject.addEmptyFrame(wickEditor.currentObject.frames.length);

		// Move to that new frame
		wickEditor.actionHandler.doAction('gotoFrame', {toFrame:wickEditor.currentObject.frames.length-1}, true);

		// Update GUI
		wickEditor.resizeCanvasAndGUI();
		wickEditor.htmlGUIHandler.updateTimelineGUI(wickEditor.currentObject);
	}

	this.undoActions['addEmptyFrame'] = function () {
		// Go to the second-to-last frame and remove the last frame
		wickEditor.actionHandler.doAction('gotoFrame', {toFrame:wickEditor.currentObject.frames.length-2}, true);
		wickEditor.currentObject.frames.pop();

		// Update GUI
		wickEditor.resizeCanvasAndGUI();
		wickEditor.htmlGUIHandler.updateTimelineGUI(wickEditor.currentObject);
	}

	this.doActions['addWickObjectToFabricCanvas'] = function () {
		
	}

	this.undoActions['addWickObjectToFabricCanvas'] = function () {
		
	}

	this.doActions['convertObjectsToSymbol'] = function () {
		
	}

	this.undoActions['convertObjectsToSymbol'] = function () {
		
	}

}

/* doAction */
/* - note that dontAddToStack is optional and only to be used for when actions
   call other actions! */
WickActionHandler.prototype.doAction = function (actionName, args, dontAddToStack) {
	
	VerboseLog.log("doAction: " + actionName);
	VerboseLog.log(args)
	VerboseLog.log("dontAddToStack: " + dontAddToStack);

	// Create a new WickAction object
	var action = new WickAction(
		this.doActions[actionName],
		this.undoActions[actionName] 
	);

	// Pass the arguments over to the WickAction and call its doAction function
	action.args = args;
	action.doAction();

	// Put the action on the undo stack to be undone later
	if(!dontAddToStack) {
		this.undoStack.push(action); 
		this.redoStack = [];
	}

}

WickActionHandler.prototype.undoAction = function () {

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
	action.undoAction();
	this.redoStack.push(action);
	
}

WickActionHandler.prototype.redoAction = function () {

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
	action.doAction();
	this.undoStack.push(action);

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