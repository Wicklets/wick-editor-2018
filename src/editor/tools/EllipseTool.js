/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var EllipseTool = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        return "crosshair"
    };

    var fabric = wickEditor.interfaces.fabric;

    fabric.canvas.on('mouse:down', function (e) {
        if(!(fabric.currentTool instanceof EllipseTool)) return;

        fabric.shapeDrawer.startDrawingShape('ellipse', e.e.offsetX, e.e.offsetY);
    });

}