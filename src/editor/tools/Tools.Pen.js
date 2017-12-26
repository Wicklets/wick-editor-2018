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

    var drawingPath;
    var currentSegment;

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

    this.paperTool = new paper.Tool();

    this.paperTool.onMouseMove = function (event) {
        wickEditor.tools.vectorcursor.paperTool.onMouseMove(event)

        wickEditor.project.getSelectedObjects().forEach(function (wo) {
            wo.paper.selected = true;
        })
    }

    this.paperTool.onMouseDown = function (event) {
        drawingPath = null;
        paper.project.selectedItems.forEach(function (item) {
            if(item instanceof paper.Group) return;
            if(item.closed) return;
            drawingPath = item;
        })

        hitResult = wickEditor.canvas.getInteractiveCanvas().getItemAtPoint(event.point);
        
        if(drawingPath) {
            var segments = drawingPath.segments;
            var firstSegment = segments[0];

            var lastSegment = segments[segments.length-1];
            lastSegment.handleOut.x = -lastSegment.handleIn.x
            lastSegment.handleOut.y = -lastSegment.handleIn.y

            if(hitResult && hitResult.segment === firstSegment) {
                drawingPath.closePath();
                currentSegment = segments[0];
            } else if(!hitResult) {
                currentSegment = drawingPath.add(event.point);
                currentSegment.selected = true;
            } else {
                wickEditor.tools.vectorcursor.paperTool.onMouseDown(event)
            }
        } else {
            if(!hitResult) {
                var newPath = new paper.Path({insert:false});
                newPath.fillColor = wickEditor.settings.fillColor;
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
                paper.project.selectedItems.forEach(function (item) {
                    if(item instanceof paper.Group) return;
                    drawingPath = item;
                    currentSegment = drawingPath.segments[0];
                    currentSegment.selected = true;
                })
            } else {
                wickEditor.tools.vectorcursor.paperTool.onMouseDown(event)
            }
        }

    }

    this.paperTool.onMouseDrag = function(event) {
        if(currentSegment) {
            var delta = event.delta.clone();
            currentSegment.handleIn.x -= delta.x;
            currentSegment.handleIn.y -= delta.y;
            currentSegment.handleOut.x += delta.x;
            currentSegment.handleOut.y += delta.y;
        } else {
            wickEditor.tools.vectorcursor.paperTool.onMouseDrag(event)
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

            wickEditor.project.getSelectedObjects().forEach(function (wo) {
                wo.paper.selected = true;
            })

            currentSegment = null;
            drawingPath = null;
        } else {
            wickEditor.tools.vectorcursor.paperTool.onMouseUp(event)
        }
    }

}