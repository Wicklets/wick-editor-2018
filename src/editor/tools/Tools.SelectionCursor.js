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

var GUI_DOTS_SIZE = 5;
var GUI_DOTS_FILLCOLOR = 'rgba(255,255,255,0.3)';
var GUI_DOTS_STROKECOLOR = 'rgba(100,150,255,1.0)'
var HIDDEN_ROTATE_HANDLE_COLOR = 'rgba(0,0,0,0.0001)'
var ROTATE_HANDLE_LENGTH = 20;

Tools.SelectionCursor = function (wickEditor) {

    var self = this;

    var makingSelectionSquare = false;
    var selectionSquare = null;
    var selectionSquareTopLeft;
    var selectionSquareBottomRight;

    var selectionRect;
    var selectionBoundsRect;
    var scaleBR;
    var scaleTR;
    var scaleTL;
    var scaleBL;
    var scaleT;
    var scaleB;
    var scaleL;
    var scaleR;
    var rotateTL;
    var rotateTR;
    var rotateBL;
    var rotateBR;
    var individualObjectBoxes;

    var hitResult;
    var addedPoint;

    var lastEvent;
    var transformMode;

    var pathHoverGhost;

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
        wickEditor.inspector.clearSpecialMode();
        wickEditor.canvas.getInteractiveCanvas().needsUpdate = true;
    }

    this.paperTool = new paper.Tool();

    var hitOptions = {
        allowGroups: true,
        segments: false,
        fill: true,
        curves: true,
        handles: false,
        stroke: true,
    }

    this.paperTool.onMouseMove = function(event) {
        //updateSelection()

        hitResult = wickEditor.canvas.getInteractiveCanvas().getItemAtPoint(event.point, hitOptions);

        if(hitResult && hitResult.item._cursor)
            wickEditor.canvas.getCanvasContainer().style.cursor = hitResult.item._cursor;
        else if (hitResult && !hitResult.item._wickInteraction)
            wickEditor.canvas.getCanvasContainer().style.cursor = 'move';
        else
            wickEditor.canvas.updateCursor();

        if(pathHoverGhost) pathHoverGhost.remove();
        pathHoverGhost = null;
        if(hitResult && !hitResult.item._wickInteraction) {
            if(hitResult.item.wick && !wickEditor.project.isObjectSelected(hitResult.item.wick)) {
                if(hitResult.item.wick.isSymbol || hitResult.item.wick.isImage) {
                    pathHoverGhost = new paper.Path.Rectangle(hitResult.item.bounds);
                } else {
                    pathHoverGhost = hitResult.item.clone({insert:false});
                }
                paper._guiLayer.addChild(pathHoverGhost)
                pathHoverGhost._wickInteraction = 'pathHoverGhost';
                pathHoverGhost.fillColor = 'rgba(0,0,0,0)';
                pathHoverGhost.strokeColor = GUI_DOTS_STROKECOLOR;
                pathHoverGhost.strokeWidth = 1.5/wickEditor.canvas.getZoom();
            }
        }
    }

    this.paperTool.onMouseDown = function(event) {
        if(pathHoverGhost) pathHoverGhost.remove();

        if(lastEvent 
        && event.timeStamp-lastEvent.timeStamp<300 
        && event.point.x===lastEvent.point.x
        && event.point.y===lastEvent.point.y) {
            self.paperTool.onDoubleClick(event);
            return;
        }
        lastEvent = event;
        
        if(hitResult && hitResult.item && hitResult.item._wickInteraction) {
            transformMode = hitResult.item._wickInteraction
            return;
        }

        if(hitResult && !hitResult.item._wickInteraction) {

            var wickObj = hitResult.item.wick || hitResult.item.parent.wick;
            if(wickObj) {
                if(wickEditor.project.isObjectSelected(wickObj)) {
                    if(event.modifiers.shift) {
                        wickEditor.project.deselectObject(wickObj);
                    }
                } else {
                    if(!event.modifiers.shift) {
                        wickEditor.project.clearSelection();
                    }
                    wickEditor.project.selectObject(wickObj);
                }

                var currObj = wickEditor.project.getCurrentObject();
                currObj.currentLayer = currObj.layers.indexOf(wickObj.parentFrame.parentLayer);
                wickEditor.syncInterfaces();
            }

        } else {
            if(!event.modifiers.shift && !wickEditor.colorPicker.isOpen()) {
                wickEditor.project.clearSelection();
            }
            wickEditor.syncInterfaces();

            makingSelectionSquare = true;
            selectionSquareTopLeft = event.point;
            selectionSquareBottomRight = event.point
        }

        //updateSelection()

    }

    this.paperTool.onDoubleClick = function (event) {
        if(hitResult) {
            var selected = wickEditor.project.getSelectedObjectsByType(WickObject)[0];
            if(selected)  {
                if(selected.isSymbol) {
                    wickEditor.guiActionHandler.doAction('editObject');
                } else if (selected.isText) {
                    wickEditor.guiActionHandler.doAction('useTools.text')
                }
            }
        } else {
            if(wickEditor.project.getCurrentObject().isRoot) return;
            wickEditor.guiActionHandler.doAction('finishEditingObject');
        }
        hitResult = null;
    }

    this.paperTool.onMouseDrag = function(event) {
        if(transformMode && transformMode.startsWith('scale')) {
            var keepAspectRatio = event.modifiers.shift;
            var rect = selectionBoundsRect

            wickEditor.project.getSelectedObjectsByType(WickObject).forEach(function (o) {
                var resizeRatio;
                var referencePos = {x:0,y:0};
                if(transformMode === 'scaleBR') { referencePos = rect.topLeft;      resizeRatio = event.point.subtract(rect.topLeft); }
                if(transformMode === 'scaleTL') { referencePos = rect.bottomRight;  resizeRatio = rect.bottomRight.subtract(event.point); }
                if(transformMode === 'scaleBL') { referencePos = rect.topRight;     resizeRatio = { x: rect.topRight.x - event.point.x, y: event.point.y - rect.topRight.y }; }
                if(transformMode === 'scaleTR') { referencePos = rect.bottomLeft;   resizeRatio = { x: event.point.x - rect.bottomLeft.x, y: rect.bottomLeft.y - event.point.y }; }
                if(transformMode === 'scaleT')  { referencePos = rect.bottomCenter; resizeRatio = { x: rect.width, y: rect.bottomCenter.y - event.point.y }; keepAspectRatio = false; }
                if(transformMode === 'scaleB')  { referencePos = rect.topCenter;    resizeRatio = { x: rect.width, y: event.point.y - rect.topCenter.y }; keepAspectRatio = false; }
                if(transformMode === 'scaleR')  { referencePos = rect.leftCenter;   resizeRatio = { x: event.point.x - rect.leftCenter.x, y: rect.height }; keepAspectRatio = false; }
                if(transformMode === 'scaleL')  { referencePos = rect.rightCenter;  resizeRatio = { x: rect.rightCenter.x - event.point.x, y: rect.height }; keepAspectRatio = false; }

                if(resizeRatio.x < 1 || resizeRatio.y < 1) return;
                resizeRatio.x /= rect.width;
                resizeRatio.y /= rect.height;
                if (keepAspectRatio) {
                    resizeRatio.x = resizeRatio.y = Math.max(resizeRatio.x, resizeRatio.y);
                }
                o.paper.scale(resizeRatio.x, resizeRatio.y, referencePos);
                updateSelection()
            });
            return;
        }
        if(transformMode === 'rotate') {
            var rect = selectionBoundsRect
            var pivot = rect.center;
            var oldAngle = event.lastPoint.subtract(pivot).angle;
            var newAngle = event.point.subtract(pivot).angle;
            var rotationAmount = newAngle-oldAngle;
            wickEditor.project.getSelectedObjectsByType(WickObject).forEach(function (o) {
                o.paper.rotate(rotationAmount, pivot);
                //updateSelection()
            });
            selectionRect.rotate(rotationAmount, pivot);
            //rotate.rotate(rotationAmount, pivot);
            scaleBR.rotate(rotationAmount, pivot);
            scaleBL.rotate(rotationAmount, pivot);
            scaleTR.rotate(rotationAmount, pivot);
            scaleTL.rotate(rotationAmount, pivot);
            scaleT.rotate(rotationAmount, pivot);
            scaleB.rotate(rotationAmount, pivot);
            scaleL.rotate(rotationAmount, pivot);
            scaleR.rotate(rotationAmount, pivot);
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
            selectionSquare.strokeWidth = 1/wickEditor.canvas.getZoom();
            selectionSquare.fillColor = 'rgba(100,100,255,0.15)';
        } else {
            if(hitResult && hitResult.item) {
                wickEditor.project.getSelectedObjectsByType(WickObject).forEach(function (o) {
                    o.paper.position = new paper.Point(
                        o.paper.position.x + event.delta.x,
                        o.paper.position.y + event.delta.y
                    );
                });
                updateSelection()
            }
        }

    }

    this.paperTool.onMouseUp = function (event) {

        transformMode = null;

        if(makingSelectionSquare) {
            if(!selectionSquare) {
                selectionSquare = null;
                makingSelectionSquare = false;
                return;
            }

            if(!event.modifiers.shift) {
                wickEditor.project.clearSelection()
            }
            wickEditor.project.getCurrentObject().getAllActiveChildObjects().forEach(function (wickObject) {
                if(!wickObject.paper) return;
                if(wickObject.parentFrame.parentLayer.locked || wickObject.parentFrame.parentLayer.hidden) return;
                if(selectionSquare.bounds.intersects(wickObject.paper.bounds)) {
                    if(selectionSquare.bounds.contains(wickObject.paper.bounds)
                    || (selectionSquare.intersects(wickObject.paper)) && !event.modifiers.alt) {
                        wickEditor.project.selectObject(wickObject)
                    }
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

        var objs = wickEditor.project.getSelectedObjectsByType(WickObject);
        var modifiedStates = [];
        objs.forEach(function (wickObject) {
            var parentAbsPos;
            if(wickObject.parentObject)
                parentAbsPos = wickObject.parentObject.getAbsolutePosition();
            else 
                parentAbsPos = {x:0,y:0};

            if(wickObject.isSymbol) {
                modifiedStates.push({
                    rotation: wickObject.paper.rotation,
                    x: wickObject.paper.position.x - parentAbsPos.x,
                    y: wickObject.paper.position.y - parentAbsPos.y,
                    scaleX: wickObject.paper.scaling.x,
                    scaleY: wickObject.paper.scaling.y,
                });
            } else if (wickObject.isPath) {
                wickObject.paper.applyMatrix = true;

                wickObject.rotation = 0;
                wickObject.scaleX = 1;
                wickObject.scaleY = 1;
                wickObject.flipX = false;
                wickObject.flipY = false;

                modifiedStates.push({
                    x : wickObject.paper.position.x - parentAbsPos.x,
                    y : wickObject.paper.position.y - parentAbsPos.y,
                    svgX : wickObject.paper.bounds._x,
                    svgY : wickObject.paper.bounds._y,
                    width : wickObject.paper.bounds._width,
                    height : wickObject.paper.bounds._height,
                    pathData: wickObject.paper.exportSVG({asString:true}),
                });
            } else if (wickObject.isImage) {
                modifiedStates.push({
                    x : wickObject.paper.position.x - parentAbsPos.x,
                    y : wickObject.paper.position.y - parentAbsPos.y,
                    scaleX : wickObject.paper.scaling.x,
                    scaleY : wickObject.paper.scaling.y,
                    rotation : wickObject.paper.rotation,
                })
            } else if (wickObject.isText) {
                modifiedStates.push({
                    x : wickObject.paper.position.x - parentAbsPos.x,
                    y : wickObject.paper.position.y - parentAbsPos.y,
                    rotation : wickObject.paper.rotation,
                });
            }
        });
        wickEditor.actionHandler.doAction('modifyObjects', {
            objs: objs,
            modifiedStates: modifiedStates
        });
    }

    self.forceUpdateSelection = function () {
        updateSelection();
    }

    function updateSelection () {
        paper.settings.handleSize = 10;
        paper.project.activeLayer.children.forEach(function (child) {
            if(!child.wick) return;
            if(wickEditor.project.isObjectSelected(child.wick)) {
                if(!selectionBoundsRect) {
                    selectionBoundsRect = child.bounds.clone()
                } else {
                    selectionBoundsRect = selectionBoundsRect.unite(child.bounds);
                }
            }
        });

        selectionBoundsRect = null;

        paper.project.activeLayer.children.forEach(function (child) {
            if(!child.wick) return;
            if(wickEditor.project.isObjectSelected(child.wick)) {
                if(!selectionBoundsRect) {
                    selectionBoundsRect = child.bounds.clone()
                } else {
                    selectionBoundsRect = selectionBoundsRect.unite(child.bounds);
                }
            }
        });

        if(selectionRect) selectionRect.remove();
        if(scaleBR) scaleBR.remove();
        if(scaleBL) scaleBL.remove();
        if(scaleTL) scaleTL.remove();
        if(scaleTR) scaleTR.remove();
        if(scaleT) scaleT.remove();
        if(scaleB) scaleB.remove();
        if(scaleL) scaleL.remove();
        if(scaleR) scaleR.remove();
        if(rotateTL) rotateTL.remove();
        if(rotateTR) rotateTR.remove();
        if(rotateBL) rotateBL.remove();
        if(rotateBR) rotateBR.remove();
        if(individualObjectBoxes) {
            individualObjectBoxes.forEach(function (o) {
                o.remove();
            })
        }

        if(selectionBoundsRect) {
            //selectionBoundsRect = selectionBoundsRect.expand(10);
            var strokeWidth = 1/wickEditor.canvas.getZoom();

            selectionRect = new paper.Path.Rectangle(selectionBoundsRect);
            selectionRect.strokeColor = GUI_DOTS_STROKECOLOR;
            selectionRect.strokeWidth = strokeWidth;
            selectionRect._wickInteraction = 'selectionRect';
            selectionRect.locked = true;

            var dotSize = GUI_DOTS_SIZE/wickEditor.canvas.getZoom();

            individualObjectBoxes = [];
            var selectedObjs = wickEditor.project.getSelectedObjectsByType(WickObject)
            if(selectedObjs.length > 1) {
                selectedObjs.forEach(function (o) {
                    var oRect = new paper.Rectangle(o.paper.bounds);
                    var oPaperRect = new paper.Path.Rectangle(oRect);
                    oPaperRect.strokeWidth = strokeWidth;
                    oPaperRect.strokeColor = GUI_DOTS_STROKECOLOR;
                    oPaperRect._wickInteraction = 'individualObjectBox';
                    individualObjectBoxes.push(oPaperRect);
                });
            }

            var rotateHandleLength = ROTATE_HANDLE_LENGTH/wickEditor.canvas.getZoom()

            rotateTL = new paper.Path.Ellipse({
                center: selectionBoundsRect.topLeft,
                radius: rotateHandleLength
            });
            rotateTL.fillColor = HIDDEN_ROTATE_HANDLE_COLOR;
            rotateTL._wickInteraction = 'rotate';
            rotateTL._cursor = 'url("resources/cursor-rotate.png") 32 32,default';

            rotateTR = new paper.Path.Ellipse({
                center: selectionBoundsRect.topRight,
                radius: rotateHandleLength
            });
            rotateTR.fillColor = HIDDEN_ROTATE_HANDLE_COLOR;
            rotateTR._wickInteraction = 'rotate';
            rotateTR._cursor = 'url("resources/cursor-rotate.png") 32 32,default';

            rotateBL = new paper.Path.Ellipse({
                center: selectionBoundsRect.bottomLeft,
                radius: rotateHandleLength
            });
            rotateBL.fillColor = HIDDEN_ROTATE_HANDLE_COLOR;
            rotateBL._wickInteraction = 'rotate';
            rotateBL._cursor = 'url("resources/cursor-rotate.png") 32 32,default';

            rotateBR = new paper.Path.Ellipse({
                center: selectionBoundsRect.bottomRight,
                radius: rotateHandleLength
            });
            rotateBR.fillColor = HIDDEN_ROTATE_HANDLE_COLOR;
            rotateBR._wickInteraction = 'rotate';
            rotateBR._cursor = 'url("resources/cursor-rotate.png") 32 32,default';

            scaleBR = new paper.Path.Circle(selectionBoundsRect.bottomRight, dotSize);
            scaleBR.fillColor = GUI_DOTS_FILLCOLOR;
            scaleBR.strokeColor = GUI_DOTS_STROKECOLOR;
            scaleBR.strokeWidth = strokeWidth;
            scaleBR._wickInteraction = 'scaleBR';
            scaleBR._cursor = 'nwse-resize';

            scaleBL = new paper.Path.Circle(selectionBoundsRect.bottomLeft, dotSize);
            scaleBL.fillColor = GUI_DOTS_FILLCOLOR;
            scaleBL.strokeColor = GUI_DOTS_STROKECOLOR;
            scaleBL.strokeWidth = strokeWidth;
            scaleBL._wickInteraction = 'scaleBL';
            scaleBL._cursor = 'nesw-resize';

            scaleTL = new paper.Path.Circle(selectionBoundsRect.topLeft, dotSize);
            scaleTL.fillColor = GUI_DOTS_FILLCOLOR;
            scaleTL.strokeColor = GUI_DOTS_STROKECOLOR;
            scaleTL.strokeWidth = strokeWidth;
            scaleTL._wickInteraction = 'scaleTL';
            scaleTL._cursor = 'nwse-resize';

            scaleTR = new paper.Path.Circle(selectionBoundsRect.topRight, dotSize);
            scaleTR.fillColor = GUI_DOTS_FILLCOLOR;
            scaleTR.strokeColor = GUI_DOTS_STROKECOLOR;
            scaleTR.strokeWidth = strokeWidth;
            scaleTR._wickInteraction = 'scaleTR';
            scaleTR._cursor = 'nesw-resize';

            scaleT = new paper.Path.Circle(selectionBoundsRect.topCenter, dotSize);
            scaleT.fillColor = GUI_DOTS_FILLCOLOR;
            scaleT.strokeColor = GUI_DOTS_STROKECOLOR;
            scaleT.strokeWidth = strokeWidth;
            scaleT._wickInteraction = 'scaleT';
            scaleT._cursor = 'ns-resize';

            scaleB = new paper.Path.Circle(selectionBoundsRect.bottomCenter, dotSize);
            scaleB.fillColor = GUI_DOTS_FILLCOLOR;
            scaleB.strokeColor = GUI_DOTS_STROKECOLOR;
            scaleB.strokeWidth = strokeWidth;
            scaleB._wickInteraction = 'scaleB';
            scaleB._cursor = 'ns-resize';

            scaleL = new paper.Path.Circle(selectionBoundsRect.leftCenter, dotSize);
            scaleL.fillColor = GUI_DOTS_FILLCOLOR;
            scaleL.strokeColor = GUI_DOTS_STROKECOLOR;
            scaleL.strokeWidth = strokeWidth;
            scaleL._wickInteraction = 'scaleL';
            scaleL._cursor = 'ew-resize';

            scaleR = new paper.Path.Circle(selectionBoundsRect.rightCenter, dotSize);
            scaleR.fillColor = GUI_DOTS_FILLCOLOR;
            scaleR.strokeColor = GUI_DOTS_STROKECOLOR;
            scaleR.strokeWidth = strokeWidth;
            scaleR._wickInteraction = 'scaleR';
            scaleR._cursor = 'ew-resize';
        }
    }

}