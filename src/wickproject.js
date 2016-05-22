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

WickProject.prototype.getFrame = function(playheadPosition) {

	var layer = this.rootObject.timeline.layers[playheadPosition.layerIndex]
	var frame = layer.frames[playheadPosition.frameIndex];
	return frame;

}

WickProject.prototype.addEmptyFrame = function(playheadPosition) {

	var layer = this.rootObject.timeline.layers[playheadPosition.layerIndex];
	layer.frames[playheadPosition.frameIndex] = new WickFrame();

}

WickProject.prototype.storeCanvasIntoFrame = function(playheadPosition, canvas) {

	// Clear current frame

	this.rootObject.timeline.layers[playheadPosition.layerIndex].frames[playheadPosition.frameIndex].wickObjects = [];

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
		this.rootObject.timeline.layers[playheadPosition.layerIndex].frames[playheadPosition.frameIndex].wickObjects.push(wickObject);
	}

}
