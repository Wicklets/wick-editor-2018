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

Tools.Paintbrush = function (wickEditor) {

    var self = this;

    this.getCursorImage = function () {
        var canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        var context = canvas.getContext('2d');
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var radius = wickEditor.settings.brushThickness/2;

        context.beginPath();
        context.arc(centerX, centerY, radius+1, 0, 2 * Math.PI, false);
        context.fillStyle = invertColor(wickEditor.settings.fillColor);
        context.fill();

        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = wickEditor.settings.fillColor;
        context.fill();

        return 'url(' + canvas.toDataURL() + ') 64 64,default';
    };

    this.getToolbarIcon = function () {
        return "resources/tools/Paintbrush.svg";
    }

    this.getTooltipName = function () {
        return "Brush (B)";
    }

    this.setup = function () {

    }

    this.onSelected = function () {
        wickEditor.inspector.openToolSettings('paintbrush');
        wickEditor.project.clearSelection();
        wickEditor.canvas.getInteractiveCanvas().needsUpdate = true;
    }

    this.onDeselected = function () {
        if(path) path.remove();
    }

    this.paperTool = new paper.Tool();
    var path;
    var totalDelta;
    var lastEvent;

    var BRUSH_MIN_DISTANCE = 0.5;

    this.paperTool.onMouseDown = function (event) {
        
    }

    this.paperTool.onMouseDrag = function (event) {
        lastEvent = {
            delta: event.delta,
            middlePoint: event.middlePoint,
        }

        if (!path) {
            path = new paper.Path({
                fillColor: wickEditor.settings.fillColor,
                //strokeColor: '#000',
            });
            //path.add(event.lastPoint);
        }

        if(!totalDelta) {
            totalDelta = event.delta;
        } else {
            totalDelta.x += event.delta.x;
            totalDelta.y += event.delta.y;
        }

        if (totalDelta.length > wickEditor.settings.brushThickness*BRUSH_MIN_DISTANCE/wickEditor.canvas.getZoom()) {

            totalDelta.x = 0;
            totalDelta.y = 0;

            addNextSegment(event)

        }
    }

    this.paperTool.onMouseUp = function (event) {
        if (path) {
            path.closed = true;
            path.smooth();
            if(wickEditor.settings.brushSmoothingAmount > 0) {
                var t = wickEditor.settings.brushThickness;
                var s = wickEditor.settings.brushSmoothingAmount/100;
                var z = wickEditor.canvas.getZoom();
                path.simplify(t / z * s);
            }
            path = path.unite(new paper.Path())
            path.remove();

            var group = new paper.Group({insert:false});
            group.addChild(path);

            var svgString = group.exportSVG({asString:true});
            pathWickObject = WickObject.createPathObject(svgString);
            pathWickObject.x = group.position.x;
            pathWickObject.y = group.position.y;
            pathWickObject.width = group.bounds._width;
            pathWickObject.height = group.bounds._height;
            pathWickObject.svgX = group.bounds._x;
            pathWickObject.svgY = group.bounds._y;

            wickEditor.actionHandler.doAction('addObjects', {
                wickObjects: [pathWickObject],
                dontSelectObjects: true,
            });

            path = null;
        } 
    }

    var addNextSegment = function (event) {
        var thickness = event.delta.length;
        thickness /= wickEditor.settings.brushThickness/2;
        thickness *= wickEditor.canvas.getZoom();
        
        var penPressure = wickEditor.inputHandler.getPenPressure();

        var step = event.delta.divide(thickness).multiply(penPressure);
        step.angle = step.angle + 90;

        var top = event.middlePoint.add(step);
        var bottom = event.middlePoint.subtract(step);

        path.add(top);
        path.insert(0, bottom);
        path.smooth();
    }

    // https://stackoverflow.com/questions/14224535/scaling-between-two-number-ranges
    function convertRange( value, r1, r2 ) { 
        return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
    }

    function getBrushSmoothFactor () {
        var bi = 100-wickEditor.settings.brushSmoothing;
        var smoothFactor = convertRange(bi, [0,100], [0.3,1]);
        return smoothFactor;
    }
}