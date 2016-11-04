/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var PanTool = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        return "move";
    }

// Panning the fabric canvas
    
    wickEditor.interfaces.fabric.canvas.on('mouse:up', function (e) {
        wickEditor.interfaces.fabric.stopPan();
    });

    wickEditor.interfaces.fabric.canvas.on('mouse:down', function (e) {
        if(wickEditor.interfaces.fabric.currentTool instanceof PanTool) {
            wickEditor.interfaces.fabric.startPan();
        }
    });
    
    wickEditor.interfaces.fabric.canvas.on('mouse:move', function (e) {
        if (wickEditor.interfaces.fabric.panning && e && e.e) {
            wickEditor.interfaces.fabric.relativePan(e.e.movementX, e.e.movementY)
        }
    });

}