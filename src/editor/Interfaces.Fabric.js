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
    
var FabricInterface = function (wickEditor) {

    var self = this;

    self.setup = function () {

        self.canvas = new fabric.Canvas('fabricCanvas', {
            imageSmoothingEnabled : true,
            preserveObjectStacking : true,
            renderOnAddRemove : false,
        });
        self.canvas.selectionColor = 'rgba(110, 110, 115, 0.1)';
        self.canvas.selectionBorderColor = 'grey';
        self.canvas.backgroundColor = "transparent";
        self.canvas.setWidth(window.innerWidth);
        self.canvas.setHeight(window.innerHeight);

        fabric.Object.prototype.cornerStyle = 'circle'
        fabric.Object.prototype.transparentCorners = true;
        fabric.Object.prototype.cornerColor = 'rgba(177,177,255,1.0)';
        fabric.Object.prototype.cornerdrawingColor = "rgba(177,177,255,1.0)";
        fabric.Object.prototype.borderScaleFactor = 2.0;
        fabric.Object.prototype.borderColor = 'rgba(177,177,255,0.7)';
        fabric.Object.prototype.borderOpacityWhenMoving = 0.1;
        fabric.Object.prototype.cornerSize = 10;

        self.canvas.selectionColor = 'rgba(177,177,255,0.3)';
        self.canvas.selectionBorderColor = 'rgba(177,177,255,0.3)';
        self.canvas.selectionLineWidth = 1;

        /* Setting objectCaching to false fixes some rendering problems with
           symbol centerpoints and speeds up zooming by a lot */
        /* Currently set to true because it makes moving between frames much faster...  */
        fabric.Object.prototype.objectCaching = false;

        self.panning = false;
        self.onionSkinsDirty = false;
        self.objHoveredOver = null;

        self.shapeDrawer     = new FabricShapeDrawer(wickEditor, self);
        self.guiElements     = new FabricGUIElements(wickEditor, self);
        self.wickElements    = new FabricWickElements(wickEditor, self);
        self.symbolBorders   = new FabricSymbolBorders(wickEditor, self);

        self.canvas.freeDrawingBrush = new fabric.PencilBrush(self.canvas);

        // Canvas event listeners
        self.canvas.on('selection:created', function (e) {
            updateProjectSelection();

            wickEditor.scriptingide.syncWithEditorState();
            wickEditor.timeline.syncWithEditorState();
            wickEditor.inspector.syncWithEditorState();
        });

        self.canvas.on('object:selected', function (e) {
            updateProjectSelection();

            wickEditor.scriptingide.syncWithEditorState();
            wickEditor.timeline.syncWithEditorState();
            wickEditor.inspector.syncWithEditorState();
        });

        self.canvas.on('object:modified', function(e) {
            self.modifyChangedObjects(e);
        });

        self.canvas.on('mouse:down', function (e) {
            if(wickEditor.project.deselectObjectType(WickFrame) || 
               wickEditor.project.deselectObjectType(WickPlayRange)) {
                wickEditor.syncInterfaces();
            }

            wickEditor.project.clearSelection();
            updateProjectSelection();

            wickEditor.scriptingide.syncWithEditorState();
            wickEditor.timeline.syncWithEditorState();
            wickEditor.inspector.syncWithEditorState();
        });

        self.canvas.on('mouse:move', function (e) {
            self.objHoveredOver = e.target;
        });

        self.canvas.on('mouse:up', function (e) {
            
        });

        this.recenterCanvas();
        this.guiElements.update();

        window.addEventListener('resize', this.resize, false);

    }

    this.syncWithEditorState = function () {

        if(wickEditor.previewplayer.playing) {
            document.getElementById('fabricCanvas').style.display = 'none';
            return;
        } else {
            document.getElementById('fabricCanvas').style.display = 'block';
        }

        // Apply tweens
        //wickEditor.project.rootObject.applyTweens();

        // Update cursor
        self.updateCursor();

        // Set drawing mode
        if(wickEditor.currentTool instanceof Tools.Paintbrush) {
            this.canvas.isDrawingMode = true;
            this.canvas.freeDrawingBrush.width = wickEditor.settings.brushThickness;
            this.canvas.freeDrawingBrush.color = wickEditor.settings.fillColor;
        } else if (wickEditor.currentTool instanceof Tools.Eraser) {
            this.canvas.isDrawingMode = true;
            this.canvas.freeDrawingBrush.width = wickEditor.settings.brushThickness;
            this.canvas.freeDrawingBrush.color = "#FFFFFF";
        } else {
            this.canvas.isDrawingMode = false;
        }

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
        var centerX = Math.floor(-(window.innerWidth -wickEditor.project.width)/2 - 33/2 + 254/2);
        var centerY = Math.floor(-(window.innerHeight-wickEditor.project.height)/2 - 100/2);
        
        self.canvas.absolutePan(new fabric.Point(centerX,centerY));
    }

    this.recenterCanvas = function () {
        self.canvas.setZoom(1);
        self.resetPan();
        self.canvas.renderAll();
    }

    this.relativePan = function (x,y) {
        var delta = new fabric.Point(Math.floor(x),Math.floor(y));
        self.canvas.relativePan(delta)
        self.guiElements.update();
    }

    this.absolutePan = function (x,y) {
        var delta = new fabric.Point(Math.floor(x),Math.floor(y));
        self.canvas.absolutePan(delta)
        self.guiElements.update();
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

        self.guiElements.update();
        self.updateCursor();

        wickEditor.toolbar.syncWithEditorState();

        //wickEditor.syncInterfaces();
    }

    this.setZoom = function (newZoom, nosync) {
        var centerX = Math.floor(-(window.innerWidth -wickEditor.project.width)/2 - 33/2 + 254/2);
        var centerY = Math.floor(-(window.innerHeight-wickEditor.project.height)/2 - 100/2);

        centerX -= (wickEditor.project.width  - wickEditor.project.width *newZoom)/2;
        centerY -= (wickEditor.project.height - wickEditor.project.height*newZoom)/2;

        self.canvas.setZoom(newZoom);
        self.canvas.absolutePan(new fabric.Point(centerX,centerY));
        self.canvas.renderAll();

        if(!nosync) wickEditor.syncInterfaces();
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
        this.canvas.freeDrawingCursor = cursorImg;
    }

    this.getObjectByWickObject = function (wickObj) {
        var foundFabricObject = null;

        this.canvas.forEachObject(function(fabricObject) {
            if(fabricObject.wickObjectRef === wickObj) {
                foundFabricObject = fabricObject;
            }
        });

        return foundFabricObject;
    }

    this.selectObjectsHoveredOver = function () {
        if(self.objHoveredOver) {
            console.log(self.objHoveredOver)
            wickEditor.project.clearSelection();
            wickEditor.project.selectObject(self.objHoveredOver.wickObjReference);
            wickEditor.syncInterfaces();
        } else {
            wickEditor.project.clearSelection();
            wickEditor.syncInterfaces();
        }
    }

    this.selectObjects = function (objects) {
        //wickEditor.timeline.redraw();

        if(objects.length == 0) {
            return;
        }

        var selectedObjs = [];
        this.canvas.forEachObject(function(fabricObj) {
            if(objects.indexOf(fabricObj.wickObjectRef) != -1) {
                fabricObj.set('active', true);
                selectedObjs.push(fabricObj);
            }
        });
        selectedObjs.reverse()

        if(objects.length <= 1) {
            self.canvas._activeObject = selectedObjs[0];
            this.canvas.renderAll()
        } else {
            var group = new fabric.Group([], {
                originX: 'left',
                originY: 'top'
            });
            /*group.on({
                moving: group.setCoords,
                scaling: group.setCoords,
                rotating: group.setCoords
            });*/
            for(var i = 0; i < selectedObjs.length; i++) {
                group.canvas = this.canvas // WHAT ??????????????? WHY
                group.addWithUpdate(selectedObjs[i]);
            }

            this.canvas._activeObject = null;
            group.setCoords()
            this.canvas._activeGroup = group
            group.set('active', true);
            this.canvas.renderAll()
        }

        self.guiElements.update();
        wickEditor.scriptingide.syncWithEditorState();

    }

    this.selectAll = function () {
        //wickEditor.timeline.redraw();

        var objs = [];
        wickEditor.project.clearSelection();
        this.canvas.forEachObject(function (o) {
            if(o.wickObjectRef && o.selectable) {
                objs.push(o.wickObjectRef);
                wickEditor.project.selectObject(o.wickObjectRef)
            }
        });
        this.selectObjects(objs);
    }

    this.deselectAll = function () {
        this.canvas._objects.forEach(function(fabricObj) {
            if(fabricObj.text && fabricObj.isEditing) {
                fabricObj.exitEditing();
            }
        });

        var activeGroup = this.canvas.getActiveGroup();
        if(activeGroup) {
            activeGroup.removeWithUpdate(activeGroup);
            this.canvas.renderAll();
        }

        this.canvas.deactivateAll().renderAll();

        self.guiElements.update();
        wickEditor.scriptingide.syncWithEditorState();
    }

    this.getSelectedObjects = function () {
        var selectedObjs = [];

        var obj = this.canvas.getActiveObject();
        var group = this.canvas.getActiveGroup();
        var allSelectedFabricObjs = [];

        if(obj) {
            allSelectedFabricObjs = [obj];
        }
        if(group) {
            allSelectedFabricObjs = group._objects;
        }

        allSelectedFabricObjs.forEach(function (fabobj) {
            selectedObjs.push(fabobj.wickObjectRef);
        })

        return selectedObjs;

    }

    this.getSelectedObject = function () {
        var objs = wickEditor.fabric.getSelectedObjects();
        if(objs.length == 1) {
            return objs[0];
        } else {
            return null;
        }
    }

    this.moveSelection = function (x,y) {
        var modifiedStates = [];
        self.getSelectedObjects(WickObject).forEach(function (obj) {
            var wickObj = obj;
            modifiedStates.push({
                x : wickObj.x + x,
                y : wickObj.y + y,
                scaleX : obj.isPath ? 1 : obj.scaleX,
                scaleY : obj.isPath ? 1 : obj.scaleY,
                rotation : obj.isPath ? 0 : obj.rotation,
                flipX : obj.isPath ? false : obj.flipX,
                flipY : obj.isPath ? false : obj.flipY
            });
        });

        wickEditor.actionHandler.doAction('modifyObjects', {
            objs: self.getSelectedObjects(WickObject),
            modifiedStates: modifiedStates
        });
    }

    this.flipSelection = function (flipX, flipY) {
        var group = this.canvas.getActiveGroup();
        var object = this.canvas.getActiveObject();

        if(group) {
            if(flipX) {
                group.flipX = true;
            }
            if(flipY) {
                group.flipY = true;
            }
            group.setCoords();
            this.canvas.renderAll();

            self.modifyChangedObjects({target:group});
        }

        if(object) {
            if(flipX) {
                object.flipX = !object.flipX;
            }
            if(flipY) {
                object.flipY = !object.flipY;
            }
            self.modifyObjects([object.wickObjectRef]);
        }
    }

    this.modifyObjects = function (objs) {
        var modifiedStates = [];

        // For each modified fabric objects (get them by wickobject):
        //    Add new state of self fabric object to modified states
        objs.forEach(function (obj) {
            if(!obj) return;
            var fabricObj = self.getObjectByWickObject(obj);
            var wickObj = obj
            if(!wickObj) return;
            var insideSymbolReposition = {
                x: wickObj.x-wickObj.getAbsolutePosition().x,
                y: wickObj.y-wickObj.getAbsolutePosition().y
            };

            var newX = fabricObj.left + insideSymbolReposition.x;
            var newY = fabricObj.top  + insideSymbolReposition.y;

            modifiedStates.push({
                x      : newX,
                y      : newY,
                scaleX : fabricObj.scaleX,
                scaleY : fabricObj.scaleY,
                flipX  : fabricObj.flipX,
                flipY  : fabricObj.flipY,
                rotation  : fabricObj.angle,
                text   : fabricObj.text
            });
        });

        wickEditor.actionHandler.doAction('modifyObjects', {
            objs: objs,
            modifiedStates: modifiedStates
        });
    }

    self.modifyChangedObjects = function (e) {
        if(self.getObjectByWickObject(e.target.wickObjectRef)) {

            // Deselect everything
            self.deselectAll();
            
            // Get ids of all selected objects
            var wickobjs = [];
            if(e.target.type === "group" && !e.target.wickObjectRef) {
                // Selection is a group of objects all selected, not a symbol
                var objects = e.target.getObjects();
                objects.forEach(function (obj) {
                    wickobjs.push(obj.wickObjectRef);
                });
            } else {
                // Only one object selected
                wickobjs = [e.target.wickObjectRef];
            }

            self.modifyObjects(wickobjs);

            // Reselect everything
            //self.selectObjects(wickobjs);

            //wickEditor.syncInterfaces();
        }
    }

    this.forceModifySelectedObjects = function () {
        var wickObj = self.getSelectedObject(WickObject);
        if(wickObj && wickObj.textData) {
            self.modifyObjects([wickObj]);
        }
        //wickEditor.syncInterfaces();

    }

    //

    var updateProjectSelection = function (e) {
        self.getSelectedObjects().forEach(function (object) {
            wickEditor.project.selectObject(object);
        });
        /*if(e.target && e.target.wickObjReference) {
            wickEditor.project.selectObject(e.target.wickObjReference);
        } else if(e.target) {
            e.target._objects.forEach(function (obj) {
                if(obj.wickObjReference.uuid) 
                    wickEditor.project.selectObject(obj.wickObjReference);
            });
        }*/

        var selectedObj = wickEditor.project.getSelectedObject();
        if(selectedObj && selectedObj.parentFrame.parentLayer !== wickEditor.project.getCurrentLayer()) {
            wickEditor.actionHandler.doAction('movePlayhead', {
                obj: wickEditor.project.getCurrentObject(),
                newPlayheadPosition: wickEditor.project.getCurrentObject().playheadPosition,
                newLayer: selectedObj.parentFrame.parentLayer
            });
            wickEditor.project.clearSelection();
            wickEditor.project.selectObject(selectedObj)
            wickEditor.syncInterfaces();
        }
    }
    
}