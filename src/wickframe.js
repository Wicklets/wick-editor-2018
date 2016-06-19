/*****************************
	Frames
*****************************/

var WickFrame = function () {
	// Store all objects in frame. 
	this.wickObjects = [];

	// Should we stop on this frame? 
	this.breakpoint = false;

	// Create multiframe support. 
	this.frameLength = 1;

	// A single frame contains no tweens.
	this.tweenPoints = [];

	var extend = function(length) {
		this.frameLength += length; 
	}

	var shrink = function(length) {
		this.frameLength -= length; 
		if (this.frameLength <= 0) {
			this.frameLength = 1;
		}
	}
};