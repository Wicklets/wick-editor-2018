/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var ShapeDrawer = function (wickEditor, fabricInterface) {

    var that = this;

    var drawingShape = null;

    fabricInterface.canvas.on('mouse:move', function (e) {
        that.updateDrawingShape(e.e.offsetX,e.e.offsetY);
    });

    fabricInterface.canvas.on('mouse:up', function (e) {
        that.stopDrawingShape();
    });

    this.startDrawingShape = function (shapeType, x, y) {

        fabricInterface.canvas.selection = false;

        var screenXY = fabricInterface.screenToCanvasSpace(x,y);

        shapeStartPos = {x:screenXY.x,y:screenXY.y};

        if(shapeType === 'rectangle') {
            drawingShape = new fabric.Rect({
                top : screenXY.y,
                left : screenXY.x,
                width : 1,
                height : 1,
                fill : fabricInterface.tools.paintbrush.color
            });
        } else if (shapeType === 'ellipse') {
            drawingShape = new fabric.Ellipse({
                originX: 'centerX',
                originY: 'centerY',
                top : screenXY.y,
                left : screenXY.x,
                width : 1,
                height : 1,
                fill : fabricInterface.tools.paintbrush.color
            });
        }

        fabricInterface.canvas.add(drawingShape);

    }

    this.updateDrawingShape = function (x,y) {
        if(drawingShape) {
            var screenXY = fabricInterface.screenToCanvasSpace(x,y);

            if(drawingShape.type === 'rect') {
                if(screenXY.x < shapeStartPos.x) drawingShape.left = screenXY.x;
                if(screenXY.y < shapeStartPos.y) drawingShape.top  = screenXY.y;
                drawingShape.width  = Math.abs(shapeStartPos.x - screenXY.x);
                drawingShape.height = Math.abs(shapeStartPos.y - screenXY.y);            
            } else if(drawingShape.type === 'ellipse') {
                drawingShape.width  = Math.abs(drawingShape.left - screenXY.x);
                drawingShape.height = Math.abs(drawingShape.top  - screenXY.y);    
                drawingShape.rx = Math.abs(drawingShape.left - screenXY.x);
                drawingShape.ry = Math.abs(drawingShape.top  - screenXY.y);
            }
            fabricInterface.canvas.renderAll();
        }
    }

    this.stopDrawingShape = function () {

        fabricInterface.canvas.selection = true;

        if(!drawingShape) return;
        if(drawingShape.width <= 0 || drawingShape.height <= 0) {
            fabricInterface.canvas.remove(drawingShape);
            drawingShape = null;
            return;
        }

        if(drawingShape.type === 'rect') {
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
        } else if (drawingShape.type === 'ellipse') {
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

        drawingShape = null;
    }

}