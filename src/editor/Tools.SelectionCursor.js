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

Tools.SelectionCursor = function (wickEditor) {

    var that = this;

    var makingSelectionSquare = false;
    var selectionSquare = null;
    var selectionSquareTopLeft;
    var selectionSquareBottomRight;

    this.getCursorImage = function () {
        return "auto"
    };

    this.getToolbarIcon = function () {
        return "resources/tools/Cursor.svg";
    }

    this.getTooltipName = function () {
        return "Selection Cursor (C)";
    }

    this.setup = function () {

    }

    this.onSelected = function () {
        wickEditor.canvas.getInteractiveCanvas().needsUpdate = true;
        wickEditor.project.clearSelection();
    }

    this.paperTool = new paper.Tool();

    var hitResult;
    var addedPoint;

    var lastEvent;
    var transformMode;

    this.paperTool.onMouseDown = function(event) {

        if(lastEvent 
        && event.timeStamp-lastEvent.timeStamp<300 
        && event.point.x===lastEvent.point.x
        && event.point.y===lastEvent.point.y) {
            that.paperTool.onDoubleClick(event);
            return;
        }
        lastEvent = event;
        
        hitResult = wickEditor.canvas.getInteractiveCanvas().getItemAtPoint(event.point);

        if(hitResult && hitResult.item && hitResult.item._wickInteraction) {
            transformMode = hitResult.item._wickInteraction
            return;
        }

        if(hitResult) {
            //if(hitResult.type === 'fill') {
                var selectCheckWickObj = hitResult.item.parent.wick;
                var newlySelected = false;
                if(selectCheckWickObj)
                    newlySelected = !wickEditor.project.isObjectSelected(selectCheckWickObj)

                var wickObj = hitResult.item.parent.wick;
                if(wickObj) {
                    if(!wickEditor.project.isObjectSelected(wickObj)) {
                        if(!event.modifiers.shift) {
                            wickEditor.project.clearSelection();
                        }
                        wickEditor.project.selectObject(wickObj);
                    }
                    wickEditor.syncInterfaces();
                }

                //if(newlySelected) return;
            //}
        } else {
            wickEditor.project.clearSelection();
            wickEditor.syncInterfaces();

            makingSelectionSquare = true;
            selectionSquareTopLeft = event.point;
            selectionSquareBottomRight = event.point
        }

    }

    this.paperTool.onDoubleClick = function (event) {
        
    }

    this.paperTool.onMouseMove = function(event) {
        //wickEditor.canvas.getInteractiveCanvas().highlightHoveredOverObject(event);
        //wickEditor.cursorIcon.setImageForPaperEvent(event)
        //wickEditor.canvas.getInteractiveCanvas().updateCursorIcon(event);
    }

    this.paperTool.onMouseDrag = function(event) {

        if(transformMode === 'scaleBR') {
            var rect = wickEditor.canvas.getInteractiveCanvas().getSelectionRect();
            wickEditor.project.getSelectedObjects().forEach(function (o) {
                var resizeRatio = event.point.subtract(rect.topLeft);
                resizeRatio.x /= rect.width;
                resizeRatio.y /= rect.height;
                o.paper.scale(resizeRatio.x, resizeRatio.y, rect.topLeft);
                wickEditor.canvas.getInteractiveCanvas().forceUpdateSelection()
            });
            return;
        }
        if(transformMode === 'rotate') {
            var rect = wickEditor.canvas.getInteractiveCanvas().getSelectionRect();
            wickEditor.project.getSelectedObjects().forEach(function (o) {
                var pivot = rect.center;
                var oldAngle = event.lastPoint.subtract(pivot).angle;
                var newAngle = event.point.subtract(pivot).angle;
                o.paper.rotate(newAngle-oldAngle, pivot);
                //wickEditor.canvas.getInteractiveCanvas().forceUpdateSelection()
            });
            return;
        }

        if(makingSelectionSquare) {
            selectionSquareBottomRight = event.point;

            if(selectionSquare) {
                selectionSquare.remove();
            }

            selectionSquare = new paper.Path.Rectangle(
                    new paper.Point(selectionSquareTopLeft.x, selectionSquareTopLeft.y), 
                    new paper.Point(selectionSquareBottomRight.x, selectionSquareBottomRight.y));
            selectionSquare.strokeColor = 'rgba(100,100,255,0.7)';
            selectionSquare.strokeWidth = 1;
            selectionSquare.fillColor = 'rgba(100,100,255,0.15)';

            return;
        }

        //wickEditor.canvas.getInteractiveCanvas().highlightHoveredOverObject(event);

    }

    this.paperTool.onMouseUp = function (event) {

        transformMode = null;

        if(makingSelectionSquare) {
            if(!selectionSquare) {
                selectionSquare = null;
                makingSelectionSquare = false;
                return;
            }

            if(event.modifiers.shift) {
                wickEditor.project.clearSelection()
            }
            wickEditor.project.getCurrentObject().getAllActiveChildObjects().forEach(function (wickObject) {
                if(selectionSquare.bounds.contains(wickObject.paper.bounds)) {
                    wickEditor.project.selectObject(wickObject)
                }
            });
            wickEditor.syncInterfaces()

            if(selectionSquare) {
                selectionSquare.remove();
            }
            selectionSquare = null;
            makingSelectionSquare = false;
            return;
        }

        if(!hitResult) return;
        if(!hitResult.item) return;

        wickEditor.project.getSelectedObjects().forEach(function (wickObject) {
            wickObject.paper.applyMatrix = true;
            wickObject.paper.rotate(wickObject.rotation);
            wickObject.paper.scaling.x = wickObject.scaleX;
            wickObject.paper.scaling.y = wickObject.scaleY;
            if(wickObject.flipX) {
                wickObject.paper.scale(-1, 1)
            }
            if(wickObject.flipY) {
                wickObject.paper.scale(1, -1)
            }

            wickObject.rotation = 0;
            wickObject.scaleX = 1;
            wickObject.scaleY = 1;
            wickObject.width = wickObject.paper.bounds._width;
            wickObject.height = wickObject.paper.bounds._height;
            wickObject.flipX = false;
            wickObject.flipY = false;

            wickObject.pathData = wickObject.paper.exportSVG({asString:true});

            wickObject.svgX = wickObject.paper.bounds._x;
            wickObject.svgY = wickObject.paper.bounds._y;

            var parentAbsPos;
            if(wickObject.parentObject)
                parentAbsPos = wickObject.parentObject.getAbsolutePosition();
            else 
                parentAbsPos = {x:0,y:0};

            wickObject.x = wickObject.paper.position.x - parentAbsPos.x;
            wickObject.y = wickObject.paper.position.y - parentAbsPos.y;
        });
    }

}