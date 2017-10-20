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

Tools.Cursor = function (wickEditor) {

    var that = this;

    var lastDoubleClickTime = null;
    var lastDoubleClickPos = {x:0,y:0};

    this.getCursorImage = function () {
        return "default";
    }

    this.getToolbarIcon = function () {
        return "resources/tools/Cursor.svg";
    }

    this.getTooltipName = function () {
        return "Selection Cursor (C)";
    }

    this.getCanvasMode = function () {
        return 'fabric';
    }

    this.setup = function () {
        var canvas = wickEditor.fabric.canvas;
        
        // Select objects on right click (fabric.js doesn't do this by default >.>)
        canvas.on('mouse:down', function(e) {
            if(e.e.button !== 2) return;
            //if(!(wickEditor.fabric.currentTool instanceof Tools.Cursor)) return;

            if (e.target && e.target.wickObjectID) {
                // Set active object of fabric canvas
                var id = canvas.getObjects().indexOf(e.target);
                canvas.setActiveObject(canvas.item(id)).renderAll();
            }

            if(!e.target) {
                // Didn't right click an object, deselect everything
                canvas.deactivateAll().renderAll();
            }
        });

        // Double click functionality to edit symbols
        canvas.on('mouse:down', function(e) {
            if(e.e.button !== 0) return;
            if(!(wickEditor.currentTool instanceof Tools.Cursor)) return;

            var newDoubleClickPos = {x: e.e.clientX, y: e.e.clientX};
            var currentTime = new Date().getTime();

            var isSecondClick = lastDoubleClickTime !== null && currentTime-lastDoubleClickTime < 350;
            var mouseInSameArea = Math.abs(lastDoubleClickPos.x - newDoubleClickPos.x) < 3 && Math.abs(lastDoubleClickPos.y - newDoubleClickPos.y) < 3;

            if(isSecondClick && mouseInSameArea) {
                var selectedObject = wickEditor.project.getSelectedObject();
                if(selectedObject && selectedObject.isSymbol) {
                    wickEditor.guiActionHandler.doAction("editObject");
                } else if (!selectedObject && !wickEditor.project.currentObject.isRoot) {
                    wickEditor.guiActionHandler.doAction("finishEditingObject");
                }
                lastDoubleClickTime = null;
            } else {
                lastDoubleClickTime = currentTime;
            }

            lastDoubleClickPos = newDoubleClickPos;
        });
    }

}