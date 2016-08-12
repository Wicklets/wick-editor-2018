/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var WickObject = function () {

// Internals

    // Unique ID. Must never change after object is first created.
    this.id = null;

    // Identifier
    this.objectName = undefined;

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
    this.currentFrame = null;

    // List of frames, only used by symbols
    this.frames = undefined;

};

WickObject.createNewRootObject = function () {
    var rootObject = new WickObject("ROOT_NO_PARENT");
    rootObject.id = 0;
    rootObject.isSymbol = true;
    rootObject.isRoot = true;
    rootObject.currentFrame = 0;
    rootObject.frames = [new WickFrame()];
    rootObject.left = 0;
    rootObject.top = 0;
    rootObject.opacity = 1.0;
    return rootObject;
}

WickObject.fromJSON = function (jsonString) {
    // Parse JSON
    var newWickObject = JSON.parse(jsonString);

    // Put prototypes back on object ('class methods'), they don't get JSONified on project export.
    WickObjectUtils.putWickObjectPrototypeBackOnObject(newWickObject);

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
            newWickObject.left += jsonArrayObject.groupPosition.x;
            newWickObject.top  += jsonArrayObject.groupPosition.y;
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

    }
}

WickObject.fromImage = function (imgSrc, callback) {

    var fileImage = new Image();
    fileImage.src = imgSrc;

    fileImage.onload = function() {

        var obj = new WickObject();

        obj.setDefaultPositioningValues();
        obj.width = fileImage.width / window.devicePixelRatio;
        obj.height = fileImage.height / window.devicePixelRatio;
        obj.imageData = fileImage.src;

        callback(obj);
    }

}

WickObject.fromAnimatedGIF = function (gifData, callback) {

    var gifSymbol = new WickObject();
    gifSymbol.setDefaultPositioningValues();
    gifSymbol.left = window.innerWidth /2;
    gifSymbol.top  = window.innerHeight/2;
    gifSymbol.setDefaultSymbolValues();

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
                    gifSymbol.addEmptyFrame(frameIndex);
                    gifSymbol.frames[frameIndex].wickObjects.push(o);

                    if(frameIndex == framesDataURLs.length-1) {
                        gifSymbol.width  = gifSymbol.frames[0].wickObjects[0].width;
                        gifSymbol.height = gifSymbol.frames[0].wickObjects[0].height;
                        callback(gifSymbol);
                    }
                }; }) (i)
            );
        }
    });

}

WickObject.fromSVG = function (svgData, callback) {
    var svgWickObject = new WickObject();

    svgWickObject.setDefaultPositioningValues();

    svgWickObject.svgData = {};
    svgWickObject.svgData.svgString = svgData.svgString;
    svgWickObject.svgData.fillColor = svgData.fillColor;

    fabric.loadSVGFromString(svgData.svgString, function(objects, options) {
        var referencePathFabricObj = objects[0];
        svgWickObject.width = referencePathFabricObj.width;
        svgWickObject.height = referencePathFabricObj.height;
        callback(svgWickObject);
    });
}

// Used for old straight-to-rasterized paintbrush
WickObject.fromFabricPath = function (fabricPath, callback) {
    fabricPath.cloneAsImage(function(clone) {
        var imgSrc = clone._element.currentSrc || clone._element.src;

        var left = fabricPath.left - clone.width/2/window.devicePixelRatio;
        var top  = fabricPath.top - clone.height/2/window.devicePixelRatio;

        WickObject.fromImage(
            imgSrc, 
            function (obj) {
                obj.x = left;
                obj.y = top;
                callback(obj)
            }
        );
    });
}

WickObject.fromText = function (text) {
    var obj = new WickObject();

    obj.setDefaultPositioningValues();

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

    var fabricReferenceText = new fabric.Text(obj.fontData.text, obj.fontData);
    obj.width = fabricReferenceText.width;
    obj.height = fabricReferenceText.height;

    return obj;
}

WickObject.fromHTML = function (text) {
    VerboseLog.error("WickObject.fromHTML not updated yet...");
    /*var htmlSnippetWickObject = new WickObject(parentObject);

    htmlSnippetWickObject.setDefaultPositioningValues();
    htmlSnippetWickObject.htmlData = '<iframe width="560" height="315" src="https://www.youtube.com/embed/AxZ6RG5UeiU" frameborder="0" allowfullscreen></iframe>';
    htmlSnippetWickObject.left = window.innerWidth/2;
    htmlSnippetWickObject.top = window.innerHeight/2;

    htmlSnippetWickObject.parentObject = this.currentObject;

    this.fabricInterface.addWickObjectToCanvas(htmlSnippetWickObject);

    this.syncEditorWithfabricInterface();
    this.fabricInterface.syncWithEditor();*/
}

WickObject.fromAudioFile = function (audioData) {
    var audioWickObject = new WickObject();

    audioWickObject.setDefaultPositioningValues();
    audioWickObject.audioData = audioData;
    audioWickObject.autoplaySound = true;
    audioWickObject.left = window.innerWidth/2;
    audioWickObject.top = window.innerHeight/2;

    return audioWickObject;
}

WickObject.createSymbolFromWickObjects = function (left, top, wickObjects) {
    var symbol = new WickObject();

    symbol.left = left;
    symbol.top = top;
    symbol.setDefaultPositioningValues();
    symbol.setDefaultSymbolValues();

    // Multiple objects are selected, put them all in the new symbol
    for(var i = 0; i < wickObjects.length; i++) {
        symbol.frames[0].wickObjects[i] = wickObjects[i];

        symbol.frames[0].wickObjects[i].left = wickObjects[i].left - symbol.left;
        symbol.frames[0].wickObjects[i].top  = wickObjects[i].top - symbol.top;
    }

    return symbol;

}

WickObject.prototype.setDefaultPositioningValues = function () {

    this.scaleX =  1;
    this.scaleY =  1;
    this.angle  =  0;
    this.flipX  =  false;
    this.flipY  =  false;
    this.opacity = 1;

}

WickObject.prototype.setDefaultSymbolValues = function () {

    this.isSymbol = true;
    this.currentFrame = 0;
    this.frames = [new WickFrame()];

}

WickObject.prototype.getCurrentFrame = function() {
    return this.frames[this.currentFrame];
}

WickObject.prototype.addEmptyFrame = function(newFrameIndex) {
    this.frames[newFrameIndex] = new WickFrame();
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

        this.forEachChildObject(function(currObj) {
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

/* Used to properly position symbols in fabric */
WickObject.prototype.getSymbolCornerPosition = function () {

    if(!this.isSymbol) {
        VerboseLog.error("getSymbolCornerPosition() called on non-symbol")
        return null;
    }

    var leftmostLeft = null;
    var topmostTop = null;

    this.forEachFirstFrameChildObject(function (currObj) {
        if(leftmostLeft === null || currObj.x < leftmostLeft) {
            leftmostLeft = currObj.x;
        }

        if(topmostTop === null || currObj.y < topmostTop) {
            topmostTop = currObj.y;
        }
    });

    return {x:leftmostLeft, y:topmostTop};

}

WickObject.prototype.getAbsolutePosition = function () {
    if(this.isRoot) {
        return {
            x: 0, 
            y: 0};
    } else {
        var parentPosition = this.parentObject.getAbsolutePosition();
        return {
            x: this.x + parentPosition.x, 
            y: this.y + parentPosition.y};
    }
}

/* Encodes scripts to avoid JSON format problems */
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
        this.forEachChildObject(function(currObj) {
            currObj.encodeStrings();
        });
    }

}

/* Decodes scripts back to human-readble and eval()-able format */
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
        this.forEachChildObject(function(currObj) {
            currObj.decodeStrings();
        });
    }

}

WickObject.prototype.getAsJSON = function () {
    // Get rid of the ID because the JSON data of this object doesn't exist in the project.
    var oldID = this.id;
    this.id = undefined;

    // Encode scripts to avoid JSON format problems
    this.encodeStrings();

    var JSONWickObject = JSON.stringify(this, WickObjectUtils.JSONReplacer);

    // Put prototypes back on object ('class methods'), they don't get JSONified on project export.
    WickObjectUtils.putWickObjectPrototypeBackOnObject(this);

    // Decode scripts back to human-readble and eval()-able format
    this.decodeStrings();

    // Put ID back on
    this.id = oldID;

    return JSONWickObject;
}

WickObject.prototype.exportAsFile = function () {

    if(this.isSymbol) {
        var blob = new Blob([this.getAsJSON()], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "wickobject.json");
        console.log("note: we don't have wickobject import yet.")
        return;
    }

    if(this.imageData) {
        
    }

    console.error("export not supported for this type of wickobject yet");

}

/* Determine if two wick objects collide using rectangular hit detection on their
   farthest border */ 
function rectangularHitDetection(objA, objB) {
    var objAAbsPos = objA.getAbsolutePosition();
    var objBAbsPos = objB.getAbsolutePosition();

    var objAWidth = objA.width * objA.scaleX;
    var objAHeight = objAHeight * objA.scaleY; 

    var objBWidth = objB.width * objB.scaleX; 
    var objBHeight = objB.height * objB.scaleY; 

    var left = objAAbsPos.x < (objBAbsPos.x + objBWidth); 
    var right = (objAAbsPos.x + objAWidth) > objBAbsPos.x; 
    var top = objAAbsPos.y < (objBAbsPos.y + objBHeight); 
    var bottom = (objAAbsPos.y + objA.height) > objBAbsPos.y; 

    return left && right && top && bottom;
}

/* Determine if two wickObjects Collide using circular hit detection from their
   centroid using their full width and height. */ 
function circularHitDetection(objA, objB) {
    var objAAbsPos = objA.getAbsolutePosition();
    var objBAbsPos = objB.getAbsolutePosition();

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

    var otherObjChildren = otherObj.getAllActiveChildObjects();
    if(!otherObj.isSymbol) {
        otherObjChildren.push(otherObj);
    }

    var thisObjChildren = this.getAllActiveChildObjects();
    if(!this.isSymbol) {
        thisObjChildren.push(this); 
    }

    var checkMethod;

    switch (hitTestType) {
        case "rectangles":
            checkMethod = rectangularHitDetection; 
            break; 
        case "point":
            console.log("NYI"); 
            break;
        case "circles":
            checkMethod = circularHitDetection;
            break;
        default:
            checkMethod = rectangularHitDetection; 
    }

    for (var i = 0; i < otherObjChildren.length; i++) {
        for (var j = 0; j <thisObjChildren.length; j++) {
            if (checkMethod(otherObjChildren[i], thisObjChildren[j])) {
                return true; 
            }
        }
    }

    return false; 

}

WickObject.prototype.tryNavigateToFrame = function (frame, callback) {

    if (CheckInput.testNonNegativeInteger(frame)) {

        // Only navigate to an integer frame if it is nonnegative and a valid frame
        if(frame < this.frames.length)
            this.navigateToFrame(frame, callback);
        else
            console.log("Failed to navigate to frame \'" + frame + "\': is not a valid frame.");

    } else if (CheckInput.testString(frame)) {

        // Search for the frame with the correct identifier and navigate if found
        this.navigateToFrameByIdentifier(frame, callback);

    } else {

        console.log("Failed to navigate to frame \'" + frame + "\': is neither a string nor a nonnegative integer");

    }
}

WickObject.prototype.navigateToFrameByIdentifier = function(frameID, callback) {

    for (var f = 0; f < this.frames.length; f++) {

        if(frameID === this.frames[f].identifier) {
            this.navigateToFrame(f, callback);
            return;
        }
    }

    console.log("Failed to navigate to frame \'" + frameID + "\': is neither a string nor a nonnegative integer");
}

WickObject.prototype.navigateToFrame = function (frame, callback) {

    if(!this.isSymbol) {
        VerboseLog.error("gotoPrevFrame called on wickobject that isn't a symbol!")
        return;
    }
    
    var oldFrame = this.currentFrame;

    this.currentFrame = frame;

    if(oldFrame != this.currentFrame) {
        this.forEachActiveChildObject(function(child) {
            child.onLoadScriptRan = false;
        });
    }

    callback();
}

WickObject.prototype.play = function (frame) {

    if(!this.isSymbol) {
        VerboseLog.error("play called on wickobject that isn't a symbol!")
        return;
    }

    var oldFrame = this.currentFrame;

    this.isPlaying = true;

    if(oldFrame != this.currentFrame) {
        this.forEachActiveChildObject(function(child) {
            child.onLoadScriptRan = false;
        });
    }
}

WickObject.prototype.stop = function (frame) {

    if(!this.isSymbol) {
        VerboseLog.error("stop called on wickobject that isn't a symbol!")
        return;
    }

    this.isPlaying = false;
}

WickObject.prototype.gotoAndPlay = function (frame) {

    if(!this.isSymbol) {
        VerboseLog.error("gotoAndPlay called on wickobject that isn't a symbol!")
        return;
    }

    this.tryNavigateToFrame(frame, function() {
        this.isPlaying = true;
    });
    
}

WickObject.prototype.gotoAndStop = function (frame) {

    if(!this.isSymbol) {
        VerboseLog.error("gotoAndStop called on wickobject that isn't a symbol!")
        return;
    }
    
    this.tryNavigateToFrame(frame, function() {
        this.isPlaying = false;
    });

}

WickObject.prototype.gotoNextFrame = function () {

    if(!this.isSymbol) {
        VerboseLog.error("gotoNextFrame called on wickobject that isn't a symbol!")
        return;
    }

    var oldFrame = this.currentFrame;

    this.currentFrame ++;
    if(this.currentFrame >= this.frames.length) {
        this.currentFrame = this.frames.length-1;
    }

    if(oldFrame != this.currentFrame) {
        this.forEachActiveChildObject(function(child) {
            child.onLoadScriptRan = false;
        });
    }
}

WickObject.prototype.gotoPrevFrame = function () {

    if(!this.isSymbol) {
        VerboseLog.error("gotoPrevFrame called on wickobject that isn't a symbol!")
        return;
    }

    var oldFrame = this.currentFrame;

    this.currentFrame --;
    if(this.currentFrame < 0) {
        this.currentFrame = 0;
    }

    if(oldFrame != this.currentFrame) {
        this.forEachActiveChildObject(function(child) {
            child.onLoadScriptRan = false;
        });
    }
}

/* Return all child objects of a parent object */
WickObject.prototype.getAllChildObjects = function () {

    if (!this.isSymbol) {
        return []; 
    }

    var children = [];
    for (var f = 0; f < this.frames.length; f++) {
        for (var o = 0; o < this.frames[f].wickObjects.length; o++) {
            children.push(this.frames[f].wickObjects[o])
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
    var currFrame = this.currentFrame;
    for (var o = 0; o < this.frames[currFrame].wickObjects.length; o++) {
        children.push(this.frames[currFrame].wickObjects[o]);
    }
    return children; 
}

/* Call callback function for every child object in this object */
WickObject.prototype.forEachChildObject = function (callback) {
    for(var f = 0; f < this.frames.length; f++) {
        for(var o = 0; o < this.frames[f].wickObjects.length; o++) {
            callback(this.frames[f].wickObjects[o]);
        }
    }
}

/* Call callback function for every child object in this object's current frame */
WickObject.prototype.forEachActiveChildObject = function (callback) {
    var currFrame = this.currentFrame;
    for(var o = 0; o < this.frames[currFrame].wickObjects.length; o++) {
        callback(this.frames[currFrame].wickObjects[o]);
    }
}

/* Call callback function for every child object in this object's first frame */
WickObject.prototype.forEachFirstFrameChildObject = function (callback) {
    for(var o = 0; o < this.frames[0].wickObjects.length; o++) {
        callback(this.frames[0].wickObjects[o]);
    }
}

/* Excludes children of children */
WickObject.prototype.getTotalNumChildren = function () {
    var count = 0;
    for(var f = 0; f < this.frames.length; f++) {
        for(var o = 0; o < this.frames[f].wickObjects.length; o++) {
            count++;
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

    this.forEachChildObject(function(child) {
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
    this.forEachActiveChildObject(function(child) {
        if(child.id == id) {
            var index = that.getCurrentFrame().wickObjects.indexOf(child);
            that.getCurrentFrame().wickObjects.splice(index, 1);
        }
        child.removeChildByID(id);
    }); 
}

WickObject.prototype.getLargestID = function (id) {
    if(!this.isSymbol) {
        return this.id;
    }

    var largestID = 0;

    if(this.id > largestID) {
        largestID = this.id;
    }
    this.forEachChildObject(function(child) {
        var subLargestID = child.getLargestID();

        if(subLargestID > largestID) {
            largestID = subLargestID;
        }
    }); 

    return largestID;
}

WickObject.prototype.childWithIDIsActive = function (id) {

    var match = false;

    this.forEachActiveChildObject(function(child) {
        if(child.id == id) {
            match = true;
        }
    });

    return match;

}   

WickObject.prototype.regenerateParentObjectReferences = function() {

    var parentObject = this;

    if(this.isSymbol) {

        // Recursively regenerate parent object references of all objects inside this symbol.

        for(var f = 0; f < this.frames.length; f++) {
            var frame = this.frames[f];
            for (var o = 0; o < frame.wickObjects.length; o++) {
                frame.wickObjects[o].parentObject = parentObject;
                frame.wickObjects[o].regenerateParentObjectReferences();
            }
        }
    }

}

WickObject.prototype.removeParentObjectReferences = function() {

    this.parentObject = undefined;

    if(this.isSymbol) {

        // Recursively remove parent object references of all objects inside this symbol.

        for(var f = 0; f < this.frames.length; f++) {
            var frame = this.frames[f];
            for (var o = 0; o < frame.wickObjects.length; o++) {
                frame.wickObjects[o].removeParentObjectReferences();
            }
        }
    }

}

var WickObjectUtils = (function () {

    var utils = { };

    // This is supposedly a nasty thing to do - think about possible alternatives for IE and stuff
    utils.putWickObjectPrototypeBackOnObject = function (obj) {

        // Put the prototype back on this object
        obj.__proto__ = WickObject.prototype;

        // Recursively put the prototypes back on the children objects
        if(obj.isSymbol) {
            obj.forEachChildObject(function(currObj) {
                utils.putWickObjectPrototypeBackOnObject(currObj);
            });
        }
    }

    // Use to avoid JSON.stringify()ing circular objects
    utils.JSONReplacer = function(key, value) {
      if (key=="parentObject") {
          return undefined;
      } else {
        return value;
        }
    }

    return utils;

})();

