/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var FabricInterface = function (wickEditor) {

    var that = this;

// Setup fabric canvas

    this.canvas = new fabric.CanvasEx('fabricCanvas');
    this.canvas.selectionColor = 'rgba(0,0,5,0.1)';
    this.canvas.selectionBorderColor = 'grey';
    this.canvas.selectionLineWidth = 2;
    this.canvas.backgroundColor = "#EEE";
    this.canvas.setWidth ( window.innerWidth  );
    this.canvas.setHeight( window.innerHeight );

    this.context = this.canvas.getContext('2d');

    this.paperCanvas = document.createElement('canvas');
    paper.setup(this.canvas);

/********************************
       Editor state syncing
********************************/

    this.getFrameOffset = function () {
        return {
            x: (window.innerWidth  - wickEditor.project.resolution.x)/2 + wickEditor.panPosition.x,
            y: (window.innerHeight - wickEditor.project.resolution.y)/2 + wickEditor.panPosition.y
        }
    }

    this.syncObjects = function (wickObj, fabricObj) {

        fabricObj.left    = wickObj.getAbsolutePosition().x + this.getFrameOffset().x;
        fabricObj.top     = wickObj.getAbsolutePosition().y + this.getFrameOffset().y;
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

    this.syncWithEditorState = function () {

        // resize

        var projectWidth = wickEditor.project.resolution.x;
        var projectHeight = wickEditor.project.resolution.y;

        // Reposition all fabric objects to use new wick canvas origin and pan position

        var oldWidth = this.canvas.getWidth();
        var oldHeight = this.canvas.getHeight();

        this.canvas.setWidth ( window.innerWidth  );
        this.canvas.setHeight( window.innerHeight );
        this.canvas.calcOffset();

        var diffWidth = this.canvas.getWidth() - oldWidth;
        var diffHeight = this.canvas.getHeight() - oldHeight;

        this.canvas.forEachObject(function(fabricObj) {
            fabricObj.left += diffWidth /2;
            fabricObj.top  += diffHeight/2;
            fabricObj.setCoords();
        });

        // Update frame
        this.frameInside.fill = wickEditor.project.backgroundColor;
        this.frameInside.width  = projectWidth;
        this.frameInside.height = projectHeight;
        this.frameInside.left = (window.innerWidth -projectWidth) /2 + wickEditor.panPosition.x;
        this.frameInside.top  = (window.innerHeight-projectHeight)/2 + wickEditor.panPosition.y;
        this.frameInside.setCoords();

        // Move the origin crosshair to the current origin
        if(this.originCrosshair) { // window resize can happen before originCrosshair's image is loaded
            this.originCrosshair.left = (window.innerWidth -projectWidth) /2 - this.originCrosshair.width/2;
            this.originCrosshair.top  = (window.innerHeight-projectHeight)/2 - this.originCrosshair.height/2;
            
            this.originCrosshair.left += wickEditor.project.getCurrentObject().x;
            this.originCrosshair.top  += wickEditor.project.getCurrentObject().y;
            
            this.originCrosshair.left += wickEditor.panPosition.x;
            this.originCrosshair.top  += wickEditor.panPosition.y;

            this.canvas.renderAll();
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
                that.canvas.forEachObject(function(fabricObj) {
                    if(fabricObj.wickObjectID === child.id) {
                        var wickProjectIndex = currentObject.getCurrentFrame().wickObjects.indexOf(child);
                        that.canvas.moveTo(fabricObj, wickProjectIndex+3);
                    }
                });
            } else {
                that.createFabricObjectFromWickObject(child, function (newFabricObj) {
                    newFabricObj.wickObjectID = child.id;
                    canvas.add(newFabricObj);
                    var wickProjectIndex = currentObject.getCurrentFrame().wickObjects.indexOf(child);
                    that.canvas.moveTo(newFabricObj, wickProjectIndex+3);
                });
            }
        });

        // Check for intersections between paths and unite them if they do
        this.canvas.forEachObject(function(fabricObj) {

        });

        // Reselect objects that were selected before sync
        if(selectedObjectIDs.length > 0) that.selectByIDs(selectedObjectIDs);

        this.canvas.renderAll();
    }

/********************************
         GUI Elements
********************************/

// White box that shows resolution/objects that will be on screen when project is exported

    this.frameInside = new fabric.Rect({
        fill: '#FFF',
    });

    this.frameInside.hasControls = false;
    this.frameInside.selectable = false;
    this.frameInside.evented = false;
    this.frameInside.identifier = "frameInside";

    this.canvas.add(this.frameInside)

// Crosshair that shows where (0,0) of the current object is

    fabric.Image.fromURL('resources/origin.png', function(obj) {
        that.originCrosshair = obj;

        that.originCrosshair.left = (window.innerWidth -wickEditor.project.resolution.x)/2- that.originCrosshair.width/2;
        that.originCrosshair.top  = (window.innerHeight-wickEditor.project.resolution.y)/2- that.originCrosshair.height/2;

        that.originCrosshair.hasControls = false;
        that.originCrosshair.selectable = false;
        that.originCrosshair.evented = false;
        that.originCrosshair.identifier = "originCrosshair";

        that.canvas.add(that.originCrosshair);
    });

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

        var frameOffset = that.getFrameOffset();

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
        wickEditor.htmlInterface.closeRightClickMenu();
        leftClickEventHandlers[wickEditor.currentTool](e);
    });

    var leftClickEventHandlers = {
        "cursor" : (function (e) {

        }),
        "paintbrush" : (function (e) {
            // Note: fabric.js handles the actual drawing.
        }),
        "eraser" : (function (e) {
            // Note: fabric.js handles the actual drawing.
        }),
        "fillBucket" : (function (e) {
            that.deselectAll();

            that.canvas.forEachObject(function(fabricObj) {
                if(fabricObj.paperPath) {
                    var mousePoint = new paper.Point(
                        e.e.offsetX - fabricObj.width/2  - that.getFrameOffset().x, 
                        e.e.offsetY - fabricObj.height/2 - that.getFrameOffset().y);

                    var filledObject = tryFillPaperObject(fabricObj.paperPath, mousePoint, true);
                    if(!filledObject) {
                        filledObject = tryFillPaperObject(fabricObj.paperPath, mousePoint, false);
                    }

                    if(!filledObject) return;

                    if(filledObject.clockwise) {
                        console.log("hole filled");
                        // Hole filled:
                        // If the fill color is the same color as the hole's path:
                        //     Simply delete the hole.
                        // If they are different colors:
                        //     Delete the hole, but also make a copy of it with fillColor.
                    } else {
                        // Path filled: Change the color of that path.
                        console.log("path filled");
                    }

                    // make new wick object

                    //console.log(i)
                    /*console.log("filling!");
                    console.log(hitResult.item);
                    console.log(i);
                    item.fillColor = "#ff0000";*/

                    //console.log(hitResult.item);

                    /*var elem = document.createElement('svg');
                    elem.innerHTML = '<svg version="1.1" id="Livello_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="588px" height="588px" viewBox="20.267 102.757 588 588" enable-background="new 20.267 102.757 588 588" xml:space="preserve">'+hitResult.item.exportSVG({asString:true})+'</svg>';
                    document.body.appendChild(elem)*/

                    /*var svgString = '<svg version="1.1" id="Livello_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="588px" height="588px" viewBox="20.267 102.757 588 588" enable-background="new 20.267 102.757 588 588" xml:space="preserve">'+hitResult.item.exportSVG({asString:true})+'</svg>';
                    var svgData = {svgString:svgString, fillColor:that.canvas.freeDrawingBrush.color}
                    WickObject.fromSVG(svgData, function(wickObj) {
                        //wickObj.x = pathFabricObject.left - that.getFrameOffset().x - pathFabricObject.width/2  - that.canvas.freeDrawingBrush.width/2;
                        //wickObj.y = pathFabricObject.top  - that.getFrameOffset().y - pathFabricObject.height/2 - that.canvas.freeDrawingBrush.width/2;
                        wickObj.x = 0;
                        wickObj.y = 0;
                        wickEditor.actionHandler.doAction('addObjects', {wickObjects:[wickObj]})
                    });*/

                }
            });
        })
    }

    var tryFillPaperObject = function (item, point, fillClockwise) {

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
            var filledSVG = tryFillPaperObject(item.children[i], point, fillClockwise);
            if(filledSVG) {
                return filledSVG;
            }
        }

        return null;
    }

    // Paths are handled internally by fabric so we have to 
    // intercept the paths and convert them to wickobjects

    var rasterizePath = function (pathFabricObject) {
        // Old straight-to-rasterized brush
        pathFabricObject.left -= that.getFrameOffset().x;
        pathFabricObject.top  -= that.getFrameOffset().y;
        
        WickObject.fromFabricPath(pathFabricObject, function(wickObj) {
            wickEditor.actionHandler.doAction('addObjects', {wickObjects:[wickObj]});
        });
    }

    var potracePath = function (pathFabricObject) {
        // New potrace-and-send-to-paper.js brush
        pathFabricObject.cloneAsImage(function(clone) {
            var imgSrc = clone._element.currentSrc || clone._element.src;

            Potrace.loadImageFromDataURL(imgSrc);
            Potrace.process(function(){
                var svgData = {svgString:Potrace.getSVG(1), fillColor:that.canvas.freeDrawingBrush.color}
                WickObject.fromSVG(svgData, function(wickObj) {
                    wickObj.x = pathFabricObject.left - that.getFrameOffset().x - pathFabricObject.width/2  - that.canvas.freeDrawingBrush.width/2;
                    wickObj.y = pathFabricObject.top  - that.getFrameOffset().y - pathFabricObject.height/2 - that.canvas.freeDrawingBrush.width/2;
                    wickEditor.actionHandler.doAction('addObjects', {wickObjects:[wickObj]})
                });
            });
        }); 
    }

    canvas.on('object:added', function(e) {
        if(e.target.type !== "path" || e.target.wickObjectID) {
            return;
        }

        var path = e.target;
        potracePath(path);
        //rasterizePath(path);
        canvas.remove(e.target);

    });

/********************************
           GUI Stuff
********************************/

    // Update the scripting GUI when the selected object changes
    canvas.on('object:selected', function (e) {
        wickEditor.htmlInterface.reloadScriptingGUI();
        wickEditor.htmlInterface.updatePropertiesGUI();
    });
    canvas.on('selection:cleared', function (e) {
        wickEditor.htmlInterface.closeScriptingGUI();
        wickEditor.htmlInterface.updatePropertiesGUI('project');
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
                wickEditor.htmlInterface.closeScriptingGUI();
            }
            wickEditor.syncInterfaces();
            wickEditor.htmlInterface.openRightClickMenu();

        }
    });

// Pan tool

    // Yuck, weird code, get this out of here.
    this.panTo = function (x,y,dx,dy) {

        var that = this;

        this.canvas.forEachObject(function(fabricObj) {
            fabricObj.left += dx;
            fabricObj.top  += dy;
            fabricObj.setCoords();
        });

        this.canvas.renderAll();

    }

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

