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

    var path;
    var currentSegment;

    this.paperTool.onMouseDown = function(event) {
        if(!path) {
            path = new paper.Path();
            path.fillColor = {
                hue: 360 * Math.random(),
                saturation: 1,
                brightness: 1,
                alpha: 0.5
            };
            path.strokeColor = '#000000';
            path.strokeWidth = 1;
            path.selected = true;
            currentSegment = path.add(event.point);
            currentSegment.selected = true;

            console.log('uh i guess create wickobject here')
        } else {
            console.log('Check for hitTest on first segment, this means we gotta close the path')

            currentSegment.selected = false;
            currentSegment = path.add(event.point);
            currentSegment.selected = true;
        }
    }

    this.paperTool.onMouseMove = function(event) {

    }

    this.paperTool.onMouseDrag = function(event) {
        var delta = event.delta.clone();
        currentSegment.handleIn.x -= delta.x;
        currentSegment.handleIn.y -= delta.y;
        currentSegment.handleOut.x += delta.x;
        currentSegment.handleOut.y += delta.y;
    }

    this.paperTool.onMouseUp = function (event) {
        console.log('uh i guess sync wickobject here (modifyObjects action)')
    }

}