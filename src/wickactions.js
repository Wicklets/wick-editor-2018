/* General Logic for how undo and redo is handled in the Wick editor. All inputs
   to a WickActionStack instance should be valid WickActions or the behavior is undefined */
var WickActionHandler = function () {

// Initialize action handler vars

	this.undoStack = []; 
	this.redoStack = [];

// Do/Undo/Redo 

	this.doAction = function (action) {
		this.undoStack.push(action); 
		action.doAction();
		this.redoStack = [];
	}

	this.undoAction = function () {
		if (this.undoStack.length == 0) {
			return; 
		} 

		var action = this.undoStack.pop(); 
		action.undoAction(); 
		this.redoStack.push(action);
	}

	this.redoAction = function () {
		if (this.redoStack.length == 0) {
			return;
		} 

		var action = redoStack.pop(); 
		action.doAction(); 
		this.undoStack.push(action); 
	}

}

/* WickAction definition. All user actions are expected to be well defined by
   this structure in order to properly be done and undone. */

var WickAction = function (doAction, undoAction, undoData) {

	// To be called when an action is committed by the user. 
	this.doAction = doAction;

	/* To be called when this the user undoes this action. This should revert
       the state of the wickEditor or wickObject back to its original state. */
	this.undoAction = undoAction;

}