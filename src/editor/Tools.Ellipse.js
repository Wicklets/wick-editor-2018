/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

if(!window.Tools) Tools = {};

Tools.Ellipse = function (wickEditor) {

    var that = this;
    var fabricInterface = wickEditor.fabric;

    this.getCursorImage = function () {
        return "crosshair"
    };

    this.getToolbarIcon = function () {
        return "resources/ellipse.png";
    }

    this.getTooltipName = function () {
        return "Ellipse";
    }

    this.setup = function () {
        fabricInterface.canvas.on('mouse:down', function (e) {
            if(!(wickEditor.currentTool instanceof Tools.Ellipse)) return;

            fabricInterface.shapeDrawer.startDrawingShape('ellipse', e.e.offsetX, e.e.offsetY, that.createWickObjectFromShape);
        });
    }

    this.createWickObjectFromShape = function (drawingShape) {
        var origX = drawingShape.left;
        var origY = drawingShape.top;
        drawingShape.left = 0;
        drawingShape.top = 0;
        drawingShape.setCoords();
        //var svg = '<ellipse fill="'+drawingShape.fill+'" cx="'+drawingShape.rx+'" cy="'+drawingShape.ry+'" rx="'+drawingShape.width+'" ry="'+drawingShape.height+'"/>'
        var svg = '<ellipse cx="'+drawingShape.width/2+'" cy="'+drawingShape.height/2+'" fill="'+drawingShape.fill+'" rx="'+drawingShape.rx+'" ry="'+drawingShape.ry+'"/>'
        var svgString = '<svg id="svg" version="1.1" xmlns="http://www.w3.org/2000/svg">'+svg+'</svg>';

        drawingShape.remove()
        
        var pathWickObject = WickObject.fromPathFile(svgString);
        pathWickObject.x = origX;
        pathWickObject.y = origY;

        wickEditor.actionHandler.doAction('addObjects', {
            wickObjects: [pathWickObject]
        });
    }

}