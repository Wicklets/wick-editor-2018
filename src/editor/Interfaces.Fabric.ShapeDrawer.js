/* Wick - (c) 2017 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/*  This file is part of Wick. 
    
    Wick is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Wick is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Wick.  If not, see <http://www.gnu.org/licenses/>. */
    
var FabricShapeDrawer = function (wickEditor, fabricInterface) {

    var that = this;

    var drawingShape = null;
    var doneFunc = null;
    var mouseMoved = null;

    var shapeType;

    fabricInterface.canvas.on('mouse:move', function (e) {
        that.updateDrawingShape(e.e.pageX, e.e.pageY);
    });

    fabricInterface.canvas.on('mouse:up', function (e) {
        that.stopDrawingShape();
    });

    this.startDrawingShape = function (shapetype, x, y, callback, args) {

        doneFunc = callback;
        shapeType = shapetype;
        var screenXY = fabricInterface.screenToCanvasSpace(x,y);
        shapeStartPos = {x:screenXY.x,y:screenXY.y};

        fabricInterface.canvas.selection = false;

        mouseMoved = false;

        if(shapeType === 'rectangle') {
            drawingShape = new fabric.Rect({
                top : screenXY.y,
                left : screenXY.x,
                width : 1,
                height : 1,
                rx: wickEditor.settings.rectangleCornerRadius,
                ry: wickEditor.settings.rectangleCornerRadius,
                fill : wickEditor.settings.fillColor,
                strokeWidth: parseInt(wickEditor.settings.strokeWidth),
                stroke: wickEditor.settings.strokeColor,
                strokeLineCap: 'round',
                strokeLineJoin: 'round',
            });
        } else if (shapeType === 'ellipse') {
            drawingShape = new fabric.Ellipse({
                originX: 'center',
                originY: 'center',
                top : screenXY.y,
                left : screenXY.x,
                rx: 1,
                ry: 1,
                fill : wickEditor.settings.fillColor,
                strokeWidth: parseInt(wickEditor.settings.strokeWidth),
                stroke: wickEditor.settings.strokeColor,
                strokeLineCap: 'round',
                strokeLineJoin: 'round',
            });
            drawingShape.__originalLeft = drawingShape.left;
            drawingShape.__originalTop = drawingShape.top;
        } else if (shapeType === 'line') {
            var w = parseInt(wickEditor.settings.strokeWidth);
            var x = screenXY.x - w/2
            var y = screenXY.y - w/2
            drawingShape = new fabric.Line(
                [x, y, x, y], 
                {
                    fill: 'red',
                    stroke: wickEditor.settings.strokeColor,
                    strokeWidth: parseInt(wickEditor.settings.strokeWidth),
                    selectable: false,
                    strokeLineCap: 'round',
                    strokeLineJoin: 'round',
                });
        }

        fabricInterface.canvas.add(drawingShape);

    }

    this.updateDrawingShape = function (x,y) {
        if(drawingShape) {
            mouseMoved = shapeStartPos.x !== x && shapeStartPos.y !== y;

            var screenXY = fabricInterface.screenToCanvasSpace(x,y);

            if(shapeType === 'rectangle') {

                if(screenXY.x < shapeStartPos.x) drawingShape.left = screenXY.x;
                if(screenXY.y < shapeStartPos.y) drawingShape.top  = screenXY.y;
                drawingShape.width  = Math.abs(shapeStartPos.x - screenXY.x);
                drawingShape.height = Math.abs(shapeStartPos.y - screenXY.y);

                if(wickEditor.inputHandler.shiftDown()) {
                    drawingShape.height = drawingShape.width;
                }

            } else if(shapeType === 'ellipse') {

                var newRx = Math.abs(drawingShape.__originalLeft - screenXY.x);
                var newRy = Math.abs(drawingShape.__originalTop  - screenXY.y);
                
                var nx = drawingShape.__originalLeft > screenXY.x ? 1 : -1;
                var ny = drawingShape.__originalTop  > screenXY.y ? 1 : -1;

                drawingShape.set({ 
                    left: drawingShape.__originalLeft - newRx/2 * nx,
                    top: drawingShape.__originalTop - newRy/2 * ny,
                    rx: newRx/2, 
                    ry: newRy/2,
                });

                if(wickEditor.inputHandler.shiftDown()) {
                    drawingShape.ry = drawingShape.rx;
                }

            } else if(shapeType === 'line') {

                var w = parseInt(wickEditor.settings.strokeWidth);
                var x = screenXY.x - w/2
                var y = screenXY.y - w/2
                drawingShape.set({ 'x2': x, 'y2': y });

            }
            fabricInterface.canvas.renderAll();
        }
    }

    this.stopDrawingShape = function () {

        fabricInterface.canvas.selection = true;

        if(!drawingShape) return;

        if(!mouseMoved) {
            wickEditor.fabric.canvas.remove(drawingShape)
            drawingShape = null;
            return;
        }

        doneFunc(drawingShape);

        drawingShape = null;
    }

}