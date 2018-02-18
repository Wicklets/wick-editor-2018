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
        return "resources/tools/Pan.svg";
    }

    this.getTooltipName = function () {
        return "Pan (Space)";
    }

    this.paperTool = new paper.Tool();
    
    this.onSelected = function () {
        wickEditor.inspector.clearSpecialMode();
    }

    this.setup = function () {
        
    }

    this.paperTool.onMouseDrag = function(event) {
        wickEditor.canvas.panByAmount(event.event.movementX, event.event.movementY);
    }

}