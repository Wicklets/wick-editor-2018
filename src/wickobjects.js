/* NOTE: The names 'static' and 'dynamic' are temporary...
   Need to find other names that makes sense */

/*****************************
	Object 
*****************************/

// Never used directly. Only to be inherited

var WickObject = function () {

}
WickObject.prototype = new WickObject();

/*****************************
	Static
*****************************/

// Inherits everything from WickObject

var StaticObject = function () {

	// Data object (image, sound, video, etc.)
	// At the moment, images are only supported, so keep a 'src' for the image data

	var src;

};
StaticObject.prototype = new WickObject();

StaticObject.prototype.convertToSymbol = function(wickObject) {

	// Create new Symbol with single frame that contains only this Static object

}

/*****************************
	Dynamic
*****************************/

var DynamicObject = function () {

	// Sub-timeline

	this.frames = [new WickFrame()];

	// Script data

	// TODO

};
DynamicObject.prototype = new WickObject();

/*****************************
	Frames
*****************************/

// Stores a bunch of wickobjects.

var WickFrame = function () {

	this.wickObjects = [];

};
