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

var WickObject = function () {

// Internals

    // Unique id
    this.uuid = random.uuid4();

    // Name is optional, added by user
    this.name = undefined;

// Positioning

    this.x = 0;
    this.y = 0;
    this.width = undefined;
    this.height = undefined;
    this.scaleX = 1;
    this.scaleY = 1;
    this.rotation = 0;
    this.flipX = false;
    this.flipY = false;
    this.opacity = 1;

// Common
    
    //this.wickScript = "function load() {\n\t\n}\n\nfunction update() {\n\t\n}\n";
    this.wickScript = "";

// Static

    this.assetUUID = null;
    this.loop = false;

// Text

    this.isText = false;

// Symbols

    this.isSymbol = false;
    this.isButton = false;
    this.isGroup = false;

    // Used to keep track of what frame is being edited
    this.playheadPosition = null;
    this.currentLayer = null;

    // List of layers, only used by symbols
    this.layers = undefined;
    this.playRanges = undefined;

// Render
    
    this._renderDirty = false;  // Tell the renderer if this object has changed. 

};

WickObject.fromJSON = function (jsonString) {
    // Parse JSON
    var newWickObject = JSON.parse(jsonString);

    // Put prototypes back on object ('class methods'), they don't get JSONified on project export.
    WickObject.addPrototypes(newWickObject);

    // Decode scripts back to human-readble and eval()-able format
    newWickObject.decodeStrings();

    return newWickObject;
}

WickObject.fromJSONArray = function (jsonArrayObject) {
    var newWickObjects = [];

    var wickObjectJSONArray = jsonArrayObject.wickObjectArray;
    for (var i = 0; i < wickObjectJSONArray.length; i++) {
        
        var newWickObject = WickObject.fromJSON(wickObjectJSONArray[i]);
        
        if(wickObjectJSONArray.length > 1) {
            newWickObject.x += jsonArrayObject.groupPosition.x;
            newWickObject.y += jsonArrayObject.groupPosition.y;
        }

        newWickObjects.push(newWickObject);
    }

    return newWickObjects;
}

WickObject.createPathObject = function (svg) {
    var obj = new WickObject();
    obj.isPath = true;
    obj.pathData = svg;

    return obj;
}

WickObject.createTextObject = function (text) {
    var obj = new WickObject();

    obj.isText = true;
    obj.width = 400;
    obj.textData = {
        fontFamily: 'Arial',
        fontSize: 40,
        fontStyle: 'normal',
        fontWeight: 'normal',
        lineHeight: 1.0,
        fill: '#000000',
        textAlign: 'left',
        text: text
    };

    return obj;
}

WickObject.createNewSymbol = function (name) {

    var symbol = new WickObject();

    symbol.isSymbol = true;
    symbol.playheadPosition = 0;
    symbol.currentLayer = 0;
    symbol.layers = [new WickLayer()];
    symbol.playRanges = []; 
    symbol.name = name;

    return symbol;

}

// Create a new symbol and add every object in wickObjects as children
WickObject.createSymbolFromWickObjects = function (wickObjects) {

    var symbol = WickObject.createNewSymbol();

    // Calculate center of all WickObjects
    var topLeft = {x:Number.MAX_SAFE_INTEGER, y:Number.MAX_SAFE_INTEGER};
    var bottomRight = {x:-Number.MAX_SAFE_INTEGER,y:-Number.MAX_SAFE_INTEGER};
    wickObjects.forEach(function (wickObj) {
        topLeft.x = Math.min(topLeft.x, wickObj.x - wickObj.width /2);
        topLeft.y = Math.min(topLeft.y, wickObj.y - wickObj.height/2);
        bottomRight.x = Math.max(bottomRight.x, wickObj.x + wickObj.width /2);
        bottomRight.y = Math.max(bottomRight.y, wickObj.y + wickObj.height/2);
    });

    var center = {
        x: topLeft.x + (bottomRight.x - topLeft.x)/2,
        y: topLeft.y + (bottomRight.y - topLeft.y)/2
    }
    symbol.x = center.x;
    symbol.y = center.y;

    var firstFrame = symbol.layers[0].frames[0];
    for(var i = 0; i < wickObjects.length; i++) {
        firstFrame.wickObjects[i] = wickObjects[i];

        firstFrame.wickObjects[i].x = wickObjects[i].x - symbol.x;
        firstFrame.wickObjects[i].y = wickObjects[i].y - symbol.y;
    }

    symbol.width  = firstFrame.wickObjects[0].width;
    symbol.height = firstFrame.wickObjects[0].height;

    return symbol;

}

// Create a new symbol and add every frame into the new symbol's timeline
WickObject.createSymbolFromWickFrames = function (wickFrames) {

    /*wickFrames.forEach(function (wickFrame) {
        console.log(wickFrame.parentLayer)
    })*/

    var newSymbol = WickObject.createNewSymbol();
    newSymbol.layers = [];

    var nLayersNeeded = 0;
    wickFrames.forEach(function (wickFrame) {
        var layerIndex = wickFrame.parentLayer.parentWickObject.layers.indexOf(wickFrame.parentLayer);
        console.log(layerIndex)
        if(layerIndex > nLayersNeeded) nLayersNeeded = layerIndex;
    });

    console.log(nLayersNeeded)
    for(var i = 0; i <= nLayersNeeded; i++) {
        var newLayer = new WickLayer();
        newLayer.frames = [];
        newSymbol.layers.push(newLayer);
    }

    wickFrames.forEach(function (wickFrame) {
        var parentWickObject = wickFrame.parentLayer.parentWickObject
        var layerIndex = parentWickObject.layers.indexOf(wickFrame.parentLayer);

        newSymbol.layers[layerIndex].frames.push(wickFrame);
    });

    return newSymbol;

}

WickObject.prototype.copy = function () {

    var copiedObject = new WickObject();

    copiedObject.name = undefined;

    copiedObject.x = this.x;
    copiedObject.y = this.y;
    copiedObject.width = this.width;
    copiedObject.height = this.height;
    copiedObject.scaleX = this.scaleX;
    copiedObject.scaleY = this.scaleY;
    copiedObject.rotation = this.rotation;
    copiedObject.flipX = this.flipX;
    copiedObject.flipY = this.flipY;
    copiedObject.opacity = this.opacity;
    copiedObject.uuid = random.uuid4();
    copiedObject.sourceUUID = this.uuid;
    copiedObject.assetUUID = this.assetUUID;
    copiedObject.svgX = this.svgX;
    copiedObject.svgY = this.svgY;
    copiedObject.pathData = this.pathData;
    copiedObject.isImage = this.isImage;
    copiedObject.isPath = this.isPath;
    copiedObject.isText = this.isText;
    copiedObject.isButton = this.isButton;
    copiedObject.isGroup = this.isGroup;
    copiedObject.cachedAbsolutePosition = this.getAbsolutePosition();
    copiedObject.svgStrokeWidth = this.svgStrokeWidth;

    if(this.isText)
        copiedObject.textData = JSON.parse(JSON.stringify(this.textData));

    copiedObject.wickScript = this.wickScript

    if(this.isSymbol) {
        copiedObject.isSymbol = true;

        copiedObject.playheadPosition = 0;
        copiedObject.currentLayer = 0;

        copiedObject.layers = [];
        this.layers.forEach(function (layer) {
            copiedObject.layers.push(layer.copy());
        });

        copiedObject.playRanges = [];
        this.playRanges.forEach(function (playRange) {
            copiedObject.playRanges.push(playRange.copy());
        });
    } else {
        copiedObject.isSymbol = false;
    }

    return copiedObject;

}

WickObject.prototype.getAsJSON = function () {
    var oldX = this.x;
    var oldY = this.y;

    var absPos = this.getAbsolutePosition();
    this.x = absPos.x;
    this.y = absPos.y;

    // Encode scripts to avoid JSON format problems
    this.encodeStrings();

    var JSONWickObject = JSON.stringify(this, WickProject.Exporter.JSONReplacerObject);

    // Put prototypes back on object ('class methods'), they don't get JSONified on project export.
    WickObject.addPrototypes(this);

    // Decode scripts back to human-readble and eval()-able format
    this.decodeStrings();

    this.x = oldX;
    this.y = oldY;

    return JSONWickObject;
}

WickObject.prototype.downloadAsFile = function () {

    var filename = this.name || "wickobject";

    if(this.isSymbol) {
        var blob = new Blob([this.getAsJSON()], {type: "text/plain;charset=utf-8"});
        saveAs(blob, filename+".json");
        return;
    }

    var asset = wickEditor.project.library.getAsset(this.assetUUID);

    if(asset.type === 'image') {
        var ext = asset.getData().split("/")[1].split(';')[0];
        saveAs(dataURItoBlob(asset.getData()), filename+"."+ext);
        return;
    }

    console.error("export not supported for this type of wickobject yet");

}

WickObject.addPrototypes = function (obj) {

    // Put the prototype back on this object
    obj.__proto__ = WickObject.prototype;

    if(obj.isSymbol) {
        obj.playRanges.forEach(function (playRange) {
            playRange.__proto__ = WickPlayRange.prototype;
        });

        obj.layers.forEach(function (layer) {
            layer.__proto__ = WickLayer.prototype;
            layer.frames.forEach(function(frame) {
                frame.__proto__ = WickFrame.prototype;

                if(frame.tweens) {
                    frame.tweens.forEach(function (tween) {
                        tween.__proto__ = WickTween.prototype;
                    });
                }
            });
        });

        obj.getAllChildObjects().forEach(function(currObj) {
            WickObject.addPrototypes(currObj);
        });
    }
}

/* Encodes scripts and strings to avoid JSON format problems */
WickObject.prototype.encodeStrings = function () {

    if(this.wickScript) {
        this.wickScript = WickProject.Compressor.encodeString(this.wickScript);
    }

    if(this.textData) {
        this.textData.text = WickProject.Compressor.encodeString(this.textData.text);
    }

    if(this.pathData) {
        this.pathData = WickProject.Compressor.encodeString(this.pathData);
    }

    if(this.isSymbol) {
        this.getAllFrames().forEach(function (frame) {
            frame.encodeStrings();
        });

        this.getAllChildObjects().forEach(function(child) {
            child.encodeStrings();
        });
    }

}

/* Decodes scripts and strings back to human-readble and eval()-able format */
WickObject.prototype.decodeStrings = function () {
    
    if(this.wickScript) {
        this.wickScript = WickProject.Compressor.decodeString(this.wickScript);
    }

    if(this.textData) {
        this.textData.text = WickProject.Compressor.decodeString(this.textData.text);
    }

    if(this.pathData) {
        this.pathData = WickProject.Compressor.decodeString(this.pathData);
    }

    if(this.isSymbol) {
        this.getAllFrames().forEach(function (frame) {
            frame.decodeStrings();
        });

        this.getAllChildObjects().forEach(function(child) {
            child.decodeStrings();
        });
    }

}

WickObject.prototype.generateParentObjectReferences = function() {

    var self = this;

    if(!self.isSymbol) return;

    self.layers.forEach(function (layer) {
        layer.parentWickObject = self;

        layer.frames.forEach(function (frame) {
            frame.parentLayer = layer;
            frame.parentObject = self;

            frame.wickObjects.forEach(function (wickObject) {
                wickObject.parentObject = self;
                wickObject.parentFrame = frame;

                wickObject.generateParentObjectReferences();
            });
        });
    });

}

WickObject.prototype.generateObjectNameReferences = function () {

    var that = this;

    this.getAllChildObjects().forEach(function(child) {
        that[child.name] = child;

        if(child.isSymbol) {
            child.generateObjectNameReferences();
        }
    });

}

WickObject.prototype.getCurrentLayer = function() {
    return this.layers[this.currentLayer];
}

WickObject.prototype.addLayer = function (layer) {
    var currentLayerNum = 0;

    this.layers.forEach(function (layer) {
        var splitName = layer.identifier.split("Layer ")
        if(splitName && splitName.length > 1) {
            layerNum = parseInt(splitName[1]);
            if(layerNum > currentLayerNum) {
                currentLayerNum = layerNum;
            }
        }
    });

    layer.identifier = "Layer " + (currentLayerNum+1);

    this.layers.push(layer);
}

WickObject.prototype.removeLayer = function (layer) {
    var that = this;
    this.layers.forEach(function (currLayer) {
        if(layer === currLayer) {
            that.layers.splice(that.layers.indexOf(layer), 1);
        }
    });
}

WickObject.prototype.getTotalTimelineLength = function () {
    var longestLayerLength = 0;

    this.layers.forEach(function (layer) {
        var layerLength = layer.getTotalLength();
        if(layerLength > longestLayerLength) {
            longestLayerLength = layerLength;
        }
    });

    return longestLayerLength;

}

WickObject.prototype.updateFrameTween = function (relativePlayheadPosition) {
    var frame = this.parentFrame;
    var tween = frame.getTweenAtFrame(relativePlayheadPosition);

    if(tween) {
        tween.updateFromWickObjectState(this);
    }
}

WickObject.prototype.addPlayRange = function (playRange) {
    if (!this.isSymbol) return; 

    this.playRanges.push(playRange); 
}

WickObject.prototype.removePlayRange = function (playRangeToDelete) {
    var self = this; 

    if (!self.isSymbol) return;

    var deletePlayRangeIndex = null;

    for (var i = 0; i < self.playRanges.length; i++) {
        if (playRangeToDelete === self.playRanges[i]) {
            deletePlayRangeIndex = i; 
            break; 
        }
    }

    if(deletePlayRangeIndex !== null) self.playRanges.splice(deletePlayRangeIndex, 1); 
}

/* Return all child objects of a parent object */
WickObject.prototype.getAllChildObjects = function () {

    if (!this.isSymbol) {
        return [];
    }

    var children = [];
    for(var l = this.layers.length-1; l >= 0; l--) {
        var layer = this.layers[l];
        for(var f = 0; f < layer.frames.length; f++) {
            var frame = layer.frames[f];
            for(var o = 0; o < frame.wickObjects.length; o++) {
                children.push(frame.wickObjects[o]);
            }
        }
    }
    return children;
}

/* Return all child objects in the parent objects current frame. */
WickObject.prototype.getAllActiveChildObjects = function () {

    if (!this.isSymbol) {
        return [];
    }

    var children = [];
    for (var l = this.layers.length-1; l >= 0; l--) {
        var layer = this.layers[l];
        var frame = layer.getFrameAtPlayheadPosition(this.playheadPosition);
        if(frame) {
            frame.wickObjects.forEach(function (obj) {
                children.push(obj);
            });
        }
    }
    return children;
}

/* Return all child objects of a parent object (and their children) */
WickObject.prototype.getAllChildObjectsRecursive = function () {

    if (!this.isSymbol) {
        return [this];
    }

    var children = [this];
    this.layers.forEachBackwards(function (layer) {
        layer.frames.forEach(function (frame) {
            frame.wickObjects.forEach(function (wickObject) {
                children = children.concat(wickObject.getAllChildObjectsRecursive());
            });
        });
    });
    return children;
}

/* Return all active child objects of a parent object (and their children) */
WickObject.prototype.getAllActiveChildObjectsRecursive = function (includeParents) {

    if (!this.isSymbol) {
        return [];
    }

    var children = [];
    for (var l = this.layers.length-1; l >= 0; l--) {
        var frame = this.layers[l].getFrameAtPlayheadPosition(this.playheadPosition);
        if(frame) {
            for(var o = 0; o < frame.wickObjects.length; o++) {
                var obj = frame.wickObjects[o];
                if(includeParents || !obj.isSymbol) children.push(obj);
                children = children.concat(obj.getAllActiveChildObjectsRecursive(includeParents));
            }
        }
    }
    return children;

}

/* Return all child objects in the parent objects current layer. */
WickObject.prototype.getAllActiveLayerChildObjects = function () {

    if (!this.isSymbol) {
        return [];
    }

    var children = [];
    var layer = this.getCurrentLayer();
    var frame = layer.getFrameAtPlayheadPosition(this.playheadPosition);
    if(frame) {
        frame.wickObjects.forEach(function (obj) {
            children.push(obj);
        });
    }
    return children;
}

// Use this to get objects on other layers
WickObject.prototype.getAllInactiveSiblings = function () {

    if(!this.parentObject) {
        return [];
    }

    var that = this;
    var siblings = [];
    this.parentObject.getAllActiveChildObjects().forEach(function (child) {
        if(child !== that) {
            siblings.push(child);
        }
    });
    siblings = siblings.concat(this.parentObject.getAllInactiveSiblings());

    return siblings;

}

// Use this for onion skinning
WickObject.prototype.getNearbyObjects = function (numFramesBack, numFramesForward) {

    // Get nearby frames

    var nearbyFrames = [];

    var startPlayheadPosition = Math.max(0, this.playheadPosition - numFramesBack);
    var endPlayheadPosition = this.playheadPosition + numFramesForward;
    var tempPlayheadPosition = startPlayheadPosition;

    while(tempPlayheadPosition <= endPlayheadPosition) {
        var frame = this.getCurrentLayer().getFrameAtPlayheadPosition(tempPlayheadPosition);

        if(frame && tempPlayheadPosition !== this.playheadPosition && nearbyFrames.indexOf(frame) == -1) {
            nearbyFrames.push(frame);
        }
        
        tempPlayheadPosition ++;
    }

    // Get objects in nearby frames

    var nearbyObjects = [];

    nearbyFrames.forEach(function(frame) {
        nearbyObjects = nearbyObjects.concat(frame.wickObjects);
    });

    return nearbyObjects;

}

//
WickObject.prototype.getObjectsOnFirstFrame = function () {

    var objectsOnFirstFrame = [];

    this.layers.forEach(function (layer) {
        layer.frames[0].wickObjects.forEach(function (wickObj) {
            objectsOnFirstFrame.push(wickObj);
        });
    });

    return objectsOnFirstFrame;

}

WickObject.prototype.getParents = function () {
    if(!this.isSymbol) {
        return [];
    } else if(this.isRoot) {
        return [this];
    } else {
        return this.parentObject.getParents().concat([this]);
    }
}

/* Excludes children of children */
WickObject.prototype.getTotalNumChildren = function () {
    var count = 0;
    for(var l = 0; l < this.layers.length; l++) {
        for(var f = 0; f < this.layers[l].frames.length; f++) {
            for(var o = 0; o < this.layers[l].frames[f].wickObjects.length; o++) {
                count++;
            }
        }
    }
    return count;
}

WickObject.prototype.getAllFrames = function () {

    if(!this.isSymbol) return [];

    var allFrames = [];

    this.layers.forEach(function (layer) {
        layer.frames.forEach(function (frame) {
            allFrames.push(frame);
        });
    });

    return allFrames;
}

WickObject.prototype.getAllPlayRanges = function () {

    if(!this.playRanges) return [];

    var allranges = [];

    this.playRanges.forEach(function (playrange) {
        allranges.push(playrange)
    })

    return allranges;

}

WickObject.prototype.getFrameWithChild = function (child) {

    var foundFrame = null;

    this.layers.forEach(function (layer) {
        layer.frames.forEach(function (frame) {
            frame.wickObjects.forEach(function (wickObject) {
                if(wickObject.uuid === child.uuid) {
                    foundFrame = frame;
                }
            });
        });
    });

    return foundFrame;
}

WickObject.prototype.getLayerWithChild = function (child) {

    var foundLayer = null;

    this.layers.forEach(function (layer) {
        layer.frames.forEach(function (frame) {
            if(frame.wickObjects.indexOf(child) !== -1) {
                foundLayer = layer;
            }
        });
    });

    return foundLayer;
}

WickObject.prototype.remove = function () {
    this.parentObject.removeChild(this);
}

WickObject.prototype.removeChild = function (childToRemove) {

    if(!this.isSymbol) {
        return;
    }

    var that = this;
    this.getAllActiveChildObjects().forEach(function(child) {
        if(child == childToRemove) {
            var index = child.parentFrame.wickObjects.indexOf(child);
            child.parentFrame.wickObjects.splice(index, 1);
        }
    });
}

WickObject.prototype.getZIndex = function () {
    return this.parentFrame.wickObjects.indexOf(this);
}

/* Get the absolute position of this object (the position not relative to the parents) */
WickObject.prototype.getAbsolutePosition = function () {
    if(this.isRoot) {
        return {
            x: this.x,
            y: this.y
        };
    } else if (!this.parentObject) {
        return this.cachedAbsolutePosition;
    } else {
        var parent = this.parentObject;
        var parentPosition = parent.getAbsolutePosition();
        return {
            x: this.x + parentPosition.x,
            y: this.y + parentPosition.y
        };
    }
}

/* Get the absolute position of this object taking into account the scale of the parent */
WickObject.prototype.getAbsolutePositionTransformed = function () {
    if(this.isRoot) {
        return {
            x: this.x,
            y: this.y
        };
    } else {
        var parent = this.parentObject;
        var parentPosition = parent.getAbsolutePositionTransformed();
        var parentScale = parent.getAbsoluteScale()
        var parentFlip = parent.getAbsoluteFlip();
        var rotatedPosition = {x:this.x*parentScale.x, y:this.y*parentScale.y};
        if(parentFlip.x) rotatedPosition.x *= -1;
        if(parentFlip.y) rotatedPosition.y *= -1;
        rotatedPosition = rotate_point(rotatedPosition.x, rotatedPosition.y, 0, 0, parent.getAbsoluteRotation());
        return {
            x: rotatedPosition.x + parentPosition.x,
            y: rotatedPosition.y + parentPosition.y
        };
    }
}

WickObject.prototype.getAbsoluteScale = function () {
    if(this.isRoot) {
        return {
            x: this.scaleX,
            y: this.scaleY
        };
    } else {
        var parentScale = this.parentObject.getAbsoluteScale();
        return {
            x: this.scaleX * parentScale.x,
            y: this.scaleY * parentScale.y
        };
    }
}

WickObject.prototype.getAbsoluteRotation = function () {
    if(this.isRoot) {
        return this.rotation;
    } else {
        var parentRotation = this.parentObject.getAbsoluteRotation();
        return this.rotation + parentRotation;
    }
}

WickObject.prototype.getAbsoluteOpacity = function () {
    if(this.isRoot) {
        return this.opacity;
    } else {
        var parentOpacity = this.parentObject.getAbsoluteOpacity();
        return this.opacity * parentOpacity;
    }
}

WickObject.prototype.getAbsoluteFlip = function () {
    if(this.isRoot) {
        return {
            x: this.flipX,
            y: this.flipY
        };
    } else {
        var parentFlip = this.parentObject.getAbsoluteFlip();
        return {
            x: this.flipX || parentFlip.x,
            y: this.flipY || parentFlip.y
        };
    }
}

WickObject.prototype.getAbsoluteTransformations = function () {
    return {
        position: this.getAbsolutePositionTransformed(),
        scale: this.getAbsoluteScale(),
        rotation: this.getAbsoluteRotation(),
        opacity: this.getAbsoluteOpacity(),
        flip: this.getAbsoluteFlip(),
    }
}

WickObject.prototype.isOnActiveLayer = function (activeLayer) {

    return this.parentFrame.parentLayer === activeLayer;

}

WickObject.prototype.getPlayRanges = function () {
    if (!this.isSymbol) {return;}
    
    return this.playRanges; 
}

WickObject.prototype.play = function () {

    this._playing = true;
}

WickObject.prototype.stop = function () {

    this._playing = false;
}

WickObject.prototype.getFrameById = function (identifier) {
    var foundFrame = null;

    this.getAllFrames().forEach(function (frame) {
        if(frame.name === identifier) {
            foundFrame = frame;
        }
    });

    return foundFrame;
}

WickObject.prototype.getPlayrangeById = function (identifier) {
    var foundPlayRange = null;

    this.playRanges.forEach(function (playRange) {
        if(playRange.identifier === identifier) {
            foundPlayRange = playRange;
        }
    });

    return foundPlayRange;
}

WickObject.prototype.getFramesInPlayrange = function (playrange) {
    var frames = [];

    this.layers.forEach(function (layer) {
        if(!playrange) return;
        for(var i = playrange.start; i < playrange.end; i++) {
            var frame = layer.getFrameAtPlayheadPosition(i);
            if(frame && !frames.includes(frame)) {
                frames.push(frame);
            }
        }
    });

    return frames;
}

WickObject.prototype.gotoAndStop = function (frame) {
    this.movePlayheadTo(frame);
    this.stop();
}

WickObject.prototype.gotoAndPlay = function (frame) {
    this.movePlayheadTo(frame);
    this.play();
}

WickObject.prototype.movePlayheadTo = function (frame) {

    this._forceNewPlayheadPosition = true;

    var oldFrame = this.getCurrentLayer().getCurrentFrame();

    // Frames are zero-indexed internally but start at one in the editor GUI, so you gotta subtract 1.
    if (CheckInput.isNonNegativeInteger(frame) && frame !== 0) {
        var actualFrame = frame-1;

        var endOfFrames = this.getFramesEnd(); 
        // Only navigate to an integer frame if it is nonnegative and a valid frame
        if(actualFrame < endOfFrames) {
            this._newPlayheadPosition = actualFrame;
        } else {
            throw (new Error("Failed to navigate to frame \'" + actualFrame + "\': is not a valid frame."));
        }

    } else if (CheckInput.isString(frame)) {

        var foundPlayRange = this.getPlayrangeById(frame)
        var foundFrame = this.getFrameById(frame)

        if(foundPlayRange) {
            if(this.playheadPosition < foundPlayRange.start || this.playheadPosition >= foundPlayRange.end) {
                this._newPlayheadPosition = foundPlayRange.start;
            }
        } else if (foundFrame) {
            this._newPlayheadPosition = foundFrame.playheadPosition;
        }

    } else {

        throw "Failed to navigate to frame \'" + frame + "\': is neither a string nor a nonnegative integer";

    }

}

WickObject.prototype.gotoNextFrame = function () {

    var nextFramePos = this.playheadPosition+1;
    var totalLength = this.layers[this.currentLayer].getTotalLength();
    if(nextFramePos >= totalLength) {
        nextFramePos = 0;
    }

    this._newPlayheadPosition = nextFramePos;

}

WickObject.prototype.gotoPrevFrame = function () {

    var nextFramePos = this.playheadPosition-1;
    if(nextFramePos < 0) {
        nextFramePos = this.layers[this.currentLayer].getTotalLength()-1;
    }

    this._newPlayheadPosition = nextFramePos;

}

WickObject.prototype.getFramesEnd = function() {
    endFrame = 0; 

    this.getCurrentLayer().frames.forEach( function (frame) {
        endFrame = Math.max (frame.getFrameEnd(), endFrame); 
    })

    return endFrame;

}

WickObject.prototype.hitTestRectangles = function (otherObj) {
    var A = this;
    var B = otherObj;
    var V = SAT.Vector;
    var P = SAT.Polygon;

    var At = A.getAbsoluteTransformations();
    var Bt = B.getAbsoluteTransformations();

    var AWidth = (A.width * At.scale.x) / 2;
    var BWidth = (B.width * Bt.scale.x) / 2;
    var AHeight = (A.height * At.scale.y) / 2;
    var BHeight = (B.height * Bt.scale.y) / 2;

    var Ax = (At.position.x);
    var Bx = (Bt.position.x);
    var Ay = (At.position.y);
    var By = (Bt.position.y);

    var ALeft = (-AWidth);
    var ARight = (AWidth);
    var ATop = (-AHeight);
    var ABottom = (AHeight);

    var BLeft = (-BWidth);
    var BRight = (BWidth);
    var BTop = (-BHeight);
    var BBottom = (BHeight);

    var polygon1 = new P(new V(Ax, Ay), [
      new SAT.Vector(ARight, ATop),
      new SAT.Vector(ARight, ABottom), 
      new SAT.Vector(ALeft, ABottom), 
      new SAT.Vector(ALeft, ATop),
    ]);
    polygon1.rotate(At.rotation * 0.0174533);

    var polygon2 = new P(new V(Bx, By), [
      new SAT.Vector(BRight, BTop), 
      new SAT.Vector(BRight, BBottom), 
      new SAT.Vector(BLeft, BBottom), 
      new SAT.Vector(BLeft, BTop),
    ]);
    polygon2.rotate(Bt.rotation * 0.0174533);

    var response = new SAT.Response();
    var collided = SAT.testPolygonPolygon(polygon1, polygon2, response);
    if(collided) {
        if(response.overlapV.x !== 0) response.dirX = (polygon1.pos.x > polygon2.pos.x) ? 'left' : 'right';
        if(response.overlapV.y !== 0) response.dirY = (polygon1.pos.y > polygon2.pos.y) ? 'up' : 'down';
        return response;
    } else {
        return null;
    }
}

WickObject.prototype.getHitResult = function (otherObj) {
    if (otherObj === undefined || !otherObj._active) {
        return false;
    }

    // Generate lists of all children of both objects

    var otherObjChildren = otherObj.getAllActiveChildObjectsRecursive(false);
    if(!otherObj.isSymbol) {
        otherObjChildren.push(otherObj);
    }

    var thisObjChildren = this.getAllActiveChildObjectsRecursive(false);
    if(!this.isSymbol) {
        thisObjChildren.push(this);
    }

    var results = [];
    for (var i = 0; i < otherObjChildren.length; i++) {
        for (var j = 0; j < thisObjChildren.length; j++) {
            var objA = thisObjChildren[j];
            var objB = otherObjChildren[i];
            var result = objA["hitTestRectangles"](objB)
            if (result) {
                //return result;
                results.push(result);
            }
        }
    }

    if(results.length === 0)  {
        return {
            hit: false,
            overlapX: 0,
            overlapY: 0,
        };
    }

    var finalResult = {
        hit: true,
        overlapX: 0,
        overlapY: 0,
    }
    results.forEach(function (result) {
        finalResult.overlapX += result.overlapV.x;
        finalResult.overlapY += result.overlapV.y;
        if(result.dirX) finalResult.dirX = result.dirX;
        if(result.dirY) finalResult.dirY = result.dirY;
    });
    return finalResult;

}

WickObject.prototype.hitTest = function (otherObj) {
    return this.getHitInfo(otherObj).hit;
}

WickObject.prototype.getHitInfo = function (otherObj) {
    return this.getHitResult(otherObj);
}

WickObject.prototype.isPointInside = function(point) {

    var objects = this.getAllActiveChildObjectsRecursive(false);
    if(!this.isSymbol) {
        objects.push(this);
    }

    var hit = false;

    objects.forEach(function(object) {
        if(hit) return;

        var transformedPosition = object.getAbsolutePositionTransformed();
        var transformedPoint = {x:point.x, y:point.y};
        var transformedScale = object.getAbsoluteScale();
        var transformedWidth = (object.width+object.svgStrokeWidth)*transformedScale.x;
        var transformedHeight = (object.height+object.svgStrokeWidth)*transformedScale.y;

        transformedPoint = rotate_point(
            transformedPoint.x, 
            transformedPoint.y, 
            transformedPosition.x, 
            transformedPosition.y,
            -object.getAbsoluteRotation()
        );

        // Bounding box check
        if ( transformedPoint.x >= transformedPosition.x - transformedWidth /2 &&
             transformedPoint.y >= transformedPosition.y - transformedHeight/2 &&
             transformedPoint.x <= transformedPosition.x + transformedWidth /2 &&
             transformedPoint.y <= transformedPosition.y + transformedHeight/2 ) {

            if(!object.alphaMask) {
                hit = true;
                return;
            }

            var relativePoint = {
                x: transformedPoint.x - transformedPosition.x + transformedWidth /2,
                y: transformedPoint.y - transformedPosition.y + transformedHeight/2
            }

            // Alpha mask check
            var objectAlphaMaskIndex =
                (Math.floor(relativePoint.x/transformedScale.x)%Math.floor(object.width+object.svgStrokeWidth)) +
                (Math.floor(relativePoint.y/transformedScale.y)*Math.floor(object.width+object.svgStrokeWidth));
            if(!object.alphaMask[(objectAlphaMaskIndex)] && 
               objectAlphaMaskIndex < object.alphaMask.length &&
               objectAlphaMaskIndex >= 0) {
                hit = true;
                return;
            }
        }
    });

    return hit;
}

WickObject.prototype.clone = function () {
    return wickPlayer.cloneObject(this);
};

WickObject.prototype.delete = function () {
    return wickPlayer.deleteObject(this);
};

WickObject.prototype.setCursor = function (cursor) {
    this.cursor = cursor;
}

WickObject.prototype.isHoveredOver = function () {
    return this.hoveredOver;
}

WickObject.prototype.setValidator = function (validator) {
    var self = this;
    this.parentObject.layers.forEach(function (layer) {
        layer.frames.forEach(function (frame) {
            for (var i = 0; i < frame.wickObjects.length; i++) {
                if(frame.wickObjects[i] === self) {
                    frame.wickObjects[i] = new Proxy(self, validator);
                }
            }
        });
    });
}

WickObject.prototype.prepareForPlayer = function () {
    // Set all playhead vars
    if(this.isSymbol) {
        // Set this object to it's first frame
        this.playheadPosition = 0;

        // Start the object playing
        this._playing = true;
        this._active = false;
        this._wasActiveLastTick = false;

        this.getAllFrames().forEach(function (frame) {
            //frame.prepareForPlayer();
        });
    }

    // Reset the mouse hovered over state flag
    this.hoveredOver = false;
}

/* Generate alpha mask for per-pixel hit detection */
WickObject.prototype.generateAlphaMask = function (imageData) {

    var that = this;

    var alphaMaskSrc = imageData || that.asset.getData();
    if(!alphaMaskSrc) return;

    //window.open(alphaMaskSrc)

    ImageToCanvas(alphaMaskSrc, function (canvas,ctx) {
        //if(window.wickPlayer) window.open(canvas.toDataURL())
        var w = canvas.width;
        var h = canvas.height;
        var rgba = ctx.getImageData(0,0,w,h).data;
        that.alphaMask = [];
        for (var y = 0; y < h; y ++) {
            for (var x = 0; x < w; x ++) {
                var alphaMaskIndex = x+y*w;
                that.alphaMask[alphaMaskIndex] = rgba[alphaMaskIndex*4+3] <= 10;
            }
        }
    }, {width:Math.floor(that.width+that.svgStrokeWidth), height:Math.floor(that.height+that.svgStrokeWidth)} );

}

WickObject.prototype.getCurrentFrames = function () {
    var currentFrames = [];

    this.layers.forEach(function (layer) {
        var frame = layer.getCurrentFrame();
        if(frame) currentFrames.push(frame)
    });

    return currentFrames;
}

WickObject.prototype.getFramesAtPlayheadPosition = function () {

}

WickObject.prototype.tick = function () {
    var self = this;
    
    if(this._deleted) return;

    if(this.isSymbol) {
        this.layers.forEach(function (layer) {
            layer.frames.forEach(function (frame) {
                frame.tick();
            });
        });
    }

    if(this.isButton) {
        this.stop();
        if(this._beingClicked) {
            if(this.getFramesInPlayrange(this.getPlayrangeById('mousedown')).length > 0)
                this.movePlayheadTo('mousedown');
        } else if (this.hoveredOver) {
            if(this.getFramesInPlayrange(this.getPlayrangeById('mouseover')).length > 0)
                this.movePlayheadTo('mouseover');
        } else {
            if(this.getFramesInPlayrange(this.getPlayrangeById('mouseup')).length > 0)
                this.movePlayheadTo('mouseup');
        }
    }

    // Input events

    if(this._wasClicked) {
        (wickPlayer || wickEditor).project.runScript(this, 'mousedown');
        this._wasClicked = false;
    }

    if(this._wasHoveredOver) {
        (wickPlayer || wickEditor).project.runScript(this, 'mouseover');
        this._wasHoveredOver = false;
    }

    if(this._mouseJustLeft) {
        (wickPlayer || wickEditor).project.runScript(this, 'mouseout');
        this._mouseJustLeft = false;
    }

    if(this._wasClickedOff) {
        (wickPlayer || wickEditor).project.runScript(this, 'mouseup');
        this._wasClickedOff = false;
    }

    wickPlayer.inputHandler.getAllKeysJustReleased().forEach(function (key) {
        (wickPlayer || wickEditor).project.runScript(self, 'keyreleased', key);
    });

    wickPlayer.inputHandler.getAllKeysJustPressed().forEach(function (key) {
        (wickPlayer || wickEditor).project.runScript(self, 'keypressed', key);
    });

    wickPlayer.inputHandler.getAllKeysDown().forEach(function (key) {
        (wickPlayer || wickEditor).project.runScript(self, 'keydown', key);
    });

    // Inactive -> Inactive
    if (!this._wasActiveLastTick && !this._active) {
        
    }
    // Inactive -> Active
    else if (!this._wasActiveLastTick && this._active) {
        (wickPlayer || wickEditor).project.loadScriptOfObject(this);

        (wickPlayer || wickEditor).project.runScript(this, 'load');
        (wickPlayer || wickEditor).project.runScript(this, 'update');

        this.advanceTimeline();
    }
    // Active -> Active
    else if (this._wasActiveLastTick && this._active) {
        (wickPlayer || wickEditor).project.runScript(this, 'update');

        this.advanceTimeline();
    }
    // Active -> Inactive
    else if (this._wasActiveLastTick && !this._active) {
        if(!this.parentFrame.alwaysSaveState) {
            wickPlayer.resetStateOfObject(this);
        }
    }
    
    // Update currentFrameNumber and currentFrameName for API
    if(this.isSymbol) {
        this.currentFrameNumber = this.playheadPosition+1;
        var self = this;
        this.layers.forEach(function (layer) {
            var frame = layer.getCurrentFrame();
            if(frame && frame.name) {
                self.currentFrameName = frame.name;
            }
        })
    }

}

WickObject.prototype.advanceTimeline = function () {
    if(this._playing && this.isSymbol && this._newPlayheadPosition === undefined) {
        this._newPlayheadPosition = this.playheadPosition+1;
        if(this._newPlayheadPosition >= this.getTotalTimelineLength()) {
            this._newPlayheadPosition = 0;
        }
    }
}

WickObject.prototype.isActive = function () {
    if(this.isRoot) return true;

    return this.parentFrame._active;
}

WickObject.prototype.setText = function (text) {
    if (!this.isText) { return; } // We're not text, don't set anything

    this.textData.text = String(text); // Convert to a string, just in case.
    this._renderDirty = true;  
}

WickObject.prototype.pointTo = function ( x2, y2 ) {
    var dx = this.x - x2,
        dy = this.y - y2;
    
    this.rotation = Math.atan2(dy,dx) * 180 / Math.PI - 90;
};
