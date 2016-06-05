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

	// List of frames, only used by symbols
	this.frames = undefined;

	// Dictionary mapping function names to WickScript object, only used by symbols
	this.wickScripts = null;

};

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

/*****************************
	Frames
*****************************/

var WickFrame = function () {

	this.wickObjects = [];

};
