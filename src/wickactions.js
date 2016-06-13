/* General Logic for how undo and redo is handled in the Wick editor. All inputs
   to a WickActionStack instance should be valid WickActions or the behavior is undefined */
var WickActionStack = function () {

	this.undoStack = []; 
	this.redoStack = [];

	this.undo = function () {
		if (this.undoStack.length == 0) {
			return; 
		} 

		var action = undoStack.pop(); 
		action.undoAction(); 
		this.redoStack.push(action); 
	}

	this.redo = function () {
		if (this.redoStack.length == 0) {
			return;
		} 

		var action = redoStack.pop(); 
		action.doAction(); 
		this.undoStack.push(action); 
	}

	this.doStackAction = function(action) {
		this.undoStack.push(action); 
		this.clearRedoStack(); 
	}

	this.clearRedoStack = function () {
		this.redoStack = []; 
	}
}

/* WickAction definition. All user actions are expected to be well defined by
   this structure in order to properly be done and undone. */

var WickActionMaker = function () {

	// Action Name 
	this.name = "default";
	
	// To be called when an action is committed by the user. 
	doAction = function (actionStack) {

	}

	/* To be called when this the user undoes this action. This should revert
       the state of the wickEditor or wickObject back to its original state. */
	undoAction = function () {

	}

	/************************
         Actions
    ************************/

	// Individual Selection Event
	var SelectOne = function (activeCanvas, target) {
		this.name = 'selectOne'; 
		this.target = target;
		this.activeCanvas = activeCanvas;
		this.id = undefined; 

		var doAction = function (actionStack) {
			// Save some computation if we've already found the id. 
			if (this.id === undefined) {
				this.id = activeCanvas.getCanvas().getObjects().indexOf(this.target);
			}

			this.activeCanvas.getCanvas().setActiveObject(fabricCanvas.getCanvas().item(this.id));
			this.activeCanvas.renderAll(); 

			actionStack.doStackAction(this); 
		}

		var undoAction = function () {
			var activeItems = canvas.getActiveGroup(); 
			activeItems.removeWithUpdate(this.target);
			this.activeCanvas.renderAll(); 
		}

	}

}


