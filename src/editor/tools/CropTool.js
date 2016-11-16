/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var CropTool = function (wickEditor) {

    var that = this;
    var fabricInterface = wickEditor.interfaces['fabric'];
    var canvas = fabricInterface.canvas;

    this.getCursorImage = function () {
        return "crosshair";
    }

    fabricInterface.canvas.on('mouse:down', function (e) {
        if(!(fabricInterface.currentTool instanceof CropTool)) return;

        fabricInterface.shapeDrawer.startDrawingShape('rectangle', e.e.offsetX, e.e.offsetY, that.cropWithShape, {crop:true});
    });

    this.cropWithShape = function (drawingShape) {
        fabricInterface.canvas.remove(drawingShape);
        wickEditor.syncInterfaces();

        var cropPos = {x: drawingShape.left, y: drawingShape.top};

        wickEditor.interfaces.fabric.getObjectsImage(function (data) { 
            CropImage(data.src, function (src) {
                var wickObj = WickObject.fromImage(src, function (wickObj) {
                    wickEditor.actionHandler.doAction('addObjects', {wickObjects:[wickObj]});
                });
            }, {
                x : cropPos.x-data.x,
                y : cropPos.y-data.y,
                width : drawingShape.width,
                height : drawingShape.height
            })
        });
    }

}