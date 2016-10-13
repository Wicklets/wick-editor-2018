/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var EllipseTool = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        return "crosshair"
    };

    var canvas = wickEditor.interfaces.fabric.canvas;

    canvas.on('mouse:down', function (e) {
        if(wickEditor.currentTool instanceof EllipseTool)
            wickEditor.interfaces.fabric.startDrawingShape('ellipse', e.e.offsetX, e.e.offsetY);
    });

}