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

    var PREVIEW_IMG = 'resources/colorpreviewcursoricon.png';

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

    this.onSelected = function () {
        wickEditor.inspector.clearSpecialMode();
    }

    this.onDeselected = function () {
       wickEditor.cursorIcon.hide();
    }

    this.setup = function () {
        
    }

    this.paperTool = new paper.Tool();

    this.paperTool.onMouseMove = function(event) {
        var colorResult = wickEditor.canvas.getInteractiveCanvas().getColorAtPoint(event.point)
        if(colorResult) {
            wickEditor.cursorIcon.setImage(PREVIEW_IMG, colorResult.color);
        } else {
            wickEditor.cursorIcon.hide();
        }
    }

    this.paperTool.onMouseDown = function(event) {
        var colorResult = wickEditor.canvas.getInteractiveCanvas().getColorAtPoint(event.point)
        if(colorResult) {
            if(!wickEditor.colorPicker.isOpen()) wickEditor.settings.setValue('fillColor', colorResult.color);
            wickEditor.colorPicker.setColor(colorResult.color)
            wickEditor.syncInterfaces();
        }
    }

}