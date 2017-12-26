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

Tools.Pen = function (wickEditor) {

    var that = this;

    var path;
    var segment;

    this.getCursorImage = function () {
        return "auto"
    };

    this.getToolbarIcon = function () {
        return "resources/path.png";
    }

    this.getTooltipName = function () {
        return "Pen (O)";
    }

    this.setup = function () {

    }

    this.onSelected = function () {
        wickEditor.canvas.getInteractiveCanvas().needsUpdate = true;
    }

    this.onDeselected = function () {
        if(path) {
            createWickObject();
        }
    }

    this.paperTool = new paper.Tool();

    this.paperTool.onMouseMove = function (event) {
        wickEditor.tools.vectorcursor.paperTool.onMouseMove(event)

        if(path) path.selected = true;
    }

    this.paperTool.onMouseDown = function (event) {

        hitResult = wickEditor.canvas.getInteractiveCanvas().getItemAtPoint(event.point);

        if(path && !path.closed) {
            var lastSegment = path.segments[path.segments.length-1];
            lastSegment.handleOut.x = -lastSegment.handleIn.x
            lastSegment.handleOut.y = -lastSegment.handleIn.y

            if(hitResult && hitResult.segment === path.segments[0]) {
                path.closePath();
                segment = path.segments[0];
                segment.selected = true;
            } else if (hitResult && hitResult.segment) {
                segment = hitResult.segment;
                wickEditor.tools.vectorcursor.paperTool.onMouseDown(event)
            } else if(!hitResult) {
                segment = path.add(event.point);
                segment.selected = true;
            }
        } else {
            if(!hitResult) {
                path = new paper.Path();
                path.fillColor = wickEditor.settings.fillColor;
                path.strokeColor = wickEditor.settings.strokeColor;
                path.strokeWidth = wickEditor.settings.strokeWidth;
                path.strokeJoin = wickEditor.settings.strokeJoin;
                path.strokeCap = wickEditor.settings.strokeCap;
                path.add(event.point);
                path.selected = true;
            } else {
                wickEditor.tools.vectorcursor.paperTool.onMouseDown(event)
            }
        }

        /*hitResult = wickEditor.canvas.getInteractiveCanvas().getItemAtPoint(event.point);
        
        if(drawingPath) {
            var segments = drawingPath.segments;
            var firstSegment = segments[0];

            var lastSegment = segments[segments.length-1];
            lastSegment.handleOut.x = -lastSegment.handleIn.x
            lastSegment.handleOut.y = -lastSegment.handleIn.y

            if(hitResult && hitResult.segment === firstSegment) {
                drawingPath.closePath();
                currentSegment = segments[0];
                drawingPath = null;
                currentSegment = null;
            } else if(!hitResult) {
                currentSegment = drawingPath.add(event.point);
                currentSegment.selected = true;
            } else {
                wickEditor.tools.vectorcursor.paperTool.onMouseDown(event)
            }
        } else {
            if(!hitResult) {
                drawingPath = new paper.Path();
                drawingPath.fillColor = wickEditor.settings.fillColor;
                drawingPath.strokeColor = wickEditor.settings.strokeColor;
                drawingPath.strokeWidth = wickEditor.settings.strokeWidth;
                drawingPath.strokeJoin = wickEditor.settings.strokeJoin;
                drawingPath.strokeCap = wickEditor.settings.strokeCap;
                drawingPath.add(event.point);
            } else {
                wickEditor.tools.vectorcursor.paperTool.onMouseDown(event)
            }
        }*/

    }

    this.paperTool.onMouseDrag = function(event) {
        if(segment && (segment === path.segments[path.segments.length-1] || path.closed)) {
            var delta = event.delta.clone();
            segment.handleIn.x -= delta.x;
            segment.handleIn.y -= delta.y;
            segment.handleOut.x += delta.x;
            segment.handleOut.y += delta.y;
        } else {
            wickEditor.tools.vectorcursor.paperTool.onMouseDrag(event)
        }
    }

    this.paperTool.onMouseUp = function (event) {
        if(path && path.closed) {
            createWickObject();
        }
    }

    function createWickObject () {
        var svgString = path.exportSVG({asString:true});
        var pathWickObject = WickObject.createPathObject(svgString);

        pathWickObject.x = path.position.x;
        pathWickObject.y = path.position.y;
        pathWickObject.width = path.bounds._width;
        pathWickObject.height = path.bounds._height;
        pathWickObject.svgX = path.bounds._x;
        pathWickObject.svgY = path.bounds._y;

        wickEditor.actionHandler.doAction('addObjects', {
            wickObjects: [pathWickObject],
            dontSelectObjects: true,
            dontSync: true
        });

        path = null;
        segment = null;
    }

}