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

Tools.Line = function (wickEditor) {

    var that = this;
    var fabricInterface = wickEditor.fabric;

    this.getCursorImage = function () {
        return "crosshair"
    };

    this.getToolbarIcon = function () {
        return "resources/tools/Line.svg";
    }

    this.getTooltipName = function () {
        return "Line (L)";
    }

    this.setup = function () {
        fabricInterface.canvas.on('mouse:down', function (e) {
            if(!(wickEditor.currentTool instanceof Tools.Line) || e.e.buttons !== 1) return;

            fabricInterface.shapeDrawer.startDrawingShape('line', e.e.offsetX, e.e.offsetY, that.createWickObjectFromShape);
        });

    }

    this.createWickObjectFromShape = function (drawingShape) {
        var origX = drawingShape.left+drawingShape.width /2+drawingShape.strokeWidth/2;
        var origY = drawingShape.top +drawingShape.height/2+drawingShape.strokeWidth/2;
        drawingShape.left = 0;
        drawingShape.top = 0;
        drawingShape.setCoords();
        //var svg = '<rect fill="'+drawingShape.fill+'" rx="'+drawingShape.rx+'" ry="'+drawingShape.ry+'" width="'+drawingShape.width+'" height="'+drawingShape.height+'" style="" />'
        var svg = '<line stroke-linecap="'+drawingShape.strokeLineCap+'" stroke-linejoin="'+drawingShape.strokeLineJoin+'" fill="rgba(0,0,0,0)" x1="'+drawingShape.x1+'" y1="'+drawingShape.y1+'" x2="'+drawingShape.x2+'" y2="'+drawingShape.y2+'" stroke="'+drawingShape.stroke+'" stroke-width="'+drawingShape.strokeWidth+'" />'
        //console.log(svg)
        var svgString = '<svg id="svg" version="1.1" xmlns="http://www.w3.org/2000/svg">'+svg+'</svg>';

        drawingShape.remove()
        
        var pathWickObject = WickObject.createPathObject(svgString);
        pathWickObject.x = origX;
        pathWickObject.y = origY;
        //console.log(drawingShape)
        pathWickObject.width = drawingShape.width;
        pathWickObject.height = drawingShape.height;
        pathWickObject.rotation = drawingShape.angle;

        wickEditor.paper.pathRoutines.refreshPathData(pathWickObject);

        wickEditor.actionHandler.doAction('addObjects', {
            wickObjects: [pathWickObject],
            dontSelectObjects: true
        });
    }

}