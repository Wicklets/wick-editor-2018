/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/*************************
     Constructors
*************************/

var WickObject = function () {

// Internals

    // Unique ID. Must never change after object is first created.
    this.id = null;

    // Identifier
    this.name = undefined;

// Positioning

    this.x = 0;
    this.y = 0;
    this.width = undefined;
    this.height = undefined;
    this.scaleX = 1;
    this.scaleY = 1;
    this.angle = 0;
    this.flipX = false;
    this.flipY = false;
    this.opacity = 1;

// Common

    // Dictionary mapping function names to WickScript object
    this.wickScripts = {
        "onLoad" : "// onLoad\n// This script runs once when this object enters the scene.\n",
        "onClick" : "// onClick\n// This script runs when this object is clicked on.\n",
        "onUpdate": "// onUpdate\n// This script runs repeatedly whenever this object is in the scene.\n",
        "onKeyDown": "// onKeyDown\n// This script runs whenever a key is pressed.\n"
    };

// Static

    // Data, only used by static objects
    this.imageData = undefined;
    this.fontData  = undefined;
    this.htmlData  = undefined;
    this.svgData   = undefined;

// Symbols

    // See design docs for how objects and symbols work.
    this.isSymbol = false;

    // Used to keep track of what frame is being edited
    this.playheadPosition = null;
    this.currentLayer = null;

    // List of layers, only used by symbols
    this.layers = undefined;

};

WickObject.createNewSymbol = function () {

    var symbol = new WickObject();

    symbol.isSymbol = true;
    symbol.playheadPosition = 0;
    symbol.currentLayer = 0;
    symbol.layers = [new WickLayer()];

    return symbol;

}

WickObject.createNewRootObject = function () {
    var rootObject = new WickObject("ROOT_NO_PARENT");
    rootObject.id = 0;
    rootObject.isSymbol = true;
    rootObject.isRoot = true;
    rootObject.playheadPosition = 0;
    rootObject.currentLayer = 0;
    rootObject.layers = [new WickLayer()];
    rootObject.x = 0;
    rootObject.y = 0;
    rootObject.opacity = 1.0;
    return rootObject;
}

WickObject.fromJSON = function (jsonString) {
    // Parse JSON
    var newWickObject = JSON.parse(jsonString);

    // Put prototypes back on object ('class methods'), they don't get JSONified on project export.
    WickObject.addPrototypes(newWickObject);

    // Decode scripts back to human-readble and eval()-able format
    newWickObject.decodeStrings();

    return newWickObject;
}

WickObject.fromJSONArray = function (jsonArrayObject, callback) {
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

    callback(newWickObjects);
}

WickObject.fromFile = function (file, fileType, callback) {

    if (['image/png', 'image/jpeg', 'image/bmp'].indexOf(fileType) != -1) {

        var data = file;
        var fr = new FileReader;
        fr.onloadend = function() {
            WickObject.fromImage(
                fr.result, 
                function(newWickObject) {
                    callback(newWickObject);
                });
        };
        fr.readAsDataURL(data);

    } else if (fileType == 'application/json') {

        // TODO

    } else if (fileType == 'image/gif') {

        var data = file;
        var fr = new FileReader;
        fr.onloadend = function() {
            WickObject.fromAnimatedGIF(
                fr.result,
                function(newWickObject) { callback(newWickObject) });
        };
        fr.readAsDataURL(data);

    } else if (fileType == 'text/plain') {

        var newWickObject = WickObject.fromText(file);
        callback(newWickObject);

    } else if(['audio/mp3', 'audio/wav', 'audio/ogg'].indexOf(file.type) != -1) {

        var dataURLReader = new FileReader();
        dataURLReader.onload = (function(theFile) { return function(e) {

            var newWickObject = WickObject.fromAudioFile(e.target.result);
            newWickObject.width = 100;
            newWickObject.height = 100;
            callback(newWickObject);

        }; })(file);
        dataURLReader.readAsDataURL(file);

    } else if (fileType == 'text/html') {

        var reader = new FileReader();
        reader.onload = function(event) {
            var newWickObject = WickObject.fromHTML(event.target.result);
            callback(newWickObject);
        };

        reader.readAsText(file);

    } else {

        console.error("Unsupported filetype in WickObject.fromFile(): " + file.type);

    }
}

WickObject.fromImage = function (imgSrc, callback) {

    var fileImage = new Image();
    fileImage.src = imgSrc;
    
    fileImage.onload = function() {

        var obj = new WickObject();

        obj.width = fileImage.width / window.devicePixelRatio;
        obj.height = fileImage.height / window.devicePixelRatio;
        obj.imageData = fileImage.src;

        callback(obj);
    }

}

WickObject.fromAnimatedGIF = function (gifData, callback) {

    var gifSymbol = WickObject.createNewSymbol();
    gifSymbol.x = window.innerWidth /2;
    gifSymbol.y  = window.innerHeight/2;

    //var gif = document.getElementById("gifImportDummyElem");
    var newGifEl = document.createElement("img"); 
    newGifEl.id = "gifImportDummyElem";
    document.body.appendChild(newGifEl); 
    var gif = document.getElementById('gifImportDummyElem')
    gif.setAttribute('src', gifData);
    gif.setAttribute('height', '467px');
    gif.setAttribute('width', '375px');

    var superGif = new SuperGif({ gif: gif } );
    superGif.load(function () {

        var framesDataURLs = superGif.getFrameDataURLs();
        for(var i = 0; i < framesDataURLs.length; i++) {

            WickObject.fromImage(
                framesDataURLs[i], 
                (function(frameIndex) { return function(o) {
                    gifSymbol.layers[0].frames[frameIndex].wickObjects.push(o);
                    
                    if(frameIndex == framesDataURLs.length-1) {
                        gifSymbol.width  = gifSymbol.layers[0].frames[0].wickObjects[0].width;
                        gifSymbol.height = gifSymbol.layers[0].frames[0].wickObjects[0].height;
                        callback(gifSymbol);
                    } else {
                        gifSymbol.layers[0].addNewFrame();
                    }
                }; }) (i)
            );
        }
    });

}

WickObject.fromSVG = function (svgData) {
    var svgWickObject = new WickObject();

    svgWickObject.svgData = {};
    svgWickObject.svgData.svgString = svgData.svgString;
    svgWickObject.svgData.fillColor = svgData.fillColor;

    return svgWickObject;
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
        cursorDelay: 1000,
        cursorWidth: 2,
        editable: true,
        //editingBorderColor: undefined,
        fontFamily: 'arial',
        fontSize: 40,
        fontStyle: 'normal',
        fontWeight: 'normal',
        hasBorders: false,
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

WickObject.fromHTML = function (text) {
    
    var htmlSnippetWickObject = new WickObject();

    htmlSnippetWickObject.htmlData = text;
    htmlSnippetWickObject.x = window.innerWidth/2;
    htmlSnippetWickObject.y = window.innerHeight/2;

    return htmlSnippetWickObject;
}

WickObject.fromAudioFile = function (audioData) {
    var audioWickObject = new WickObject();

    audioWickObject.audioData = audioData;
    audioWickObject.autoplaySound = true;
    audioWickObject.loopSound = false;
    audioWickObject.x = window.innerWidth/2;
    audioWickObject.y = window.innerHeight/2;

    return audioWickObject;
}

WickObject.createSymbolFromWickObjects = function (wickObjects) {

    // Create a new symbol and add every object in wickObjects as children

    var symbol = WickObject.createNewSymbol();

    for(var i = 0; i < wickObjects.length; i++) {
        symbol.layers[0].frames[0].wickObjects[i] = wickObjects[i];

        symbol.layers[0].frames[0].wickObjects[i].x = wickObjects[i].x - symbol.x;
        symbol.layers[0].frames[0].wickObjects[i].y = wickObjects[i].y - symbol.y;
    }

    symbol.width  = symbol.layers[0].frames[0].wickObjects[0].width;
    symbol.height = symbol.layers[0].frames[0].wickObjects[0].height;

    // Adjust symbol position and children positions such that the origin of the symbol is the top-left corner of the symbol

    var corner = symbol.getSymbolCornerPosition();

    symbol.layers[0].frames[0].wickObjects.forEach(function (obj) {
        obj.x -= corner.x;
        obj.y -= corner.y;
    });

    symbol.x += corner.x;
    symbol.y += corner.y;

    return symbol;

}

WickObject.addPrototypes = function (obj) {

    // Put the prototype back on this object
    obj.__proto__ = WickObject.prototype;

    // Recursively put the prototypes back on the children objects
    if(obj.isSymbol) {
        // Put the layer prototype on on this objects layers
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

/*************************
     Collision Detection
*************************/

/* Returns a boolean alerting whether or not this object or any of it's children in frame, 
   have collided with the given object or any of it's children in frame. */
WickObject.prototype.hitTest = function (otherObj, hitTestType) {
    if (otherObj === undefined) {
        return false; 
    }

    // Generate lists of all children of both objects

    var otherObjChildren = otherObj.getAllActiveChildObjects();
    if(!otherObj.isSymbol) {
        otherObjChildren.push(otherObj);
    }

    var thisObjChildren = this.getAllActiveChildObjects();
    if(!this.isSymbol) {
        thisObjChildren.push(this); 
    }

    // Load the collition detection function for the type of collision we want to check for

    var checkMethod;
    if(!hitTestType) {
        // Use default (rectangular hittest) if no hitTestType is provided
        checkMethod = WickObjectCollisionDetection["rectangles"];
    } else {
        checkMethod = WickObjectCollisionDetection[hitTestType];
    }

    // Ready to go! Check for collisions!!

    for (var i = 0; i < otherObjChildren.length; i++) {
        for (var j = 0; j < thisObjChildren.length; j++) {
            if (checkMethod(otherObjChildren[i], thisObjChildren[j])) {
                return true; 
            }
        }
    }

    return false; 

}

/*************************
     Timeline Control
*************************/

// If the frame's length > 1, always return the playhead position of at the frame's beginning
WickObject.prototype.getPlayheadPositionAtFrame = function (frame) {

    var playheadPositionAtFrame = null;
    var frameCounter = 0;

    this.layers.forEach(function (l) {
        frameCounter = 0;
        l.frames.forEach(function (f) {
            if(f === frame) {
                playheadPositionAtFrame = frameCounter;
            }
            frameCounter += f.frameLength;
        });
    });

    return playheadPositionAtFrame;

}

WickObject.prototype.getFrameAtPlayheadPosition = function(pos) {
    var layer = this.getCurrentLayer();
    var counter = 0;

    for(var f = 0; f < layer.frames.length; f++) {
        var frame = layer.frames[f];
        for(var i = 0; i < frame.frameLength; i++) {
            if(counter == pos) {
                return frame;
            }
            counter++;
        }
    }

    // Playhead isn't over a frame on the current layer.
    return null;
}

WickObject.prototype.getCurrentFrame = function() {

    return this.getFrameAtPlayheadPosition(this.playheadPosition);

}

WickObject.prototype.getCurrentLayer = function() {
    return this.layers[this.currentLayer];
}

WickObject.prototype.getFrameByIdentifier = function (id) {

    var foundFrame = null;

    this.layers.forEach(function (layer) {
        layer.frames.forEach(function (frame) {
            if(frame.identifier === id) {
                foundFrame = frame;
            }
        });
    });

    return foundFrame;

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

WickObject.prototype.addNewLayer = function () {
    this.layers.push(new WickLayer());
}

WickObject.prototype.play = function () {

    if(!this.isSymbol) {
        throw "play called on wickobject that isn't a symbol!";
        return;
    }

    this.isPlaying = true;
}

WickObject.prototype.stop = function () {

    if(!this.isSymbol) {
        throw "stop called on wickobject that isn't a symbol!";
        return;
    }

    this.isPlaying = false;
}

WickObject.prototype.gotoFrame = function (frame) {
    if (CheckInput.isNonNegativeInteger(frame)) {

        // Only navigate to an integer frame if it is nonnegative and a valid frame
        if(frame < this.getCurrentLayer().frames.length)
            this.playheadPosition = frame;
        else
            throw "Failed to navigate to frame \'" + frame + "\': is not a valid frame.";

    } else if (CheckInput.isString(frame)) {

        // Search for the frame with the correct identifier and navigate if found
        var newFrame = this.getFrameByIdentifier(frame);

        if(newFrame)
            this.playheadPosition = this.getPlayheadPositionAtFrame(newFrame);
        else
            throw "Failed to navigate to frame \'" + frame + "\': is not a valid frame.";

    } else {

        throw "Failed to navigate to frame \'" + frame + "\': is neither a string nor a nonnegative integer";

    }
}

WickObject.prototype.gotoAndPlay = function (frame) {

    if(!this.isSymbol) {
        throw "gotoAndPlay called on wickobject that isn't a symbol!";
        return;
    }

    this.gotoFrame(frame);
    this.isPlaying = true;
    
}

WickObject.prototype.gotoAndStop = function (frame) {

    if(!this.isSymbol) {
        throw "gotoAndStop called on wickobject that isn't a symbol!";
        return;
    }
    
    this.gotoFrame(frame);
    this.isPlaying = false;

}

WickObject.prototype.gotoNextFrame = function () {

    if(!this.isSymbol) {
        throw "gotoNextFrame called on wickobject that isn't a symbol!";
        return;
    }

    this.playheadPosition ++;
    var totalLength = this.layers[this.currentLayer.getTotalLength];
    if(this.playheadPosition >= totalLength) {
        this.playheadPosition = totalLength-1;
    }

}

WickObject.prototype.gotoPrevFrame = function () {

    if(!this.isSymbol) {
        throw "gotoPrevFrame called on wickobject that isn't a symbol!";
        return;
    }

    this.playheadPosition --;
    if(this.playheadPosition < 0) {
        this.playheadPosition = 0;
    }
}

/*************************
     Children utils
*************************/

/* Return all child objects of a parent object */
WickObject.prototype.getAllChildObjects = function () {

    if (!this.isSymbol) {
        return []; 
    }

    var children = [];
    for(var l = 0; l < this.layers.length; l++) {
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
    var currentFrame = this.getCurrentFrame();
    if(currentFrame) {
        for(var o = 0; o < currentFrame.wickObjects.length; o++) {
            children.push(currentFrame.wickObjects[o]);
        }
    }
    return children; 
}

// Use this to render unselectable objects in Fabric
WickObject.prototype.getAllInactiveSiblings = function () {

    if(!this.parentObject) {
        return [];
    }

    var that = this;
    var siblings = [];
    this.parentObject.getAllActiveChildObjects().forEach(function (child) {
        if(child.id !== that.id) {
            siblings.push(child);
        }
    });
    siblings = siblings.concat(this.parentObject.getAllInactiveSiblings());

    return siblings;

}

//
WickObject.prototype.getObjectsOnFirstFrame = function () {

    var objectsOnFirstFrame = [];

    for(var o = 0; o < this.layers[this.currentLayer].frames[0].wickObjects.length; o++) {
        objectsOnFirstFrame.push(this.layers[this.currentLayer].frames[0].wickObjects[o]);
    }

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

WickObject.prototype.getChildByID = function (id) {

    if(!this.isSymbol) {
        if(this.id == id) {
            return this;
        } else {
            return null;
        }
    }

    if(this.isSymbol) {
        if(this.id == id) {
            return this;
        }
    }

    var foundChild = null;

    this.getAllChildObjects().forEach(function(child) {
        if(child.id == id) {
            if(!foundChild) foundChild = child;
        } else {
            if(!foundChild) foundChild = child.getChildByID(id);
        }
    }); 

    return foundChild;
}

WickObject.prototype.removeChildByID = function (id) {

    if(!this.isSymbol) {
        return;
    }

    var that = this;
    this.getAllActiveChildObjects().forEach(function(child) {
        if(child.id == id) {
            var index = that.getCurrentFrame().wickObjects.indexOf(child);
            that.getCurrentFrame().wickObjects.splice(index, 1);
        }
        child.removeChildByID(id);
    }); 
}

/* Used to generate a unique ID for new WickObjects */
WickObject.prototype.getLargestID = function (id) {
    if(!this.isSymbol) {
        return this.id;
    }

    var largestID = 0;

    if(this.id > largestID) {
        largestID = this.id;
    }
    this.getAllChildObjects().forEach(function(child) {
        var subLargestID = child.getLargestID();

        if(subLargestID > largestID) {
            largestID = subLargestID;
        }
    }); 

    return largestID;
}

/*************************
     Positioning stuff
*************************/

/* Used to properly position symbols in fabric */
WickObject.prototype.getSymbolCornerPosition = function () {

    if(!this.isSymbol) {
        return {x:0, y:0};
    }

    var leftmostLeft = null;
    var topmostTop = null;

    this.getObjectsOnFirstFrame().forEach(function (child) {
        var checkX, checkY;

        if(child.isSymbol) {
            var symCorner = child.getSymbolCornerPosition();
            checkX = child.x+symCorner.x;
            checkY = child.y+symCorner.y;
        } else {
            checkX = child.x;
            checkY = child.y;
        }

        if(leftmostLeft === null || checkX < leftmostLeft) {
            leftmostLeft = checkX;
        }

        if(topmostTop === null || checkY < topmostTop) {
            topmostTop = checkY;
        }
    });

    return {x:leftmostLeft, y:topmostTop};

}

/* Get the absolute position of this object (i.e., the position not relative to the parents) */
WickObject.prototype.getAbsolutePosition = function () {
    if(this.isRoot) {
        return {
            x: 0, 
            y: 0
        };
    } else {
        var parentPosition = this.parentObject.getAbsolutePosition();
        return {
            x: this.x + parentPosition.x, 
            y: this.y + parentPosition.y
        };
    }
}

/*************************
     Export
*************************/

WickObject.prototype.getAsJSON = function () {
    // Get rid of the ID because the JSON data of this object doesn't exist in the project.
    var oldID = this.id;
    this.id = undefined;

    // Encode scripts to avoid JSON format problems
    this.encodeStrings();

    var JSONWickObject = JSON.stringify(this, WickProjectExporter.JSONReplacer);

    // Put prototypes back on object ('class methods'), they don't get JSONified on project export.
    WickObject.addPrototypes(this);

    // Decode scripts back to human-readble and eval()-able format
    this.decodeStrings();

    // Put ID back on
    this.id = oldID;

    return JSONWickObject;
}

WickObject.prototype.getAsFile = function () {

    if(this.isSymbol) {
        return this.getAsJSON();
        console.log("note: we don't have wickobject import yet.")
        return;
    }

    if(this.imageData) {

    }

    console.error("export not supported for this type of wickobject yet");

}

/* Encodes scripts and strings to avoid JSON format problems */
WickObject.prototype.encodeStrings = function () {

    var encodeString = function (str) {
        var newStr = str;
        newStr = encodeURI(str);
        newStr = newStr.replace(/'/g, "%27");
        return newStr;
    }

    if(this.wickScripts) {
        for (var key in this.wickScripts) {
            this.wickScripts[key] = encodeString(this.wickScripts[key]);
        }
    }

    if(this.fontData) {
        this.fontData.text = encodeString(this.fontData.text);
    }

    if(this.svgData) {
        this.svgData.svgString = encodeString(this.svgData.svgString);
    }

    if(this.isSymbol) {
        this.getAllChildObjects().forEach(function(child) {
            child.encodeStrings();
        });
    }

}

/* Decodes scripts and strings back to human-readble and eval()-able format */
WickObject.prototype.decodeStrings = function () {
    
    var decodeString = function (str) {
        var newStr = str;
        newStr = newStr.replace(/%27/g, "'");
        newStr = decodeURI(str);
        return newStr;
    }
    
    if(this.wickScripts) {
        for (var key in this.wickScripts) {
            this.wickScripts[key] = decodeString(this.wickScripts[key])
        }
    }

    if(this.fontData) {
        this.fontData.text = decodeString(this.fontData.text);
    }

    if(this.svgData) {
        this.svgData.svgString = decodeString(this.svgData.svgString);
    }

    if(this.isSymbol) {
        this.getAllChildObjects().forEach(function(child) {
            child.decodeStrings();
        });
    }

}

WickObject.prototype.regenerateParentObjectReferences = function() {

    var parentObject = this;

    if(this.isSymbol) {

        // Recursively regenerate parent object references of all objects inside this symbol.
        this.getAllChildObjects().forEach(function(child) {
            child.parentObject = parentObject;
            child.regenerateParentObjectReferences();
        });
    }

}

// Used so that if the renderer can't render SVGs it has an image to fallback to
WickObject.prototype.generateSVGCacheImages = function (callback) {

    var that = this;

    if(this.svgData) {

        fabric.loadSVGFromString(this.svgData.svgString, function(objects, options) {
            objects[0].fill = that.svgData.fillColor;
            var svgFabricObject = fabric.util.groupSVGElements(objects, options);
            svgFabricObject.cloneAsImage(function(clone) {
                var imgSrc = clone._element.currentSrc || clone._element.src;
                that.svgCacheImageData = imgSrc;
                callback();
            });
        });

    } else if(this.isSymbol) {

        var childrenConverted = 0;
        var nChildren = that.getTotalNumChildren();

        if(nChildren == 0) {
            callback();
        }

        this.getAllChildObjects().forEach(function(currObj) {
            currObj.generateSVGCacheImages(function () {
                childrenConverted++;
                if(childrenConverted == nChildren) {
                    callback();
                }
            });
        });
    } else {
        callback();
    }

}
