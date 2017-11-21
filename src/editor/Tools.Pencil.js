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

Tools.Pencil = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        var canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        var context = canvas.getContext('2d');
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var radius = wickEditor.settings.strokeWidth/2 * wickEditor.fabric.canvas.getZoom();

        context.beginPath();
        context.arc(centerX, centerY, radius+1, 0, 2 * Math.PI, false);
        context.fillStyle = invertColor(wickEditor.settings.strokeColor);
        context.fill();

        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = wickEditor.settings.strokeColor;
        context.fill();

        return 'url(' + canvas.toDataURL() + ') 64 64,default';
    };

    this.getToolbarIcon = function () {
        return "resources/tools/Pencil.svg";
    }

    this.getTooltipName = function () {
        return "Pencil (V)";
    }

    this.setup = function () {

    }

    this.onSelected = function () {
        wickEditor.project.clearSelection();
        wickEditor.paper.needsUpdate = true;
    }

    this.onDeselected = function () {
        if(path) path.remove();
    }

    this.getCanvasMode = function () {
        return 'paper';
    }

    this.paperTool = new paper.Tool();
    var path;
    var totalDelta;
    var lastEvent;

    this.paperTool.onMouseDown = function (event) {
        
    }

    this.paperTool.onMouseDrag = function (event) {
        if (!path) {
            path = new paper.Path({
                //fillColor: wickEditor.settings.fillColor,
                strokeColor: wickEditor.settings.strokeColor,
                strokeCap: wickEditor.settings.strokeCap,
                strokeWidth: wickEditor.settings.strokeWidth,
            });
            //path.add(event.lastPoint);
        }

        if(!totalDelta) {
            totalDelta = event.delta;
        } else {
            totalDelta.x += event.delta.x;
            totalDelta.y += event.delta.y;
        }

        if (totalDelta.length > wickEditor.settings.strokeWidth/wickEditor.fabric.canvas.getZoom()) {

            totalDelta.x = 0;
            totalDelta.y = 0;

            addNextSegment(event)
            lastEvent = event;

        }
    }

    this.paperTool.onMouseUp = function (event) {
        if (path && path.segments.length > 1) {
            //path.closed = true;
            path.add(event.point)
            path.smooth();

            /*var first = path.segments[0].point;
            var last = path.segments[path.segments.length-1].point;
            var dist = first.subtract(last);
            if(dist.length < 7/wickEditor.fabric.canvas.getZoom()) {
                path.closed = true;
            }*/

            if(wickEditor.settings.brushSmoothingAmount > 0) {
                var t = wickEditor.settings.strokeWidth;
                var s = wickEditor.settings.brushSmoothingAmount/100;
                var z = wickEditor.fabric.canvas.getZoom();
                path.simplify(t / z * s);
            }

            path.join(path, 10/wickEditor.fabric.canvas.getZoom())

            //path = path.unite(new paper.Path())


            path.remove();

            var group = new paper.Group({insert:false});
            group.addChild(path);

            var svgString = group.exportSVG({asString:true});
            var pathWickObject = WickObject.createPathObject(svgString);
            pathWickObject.x = group.position.x;
            pathWickObject.y = group.position.y;
            pathWickObject.width = 1;
            pathWickObject.height = 1;

            wickEditor.paper.pathRoutines.refreshPathData(pathWickObject);

            wickEditor.actionHandler.doAction('addObjects', {
                wickObjects: [pathWickObject],
                dontSelectObjects: true,
            });

            path = null;
        }
    }

    function addNextSegment (event) {
        path.add(event.point)
        path.smooth();
    }

}