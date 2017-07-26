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

if(!window.Tools) Tools = {};

Tools.Rectangle = function (wickEditor) {

    var that = this;
    var fabricInterface = wickEditor.fabric;

    this.getCursorImage = function () {
        return "crosshair"
    };

    this.getToolbarIcon = function () {
        return "resources/tools/Square.svg";
    }

    this.getTooltipName = function () {
        return "Rectangle";
    }

    this.setup = function () {
        fabricInterface.canvas.on('mouse:down', function (e) {
            if(!(wickEditor.currentTool instanceof Tools.Rectangle) || e.e.buttons !== 1) return;

            fabricInterface.shapeDrawer.startDrawingShape('rectangle', e.e.offsetX, e.e.offsetY, that.createWickObjectFromShape);
        });
    }

    this.createWickObjectFromShape = function (drawingShape) {
        var origX = drawingShape.left+drawingShape.width /2;
        var origY = drawingShape.top +drawingShape.height/2;
        drawingShape.left = 0;
        drawingShape.top = 0;
        drawingShape.setCoords();
        if(drawingShape.strokeWidth !== 0) {
            var svg = '<rect stroke-linecap="'+drawingShape.strokeLineCap+'" stroke-linejoin="'+drawingShape.strokeLineJoin+'" fill="'+drawingShape.fill+'" stroke="'+drawingShape.stroke+'" stroke-width="'+drawingShape.strokeWidth+'" width="'+drawingShape.width+'" height="'+drawingShape.height+'" rx="'+drawingShape.rx+'" ry="'+drawingShape.ry+'" style="" />'
        } else {
            var svg = '<rect stroke-linecap="'+drawingShape.strokeLineCap+'" stroke-linejoin="'+drawingShape.strokeLineJoin+'" fill="'+drawingShape.fill+'" width="'+drawingShape.width+'" height="'+drawingShape.height+'" rx="'+drawingShape.rx+'" ry="'+drawingShape.ry+'" style="" />'
        }
        var svgString = '<svg id="svg" version="1.1" xmlns="http://www.w3.org/2000/svg">'+svg+'</svg>';

        drawingShape.remove()
        
        var pathWickObject = WickObject.createPathObject(svgString);
        pathWickObject.x = origX + drawingShape.strokeWidth/2;
        pathWickObject.y = origY + drawingShape.strokeWidth/2;
        pathWickObject.width = drawingShape.width;
        pathWickObject.height = drawingShape.height;

        wickEditor.actionHandler.doAction('addObjects', {
            wickObjects: [pathWickObject],
            dontSelectObjects: true
        });

        wickEditor.paper.pathRoutines.refreshPathData(pathWickObject);
    }

}