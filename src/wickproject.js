/*****************************
	Projects
*****************************/

// Holds the root object and some project settings.

var WickProject = function () {

	this.rootObject = new DynamicObject();

	this.resolution = {};
	this.resolution.x = 800;
	this.resolution.y = 600;

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

WickTimeline.prototype.addObject = function(wickObject) {
}

/*****************************
	Layers 
*****************************/

// Stores a bunch of frames.

var WickLayer = function () {

	this.frames = [];

};

/*****************************
	Frames
*****************************/

// Stores a bunch of wickobjects.

var WickFrame = function () {

	this.wickObjects = [];

};