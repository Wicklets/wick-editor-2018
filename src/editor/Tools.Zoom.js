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

Tools.Zoom = function (wickEditor) {

    var self = this;

    var startX,startY;

    var CLICK_ZOOM_AMT = 0.15;
    var SCROLL_ZOOM_AMT = 0.1;

    this.paperTool = new paper.Tool();

    this.getCursorImage = function () {
        return "zoom-in";
    }

    this.getToolbarIcon = function () {
        return "resources/tools/Zoom.svg";
    }

    this.getTooltipName = function () {
        return "Zoom (Z/Command+Scroll)";
    }
    
    this.setup = function () {
        var sq = document.getElementById("editorCanvasContainer");
        if (sq.addEventListener) {
            sq.addEventListener("mousewheel", MouseWheelHandler, false);
            sq.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
        } else {
            sq.attachEvent("onmousewheel", MouseWheelHandler);
        }
    }

    this.paperTool.onMouseDown = function(event) {

    }

    this.paperTool.onMouseUp = function(event) {
        var mouse = wickEditor.inputHandler.mouse;
        if(wickEditor.inputHandler.specialKeys["Modifier"]) {
            wickEditor.canvas.zoomToPoint(1-CLICK_ZOOM_AMT, mouse.x, mouse.y);
        } else {
            wickEditor.canvas.zoomToPoint(1+CLICK_ZOOM_AMT, mouse.x, mouse.y);
        }
    }

// Scroll-to-zoom

    function MouseWheelHandler(e) {
        // cross-browser wheel delta
        e.preventDefault()
        if(wickEditor.inputHandler.specialKeys["Modifier"]) {
            var e = window.event || e;
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
            var mouse = wickEditor.inputHandler.mouse;
            wickEditor.canvas.zoomToPoint(1.0 + delta*SCROLL_ZOOM_AMT, mouse.x, mouse.y);
        }

        return false;
    }

}