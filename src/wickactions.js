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

		this.obj = fabCanvas.getActiveObject();
		this.group = fabCanvas.getActiveGroup();

		if(this.group) {
			this.groupObjs = [];

			var items = this.group._objects;
			this.group._restoreObjectsState();

			for(var i = 0; i < items.length; i++) {
				this.groupObjs.push(items[i]);
			}
		}

		// Delete the selected object

		var fabCanvas = wickEditor.fabricCanvas.getCanvas();

		if (fabCanvas.getActiveGroup()) {
			fabCanvas.getActiveGroup().forEachObject(function(o) { 
				fabCanvas.remove(o);
			});
			fabCanvas.discardActiveGroup().renderAll();
		} else {
			fabCanvas.remove(fabCanvas.getActiveObject());
		}
	};

	this.undoActions['delete'] = function (args) {

		// Restore the deleted object/s
		// We stored them inside this WickAction object!

		var fabCanvas = wickEditor.fabricCanvas.getCanvas();

		if(this.group) {
			for(var i = 0; i < this.groupObjs.length; i++) {
				fabCanvas.add(this.groupObjs[i]);
			}
		} else {
			fabCanvas.add(this.obj);
		}
	};

	this.doActions['gotoFrame'] = function (args) {

		this.oldFrame = wickEditor.currentObject.currentFrame;

		// Store changes made to current frame in the project
		wickEditor.currentObject.frames[wickEditor.currentObject.currentFrame].wickObjects = wickEditor.fabricCanvas.getWickObjectsInCanvas();

		// move playhead
		var toFrame = args[0];
		wickEditor.currentObject.currentFrame = toFrame;

		// Load wickobjects in the frame we moved to into the canvas
		wickEditor.fabricCanvas.storeObjectsIntoCanvas( wickEditor.currentObject.getCurrentFrame().wickObjects );

		wickEditor.timelineController.updateGUI(wickEditor.currentObject);
	}

	this.undoActions['gotoFrame'] = function (args) {
		// Store changes made to current frame in the project
		wickEditor.currentObject.frames[wickEditor.currentObject.currentFrame].wickObjects = wickEditor.fabricCanvas.getWickObjectsInCanvas();

		// move playhead
		var toFrame = this.oldFrame;
		wickEditor.currentObject.currentFrame = toFrame;

		// Load wickobjects in the frame we moved to into the canvas
		wickEditor.fabricCanvas.storeObjectsIntoCanvas( wickEditor.currentObject.getCurrentFrame().wickObjects );

		wickEditor.timelineController.updateGUI(wickEditor.currentObject);
	}

	this.doActions['addEmptyFrame'] = function (args) {
		// Add an empty frame
		wickEditor.currentObject.addEmptyFrame(wickEditor.currentObject.frames.length);

		// Move to that new frame
		wickEditor.actionHandler.doAction('gotoFrame', [wickEditor.currentObject.frames.length-1], true);

		// Update GUI
		wickEditor.resizeCanvasAndGUI();
		wickEditor.timelineController.updateGUI(wickEditor.currentObject);
	}

	this.undoActions['addEmptyFrame'] = function (args) {
		// Go to the second-to-last frame and remove the last frame
		wickEditor.actionHandler.doAction('gotoFrame', [wickEditor.currentObject.frames.length-2], true);
		wickEditor.currentObject.frames.pop();

		// Update GUI
		wickEditor.resizeCanvasAndGUI();
		wickEditor.timelineController.updateGUI(wickEditor.currentObject);
	}

	this.doActions['addWickObjectToFabricCanvas'] = function (args) {
		
	}

}

WickActionHandler.prototype.doAction = function (actionName, args, dontAddToStack) {
	
	var action = new WickAction(
		this.doActions[actionName],
		this.undoActions[actionName] 
	);

	action.args = args;
	action.doAction(args);

	if(!dontAddToStack) {
		this.undoStack.push(action); 
		this.redoStack = [];
	}

}

WickActionHandler.prototype.undoAction = function () {
	if (this.undoStack.length == 0) {
		return; 
	} 

	var action = this.undoStack.pop(); 
	action.undoAction();
	this.redoStack.push(action);
}

WickActionHandler.prototype.redoAction = function () {
	if (this.redoStack.length == 0) {
		return;
	} 

	var action = redoStack.pop(); 
	action.doAction(action.args); 
	this.undoStack.push(action); 
}

/* WickAction definition. All user actions are expected to be well defined by
   this structure in order to properly be done and undone. */

var WickAction = function (doAction, undoAction) {

	// To be called when an action is committed by the user. 
	this.doAction = doAction;

	/* To be called when this the user undoes this action. This should revert
       the state of the wickEditor or wickObject back to its original state. */
	this.undoAction = undoAction;

}