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

Tools.Pan = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        return "move";
    }

    this.getToolbarIcon = function () {
        return "resources/pan.png";
    }

    this.getTooltipName = function () {
        return "Pan";
    }

// Panning the fabric canvas
    
    this.setup = function () {
        wickEditor.fabric.canvas.on('mouse:up', function (e) {
            wickEditor.fabric.stopPan();
        });

        wickEditor.fabric.canvas.on('mouse:down', function (e) {
            if(wickEditor.currentTool instanceof Tools.Pan) {
                wickEditor.fabric.startPan();
            }
        });
        
        wickEditor.fabric.canvas.on('mouse:move', function (e) {
            if (wickEditor.fabric.panning && e && e.e) {
                wickEditor.fabric.relativePan(e.e.movementX, e.e.movementY)
            }
        });
    }

}