/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

if(!window.Tools) Tools = {};

Tools.Ellipse = function (wickEditor) {

    var that = this;
    var fabricInterface = wickEditor.fabric;

    this.getCursorImage = function () {
        return "crosshair"
    };

    fabricInterface.canvas.on('mouse:down', function (e) {
        if(!(fabricInterface.currentTool instanceof Tools.Ellipse)) return;

        fabricInterface.shapeDrawer.startDrawingShape('ellipse', e.e.offsetX, e.e.offsetY, that.createWickObjectFromShape);
    });

    this.createWickObjectFromShape = function (drawingShape) {
        var origX = drawingShape.left;
        var origY = drawingShape.top;
        drawingShape.left = 0;
        drawingShape.top = 0;
        drawingShape.setCoords();
        var svg = '<ellipse fill="'+drawingShape.fill+'" cx="'+drawingShape.width+'" cy="'+drawingShape.height+'" rx="'+drawingShape.width+'" ry="'+drawingShape.height+'"/>'
        var svgData = '<svg id="svg" version="1.1" xmlns="http://www.w3.org/2000/svg">'+svg+'</svg>';

        /*wickEditor.paper.addSVG(svgData, {x:origX, y:origY});
        wickEditor.fabric.drawingPath = drawingShape;
        wickEditor.syncInterfaces();*/

        WickObject.fromPathFile(svgData, function (wickObject) {
            wickObject.x = origX;
            wickObject.y = origY;
            wickEditor.project.addObject(wickObject);
            wickEditor.paper.onWickObjectsChange();
        });
        
        wickEditor.fabric.drawingPath = drawingShape;
        wickEditor.syncInterfaces();
    }

}