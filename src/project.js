/*****************************
	Projects
*****************************/

// Holds the root object and some project settings.

var WickProject = function () {

	this.rootObject = new WickObject();
	this.rootObject.currentFrame = 0;
	this.rootObject.frames = [new WickFrame()];

	this.resolution = {};
	this.resolution.x = 650;
	this.resolution.y = 500;

};
