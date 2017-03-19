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

    var that = this;

    this.zoomType = "in";

    this.getCursorImage = function () {
        if(this.zoomType === "in")
            return "zoom-in";
        else
            return "zoom-out";
    }

    this.getToolbarIcon = function () {
        return "resources/zoom.png";
    }

    this.getTooltipName = function () {
        return "Zoom";
    }
    
    this.setup = function () {
        wickEditor.fabric.canvas.on('mouse:down', function (e) {
            if(wickEditor.currentTool instanceof Tools.Zoom) {
                if (wickEditor.inputHandler.specialKeys["Modifier"]) {
                    wickEditor.fabric.zoom(0.9);
                } else {
                    wickEditor.fabric.zoom(1.1);
                }
            }
        });

        var sq = document.getElementById("editorCanvasContainer");
        if (sq.addEventListener) {
            sq.addEventListener("mousewheel", MouseWheelHandler, false);
            sq.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
        }
        else sq.attachEvent("onmousewheel", MouseWheelHandler);
    }

// Scroll-to-zoom

    function MouseWheelHandler(e) {
        // cross-browser wheel delta
        e.preventDefault()
        if(wickEditor.inputHandler.specialKeys["Modifier"]) {
            var e = window.event || e;
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
            wickEditor.fabric.zoom(1.0 + delta*.1);
        }

        return false;
    }


}