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

Tools.Pen = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        return "crosshair"
    };

    this.getToolbarIcon = function () {
        return "resources/tools/Vector.svg";
    }

    this.getTooltipName = function () {
        return "Path Cursor";
    }

    this.setup = function () {

    }

    this.paperTool = new paper.Tool();

    var hitResult;
    var addedPoint;

    var lastEvent;

    this.paperTool.onMouseDown = function(event) {

        if(lastEvent 
        && event.timeStamp-lastEvent.timeStamp<300 
        && event.point.x===lastEvent.point.x
        && event.point.y===lastEvent.point.y) {
            that.paperTool.onDoubleClick(event);
            return;
        }
        lastEvent = event;

        if(wickEditor.currentTool instanceof Tools.FillBucket) {
            var hitOptions = {
                fill: true,
                stroke: true,
                tolerance: 5 / wickEditor.fabric.getCanvasTransform().zoom
            }
            hitResult = paper.project.hitTest(event.point, hitOptions);
            if(!hitResult) {
                //console.log(PaperHoleFinder.getHoleShapeAtPosition(paper.project, event.point));
                var hole = PaperHoleFinder.getHoleShapeAtPosition(paper.project, event.point);
                if(hole) {
                    hole.fillColor = wickEditor.settings.fillColor;
                    hole.strokeColor = wickEditor.settings.fillColor;
                    hole.strokeWidth = 3;
                    var superPathString = hole.exportSVG({asString:true});
                    var svgString = '<svg id="svg" version="1.1" width="'+hole.bounds._width+'" height="'+hole.bounds._height+'" xmlns="http://www.w3.org/2000/svg">' +superPathString+ '</svg>'
                    var superPathWickObject = WickObject.createPathObject(svgString);
                    superPathWickObject.x = hole.position.x;
                    superPathWickObject.y = hole.position.y;
                    wickEditor.paper.pathRoutines.refreshPathData(superPathWickObject)
                    wickEditor.actionHandler.doAction('addObjects', {
                        wickObjects: [superPathWickObject],
                        sendToBack: true,
                        dontSelectObjects: true
                    });
                }
            } else {
                if(hitResult.type === 'fill') {
                    wickEditor.paper.pathRoutines.setFillColor([event.item.wick], wickEditor.settings.fillColor);
                } else if (hitResult.type === 'stroke') {
                    wickEditor.paper.pathRoutines.setStrokeColor([event.item.wick], wickEditor.settings.strokeColor);
                }
            }
            
            return;
        }

        var hitOptions = {
            segments: true,
            fill: true,
            curves: true,
            handles: true,
            tolerance: 5 / wickEditor.fabric.getCanvasTransform().zoom
        }

        hitResult = paper.project.hitTest(event.point, hitOptions);
        if(hitResult) {
            if(hitResult.item) {

                hitResult.item.strokeCap = 'round';
                hitResult.item.strokeJoin = 'round';

                var newlySelected = !wickEditor.project.isObjectSelected(hitResult.item.parent.wick)

                wickEditor.project.clearSelection();
                var wickObj = hitResult.item.parent.wick;
                wickEditor.project.selectObject(wickObj);
                wickEditor.syncInterfaces();

                if(newlySelected) return;
            }

            if (hitResult.type == 'segment' && event.modifiers.alt) {
                hitResult.segment.remove();
            }

            if (hitResult.type == 'curve') {
                var location = hitResult.location;
                var path = hitResult.item;

                addedPoint = path.insert(location.index + 1, event.point);

                if(!event.modifiers.shift) {
                    addedPoint.smooth()

                    //console.log(addedPoint.handleIn)
                    //console.log(addedPoint.handleOut)

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

        wickEditor.paper.updateCursor(event);
        
    }

    this.paperTool.onMouseDrag = function(event) {
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
            hitResult.item.position = new paper.Point(
                hitResult.item.position.x + event.delta.x,
                hitResult.item.position.y + event.delta.y
            );
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

        /*if (segment) {
            segment.point = new paper.Point(
                segment.point.x + event.delta.x, 
                segment.point.y + event.delta.y);
            //path.smooth();
        } else if (path) {
            path.position = new paper.Point(
                path.position.x + event.delta.x, 
                path.position.y + event.delta.y);
        } else if (guide) {
            guide.position = new paper.Point(
                guide.position.x + event.delta.x, 
                guide.position.y + event.delta.y);
        }*/
    }

    this.paperTool.onMouseUp = function (event) {
        if(!hitResult) return;
        if(!hitResult.item) return;
        if(wickEditor.currentTool instanceof Tools.FillBucket) return;

        console.log('Check for hitTest on first segment, this means we gotta close the path')

        wickEditor.paper.refreshSVGWickObject(hitResult.item);
    }

}