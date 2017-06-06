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

Tools.Polygon = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        return "crosshair"
    };

    this.getToolbarIcon = function () {
        return "resources/tools/Polygon.png";
    }

    this.getTooltipName = function () {
        return "Polygon";
    }

    this.setup = function () {

    }

    this.paperTool = new paper.Tool();

    var currentSegment;
    var drawingPath;

    this.paperTool.onMouseDown = function(event) {
        if(!drawingPath) {
            var newPath = new paper.Path({insert:false});
            newPath.fillColor = wickEditor.settings.fillColor;
            newPath.strokeColor = wickEditor.settings.strokeColor;
            newPath.strokeWidth = wickEditor.settings.strokeWidth;
            newPath.selected = true;
            newPath.add(event.point);
            //currentSegment = path.add(event.point);
            //currentSegment.selected = true;

            var group = new paper.Group({insert:false});
            group.addChild(newPath);

            var svgString = group.exportSVG({asString:true});
            var pathWickObject = WickObject.createPathObject(svgString);
            pathWickObject.x = event.point.x;
            pathWickObject.y = event.point.y;
            pathWickObject.width = 1;
            pathWickObject.height = 1;

            wickEditor.paper.pathRoutines.refreshPathData(pathWickObject);

            wickEditor.actionHandler.doAction('addObjects', {
                wickObjects: [pathWickObject]
            });

            drawingPath = pathWickObject;
            currentSegment = pathWickObject.paper.children[0].segments[0];
            currentSegment.selected = true;
        } else {
            //currentSegment.selected = false;
            //currentSegment = path.add(event.point);
            //currentSegment.selected = true;

            /*lastSegment = currentSegment;
            lastSegment.handleOut.x = -lastSegment.handleIn.x
            lastSegment.handleOut.y = -lastSegment.handleIn.y
            lastSegment.selected = false;*/

            var path = drawingPath.paper.children[0];
            var segments = path.segments;
            var lastSegment = segments[segments.length-1];
            lastSegment.handleOut.x = -lastSegment.handleIn.x
            lastSegment.handleOut.y = -lastSegment.handleIn.y
            var hitResult = paper.project.hitTest(event.point, {
                segments: true,
                tolerance: 5 / wickEditor.fabric.getCanvasTransform().zoom
            });
            if(hitResult && hitResult.type === 'segment') {
                path.closePath();
                currentSegment = path.segments[0];
            } else {
                currentSegment = path.add(event.point);
                currentSegment.selected = true;
            }
        }
    }

    this.paperTool.onMouseMove = function(event) {
        wickEditor.paper.updateCursor(event);
    }

    this.paperTool.onMouseDrag = function(event) {
        var delta = event.delta.clone();
        currentSegment.handleIn.x -= delta.x;
        currentSegment.handleIn.y -= delta.y;
        currentSegment.handleOut.x += delta.x;
        currentSegment.handleOut.y += delta.y;
    }

    this.paperTool.onMouseUp = function (event) {
        var path = drawingPath.paper.children[0];

        wickEditor.paper.refreshSVGWickObject(path);

        if(path.closed) {
            drawingPath = null;
            currentSegment = null;
        }
    }

}