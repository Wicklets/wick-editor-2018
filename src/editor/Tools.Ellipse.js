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
        var svg = '<ellipse cx="'+drawingShape.width+'" cy="'+drawingShape.height+'" rx="'+drawingShape.width+'" ry="'+drawingShape.height+'"/>'
        var SVGData = {
            svgString: '<svg width="'+drawingShape.width*2+'" height="'+drawingShape.height*2+'"  id="svg" version="1.0" xmlns="http://www.w3.org/2000/svg">'+svg+'</svg>', 
            fillColor: fabricInterface.tools.paintbrush.color
        }

        fabricInterface.canvas.remove(drawingShape);
    }

}