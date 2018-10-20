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
        wickEditor.inspector.openToolSettings('pencil');
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

    this.paperTool.onMouseDown = function (event) {
        if(wickEditor.settings.strokeWidth === 0)
            wickEditor.settings.setValue('strokeWidth', 1);

        if (!path) {
            path = new paper.Path({
                //fillColor: wickEditor.settings.fillColor,
                strokeColor: wickEditor.settings.strokeColor,
                strokeCap: 'round',
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

        if (totalDelta.length > (2+wickEditor.settings.pencilSmoothing)/wickEditor.canvas.getZoom()) {

            totalDelta.x = 0;
            totalDelta.y = 0;

            path.add(event.point)
            path.smooth();
            lastEvent = event;

            //path.simplify(1);

        }
    }

    this.paperTool.onMouseUp = function (event) {
        if (path) {

            path.add(event.point)
            
            if(path.segments.length > 2) {
                path.smooth();

                /*if(wickEditor.settings.pencilSmoothing > 0) {
                    var t = wickEditor.settings.strokeWidth;
                    var s = wickEditor.settings.pencilSmoothing/100*10;
                    var z = wickEditor.canvas.getZoom();
                    path.simplify(t / z * s);
                }*/

                path.join(path, 5/wickEditor.canvas.getZoom())
            }

            path.remove();

            path.strokeCap = 'round'
            path.strokeJoin = 'round'

            var group = new paper.Group({insert:false});
            group.addChild(path);

            var svgString = group.exportSVG({asString:true});
            var pathWickObject = WickObject.createPathObject(svgString);
            pathWickObject.x = group.position.x;
            pathWickObject.y = group.position.y;
            pathWickObject.width = group.bounds._width;
            pathWickObject.height = group.bounds._height;
            pathWickObject.svgX = group.bounds._x;
            pathWickObject.svgY = group.bounds._y;

            //wickEditor.canvas.getInteractiveCanvas().pathRoutines.refreshPathData(pathWickObject);

            wickEditor.actionHandler.doAction('addObjects', {
                wickObjects: [pathWickObject],
                dontSelectObjects: true,
            });

            path = null;
        }
    }

}