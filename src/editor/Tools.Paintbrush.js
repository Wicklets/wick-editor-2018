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
        var radius = wickEditor.settings.brushThickness/2;// * wickEditor.canvas.getFabricCanvas().canvas.getZoom();

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
        wickEditor.canvas.getPaperCanvas().needsUpdate = true;
    }

    this.onDeselected = function () {
        
    }

    this.getCanvasMode = function () {
        return 'paper';
    }

    this.paperTool = new paper.Tool();
    var path;
    var lastPoint;
    var lastTop;
    var lastBottom;
    var totalDelta;
    var lastPressure;

    var first;

    this.paperTool.onMouseDown = function (event) {
        //path = new paper.Path();
        //path.strokeColor = 'blue';
        lastPoint = event.point;
        first = true;
    }

    this.paperTool.onMouseDrag = function (event) {
        if(first) {
            first = false;
            return;
        }
        if(event.delta.x === 0 && event.delta.y === 0) return;

        if(!totalDelta) {
            totalDelta = event.delta;
        } else {
            totalDelta.x += event.delta.x;
            totalDelta.y += event.delta.y;
        }

        if (totalDelta.length < 10) {
            return;
        }
        totalDelta.x = 0;
        totalDelta.y = 0;

        var penPressure = wickEditor.inputHandler.getPenPressure();
        if(!lastPressure) lastPressure = penPressure;
        var t = wickEditor.settings.brushThickness*(penPressure);
        var tLast = wickEditor.settings.brushThickness*(lastPressure);

        //path.add(event.point);

        //var dirLine = new paper.Path();
        //dirLine.strokeColor = 'red';
        var step = event.delta.divide(event.delta.length).multiply(t/2);
        var stepLast = event.delta.divide(event.delta.length).multiply(tLast/2);
        stepLast.angle = stepLast.angle + 90;
        step.angle = step.angle + 90;

        var top = event.point.add(step);
        var bottom = event.point.subtract(step);
        //dirLine.add(bottom);
        //dirLine.add(top);

        var circle = new paper.Path.Circle({
            center: event.point,
            radius: t/2,
        });
        circle.strokeColor = 'green';
        //circle.fillColor = wickEditor.settings.fillColor

        if(lastBottom) {
            var strokeRect = new paper.Path();
            strokeRect.strokeColor = 'orange';
            //strokeRect.fillColor = wickEditor.settings.fillColor;
            strokeRect.add(top);
            strokeRect.add(bottom);
            strokeRect.add(lastPoint.subtract(stepLast));
            strokeRect.add(lastPoint.add(stepLast));
            strokeRect.closed = true;

            var midA = event.middlePoint.subtract(event.point);
            var midB = event.middlePoint.subtract(event.point).rotate(90);

            var d = lastDelta.angle-event.delta.angle
            if(d > 300) d -= 360;
            if(d < -300) d += 360;
            if(d >  90) d=0;
            if(d < -90) d=0;
            var a = (d)*0.0045;
            midA = midA.add(event.delta.rotate(90).multiply(a));

            strokeRect.segments[0].handleIn.x = midA.x
            strokeRect.segments[0].handleIn.y = midA.y
            strokeRect.segments[1].handleOut.x = midA.x
            strokeRect.segments[1].handleOut.y = midA.y
        }

        lastTop = top;
        lastBottom = bottom;
        lastPoint = event.point;
        lastDelta = event.delta
        lastPressure = penPressure
    }

    this.paperTool.onMouseUp = function (event) {
        lastBottom = null;
        lastTop = null;
        lastPoint = null;
    }

}