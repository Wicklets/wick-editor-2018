/*****************************
	Frames
*****************************/
var WickFrame = function () {
	// Store all objects in frame. 
	this.wickObjects = [];

	// Should we stop on this frame? 
	this.breakpoint = false;

	// A single frame contains no tweens.
	this.tweenPoints = [];

	// Create multiframe support. 
	this.frameLength = 1;

	// How many frames have we gone through? 
	this.framesElapsed = 0;

	// We hide elapsing implementation details here in case
	// we want to change them later. 
	this.elapseFrame = function () {
		if (this.framesElapsed < this.frameLength) {
			this.framesElapsed += 1;
		} else {
			VerboseLog.log("Cannot elapse a frame which has been fully elapsed.");
		}
	} 

	this.isElapsed = function () {
		return this.framesElapsed === this.frameLength;
	}

	this.reset = function () {
		this.framesElapsed = 0; 
	}

	// Extend our frame to encompass more frames. 
	this.extend = function(length) {
		this.frameLength += length; 
	}

	// Reduce the number of frames this WickFrame Occupies. 
	this.shrink = function(length) {
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
};