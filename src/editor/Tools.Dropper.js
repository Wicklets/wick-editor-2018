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

    this.getCursorImage = function () {
        return 'url("resources/dropper.png") 2 14,default';
    }

    this.getToolbarIcon = function () {
        return "resources/eyedropper.png";
    }

    this.getTooltipName = function () {
        return "Color Picker";
    }

    this.setup = function () {
        wickEditor.fabric.canvas.on('mouse:down', function (e) {
            if(wickEditor.currentTool instanceof Tools.Dropper) {
                
                var image = new Image();
                image.onload = function () {
                    var mouse = wickEditor.inputHandler.mouse;
                    var color = GetColorAtCoords(image, mouse.x*window.devicePixelRatio, mouse.y*window.devicePixelRatio, "hex");
                    wickEditor.tools.paintbrush.color = color;
                    wickEditor.syncInterfaces();
                };
                image.src = wickEditor.fabric.canvas.toDataURL();
                
                wickEditor.syncInterfaces();
            }
        });
    }

}