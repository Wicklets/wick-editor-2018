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

    var startX,startY;

    this.zoomType = "in";

    this.getCursorImage = function () {
        if(this.zoomType === "in")
            return "zoom-in";
        else
            return "zoom-out";
    }

    this.getToolbarIcon = function () {
        return "resources/tools/Zoom.svg";
    }

    this.getTooltipName = function () {
        return "Zoom (Z/Command+Scroll)";
    }

    this.getCanvasMode = function () {
        return 'fabric';
    }
    
    this.setup = function () {
        wickEditor.fabric.canvas.on('mouse:down', function (e) {
            startX = wickEditor.inputHandler.mouse.x;
            startY = wickEditor.inputHandler.mouse.y;
        });
        wickEditor.fabric.canvas.on('mouse:up', function (e) {
            if(!(wickEditor.currentTool instanceof Tools.Zoom)) return;

            endX = wickEditor.inputHandler.mouse.x;
            endY = wickEditor.inputHandler.mouse.y;

            diffX = Math.abs(endX-startX);
            diffY = Math.abs(endY-startY);

            if (wickEditor.inputHandler.specialKeys["Modifier"] || wickEditor.inputHandler.keys[keyCharToCode['ALT']]) {
                wickEditor.fabric.zoom(0.7, endX, endY);
                wickEditor.paper.syncWithEditorState();
            } else if (diffX < 10 && diffY < 10) {
                wickEditor.fabric.zoom(1 / 0.7, endX, endY);
                wickEditor.paper.syncWithEditorState();
            } else {
                var wZoom = window.innerWidth/diffX*0.8;
                var hZoom = window.innerHeight/diffY*0.8;
                wickEditor.fabric.zoom(Math.min(wZoom, hZoom), (startX+endX)/2, (startY+endY)/2-30);
                wickEditor.paper.syncWithEditorState();
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
            wickEditor.fabric.zoom(1.0 + delta*.1, wickEditor.inputHandler.mouse.x, wickEditor.inputHandler.mouse.y);
            wickEditor.paper.syncWithEditorState();
        }

        return false;
    }


}