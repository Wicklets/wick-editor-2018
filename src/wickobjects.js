/*****************************
	Object 
*****************************/

var WickObject = function () {

	// Used for debugging.
	this.objectName = undefined;

	// Note that the root object is the only object with parentObject as null.
	this.parentObject = null;

	// Used to keep track of what frame is being edited
	this.currentFrame = null;

	// See design docs for how objects and symbols work.
	this.isSymbol = false;

	// Data, only used by static objects
	// Currently only supports images, but will later support sounds, vectors, etc.
	this.dataURL = undefined;
	// this.dataType = "image"; // This is how we will support different formats later

	// List of frames, only used by symbols
	this.frames = undefined;

	// Dictionary mapping function names to WickScript object, only used by symbols
	this.wickScripts = null;

};

WickObject.prototype.setDefaultPositioningValues = function () {

	this.scaleX = 1;
	this.scaleY = 1;
	this.angle  = 0;
	this.flipX  = false;
	this.flipY  = false;

}

WickObject.prototype.setDefaultSymbolValues = function () {

	this.isSymbol = true;
	this.currentFrame = 0;
	this.wickScripts = {};
	this.frames = [new WickFrame()];

}

WickObject.prototype.getCurrentFrame = function() {

	return this.frames[this.currentFrame];

}

WickObject.prototype.addEmptyFrame = function(newFrameIndex) {

	this.frames[newFrameIndex] = new WickFrame();

}

// Used to prepare project for JSONificaion. 
// (JSON files can't have objects with circular references)
WickObject.prototype.removeParentObjectRefences = function() {

	this.parentObject = null;

	if(this.isSymbol) {

		// Recursively remove parent object references of all objects inside this symbol.

		for(var f = 0; f < this.frames.length; f++) {
			var frame = this.frames[f];
			for (var o = 0; o < frame.wickObjects.length; o++) {
				var wickObject = frame.wickObjects[o];
				wickObject.removeParentObjectRefences();
			}
		}
	}

}

// Used to put parent object references back after 
WickObject.prototype.regenerateParentObjectReferences = function() {

	var parentObject = this;

	if(this.isSymbol) {

		// Recursively remove parent object references of all objects inside this symbol.

		for(var f = 0; f < this.frames.length; f++) {
			var frame = this.frames[f];
			for (var o = 0; o < frame.wickObjects.length; o++) {
				frame.wickObjects[o].parentObject = parentObject;
				frame.wickObjects[o].regenerateParentObjectReferences();
			}
		}
	}

}

// Uses all parent's positions to calculate correct position on canvas
WickObject.prototype.getRelativePosition = function () {

	if(this.isRoot) {
		return {
			top: 0,
			left: 0
		};
	} else {
		var parentPosition = this.parentObject.getRelativePosition();
		return {
			top: this.top + parentPosition.top,
			left: this.left + parentPosition.left
		};
	}

}

/*****************************
	Frames
*****************************/

var WickFrame = function () {

	this.wickObjects = [];

};
