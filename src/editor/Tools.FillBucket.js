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

Tools.FillBucket = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        return 'url("resources/fillbucket-cursor.png") 64 64,default';
    };

    this.getToolbarIcon = function () {
        return "resources/fill-bucket.png";
    }

    this.getTooltipName = function () {
        return "Fill Bucket";
    }

    this.setup = function () {
        var canvas = wickEditor.fabric.canvas;

        canvas.on('mouse:down', function (e) {
            if(e.e.button != 0) return;
            if(!(wickEditor.currentTool instanceof Tools.FillBucket)) return;

            var mouseScreenSpace = wickEditor.fabric.screenToCanvasSpace(e.e.offsetX, e.e.offsetY);
            var mousePointX = mouseScreenSpace.x;
            var mousePointY = mouseScreenSpace.y;
            var insideSymbolOffset = wickEditor.project.currentObject.getAbsolutePosition();
            mousePointX -= insideSymbolOffset.x;
            mousePointY -= insideSymbolOffset.y;

            wickEditor.actionHandler.doAction('fillHole', {
                x: mousePointX,
                y: mousePointY,
                color: wickEditor.tools.paintbrush.color
            });
        });
    }

}