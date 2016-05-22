/* NOTE: The names 'static' and 'dynamic' are temporary...
   Need to find other names that makes sense */

/*****************************
	Object 
*****************************/

// Never used directly. Only to be inherited

var WickObject = function () {

	this.left = 0;
	this.top = 0;

	this.width = 0;
	this.height = 0;

	this.scaleX = 1;
	this.scaleY = 1;

	this.angle = 0;

	this.flipX = false;
	this.flipY = false;

	this.opacity = 1;

	this.wickData = { clickable: false, toFrame: null }

};
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
        	toFrame: that.toFrame
        };

        callback(oImg);
    });

}

/*****************************
	Static
*****************************/

// Inherits everything from WickObject

var StaticObject = function () {

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
	this.timeline = new WickTimeline();

	// Script data

};

/*****************************
	Timelines 
*****************************/

// Stores a bunch of layers.

var WickTimeline = function () {

	this.layers = [];

	var emptyLayer = new WickLayer();
	this.layers.push(emptyLayer);

};

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
