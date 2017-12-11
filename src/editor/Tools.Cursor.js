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
        return "Cursor (C)";
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

        if(event.item && event.item._wickInteraction) {
            transformMode = event.item._wickInteraction
            return;
        }
        
        var hitOptions = {
            segments: true,
            fill: true,
            curves: true,
            handles: true,
            tolerance: 5 / wickEditor.canvas.getZoom()
        }
        hitResult = paper.project.hitTest(event.point, hitOptions);
        if(hitResult) {
            if(hitResult.item) {
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

                if(newlySelected) return;
            }

            if (hitResult.type == 'segment') {
                if(event.modifiers.alt || 
                    event.modifiers.command ||
                    event.modifiers.control ||
                    event.modifiers.option ||
                    event.modifiers.shift ||
                    event.event.button === 2) {
                    hitResult.segment.remove();
                }
            }

            if (hitResult.type == 'curve') {
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

                    //var avgMag;// = (handleInMag + handleOutMag)/2;
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
        } else {
            wickEditor.project.clearSelection();
            wickEditor.syncInterfaces();

            makingSelectionSquare = true;
            selectionSquareTopLeft = event.point;
            selectionSquareBottomRight = event.point
        }

    }

    this.paperTool.onDoubleClick = function (event) {
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
        }
    }

    this.paperTool.onMouseMove = function(event) {
        wickEditor.canvas.getInteractiveCanvas().highlightHoveredOverObject(event);
        wickEditor.cursorIcon.setImageForPaperEvent(event)
        //wickEditor.canvas.getInteractiveCanvas().updateCursorIcon(event);
    }

    this.paperTool.onMouseDrag = function(event) {

        if(transformMode === 'scaleBR') {
            wickEditor.project.getSelectedObjects().forEach(function (o) {
                o.paper.scale(0.9, 0.9, new paper.Point(0,0))
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

        wickEditor.canvas.getInteractiveCanvas().highlightHoveredOverObject(event);

        if(!hitResult) return;

        function handlesAreOpposite() {
            var a = hitResult.segment.handleIn;
            var b = hitResult.segment.handleOut;
            var dx = Math.abs(a.x - -b.x);
            var dy = Math.abs(a.y - -b.y);
            var tol = 1;
            return dx < tol && dy < tol;
        }

        if(hitResult.type === 'fill') {
            /*console.log(hitResult.item)
            hitResult.item.position = new paper.Point(
                hitResult.item.position.x + event.delta.x,
                hitResult.item.position.y + event.delta.y
            );*/
            wickEditor.project.getSelectedObjects().forEach(function (o) {
                o.paper.position = new paper.Point(
                    o.paper.position.x + event.delta.x,
                    o.paper.position.y + event.delta.y
                );
            });
        } else if (hitResult.type === 'segment') {
            hitResult.segment.point = new paper.Point(
                hitResult.segment.point.x + event.delta.x, 
                hitResult.segment.point.y + event.delta.y
            );
            /*if(event.modifiers.shift) {
                hitResult.segment.clearHandles()
            }*/
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