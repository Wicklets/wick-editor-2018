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

	this.undoActions['delete'] = function () {

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

}

WickActionHandler.prototype.doAction = function (actionName) {
	
	var action = new WickAction(
		this.doActions[actionName],
		this.undoActions[actionName] 
	);

	action.doAction();
	this.undoStack.push(action); 
	
	this.redoStack = [];
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
	action.doAction(); 
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