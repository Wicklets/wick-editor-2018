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

// All of these functions should be in wickobjects.js so we can have the recusive timeline system

WickProject.prototype.getFrame = function(playheadPosition) {

	// TODO: recursive timelines
	var rootPlayheadPosition = playheadPosition.playheadStack[0];

	var layer = this.rootObject.layers[rootPlayheadPosition.layerIndex]
	var frame = layer.frames[rootPlayheadPosition.frameIndex];
	return frame;

}

WickProject.prototype.getObject = function(playheadPosition) {
	
	//TODO: recursive timelines

}

WickProject.prototype.addEmptyFrame = function(playheadPosition) {

	// TODO: recursive timelines
	var rootPlayheadPosition = playheadPosition.playheadStack[0];

	var layer = this.rootObject.layers[rootPlayheadPosition.layerIndex];
	layer.frames[rootPlayheadPosition.frameIndex] = new WickFrame();

}

WickProject.prototype.storeCanvasIntoFrame = function(playheadPosition, canvas) {

	// TODO: recursive timelines
	var rootPlayheadPosition = playheadPosition.playheadStack[0];

	// Clear current frame

	this.rootObject.layers[rootPlayheadPosition.layerIndex].frames[rootPlayheadPosition.frameIndex].wickObjects = [];

	// Get fabric objects from canvas

	var fabricObjectsInCanvas = [];

	canvas.forEachObject(function(obj){
		// Deepcopy and add to frame
		fabricObjectsInCanvas.unshift(jQuery.extend(true, {}, obj));
	});

	// Add those objects to the frame

	for(var i = 0; i < fabricObjectsInCanvas.length; i++) {
		var wickObject = new WickObject();
		wickObject.createFromFabricObject(fabricObjectsInCanvas[i])
		this.rootObject.layers[rootPlayheadPosition.layerIndex].frames[rootPlayheadPosition.frameIndex].wickObjects.push(wickObject);
	}

}
