var ObjectIndexer = function (objectIndex, layerIndex, frameIndex) {

	this.objectIndex = objectIndex;
	this.frameIndex = frameIndex;

};

var PlayheadPosition = function () {

	// All projects start in the root object, in layer 0, on frame 0.
	this.playheadStack = [new ObjectIndexer("ROOT", 0, 0)];

}

PlayheadPosition.prototype.getCurrentFrameIndex = function () {

	return this.playheadStack[this.playheadStack.length-1].frameIndex;

}

PlayheadPosition.prototype.moveToFrame = function (newFrameIndex) {
	
	this.playheadStack[this.playheadStack.length-1].frameIndex = newFrameIndex;

};

PlayheadPosition.prototype.goInsideObject = function (objectIndex) {

	this.playheadStack.push(new ObjectIndexer(objectIndex, 0, 0));

}

PlayheadPosition.prototype.goDownOneLevel = function () {

	if(this.playheadStack.length == 1) {

		console.err("goDownOneLevel() called while playhead at root level!");

	} else {

		this.playheadStack.pop();

	}

}