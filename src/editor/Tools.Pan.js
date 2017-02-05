/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

if(!window.Tools) Tools = {};

Tools.Pan = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        return "move";
    }

// Panning the fabric canvas
    
    wickEditor.fabric.canvas.on('mouse:up', function (e) {
        wickEditor.fabric.stopPan();
    });

    wickEditor.fabric.canvas.on('mouse:down', function (e) {
        if(wickEditor.currentTool instanceof Tools.Pan) {
            wickEditor.fabric.startPan();
        }
    });
    
    wickEditor.fabric.canvas.on('mouse:move', function (e) {
        if (wickEditor.fabric.panning && e && e.e) {
            wickEditor.fabric.relativePan(e.e.movementX, e.e.movementY)
        }
    });

}