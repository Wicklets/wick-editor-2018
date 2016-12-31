/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

if(!window.Tools) Tools = {};

Tools.Rectangle = function (wickEditor) {

    var that = this;
    var fabricInterface = wickEditor.fabric;

    this.getCursorImage = function () {
        return "crosshair"
    };

    fabricInterface.canvas.on('mouse:down', function (e) {
        if(!(fabricInterface.currentTool instanceof Tools.Rectangle)) return;

        fabricInterface.shapeDrawer.startDrawingShape('rectangle', e.e.offsetX, e.e.offsetY, that.createWickObjectFromShape);
    });

    this.createWickObjectFromShape = function (drawingShape) {
        var origX = drawingShape.left+drawingShape.width /2;
        var origY = drawingShape.top +drawingShape.height/2;
        drawingShape.left = 0;
        drawingShape.top = 0;
        drawingShape.setCoords();
        var svg = '<rect width="'+drawingShape.width+'" height="'+drawingShape.height+'" style="fill:rgb(0,0,0);" />'
        var SVGData = {
            svgString: '<svg id="svg" version="1.1" xmlns="http://www.w3.org/2000/svg">'+svg+'</svg>', 
            fillColor: fabricInterface.tools.paintbrush.color
        }

        wickEditor.paper.addSVG(SVGData.svgString, {x:origX, y:origY});
        wickEditor.fabric.drawingPath = drawingShape;
        wickEditor.syncInterfaces();
    }

}