/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var PanTool = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        return "move";
    }

// Panning the fabric canvas
    
    wickEditor.fabric.canvas.on('mouse:up', function (e) {
        wickEditor.fabric.stopPan();
    });

    wickEditor.fabric.canvas.on('mouse:down', function (e) {
        if(wickEditor.fabric.currentTool instanceof PanTool) {
            wickEditor.fabric.startPan();
        }
    });
    
    wickEditor.fabric.canvas.on('mouse:move', function (e) {
        if (wickEditor.fabric.panning && e && e.e) {
            wickEditor.fabric.relativePan(e.e.movementX, e.e.movementY)
        }
    });

}