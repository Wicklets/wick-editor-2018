/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var FabricInterface = function (wickEditor) {

    var that = this;

// Setup fabric canvas

    this.canvas = new fabric.CanvasEx('fabricCanvas');
    this.canvas.selectionColor = 'rgba(0,0,5,0.1)';
    this.canvas.selectionBorderColor = 'grey';
    //this.canvas.selectionLineWidth = 2;
    this.canvas.backgroundColor = "#EEE";
    this.canvas.setWidth ( window.innerWidth  );
    this.canvas.setHeight( window.innerHeight );

    this.context = this.canvas.getContext('2d');

    this.paperCanvas = document.createElement('canvas');
    paper.setup(this.canvas);

    this.creatingSelection = false;
    this.objectIDsInCanvas = [];

/********************************
       Editor state syncing
********************************/

    this.syncWithEditorState = function () {

        // Update tool state
        this.canvas.defaultCursor = wickEditor.currentTool.getCursorImage();
        this.canvas.freeDrawingCursor = wickEditor.currentTool.getCursorImage();

        if(wickEditor.currentTool instanceof PaintbrushTool /*|| that.currentTool.instanceof EraserTool*/) {
            this.canvas.isDrawingMode = true;
            this.canvas.freeDrawingBrush.width = wickEditor.currentTool.brushSize;
            this.canvas.freeDrawingBrush.color = wickEditor.currentTool.color;
        } else {
            this.canvas.isDrawingMode = false;
        }

        // Reposition GUI element positions
        repositionFrame();
        repositionOriginCrosshair();
        repositionInactiveFrame();

        var currentObject = wickEditor.project.getCurrentObject();

        // Make sure everything is deselected, mulitple selected objects cause positioning problems.
        var selectedObjectIDs = that.getSelectedObjectIDs();
        that.deselectAll();

        var activeObjects = currentObject.getAllActiveChildObjects();
        var inactiveObjects = currentObject.getAllInactiveSiblings();
        var allObjects = activeObjects.concat(inactiveObjects);

        var allObjectsIDs = []; 
        allObjects.forEach(function(obj) { allObjectsIDs.push(obj.id) });

        // Remove objects that don't exist anymore
        this.canvas.forEachObject(function(fabricObj) {
            if(!fabricObj.wickObjectID) return;

            if(allObjectsIDs.indexOf(fabricObj.wickObjectID) == -1) {
                that.objectIDsInCanvas[fabricObj.wickObjectID] = false;
                // Object doesn't exist in the current object anymore, remove it's fabric object.
                if(fabricObj.type === "group") {
                    fabricObj.forEachObject(function(o){ fabricObj.remove(o) });
                    that.canvas.remove(fabricObj);
                } else {
                    fabricObj.remove();
                }
            }
        });

        // Add new objects and update existing objects
        allObjects.forEach(function (child) {
            if(that.objectIDsInCanvas[child.id]) {
                // Update existing object
                that.canvas.forEachObject(function(fabricObj) {
                    if(fabricObj.wickObjectID === child.id) {

                        that.syncObjects(child, fabricObj);

                        fabricObj.trueZIndex = currentObject.getCurrentFrame().wickObjects.indexOf(child);
                        fabricObj.isActive = inactiveObjects.indexOf(child) == -1;

                        if(fabricObj.isActive) {
                            that.canvas.moveTo(fabricObj, fabricObj.trueZIndex+2 + activeObjects.length);
                        } else {
                            that.canvas.moveTo(fabricObj, activeObjects.length);
                        }
                    }
                });
            } else {
                // Add new object
                that.objectIDsInCanvas[child.id] = true;
                that.createFabricObjectFromWickObject(child, function (newFabricObj) {

                    newFabricObj.wickObjectID = child.id;
                    that.canvas.add(newFabricObj);

                    newFabricObj.trueZIndex = currentObject.getCurrentFrame().wickObjects.indexOf(child);
                    newFabricObj.isActive = inactiveObjects.indexOf(child) == -1;

                    if(newFabricObj.isActive) {
                        that.canvas.moveTo(newFabricObj, newFabricObj.trueZIndex+2 + activeObjects.length);
                    } else {
                        that.canvas.moveTo(newFabricObj, activeObjects.length);
                    }
                });
            }
        });

        // Make sure things are unselectable if need be...
        that.canvas.forEachObject(function(fabricObj) {
            if(!(wickEditor.currentTool instanceof CursorTool)) {
                fabricObj.hasControls = false;
                fabricObj.selectable = false;
                fabricObj.evented = false;
            } else {
                if (fabricObj.isActive) {
                    fabricObj.hasControls = true;
                    fabricObj.selectable = true;
                    fabricObj.evented = true;
                } else {
                    fabricObj.hasControls = false;
                    fabricObj.selectable = false;
                    fabricObj.evented = false;
                }
            }
        });

        // Check for intersections between paths and unite them if they do
        wickEditor.tools['paintbrush'].uniteIntersectingPaths();

        // Split apart paths that are actually two paths
        wickEditor.tools['paintbrush'].splitPathsWithMultiplePieces();

        // Reselect objects that were selected before sync
        if(selectedObjectIDs.length > 0) that.selectByIDs(selectedObjectIDs);

        // Update inactive object overlay
        that.canvas.moveTo(that.inactiveFrame, inactiveObjects.length+1);
        this.inactiveFrame.opacity = currentObject.isRoot ? 0.0 : 0.2;

        this.canvas.renderAll();
    }

    this.getCenteredFrameOffset = function () {
        return {
            x: (window.innerWidth  - wickEditor.project.resolution.x)/2,
            y: (window.innerHeight - wickEditor.project.resolution.y)/2
        }
    }

    this.syncObjects = function (wickObj, fabricObj) {

        // Some wick objects don't have a defined width/height until rendered by fabric. (e.g. paths and text)
        if(!wickObj.width) wickObj.width = fabricObj.width;
        if(!wickObj.height) wickObj.height = fabricObj.height;

        // Always use length of text from fabric
        if(fabricObj.type === "i-text") {
            wickObj.width   = fabricObj.width;
            wickObj.height  = fabricObj.height;
        }

        fabricObj.left    = wickObj.getAbsolutePosition().x + this.getCenteredFrameOffset().x;
        fabricObj.top     = wickObj.getAbsolutePosition().y + this.getCenteredFrameOffset().y;
        fabricObj.width   = wickObj.width;
        fabricObj.height  = wickObj.height;
        fabricObj.scaleX  = wickObj.scaleX;
        fabricObj.scaleY  = wickObj.scaleY;
        fabricObj.angle   = wickObj.angle;
        fabricObj.flipX   = wickObj.flipX;
        fabricObj.flipY   = wickObj.flipY;
        fabricObj.opacity = wickObj.opacity;

        if(wickObj.isSymbol) {
            var cornerPosition = wickObj.getSymbolCornerPosition();
            fabricObj.left += cornerPosition.x;
            fabricObj.top += cornerPosition.y;
        }

        if(wickObj.fontData) {
            fabricObj.text = wickObj.fontData.text;
            fabricObj.fontFamily = wickObj.fontData.fontFamily;
            fabricObj.fill = wickObj.fontData.fill;
            fabricObj.fontSize = wickObj.fontData.fontSize;
        } else {
            fabricObj.perPixelTargetFind = true;
            fabricObj.targetFindTolerance = 4;
        }

        if(wickObj.svgData) {
            var xmlString = wickObj.svgData.svgString
              , parser = new DOMParser()
              , doc = parser.parseFromString(xmlString, "text/xml");
            var paperGroup = paper.project.importSVG(doc);
            var paperPath = paperGroup.removeChildren(0, 1)[0];
            //paperPath.style.fillColor = fillColor;
            if(paperPath.closePath) {
                paperPath.closePath();
            }

            paperPath.position.x += wickObj.x;
            paperPath.position.y += wickObj.y;

            fabricObj.paperPath = paperPath;
        }

        fabricObj.setCoords();

    }

    this.createFabricObjectFromWickObject = function (wickObj, callback) {

        if(wickObj.imageData) {
            fabric.Image.fromURL(wickObj.imageData, function(newFabricImage) {
                that.syncObjects(wickObj, newFabricImage);
                callback(newFabricImage);
            });
        }

        if(wickObj.fontData) {
            var newFabricText = new fabric.IText(wickObj.fontData.text, wickObj.fontData);
            that.syncObjects(wickObj, newFabricText);
            callback(newFabricText);
        }

        if(wickObj.audioData) {
            fabric.Image.fromURL('resources/audio.png', function(audioFabricObject) {
                that.syncObjects(wickObj, audioFabricObject);
                callback(audioFabricObject);
            });
        }

        if(wickObj.htmlData) {
            fabric.Image.fromURL('resources/htmlsnippet.png', function(htmlFabricObject) {
                that.syncObjects(wickObj, htmlFabricObject);
                callback(htmlFabricObject);
            });
        }

        if(wickObj.svgData) {

            fabric.loadSVGFromString(wickObj.svgData.svgString, function(objects, options) {
                var pathFabricObj = objects[0];

                that.syncObjects(wickObj, pathFabricObj);
                pathFabricObj.fill = wickObj.svgData.fillColor;
                callback(pathFabricObj);
            });
            /*fabric.loadSVGFromString(wickObj.svgData.svgString, function(objects, options) {
                objects[0].fill = wickObj.svgData.fillColor;
                var svgFabricObject = fabric.util.groupSVGElements(objects, options);
                svgFabricObject.cloneAsImage(function(clone) {
                    that.syncObjects(wickObj, clone);
                    callback(clone);
                });
            });*/
        }

        if (wickObj.isSymbol) {
            /*fabric.Image.fromURL(wickObj.frames[0].wickObjects[0].imageData, function(newFabricImage) {
                that.syncObjects(wickObj, newFabricImage);
                callback(newFabricImage);
            });*/
            var children = wickObj.getAllActiveChildObjects();
            var group = new fabric.Group();
            for(var i = 0; i < children.length; i++) {
                that.createFabricObjectFromWickObject(children[i], function(fabricObj) {
                    group.addWithUpdate(fabricObj);
                    if(group._objects.length == children.length) {
                        wickObj.width = group.width;
                        wickObj.height = group.height;
                        that.syncObjects(wickObj, group);
                        callback(group);
                    }
                });
            }
        }

    }

/********************************
         GUI Elements
********************************/

// White box that shows resolution & objects that will be on screen when project is exported

    var repositionFrame = function () {
        that.frameInside.fill = wickEditor.project.backgroundColor;
        that.frameInside.width  = wickEditor.project.resolution.x;
        that.frameInside.height = wickEditor.project.resolution.y;
        that.frameInside.left = that.getCenteredFrameOffset().x;
        that.frameInside.top  = that.getCenteredFrameOffset().y;
        that.frameInside.setCoords();
    }

    this.frameInside = new fabric.Rect({
        fill: '#FFF',
    });

    this.frameInside.hasControls = false;
    this.frameInside.selectable = false;
    this.frameInside.evented = false;
    this.frameInside.identifier = "frameInside";
    repositionFrame();

    this.canvas.add(this.frameInside)

// Fade that grays out inactive objects (the objects in the parent objects frame)

    var repositionInactiveFrame = function () {
        that.inactiveFrame.width  = window.innerWidth;
        that.inactiveFrame.height = window.innerHeight;
        that.inactiveFrame.left = 0;
        that.inactiveFrame.top  = 0;
        that.frameInside.setCoords();
    }

    this.inactiveFrame = new fabric.Rect({
        fill: '#000',
    });

    this.inactiveFrame.hasControls = false;
    this.inactiveFrame.selectable = false;
    this.inactiveFrame.evented = false;
    this.inactiveFrame.identifier = "inactiveFrame";
    repositionInactiveFrame();

    this.canvas.add(this.inactiveFrame)

// Crosshair that shows where (0,0) of the current object is

    var repositionOriginCrosshair = function () {
        if(that.originCrosshair) {
            that.originCrosshair.left = that.getCenteredFrameOffset().x - that.originCrosshair.width/2;
            that.originCrosshair.top  = that.getCenteredFrameOffset().y - that.originCrosshair.height/2;
            
            that.originCrosshair.left += wickEditor.project.getCurrentObject().x;
            that.originCrosshair.top  += wickEditor.project.getCurrentObject().y;

            that.canvas.renderAll();
        }
    }

    fabric.Image.fromURL('resources/origin.png', function(obj) {
        that.originCrosshair = obj;

        that.originCrosshair.hasControls = false;
        that.originCrosshair.selectable = false;
        that.originCrosshair.evented = false;
        that.originCrosshair.identifier = "originCrosshair";

        that.canvas.add(that.originCrosshair);

        repositionOriginCrosshair();
    });

    window.addEventListener('resize', function(e) {
        // Reposition all fabric objects to use new wick canvas origin

        var oldWidth = that.canvas.getWidth();
        var oldHeight = that.canvas.getHeight();

        that.canvas.setWidth ( window.innerWidth  );
        that.canvas.setHeight( window.innerHeight );
        that.canvas.calcOffset();

        var diffWidth = that.canvas.getWidth() - oldWidth;
        var diffHeight = that.canvas.getHeight() - oldHeight;

        that.canvas.forEachObject(function(fabricObj) {
            fabricObj.left += diffWidth /2;
            fabricObj.top  += diffHeight/2;
            fabricObj.setCoords();
        });

        repositionFrame();
        repositionOriginCrosshair();
        repositionInactiveFrame();
    }, false);

/********************************
  Objects modified by fabric.js
********************************/

    // Listen for objects being changed so we can undo them in the action handler.
    that.canvas.on('object:modified', function(e) {

        // Delete text boxes with no text in 'em.
        if (e.target.text === '') {
            var wickObj = wickEditor.project.getCurrentObject().getChildByID(e.target.wickObjectID);
            // Make sure the original text comes back on undo
            wickObj.text = e.target.originalState.text;
            wickEditor.actionHandler.doAction('deleteObjects', { ids:[e.target.wickObjectID] });
            return;
        }

        var frameOffset = that.getCenteredFrameOffset();

        var modifiedStates = [];
        var ids  = [];

        if(e.target.type === "group" && !e.target.wickObjectID) {
            var group = e.target;

            // May need to ungroup the group, deselect all, get transforms for each object, and reselect group for this to work properly.

            for(var i = 0; i < group._objects.length; i++) {
                var obj = group._objects[i];
                ids[i] = obj.wickObjectID;

                var wickObj = wickEditor.project.getCurrentObject().getChildByID(obj.wickObjectID);
                var insideSymbolReposition = {
                    x: wickObj.x-wickObj.getAbsolutePosition().x,
                    y: wickObj.y-wickObj.getAbsolutePosition().y }

                modifiedStates[i] = {
                    x      : group.left + group.width /2 + obj.left - frameOffset.x + insideSymbolReposition.x,
                    y      : group.top  + group.height/2 + obj.top  - frameOffset.y + insideSymbolReposition.y,
                    scaleX : group.scaleX * obj.scaleX,
                    scaleY : group.scaleY * obj.scaleY,
                    angle  : group.angle + obj.angle,
                    text   : obj.text
                };
            }
        } else {
            var fabObj = e.target;
            var wickObjID = fabObj.wickObjectID;
            var wickObj = wickEditor.project.getCurrentObject().getChildByID(wickObjID);
            
            var insideSymbolReposition = {
                x: wickObj.x-wickObj.getAbsolutePosition().x,
                y: wickObj.y-wickObj.getAbsolutePosition().y }

            ids[0] = wickObjID;
            modifiedStates[0] = {
                x      : fabObj.left - frameOffset.x + insideSymbolReposition.x - wickObj.getSymbolCornerPosition().x,
                y      : fabObj.top  - frameOffset.y + insideSymbolReposition.y - wickObj.getSymbolCornerPosition().y,
                scaleX : fabObj.scaleX,
                scaleY : fabObj.scaleY,
                angle  : fabObj.angle,
                text   : fabObj.text
            };
        }

        wickEditor.actionHandler.doAction('modifyObjects', 
            {ids: ids,
             modifiedStates: modifiedStates}
        );
    });

/********************************
        Selection Utils
********************************/

    // Update the scripting GUI/properties box when the selected object changes
    that.canvas.on('object:selected', function (e) {
        wickEditor.interfaces['scriptingide'].syncWithEditorState();
        wickEditor.interfaces['properties'].syncWithEditorState();
    });
    that.canvas.on('selection:cleared', function (e) {
        wickEditor.interfaces['scriptingide'].syncWithEditorState();
        wickEditor.interfaces['properties'].syncWithEditorState();
    });

    this.selectByIDs = function (ids) {

        that.creatingSelection = true;

        if(ids.length == 0) {
            return;
        }

        var selectedObjs = []; 
        this.canvas.forEachObject(function(fabricObj) {
            if(ids.indexOf(fabricObj.wickObjectID) != -1) {
                fabricObj.set('active', true);
                selectedObjs.push(fabricObj);
            }
        });

        if(ids.length <= 1) {
            that.canvas._activeObject = selectedObjs[0];
        } else {
            var group = new fabric.Group(selectedObjs, {
                originX: 'left', 
                originY: 'top'
            });

            this.canvas._activeObject = null;
            this.canvas.setActiveGroup(group.setCoords()).renderAll();
        }

        that.creatingSelection = false;

    }

    this.selectAll = function () {

        that.creatingSelection = true;

        var objs = [];
        this.canvas.getObjects().map(function(o) {
            if(o.wickObjectID && o.selectable) {
                o.set('active', true);
                return objs.push(o);
            }
        });

        var group = new fabric.Group(objs, {
            originX: 'left', 
            originY: 'top'
        });

        this.canvas._activeObject = null;

        this.canvas.setActiveGroup(group.setCoords()).renderAll();

        that.creatingSelection = false;

    }

    this.deselectAll = function () {

        that.creatingSelection = false;

        var activeGroup = this.canvas.getActiveGroup();
        if(activeGroup) {
            activeGroup.removeWithUpdate(activeGroup);
            this.canvas.renderAll();
        }

        this.canvas.deactivateAll().renderAll();

        that.creatingSelection = true;

    }

    this.getSelectedObjectIDs = function () {
        var ids = [];

        var obj   = this.canvas.getActiveObject();
        var group = this.canvas.getActiveGroup();

        if(obj) {
            ids.push(obj.wickObjectID);
        }

        if(group) {
            for(var i = 0; i < group._objects.length; i++) {
                ids.push(group._objects[i].wickObjectID);
            }
        }

        return ids;
    }

// Convenience methods for gettin selected WickObjects

    this.getSelectedWickObject = function () {
        var ids = wickEditor.interfaces['fabric'].getSelectedObjectIDs();
        if(ids.length == 1) {
            return wickEditor.project.getObjectByID(ids[0]);
        } else {
            return null;
        }
    }

    this.getSelectedWickObjects = function () {
        var ids = wickEditor.interfaces['fabric'].getSelectedObjectIDs();
        var wickObjects = [];
        for(var i = 0; i < ids.length; i++) {
            wickObjects.push(wickEditor.project.getObjectByID(ids[i]));
        }
        return wickObjects;
    }

}

