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

    var zoomboxRect;
    var zoomboxStartPoint;
    var zoomboxEndPoint;

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

    this.onSelected = function () {
        wickEditor.inspector.clearSpecialMode();
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
        zoomboxStartPoint = {
            x:wickEditor.inputHandler.mouse.x,
            y:wickEditor.inputHandler.mouse.y
        }
    }

    this.paperTool.onMouseDrag = function(event) {
        zoomboxEndPoint = {
            x:wickEditor.inputHandler.mouse.x,
            y:wickEditor.inputHandler.mouse.y
        }

        if(zoomboxRect) zoomboxRect.remove();
        zoomboxRect = new paper.Path.Rectangle(event.point, event.downPoint);
        zoomboxRect.strokeColor = 'red';
        zoomboxRect.strokeWidth = 1/wickEditor.canvas.getZoom();
        zoomboxRect.strokeColor = 'black';
        zoomboxRect.fillColor = 'rgba(255,255,255,0.1)';
    }

    this.paperTool.onMouseUp = function(event) {

        if(zoomboxStartPoint && zoomboxEndPoint) {
            var startX = zoomboxStartPoint.x;
            var startY = zoomboxStartPoint.y;
            var endX = zoomboxEndPoint.x;
            var endY = zoomboxEndPoint.y;
            diffX = Math.abs(endX-startX);
            diffY = Math.abs(endY-startY);
            var wZoom = window.innerWidth/diffX*0.8;
            var hZoom = window.innerHeight/diffY*0.8;
            wickEditor.canvas.zoomToPoint(Math.min(wZoom, hZoom), (startX+endX)/2, (startY+endY)/2);
        } else {
            var mouse = wickEditor.inputHandler.mouse;
            if(event.modifiers.alt ||
               event.modifiers.command ||
               event.modifiers.meta || 
               event.modifiers.option) {
                wickEditor.canvas.zoomToPoint(1-CLICK_ZOOM_AMT, mouse.x, mouse.y);
            } else {
                wickEditor.canvas.zoomToPoint(1+CLICK_ZOOM_AMT, mouse.x, mouse.y);
            }
        }

        zoomboxStartPoint = null;
        zoomboxEndPoint = null;
        paperStart =null;
        paperEnd = null;
        if(zoomboxRect) zoomboxRect.remove();
    }

// Scroll-to-zoom

    function MouseWheelHandler(e) {
        if(wickEditor.currentTool !== wickEditor.tools.zoom) {
            if(wickEditor.project.getSelectedObjects().length > 0) {
                //wickEditor.project.clearSelection();
                //wickEditor.syncInterfaces();
                
                /*if(wickEditor.currentTool.forceUpdateSelection)
                    wickEditor.currentTool.forceUpdateSelection();*/
            }
        }

        e.preventDefault()
        if(e.ctrlKey || e.metaKey) {
            var e = window.event || e;
            var delta = (e.wheelDelta || -e.detail)*0.01
            var mouse = wickEditor.inputHandler.mouse;
            wickEditor.canvas.zoomToPoint(1.0 + delta*SCROLL_ZOOM_AMT, mouse.x, mouse.y);
        }

        return false;
    }

}