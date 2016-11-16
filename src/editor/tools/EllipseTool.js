/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var EllipseTool = function (wickEditor) {

    var that = this;
    var fabricInterface = wickEditor.interfaces.fabric;

    this.getCursorImage = function () {
        return "crosshair"
    };

    fabricInterface.canvas.on('mouse:down', function (e) {
        if(!(fabricInterface.currentTool instanceof EllipseTool)) return;

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
        var wickObj = WickObject.fromSVG(SVGData);

        fabricInterface.canvas.remove(drawingShape);
        wickEditor.syncInterfaces();

        wickObj.x = origX// + drawingShape.width;
        wickObj.y = origY //+ drawingShape.height;

        wickEditor.actionHandler.doAction('addObjects', {
            wickObjects: [wickObj]
        });
    }

}