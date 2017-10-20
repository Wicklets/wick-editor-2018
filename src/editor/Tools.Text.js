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
        return "text";
    }

    this.getToolbarIcon = function () {
        return "resources/tools/Text.svg";
    }

    this.getTooltipName = function () {
        return "Text (T)";
    }

    this.setup = function () {
        var canvas = wickEditor.fabric.canvas;
        canvas.on('mouse:down', function (e) {
            if(wickEditor.currentTool instanceof Tools.Text && e.e.buttons === 1) {
                var mouseCanvasSpace = wickEditor.fabric.screenToCanvasSpace(wickEditor.inputHandler.mouse.x, wickEditor.inputHandler.mouse.y)
                wickEditor.currentTool = wickEditor.tools.cursor;
                self.addText(mouseCanvasSpace.x, mouseCanvasSpace.y);
                //wickEditor.syncInterfaces();
            }
        });
    }

    self.addText = function (x,y) {                                                     
    	var newWickObject = WickObject.createTextObject('Click to edit text');
        if(x && y) {
            newWickObject.x = x;
            newWickObject.y = y;
        } else {
            newWickObject.x = wickEditor.project.width/2;
            newWickObject.y = wickEditor.project.height/2;
        }
        wickEditor.actionHandler.doAction('addObjects', {wickObjects:[newWickObject]});
    }

    this.getCanvasMode = function () {
        return 'fabric';
    }

}