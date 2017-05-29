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
    
var PaperInterface = function (wickEditor) {

    var self = this;

    var tool;

    var active;

    var hitResult;
    var addedPoint;

    var showHandles;

    var paperCanvas;

    self.setup = function () {
        self.needsUpdate = true;
        showHandles = true;

        this.pathRoutines = new PathRoutines(this, wickEditor);

        // Create the canvas to be used with paper.js and init the paper.js instance.
        paperCanvas = document.createElement('canvas');
        paperCanvas.className = 'paperCanvas';
        paperCanvas.style.backgroundColor = "rgb(0,0,0,0)";
        paperCanvas.style.position = 'absolute';
        paperCanvas.style.top = "0px";
        paperCanvas.style.left = "0px";
        paperCanvas.style.width  = window.innerWidth+'px';
        paperCanvas.style.height = window.innerHeight+'px';
        paper.setup(paperCanvas);
        paper.settings.handleSize = 10;
        paper.view.viewSize.width  = window.innerWidth;
        paper.view.viewSize.height = window.innerHeight;

        window.addEventListener('resize', function () {
            paperCanvas.style.width  = window.innerWidth+'px';
            paperCanvas.style.height = window.innerHeight+'px';
            paper.view.viewSize.width  = window.innerWidth;
            paper.view.viewSize.height = window.innerHeight;
        }, false);
        paper.view.viewSize.width  = window.innerWidth;
        paper.view.viewSize.height = window.innerHeight;

        document.getElementById('editorCanvasContainer').appendChild(paperCanvas);

        /*var point = new paper.Point(220, 220);
        var size = new paper.Size(60, 60);
        var path = new paper.Path.Rectangle(point, size);
        path.fillColor = { hue: Math.random() * 360, saturation: 1, lightness: 1.0 };
        path.strokeColor = 'black';*/

        tool = new paper.Tool();

        tool.onMouseDown = function(event) {

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
                handles: showHandles,
                //stroke: true,
                tolerance: 5 / wickEditor.fabric.getCanvasTransform().zoom
            }

            hitResult = paper.project.hitTest(event.point, hitOptions);
            //console.log(hitResult)
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

                //console.log(event)
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

                        /*console.log(handleInMag)
                        console.log(handleOutMag)

                        if(handleOutMag && handleInMag) {
                            addedPoint.handleIn.x /= handleInMag;
                            addedPoint.handleIn.y /= handleInMag;
                            addedPoint.handleOut.x /= handleOutMag;
                            addedPoint.handleOut.y /= handleOutMag;

                            addedPoint.handleIn.x *= avgMag;
                            addedPoint.handleIn.y *= avgMag;
                            addedPoint.handleOut.x *= avgMag;
                            addedPoint.handleOut.y *= avgMag;
                        } else if(handleOutMag) {
                            addedPoint.handleIn.x = -addedPoint.handleOut.x
                            addedPoint.handleIn.y = -addedPoint.handleOut.y
                        } else if(handleOutMag) {
                            addedPoint.handleOut.x = -addedPoint.handleIn.x
                            addedPoint.handleOut.y = -addedPoint.handleIn.y
                        }*/

                    }
                } else {
                    addedPoint = null;
                }
            } else {
                wickEditor.project.clearSelection();
                wickEditor.syncInterfaces();
            }

            /*if(event.item) {
                event.item.selected = true;
                selected = event.item;
            } else {
                paper.project.activeLayer.selected = false;
            }*/

            /*segment = path = null;
            var hitOptions = {
                segments: true,
                stroke: true,
                fill: true,
                curves: true,
                handles: true,
                //guides: true,
                tolerance: 5 / wickEditor.fabric.getCanvasTransform().zoom
            };
            var hitResult = paper.project.hitTest(event.point, hitOptions);
            if (!hitResult) {
                paper.project.activeLayer.selected = false
                return;
            }

            if (event.item) {
                paper.project.activeLayer.selected = false
                event.item.selected = true;
                event.item.fullySelected = true;
            }

            if (event.modifiers.shift) {
                if (hitResult.type == 'segment') {
                    hitResult.segment.remove();
                };
                return;
            }

            if (hitResult) {
                console.log(hitResult)

                path = hitResult.item;
                if (hitResult.type == 'segment') {
                    segment = hitResult.segment;
                } else if (hitResult.type == 'stroke') {
                    var location = hitResult.location;
                    segment = path.insert(location.index + 1, event.point);
                    path.smooth();
                } else if (hitResult.type == 'curve') {
                    var location = hitResult.location;
                    segment = path.insert(location.index + 1, event.point);
                    //path.smooth();
                }
            }*/
        }

        tool.onMouseMove = function(event) {
            if(!active) {
                wickEditor.cursorIcon.hide()
                return;
            }

            var fillbucketMode = (wickEditor.currentTool instanceof Tools.FillBucket);
            if(fillbucketMode) {
                paperCanvas.style.cursor = 'url(/resources/fillbucket-cursor.png) 64 64,default';
            } else {
                paperCanvas.style.cursor = 'auto';
            }

            //paper.project.activeLayer.selected = false;
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
            }
            // Use this to determine cursor icon type
        }

        tool.onMouseDrag = function(event) {
            if(!hitResult) return;

            if(wickEditor.currentTool instanceof Tools.FillBucket)  return;

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

        tool.onMouseUp = function (event) {
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

    self.smoothPath = function () {
        hitResult.item.smooth()
    }

    self.simplifyPath = function () {
        hitResult.item.simplify()
    }

    self.flattenPath = function () {
        hitResult.item.flatten()
    }
   
    self.smoothPoint = function () {
        hitResult.segment.smooth()
    }

    self.setStrokeCap = function (newStrokeCap) {
        // 'round', 'square', 'butt'
        //console.log(hitResult.item)
        hitResult.item.strokeCap = newStrokeCap;
    }

    self.setStrokeJoin = function (newStrokeJoin) {
        // 'miter', 'round', 'bevel'
         hitResult.item.strokeJoin = newStrokeJoin;
    }

    self.setShadow = function () {
        hitResult.item.shadowColor = new paper.Color(0, 0, 0),
        // Set the shadow blur radius to 12:
        hitResult.item.shadowBlur = 12,
        // Offset the shadow by { x: 5, y: 5 }
        hitResult.item.shadowOffset = new paper.Point(5, 5)
    }

    self.getItem = function () {
        return hitResult.item;
    }

    self.syncWithEditorState = function () {

        var lastActive = active;

        active = (wickEditor.currentTool instanceof Tools.FillBucket)
              || (wickEditor.currentTool instanceof Tools.Pen);

        if(active) {

            paperCanvas.style.display = 'block';

            var canvasTransform = wickEditor.fabric.getCanvasTransform();
            paper.view.matrix = new paper.Matrix();
            paper.view.matrix.translate(new paper.Point(canvasTransform.x,canvasTransform.y))
            paper.view.matrix.scale(canvasTransform.zoom)

            refreshSelection();

            if(!self.needsUpdate) return;
            self.needsUpdate = false;

            paper.project.activeLayer.removeChildren();

            var activeObjects = wickEditor.project.getCurrentObject().getAllActiveChildObjects();
            activeObjects.forEach(function (wickObject) {
                if(!wickObject.isPath) return;
                
                self.pathRoutines.refreshPathData(wickObject);
                self.pathRoutines.regenPaperJSState(wickObject);
                paper.project.activeLayer.addChild(wickObject.paper);
                
                var absPos = wickObject.getAbsolutePosition();
                wickObject.paper.position.x = absPos.x;
                wickObject.paper.position.y = absPos.y;

                /*wickObject.paper.position.x = wickObject.x;
                wickObject.paper.position.y = wickObject.y;*/
                
                wickObject.paper.wick = wickObject;
            });

            refreshSelection();
        } else {
            active = false;

            wickEditor.cursorIcon.hide();

            paperCanvas.style.display = 'none';
        }

    }

    function refreshSelection () {

        paper.project.activeLayer.selected = false;
        paper.project.activeLayer.children.forEach(function (child) {
            if(wickEditor.project.isObjectSelected(child.wick)) {
                child.selected = true;
                if(showHandles) {
                    child.fullySelected = true;
                } 
            }
        });

    }

 }
