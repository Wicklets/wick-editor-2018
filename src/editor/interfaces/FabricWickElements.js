/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var FabricWickElements = function (wickEditor, fabricInterface) {

	var that = this;

    var objectIDsInCanvas = [];

    this.update = function () {
        var enablePerfTests = false;

        if(enablePerfTests) console.log("-------------------");
        if(enablePerfTests) startTiming();
        if(enablePerfTests) stopTiming("init");

        var currentObject = wickEditor.project.getCurrentObject();

        // Make sure everything is deselected, mulitple selected objects cause positioning problems.
        var selectedObjectIDs = fabricInterface.getSelectedObjectIDs();
        fabricInterface.deselectAll();

        var activeObjects = currentObject.getAllActiveChildObjects();
        var siblingObjects = currentObject.getAllInactiveSiblings();
        //var nearbyObjects = wickEditor.project.onionSkinning ? currentObject.getNearbyObjects(1,0) : [];
        var allObjects = siblingObjects.concat(activeObjects);

        var allObjectsIDs = [];
        allObjects.forEach(function(obj) { allObjectsIDs.push(obj.id) });

        if(enablePerfTests) stopTiming("object list generation");

        // Remove objects that don't exist anymore or need to be regenerated
        fabricInterface.canvas.forEachObject(function(fabricObj) {
            if(!fabricObj || !fabricObj.wickObjectID) return;

            var wickObj = wickEditor.project.rootObject.getChildByID(fabricObj.wickObjectID);

            if(allObjectsIDs.indexOf(fabricObj.wickObjectID) == -1 || (wickObj && wickObj.forceFabricCanvasRegen)) {
                if(wickObj) {
                    wickObj.forceFabricCanvasRegen = false;
                    wickObj.cachedFabricObject = null;
                }
                objectIDsInCanvas[fabricObj.wickObjectID] = false;
                // Object doesn't exist in the current object anymore, remove it's fabric object.
                if(fabricObj.type === "group") {
                    fabricObj.forEachObject(function(o){ fabricObj.removeWithUpdate(o) });
                    fabricInterface.canvas.remove(fabricObj);
                    fabricInterface.canvas.renderAll();
                } else {
                    fabricObj.remove();
                }
            }
        });

        if(enablePerfTests) stopTiming("remove objects");

        var objectsToAdd = [];
        var selectionChanged = false;

        // Add new objects and update existing objects
        allObjects.forEach(function (child) {
            if(objectIDsInCanvas[child.id]) {
                // Update existing object
                fabricInterface.canvas.forEachObject(function(fabricObj) {
                    if(fabricObj.group) return;
                    if(fabricObj.wickObjectID === child.id) {
                        updateFabObj(fabricObj, child, activeObjects);
                    }
                });
                
            } else {
                // Add new object
                objectIDsInCanvas[child.id] = true;
                objectsToAdd.push(child);
            }
        });

        var numObjectsAdded = 0;
        objectsToAdd.forEach(function (objectToAdd) {
            createFabricObjectFromWickObject(objectToAdd, function (fabricObj) {

                fabricInterface.canvas.forEachObject(function(path) {
                    if(path.isTemporaryDrawingPath) {
                        fabricInterface.canvas.remove(path);
                    }
                });

                // The object may have been deleted while we were generating the fabric object. 
                // Make sure we don't add it if that happened.
                if(!wickEditor.project.rootObject.getChildByID(objectToAdd.id)) return;

                //fabricObj.originX = 'center';
                //fabricObj.originY = 'center';

                fabricObj.wickObjectID = objectToAdd.id;
                fabricInterface.canvas.add(fabricObj);
                updateFabObj(fabricObj, objectToAdd, activeObjects);

                var trueZIndex = allObjects.indexOf(objectToAdd);
                fabricInterface.canvas.moveTo(fabricObj, trueZIndex+2);

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
                    fabricInterface.canvas.renderAll();
                }

                //fabricObj.trueZIndex = currentObject.getCurrentFrame().wickObjects.indexOf(child);
                //that.canvas.moveTo(fabricObj, fabricObj.trueZIndex+2 + activeObjects.length+3);
            });
        });

        if(enablePerfTests) stopTiming("add & update objects");

        //update z-indices
        fabricInterface.canvas.forEachObject(function(fabricObj) {
            if(!fabricObj.wickObjectID) return;

            var fabricZIndex = fabricInterface.canvas._objects.indexOf(fabricObj);

            var wickObj = wickEditor.project.rootObject.getChildByID(fabricObj.wickObjectID);
            var trueZIndex = allObjects.indexOf(wickObj);

            if(fabricZIndex-2 !== trueZIndex)
                fabricInterface.canvas.moveTo(fabricObj, trueZIndex+2);
        });
        fabricInterface.guiElements.setInactiveFramePosition(siblingObjects.length+1);

        if(enablePerfTests) stopTiming("update z-indices");

        // Reselect objects that were selected before sync
        if(selectedObjectIDs.length > 0) fabricInterface.selectByIDs(selectedObjectIDs);

        if(enablePerfTests) stopTiming("reselect");
    }

    var createFabricObjectFromWickObject = function (wickObj, callback) {

        if(wickObj.cachedFabricObject) {
            callback(wickObj.cachedFabricObject);
            return;
        }

        if(wickObj.imageData) {
            fabric.Image.fromURL(wickObj.imageData, function(newFabricImage) {
                wickObj.cachedFabricObject = newFabricImage;
                callback(newFabricImage);
            });
        }

        if(wickObj.fontData) {
            var newFabricText = new fabric.IText(wickObj.fontData.text, wickObj.fontData);
            callback(newFabricText);
        }

        if(wickObj.audioData) {
            fabric.Image.fromURL('resources/audio.png', function(audioFabricObject) {
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
                var dothing = function (wo) {
                console.log(children[wo])
                createFabricObjectFromWickObject(children[wo], function(fabricObj) {
                    updateFabObj(fabricObj, children[wo]);
                    group.addWithUpdate(fabricObj);
                    if(group._objects.length == children.length) {
                        wickObj.width = group.width;
                        wickObj.height = group.height;
                        callback(group);
                    }
                });
                }
                dothing(i);
            }
        }

    }

    var updateFabObj = function (fabricObj, wickObj, activeObjects) {

        // Some wick objects don't have a defined width/height until rendered by fabric. (e.g. paths and text)
        if(!wickObj.width) wickObj.width = fabricObj.width;
        if(!wickObj.height) wickObj.height = fabricObj.height;

        // Always use length of text from fabric
        if(fabricObj.type === "i-text") {
            wickObj.width  = fabricObj.width;
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

    //

        if(activeObjects) {

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
                    fabricInterface.canvas.renderAll();
                }
                img.src=wickObj.imageData;
                wickObj.imageDirty = false;
            }

            if(activeObjects.indexOf(wickObj) !== -1) {
                fabricObj.hasControls = true;
                fabricObj.selectable = true;
                fabricObj.evented = true;

                //fabricObj.trueZIndex = currentObject.getCurrentFrame().wickObjects.indexOf(wickObj);
                //that.canvas.moveTo(fabricObj, fabricObj.trueZIndex+3 + activeObjects.length+3);
            } else {
                fabricObj.hasControls = false;
                fabricObj.selectable = false;
                fabricObj.evented = false;

                // OPTIMIZATION WORK: get ridda this
                //that.canvas.moveTo(fabricObj, activeObjects.length+3);

                /*if(nearbyObjects.indexOf(wickObj) !== -1) {
                    var framePlayheadPosition = currentObject.getPlayheadPositionAtFrame(currentObject.getFrameWithChild(wickObj));
                    fabricObj.opacity = (wickObj.opacity * (1-(Math.abs(framePlayheadPosition-currentObject.playheadPosition)/4)))/3;
                    fabricInterface.canvas.renderAll();
                }*/
            }

            if (!(fabricInterface.currentTool instanceof CursorTool)) {
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
    }
	
}