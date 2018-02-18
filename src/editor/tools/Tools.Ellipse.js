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

    this.onSelected = function () {
        wickEditor.inspector.openToolSettings('ellipse');
        wickEditor.project.clearSelection();
        wickEditor.canvas.getInteractiveCanvas().needsUpdate = true;
    }

    this.onDeselected = function () {
        if(tempGroup) tempGroup.remove();
    }

    this.setup = function () {
        
    }

    this.paperTool = new paper.Tool();

    this.paperTool.onMouseDown = function (event) {
        tempGroup = new paper.Group();
        topLeft = event.point;
        bottomRight = null;
    }

    this.paperTool.onMouseDrag = function (event) {
        bottomRight = event.point;

        tempGroup.remove();

        var newPath = new paper.Path.Ellipse({
            point: [topLeft.x, topLeft.y],
            size: [bottomRight.x-topLeft.x, bottomRight.y-topLeft.y],
        });
        newPath.fillColor = wickEditor.settings.fillColor;
        newPath.strokeColor = wickEditor.settings.strokeColor;
        newPath.strokeWidth = wickEditor.settings.strokeWidth;
        newPath.strokeJoin = wickEditor.settings.strokeJoin;
        newPath.strokeCap = wickEditor.settings.strokeCap;
        drawingEllipse = newPath;

        tempGroup = new paper.Group();
        tempGroup.addChild(newPath);
    }

    this.paperTool.onMouseUp = function (event) {

        if(!bottomRight)
            return;

        var svgString = tempGroup.exportSVG({asString:true});
        tempGroup.remove();
        var pathWickObject = WickObject.createPathObject(svgString);
        pathWickObject.x = (bottomRight.x+topLeft.x)/2;
        pathWickObject.y = (bottomRight.y+topLeft.y)/2;
        pathWickObject.width = tempGroup.bounds._width;
        pathWickObject.height = tempGroup.bounds._height;
        pathWickObject.svgX = tempGroup.bounds._x;
        pathWickObject.svgY = tempGroup.bounds._y;

        //wickEditor.canvas.getInteractiveCanvas().pathRoutines.refreshPathData(pathWickObject);

        wickEditor.actionHandler.doAction('addObjects', {
            wickObjects: [pathWickObject],
            dontSelectObjects: true,
        });
    }

}