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

    var drawingLine;
    var tempGroup;

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

    }

    this.onSelected = function () {
        wickEditor.inspector.openToolSettings('line');
        wickEditor.canvas.getInteractiveCanvas().needsUpdate = true;
        wickEditor.project.clearSelection();
    }

    this.onDeselected = function () {
        if(tempGroup) tempGroup.remove();
    }

    this.paperTool = new paper.Tool();

    this.paperTool.onMouseDown = function (event) {
        var newPath = new paper.Path({insert:false});
        newPath.strokeColor = wickEditor.settings.strokeColor;
        newPath.strokeWidth = wickEditor.settings.strokeWidth;
        newPath.strokeJoin = wickEditor.settings.strokeJoin;
        newPath.strokeCap = wickEditor.settings.strokeCap;
        newPath.add(event.point);
        newPath.add(event.point);

        tempGroup = new paper.Group();
        tempGroup.addChild(newPath);

        drawingLine = newPath;
    }

    this.paperTool.onMouseDrag = function (event) {
        drawingLine.segments[1].point = event.point;
    }

    this.paperTool.onMouseUp = function (event) {
        tempGroup.remove();

        var group = tempGroup.clone({insert:false});

        var svgString = group.exportSVG({asString:true});
        var pathWickObject = WickObject.createPathObject(svgString);
        pathWickObject.x = (drawingLine.segments[0].point.x + drawingLine.segments[1].point.x)/2;
        pathWickObject.y = (drawingLine.segments[0].point.y + drawingLine.segments[1].point.y)/2;
        pathWickObject.width = drawingLine.bounds._width;
        pathWickObject.height = drawingLine.bounds._height;
        pathWickObject.svgX = drawingLine.bounds._x;
        pathWickObject.svgY = drawingLine.bounds._y;

        wickEditor.actionHandler.doAction('addObjects', {
            wickObjects: [pathWickObject],
            dontSelectObjects: true,
        });
    }

}