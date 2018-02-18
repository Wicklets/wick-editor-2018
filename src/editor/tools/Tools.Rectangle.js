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
    
    var tempGroup;

    var topLeft;
    var bottomRight;

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

    this.onSelected = function () {
        wickEditor.inspector.openToolSettings('rectangle');
        wickEditor.project.clearSelection();
        wickEditor.canvas.getInteractiveCanvas().needsUpdate = true;
    }

    this.onDeselected = function () {
        if(tempGroup) tempGroup.remove();
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

        var rectangle = new paper.Rectangle(
            new paper.Point(topLeft.x, topLeft.y), 
            new paper.Point(bottomRight.x, bottomRight.y));

        var roundedRect = new paper.Path.RoundRectangle(rectangle, wickEditor.settings.rectangleCornerRadius);
        roundedRect.fillColor = wickEditor.settings.fillColor;
        roundedRect.strokeColor = wickEditor.settings.strokeColor;
        roundedRect.strokeWidth = wickEditor.settings.strokeWidth;
        roundedRect.strokeJoin = wickEditor.settings.strokeJoin;
        roundedRect.strokeCap = wickEditor.settings.strokeCap;

        tempGroup = new paper.Group();
        tempGroup.addChild(roundedRect);
    }

    this.paperTool.onMouseUp = function (event) {
        if(!bottomRight)
            return;

        var svgString = tempGroup.exportSVG({asString:true});
        tempGroup.remove();
        var pathWickObject = WickObject.createPathObject(svgString);
        pathWickObject.x = topLeft.x+(bottomRight.x-topLeft.x)/2;
        pathWickObject.y = topLeft.y+(bottomRight.y-topLeft.y)/2;
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