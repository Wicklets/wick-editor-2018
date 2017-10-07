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

    var active;
    var paperCanvas;

    self.setup = function () {
        self.needsUpdate = true;

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

    self.isActive = function () {
        return active;
    }

    self.highlightHoveredOverObject = function (event) {
        refreshSelection()
        if (event.item) 
            event.item.selected = true;
    }

    self.updateCursorIcon = function (event) {
        if(!active) {
            wickEditor.cursorIcon.hide();
            return;
        }

        if(event.item && event.item.wick && !wickEditor.project.isObjectSelected(event.item.wick)) {
            wickEditor.cursorIcon.setImage('resources/cursor-fill.png')
            return;
        }

        var hitOptions = {
            segments: true,
            fill: true,
            curves: true,
            handles: true,
            stroke: true,
            tolerance: 5 / wickEditor.fabric.getCanvasTransform().zoom
        }

        hitResult = paper.project.hitTest(event.point, hitOptions);
        if(hitResult) {
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
    }

    self.updateViewTransforms = function () {
        var canvasTransform = wickEditor.fabric.getCanvasTransform();
        paper.view.matrix = new paper.Matrix();
        paper.view.matrix.translate(new paper.Point(canvasTransform.x,canvasTransform.y))
        paper.view.matrix.scale(canvasTransform.zoom)
    }

    self.syncWithEditorState = function () {

        var lastActive = active;

        active = wickEditor.currentTool.getCanvasMode() === 'paper';

        paperCanvas.style.display = wickEditor.previewplayer.playing ? 'none' : 'block';

        if(active) {

            wickEditor.currentTool.paperTool.activate();
            paperCanvas.style.cursor = wickEditor.currentTool.getCursorImage()
            paperCanvas.style.display = 'block';

            refreshSelection();
            self.updateViewTransforms();

            if(!self.needsUpdate) return;
            self.needsUpdate = false;

            paper.project.activeLayer.removeChildren();

            var activeObjects = wickEditor.project.getCurrentObject().getAllActiveChildObjects();
            activeObjects.forEach(function (wickObject) {
                if(!wickObject.isPath) return;
                var layer = wickObject.parentFrame.parentLayer;
                if(layer.locked || layer.hidden) return;
                
                self.pathRoutines.refreshPathData(wickObject);
                self.pathRoutines.regenPaperJSState(wickObject);
                paper.project.activeLayer.addChild(wickObject.paper);
                
                var absPos = wickObject.getAbsolutePosition();
                wickObject.paper.position.x = absPos.x;
                wickObject.paper.position.y = absPos.y;
                
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
        paper.settings.handleSize = 0;
        paper.project.activeLayer.selected = false;
        paper.project.deselectAll();
        paper.project.activeLayer.children.forEach(function (child) {
            if(wickEditor.project.isObjectSelected(child.wick)) {
                child.selected = true;
                child.fullySelected = true;
                paper.settings.handleSize = 10;
            }
        });
    }

 }
