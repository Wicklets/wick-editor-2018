/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var WickLayer = function () {
	this.frames = [new WickFrame()];

	this.parentWickObject = null; // The WickObject that this layer belongs to
};

WickLayer.prototype.getTotalLength = function () {
	var length = 0;

	for(var i = 0; i < this.frames.length; i++) {
		length += this.frames[i].frameLength;
	}

	return length;
}

WickLayer.prototype.addFrame = function(newFrame, i) {
	if(i === null || i === undefined) {
    	this.frames.push(newFrame);
    } else {
		this.frames.splice(i, 0, newFrame);
	}
}

WickLayer.prototype.deleteFrame = function(frame) {
	var i = this.frames.indexOf(frame);
    this.frames.splice(i, 1);
    return {i:i,frame:frame};
}

WickLayer.prototype.copy = function () {

	var copiedLayer = new WickLayer();
	copiedLayer.frames = [];

	this.frames.forEach(function (frame) {
		copiedLayer.frames.push(frame.copy());
	})

	return copiedLayer;

}