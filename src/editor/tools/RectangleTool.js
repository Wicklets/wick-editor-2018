/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var RectangleTool = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        return "crosshair"
    };

    var canvas = wickEditor.interfaces.fabric.canvas;

    canvas.on('mouse:down', function (e) {
        if(wickEditor.currentTool instanceof RectangleTool)
            wickEditor.interfaces.fabric.startDrawingShape('rectangle', e.e.offsetX, e.e.offsetY);
    });

}