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
    	var origX = drawingShape.left;
        var origY = drawingShape.top;
        drawingShape.left = 0;
        drawingShape.top = 0;
        drawingShape.setCoords();
        var svg = '<rect width="'+drawingShape.width+'" height="'+drawingShape.height+'" style="fill:rgb(0,0,255);" />'
        var SVGData = {
            svgString: '<svg id="svg" version="1.1" xmlns="http://www.w3.org/2000/svg">'+svg+'</svg>', 
            fillColor: fabricInterface.tools.paintbrush.color
        }
        var wickObj = WickObject.fromSVG(SVGData);

        fabricInterface.canvas.remove(drawingShape);
        wickEditor.syncInterfaces();

        wickObj.x = origX + drawingShape.width/2;
        wickObj.y = origY + drawingShape.height/2;

        wickEditor.actionHandler.doAction('addObjects', {
            wickObjects: [wickObj]
        });
    }

}