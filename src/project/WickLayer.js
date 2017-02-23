/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var WickLayer = function () {
    this.frames = [new WickFrame()];
    this.frames[0].playheadPosition = 0;

    this.identifier = "Layer 1"

    this.parentWickObject = null; // The WickObject that this layer belongs to
};

WickLayer.prototype.getTotalLength = function () {
    var length = 0;

    this.frames.forEach(function (frame) {
        var frameEnd = frame.playheadPosition + frame.length;
        if(frameEnd > length) length = frameEnd;
    });

    return length;
}

WickLayer.prototype.getFrameAtPlayheadPosition = function (playheadPosition) {
    var foundFrame = null;

    this.frames.forEach(function (frame) {
        if(foundFrame) return;
        if(playheadPosition >= frame.playheadPosition && playheadPosition < frame.playheadPosition+frame.length) {
            foundFrame = frame;
        }
    });

    return foundFrame;
}

WickLayer.prototype.getCurrentFrame = function () {
    return this.getFrameAtPlayheadPosition(this.parentWickObject.playheadPosition);
}


WickLayer.prototype.addFrame = function(newFrame, i) {
    if(i) console.error("DEPERACATED! TELL ZJ!");

    this.frames.push(newFrame);
}

WickLayer.prototype.removeFrame = function(frame) {
    var i = this.frames.indexOf(frame);
    this.frames.splice(i, 1);
}

WickLayer.prototype.copy = function () {

    var copiedLayer = new WickLayer();
    copiedLayer.frames = [];

    this.frames.forEach(function (frame) {
        copiedLayer.frames.push(frame.copy());
    })

    return copiedLayer;

}

WickLayer.prototype.getFrameByIdentifier = function (id) {

    var foundFrame = null;

    this.frames.forEach(function (frame) {
        if(frame.identifier === id) {
            foundFrame = frame;
        }
    });

    return foundFrame;

}

WickLayer.prototype.getRelativePlayheadPosition = function (wickObj, args) {

    var playheadRelativePosition = this.playheadPosition - wickObj.parentFrame.playheadPosition;

    if(args && args.normalized) playheadRelativePosition /= wickObj.parentFrame.length-1;

    return playheadRelativePosition;

}

WickLayer.prototype.getFramesAtPlayheadPosition = function(pos, args) {
    var frames = [];

    var counter = 0;
    for(var f = 0; f < this.frames.length; f++) {
        var frame = this.frames[f];
        for(var i = 0; i < frame.length; i++) {
            if(counter == pos) {
                frames.push(frame);
            }
            counter++;
        }
    }

    return frames;
}



