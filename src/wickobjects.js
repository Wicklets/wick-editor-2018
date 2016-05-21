/*****************************
	Object
*****************************/

var WickObject = function () {

	// x, y, rotation, all that stuff
	this.x = 0;
	this.y = 0;
	this.rotation = 0;
	this.alpha = 0;

};

/*****************************
	Static
*****************************/

var StaticObject = function () {

	// Inherits everything from WickObject
	// Data object (image, sound, video, etc.)

};
StaticObject.prototype = new WickObject();

StaticObject.prototype.convertToSymbol = function(wickObject) {

	// Create new Symbol with single frame that contains only this Static object

}

/*****************************
	Symbol
*****************************/

var DynamicObject = function () {
	// Timeline

	// Script data

};
DynamicObject.prototype = new WickObject();

var DO = new DynamicObject();
console.log(DO.x);
