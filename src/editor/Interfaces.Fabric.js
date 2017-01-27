/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var FabricInterface = function (wickEditor) {

    var self = this;

    var shapeStartPos = {x:0,y:0};

    this.setup = function () {

        this.canvas = new fabric.CanvasEx('fabricCanvas', {
            imageSmoothingEnabled : true,
            preserveObjectStacking : true,
            renderOnAddRemove : false,
        });
        this.canvas.selectionColor = 'rgba(110, 110, 115, 0.1)';
        this.canvas.selectionBorderColor = 'grey';
        this.canvas.backgroundColor = "#EEE";
        this.canvas.setWidth(window.innerWidth);
        this.canvas.setHeight(window.innerHeight);

        // This is disabled because it made zooming really slow and also caused some rendering problems with the centerpoints of symbols
        fabric.Object.prototype.objectCaching = false;

        this.panning = false;
        this.onionSkinsDirty = false;

        this.shapeDrawer     = new FabricShapeDrawer(wickEditor, this);
        this.guiElements     = new FabricGUIElements(wickEditor, this);
        this.wickElements    = new FabricWickElements(wickEditor, this);
        this.symbolBorders   = new FabricSymbolBorders(wickEditor, this);
        this.projectRenderer = new FabricProjectRenderer(wickEditor, this);
        
        this.tools = {
            "cursor"           : new Tools.Cursor(wickEditor),
            "paintbrush"       : new Tools.Paintbrush(wickEditor),
            "eraser"           : new Tools.Eraser(wickEditor),
            "fillbucket"       : new Tools.FillBucket(wickEditor),
            "rectangle"        : new Tools.Rectangle(wickEditor),
            "ellipse"          : new Tools.Ellipse(wickEditor),
            "dropper"          : new Tools.Dropper(wickEditor),
            "text"             : new Tools.Text(wickEditor),
            "zoom"             : new Tools.Zoom(wickEditor),
            "pan"              : new Tools.Pan(wickEditor),
            "backgroundremove" : new Tools.BackgroundRemove(wickEditor),
            "crop"             : new Tools.Crop(wickEditor),
        }

        this.currentTool = this.tools.cursor;
        this.lastTool = this.currentTool;

        // Canvas event listeners

        self.canvas.on({
            'object:moving': function(e) {
                if(e.target.type === 'path')
                    e.target.opacity = 0.5;
            },
            'object:modified': function(e) {
                if(e.target.type === 'path')
                    e.target.opacity = 1;
            },
        });
        self.canvas.on('object:selected', function (e) {
            wickEditor.timeline.redraw();
            
            wickEditor.scriptingide.editScriptsOfObject(e.target.wickObjReference, {dontOpenIDE:true});
            wickEditor.scriptingide.syncWithEditorState();
            wickEditor.properties.syncWithEditorState();
            e.target.on({
                moving: e.target.setCoords,
                scaling: e.target.setCoords,
                rotating: e.target.setCoords
            });
        });
        self.canvas.on('before:selection:cleared', function (e) {
            
        });
        self.canvas.on('selection:cleared', function (e) {
            wickEditor.timeline.redraw();

            wickEditor.scriptingide.clearSelection();
            wickEditor.scriptingide.syncWithEditorState();
            wickEditor.properties.syncWithEditorState();
        });
        self.canvas.on('selection:changed', function (e) {
            wickEditor.timeline.redraw();

            wickEditor.scriptingide.editScriptsOfObject(this.getSelectedObject(WickObject), {dontOpenIDE:true});
            self.guiElements.update();
            wickEditor.scriptingide.syncWithEditorState();
            wickEditor.properties.syncWithEditorState();
        });

        // Listen for objects being changed so we can undo them in the action handler.
        self.canvas.on('object:modified', function(e) {
            self.modifyChangedObjects(e);
        });

        this.recenterCanvas();
        this.guiElements.update();

        window.addEventListener('resize', this.resize, false);

    }

    this.syncWithEditorState = function () {

        // Apply tweens
        wickEditor.project.rootObject.applyTweens();

        // Update cursor
        self.updateCursor();

        // Set drawing mode
        if(self.currentTool instanceof Tools.Paintbrush) {
            this.canvas.isDrawingMode = true;
            this.canvas.freeDrawingBrush.width = self.currentTool.brushSize;
            this.canvas.freeDrawingBrush.color = self.currentTool.color;
        } else if (self.currentTool instanceof Tools.Eraser) {
            this.canvas.isDrawingMode = true;
            this.canvas.freeDrawingBrush.width = self.tools.paintbrush.brushSize;
            this.canvas.freeDrawingBrush.color = "#FFFFFF";
        } else {
            this.canvas.isDrawingMode = false;
        }

        // Disable selection
        if(self.currentTool instanceof Tools.Cursor) {
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

    this.changeTool = function (newTool) {
        self.lastTool = self.currentTool;
        self.currentTool = newTool;
        self.forceModifySelectedObjects();
        self.deselectAll();
        wickEditor.syncInterfaces();

        if((self.lastTool instanceof Tools.Paintbrush) || 
           (self.lastTool instanceof Tools.Eraser) || 
           (self.lastTool instanceof Tools.Ellipse) || 
           (self.lastTool instanceof Tools.Rectangle)) {
            // Path cleanup used to be here
        }
    }

    this.useLastUsedTool = function () {
        self.currentTool = self.lastTool;
    }

    this.recenterCanvas = function () {
        var centerX = Math.floor(-(window.innerWidth -wickEditor.project.width)/2 - 33/2 + 254/2);
        var centerY = Math.floor(-(window.innerHeight-wickEditor.project.height)/2 - 116/2);

        self.canvas.setZoom(1);
        self.canvas.absolutePan(new fabric.Point(centerX,centerY));
        self.canvas.renderAll();
        wickEditor.syncInterfaces();
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

    this.zoom = function (zoomAmount) {
        // Calculate new zoom amount
        var oldZoom = self.canvas.getZoom();
        var newZoom = self.canvas.getZoom() * zoomAmount;

        // Calculate pan position adjustment so we zoom into the mouse's position
        var panAdjustX = (wickEditor.inputHandler.mouse.x) * (1-zoomAmount);
        var panAdjustY = (wickEditor.inputHandler.mouse.y) * (1-zoomAmount);

        // Do da zoom!
        self.canvas.setZoom(newZoom);
        self.canvas.relativePan(new fabric.Point(panAdjustX,panAdjustY));
        //self.canvas.renderAll();

        self.guiElements.update();
        self.updateCursor();

        //wickEditor.syncInterfaces();
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
        var cursorImg = self.currentTool.getCursorImage();
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

    this.selectObjects = function (objects) {
        wickEditor.timeline.redraw();

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
        } else {
            var group = new fabric.Group([], {
                originX: 'left',
                originY: 'top'
            });
            group.on({
                moving: group.setCoords,
                scaling: group.setCoords,
                rotating: group.setCoords
              });
            for(var i = 0; i < selectedObjs.length; i++) {
                group.canvas = this.canvas // WHAT ??????????????? WHY
                group.addWithUpdate(selectedObjs[i]);
            }

            this.canvas._activeObject = null;
            this.canvas.setActiveGroup(group.setCoords()).renderAll();
        }

        self.guiElements.update();
        wickEditor.scriptingide.syncWithEditorState();
        wickEditor.properties.syncWithEditorState();

    }

    this.selectAll = function () {
        wickEditor.timeline.redraw();

        var objs = [];
        this.canvas.forEachObject(function (o) {
            if(o.wickObjectRef && o.selectable) {
                objs.push(o.wickObjectRef);
            }
        });
        this.selectObjects(objs);
    }

    this.deselectAll = function (clearScriptingSelection) {
        wickEditor.timeline.redraw();

        if(!clearScriptingSelection)
            wickEditor.scriptingide.clearSelection();

        var activeGroup = this.canvas.getActiveGroup();
        if(activeGroup) {
            activeGroup.removeWithUpdate(activeGroup);
            this.canvas.renderAll();
        }

        this.canvas.deactivateAll().renderAll();

        self.guiElements.update();
        wickEditor.scriptingide.syncWithEditorState();
        wickEditor.properties.syncWithEditorState();
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
            });
        });

        wickEditor.actionHandler.doAction('modifyObjects', {
            objs: self.getSelectedObjects(WickObject),
            modifiedStates: modifiedStates
        });
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
            self.selectObjects(wickobjs);

            wickEditor.syncInterfaces();
        }
    }

    this.forceModifySelectedObjects = function () {
        var wickObj = self.getSelectedObject(WickObject);
        if(wickObj && wickObj.fontData) {
            self.modifyObjects([wickObj]);
        }
        wickEditor.syncInterfaces();
    }
    
}