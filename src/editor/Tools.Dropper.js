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
        
    }

    this.onDeselected = function () {
       
    }

    this.getCanvasMode = function () {
        return 'fabric';
    }

    this.setup = function () {
        window.addEventListener('mousedown', function (e) {
            if(e.target.className !== 'upper-canvas ') return;
            if(wickEditor.currentTool instanceof Tools.Dropper && !wickEditor.colorPicker.isOpen()) {
                that.getColorAtCursor(function (color) {
                    wickEditor.settings.setValue(colorVar, color);
                    wickEditor.syncInterfaces();
                });
            }
        });
    }

    this.getColorAtCursor = function (callback) {
        var image = new Image();
        image.onload = function () {
            var mouse = wickEditor.inputHandler.mouse;
            var color = GetColorAtCoords(
                image, 
                mouse.x*window.devicePixelRatio, 
                mouse.y*window.devicePixelRatio, 
                "hex");
            callback(color);
        };
        image.src = wickEditor.canvas.getFabricCanvas().canvas.toDataURL();
    }

}