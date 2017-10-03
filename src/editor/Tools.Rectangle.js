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

    var drawingRect;

    var tempGroup;

    this.getCursorImage = function () {
        return "crosshair"
    };

    this.getToolbarIcon = function () {
        return "resources/tools/Square.svg";
    }

    this.getTooltipName = function () {
        return "Rectangle (R)";
    }

    this.setup = function () {

    }

    this.getCanvasMode = function () {
        return 'paper';
    }

    this.onSelected = function () {
        wickEditor.project.clearSelection();
    }

    this.onDeselected = function () {
        tempGroup.remove();
    }

    this.paperTool = new paper.Tool();

    this.paperTool.onMouseDown = function (event) {
        var newPath = new paper.Path({insert:false});
        newPath.fillColor = wickEditor.settings.fillColor;
        newPath.strokeColor = wickEditor.settings.strokeColor;
        newPath.strokeWidth = wickEditor.settings.strokeWidth;
        newPath.strokeJoin = 'round';
        newPath.strokeCap = 'round';
        newPath.add(event.point);
        newPath.add(event.point);
        newPath.add(event.point);
        newPath.add(event.point);

        tempGroup = new paper.Group();
        tempGroup.addChild(newPath);

        drawingRect = newPath;
    }

    this.paperTool.onMouseDrag = function (event) {
        drawingRect.segments[1].point.x = event.point.x;
        drawingRect.segments[2].point = event.point;
        drawingRect.segments[3].point.y = event.point.y;
        drawingRect.closed = true;
    }

    this.paperTool.onMouseUp = function (event) {
        tempGroup.remove();

        var group = tempGroup.clone({insert:false});

        var svgString = group.exportSVG({asString:true});
        var pathWickObject = WickObject.createPathObject(svgString);
        pathWickObject.x = (drawingRect.segments[0].point.x+drawingRect.segments[2].point.x)/2 + 0.5;
        pathWickObject.y = (drawingRect.segments[0].point.y+drawingRect.segments[2].point.y)/2 + 0.5;
        pathWickObject.width = 1;
        pathWickObject.height = 1;

        wickEditor.paper.pathRoutines.refreshPathData(pathWickObject);

        wickEditor.actionHandler.doAction('addObjects', {
            wickObjects: [pathWickObject],
            dontSelectObjects: true,
        });
    }

}