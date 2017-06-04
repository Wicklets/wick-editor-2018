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
        return "Pen";
    }

    this.setup = function () {

    }

    this.paperTool = new paper.Tool();

    var hitResult;
    var addedPoint;

    this.paperTool.onMouseDown = function(event) {

        if(wickEditor.currentTool instanceof Tools.FillBucket) {
            var hitOptions = {
                fill: true,
                stroke: true,
                tolerance: 5 / wickEditor.fabric.getCanvasTransform().zoom
            }
            hitResult = paper.project.hitTest(event.point, hitOptions);
            if(!hitResult) return;

            if(hitResult.type === 'fill') {
                wickEditor.paper.pathRoutines.setFillColor([event.item.wick], wickEditor.settings.fillColor);
            } else if (hitResult.type === 'stroke') {
                wickEditor.paper.pathRoutines.setStrokeColor([event.item.wick], wickEditor.settings.strokeColor);
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

                    var avgMag;// = (handleInMag + handleOutMag)/2;
                    if(handleInMag > handleOutMag) {
                        avgMag = handleOutMag;
                        addedPoint.handleIn.x = -addedPoint.handleOut.x
                        addedPoint.handleIn.y = -addedPoint.handleOut.y
                    } else {
                        avgMag = handleInMag;
                        addedPoint.handleOut.x = -addedPoint.handleIn.x
                        addedPoint.handleOut.y = -addedPoint.handleIn.y
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

    this.paperTool.onMouseMove = function(event) {
        // cursor icon selection

        /*if(!active) {
            wickEditor.cursorIcon.hide()
            return;
        }

        /*var fillbucketMode = (wickEditor.currentTool instanceof Tools.FillBucket);
        if(fillbucketMode) {
            paperCanvas.style.cursor = 'url(/resources/fillbucket-cursor.png) 64 64,default';
        } else {
            paperCanvas.style.cursor = 'auto';
        }

        refreshSelection()
        if (event.item) 
            event.item.selected = true;

        var hitOptions = {
            segments: !fillbucketMode,
            fill: true,
            curves: !fillbucketMode,
            handles: showHandles && !fillbucketMode,
            stroke: fillbucketMode,
            tolerance: 5 / wickEditor.fabric.getCanvasTransform().zoom
        }

        hitResult = paper.project.hitTest(event.point, hitOptions);
        //console.log(hitResult)
        if(hitResult) {
            if(!hitResult.item.selected) {
                wickEditor.cursorIcon.hide()
                return;
            } else if(hitResult.type === 'curve' ||
                      hitResult.type === 'stroke') {
                wickEditor.cursorIcon.setImage('/resources/cursor-curve.png')
            } else if(hitResult.type === 'fill') {

                if(fillbucketMode) {
                    wickEditor.cursorIcon.setImage('/resources/cursor-segment.png')
                } else {
                    wickEditor.cursorIcon.setImage('/resources/cursor-fill.png')
                }

                
            } else if(hitResult.type === 'segment' ||
                      hitResult.type === 'handle-in' ||
                      hitResult.type === 'handle-out') {
                wickEditor.cursorIcon.setImage('/resources/cursor-segment.png')
            } else {
                wickEditor.cursorIcon.hide()
            }
        } else {
            if(fillbucketMode) {
                wickEditor.cursorIcon.setImage('/resources/cursor-no.png')
            } else {
                 wickEditor.cursorIcon.hide()
            }
        }*/
        
    }

    this.paperTool.onMouseDrag = function(event) {
        if(!hitResult) return;

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
            if(event.modifiers.shift) {
                hitResult.segment.clearHandles()
            }
        } else if (hitResult.type === 'handle-in') {
            hitResult.segment.handleIn.x += event.delta.x;
            hitResult.segment.handleIn.y += event.delta.y;
            if(!event.modifiers.shift) {
                hitResult.segment.handleOut.x -= event.delta.x;
                hitResult.segment.handleOut.y -= event.delta.y;
            }
        } else if (hitResult.type === 'handle-out') {
            hitResult.segment.handleOut.x += event.delta.x;
            hitResult.segment.handleOut.y += event.delta.y;
            if(!event.modifiers.shift) {
                hitResult.segment.handleIn.x -= event.delta.x;
                hitResult.segment.handleIn.y -= event.delta.y;
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

        var path = hitResult.item;

        var parent = path.parent;
        var grandparent = parent.parent;

        var pathToModify;
        if(parent instanceof paper.Group) {
            pathToModify = parent;
        } else if (grandparent instanceof paper.Group) {
            pathToModify = grandparent;
        }

        var wickObject = pathToModify.wick;
        var parentAbsPos = wickObject.parentObject ? wickObject.parentObject.getAbsolutePosition() : {x:0,y:0};

        var modifiedStates = [{
            x: pathToModify.bounds._x + pathToModify.bounds._width /2 - parentAbsPos.x,
            y: pathToModify.bounds._y + pathToModify.bounds._height/2 - parentAbsPos.y,
            //pathData: '<svg id="svg" version="1.1" width="'+pathToModify.bounds._width+'" height="'+pathToModify.bounds._height+'" xmlns="http://www.w3.org/2000/svg">' +pathToModify.exportSVG({asString:true})+ '</svg>'
            pathData: pathToModify.exportSVG({asString:true})
        }];
        var modifiedObjects = [
            pathToModify.wick
        ];
        wickEditor.actionHandler.doAction('modifyObjects', {
            objs: modifiedObjects,
            modifiedStates: modifiedStates
        });
    }

}