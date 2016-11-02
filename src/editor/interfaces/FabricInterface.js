/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var FabricInterface = function (wickEditor) {

    var that = this;

// Setup fabric canvas

    this.canvas = new fabric.CanvasEx('fabricCanvas', {
        imageSmoothingEnabled:false,
        preserveObjectStacking:true,
        renderOnAddRemove:false,
        stateful:false,
    });
    this.canvas.selectionColor = 'rgba(0,0,5,0.1)';
    this.canvas.selectionBorderColor = 'grey';
    this.canvas.backgroundColor = "#EEE";
    this.canvas.setWidth ( window.innerWidth  );
    this.canvas.setHeight( window.innerHeight );
    this.canvas.imageSmoothingEnabled = false;

    this.context = this.canvas.getContext('2d');

    this.paperCanvas = document.createElement('canvas');
    paper.setup(this.canvas);

    this.creatingSelection = false;
    this.objectIDsInCanvas = [];

    this.panning = false;

// White box that shows resolution & objects that will be on screen when project is exported

    var frameInside = new fabric.Rect({
        fill: '#FFF',
    });

    frameInside.hasControls = false;
    frameInside.selectable = false;
    frameInside.evented = false;
    frameInside.identifier = "frameInside";
    frameInside.left = 0;
    frameInside.top = 0;

    this.canvas.add(frameInside)

// Fade that grays out inactive objects (the objects in the parent objects frame)

    var inactiveFrame = new fabric.Rect({
        fill: '#000',
    });

    inactiveFrame.hasControls = false;
    inactiveFrame.selectable = false;
    inactiveFrame.evented = false;
    inactiveFrame.identifier = "inactiveFrame";
    inactiveFrame.width  = window.innerWidth;
    inactiveFrame.height = window.innerHeight;
    inactiveFrame.left = 0;
    inactiveFrame.top = 0;

    this.canvas.add(inactiveFrame)

// Crosshair that shows where (0,0) of the current object is

    var originCrosshair;

    fabric.Image.fromURL('resources/origin.png', function(obj) {
        originCrosshair = obj;

        originCrosshair.hasControls = false;
        originCrosshair.selectable = false;
        originCrosshair.evented = false;
        originCrosshair.identifier = "originCrosshair";

        //that.canvas.add(originCrosshair);

        that.repositionGUIElements();
    });

// Borders for symbols

    var createSymbolButton = document.getElementById('createSymbolButton');
    var editSymbolButton = document.getElementById('editSymbolButton');
    var editSymbolScriptsButton = document.getElementById('editSymbolScriptsButton');
    
    that.canvas.on('after:render', function() {

        createSymbolButton.style.display = "none";
        editSymbolButton.style.display = "none";
        editSymbolScriptsButton.style.display = "none";

        // Reposition buttons
        var selection = that.canvas.getActiveObject() || that.canvas.getActiveGroup();
        if(selection) {
            var bound = selection.getBoundingRect();
            var pan = that.getPan();
            var corner = {
                x : bound.left+bound.width,
                y : bound.top 
            }

            var objIsSymbol = false;
            if(selection && selection.wickObjectID) {
                var wickObj = wickEditor.project.rootObject.getChildByID(selection.wickObjectID);
                if(wickObj && wickObj.isSymbol) {
                    objIsSymbol = true;
                }
            }

            if(objIsSymbol) {
                editSymbolButton.style.left = corner.x + 'px';
                editSymbolButton.style.top = corner.y + 35 + 'px';
                editSymbolButton.style.display = "block";
                editSymbolScriptsButton.style.left = corner.x + 'px';
                editSymbolScriptsButton.style.top = corner.y + 'px';
                editSymbolScriptsButton.style.display = "block";
            } else {
                createSymbolButton.style.left = corner.x + 'px';
                createSymbolButton.style.top = corner.y + 'px';
                createSymbolButton.style.display = "block";
            }
        }

        // Render bounding boxes for symbols
        var selectedIDs = that.getSelectedObjectIDs();
        that.canvas.forEachObject(function(obj) {
            var wickObj = wickEditor.project.rootObject.getChildByID(obj.wickObjectID);
            var activeLayerObjects = wickEditor.project.getCurrentObject().getAllActiveLayerChildObjects();
            if(!wickObj || !wickObj.isSymbol || activeLayerObjects.indexOf(wickObj) === -1) return;

            // Color the border differently depending if the object has errors
            if(!wickObj.hasSyntaxErrors && !wickObj.causedAnException) {
                that.canvas.contextContainer.strokeStyle = '#0B0';
            } else {
                that.canvas.contextContainer.strokeStyle = '#F00';
            }

            // We need to calculate an offset because of this bug: https://github.com/kangax/fabric.js/issues/1941
            var groupOffset = {x:0,y:0};
            if(selectedIDs.length > 1 && selectedIDs.indexOf(wickObj.id) !== -1) {
                var activeGroup = that.canvas.getActiveGroup();
                groupOffset.x = (activeGroup.left + activeGroup.width/2)*that.canvas.getZoom();
                groupOffset.y = (activeGroup.top + activeGroup.height/2)*that.canvas.getZoom();
            }

            var bound = obj.getBoundingRect();
            that.canvas.contextContainer.strokeRect(
                bound.left + 0.5 + groupOffset.x,
                bound.top + 0.5 + groupOffset.y,
                bound.width,
                bound.height
            );
            
        });
    });

/********************************
       
********************************/

    this.resize = function () {

        var oldWidth = that.canvas.getWidth();
        var oldHeight = that.canvas.getHeight();

        that.canvas.setWidth ( window.innerWidth  );
        that.canvas.setHeight( window.innerHeight );
        that.canvas.calcOffset();

        var diffWidth = that.canvas.getWidth() - oldWidth;
        var diffHeight = that.canvas.getHeight() - oldHeight;

        var panAdjustX = Math.floor(diffWidth/2);
        var panAdjustY = Math.floor(diffHeight/2);

        that.canvas.relativePan(new fabric.Point(panAdjustX,panAdjustY));
        that.canvas.renderAll();

    }
    window.addEventListener('resize', this.resize, false);

    this.recenterCanvas = function () {
        var centerX = Math.floor(-(window.innerWidth -wickEditor.project.resolution.x)/2);
        var centerY = Math.floor(-(window.innerHeight-wickEditor.project.resolution.y)/2);
        that.canvas.setZoom(1.0);
        that.canvas.absolutePan(new fabric.Point(centerX,centerY));
        that.canvas.renderAll();
        wickEditor.syncInterfaces();
    }

    this.relativePan = function (x,y) {
        var delta = new fabric.Point(Math.floor(x),Math.floor(y));
        that.canvas.relativePan(delta)
        that.repositionGUIElements();
    }

    this.absolutePan = function (x,y) {
        var delta = new fabric.Point(Math.floor(x),Math.floor(y));
        that.canvas.absolutePan(delta)
        that.repositionGUIElements();
    }

    this.startPan = function () {
        that.panning = true;
        that.canvas.selection = false;
    }

    this.stopPan = function () {
        that.panning = false;
        that.canvas.selection = true;
    }

    this.getPan = function () {
        return {
            x: that.canvas.viewportTransform[4],
            y: that.canvas.viewportTransform[5]
        }
    }

    this.zoom = function (zoomAmount) {
        // Calculate new zoom amount
        var oldZoom = that.canvas.getZoom();
        var newZoom = that.canvas.getZoom() * zoomAmount;

        // Calculate pan position adjustment so we zoom into the mouse's position
        var panAdjustX = (wickEditor.inputHandler.mouse.x) * (1-zoomAmount);
        var panAdjustY = (wickEditor.inputHandler.mouse.y) * (1-zoomAmount);

        // Do da zoom!
        that.canvas.setZoom(newZoom);
        that.canvas.relativePan(new fabric.Point(panAdjustX,panAdjustY));
        that.canvas.renderAll();

        that.repositionGUIElements();

        wickEditor.syncInterfaces();
    }

/********************************
       Editor state syncing
********************************/

    this.repositionGUIElements = function () {
        frameInside.fill = wickEditor.project.backgroundColor;
        frameInside.width  = wickEditor.project.resolution.x;
        frameInside.height = wickEditor.project.resolution.y;
        frameInside.setCoords();

        if(originCrosshair) {
            originCrosshair.left = -originCrosshair.width/2;
            originCrosshair.top  = -originCrosshair.height/2;
            
            originCrosshair.left += wickEditor.project.getCurrentObject().x;
            originCrosshair.top  += wickEditor.project.getCurrentObject().y;

            that.canvas.renderAll();
        }

        var pan = that.getPan();
        var zoom = that.canvas.getZoom();
        inactiveFrame.width  = window.innerWidth  / zoom;
        inactiveFrame.height = window.innerHeight / zoom;
        inactiveFrame.left = -pan.x / zoom;
        inactiveFrame.top  = -pan.y / zoom;
    }

    this.syncWithEditorState = function () {

        //console.log("-------------------")
        //startTiming();

        wickEditor.project.rootObject.applyTweens();

        // Update tool state
        var cursorImg = wickEditor.currentTool.getCursorImage();
        this.canvas.defaultCursor = cursorImg;
        this.canvas.freeDrawingCursor = cursorImg;

        if(wickEditor.currentTool instanceof PaintbrushTool
           /* || wickEditor.currentTool.instanceof EraserTool*/) {
            this.canvas.isDrawingMode = true;
            this.canvas.freeDrawingBrush.width = wickEditor.currentTool.brushSize;
            this.canvas.freeDrawingBrush.color = wickEditor.currentTool.color;
        } else {
            this.canvas.isDrawingMode = false;
        }

        if(wickEditor.currentTool instanceof CursorTool) {
            that.canvas.selection = true;
        } else {
            that.canvas.selection = false;
        }

        //stopTiming("init");

        var currentObject = wickEditor.project.getCurrentObject();

        // Make sure everything is deselected, mulitple selected objects cause positioning problems.
        var selectedObjectIDs = that.getSelectedObjectIDs();
        that.deselectAll();

        var activeObjects = currentObject.getAllActiveChildObjects();
        var siblingObjects = currentObject.getAllInactiveSiblings();
        var nearbyObjects = wickEditor.project.onionSkinning ? currentObject.getNearbyObjects(3,3) : [];
        var allObjects = activeObjects.concat(siblingObjects.concat(nearbyObjects));

        var allObjectsIDs = [];
        allObjects.forEach(function(obj) { allObjectsIDs.push(obj.id) });

        //stopTiming("object list generation");

        // Remove objects that don't exist anymore or need to be regenerated
        this.canvas.forEachObject(function(fabricObj) {
            if(!fabricObj || !fabricObj.wickObjectID) return;

            var wickObj = wickEditor.project.rootObject.getChildByID(fabricObj.wickObjectID);

            if(allObjectsIDs.indexOf(fabricObj.wickObjectID) == -1 || (wickObj && wickObj.forceFabricCanvasRegen)) {
                if(wickObj) wickObj.forceFabricCanvasRegen = false;
                that.objectIDsInCanvas[fabricObj.wickObjectID] = false;
                // Object doesn't exist in the current object anymore, remove it's fabric object.
                if(fabricObj.type === "group") {
                    fabricObj.forEachObject(function(o){ fabricObj.removeWithUpdate(o) });
                    that.canvas.remove(fabricObj);
                    that.canvas.renderAll();
                } else {
                    fabricObj.remove();
                }
            }
        });

        //stopTiming("remove objects");

        var updateFabObj = function (fabricObj, wickObj) {

            var setCoords = fabricObj.setCoords.bind(fabricObj);
              fabricObj.on({
                moving: setCoords,
                scaling: setCoords,
                rotating: setCoords
              });

            if(wickObj.imageDirty) {
                var img=new Image();
                img.onload=function(){
                    fabricObj.setElement(img);
                    that.canvas.renderAll();
                }
                img.src=wickObj.imageData;
                wickObj.imageDirty = false;
            }

            if(activeObjects.indexOf(wickObj) !== -1) {
                fabricObj.hasControls = true;
                fabricObj.selectable = true;
                fabricObj.evented = true;

                // OPTIMIZATION WORK: get ridda this
                //fabricObj.trueZIndex = currentObject.getCurrentFrame().wickObjects.indexOf(wickObj);
                //that.canvas.moveTo(fabricObj, fabricObj.trueZIndex+2 + activeObjects.length+3);
            } else {
                fabricObj.hasControls = false;
                fabricObj.selectable = false;
                fabricObj.evented = false;

                // OPTIMIZATION WORK: get ridda this
                //that.canvas.moveTo(fabricObj, activeObjects.length+3);

                if(nearbyObjects.indexOf(wickObj) !== -1) {
                    var framePlayheadPosition = currentObject.getPlayheadPositionAtFrame(currentObject.getFrameWithChild(wickObj));
                    fabricObj.opacity = (wickObj.opacity * (1-(Math.abs(framePlayheadPosition-currentObject.playheadPosition)/4)))/3;
                    that.canvas.renderAll();
                }
            }

            if (!(wickEditor.currentTool instanceof CursorTool)) {
                fabricObj.hasControls = false;
                fabricObj.selectable = false;
                fabricObj.evented = false;
            }

            if (!wickObj.isOnActiveLayer()) {
                fabricObj.hasControls = false;
                fabricObj.selectable = false;
                fabricObj.evented = false;
            }
        }

        var objectsToAdd = [];
        var selectionChanged = false;

        // Add new objects and update existing objects
        allObjects.forEach(function (child) {
            if(that.objectIDsInCanvas[child.id]) {
                // Update existing object
                that.canvas.forEachObject(function(fabricObj) {
                    if(fabricObj.wickObjectID === child.id) {
                        that.syncObjects(child, fabricObj);
                        updateFabObj(fabricObj, child);
                    }
                });
                /*var fabricObj;
                that.canvas.forEachObject(function(fabricObj) {
                    if(fabricObj.wickObjectID === child.id) {
                        fabricObj = fabricObj;
                    }
                });
                objectsToUpdate.push({wickObj:child,fabricObj:getObjectByID(child.id)});*/
            } else {
                // Add new object
                that.objectIDsInCanvas[child.id] = true;
                objectsToAdd.push(child);
            }
        });

        var numObjectsAdded = 0;
        objectsToAdd.forEach(function (objectToAdd) {
            that.createFabricObjectFromWickObject(objectToAdd, function (fabricObj) {

                that.canvas.forEachObject(function(path) {
                    if(path.isTemporaryDrawingPath) {
                        that.canvas.remove(path);
                    }
                });

                // The object may have been deleted while we were generating the fabric object. 
                // Make sure we don't add it if so.
                if(!wickEditor.project.rootObject.getChildByID(objectToAdd.id)) return;

                //fabricObj.originX = 'center';
                //fabricObj.originY = 'center';

                fabricObj.wickObjectID = objectToAdd.id;
                that.canvas.add(fabricObj);
                updateFabObj(fabricObj, objectToAdd);

                if(objectToAdd.selectOnAddToFabric) {
                    if(!selectionChanged) {
                        selectionChanged = true;
                        selectedObjectIDs = [];
                    }
                    selectedObjectIDs.push(objectToAdd.id);
                    objectToAdd.selectOnAddToFabric = false;
                }

                numObjectsAdded++;
                if(numObjectsAdded === objectsToAdd.length) {
                    that.canvas.renderAll();
                }

                //fabricObj.trueZIndex = currentObject.getCurrentFrame().wickObjects.indexOf(child);
                //that.canvas.moveTo(fabricObj, fabricObj.trueZIndex+2 + activeObjects.length+3);
            });
        })

        //stopTiming("add/update objects");

        // Reselect objects that were selected before sync
        if(selectedObjectIDs.length > 0) that.selectByIDs(selectedObjectIDs);

        that.repositionGUIElements();

        // Update inactive object overlay
        // OPTIMIZATION WORK: get ridda this
        //that.canvas.moveTo(that.inactiveFrame, siblingObjects.length+1);
        inactiveFrame.opacity = currentObject.isRoot ? 0.0 : 0.4;

        //stopTiming("reselect/cleanup");

        this.canvas.renderAll();
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

        fabricObj.left    = wickObj.getAbsolutePosition().x;
        fabricObj.top     = wickObj.getAbsolutePosition().y;
        fabricObj.width   = wickObj.width;
        fabricObj.height  = wickObj.height;
        fabricObj.scaleX  = wickObj.scaleX;
        fabricObj.scaleY  = wickObj.scaleY;
        fabricObj.angle   = wickObj.angle;
        fabricObj.flipX   = wickObj.flipX;
        fabricObj.flipY   = wickObj.flipY;
        fabricObj.opacity = wickObj.opacity;

        if(wickObj.isSymbol) {
            var cornerPosition = wickObj.getSymbolBoundingBoxCorner();
            fabricObj.left += cornerPosition.x;
            fabricObj.top += cornerPosition.y;
        }

        if(wickObj.fontData) {
            fabricObj.text = wickObj.fontData.text;
            fabricObj.fontFamily = wickObj.fontData.fontFamily;
            fabricObj.fill = wickObj.fontData.fill;
            fabricObj.fontSize = wickObj.fontData.fontSize;
        } else {
            if(wickObj.opacity > 0) {
                fabricObj.perPixelTargetFind = true;
                fabricObj.targetFindTolerance = 4;
            } else {
                fabricObj.perPixelTargetFind = false;
            }
        }

        if(wickObj.svgData) {
            fabricObj.fill = wickObj.svgData.fillColor;
        }

        fabricObj.setCoords();

    }

    this.createFabricObjectFromWickObject = function (wickObj, callback) {

        if(wickObj.cachedFabricObject) {
            that.syncObjects(wickObj, wickObj.cachedFabricObject);
            callback(wickObj.cachedFabricObject);
            return;
        }

        if(wickObj.imageData) {
            fabric.Image.fromURL(wickObj.imageData, function(newFabricImage) {
                that.syncObjects(wickObj, newFabricImage);
                wickObj.cachedFabricObject = newFabricImage;
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

        if(wickObj.svgData) {

            fabric.loadSVGFromString(wickObj.svgData.svgString, function(objects, options) {
                var pathFabricObj = objects[0];

                //that.syncObjects(wickObj, pathFabricObj);
                pathFabricObj.fill = wickObj.svgData.fillColor;

                /*fabric.loadSVGFromString(this.svgData.svgString, function(objects, options) {
                    objects[0].fill = that.svgData.fillColor;
                    var svgFabricObject = fabric.util.groupSVGElements(objects, options);
                    svgFabricObject.scaleX /= window.devicePixelRatio;
                    svgFabricObject.scaleY /= window.devicePixelRatio;
                    svgFabricObject.setCoords();
                    svgFabricObject.cloneAsImage(function(clone) {
                        var element = clone.getElement();
                        var imgSrc = element.src;
                        that.svgCacheImageData = imgSrc;
                        callback();
                    }, {enableRetinaScaling:false});
                });*/
                
                pathFabricObj.scaleX /= window.devicePixelRatio;
                pathFabricObj.scaleY /= window.devicePixelRatio;
                pathFabricObj.cloneAsImage(function(clone) {
                    var element = clone.getElement();
                    var imgSrc = element.src;
                    //that.svgCacheImageData = imgSrc;
                    fabric.Image.fromURL(imgSrc, function(newFabricImage) {
                        that.syncObjects(wickObj, newFabricImage);
                        wickObj.cachedFabricObject = newFabricImage;
                        callback(newFabricImage);
                    });
                }, {enableRetinaScaling:false});

                //wickObj.cachedFabricObject = pathFabricObj;

                //callback(pathFabricObj);
            });
        }

        if (wickObj.isSymbol) {
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
  Objects modified by fabric.js
********************************/

    var modifyObjects = function (ids) {
        var modifiedStates = [];

        // For each modified fabric objects (get them by wickobject):
        //    Add new state of that fabric object to modified states
        ids.forEach(function (id) {
            var fabricObj = that.getObjectByWickObjectID(id);
            var wickObj = wickEditor.project.getObjectByID(id);
            var insideSymbolReposition = {
                x: wickObj.x-wickObj.getAbsolutePosition().x,
                y: wickObj.y-wickObj.getAbsolutePosition().y 
            };

            var cornerOffset = {
                x:0,
                y:0
            }
            if(wickObj.isSymbol) {
                cornerOffset.x = wickObj.getSymbolBoundingBoxCorner().x;
                cornerOffset.y = wickObj.getSymbolBoundingBoxCorner().y;
            }

            var newX = fabricObj.left + insideSymbolReposition.x - cornerOffset.x;
            var newY = fabricObj.top  + insideSymbolReposition.y - cornerOffset.y;

            // To get pixel-perfect positioning to avoid blurry images (this happens when an image has a fractional position)
            if(wickObj.imageData) {
                newX = Math.round(newX);
                newY = Math.round(newY);
            }

            modifiedStates.push({
                x      : newX,
                y      : newY,
                scaleX : fabricObj.scaleX,
                scaleY : fabricObj.scaleY,
                flipX  : fabricObj.flipX,
                flipY  : fabricObj.flipY,
                angle  : fabricObj.angle,
                text   : fabricObj.text
            });
        });

        wickEditor.actionHandler.doAction('modifyObjects', {
            ids: ids,
            modifiedStates: modifiedStates}
        );
    }

    this.forceModifySelectedObjects = function () {
        var wickObj = that.getSelectedWickObject();
        if(wickObj && wickObj.fontData) {
            modifyObjects([wickObj.id]);
        }
    }

    // Listen for objects being changed so we can undo them in the action handler.
    that.canvas.on('object:modified', function(e) {

        if(that.getObjectByWickObjectID(e.target.wickObjectID)) {

            // Deselect everything
            that.deselectAll();

            // Delete text boxes with no text in 'em.
            if (e.target.text === '') {
                var wickObj = wickEditor.project.getCurrentObject().getChildByID(e.target.wickObjectID);
                // Make sure the original text comes back on undo
                wickObj.text = e.target.originalState.text;
                wickEditor.actionHandler.doAction('deleteObjects', { ids:[e.target.wickObjectID] });
                return;
            }

            // Get ids of all selected objects
            var ids = [];
            if(e.target.type === "group" && !e.target.wickObjectID) {
                // Selection is a group of objects all selected, not a symbol
                var objects = e.target.getObjects();
                objects.forEach(function (obj) {
                    ids.push(obj.wickObjectID);
                });
            } else {
                // Only one object selected
                ids = [e.target.wickObjectID];
            }

            modifyObjects(ids);

            // Reselect everything
            that.selectByIDs(ids);

            wickEditor.syncInterfaces();
        }
    });

/********************************
          Shape drawing
********************************/

// This code should be in the shape drawing tool objects >.<

    var drawingShape = null;

    this.mouseToScreenSpace = function (x,y) {
        var pan = that.getPan();
        var zoom = that.canvas.getZoom();
        return {
            x: (x - pan.x)/zoom,
            y: (y - pan.y)/zoom
        }
    }

    var shapeStartPos = {x:0,y:0};

    this.startDrawingShape = function (shapeType, x, y) {

        that.canvas.selection = false;

        var screenXY = that.mouseToScreenSpace(x,y)

        shapeStartPos = {x:screenXY.x,y:screenXY.y};

        if(shapeType === 'rectangle') {
            drawingShape = new fabric.Rect({
                top : screenXY.y,
                left : screenXY.x,
                width : 1,
                height : 1,
                fill : wickEditor.tools.paintbrush.color
            });
        } else if (shapeType === 'ellipse') {
            drawingShape = new fabric.Ellipse({
                originX: 'centerX',
                originY: 'centerY',
                top : screenXY.y,
                left : screenXY.x,
                width : 1,
                height : 1,
                fill : wickEditor.tools.paintbrush.color
            });
        }

        that.canvas.add(drawingShape);

    }

    this.updateDrawingShape = function (x,y) {
        if(drawingShape) {
            var screenXY = that.mouseToScreenSpace(x,y);

            if(drawingShape.type === 'rect') {
                if(screenXY.x < shapeStartPos.x) drawingShape.left = screenXY.x;
                if(screenXY.y < shapeStartPos.y) drawingShape.top  = screenXY.y;
                drawingShape.width  = Math.abs(shapeStartPos.x - screenXY.x);
                drawingShape.height = Math.abs(shapeStartPos.y - screenXY.y);            
            } else if(drawingShape.type === 'ellipse') {
                drawingShape.width  = Math.abs(drawingShape.left - screenXY.x);
                drawingShape.height = Math.abs(drawingShape.top  - screenXY.y);    
                drawingShape.rx = Math.abs(drawingShape.left - screenXY.x);
                drawingShape.ry = Math.abs(drawingShape.top  - screenXY.y);
            }
            that.canvas.renderAll();
        }
    }

    this.stopDrawingShape = function () {

        that.canvas.selection = true;

        if(!drawingShape) return;

        if(drawingShape.type === 'rect') {
            var origX = drawingShape.left;
            var origY = drawingShape.top;
            drawingShape.left = 0;
            drawingShape.top = 0;
            drawingShape.setCoords();
            var svg = '<rect width="'+drawingShape.width+'" height="'+drawingShape.height+'" style="fill:rgb(0,0,255);" />'
            var SVGData = {
                svgString: '<svg id="svg" version="1.1" xmlns="http://www.w3.org/2000/svg">'+svg+'</svg>', 
                fillColor: wickEditor.tools.paintbrush.color
            }
            var wickObj = WickObject.fromSVG(SVGData);

            that.canvas.remove(drawingShape);
            wickEditor.syncInterfaces();

            wickObj.x = origX;
            wickObj.y = origY;

            wickEditor.actionHandler.doAction('addObjects', {
                wickObjects: [wickObj]
            });
        } else if (drawingShape.type === 'ellipse') {
            var origX = drawingShape.left;
            var origY = drawingShape.top;
            drawingShape.left = 0;
            drawingShape.top = 0;
            drawingShape.setCoords();
            var svg = '<ellipse cx="'+drawingShape.width+'" cy="'+drawingShape.height+'" rx="'+drawingShape.width+'" ry="'+drawingShape.height+'"/>'
            var SVGData = {
                svgString: '<svg width="'+drawingShape.width*2+'" height="'+drawingShape.height*2+'"  id="svg" version="1.0" xmlns="http://www.w3.org/2000/svg">'+svg+'</svg>', 
                fillColor: wickEditor.tools.paintbrush.color
            }
            var wickObj = WickObject.fromSVG(SVGData);

            that.canvas.remove(drawingShape);
            wickEditor.syncInterfaces();

            wickObj.x = origX - drawingShape.width;
            wickObj.y = origY - drawingShape.height;

            wickEditor.actionHandler.doAction('addObjects', {
                wickObjects: [wickObj]
            });
        }

        drawingShape = null;

    }

    that.canvas.on('mouse:move', function (e) {
        that.updateDrawingShape(e.e.offsetX,e.e.offsetY);
    });

    that.canvas.on('mouse:up', function (e) {
        that.stopDrawingShape();
    });

/********************************
        Selection Utils
********************************/

    // Update the scripting GUI/properties box when the selected object changes
    that.canvas.on('object:selected', function (e) {
        wickEditor.syncInterfaces(['scriptingide','properties']);
    });
    that.canvas.on('selection:cleared', function (e) {
        wickEditor.syncInterfaces(['scriptingide','properties']);
    });
    that.canvas.on('selection:changed', function (e) {
        that.repositionGUIElements();
        wickEditor.syncInterfaces(['scriptingide','properties']);
    });

    this.getObjectByWickObjectID = function (wickObjID) {
        var foundFabricObject = null;

        this.canvas.forEachObject(function(fabricObject) {
            if(fabricObject.wickObjectID === wickObjID) {
                foundFabricObject = fabricObject;
            }
        });

        return foundFabricObject;
    }

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
            var group = new fabric.Group([], {
                originX: 'left', 
                originY: 'top'
            });
            for(var i = 0; i < selectedObjs.length; i++) {
                group.canvas = this.canvas // WHAT ??????????????? WHY
                group.addWithUpdate(selectedObjs[i]);
            }

            this.canvas._activeObject = null;
            this.canvas.setActiveGroup(group.setCoords()).renderAll();
        }

        that.creatingSelection = false;

        that.repositionGUIElements();
        wickEditor.syncInterfaces(['scriptingide','properties']);

    }

    this.selectAll = function () {
        var ids = [];
        this.canvas.forEachObject(function (o) {
            if(o.wickObjectID && o.selectable) {
                ids.push(o.wickObjectID);
            }
        });
        this.selectByIDs(ids);
    }

    this.deselectAll = function () {

        that.creatingSelection = true;

        var activeGroup = this.canvas.getActiveGroup();
        if(activeGroup) {
            activeGroup.removeWithUpdate(activeGroup);
            this.canvas.renderAll();
        }

        this.canvas.deactivateAll().renderAll();

        that.creatingSelection = false;

        that.repositionGUIElements();
        wickEditor.syncInterfaces(['scriptingide','properties']);

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

    this.moveSelection = function (x,y) {
        var modifiedStates = [];
        that.getSelectedObjectIDs().forEach(function (id) {
            var wickObj = wickEditor.project.rootObject.getChildByID(id);
            modifiedStates.push({
                x : wickObj.x + x,
                y : wickObj.y + y,
            });
        });

        wickEditor.actionHandler.doAction('modifyObjects', { 
            ids: that.getSelectedObjectIDs(), 
            modifiedStates: modifiedStates 
        });
    }

    this.recenterCanvas();
    this.repositionGUIElements();
    
}