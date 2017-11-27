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
    
var FabricCanvas = function (wickEditor) {

    var self = this;

    var lastDoubleClickTime = null;
    var lastDoubleClickPos = {x:0,y:0};

    var canvasContainer;

    self.setup = function () {

        fabric.Object.prototype.cornerStyle = 'circle'
        fabric.Object.prototype.transparentCorners = true;
        fabric.Object.prototype.cornerColor = 'rgba(177,177,255,1.0)';
        fabric.Object.prototype.cornerdrawingColor = "rgba(177,177,255,1.0)";
        fabric.Object.prototype.borderScaleFactor = 2.0;
        fabric.Object.prototype.borderColor = 'rgba(177,177,255,0.7)';
        fabric.Object.prototype.borderOpacityWhenMoving = 0.1;
        fabric.Object.prototype.cornerSize = 8;
        fabric.Object.prototype.objectCaching = false;

        canvasContainer = document.createElement('canvas');
        canvasContainer.id = 'fabricCanvas';
        document.getElementById('editorCanvasContainer').appendChild(canvasContainer);
        self.canvas = new fabric.Canvas('fabricCanvas', {
            imageSmoothingEnabled : true,
            preserveObjectStacking : true,
            renderOnAddRemove : false,
            uniScaleTransform : true,
        });
        self.canvas.backgroundColor = "transparent";
        self.canvas.setWidth(window.innerWidth);
        self.canvas.setHeight(window.innerHeight);

        self.panning = false;
        self.objHoveredOver = null;

        self.guiElements = new FabricGUIElements(wickEditor, self);
        self.wickElements = new FabricWickElements(wickEditor, self);

        self.canvas.on('mouse:move', function (e) {
            self.objHoveredOver = e.target;
        });

        self.canvas.on('mouse:down', function (e) {
            if(wickEditor.project.deselectObjectType(WickFrame)) {
                wickEditor.syncInterfaces();
            }
        });

        self.canvas.on('mouse:up', function (e) {
            /*wickEditor.project.clearSelection();
            var selectWickObjects = self.canvas.getActiveObjects().map(function (fo) {
                wickEditor.project.selectObject(fo.wickObjReference);
            });
            wickEditor.scriptingide.syncWithEditorState();
            wickEditor.inspector.syncWithEditorState();*/
        });
        self.canvas.on('object:selected', function (e) {
            if (!e.e) return;
            self.applySelectionToWickProject();
        });
        self.canvas.on('selection:created', function (e) {
            if (!e.e) return;
            self.applySelectionToWickProject();
        });
        self.canvas.on('selection:cleared', function (e) {
            if (!e.e) return;
            if(wickEditor.currentTool === wickEditor.tools.dropper) return;
            self.applySelectionToWickProject();
        });
        self.canvas.on('selection:updated', function (e) {
            if (!e.e) return;
            self.applySelectionToWickProject();
        });

        self.canvas.on('object:modified', function (e) {
            var modifiedObjects = [];

            if (e.target.wickObjReference) {
                modifiedObjects = [e.target];
            } else if (e.target._objects) {
                modifiedObjects = e.target._objects;
            }

            self.applyChangesInCanvasToProject(modifiedObjects);
        });

        // Select objects on right click (fabric.js doesn't do this by default >.>)
        self.canvas.on('mouse:down', function(e) {
            if(e.e.button !== 2) return;

            if (e.target && e.target.wickObjectID) {
                // Set active object of fabric canvas
                var id = self.canvas.getObjects().indexOf(e.target);
                self.canvas.setActiveObject(self.canvas.item(id)).renderAll();
            }

            if(!e.target) {
                // Didn't right click an object, deselect everything
                self.canvas.deactivateAll().renderAll();
            }
        });

        // Double click functionality to edit symbols
        self.canvas.on('mouse:down', function(e) {
            if(e.e.button !== 0) return;
            if(!(wickEditor.currentTool instanceof Tools.Cursor)) return;

            var newDoubleClickPos = {x: e.e.clientX, y: e.e.clientX};
            var currentTime = new Date().getTime();

            var isSecondClick = lastDoubleClickTime !== null && currentTime-lastDoubleClickTime < 350;
            var mouseInSameArea = Math.abs(lastDoubleClickPos.x - newDoubleClickPos.x) < 3 && Math.abs(lastDoubleClickPos.y - newDoubleClickPos.y) < 3;

            if(isSecondClick && mouseInSameArea) {
                var selectedObject = wickEditor.project.getSelectedObject();
                if(selectedObject && selectedObject.isSymbol) {
                    wickEditor.guiActionHandler.doAction("editObject");
                } else if (!selectedObject && !wickEditor.project.currentObject.isRoot) {
                    wickEditor.guiActionHandler.doAction("finishEditingObject");
                }
                lastDoubleClickTime = null;
            } else {
                lastDoubleClickTime = currentTime;
            }

            lastDoubleClickPos = newDoubleClickPos;
        });

        this.recenterCanvas();
        this.guiElements.update();

        window.addEventListener('resize', this.resize, false);

    }

    this.update = function () {
        // Update cursor
        self.updateCursor();

        // Set drawing mode
        this.canvas.isDrawingMode = false;

        // Disable selection
        if(wickEditor.currentTool instanceof Tools.Cursor ||
           wickEditor.currentTool instanceof Tools.Zoom) {
            self.canvas.selection = true;
        } else {
            self.canvas.selection = false;
        }

        // Update elements in fabric canvas
        this.wickElements.update();
        self.guiElements.update();

        // Render canvas
        this.canvas.renderAll();
    }

    this.hide = function () {
        canvasContainer.style.display = 'none';
    }
    this.show = function (newActive) {
        canvasContainer.style.display = 'block';
    }

    // Syncs up fabric state with wickproject state
    this.applyChangesInCanvasToProject = function (modifiedFabricObjects) {

        var modifiedStates = [];
        var modifiedWickObjects = [];

        self.canvas.discardActiveObject();
        self.canvas.renderAll();
        self.canvas.getActiveObjects().forEach(function (fo) {
            fo.setCoords();
        });

        modifiedFabricObjects.forEach(function (fabricObj) {
            var wickObj = fabricObj.wickObjReference;
            modifiedWickObjects.push(wickObj);
            wickEditor.project.selectObject(wickObj);

            var insideSymbolReposition = {
                x: wickObj.x-wickObj.getAbsolutePosition().x,
                y: wickObj.y-wickObj.getAbsolutePosition().y
            };

            var newX = fabricObj.left + insideSymbolReposition.x;
            var newY = fabricObj.top  + insideSymbolReposition.y;

            modifiedStates.push({
                x : newX,
                y : newY,
                scaleX : fabricObj.scaleX,
                scaleY : fabricObj.scaleY,
                flipX : fabricObj.flipX,
                flipY : fabricObj.flipY,
                rotation : fabricObj.angle,
                width : wickObj.isText ? fabricObj.width : undefined,
                textData : (wickObj.isText ? {
                    fontFamily: fabricObj.fontFamily,
                    fontSize: fabricObj.fontSize,
                    fontStyle: fabricObj.fontStyle,
                    fontWeight: fabricObj.fontWeight,
                    lineHeight: fabricObj.lineHeight,
                    fill: fabricObj.fill,
                    textAlign: fabricObj.textAlign,
                    text: fabricObj.text,
                } : undefined)
            });
        });

        wickEditor.actionHandler.doAction('modifyObjects', {
            objs: modifiedWickObjects,
            modifiedStates: modifiedStates
        });
    }

    this.applySelectionToWickProject = function () {
        wickEditor.project.clearSelection();
        var selectWickObjects = self.canvas.getActiveObjects().map(function (fo) {
            wickEditor.project.selectObject(fo.wickObjReference);
        });
        wickEditor.scriptingide.syncWithEditorState();
        wickEditor.inspector.syncWithEditorState();
    }

    this.syncSelectionWithWickProject = function () {

        var selectedUUIDs = wickEditor.project.getSelectedWickObjects().map(function (wo) {
            return wo.uuid;
        });

        var fabricObjectsToSelect = [];
        self.canvas._objects.forEach(function (o) {
            if(o.wickObjReference && selectedUUIDs.includes(o.wickObjReference.uuid)) {
                fabricObjectsToSelect.push(o)
            }
        });

        if(fabricObjectsToSelect.length === 1) {
            self.canvas.setActiveObject(fabricObjectsToSelect[0]);
        } else if(fabricObjectsToSelect.length > 1) {
            var selection = new fabric.ActiveSelection(fabricObjectsToSelect, {
              canvas: self.canvas
            });
            self.canvas.setActiveObject(selection);
        }
    }

// Canvas utils

    this.resize = function () {

        var oldWidth = self.canvas.getWidth();
        var oldHeight = self.canvas.getHeight();

        self.canvas.setWidth ( window.innerWidth  );
        self.canvas.setHeight( window.innerHeight );
        self.canvas.calcOffset();

        var diffWidth = self.canvas.getWidth() - oldWidth;
        var diffHeight = self.canvas.getHeight() - oldHeight;

        var panAdjustX = Math.floor(diffWidth/2);
        var panAdjustY = Math.floor(diffHeight/2);

        self.canvas.relativePan(new fabric.Point(panAdjustX,panAdjustY));
        self.canvas.renderAll();

    }

    this.resetPan = function () {
        var centerX = Math.floor(-(window.innerWidth -wickEditor.project.width)/2 - 33/2 + 204/2);
        var centerY = Math.floor(-(window.innerHeight-wickEditor.project.height)/2 - 102/2);
        
        self.canvas.absolutePan(new fabric.Point(centerX,centerY));
    }

    this.recenterCanvas = function () {
        self.canvas.setZoom(1);
        self.resetPan();
        self.canvas.renderAll();
        //wickEditor.syncInterfaces();
    }

    this.relativePan = function (x,y) {
        var delta = new fabric.Point(Math.floor(x),Math.floor(y));
        self.canvas.relativePan(delta)
        self.guiElements.update();
        wickEditor.canvas.getPaperCanvas().updateViewTransforms();
        wickEditor.canvas.getPixiCanvas().updateViewTransforms();
        wickEditor.canvas.getBackdrop().updateViewTransforms();
    }

    this.absolutePan = function (x,y) {
        var delta = new fabric.Point(Math.floor(x),Math.floor(y));
        self.canvas.absolutePan(delta)
        self.guiElements.update();
        wickEditor.canvas.getPaperCanvas().updateViewTransforms();
        wickEditor.canvas.getPixiCanvas().updateViewTransforms();
        wickEditor.canvas.getBackdrop().updateViewTransforms();
    }

    this.startPan = function () {
        self.panning = true;
        self.canvas.selection = false;
    }

    this.stopPan = function () {
        self.panning = false;
        self.canvas.selection = true;
    }

    this.getPan = function () {
        return {
            x: self.canvas.viewportTransform[4],
            y: self.canvas.viewportTransform[5]
        }
    }

    this.zoom = function (zoomAmount, zoomX, zoomY) {
        // Calculate new zoom amount
        var oldZoom = self.canvas.getZoom();
        var newZoom = self.canvas.getZoom() * zoomAmount;

        // Calculate pan position adjustment so we zoom into the mouse's position
        var panAdjustX = (zoomX) * (1-zoomAmount);
        var panAdjustY = (zoomY) * (1-zoomAmount);

        // Do da zoom!
        self.canvas.setZoom(newZoom);
        self.canvas.relativePan(new fabric.Point(panAdjustX,panAdjustY));
        self.canvas.renderAll();
        wickEditor.canvas.getPaperCanvas().updateViewTransforms();
        wickEditor.timeline.getElem().updateZoomBox();

        self.guiElements.update();
        self.updateCursor();

        wickEditor.toolbar.syncWithEditorState();
    }

    this.setZoom = function (newZoom, nosync) {
        var oldZoom = self.canvas.getZoom();
        var newZoom = newZoom;
        var zoomRatio = newZoom/oldZoom;
        self.zoom(zoomRatio, window.innerWidth/2, window.innerHeight/2);
        wickEditor.canvas.getPaperCanvas().updateViewTransforms();
        wickEditor.timeline.getElem().updateZoomBox();

        /*var centerX = Math.floor(-(window.innerWidth -wickEditor.project.width)/2 - 33/2 + 254/2);
        var centerY = Math.floor(-(window.innerHeight-wickEditor.project.height)/2 - 100/2);

        centerX -= (wickEditor.project.width  - wickEditor.project.width *newZoom)/2;
        centerY -= (wickEditor.project.height - wickEditor.project.height*newZoom)/2;

        self.canvas.setZoom(newZoom);
        self.canvas.absolutePan(new fabric.Point(centerX,centerY));
        self.canvas.renderAll();
        wickEditor.canvas.getPaperCanvas().updateViewTransforms();

        if(!nosync) wickEditor.syncInterfaces();*/
    }

    this.getCanvasTransform = function () {
        return {
            x: self.getPan().x,
            y: self.getPan().y,
            zoom: self.canvas.getZoom(),
        }
    }

    this.screenToCanvasSpace = function (x,y) {
        var pan = self.getPan();
        var zoom = self.canvas.getZoom();
        return {
            x: (x - pan.x)/zoom,
            y: (y - pan.y)/zoom
        }
    }

    this.screenToCanvasSize = function (x,y) {
        var zoom = self.canvas.getZoom();
        return {
            x: x/zoom,
            y: y/zoom
        }
    }

    this.updateCursor = function () {
        var cursorImg = wickEditor.currentTool.getCursorImage();
        this.canvas.defaultCursor = cursorImg;
    }

    this.getObjectHoveredOver = function () {
        if(!self.objHoveredOver) return null;
        if(!self.objHoveredOver.wickObjReference) return null;
        return self.objHoveredOver.wickObjReference;
    }
    
}