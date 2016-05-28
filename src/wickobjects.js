/* NOTE: The names 'static' and 'dynamic' are temporary...
   Need to find other names that makes sense */

/*****************************
	Object 
*****************************/

var WickObject = function () {

	// Note that the only object with parentObject as null is the root object.
	this.parentObject = null;

	this.currentFrame = null;

	this.isSymbol = false;

	this.dataURL = undefined;

};

WickObject.prototype.getCurrentFrame = function() {

	return this.frames[this.currentFrame];

}

WickObject.prototype.addEmptyFrame = function(newFrameIndex) {

	this.frames[newFrameIndex] = new WickFrame();

}

WickObject.prototype.getAllStaticObjectDataURLsRecursively = function () {

	// TODO: make this return ALL static object's data URLs

	if (frames.length > 0) {
		console.error("getAllStaticObjectDataURLsRecursively(): Symbol has no frames! Deal with this")
	} else {
		if(this.frames[0].wickObjects.length > 0) {
			var firstFrameObjects = this.frames[0].wickObjects;
			for(var i = 0; i < firstFrameObjects.length; i++) {
				if(firstFrameObjects[i].isSymbol) {
					return firstFrameObjects[i].getAllStaticObjectDataURLsRecursively();
				} else {
					console.log("bogo")
					return firstFrameObjects[i].dataURL;
				}
			}
		} else {
			console.error("getAllStaticObjectDataURLsRecursively(): Symbol's first frame has no objects! Deal with this")
		}
	}

}


/*****************************
	Frames
*****************************/

// Stores a bunch of wickobjects.

var WickFrame = function () {

	this.wickObjects = [];

};
