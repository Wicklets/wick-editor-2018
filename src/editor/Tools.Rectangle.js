/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

if(!window.Tools) Tools = {};

Tools.Rectangle = function (wickEditor) {

    var that = this;
    var fabricInterface = wickEditor.fabric;

    this.getCursorImage = function () {
        return "crosshair"
    };

    fabricInterface.canvas.on('mouse:down', function (e) {
        if(!(wickEditor.currentTool instanceof Tools.Rectangle)) return;

        fabricInterface.shapeDrawer.startDrawingShape('rectangle', e.e.offsetX, e.e.offsetY, that.createWickObjectFromShape);
    });

    this.createWickObjectFromShape = function (drawingShape) {
        var origX = drawingShape.left+drawingShape.width /2;
        var origY = drawingShape.top +drawingShape.height/2;
        drawingShape.left = 0;
        drawingShape.top = 0;
        drawingShape.setCoords();
        var svg = '<rect fill="'+drawingShape.fill+'" width="'+drawingShape.width+'" height="'+drawingShape.height+'" style="fill:rgb(0,0,0);" />'
        var svgString = '<svg id="svg" version="1.1" xmlns="http://www.w3.org/2000/svg">'+svg+'</svg>';

        drawingShape.remove()
        wickEditor.actionHandler.doAction('addObjects', {
            paths: [{svg:svgString, x:origX, y:origY}]
        });

        /*WickObject.fromPathFile(svgString, function (wickObject) {
            wickObject.x = origX;
            wickObject.y = origY;
            wickObject.isNewDrawingPath = true;
            wickEditor.project.addObject(wickObject);
            wickEditor.paper.onWickObjectsChange();
        });
        
        wickEditor.fabric.drawingPath = drawingShape;
        wickEditor.syncInterfaces();*/
    }

}