/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

if(!window.Tools) Tools = {};

Tools.Crop = function (wickEditor) {

    var that = this;
    var fabricInterface = wickEditor.fabric;
    var canvas = fabricInterface.canvas;

    this.getCursorImage = function () {
        return "crosshair";
    }

    fabricInterface.canvas.on('mouse:down', function (e) {
        if(!(fabricInterface.currentTool instanceof Tools.Crop)) return;

        fabricInterface.shapeDrawer.startDrawingShape('rectangle', e.e.offsetX, e.e.offsetY, that.cropWithShape, {crop:true});
    });

    this.cropWithShape = function (drawingShape) {
        fabricInterface.canvas.remove(drawingShape);
        wickEditor.syncInterfaces();

        wickEditor.fabric.projectRenderer.getCanvasAsImage(function (data) { 
            if(!data) return;
            CropImage(data.src, function (src) {
                var wickObj = WickObject.fromImage(src, function (wickObj) {
                    wickObj.x = drawingShape.left + drawingShape.width/2;
                    wickObj.y = drawingShape.top + drawingShape.height/2;
                    wickEditor.actionHandler.doAction('addObjects', {wickObjects:[wickObj], });
                });
            }, {
                x : drawingShape.left-data.x,
                y : drawingShape.top-data.y,
                width : drawingShape.width,
                height : drawingShape.height
            })
        });
    }

}