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
    
var InteractiveCanvas = function (wickEditor) {

    var self = this;

    var paperCanvas;

    self.setup = function () {
        self.needsUpdate = true;

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

    }

    self.show = function () {
        paperCanvas.style.display = 'block'
    }

    self.hide = function () {
        paperCanvas.style.display = 'none'
    }

    self.highlightHoveredOverObject = function (event) {
        updateSelection()

        /*if (event.item && !event.item._wickInteraction) 
            event.item.selected = true;*/
        hitResult = self.getItemAtPoint(event.point);
        if(hitResult && hitResult.item && !hitResult.item._wickInteraction)
            hitResult.item.selected = true;
    }

    self.update = function () {

        self.updateViewTransforms();

        if(wickEditor.currentTool.paperTool) wickEditor.currentTool.paperTool.activate();
        self.show();

        if(self.needsUpdate) {
            paper.project.activeLayer.removeChildren();

            var activeObjects = wickEditor.project.getCurrentObject().getAllActiveChildObjects();
            activeObjects.forEach(function (wickObject) {
                if(!wickObject.isPath) return;

                var layer = wickObject.parentFrame.parentLayer;
                if(layer.locked || layer.hidden) return;

                var xmlString = wickObject.pathData
                  , parser = new DOMParser()
                  , doc = parser.parseFromString(xmlString, "text/xml");
                wickObject.paper = paper.project.importSVG(doc, {insert:false});

                paper.project.activeLayer.addChild(wickObject.paper);

                var absPos = wickObject.getAbsolutePosition();
                wickObject.paper.position.x = absPos.x;
                wickObject.paper.position.y = absPos.y;
                wickObject.svgStrokeWidth = wickObject.paper.strokeWidth;
                
                wickObject.paper.wick = wickObject;
            });
        }
        self.needsUpdate = false;

        updateSelection();
    }

    self.updateViewTransforms = function () {
        var zoom = wickEditor.canvas.getZoom();
        var pan = wickEditor.canvas.getPan();
        paper.view.matrix = new paper.Matrix();
        paper.view.matrix.translate(new paper.Point(pan.x,pan.y))
        paper.view.matrix.scale(zoom)
    }

    self.getItemAtPoint = function (point, tolerance) {
        if(tolerance === undefined) tolerance = 5;

        return paper.project.hitTest(point, {
            segments: true,
            fill: true,
            curves: true,
            handles: false,
            stroke: true,
            tolerance: tolerance / wickEditor.canvas.getZoom()
        });
    }





// Move this to selection cursor
// Also we need two cursors

    var selectionRect;
    var selectionBoundsRect;
    var scaleBR;
    var rotate;
    var GUI_DOTS_SIZE = 5;

    self.getSelectionRect = function () {
        return selectionBoundsRect;
    }

    self.forceUpdateSelection = function () {
        updateSelection();
    }

    function updateSelection () {
        paper.settings.handleSize = 10;
        paper.project.activeLayer.selected = false;
        paper.project.deselectAll();
        paper.project.activeLayer.children.forEach(function (child) {
            if(!child.wick) return;
            if(wickEditor.project.isObjectSelected(child.wick)) {
                //child.selected = true;
                //child.fullySelected = true;
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
        if(rotate) rotate.remove();

        if(selectionBoundsRect) {
            selectionBoundsRect = selectionBoundsRect.expand(10);

            selectionRect = new paper.Path.Rectangle(selectionBoundsRect);
            selectionRect.strokeColor = 'purple';
            selectionRect.strokeWidth = 1/wickEditor.canvas.getZoom();
            selectionRect._wickInteraction = 'selectionRect';
            selectionRect.locked = true;

            scaleBR = new paper.Path.Circle(selectionBoundsRect.bottomRight, GUI_DOTS_SIZE/wickEditor.canvas.getZoom());
            scaleBR.fillColor = 'purple'
            scaleBR._wickInteraction = 'scaleBR';
            scaleBR._cursor = 'nwse-resize';

            rotate = new paper.Path.Circle(selectionBoundsRect.topRight.add(new paper.Point(20,-20)), GUI_DOTS_SIZE/wickEditor.canvas.getZoom());
            rotate.fillColor = 'purple'
            rotate._wickInteraction = 'rotate';
            rotate._cursor = 'grab';
        }
    }

 }
