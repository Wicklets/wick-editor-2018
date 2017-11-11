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
    
var FabricWickElements = function (wickEditor, fabricInterface) {

    var that = this;

    var objectsInCanvas = [];

    var currentFrameRef;

    this.update = function () {
        window.blockAllRender = true;

        var newFrameRef = wickEditor.project.getCurrentFrame();
        var onNewFrame = newFrameRef !== currentFrameRef;
        currentFrameRef = newFrameRef;

        var enablePerfTests = false;

        wickEditor.fabric.canvas.discardActiveObject();
        wickEditor.fabric.canvas.renderAll();
        wickEditor.fabric.canvas.getActiveObjects().forEach(function (fo) {
            fo.setCoords();
        });

        if(enablePerfTests) console.log("-------------------");
        if(enablePerfTests) startTiming();
        if(enablePerfTests) stopTiming("init");

        var currentObject = wickEditor.project.currentObject;
        var currentFrame = currentFrameRef;

        var activeObjects = currentObject.getAllActiveChildObjects();
        if(wickEditor.paper.isActive()) {
            activeObjects = activeObjects.filter(function (obj) {
                return obj.isImage || obj.isText;
            }); 
        }
        activeObjects = activeObjects.filter(function (obj) {
            return !obj.parentFrame.parentLayer.hidden;
        });  

        var siblingObjects = currentObject.getAllInactiveSiblings();
        siblingObjects = siblingObjects.filter(function (obj) {
            return !obj.parentFrame.parentLayer.hidden;
        });  
        //var siblingObjects = [];
        var nearbyObjects = wickEditor.project.onionSkinning ? wickEditor.project.currentObject.getNearbyObjects(1,1) : [];
        var allObjects = nearbyObjects.concat(siblingObjects.concat(activeObjects));
        //var allObjects = siblingObjects.concat(activeObjects);

        var finish = function () {
            for(var i = 0; i < allObjects.length; i++) {
                allObjects[i]._zindex = i;
            }
            var fabObjs = [];
            fabricInterface.canvas._objects.forEach(function (obj) {
                fabObjs.push(obj);
            });
            fabObjs.forEach(function (fabObj) {
                var wickObj = fabObj.wickObjectRef;
                if(!wickObj) return;

                var gec = fabricInterface.guiElements.getNumGUIElements();
                fabricInterface.canvas.moveTo(fabObj, wickObj._zindex+gec, true);
            });

            window.blockAllRender = false;
            fabricInterface.syncSelectionWithWickProject();
            fabricInterface.canvas.renderAll();
        }

        if(enablePerfTests) stopTiming("object list generation");

        // Remove objects that don't exist anymore or need to be regenerated
        var removeTheseObjs = [];
        fabricInterface.canvas._objects.forEach(function(fabricObj) {
            if(!fabricObj || !fabricObj.wickObjectRef) return;

            var wickObj = fabricObj.wickObjectRef;

            if(allObjects.indexOf(fabricObj.wickObjectRef) == -1 || (wickObj && wickObj.forceFabricCanvasRegen)) {
                if(wickObj) {
                    wickObj.forceFabricCanvasRegen = false;
                }
                objectsInCanvas.splice(objectsInCanvas.indexOf(fabricObj.wickObjectRef), 1);
                // Object doesn't exist in the current object anymore, remove it's fabric object.
                removeTheseObjs.push(fabricObj);
            }
        });
        removeTheseObjs.forEach(function (fabricObj) {
            if(fabricObj.type === "group") {
                fabricObj.forEachObject(function(o){ 
                    fabricObj.removeWithUpdate(o);
                });
                fabricInterface.canvas.remove(fabricObj);
                //fabricInterface.canvas.renderAll();
            } else {
                fabricInterface.canvas.remove(fabricObj);
            }
        });

        if(enablePerfTests) stopTiming("remove objects");

        var objectsToAdd = [];

        // Add new objects and update existing objects
        allObjects.forEach(function (child) {
            if(objectsInCanvas.indexOf(child) !== -1) {
                // Update existing object
                fabricInterface.canvas.forEachObject(function(fabricObj) {
                    if(fabricObj.group) return;
                    if(fabricObj.wickObjectRef === child) {
                        updateFabObjPositioning(fabricObj, child);
                        updateFabricObjectEvents(fabricObj, child, activeObjects, siblingObjects, nearbyObjects);
                    }
                });
                
            } else {
                // Add new object
                objectsInCanvas.push(child);
                objectsToAdd.push(child);
            }
        });

        var numObjectsAdded = 0;
        objectsToAdd.forEach(function (objectToAdd) {
            objectToAdd._frameUUID = currentFrame.uuid;
            createFabricObjectFromWickObject(objectToAdd, function (fabricObj) {

                objectToAdd.fabricObjectReference = fabricObj;

                if(fabricObj.type === 'textbox') {
                    fabricObj.setControlsVisibility({
                        bl: false,
                        br: false,
                        mb: false,
                        ml: false,
                        mr: true,
                        mt: false,
                        tl: false,
                        tr: false,
                        mtr: true,
                    });
                }
                //fabricObj.originX = 'center';
                //fabricObj.originY = 'center';

                if (currentFrameRef.uuid !== objectToAdd._frameUUID) {
                    objectsInCanvas.splice(objectsInCanvas.indexOf(objectToAdd), 1)
                    return;
                }
                fabricObj.wickObjectRef = objectToAdd;
                fabricInterface.canvas.add(fabricObj);

                if(fabricObj.type === "path") {
                    // do this here to prevent flickering when you draw a path with fabric
                    wickEditor.fabric.canvas.clearContext(wickEditor.fabric.canvas.contextTop);
                }
                updateFabObjPositioning(fabricObj, objectToAdd);
                updateFabricObjectEvents(fabricObj, objectToAdd, activeObjects, siblingObjects, nearbyObjects);

                //var trueZIndex = allObjects.indexOf(objectToAdd);
                //fabricInterface.canvas.moveTo(fabricObj, trueZIndex+fabricInterface.guiElements.getNumGUIElements());

                numObjectsAdded++;
                if(numObjectsAdded === objectsToAdd.length) {
                    //fabricInterface.canvas.renderAll()
                    finish();
                }
            });
        });

        if(objectsToAdd.length === 0) {
            finish();
        }

        if(enablePerfTests) stopTiming("add & update objects");
    }

    var createFabricObjectFromWickObject = function (wickObj, callback) {
        
        if(wickObj.isImage) {
            var asset = wickEditor.project.library.getAsset(wickObj.assetUUID);
            if(!asset) return;
            fabric.Image.fromURL(asset.getData(), function(newFabricImage) {
                newFabricImage.wickObjReference = wickObj;
                callback(newFabricImage);
            });
        }

        if(wickObj.isText) {
            var textData = wickObj.textData;
            var newFabricText = new fabric.Textbox('First Textbox', {
                /*cursorColor: '#333',
                cursorDelay: 500,
                editable: true,*/
                fontFamily: textData.fontFamily,
                fontSize: textData.fontSize,
                fontStyle: textData.fontStyle,
                fontWeight: textData.fontWeight,
                lineHeight: textData.lineHeight,
                fill: textData.fill,
                textAlign: textData.textAlign,
                text: textData.text,
            });

            newFabricText.wickObjReference = wickObj;
            callback(newFabricText);
        }
        
        if(wickObj.pathData) {
            fabric.loadSVGFromString(wickObj.pathData, function(objects, options) {
                var pathFabricObj = objects[0];

                // Workaround for buggy fabric.js SVG opacity
                if(!wickObj.paper) wickEditor.paper.pathRoutines.regenPaperJSState(wickObj)
                if(wickObj.paper && wickObj.paper.fillColor) pathFabricObj.fill = wickObj.paper.fillColor.toCSS()

                pathFabricObj.wickObjReference = wickObj;
                callback(pathFabricObj);
            });
        }

        if (wickObj.isSymbol) {
            // Dont do this recursively - just create a group of all children (and children of children) in one level

            wickObj.playheadPosition = 0;

            var children = wickObj.getAllActiveChildObjectsRecursive();
            var group = new fabric.Group();
            var wos = {};

            if(children.length === 0) {
                callback(group);
            }

            for(var i = 0; i < children.length; i++) {
                
                var setupSymbol = function () {
                    for(var i = 0; i < Object.keys(wos).length; i++) {
                        var pair = wos[i]
                        var fabricObj = pair.fo;
                        var child = pair.wo;
                        
                        updateFabObjPositioning(fabricObj, child);
                    }

                    /*var boxCoords = {
                        left: 1000000,
                        right: -1000000,
                        top: 1000000,
                        bottom: -1000000,
                    };
                    children.forEach(function (child) {
                        var bbox = child.fabricObjectReference.getBoundingRect();
                        var bboxXY = wickEditor.fabric.screenToCanvasSpace(bbox.left, bbox.top);
                        var bboxSize = {x:bbox.width, y:bbox.height};//wickEditor.fabric.screenToCanvasSize(bbox.width, bbox.height);
                        bbox.left = bboxXY.x;
                        bbox.top = bboxXY.y;
                        bbox.width = bboxSize.x;
                        bbox.height = bboxSize.y;
                        child.bbox = bbox;
                        boxCoords.left = Math.min(boxCoords.left, bbox.left);
                        boxCoords.top = Math.min(boxCoords.top, bbox.top);
                    });*/

                    for(var i = 0; i < Object.keys(wos).length; i++) {
                        var pair = wos[i]
                        var fabricObj = pair.fo;
                        var child = pair.wo;

                        fabricObj.originX = 'centerX';
                        fabricObj.originY = 'centerY';
                        
                        //updateFabObj(fabricObj, child);
                        group.addWithUpdate(fabricObj);
                    }
                    wickObj.width = group.width;
                    wickObj.height = group.height;

                    var Pabs = wickObj.getAbsolutePosition();
                    var Ss = {w: wickObj.width, h: wickObj.height };

                    group.originX = 0.5;
                    group.originY = 0.5;

                    group.wickObjReference = wickObj;
                    
                    group.setCoords();

                    var r = group.getBoundingRect();
                    var boxLeft = (r.left + group.width/2);
                    var boxTop = (r.top + group.height/2);
                    group.originX = ((Pabs.x - (boxLeft)) / Ss.w);
                    group.originY = ((Pabs.y - (boxTop)) / Ss.h);
                    
                    callback(group);
                }
                var dothing = function (wo) {
                    createFabricObjectFromWickObject(children[wo], function(fabricObj) {
                        wos[wo] = ({fo:fabricObj,wo:children[wo]});

                        if(Object.keys(wos).length == children.length) {
                            setupSymbol();
                        }
                    });
                }
                dothing(i);
            }
        }

    }

    var updateFabObjPositioning = function (fabricObj, wickObj) {

        wickObj.fabricObjectReference = fabricObj;

        wickObj.svgWidth = fabricObj.getBoundingRectWidth();
        wickObj.svgHeight = fabricObj.getBoundingRectHeight();
        wickObj.svgStrokeWidth = fabricObj.strokeWidth || 0;

        // Some wick objects don't have a defined width/height until rendered by fabric. (e.g. paths and text)
        if(!wickObj.width) wickObj.width = fabricObj.width;
        if(!wickObj.height) wickObj.height = fabricObj.height;

        fabricObj.left    = wickObj.getAbsolutePosition().x;
        fabricObj.top     = wickObj.getAbsolutePosition().y;
        fabricObj.width   = wickObj.width;
        if(!wickObj.isText) fabricObj.height  = wickObj.height;
        fabricObj.scaleX  = wickObj.scaleX;
        fabricObj.scaleY  = wickObj.scaleY;
        fabricObj.angle   = wickObj.rotation;
        fabricObj.flipX   = wickObj.flipX;
        fabricObj.flipY   = wickObj.flipY;
        fabricObj.opacity = wickObj.opacity;

        if(wickObj.isText) {
            var textData = wickObj.textData;
            fabricObj.fontFamily = textData.fontFamily;
            fabricObj.fontSize = textData.fontSize;
            fabricObj.fontStyle = textData.fontStyle;
            fabricObj.fontWeight = textData.fontWeight;
            fabricObj.lineHeight = textData.lineHeight;
            fabricObj.fill = textData.fill;
            fabricObj.textAlign = textData.textAlign;
            fabricObj.text = textData.text;
        }

        if(wickObj.opacity > 0) {
            fabricObj.perPixelTargetFind = true;
            fabricObj.targetFindTolerance = 4;
        } else {
            fabricObj.perPixelTargetFind = false;
        }

        if(!wickObj.isSymbol) {
            fabricObj.originX = 0.5;
            fabricObj.originY = 0.5;
        }

        fabricObj.setCoords();

        /*var bbox = fabricObj.getBoundingRect();
        var bboxXY = wickEditor.fabric.screenToCanvasSpace(bbox.left, bbox.top);
        var bboxSize = wickEditor.fabric.screenToCanvasSize(bbox.width, bbox.height);
        bbox.left = bboxXY.x;
        bbox.top = bboxXY.y;
        bbox.width = bboxSize.x;
        bbox.height = bboxSize.y;
        wickObj.bbox = bbox;*/

    }

    var updateFabricObjectEvents = function (fabricObj, wickObj, activeObjects, siblingObjects, nearbyObjects) {
        //var setCoords = fabricObj.setCoords.bind(fabricObj);
        /*fabricObj.on({
            moving: setCoords,
            scaling: setCoords,
            rotating: setCoords
        });*/

        if(activeObjects.includes(wickObj)) {
            fabricObj.opacity = wickObj.opacity;
        } else {
            fabricObj.opacity = wickObj.opacity/2;
        }

        // Objects that are onion skins or that are not part of the current symbol being edited cannot be interacted with
        if(activeObjects.indexOf(wickObj) !== -1 && !wickObj.parentFrame.parentLayer.locked) {
            fabricObj.hasControls = true;
            fabricObj.selectable = true;
            fabricObj.evented = true;
        } else {
            fabricObj.hasControls = false;
            fabricObj.selectable = false;
            fabricObj.evented = false;
        }

        // Tools other than the cursor can't select objects
        if (!(wickEditor.currentTool instanceof Tools.Cursor)) {
            fabricObj.hasControls = false;
            fabricObj.selectable = false;
            fabricObj.evented = false;
        }

    }
    
}