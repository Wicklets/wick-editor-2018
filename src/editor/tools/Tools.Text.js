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

Tools.Text = function (wickEditor) {

    var self = this;

    this.getCursorImage = function () {
        return "default";
    }

    this.getToolbarIcon = function () {
        return "resources/tools/Text.svg";
    }

    this.getTooltipName = function () {
        return "Text (T)";
    }

    this.setup = function () {
        
    }

    this.onSelected = function () {
        wickEditor.project.clearSelection();
        wickEditor.inspector.clearSpecialMode();
        wickEditor.canvas.getInteractiveCanvas().needsUpdate = true;
    }

    this.onDeselected = function () {
        
    }

    this.paperTool = new paper.Tool();

    this.paperTool.onMouseMove = function(event) {
        if(event.item) {
            if(event.item.wick && event.item.wick.isText) {
                wickEditor.canvas.getCanvasContainer().style.cursor = 'text';
            }
        } else {
            wickEditor.canvas.getCanvasContainer().style.cursor = 'crosshair';
        }
    }

    this.paperTool.onMouseDown = function (event) {
        if(event.item && event.item.wick && event.item.wick.isText) {
            wickEditor.project.clearSelection();
            wickEditor.project.selectObject(event.item.wick)
            wickEditor.syncInterfaces();
        } else {
            if(!wickEditor.project.clearSelection()) {
                var m = wickEditor.inputHandler.mouse;
                var ms = wickEditor.canvas.screenToCanvasSpace(m.x,m.y)
                addText(ms.x, ms.y);
            } else {
                wickEditor.syncInterfaces();
            }

        }
    }

    function addText (x,y) {                                                     
    	var newWickObject = WickObject.createTextObject('Text');

        if(x && y) {
            newWickObject.x = x;
            newWickObject.y = y;
        } else {
            newWickObject.x = wickEditor.project.width/2;
            newWickObject.y = wickEditor.project.height/2;
        }

        wickEditor.actionHandler.doAction('addObjects', {wickObjects:[newWickObject]});
    }
}
