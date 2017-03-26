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

    this.tweens = [];

// Common
    
    //this.wickScript = "function load() {\n\t\n}\n\nfunction update() {\n\t\n}\n";
    this.wickScript = "";

// Static

    // Data, only used by static objects
    this.imageData = undefined;
    this.fontData  = undefined;
    this.audioData = undefined;
    this.pathData  = undefined;

    this.volume = 1.0;

// Symbols

    this.isSymbol = false;
    this.isButton = false;

    // Used to keep track of what frame is being edited
    this.playheadPosition = null;
    this.currentLayer = null;

    // List of layers, only used by symbols
    this.layers = undefined;
    this.playRanges = undefined;

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

WickObject.fromImage = function (imgSrc) {

    var obj = new WickObject();
    obj.imageData = imgSrc;
    return obj;

}

WickObject.fromText = function (text) {
    var obj = new WickObject();

    obj.fontData = {
        //backgroundColor: undefined,
        //borderColor: undefined,
        //borderDashArray: undefined,
        //borderScaleFactor: undefined,
        //caching: true,
        cursorColor: '#333',
        cursorDelay: 500,
        //cursorWidth: 2,
        editable: true,
        //editingBorderColor: '#333',
        fontFamily: 'arial',
        fontSize: 40,
        fontStyle: 'normal',
        fontWeight: 'normal',
        //textDecoration: '',
        //hasBorders: true,
        lineHeight: 1.16,
        fill: '#000000',
        //selectionColor: undefined,
        //selectionEnd: undefined,
        //selectionStart: undefined,
        //shadow: undefined,
        //stateProperties: undefined,
        //stroke: undefined,
        //styles: undefined, // Stores variable character styles
        textAlign: 'left',
        //textBackgroundColor: undefined,
        textDecoration: "",
        text: text
    };

    return obj;
}

WickObject.fromAudioFile = function (audioData) {
    var audioWickObject = new WickObject();

    audioWickObject.audioData = audioData;
    audioWickObject.autoplaySound = true;
    audioWickObject.loopSound = false;
    audioWickObject.width = 75;
    audioWickObject.height = 75;

    return audioWickObject;
}

WickObject.fromPathFile = function (pathData) {
    var pathWickObject = new WickObject();
    pathWickObject.pathData = pathData;
    return pathWickObject;
}

WickObject.createNewSymbol = function () {

    var symbol = new WickObject();

    symbol.isSymbol = true;
    symbol.playheadPosition = 0;
    symbol.currentLayer = 0;
    symbol.layers = [new WickLayer()];
    symbol.playRanges = []; 

    return symbol;

}

// Create a new symbol and add every object in wickObjects as children
WickObject.createSymbolFromWickObjects = function (wickObjects) {

    var symbol = WickObject.createNewSymbol();

    // Calculate center of all WickObjects
    var topLeft = {x:Number.MAX_SAFE_INTEGER, y:Number.MAX_SAFE_INTEGER};
    var bottomRight = {x:0,y:0};
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
        var ii = wickObjects.length-1-i; // So objects are properly ordered in symbol

        firstFrame.wickObjects[ii] = wickObjects[i];

        firstFrame.wickObjects[ii].x = wickObjects[i].x - symbol.x;
        firstFrame.wickObjects[ii].y = wickObjects[i].y - symbol.y;
    }

    symbol.width  = firstFrame.wickObjects[0].width;
    symbol.height = firstFrame.wickObjects[0].height;

    return symbol;

}

// Create a new symbol and add every frame into the new symbol's timeline
WickObject.createSymbolFromWickFrames = function (wickFrames) {

    wickFrames.forEach(function (wickFrame) {
        console.log(wickFrame.parentLayer)
    })

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

    copiedObject.name = undefined; // ???? Should we generate a name based on the object being copied?

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

    //copiedObject.tweens = ; // TODO: Copy tweens!!!

    // TODO: Copy scripts !!!
    copiedObject.wickScript = this.wickScript

    if(this.isSymbol) {
        copiedObject.isSymbol = true;

        copiedObject.playheadPosition = 0;
        copiedObject.currentLayer = 0;

        copiedObject.layers = [];
        this.layers.forEach(function (layer) {
            copiedObject.layers.push(layer.copy());
        });
    } else {
        copiedObject.isSymbol = false;

        copiedObject.imageData = this.imageData;
        copiedObject.fontData = this.fontData;
        copiedObject.pathData = this.pathData;
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

    var dontJSONVars = [
        "cachedImageData",
        "fabricObjectReference",
        "parentObject",
        "causedAnException",
        "uuid",
        "parentLayer",
        "parentWickObject",
        "parentFrame"
    ];
    var JSONWickObject = JSON.stringify(this, function(key, value) {
        if (dontJSONVars.indexOf(key) !== -1) {
            return undefined;
        } else {
            return value;
        }
    });

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

    function dataURItoBlob(dataURI) {
      // convert base64 to raw binary data held in a string
      // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
      var byteString = atob(dataURI.split(',')[1]);

      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

      // write the bytes of the string to an ArrayBuffer
      var ab = new ArrayBuffer(byteString.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }

      // write the ArrayBuffer to a blob, and you're done
      var blob = new Blob([ab], {type: mimeString});
      return blob;

      // Old code
      // var bb = new BlobBuilder();
      // bb.append(ab);
      // return bb.getBlob(mimeString);
    }

    if(this.imageData) {
        saveAs(dataURItoBlob(this.imageData), filename+".jpg");
        return;
    }

    if(this.audioData) {
        saveAs(dataURItoBlob(this.audioData), filename+".wav");
        return;
    }

    console.error("export not supported for this type of wickobject yet");

}

WickObject.addPrototypes = function (obj) {

    // Put the prototype back on this object
    obj.__proto__ = WickObject.prototype;

    // Recursively put the prototypes back on the children objects
    if(obj.tweens) { // Rescues old projects created before tweens came out
        obj.tweens.forEach(function (tween) {
            tween.__proto__ = WickTween.prototype;
        });
    }

    if(obj.isSymbol) {
        obj.playRanges.forEach(function (playRange) {
            playRange.__proto__ = WickPlayRange.prototype;
        });

        obj.layers.forEach(function (layer) {
            layer.__proto__ = WickLayer.prototype;
            layer.frames.forEach(function(frame) {
                frame.__proto__ = WickFrame.prototype;
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

    if(this.fontData) {
        this.fontData.text = WickProject.Compressor.encodeString(this.fontData.text);
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

    if(this.fontData) {
        this.fontData.text = WickProject.Compressor.decodeString(this.fontData.text);
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

WickObject.prototype.addTween = function (newTween) {
    var self = this;

    var replacedTween = false;
    this.tweens.forEach(function (tween) {
        if (tween.frame === newTween.frame) {
            self.tweens[self.tweens.indexOf(tween)] = newTween;
            replacedTween = true;
        }
    });

    if(!replacedTween)
        this.tweens.push(newTween);
}

WickObject.prototype.removeTween = function (tweenToDelete) {
    var self = this;

    var deleteTweenIndex = null;
    this.tweens.forEach(function (tween) {
        if(deleteTweenIndex) return;
        if (tweenToDelete === tween) {
            deleteTweenIndex = self.tweens.indexOf(tween);
        }
    });

    if(deleteTweenIndex !== null) {
        self.tweens.splice(deleteTweenIndex, 1);
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

WickObject.prototype.hasTweenAtFrame = function (frame) {
    var foundTween = false
    this.tweens.forEach(function (tween) {
        if(foundTween) return;
        if(tween.frame === frame) foundTween = true;
    })
    return foundTween;
}

WickObject.prototype.getFromTween = function () {
    var foundTween = null;

    var relativePlayheadPosition = this.parentObject.getCurrentLayer().getRelativePlayheadPosition(this);

    var seekPlayheadPosition = relativePlayheadPosition;
    while (!foundTween && seekPlayheadPosition >= 0) {
        this.tweens.forEach(function (tween) {
            if(tween.frame === seekPlayheadPosition) {
                foundTween = tween;
            }
        });
        seekPlayheadPosition--;
    }

    return foundTween;
}

WickObject.prototype.getToTween = function () {
    var foundTween = null;

    var relativePlayheadPosition = this.parentObject.getRelativePlayheadPosition(this);

    var seekPlayheadPosition = relativePlayheadPosition;
    var parentFrameLength = this.parentObject.getFrameWithChild(this).length;
    while (!foundTween && seekPlayheadPosition < parentFrameLength) {
        this.tweens.forEach(function (tween) {
            if(tween.frame === seekPlayheadPosition) {
                foundTween = tween;
            }
        });
        seekPlayheadPosition++;
    }

    return foundTween;
}

WickObject.prototype.applyTweens = function () {

    var that = this;

    if(!this.tweens) this.tweens = []; // Rescue old projects created before tweens came out

    if (!this.isRoot && this.tweens.length > 0) {
        if(this.tweens.length === 1) {
            this.tweens[0].applyTweenToWickObject(that);
        } else {
            var tweenFrom = that.getFromTween();
            var tweenTo = that.getToTween();

            if (tweenFrom && tweenTo) {
                // yuck
                var A = tweenFrom.frame;
                var B = tweenTo.frame;
                var L = B-A;
                var P = that.parentObject.getRelativePlayheadPosition(that)-A;
                var T = P/L;
                if(B-A === 0) T = 1;
                
                var interpolatedTween = WickTween.interpolateTweens(tweenFrom, tweenTo, T);
                interpolatedTween.applyTweenToWickObject(that);
            }
            if (!tweenFrom && tweenTo) {
                tweenTo.applyTweenToWickObject(that);
            }
            if (!tweenTo && tweenFrom) {
                tweenFrom.applyTweenToWickObject(that);
            }
        }
    }

    if (!this.isSymbol) return;

    this.getAllActiveChildObjects().forEach(function (child) {
        child.applyTweens();
    });

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

    /*var children = [];
    for(var l = this.layers.length-1; l >= 0; l--) {
        var layer = this.layers[l];
        for(var f = 0; f < layer.frames.length; f++) {
            var frame = layer.frames[f];
            for(var o = 0; o < frame.wickObjects.length; o++) {
                children.push(frame.wickObjects[o]);
                children = children.concat(frame.wickObjects[o].getAllChildObjectsRecursive());
            }
        }
    }
    return children;*/

    var children = [this];
    this.layers.forEach(function (layer) {
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

    /*var children = [];
    if(includeParents) children = [this];
    this.layers.forEach(function (layer) {
        layer.frames.forEach(function (frame) {
            if(!frame.isActive()) return;
            frame.wickObjects.forEach(function (wickObject) {
                children = children.concat(wickObject.getAllChildObjectsRecursive());
            });
        });
    });
    return children;*/

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

/* Get the absolute position of this object (the position not relative to the parents) */
WickObject.prototype.getAbsolutePosition = function () {
    if(this.isRoot) {
        return {
            x: this.x,
            y: this.y
        };
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
WickObject.prototype.getAbsolutePositionScaled = function () {
    if(this.isRoot) {
        return {
            x: this.x,
            y: this.y
        };
    } else {
        var parent = this.parentObject;
        var parentPosition = parent.getAbsolutePosition();
        var parentScale = parent.isRoot ? {x:1, y:1} : {x:parent.scaleX, y:parent.scaleY};
        return {
            x: this.x*parentScale.x + parentPosition.x,
            y: this.y*parentScale.y + parentPosition.y
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

        if(foundPlayRange) {
            if(this.playheadPosition < foundPlayRange.start || this.playheadPosition >= foundPlayRange.end) {
                this._newPlayheadPosition = foundPlayRange.start;
            }
        }

    } else {

        throw "Failed to navigate to frame \'" + frame + "\': is neither a string nor a nonnegative integer";

    }

}

/*WickObject.prototype.gotoNextFrame = function () {

    this.playheadPosition ++;
    var totalLength = this.layers[this.currentLayer.getTotalLength];
    if(this.playheadPosition >= totalLength) {
        this.playheadPosition = totalLength-1;
    }

}

WickObject.prototype.gotoPrevFrame = function () {

    this.playheadPosition --;
    if(this.playheadPosition < 0) {
        this.playheadPosition = 0;
    }
}*/

// TODO optimize this... 
WickObject.prototype.getFramesEnd = function() {
    endFrame = 0; 

    this.getCurrentLayer().frames.forEach( function (frame) {
        endFrame = Math.max (frame.getFrameEnd(), endFrame); 
    })

    return endFrame;

}

/* Determine if two wick objects collide using rectangular hit detection on their
       farthest border */
WickObject.prototype.hitTestRectangles = function (otherObj) {
    var objA = this;
    var objB = otherObj;

    var objAAbsPos = objA.getAbsolutePositionScaled();
    var objBAbsPos = objB.getAbsolutePositionScaled();

    var objAScale  = objA.getAbsoluteScale();
    var objAWidth  = objA.width  * objAScale.x;
    var objAHeight = objA.height * objAScale.y;
    objAAbsPos.x  -= objA.width  * objAScale.x/2;
    objAAbsPos.y  -= objA.height * objAScale.y/2;

    var objBScale  = objB.getAbsoluteScale();
    var objBWidth  = objB.width  * objBScale.x;
    var objBHeight = objB.height * objBScale.y;
    objBAbsPos.x  -= objB.width  * objBScale.x/2;
    objBAbsPos.y  -= objB.height * objBScale.y/2;

    var left = objAAbsPos.x < (objBAbsPos.x + objBWidth);
    var right = (objAAbsPos.x + objAWidth) > objBAbsPos.x;
    var top = objAAbsPos.y < (objBAbsPos.y + objBHeight);
    var bottom = (objAAbsPos.y + objAHeight) > objBAbsPos.y;

    return left && right && top && bottom;
}

/* Determine if two wickObjects Collide using circular hit detection from their
   centroid using their full width and height. */
WickObject.prototype.hitTestCircles = function (otherObj) {
    var objA = this;
    var objB = otherObj;
    
    var objAAbsPos = objA.getAbsolutePositionScaled();
    var objBAbsPos = objB.getAbsolutePositionScaled();

    var dx = objAAbsPos.x - objBAbsPos.x;
    var dy = objAAbsPos.y - objBAbsPos.y;

    var objAWidth = objA.width * objA.scaleX;
    var objAHeight = objAHeight * objA.scaleY;

    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < ((objAWidth/2) + (objBWidth/2))) {
        return true;
    }

    return false;
}

/* Returns a boolean alerting whether or not this object or any of it's children in frame,
   have collided with the given object or any of it's children in frame. */
WickObject.prototype.hitTest = function (otherObj, hitTestType) {
    if (otherObj === undefined) {
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

    // Load the collision detection function for the type of collision we want to check for

    var checkMethod;
    var hitTestMethods = {
        "rectangles" : "hitTestRectangles",
        "circles" : "hitTestCircles"
    }
    if(!hitTestType) {
        // Use default (rectangular hittest) if no hitTestType is provided
        checkMethod = hitTestMethods["rectangles"];
    } else {
        checkMethod = hitTestMethods[hitTestType];
        if(!checkMethod) {
            console.error("Invalid hitTest collision type: " + hitTestType);
        }
    }

    // Ready to go! Check for collisions!!

    for (var i = 0; i < otherObjChildren.length; i++) {
        for (var j = 0; j < thisObjChildren.length; j++) {
            var objA = thisObjChildren[j];
            var objB = otherObjChildren[i];
            // Note: audio objects are like 'ghost' objects, they don't actually
            // show up visually in the player so they should not count in hitTest.
            if (!objA.audioData && !objB.audioData && objA[checkMethod](objB)) {
                return true;
            }
        }
    }

    return false;

}

WickObject.prototype.isPointInside = function(point) {

    var objects = this.getAllActiveChildObjectsRecursive(false);
    if(!this.isSymbol) {
        objects.push(this);
    }

    var hit = false;

    objects.forEach(function(object) {
        if(hit) return;

        var absPosition = object.getAbsolutePositionScaled();
        var absScale = object.getAbsoluteScale();
        var absRotation = object.getAbsoluteRotation();

        var scaledObjX = absPosition.x;
        var scaledObjY = absPosition.y;
        var scaledObjWidth  = object.width *absScale.x;
        var scaledObjHeight = object.height*absScale.y;

        scaledObjX -= scaledObjWidth/2;
        scaledObjY -= scaledObjHeight/2;

        if ( point.x >= scaledObjX &&
             point.y >= scaledObjY  &&
             point.x <= scaledObjX + scaledObjWidth &&
             point.y <= scaledObjY + scaledObjHeight ) {

            if(!object.alphaMask) {
                hit = true;
                return;
            }

            var objectRelativePointX = (point.x - scaledObjX);
            var objectRelativePointY = (point.y - scaledObjY);
            var objectAlphaMaskIndex =
                (Math.floor(objectRelativePointX/absScale.x)%Math.floor(object.width)) +
                (Math.floor(objectRelativePointY/absScale.y)*Math.floor(object.width));
            if(!object.alphaMask[(objectAlphaMaskIndex)]) {
                hit = true;
                return;
            }

        }
    });

    return hit;
}

WickObject.prototype.setText = function (text) {
    //this.pixiText.text = ""+text;
    wickRenderer.setText(this, text);
}

WickObject.prototype.playSound = function () {

    wickPlayer.audioPlayer.playSound(this.uuid, this.loopSound, this.volume);

}

WickObject.prototype.stopSound = function () {

    wickPlayer.audioPlayer.stopSound(this.uuid);

}

WickObject.prototype.setVolume = function (volume) {
    this.volume = volume;
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

/***************************************
            stuff 2 deprecate
***************************************/

WickObject.prototype.prepareForPlayer = function () {
    // Set all playhead vars
    if(this.isSymbol) {
        // Set this object to it's first frame
        this.playheadPosition = 0;

        // Start the object playing
        this._playing = true;
        this._active = false;

        this.getAllFrames().forEach(function (frame) {
            //frame.prepareForPlayer();
        });
    }

    // Reset the mouse hovered over state flag
    this.hoveredOver = false;
}

WickObject.prototype.autocropImage = function (callback) {
    var that = this;

    var img = new Image();
    img.onload = function() {
        var cropImgData = removeBlankPixels(img, img.width, img.height);
        var croppedSrc = cropImgData.dataURL;
        var cropLeft = cropImgData.left;
        var cropTop = cropImgData.top;

        var autoCroppedImg = new Image();
        autoCroppedImg.onload = function () {

            /*AddPaddingToImage(autoCroppedImg, function (paddedImgSrc) {
                var paddedImg = new Image();
                paddedImg.onload = function () {
                    that.width  = paddedImg.width;
                    that.height = paddedImg.height;
                    that.x += cropLeft + that.width/2;
                    that.y += cropTop  + that.height/2;
                    that.imageData = paddedImg.src;
                    that.imageDirty = true;
                    callback();
                }
                paddedImg.src = paddedImgSrc;
            });*/

            that.width  = autoCroppedImg.width;
            that.height = autoCroppedImg.height;
            that.x += cropLeft + that.width/2;
            that.y += cropTop  + that.height/2;
            that.imageData = autoCroppedImg.src;
            that.imageDirty = true;
            callback();
        }
        autoCroppedImg.src = croppedSrc;
    }
    img.src = this.imageData;
}

WickObject.prototype.getBlobImages = function (callback) {
    var that = this;

    FindBlobsAndGetBlobImages(this.imageData, function (blobImages) {
        callback(blobImages);
    });
}

/* Generate alpha mask for per-pixel hit detection */
WickObject.prototype.generateAlphaMask = function (imageData) {

    var that = this;

    var alphaMaskSrc = imageData || that.imageData;
    if(!alphaMaskSrc) return;

    ImageToCanvas(alphaMaskSrc, function (canvas,ctx) {
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
    }, {width:Math.floor(that.width), height:Math.floor(that.height)} );

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
        if(this._wasClicked) {
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

    if(this._wasClicked) {
        (wickEditor || wickPlayer).project.runScript(this, 'mousedown');
        this._wasClicked = false;
    }

    // Inactive -> Inactive
    if (!this._wasActiveLastTick && !this._active) {

    }
    // Inactive -> Active
    else if (!this._wasActiveLastTick && this._active) {
        (wickEditor || wickPlayer).project.loadScriptOfObject(this);

        (wickEditor || wickPlayer).project.runScript(this, 'load');

        this.advanceTimeline();

        if(this.autoplaySound) {
            this.playSound();
        }
    }
    // Active -> Active
    else if (this._wasActiveLastTick && this._active) {
        (wickEditor || wickPlayer).project.runScript(this, 'update');

        this.advanceTimeline();
    }
    // Active -> Inactive
    else if (this._wasActiveLastTick && !this._active) {
        if(!this.parentFrame.alwaysSaveState) {
            // THIS IS VERY BROKEN AND DANGEROUS. DO NOT USE.
            //wickPlayer.resetStateOfObject(this);
        }
    }

    if(this.fontData) {
        if(this.varName) {
            (wickEditor || wickPlayer).project.loadBuiltinFunctions(this);
            this.setText(eval(this.varName));
        }
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

    return this.parentFrame.isActive();
}

/*WickObject.prototype.runScriptFn = function (fnName, objectScope, frame) {

    var that = this;

    if(!objectScope) objectScope = this.parentObject;

    // Setup wickobject reference variables
    window.project = wickPlayer.project || wickEditor.project;
    window.root = project.rootObject;
    window.parent = this.parentObject;

    // Setup builtin wick scripting methods and objects
    window.play           = function ()      { objectScope.play(); }
    window.pause          = function ()      { objectScope.pause(); }
    window.movePlayheadTo = function (frame) { objectScope.movePlayheadTo(frame); }

    // Etc. player wrappers
    window.stopAllSounds = function () { WickPlayer.getAudioPlayer().stopAllSounds(); };
    window.keyIsDown = function (keyString) { return wickPlayer.inputHandler.keyIsDown(keyString); };
    window.keyJustPressed = function (keyString) { return wickPlayer.inputHandler.keyJustPressed(keyString); }
    window.getMouseX = function () { return WickPlayer.getMouse().x; }
    window.getMouseY = function () { return WickPlayer.getMouse().y; }
    window.hideCursor = function () { WickPlayer.hideCursor(); };
    window.showCursor = function () { WickPlayer.showCursor(); };
    window.enterFullscreen = function () { WickPlayer.enterFullscreen(); }

    // WickObjects in same frame (scope) are accessable without using root./parent.
    if(objectScope) {
        objectScope.getAllChildObjects().forEach(function(child) {
            if(child.name) window[child.name] = child;
        });
    }
        
    // Run da script!!
    try {
        //eval(script);
        //eval("try{" + script + "\n}catch (e) { throw (e); }");
        if(frame) {
            frame[fnName]();
        } else {
            if(this[fnName])  this[fnName]();
        }
    } catch (e) {
        if (window.wickEditor) {
            //if(!wickEditor.builtinplayer.running) return;

            console.error("Exception thrown while running script of WickObject: " + this.name);
            console.error(e);
            var lineNumber = null;
            if(e.stack) {
                e.stack.split('\n').forEach(function (line) {
                    if(lineNumber) return;
                    if(!line.includes("<anonymous>:")) return;

                    lineNumber = parseInt(line.split("<anonymous>:")[1].split(":")[0]);
                });
            }

            //console.log(e.stack.split("\n")[1].split('<anonymous>:')[1].split(":")[0]);
            //console.log(e.stack.split("\n"))
            if(wickEditor.builtinplayer.running) wickEditor.builtinplayer.stopRunningProject()
            wickEditor.scriptingide.showError(frame || this, lineNumber, e);

        } else {
            alert("An exception was thrown while running a WickObject script. See console!");
            console.log(e);
        }
    }
    //eval("try{" + script + "}catch (e) { console.log(e); }");

    // Get rid of wickobject reference variables
    if(!this.isRoot) {
        this.parentObject.getAllChildObjects().forEach(function(child) {
            if(child.name) window[child.name] = undefined;
        });
    }

}*/

/*WickObject.prototype.advanceTimeline = function () {
    // Advance timeline for this object
    if(this.isPlaying && this.readyToAdvance) {

        var oldFrame = this.getCurrentLayer().getCurrentFrame();
        this.playheadPosition ++;

        // If we reached the end, go back to the beginning
        if(this.playheadPosition >= this.getTotalTimelineLength()) {
            this.playheadPosition = 0;
        }

        var newFrame = this.getCurrentLayer().getCurrentFrame();

        if(oldFrame !== newFrame) {
            this.onNewFrame = true;
            if(!newFrame) return;
            if(!newFrame.alwaysSaveState) {
                newFrame.wickObjects.forEach(function (child) {
                    wickPlayer.resetStateOfObject(child);
                });
            }
            this.getAllActiveChildObjects().forEach(function (child) {
                child.justEnteredFrame = true;
            });
        }
    }

}*/
