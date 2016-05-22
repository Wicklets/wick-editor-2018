/* NOTE: The names 'static' and 'dynamic' are temporary... */

/*****************************
	Object
*****************************/

var WickObject = function () {

	this.left    = 0;
	this.top     = 0;
	this.width   = 0;
	this.height  = 0;
	this.scaleX  = 1;
	this.scaleY  = 1;
	this.angle   = 0;
	this.flipX   = false;
	this.flipY   = false;
	this.opacity = 1;
	//this.src	 = undefined; 

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
	Dynamic
*****************************/

var DynamicObject = function () {
	// Timeline

	// Script data

};
DynamicObject.prototype = new WickObject();

var SO = new StaticObject();
console.log(SO);

var DO = new DynamicObject();
console.log(DO);