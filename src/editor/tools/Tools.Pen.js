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

    var drawingPathUUID;

    this.getCursorImage = function () {
        return "crosshair"
    };

    this.getToolbarIcon = function () {
        return "resources/tools/Path.svg";
    }

    this.getTooltipName = function () {
        return "Pen (O)";
    }

    this.setup = function () {

    }

    this.onSelected = function () {
        wickEditor.inspector.openToolSettings('pen');
        wickEditor.canvas.getInteractiveCanvas().needsUpdate = true;
    }

    this.onDeselected = function () {
        drawingPathUUID = null
        drawingPath = null
        currentSegment = null
        if(previewStroke) previewStroke.remove();
    }

    this.paperTool = new paper.Tool();
    
    var hitOptions = {
        tolerance: 3,
        allowGroups: true,
        segments: true,
        fill: false,
        curves: false,
        handles: true,
        stroke: false,
    }

    this.paperTool.onMouseMove = function (event) {
        /*wickEditor.tools.vectorcursor.paperTool.onMouseMove(event)

        wickEditor.project.getSelectedObjects().forEach(function (wo) {
            wo.paper.selected = true;
        })*/

        updateDrawingPath();

        hitResult = wickEditor.canvas.getInteractiveCanvas().getItemAtPoint(event.point, hitOptions);

        if(previewStroke) previewStroke.remove();
        if(drawingPath) {
            if(hitResult && hitResult.type.startsWith('handle') && hitResult.item === drawingPath) {

            } else if (hitResult && hitResult.item !== drawingPath && (hitResult.segment === hitResult.item.lastSegment || hitResult.segment === hitResult.item.firstSegment)) {

            } else {
                previewStroke = new paper.Path({insert:false});
                previewStroke.strokeColor = GUI_DOTS_STROKECOLOR;
                previewStroke.strokeWidth = 1;
                previewStroke.add(currentSegment.clone())
                previewStroke.add(event.point)
                previewStroke.segments[0].handleIn.x *= -1
                previewStroke.segments[0].handleIn.y *= -1
                previewStroke.segments[0].handleOut.x *= -1
                previewStroke.segments[0].handleOut.y *= -1
                previewStroke.selected = false;
                paper._guiLayer.addChild(previewStroke)
            }
        }

        if(!hitResult) {
            wickEditor.cursorIcon.hide()
        } else if(hitResult.type === 'segment' && hitResult.segment) {
            if(hitResult.segment === drawingPath.firstSegment ||
               hitResult.segment === drawingPath.lastSegment) {
                wickEditor.cursorIcon.setImage('resources/cursor-segment.png')
            }
        } else if((hitResult.type === 'handle-in' ||
                  hitResult.type === 'handle-out') &&
                 hitResult.item === drawingPath) {
            wickEditor.cursorIcon.setImage('resources/cursor-segment.png')
        } else {
            wickEditor.cursorIcon.hide()
        }
    }

    var drawingPath;
    var currentSegment;
    var currentSegmentIndex;
    var previewStroke;

    this.paperTool.onMouseDown = function (event) {
        if(previewStroke) previewStroke.remove();
        /*drawingPath = null;
        paper.project.selectedItems.forEach(function (item) {
            if(item instanceof paper.Group) return;
            if(item.closed) return;
            drawingPath = item;
        })*/

        hitResult = wickEditor.canvas.getInteractiveCanvas().getItemAtPoint(event.point, hitOptions);

        if(hitResult && hitResult.type === 'segment' && hitResult.item.wick.uuid !== drawingPathUUID) {
            if (hitResult.segment === hitResult.item.firstSegment) {
                drawingPathUUID = hitResult.item.wick.uuid;
                currentSegmentIndex = hitResult.segment.index;
                updateDrawingPath();
                return;
            }
            if (hitResult.segment === hitResult.item.lastSegment) {
                drawingPathUUID = hitResult.item.wick.uuid;
                currentSegmentIndex = hitResult.segment.index;
                updateDrawingPath();
                return;
            }
        }

        if(drawingPath) {

            if(hitResult && (hitResult.type === 'handle-in' || hitResult.type === 'handle-out')) {

            } else {

                if(currentSegment === drawingPath.firstSegment) {
                    drawingPath.firstSegment.handleIn.x = -drawingPath.firstSegment.handleOut.x
                    drawingPath.firstSegment.handleIn.y = -drawingPath.firstSegment.handleOut.y
                } else if(currentSegment === drawingPath.lastSegment) {
                    drawingPath.lastSegment.handleOut.x = -drawingPath.lastSegment.handleIn.x
                    drawingPath.lastSegment.handleOut.y = -drawingPath.lastSegment.handleIn.y
                }

                if(hitResult && 
                    ((hitResult.segment === drawingPath.firstSegment && currentSegment === drawingPath.lastSegment) || 
                     (hitResult.segment === drawingPath.lastSegment && currentSegment === drawingPath.firstSegment))
                ) {
                    drawingPath.closePath();
                    drawingPath.fillColor = wickEditor.settings.fillColor;
                    if(currentSegment === drawingPath.firstSegment) {
                        currentSegmentIndex = drawingPath.lastSegment.index
                    } else if(currentSegment === drawingPath.lastSegment) {
                        currentSegmentIndex = drawingPath.firstSegment.index
                    }
                } else {
                    if(currentSegment === drawingPath.firstSegment) {
                        currentSegmentIndex = drawingPath.insert(0, event.point).index;
                    } else if(currentSegment === drawingPath.lastSegment) {
                        currentSegmentIndex = drawingPath.add(event.point).index;
                    }
                } 
            }
            
        } else {
            //if(!hitResult) {
                var newPath = new paper.Path({insert:false});
                newPath.strokeColor = wickEditor.settings.strokeColor;
                newPath.strokeWidth = wickEditor.settings.strokeWidth;
                newPath.strokeJoin = wickEditor.settings.strokeJoin;
                newPath.strokeCap = wickEditor.settings.strokeCap;
                newPath.add(event.point);

                var group = new paper.Group({insert:false});
                group.addChild(newPath);

                var svgString = group.exportSVG({asString:true});
                var pathWickObject = WickObject.createPathObject(svgString);
                pathWickObject.x = event.point.x;
                pathWickObject.y = event.point.y;
                pathWickObject.width = 1;
                pathWickObject.height = 1;

                wickEditor.actionHandler.doAction('addObjects', {
                    wickObjects: [pathWickObject]
                });
                drawingPathUUID = pathWickObject.uuid;
                currentSegmentIndex = 0;
            //} else {
                //wickEditor.tools.vectorcursor.paperTool.onMouseDown(event)
            //}
        }

        updateDrawingPath()

    }

    this.paperTool.onMouseDrag = function(event) {
        if(hitResult && hitResult.item === drawingPath && (hitResult.type === 'handle-in' || hitResult.type === 'handle-out')) {
            if(hitResult.type === 'handle-in') {
                hitResult.segment.handleIn.x += event.delta.x;
                hitResult.segment.handleIn.y += event.delta.y;
                hitResult.segment.handleOut.x -= event.delta.x;
                hitResult.segment.handleOut.y -= event.delta.y;
            } else if (hitResult.type === 'handle-out') {
                hitResult.segment.handleIn.x -= event.delta.x;
                hitResult.segment.handleIn.y -= event.delta.y;
                hitResult.segment.handleOut.x += event.delta.x;
                hitResult.segment.handleOut.y += event.delta.y;
            }
        } else if(currentSegment) {
            if(currentSegment === drawingPath.lastSegment) {
                currentSegment.handleIn.x -= event.delta.x;
                currentSegment.handleIn.y -= event.delta.y;
                currentSegment.handleOut.x += event.delta.x;
                currentSegment.handleOut.y += event.delta.y;
            } else {
                currentSegment.handleIn.x += event.delta.x;
                currentSegment.handleIn.y += event.delta.y;
                currentSegment.handleOut.x -= event.delta.x;
                currentSegment.handleOut.y -= event.delta.y;
            }
        } else {
            //wickEditor.tools.vectorcursor.paperTool.onMouseDrag(event)
        }
        updateDrawingPath()
    }

    this.paperTool.onMouseUp = function (event) {
        if(currentSegment) {
            var wickObject = drawingPath.wick;

            var parentAbsPos;
            if(wickObject.parentObject)
                parentAbsPos = wickObject.parentObject.getAbsolutePosition();
            else 
                parentAbsPos = {x:0,y:0};

            wickEditor.actionHandler.doAction('modifyObjects', {
                objs: [wickObject],
                modifiedStates: [{
                    x: wickObject.paper.position.x - parentAbsPos.x,
                    y: wickObject.paper.position.y - parentAbsPos.y,
                    svgX: wickObject.paper.bounds._x,
                    svgY: wickObject.paper.bounds._y,
                    width: wickObject.paper.bounds._width,
                    height: wickObject.paper.bounds._height,
                    pathData: wickObject.paper.exportSVG({asString:true}),
                }],
            });

            if(drawingPath.closed) {
                currentSegment = null;
                currentSegmentIndex = null;
                drawingPath = null;
                drawingPathUUID = null;
                wickEditor.project.clearSelection();
                wickEditor.syncInterfaces();
            }
        } else {
            //wickEditor.tools.vectorcursor.paperTool.onMouseUp(event)
        }
        updateDrawingPath()
    }

    function updateDrawingPath () {
        paper.project.activeLayer.children.forEach(function (item) {
            if(item && item.wick && item.wick.uuid === drawingPathUUID) {
                item.fullySelected = true;
                drawingPath = item;
                currentSegment = drawingPath.segments[currentSegmentIndex]
            }
        })
    }

}