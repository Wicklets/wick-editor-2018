/* NOTE: The names 'static' and 'dynamic' are temporary... */

/*****************************
	Object
*****************************/

var WickObject = function (_left, _top, _width, _height, _scaleX, _scaleY, _angle, _flipX, _flipY, _opacity, _src) {

	this.left    = _left;
	this.top     = _top;
	this.width   = _width;
	this.height  = _height;
	this.scaleX  = _scaleX;
	this.scaleY  = _scaleY;
	this.angle   = _angle;
	this.flipX   = _flipX;
	this.flipY   = _flipY;
	this.opacity = _opacity;
	this.src	 = _src; 

};

/*****************************
	Static
*****************************/

var StaticObject = function () {

	// Inherits everything from WickObject
	// Data object (image, sound, video, etc.)

};
StaticObject.prototype = new WickObject(0,0,0,0,0,0,0,0,0,0,'');

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
DynamicObject.prototype = new WickObject(0,0,0,0,0,0,0,0,0,0,'');

var SO = new StaticObject();
console.log(SO);

var DO = new DynamicObject();
console.log(DO);