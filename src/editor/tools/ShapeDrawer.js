/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var ShapeDrawer = function (wickEditor, fabricInterface) {

    var that = this;

    var drawingShape = null;
    var doneFunc = null;
    var crop;

    fabricInterface.canvas.on('mouse:move', function (e) {
        that.updateDrawingShape(e.e.offsetX,e.e.offsetY);
    });

    fabricInterface.canvas.on('mouse:up', function (e) {
        that.stopDrawingShape();
    });

    this.startDrawingShape = function (shapeType, x, y, callback, args) {

        doneFunc = callback;
        crop = args && args.crop;

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

            if(crop) {
                drawingShape.stroke = 'white';
                drawingShape.strokeWidth = 1;
                drawingShape.fill ='rgba(0,0,0,0.3)';
            }
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
                if(crop) {
                    drawingShape.left = Math.round(drawingShape.left);
                    drawingShape.top = Math.round(drawingShape.top);
                    drawingShape.width = Math.round(drawingShape.width);
                    drawingShape.height = Math.round(drawingShape.height);
                }        
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

        doneFunc(drawingShape);

        drawingShape = null;
    }

}