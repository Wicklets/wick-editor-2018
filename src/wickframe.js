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

	// Extend our frame to encompass more frames. 
	this.extend = function(length) {
		this.frameLength += length; 
	}

	// Reduce the number of frames this WickFrame Occupies. 
	this.shrink = function(length) {
		// Never "shrink" a negative amount. 
		if (length <= 0) {
			return; 
		}

		originalLength = this.frameLength; 
		this.frameLength -= length; 

		// determine and return the actual change in frames. 
		if (this.frameLength <= 0) {
			this.frameLength = 1;
			return originalLength - 1; 
		} else {
			return length; 
		}
	}
};