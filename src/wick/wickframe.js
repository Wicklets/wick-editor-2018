/*****************************
	Frames
*****************************/
var WickFrame = function () {
	// Store all objects in frame. 
	this.wickObjects = [];

	// Should we stop on this frame? 
	this.breakpoint = false;

	// A single frame contains no tweens. Note: Tweens not yet implemented
	this.tweenPoints = [];

	// Create multiframe support. 
	this.frameLength = 1;
};

// Extend our frame to encompass more frames. 
WickFrame.prototype.extend = function(length) {
	this.frameLength += length; 
}

// Reduce the number of frames this WickFrame Occupies. 
WickFrame.prototype.shrink = function(length) {
	// Never "shrink" by a negative amount. 
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