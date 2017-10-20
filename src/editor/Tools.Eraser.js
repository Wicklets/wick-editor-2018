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

Tools.Eraser = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        var canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        var context = canvas.getContext('2d');
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var radius = wickEditor.settings.brushThickness/2;// * wickEditor.fabric.canvas.getZoom();

        context.beginPath();
        context.arc(centerX, centerY, radius+1, 0, 2 * Math.PI, false);
        context.fillStyle = "#000000"
        context.fill();

        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = "#FFFFFF";
        context.fill();

        return 'url(' + canvas.toDataURL() + ') 64 64,default';
    }

    this.getToolbarIcon = function () {
        return "resources/tools/Erase.svg";
    }

    this.getTooltipName = function () {
        return "Eraser (E)";
    }

    this.setup = function () {
        
    }

    this.getCanvasMode = function () {
        return 'paper';
    }

    this.onDeselected = function () {
        if(path) path.remove();
    }

    this.paperTool = new paper.Tool();
    var path;
    var totalDelta;
    var lastEvent;

    this.paperTool.onMouseDown = function(event) {
        
    }

    this.paperTool.onMouseDrag = function(event) {
        lastEvent = {
            delta: event.delta,
            middlePoint: event.middlePoint,
        }

        if (!path) {
            path = new paper.Path({
                fillColor: '#FFFFFF',
            });
        }

        if(!totalDelta) {
            totalDelta = event.delta;
        } else {
            totalDelta.x += event.delta.x;
            totalDelta.y += event.delta.y;
        }

        if (totalDelta.length > wickEditor.settings.brushThickness/2/wickEditor.fabric.canvas.getZoom()) {

            totalDelta.x = 0;
            totalDelta.y = 0;

            var thickness = event.delta.length;
            thickness /= wickEditor.settings.brushThickness/2;
            thickness *= wickEditor.fabric.canvas.getZoom();
            
            var penPressure = wickEditor.inputHandler.getPenPressure(); 

            var step = event.delta.divide(thickness).multiply(penPressure);
            step.angle = step.angle + 90;

            var top = event.middlePoint.add(step);
            var bottom = event.middlePoint.subtract(step);

            path.add(top);
            path.insert(0, bottom);
            path.smooth();

        }
    }

    this.paperTool.onMouseUp = function(event) {
        if (path) {
            path.closed = true;
            path.smooth();
            path = path.unite(new paper.Path())
            var t = wickEditor.settings.brushThickness;
            var z = wickEditor.fabric.canvas.getZoom();
            path.simplify(t / z * 0.2);

            var group = new paper.Group({insert:false});
            group.addChild(path);

            var svgString = group.exportSVG({asString:true});
            wickEditor.paper.pathRoutines.eraseWithPath({
                pathData:svgString,
                pathX: path.position.x,
                pathY: path.position.y
            });
            path.remove();
            path = null;
        } 
    }

}