/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var BaseCanvasInterface = function (wickEditor) {

	var that = this;

	this.canvas = document.getElementById("baseCanvas");

    this.syncWithEditorState = function () {
        // resize canvas
        // center frame
        // update position of canvas + frame (from panning)
        // stretch frame if we're in root, otherwise set it to project resolution
        // reposition origin crosshair
        // update frame color to background color
    }

}