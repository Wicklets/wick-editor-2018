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

Tools.Dropper = function (wickEditor) {

    var that = this;

    var colorVar = 'fillColor';

    this.paperTool = new paper.Tool();

    this.getCursorImage = function () {
        return 'url("resources/dropper.png") 2 14,default';
    }

    this.getToolbarIcon = function () {
        return "resources/tools/Dropper.svg";
    }

    this.getTooltipName = function () {
        return "Eyedropper (D)";
    }

    this.setColorVar = function (newColorVar) {
        colorVar = newColorVar;
    }

    this.onSelected = function () {
        wickEditor.canvas.getInteractiveCanvas().needsUpdate = true;
    }

    this.onDeselected = function () {
       
    }

    this.setup = function () {
        window.addEventListener('mousedown', function (e) {
            if(e.target.className !== 'paperCanvas') return;
            if(wickEditor.currentTool instanceof Tools.Dropper && !wickEditor.colorPicker.isOpen()) {
                that.getColorAtCursor(function (color) {
                    wickEditor.settings.setValue(colorVar, color);
                    wickEditor.syncInterfaces();
                });
            }
        });
    }

    this.getColorAtCursor = function (callback) {
        wickEditor.canvas.getCanvasRenderer().getCanvasAsDataURL(function (dataURL) {
            var image = new Image();
            image.onload = function () {
                var mouse = wickEditor.inputHandler.mouse;
                var localMouse = wickEditor.canvas.screenToCanvasSpace(mouse.x, mouse.y);
                localMouse.x = Math.floor(localMouse.x)
                localMouse.y = Math.floor(localMouse.y)
                var color = GetColorAtCoords(
                    image,
                    localMouse.x*window.devicePixelRatio+wickEditor.project.width/2, 
                    localMouse.y*window.devicePixelRatio+wickEditor.project.height/2, 
                    "hex");
                console.log(color)
                callback(color);
            };
            image.src = dataURL;
        });
    }

}