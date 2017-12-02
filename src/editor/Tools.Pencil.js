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
        return 'url(resources/cursors/pencil.png) 0 16,default';
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
        wickEditor.canvas.getPaperCanvas().needsUpdate = true;
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
        if (!path) {
            path = new paper.Path({
                //fillColor: wickEditor.settings.fillColor,
                strokeColor: wickEditor.settings.strokeColor,
                strokeCap: wickEditor.settings.strokeCap,
                strokeWidth: wickEditor.settings.strokeWidth,
            });
            //path.add(event.lastPoint);
        }

        path.add(event.point);
    }

    this.paperTool.onMouseDrag = function (event) {

        if(!totalDelta) {
            totalDelta = event.delta;
        } else {
            totalDelta.x += event.delta.x;
            totalDelta.y += event.delta.y;
        }

        if (totalDelta.length > 2/wickEditor.canvas.getFabricCanvas().canvas.getZoom()) {

            totalDelta.x = 0;
            totalDelta.y = 0;

            path.add(event.point)
            path.smooth();
            lastEvent = event;

        }
    }

    this.paperTool.onMouseUp = function (event) {
        if (path) {

            path.add(event.point)
            
            if(path.segments.length > 2) {
                path.smooth();

                if(wickEditor.settings.brushSmoothingAmount > 0) {
                    var t = wickEditor.settings.strokeWidth;
                    var s = wickEditor.settings.brushSmoothingAmount/100;
                    var z = wickEditor.canvas.getFabricCanvas().canvas.getZoom();
                    path.simplify(t / z * s);
                }

                path.join(path, 10/wickEditor.canvas.getFabricCanvas().canvas.getZoom())
            }

            path.remove();

            var group = new paper.Group({insert:false});
            group.addChild(path);

            var svgString = group.exportSVG({asString:true});
            var pathWickObject = WickObject.createPathObject(svgString);
            pathWickObject.x = group.position.x;
            pathWickObject.y = group.position.y;
            pathWickObject.width = 1;
            pathWickObject.height = 1;

            wickEditor.canvas.getPaperCanvas().pathRoutines.refreshPathData(pathWickObject);

            wickEditor.actionHandler.doAction('addObjects', {
                wickObjects: [pathWickObject],
                dontSelectObjects: true,
            });

            path = null;
        }
    }

}