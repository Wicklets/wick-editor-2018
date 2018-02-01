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
        return "auto"
    };

    this.getToolbarIcon = function () {
        return "resources/path.png";
    }

    this.getTooltipName = function () {
        return "Pen (O)";
    }

    this.setup = function () {

    }

    this.onSelected = function () {
        wickEditor.canvas.getInteractiveCanvas().needsUpdate = true;
    }

    this.onDeselected = function () {
        drawingPathUUID = null
        drawingPath = null
        currentSegment = null
    }

    this.paperTool = new paper.Tool();

    this.paperTool.onMouseMove = function (event) {
        /*wickEditor.tools.vectorcursor.paperTool.onMouseMove(event)

        wickEditor.project.getSelectedObjects().forEach(function (wo) {
            wo.paper.selected = true;
        })*/

        updateDrawingPath();
    }

    var drawingPath;
    var currentSegment;
    var currentSegmentIndex;

    this.paperTool.onMouseDown = function (event) {
        /*drawingPath = null;
        paper.project.selectedItems.forEach(function (item) {
            if(item instanceof paper.Group) return;
            if(item.closed) return;
            drawingPath = item;
        })*/

        

        hitResult = wickEditor.canvas.getInteractiveCanvas().getItemAtPoint(event.point);
        
        if(hitResult && hitResult.type === 'segment' && hitResult.item.wick.uuid !== drawingPathUUID) {
            if (hitResult.segment === hitResult.item.firstSegment) {
                console.log('first')
                drawingPathUUID = hitResult.item.wick.uuid;
                currentSegmentIndex = hitResult.segment.index;
                updateDrawingPath();
                return;
            }
            if (hitResult.segment === hitResult.item.lastSegment) {
                console.log('last')
                drawingPathUUID = hitResult.item.wick.uuid;
                currentSegmentIndex = hitResult.segment.index;
                updateDrawingPath();
                return;
            }
        }

        if(drawingPath) {

            /*if(currentSegment === drawingPath.firstSegment) {
                console.log("???")
                drawingPath.lastSegment.handleOut.x = -drawingPath.lastSegment.handleIn.x
                drawingPath.lastSegment.handleOut.y = -drawingPath.lastSegment.handleIn.y
            } else if(currentSegment === drawingPath.lastSegment) {
                console.log("!!!")
                drawingPath.firstSegment.handleOut.x = -drawingPath.firstSegment.handleIn.x
                drawingPath.firstSegment.handleOut.y = -drawingPath.firstSegment.handleIn.y
            }*/

            if(hitResult && 
                ((hitResult.segment === drawingPath.firstSegment && currentSegment === drawingPath.lastSegment) || 
                 (hitResult.segment === drawingPath.lastSegment && currentSegment === drawingPath.firstSegment))
            ) {
                drawingPath.closePath();
                drawingPath.fillColor = wickEditor.settings.fillColor;
                currentSegment = drawingPath.firstSegment
            } else {
                if(currentSegment === drawingPath.firstSegment) {
                    console.log('first')
                    currentSegmentIndex = drawingPath.insert(0, event.point).index;
                } else if(currentSegment === drawingPath.lastSegment) {
                    console.log('last')
                    currentSegmentIndex = drawingPath.add(event.point).index;
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
        if(currentSegment) {
            var delta = event.delta.clone();
            currentSegment.handleIn.x -= delta.x;
            currentSegment.handleIn.y -= delta.y;
            currentSegment.handleOut.x += delta.x;
            currentSegment.handleOut.y += delta.y;
        } else {
            //wickEditor.tools.vectorcursor.paperTool.onMouseDrag(event)
        }
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
            }
        } else {
            wickEditor.tools.vectorcursor.paperTool.onMouseUp(event)
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