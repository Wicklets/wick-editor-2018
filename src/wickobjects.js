/* NOTE: The names 'static' and 'dynamic' are temporary...
   Need to find other names that makes sense */

/*****************************
	Object 
*****************************/

// Never used directly. Only to be inherited

var setDefaultWickObjectVars = function (obj) {

	obj.left = 0;
	obj.top = 0;

	obj.width = 0;
	obj.height = 0;

	obj.scaleX = 1;
	obj.scaleY = 1;

	obj.angle = 0;

	obj.flipX = false;
	obj.flipY = false;

	obj.opacity = 1;

	obj.clickable = false;
	obj.toFrame = null;
	obj.currentFrame = 0;

};

var WickObject = function () {

}
WickObject.prototype = new WickObject();

WickObject.prototype.createFromFabricObject = function (fabObj) {

	var fabObjCopy = JSON.parse(JSON.stringify(fabObj)); // Deepcopy hack

	this.left = fabObjCopy.left;
	this.top = fabObjCopy.top;

	this.width = fabObjCopy.width;
	this.height = fabObjCopy.height;

	this.scaleX = fabObjCopy.scaleX;
	this.scaleY = fabObjCopy.scaleY;

	this.angle = fabObjCopy.angle;

	this.flipX = fabObjCopy.flipX;
	this.flipY = fabObjCopy.flipY;

	this.opacity = fabObjCopy.opacity;

	/* Temporary! Only should be in static objects */

	this.src = fabObjCopy.src;

	/* Temporary! Only should be in dynamic objects */

	this.clickable = fabObj.wickData.clickable;
	this.toFrame = fabObj.wickData.toFrame;
	this.currentFrame = fabObj.wickData.currentFrame;

};

WickObject.prototype.getFabricObject = function (callback) {

	var that = this;

	fabric.Image.fromURL(this.src, function(oImg) {
            
        oImg.left = that.left;
        oImg.top = that.top;

        oImg.width = that.width;
        oImg.height = that.height;

        oImg.scaleX = that.scaleX;
        oImg.scaleY = that.scaleY;
        oImg.angle = that.angle;

        oImg.flipX = that.flipX;
        oImg.flipY = that.flipY;

        oImg.opacity = that.opacity;

        oImg.wickData = {
        	clickable: that.clickable,
        	toFrame: that.toFrame,
        	currentFrame: that.currentFrame
        };

        callback(oImg);
    });

}

/*****************************
	Static
*****************************/

// Inherits everything from WickObject

var StaticObject = function () {

	setDefaultWickObjectVars(this);

	// Data object (image, sound, video, etc.)

	var data;

};
StaticObject.prototype = new WickObject();

StaticObject.prototype.convertToSymbol = function(wickObject) {

	// Create new Symbol with single frame that contains only this Static object

}

/*****************************
	Dynamic
*****************************/

var DynamicObject = function () {

	setDefaultWickObjectVars(this);

	// Sub-timline

	this.layers = [new WickLayer()];

	// Script data

	// TODO

};
DynamicObject.prototype = new WickObject();

/*****************************
	Layers 
*****************************/

// Stores a bunch of frames.

var WickLayer = function () {

	this.frames = [new WickFrame()];

};

/*****************************
	Frames
*****************************/

// Stores a bunch of wickobjects.

var WickFrame = function () {

	this.wickObjects = [];

};
