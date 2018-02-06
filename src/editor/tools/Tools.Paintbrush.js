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

    var that = this;

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
        if (!path) {
            path = new paper.Path({
                strokeColor: wickEditor.settings.fillColor,
                strokeCap: 'round',
                strokeWidth: wickEditor.settings.brushThickness/wickEditor.canvas.getZoom(),
            });
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

        if (totalDelta.length > 10/wickEditor.canvas.getZoom()) {

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

                if(wickEditor.settings.brushSmoothing > 0) {
                    var t = wickEditor.settings.strokeWidth;
                    var s = wickEditor.settings.brushSmoothing/100*10;
                    var z = wickEditor.canvas.getZoom();
                    path.simplify(t / z * s);
                }

                path.join(path, 10/wickEditor.canvas.getZoom())
            }

            path.remove();

            path.strokeCap = 'round';
            path.strokeJoin = 'round';

            try{
                var offset = path.strokeWidth/2;
                var outerPath = OffsetUtils.offsetPath(path, offset, true);
                var innerPath = OffsetUtils.offsetPath(path, -offset, true);
                path = OffsetUtils.joinOffsets(outerPath.clone(), innerPath.clone(), path, offset);
                path = path.unite();
                path.fillColor = wickEditor.settings.fillColor;

                if(path.segments && path.segments.length < 1){
                    console.error('offset.js generated a bad SVG. Ignoring current brush stroke')
                    return;
                }
            }catch(e){
                path = null;
                return;
            }

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