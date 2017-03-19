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

    fabricInterface.canvas.on('mouse:move', function (e) {
        that.updateDrawingShape(e.e.pageX, e.e.pageY);
    });

    fabricInterface.canvas.on('mouse:up', function (e) {
        that.stopDrawingShape();
    });

    this.startDrawingShape = function (shapeType, x, y, callback, args) {

        doneFunc = callback;

        fabricInterface.canvas.selection = false;

        var screenXY = fabricInterface.screenToCanvasSpace(x,y);

        shapeStartPos = {x:screenXY.x,y:screenXY.y};

        if(shapeType === 'rectangle') {
            drawingShape = new fabric.Rect({
                top : screenXY.y,
                left : screenXY.x,
                width : 1,
                height : 1,
                fill : wickEditor.tools.paintbrush.color
            });
        } else if (shapeType === 'ellipse') {
            drawingShape = new fabric.Ellipse({
                originX: 'center',
                originY: 'center',
                top : screenXY.y,
                left : screenXY.x,
                //width : 1,
                //height : 1,
                rx: 3,
                ry: 3,
                fill : wickEditor.tools.paintbrush.color
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
                var newRx = Math.abs(drawingShape.left - screenXY.x);
                var newRy = Math.abs(drawingShape.top  - screenXY.y);
                drawingShape.set({ rx: newRx, ry: newRy });
            }
            fabricInterface.canvas.renderAll();
        }
    }

    this.stopDrawingShape = function () {

        fabricInterface.canvas.selection = true;

        if(!drawingShape) return;
        if(drawingShape.width <= 0 || drawingShape.height <= 0) {
            drawingShape.remove()
            drawingShape = null;
            return;
        }

        doneFunc(drawingShape);

        drawingShape = null;
    }

}