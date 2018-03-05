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

Tools.VectorCursor = function (wickEditor) {

    var self = this;

    this.getCursorImage = function () {
        return "auto"
    };

    this.getToolbarIcon = function () {
        return "resources/tools/PathCursor.svg";
    }

    this.getTooltipName = function () {
        return "Path Cursor (P)";
    }

    this.setup = function () {

    }

    this.onSelected = function () {
        wickEditor.inspector.clearSpecialMode();
        wickEditor.canvas.getInteractiveCanvas().needsUpdate = true;
    }

    this.paperTool = new paper.Tool();

    var makingSelectionSquare = false;
    var selectionSquare = null;
    var selectionSquareTopLeft;
    var selectionSquareBottomRight;

    var hitResult;
    var addedPoint;

    var lastEvent;

    var baseTol = 3;
    var hitOptions = {
        allowGroups: false,
        segments: true,
        fill: true,
        curves: true,
        handles: true,
        stroke: true,
        tolerance: 5,
    }

    var hitResult;
    var pathHoverGhost;

    this.paperTool.onMouseMove = function(event) {
        //hitOptions.tolerance = baseTol / wickEditor.canvas.getZoom();
        hitResult = wickEditor.canvas.getInteractiveCanvas().getItemAtPoint(event.point, hitOptions);

        if(pathHoverGhost) pathHoverGhost.remove();
        pathHoverGhost = null;
        if(hitResult && !hitResult.item._wickInteraction) {
            var wickObj = hitResult.item.wick || hitResult.item.parent.wick;
            if(!wickEditor.project.isObjectSelected(wickObj)) {
                if(wickObj.isSymbol || wickObj.isImage) {
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
            if(hitResult.type === 'curve' || hitResult.type === 'stroke') {
                wickEditor.cursorIcon.setImage('resources/cursor-curve.png')
            } else if(hitResult.type === 'fill') {
                wickEditor.cursorIcon.setImage('resources/cursor-fill.png')
            } else if(hitResult.type === 'segment' ||
                      hitResult.type === 'handle-in' ||
                      hitResult.type === 'handle-out') {
                wickEditor.cursorIcon.setImage('resources/cursor-segment.png')
            } else {
                wickEditor.cursorIcon.hide()
            }
        } else {
            wickEditor.cursorIcon.hide()
        }

        /*self.setImage('resources/cursor-curve.png')
            } else if(hitResult.type === 'fill') {
                self.setImage('resources/cursor-fill.png')
            } else if(hitResult.type === 'segment' ||
                      hitResult.type === 'handle-in' ||
                      hitResult.type === 'handle-out') {
                self.setImage('resources/cursor-segment.png')*/

        /*if(hitResult && hitResult.item && hitResult.item.wick && wickEditor.project.isObjectSelected(hitResult.item.wick)) {
            wickEditor.cursorIcon.setImageForPaperEvent(event)
        } else {
            wickEditor.cursorIcon.hide();

            if(hitResult && hitResult.item._cursor)
                wickEditor.canvas.getCanvasContainer().style.cursor = hitResult.item._cursor;
            else if (hitResult && !hitResult.item._wickInteraction)
                wickEditor.canvas.getCanvasContainer().style.cursor = 'move';
            else
                wickEditor.canvas.updateCursor();
        }*/
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
        
        if(hitResult) {
            if(hitResult.item.selected) {
                if(hitResult.type === 'fill') {
                    
                }

                if (hitResult.type == 'segment') {
                    if(event.modifiers.alt || 
                        event.modifiers.command ||
                        event.modifiers.control ||
                        event.modifiers.option ||
                        event.modifiers.shift) {
                        hitResult.segment.remove();
                        modifySelectedPath();
                    }
                }

                if (hitResult.type == 'stroke' || hitResult.type == 'curve') {
                    var location = hitResult.location;
                    var path = hitResult.item;

                    addedPoint = path.insert(location.index + 1, event.point);

                    if(!event.modifiers.shift) {
                        addedPoint.smooth()

                        var handleInMag = Math.sqrt(
                            addedPoint.handleIn.x*addedPoint.handleIn.x+
                            addedPoint.handleIn.y+addedPoint.handleIn.y)
                        var handleOutMag = Math.sqrt(
                            addedPoint.handleOut.x*addedPoint.handleOut.x+
                            addedPoint.handleOut.y+addedPoint.handleOut.y)

                        if(handleInMag > handleOutMag) {
                            avgMag = handleOutMag;
                            addedPoint.handleIn.x = -addedPoint.handleOut.x*1.5;
                            addedPoint.handleIn.y = -addedPoint.handleOut.y*1.5;
                            addedPoint.handleOut.x *= 1.5;
                            addedPoint.handleOut.y *= 1.5;
                        } else {
                            avgMag = handleInMag;
                            addedPoint.handleOut.x = -addedPoint.handleIn.x*1.5;
                            addedPoint.handleOut.y = -addedPoint.handleIn.y*1.5;
                            addedPoint.handleIn.x *= 1.5;
                            addedPoint.handleIn.y *= 1.5;
                        }
                    }
                } else {
                    addedPoint = null;
                }
            }

            var wickObj = hitResult.item.wick || hitResult.item.parent.wick;
            if(wickObj) {
                if(wickEditor.project.isObjectSelected(wickObj)) {
                    if(event.modifiers.shift && !hitResult.type.startsWith('handle')) {
                        wickEditor.project.deselectObject(wickObj);
                        wickEditor.syncInterfaces();
                    }
                } else {
                    if(!event.modifiers.shift) {
                        wickEditor.project.clearSelection();
                    }
                    wickEditor.project.selectObject(wickObj);
                    var currObj = wickEditor.project.getCurrentObject();
                    currObj.currentLayer = currObj.layers.indexOf(wickObj.parentFrame.parentLayer);
                    wickEditor.syncInterfaces();
                }
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

    }

    this.paperTool.onDoubleClick = function (event) {
        //hitOptions.tolerance = baseTol / wickEditor.canvas.getZoom();
        hitResult = wickEditor.canvas.getInteractiveCanvas().getItemAtPoint(event.point, hitOptions);

        if (hitResult && hitResult.type === 'segment') {
            var hix = hitResult.segment.handleIn.x;
            var hiy = hitResult.segment.handleIn.y;
            var hox = hitResult.segment.handleOut.x;
            var hoy = hitResult.segment.handleOut.y;
            if(hix === 0 && hiy === 0 && hix === 0 && hiy === 0) {
                hitResult.segment.smooth();
            } else {
                hitResult.segment.handleIn.x = 0;
                hitResult.segment.handleIn.y = 0;
                hitResult.segment.handleOut.x = 0;
                hitResult.segment.handleOut.y = 0;
            }
            modifySelectedPath();
            resetSelection(event)
        }
    }

    this.paperTool.onMouseDrag = function (event) {

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
            
        }

        if(!hitResult) return;

        if(hitResult.type === 'fill') {
            paper.project.activeLayer.children.forEach(function (child) {
                if(child.selected) {
                    child.position.x += event.delta.x;
                    child.position.y += event.delta.y;
                }
            });
        } 

        if (hitResult.type === 'segment') {

            hitResult.segment.point = new paper.Point(
                hitResult.segment.point.x + event.delta.x, 
                hitResult.segment.point.y + event.delta.y
            );

        }

        if( hitResult.type.startsWith('handle')) {
            var otherHandle;
            var handle;
            if(hitResult.type === 'handle-in') {
                handle = hitResult.segment.handleIn;
                otherHandle = hitResult.segment.handleOut;
            } else if (hitResult.type === 'handle-out') {
                handle = hitResult.segment.handleOut;
                otherHandle = hitResult.segment.handleIn;
            }

            handle.x += event.delta.x;
            handle.y += event.delta.y;
            if(!event.modifiers.shift) {
                otherHandle.x -= event.delta.x;
                otherHandle.y -= event.delta.y;
            }
        }

        if(addedPoint) {
            addedPoint.point = new paper.Point(
                addedPoint.point.x + event.delta.x, 
                addedPoint.point.y + event.delta.y
            );
            addedPoint.smooth()
        }

        /*if(!hitResult) return;

        if(hitResult.type === 'fill') {

            hitResult.item.position = new paper.Point(
                hitResult.item.position.x + event.delta.x,
                hitResult.item.position.y + event.delta.y
            );

        }*/

        /*if(!hitResult) return;

        function handlesAreOpposite() {
            var a = hitResult.segment.handleIn;
            var b = hitResult.segment.handleOut;
            var dx = Math.abs(a.x - -b.x);
            var dy = Math.abs(a.y - -b.y);
            var tol = 1;
            return dx < tol && dy < tol;
        }

        if(hitResult.type === 'fill') {

            hitResult.item.position = new paper.Point(
                hitResult.item.position.x + event.delta.x,
                hitResult.item.position.y + event.delta.y
            );

        } else if (hitResult.type === 'segment') {
            hitResult.segment.point = new paper.Point(
                hitResult.segment.point.x + event.delta.x, 
                hitResult.segment.point.y + event.delta.y
            );

        } else if (hitResult.type.startsWith('handle')) {

            var otherHandle;
            var handle;
            var opposite = handlesAreOpposite();
            if(hitResult.type === 'handle-in') {
                handle = hitResult.segment.handleIn;
                otherHandle = hitResult.segment.handleOut;
            } else if (hitResult.type === 'handle-out') {
                handle = hitResult.segment.handleOut;
                otherHandle = hitResult.segment.handleIn;
            }

            handle.x += event.delta.x;
            handle.y += event.delta.y;
            if(!event.modifiers.shift && opposite) {
                otherHandle.x -= event.delta.x;
                otherHandle.y -= event.delta.y;
            }
        }

        if(addedPoint) {
            addedPoint.point = new paper.Point(
                addedPoint.point.x + event.delta.x, 
                addedPoint.point.y + event.delta.y
            );
        }*/

    }

    this.paperTool.onMouseUp = function (event) {

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
        } else {
            if(hitResult && hitResult.item && !(event.delta.x === 0 && event.delta.y === 0)) {
                modifySelectedPath();
            }
        }

        resetSelection(event);

        //hitOptions.tolerance = baseTol / wickEditor.canvas.getZoom();
        hitResult = wickEditor.canvas.getInteractiveCanvas().getItemAtPoint(event.point, hitOptions);

    }

    function resetSelection (event) {
        //hitResult = wickEditor.canvas.getInteractiveCanvas().getItemAtPoint(event.point);

        /*if(hitResult && hitResult.item && !hitResult.item._wickInteraction) {
            paper.project.activeLayer.selected = false;
            paper.project.deselectAll();
            hitResult.item.selected = true;
            hitResult.item.fullySelected = true;
        }*/

        //wickEditor.cursorIcon.setImageForPaperEvent(event)

        paper.project.activeLayer.selected = false;
        paper.project.deselectAll();
        paper.project.activeLayer.children.forEach(function (child) {
            if(!child.wick) return;
            if(wickEditor.project.isObjectSelected(child.wick)) {
                if(child.wick.isSymbol) {

                } else {
                    //child.selected = true;
                    child.fullySelected = true;
                }
            }
        });
    }

    self.forceUpdateSelection = function () {
        resetSelection();
    }

    function modifySelectedPath () {

        var objs = wickEditor.project.getSelectedObjects();
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

}