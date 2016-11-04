/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var RectangleTool = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        return "crosshair"
    };

    var fabric = wickEditor.interfaces.fabric;

    fabric.canvas.on('mouse:down', function (e) {
        if(!(fabric.currentTool instanceof RectangleTool)) return;

        fabric.shapeDrawer.startDrawingShape('rectangle', e.e.offsetX, e.e.offsetY);
    });

}