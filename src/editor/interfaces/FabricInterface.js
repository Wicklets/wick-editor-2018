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

/********************************
       Editor state syncing
********************************/

    this.syncWithEditorState = function () {

        // Update tool state
        if(wickEditor.currentTool.type == "paintbrush" || wickEditor.currentTool.type == "eraser") {
            this.canvas.isDrawingMode = true;
            this.canvas.freeDrawingBrush.width = wickEditor.currentTool.brushSize;
            this.canvas.freeDrawingBrush.color = wickEditor.currentTool.color;
        } else {
            this.canvas.isDrawingMode = false;
        }

        // Update frame
        if(this.frameInside) { // window resize can happen before frameInside's image is loaded
            repositionFrame();
        }

        // Move the origin crosshair to the current origin
        if(this.originCrosshair) { // window resize can happen before originCrosshair's image is loaded
            repositionOriginCrosshair();
        }

        var currentObject = wickEditor.project.getCurrentObject();

        // Make sure everything is deselected, mulitple selected objects cause positioning problems.
        var selectedObjectIDs = that.getSelectedObjectIDs();
        that.deselectAll();

        // Remove objects that don't exist anymore
        this.canvas.forEachObject(function(fabricObj) {
            if(!fabricObj.wickObjectID) return;

            if(!currentObject.childWithIDIsActive(fabricObj.wickObjectID)) {
                // Object doesn't exist in the current object anymore, remove it's fabric object.
                if(fabricObj.type === "group") {
                    fabricObj.forEachObject(function(o){ fabricObj.remove(o) });
                    that.canvas.remove(fabricObj);
                } else {
                    fabricObj.remove();
                }
            } else {
                // Object still exists in current object, update it
                that.syncObjects(currentObject.getChildByID(fabricObj.wickObjectID), fabricObj);
            }
        });

        // Add new objects and update zIndices
        var objectWithIDExistsInCanvas = function (id) {
            var found = false;

            that.canvas.forEachObject(function(fabricObj) {
                if(fabricObj.wickObjectID == id) {
                    found = true;
                }
            });

            return found;
        }

        currentObject.forEachActiveChildObject(function (child) {

            if(objectWithIDExistsInCanvas(child.id)) { 
                // Update existing object
                that.canvas.forEachObject(function(fabricObj) {
                    if(fabricObj.wickObjectID === child.id) {
                        var wickProjectIndex = currentObject.getCurrentFrame().wickObjects.indexOf(child);
                        that.canvas.moveTo(fabricObj, wickProjectIndex+3);
                    }
                });
            } else {
                // Add new object
                that.createFabricObjectFromWickObject(child, function (newFabricObj) {
                    newFabricObj.wickObjectID = child.id;
                    canvas.add(newFabricObj);
                    var wickProjectIndex = currentObject.getCurrentFrame().wickObjects.indexOf(child);
                    that.canvas.moveTo(newFabricObj, wickProjectIndex+3);
                });
            }
        });

        // Check for intersections between paths and unite them if they do
        uniteIntersectingPaths();

        // Split apart paths that are actually two paths
        splitPathsWithMultiplePieces();

        // Reselect objects that were selected before sync
        if(selectedObjectIDs.length > 0) that.selectByIDs(selectedObjectIDs);

        this.canvas.renderAll();
    }

    this.getCenteredFrameOffset = function () {
        return {
            x: (window.innerWidth  - wickEditor.project.resolution.x)/2,
            y: (window.innerHeight - wickEditor.project.resolution.y)/2
        }
    }

    this.transformCoordinatesToFabricCanvasSpace = function (x,y) {
        //console.error("transformCoordinatesToFabricCanvasSpace NYI");
        return {
            x: x,
            y: y
        }
    }

    this.syncObjects = function (wickObj, fabricObj) {

        // Some wick objects don't have a defined width/height until rendered by fabric. (e.g. paths and text)
        if(!wickObj.width) wickObj.width = fabricObj.width;
        if(!wickObj.height) wickObj.height = fabricObj.height;

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
            paperPath.position = new paper.Point(wickObj.x, wickObj.y);
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

// White box that shows resolution/objects that will be on screen when project is exported

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

// Crosshair that shows where (0,0) of the current object is

    var repositionOriginCrosshair = function () {
        that.originCrosshair.left = that.getCenteredFrameOffset().x - that.originCrosshair.width/2;
        that.originCrosshair.top  = that.getCenteredFrameOffset().y - that.originCrosshair.height/2;
        
        that.originCrosshair.left += wickEditor.project.getCurrentObject().x;
        that.originCrosshair.top  += wickEditor.project.getCurrentObject().y;

        that.canvas.renderAll();
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
    }, false);

/********************************
  Objects modified by fabric.js
********************************/

    var that = this;
    var canvas = this.canvas;

    // Listen for objects being changed so we can undo them in the action handler.
    canvas.on('object:modified', function(e) {

        // Delete text boxes with no text in 'em.
        if (e.target.text === '') {
            var wickObj = wickEditor.project.getChildByID(e.target.wickObjectID);
            // Make sure the original text comes back on undo
            wickObj.text = e.target.originalState.text;
            wickEditor.actionHandler.doAction('deleteObject', { ids:[e.target.wickObjectID] });
            return;
        }

        var frameOffset = that.getCenteredFrameOffset();

        var modifiedStates = [];
        var ids  = [];
        if(e.target.type === "group" && !e.target.wickObjectID) {
            var group = e.target;
            for(var i = 0; i < group._objects.length; i++) {
                var obj = group._objects[i];
                ids[i] = obj.wickObjectID;
                modifiedStates[i] = {
                    x      : group.left + group.width /2 + obj.left - frameOffset.x,
                    y      : group.top  + group.height/2 + obj.top  - frameOffset.y,
                    scaleX : group.scaleX * obj.scaleX,
                    scaleY : group.scaleY * obj.scaleY,
                    angle  : group.angle + obj.angle,
                    text   : obj.text
                };
            }
        } else {
            var obj = e.target;
            ids[0] = obj.wickObjectID;

            modifiedStates[0] = {
                x      : obj.left - frameOffset.x,
                y      : obj.top  - frameOffset.y,
                scaleX : obj.scaleX,
                scaleY : obj.scaleY,
                angle  : obj.angle,
                text   : obj.text
            };
        }

        wickEditor.actionHandler.doAction('modifyObjects', 
            {ids: ids,
             modifiedStates: modifiedStates}
        );
    });

/********************************
       Drawing tool stuff
********************************/

    // Left click events
    canvas.on('mouse:down', function(e) {
        if(e.e.button != 0) return;
        wickEditor.interfaces['rightclickmenu'].open = false;
        leftClickEventHandlers[wickEditor.currentTool.type](e);
    });

    var leftClickEventHandlers = {
        "cursor" : (function (e) {
            // Note: fabric.js handles selection and such
        }),
        "paintbrush" : (function (e) {
            // Note: fabric.js handles the actual drawing.
        }),
        "eraser" : (function (e) {
            // Note: fabric.js handles the actual drawing.
        }),
        "fillbucket" : (function (e) {
            that.deselectAll();

            that.canvas.forEachObject(function(fabricObj) {
                if(fabricObj.paperPath) {
                    var mousePoint = new paper.Point(
                        e.e.offsetX - fabricObj.width/2  - that.getCenteredFrameOffset().x, 
                        e.e.offsetY - fabricObj.height/2 - that.getCenteredFrameOffset().y);

                    var filledObject = getPaperObjectIntersectingWithPoint(fabricObj.paperPath, mousePoint, true);
                    if(!filledObject) {
                        filledObject = getPaperObjectIntersectingWithPoint(fabricObj.paperPath, mousePoint, false);
                    }

                    if(!filledObject) return;

                    var pathObj = wickEditor.getWickObjectByID(fabricObj.wickObjectID);

                    if(filledObject.clockwise) {
                        console.log("hole filled");

                        if(pathObj.svgData.fillColor == wickEditor.currentTool.color) {
                            // Delete the hole
                        } else {
                            // If they are different colors:
                            //     Delete the hole, but also make a copy of it with wickEditor.currentTool.color.
                        }

                        wickEditor.syncInterfaces();
                    } else {
                        console.log("path filled");
                        // Path filled: Change the color of that path.

                        pathObj.svgData.fillColor = wickEditor.currentTool.color;

                        wickEditor.syncInterfaces();
                    }
                }
            });
        }),
        "pan" : (function (e) {
            // Note: We handle pan with the other mouse events
        }),
    }

    var getPaperObjectIntersectingWithPoint = function (item, point, fillClockwise) {

        var hitOptions = {
            segments: true,
            stroke: true,
            fill: true,
            tolerance: 0
        };

        // Look for a hit on item
        var hitResult = item.hitTest(point, hitOptions);
        if(hitResult && hitResult.item.clockwise == fillClockwise) {
            return hitResult.item;
        }

        // Didn't find what we were looking for, so look for a hit on item's children
        if(!item.children) return null;

        for(var i = 0; i < item.children.length; i++) {
            var hitSVG = getPaperObjectIntersectingWithPoint(item.children[i], point, fillClockwise);
            if(hitSVG) {
                return hitSVG;
            }
        }

        return null;
    }

    var uniteIntersectingPaths = function () {
        //console.error("uniteIntersectingPaths NYI");
    }

    var splitPathsWithMultiplePieces = function () {
        //console.error("splitPathsWithMultiplePieces NYI");
    }

    // Paths are handled internally by fabric so we have to intercept the paths and convert them to wickobjects
    canvas.on('object:added', function(e) {
        if(e.target.type !== "path" || e.target.wickObjectID) {
            return;
        }

        potracePath(e.target);
        canvas.remove(e.target);

    });

    var potracePath = function (pathFabricObject) {
        // New potrace-and-send-to-paper.js brush
        pathFabricObject.cloneAsImage(function(clone) {
            var imgSrc = clone._element.currentSrc || clone._element.src;

            Potrace.loadImageFromDataURL(imgSrc);
            Potrace.setParameter({optcurve: true, opttolerance: wickEditor.currentTool.brushSmoothing});
            Potrace.process(function(){
                var svgData = {svgString:Potrace.getSVG(1), fillColor:that.canvas.freeDrawingBrush.color}
                WickObject.fromSVG(svgData, function(wickObj) {
                    wickObj.x = pathFabricObject.left - that.getCenteredFrameOffset().x - pathFabricObject.width/2  - that.canvas.freeDrawingBrush.width/2;
                    wickObj.y = pathFabricObject.top  - that.getCenteredFrameOffset().y - pathFabricObject.height/2 - that.canvas.freeDrawingBrush.width/2;
                    wickEditor.actionHandler.doAction('addObjects', {wickObjects:[wickObj]})
                });
            });
        }); 
    }

/********************************
           GUI Stuff
********************************/

    // Zoom

    this.zoomIn = function () {
        that.canvas.setZoom(that.canvas.getZoom() * 1.1);
        that.canvas.renderAll();
    }

    this.zoomOut = function () {
        that.canvas.setZoom(that.canvas.getZoom() / 1.1);
        that.canvas.renderAll();
    }

    // Pan

    var panning = false;
    canvas.on('mouse:up', function (e) {
        panning = false;
        that.canvas.selection = true;
    });

    canvas.on('mouse:down', function (e) {
        if(wickEditor.inputHandler.keys[32] || wickEditor.currentTool.type == "pan") {
            panning = true;
            that.canvas.selection = false;
        }
    });
    canvas.on('mouse:move', function (e) {
        if (panning && e && e.e) {
            var delta = new fabric.Point(e.e.movementX, e.e.movementY);
            that.canvas.relativePan(delta);
        }
    });

    // Update the scripting GUI when the selected object changes
    canvas.on('object:selected', function (e) {
        //wickEditor.syncInterfaces();
    });
    canvas.on('selection:cleared', function (e) {
        //wickEditor.syncInterfaces();
    });

    // Hack: Select objects on right click (fabric.js doesn't do this by default >.>)
    canvas.on('mouse:down', function(e) {
        if(e.e.button == 2) {
            if (e.target && e.target.wickObjectID) {
                // Set active object of fabric canvas
                var id = canvas.getObjects().indexOf(e.target);
                canvas.setActiveObject(canvas.item(id)).renderAll();
            }

            if(!e.target) {
                // Didn't right click an object, deselect everything
                canvas.deactivateAll().renderAll();
            }
        }

        //wickEditor.syncInterfaces();
    });

// Selection utils

    this.selectByIDs = function (ids) {

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

    }

    this.selectAll = function () {

        var objs = [];
        this.canvas.getObjects().map(function(o) {
            if(o.wickObjectID) {
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

    }

    this.deselectAll = function () {

        var activeGroup = this.canvas.getActiveGroup();
        if(activeGroup) {
            activeGroup.removeWithUpdate(activeGroup);
            this.canvas.renderAll();
        }

        this.canvas.deactivateAll().renderAll();

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
}

