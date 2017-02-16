/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var WickLayer = function () {
    this.frames = [new WickFrame()];

    this.parentWickObject = null; // The WickObject that this layer belongs to
};

WickLayer.prototype.getTotalLength = function () {
    var length = 0;

    this.frames.forEach(function (frame) {
        var frameEnd = frame.playheadPosition + frame.frameLength;
        if(frameEnd > length) length = frameEnd;
    });

    return length;
}

WickLayer.prototype.addFrame = function(newFrame, i) {
    if(i) console.error("DEPERACATED! TELL ZJ!");

    this.frames.push(newFrame);
}

WickLayer.prototype.deleteFrame = function(frame) {
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