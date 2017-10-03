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

Tools.Ellipse = function (wickEditor) {

    var that = this;
    var fabricInterface = wickEditor.fabric;

    var drawingEllipse;
    var topLeft;
    var bottomRight;

    var tempGroup;

    this.getCursorImage = function () {
        return "crosshair"
    };

    this.getToolbarIcon = function () {
        return "resources/tools/Circle.svg";
    }

    this.getTooltipName = function () {
        return "Ellipse (S)";
    }

    this.getCanvasMode = function () {
        return 'paper';
    }

    this.onDeselected = function () {
        tempGroup.remove();
    }

    this.setup = function () {
        
    }

    this.paperTool = new paper.Tool();

    this.paperTool.onMouseDown = function (event) {
        var newPath = new paper.Path.Ellipse({
            point: [event.point.x, event.point.y],
            size: [1, 1],
            fillColor: 'black'
        });
        newPath.fillColor = wickEditor.settings.fillColor;
        newPath.strokeColor = wickEditor.settings.strokeColor;
        newPath.strokeWidth = wickEditor.settings.strokeWidth;
        newPath.strokeJoin = 'round';
        newPath.strokeCap = 'round';
        drawingEllipse = newPath;

        tempGroup = new paper.Group();
        tempGroup.addChild(newPath);

        topLeft = event.point;
    }

    this.paperTool.onMouseDrag = function (event) {
        bottomRight = event.point;

        drawingEllipse.segments[1].point.x = (topLeft.x + bottomRight.x)/2;

        drawingEllipse.segments[2].point.x = bottomRight.x;
        drawingEllipse.segments[2].point.y = (topLeft.y + bottomRight.y)/2;

        drawingEllipse.segments[3].point.x = (topLeft.x + bottomRight.x)/2;
        drawingEllipse.segments[3].point.y = bottomRight.y;

        drawingEllipse.segments[0].point.x = topLeft.x;
        drawingEllipse.segments[0].point.y = (topLeft.y + bottomRight.y)/2;

        var w = (bottomRight.x-topLeft.x)/3.62132028;
        var h = (bottomRight.y-topLeft.y)/3.62132028;
        drawingEllipse.segments[0].handleIn.x = 0;
        drawingEllipse.segments[0].handleIn.y = h;
        drawingEllipse.segments[0].handleOut.x = 0;
        drawingEllipse.segments[0].handleOut.y = -h;

        drawingEllipse.segments[1].handleIn.x = -w;
        drawingEllipse.segments[1].handleIn.y = 0;
        drawingEllipse.segments[1].handleOut.x = w;
        drawingEllipse.segments[1].handleOut.y = 0;

        drawingEllipse.segments[2].handleIn.x = 0;
        drawingEllipse.segments[2].handleIn.y = -h;
        drawingEllipse.segments[2].handleOut.x = 0;
        drawingEllipse.segments[2].handleOut.y = h;

        drawingEllipse.segments[3].handleIn.x = w;
        drawingEllipse.segments[3].handleIn.y = 0;
        drawingEllipse.segments[3].handleOut.x = -w;
        drawingEllipse.segments[3].handleOut.y = 0;

        drawingEllipse.closed = true;
    }

    this.paperTool.onMouseUp = function (event) {
        tempGroup.remove();

        var ellipse = new paper.Path.Ellipse({
            point: [0, 0],
            size: [bottomRight.x-topLeft.x, bottomRight.y-topLeft.y],
            fillColor: 'black'
        });
        ellipse.fillColor = wickEditor.settings.fillColor;
        ellipse.strokeColor = wickEditor.settings.strokeColor;
        ellipse.strokeWidth = wickEditor.settings.strokeWidth;
        ellipse.strokeJoin = 'round';
        ellipse.strokeCap = 'round';

        var ellipseSVG = new paper.Group({insert:false});
        ellipseSVG.addChild(ellipse);

        var svgString = ellipseSVG.exportSVG({asString:true});
        var pathWickObject = WickObject.createPathObject(svgString);
        pathWickObject.x = (bottomRight.x+topLeft.x)/2;
        pathWickObject.y = (bottomRight.y+topLeft.y)/2;
        pathWickObject.width = 1;
        pathWickObject.height = 1;

        wickEditor.paper.pathRoutines.refreshPathData(pathWickObject);

        wickEditor.actionHandler.doAction('addObjects', {
            wickObjects: [pathWickObject]
        });
    }

}