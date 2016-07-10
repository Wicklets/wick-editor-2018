/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/*****************************
    Object 
*****************************/

var WickObject = function (parentObject) {

    if(!parentObject) {
        VerboseLog.error("WOAH BUDDY ALL WICKOBJECTS NEED A PARENT. EXCEPT FOR ROOT.")
    }

// Internals

    // Used for debugging.
    this.objectName = undefined;

    // Note that the root object is the only object with parentObject as null.
    this.parentObject = parentObject;

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
    rootObject.isSymbol = true;
    rootObject.isRoot = true;
    rootObject.currentFrame = 0;
    rootObject.frames = [new WickFrame()];
    rootObject.left = 0;
    rootObject.top = 0;
    rootObject.opacity = 1.0;
    return rootObject;
}

WickObject.fromImage = function (imgSrc, left, top, parentObject, callback) {
    var fileImage = new Image();
    fileImage.src = imgSrc;

    fileImage.onload = function() {

        var newWickObject = new WickObject(parentObject);

        newWickObject.setDefaultPositioningValues();
        newWickObject.width = fileImage.width / window.devicePixelRatio;
        newWickObject.height = fileImage.height / window.devicePixelRatio;
        newWickObject.left = left;
        newWickObject.top = top;

        newWickObject.parentObject = parentObject;
        newWickObject.imageData = fileImage.src;

        callback(newWickObject);
    }
}

WickObject.fromAnimatedGIF = function (gifData, parentObject, callback) {

    var gifSymbol = new WickObject(parentObject);
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
                0, 
                0, 
                gifSymbol, 
                (function(frameIndex) { return function(o) {
                    gifSymbol.addEmptyFrame(frameIndex);
                    gifSymbol.frames[frameIndex].wickObjects.push(o);

                    if(frameIndex == framesDataURLs.length-1) {
                        callback(gifSymbol);
                    }
                }; }) (i)
            );
        }
    });

}

WickObject.fromSVG = function (svgData, parentObject) {
    var svgWickObject = new WickObject(parentObject);

    svgWickObject.setDefaultPositioningValues();
    svgWickObject.svgData = svgData.svgString;
    svgWickObject.width  = svgData.width;
    svgWickObject.height = svgData.height;
    svgWickObject.left = svgData.left;
    svgWickObject.top  = svgData.top;

    return svgWickObject;
}

// Used for old straight-to-rasterized paintbrush
WickObject.fromFabricPath = function (fabricPath, parentObject, callback) {
    fabricPath.cloneAsImage(function(clone) {
        var imgSrc = clone._element.currentSrc || clone._element.src;

        var left = fabricPath.left - clone.width/2/window.devicePixelRatio;
        var top  = fabricPath.top - clone.height/2/window.devicePixelRatio;

        var parentPos = parentObject.getRelativePosition();
        left -= parentPos.left;
        top  -= parentPos.top;

        WickObject.fromImage(
            imgSrc, 
            left, 
            top, 
            parentObject, 
            callback
        );
    });
}

WickObject.fromJSON = function (jsonString, parentObject) {
    // Parse JSON
    var newWickObject = JSON.parse(jsonString);

    // Put prototypes back on object ('class methods'), they don't get JSONified on project export.
    WickObjectUtils.putWickObjectPrototypeBackOnObject(newWickObject);

    // Regenerate parent object references
    // These were removed earlier because JSON can't handle infinitely recursive objects (duh)
    newWickObject.parentObject = parentObject;
    newWickObject.regenerateParentObjectReferences();

    // Decode scripts back to human-readble and eval()-able format
    newWickObject.decodeStrings();

    return newWickObject;
}

WickObject.fromText = function (text, parentObject) {
    var textWickObject = new WickObject(parentObject);

    textWickObject.setDefaultPositioningValues();
    textWickObject.setDefaultFontValues(text);
    textWickObject.left = window.innerWidth /2;
    textWickObject.top  = window.innerHeight/2;

    return textWickObject;
}

WickObject.fromHTML = function (text, parentObject) {
    VerboseLog.error("WickObject.fromHTML not updated yet...");
    /*var htmlSnippetWickObject = new WickObject(parentObject);

    htmlSnippetWickObject.setDefaultPositioningValues();
    htmlSnippetWickObject.htmlData = '<iframe width="560" height="315" src="https://www.youtube.com/embed/AxZ6RG5UeiU" frameborder="0" allowfullscreen></iframe>';
    htmlSnippetWickObject.left = window.innerWidth/2;
    htmlSnippetWickObject.top = window.innerHeight/2;

    htmlSnippetWickObject.parentObject = this.currentObject;

    this.fabricCanvas.addWickObjectToCanvas(htmlSnippetWickObject);

    this.syncEditorWithFabricCanvas();
    this.fabricCanvas.syncWithEditor();*/
}

WickObject.fromAudioFile = function (audioData, parentObject) {
    var audioWickObject = new WickObject(parentObject);

    audioWickObject.setDefaultPositioningValues();
    audioWickObject.audioData = audioData;
    audioWickObject.autoplaySound = true;
    audioWickObject.left = window.innerWidth/2;
    audioWickObject.top = window.innerHeight/2;

    return audioWickObject;
}

WickObject.createSymbolFromWickObjects = function (left, top, wickObjects, parentObject) {
    var symbol = new WickObject(parentObject);

    symbol.left = left;
    symbol.top = top;
    symbol.setDefaultPositioningValues();
    symbol.setDefaultSymbolValues();

    // Multiple objects are selected, put them all in the new symbol
    for(var i = 0; i < wickObjects.length; i++) {
        symbol.frames[0].wickObjects[i] = wickObjects[i];
        symbol.frames[0].wickObjects[i].parentObject = symbol;

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

WickObject.prototype.setDefaultFontValues = function (text) {

    // See http://fabricjs.com/docs/fabric.IText.html for full fabric.js IText definition
    // Note: We will probably want to change 'editable' in order to have dynamic text in the player, but this still needs more research

    this.fontData = {
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

}

WickObject.prototype.getCurrentFrame = function() {
    return this.frames[this.currentFrame];
}

WickObject.prototype.addEmptyFrame = function(newFrameIndex) {
    this.frames[newFrameIndex] = new WickFrame();
}

// Used to prepare project for JSONificaion. 
// (JSON files can't have objects with circular references)
WickObject.prototype.removeParentObjectRefences = function() {

    this.parentObject = null;

    if(this.isSymbol) {

        // Recursively remove parent object references of all objects inside this symbol.

        for(var f = 0; f < this.frames.length; f++) {
            var frame = this.frames[f];
            for (var o = 0; o < frame.wickObjects.length; o++) {
                var wickObject = frame.wickObjects[o];
                wickObject.removeParentObjectRefences();
            }
        }
    }

}

// Used to put parent object references back after they are removed for JSONification
WickObject.prototype.regenerateParentObjectReferences = function() {

    var parentObject = this;

    if(this.isSymbol) {

        // Recursively remove parent object references of all objects inside this symbol.

        for(var f = 0; f < this.frames.length; f++) {
            var frame = this.frames[f];
            for (var o = 0; o < frame.wickObjects.length; o++) {
                frame.wickObjects[o].parentObject = parentObject;
                frame.wickObjects[o].regenerateParentObjectReferences();
            }
        }
    }

}

// Used so that if the renderer
WickObject.prototype.generateSVGCacheImages = function (callback) {

    var that = this;

    if(this.svgData) {

        fabric.loadSVGFromString(this.svgData, function(objects, options) {
            var svgFabricObject = fabric.util.groupSVGElements(objects, options);
            svgFabricObject.cloneAsImage(function(clone) {
                var imgSrc = clone._element.currentSrc || clone._element.src;
                that.svgCacheImageData = imgSrc;
                callback();
            });
        });

    } else if(this.isSymbol) {

        var childrenConverted = 0;
        var nChildren = WickObjectUtils.getTotalNumChildren(that);

        if(nChildren == 0) {
            callback();
        }

        WickObjectUtils.forEachChildObject(this, function(currObj) {
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

// Uses all parent's positions to calculate correct position on canvas
WickObject.prototype.getRelativePosition = function () {

    if(this.isRoot) {
        return {
            top: 0,
            left: 0
        };
    } else {
        var parentPosition = this.parentObject.getRelativePosition();
        return {
            top: this.top + parentPosition.top,
            left: this.left + parentPosition.left
        };
    }

}

/* Fabric js sets the position of the group to the positions of the leftmost+topmost objects 
   by default. So if the leftmost/topmost objects are not at 0,0, this causes problems! 
   This function gives you the offset that must be accounted for so that objects don't shift around */
WickObject.prototype.getSymbolTrueOffset = function () {

    if(!this.isSymbol) {
        VerboseLog.error("getSymbolTrueOffset called on non-symbol wickobject")
        return null;
    }

    var leftmostLeft = null;
    var topmostTop = null;

    WickObjectUtils.forEachFirstFrameChildObject(this, function (currObj) {
        if(leftmostLeft === null || currObj.left < leftmostLeft) {
            leftmostLeft = currObj.left;
        }

        if(topmostTop === null || currObj.top < topmostTop) {
            topmostTop = currObj.top;
        }
    });

    return {left:leftmostLeft, top:topmostTop};

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
        this.svgData = encodeString(this.svgData);
    }

    if(this.isSymbol) {
        WickObjectUtils.forEachChildObject(this, function(currObj) {
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
        this.svgData = decodeString(this.svgData);
    }

    if(this.isSymbol) {
        WickObjectUtils.forEachChildObject(this, function(currObj) {
            currObj.decodeStrings();
        });
    }

}

WickObject.prototype.getAsJSON = function () {
    var oldParentReference = this.parentObject;

    // Remove parent object references 
    // (can't JSONify objects with circular references, player doesn't need them anyway)
    this.removeParentObjectRefences();

    // Encode scripts to avoid JSON format problems
    this.encodeStrings();

    var JSONWickObject = JSON.stringify(this);

    // Put prototypes back on object ('class methods'), they don't get JSONified on project export.
    WickObjectUtils.putWickObjectPrototypeBackOnObject(this);

    // Put parent object references back in all objects
    this.parentObject = oldParentReference;
    this.regenerateParentObjectReferences();

    // Decode scripts back to human-readble and eval()-able format
    this.decodeStrings();

    return JSONWickObject;
}

WickObject.prototype.getAsFile = function () {
    VerboseLog.error("NYI");
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

/* Returns a boolean alerting whether or not this object or any of it's children in frame, 
   have collided with the given object or any of it's children in frame. */
WickObject.prototype.hitTest = function (otherObj, hitTestType) {
    if (otherObj === undefined) {
        return false; 
    }

    var otherObjChildren = WickObjectUtils.getAllActiveChildObjects(otherObj);
    var thisObjChildren = WickObjectUtils.getAllActiveChildObjects(this);

    var checkMethod = rectangularHitDetection; 

    switch (hitTestType) {
        case "rectangles":
            checkMethod = rectangularHitDetection; 
            break; 
        case "point":
            console.log("Nope!"); 
            break;
    }

    if(!otherObj.isSymbol) {
        otherObjChildren.push(otherObj);
    }
    if(!this.isSymbol) {
        thisObjChildren.push(this); 
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

var WickObjectUtils = (function () {

    var utils = { };

    // This is supposedly a nasty thing to do - think about possible alternatives for IE and stuff
    utils.putWickObjectPrototypeBackOnObject = function (obj) {

        // Put the prototype back on this object
        obj.__proto__ = WickObject.prototype;

        // Recursively put the prototypes back on the children objects
        if(obj.isSymbol) {
            WickObjectUtils.forEachChildObject(obj, function(currObj) {
                utils.putWickObjectPrototypeBackOnObject(currObj);
            });
        }
    }

    /* Return all child objects of a parent object */
    utils.getAllChildObjects = function (parentObj) {

        if (!parentObj.isSymbol) {
            return []; 
        }

        var children = [];
        for (var f = 0; f < parentObj.frames.length; f++) {
            for (var o = 0; o < parentObj.frames[f].wickObjects.length; o++) {
                children.push(parentObj.frames[f].wickObjects[o])
            }
        }
        return children;
    }

    /* Return all child objects in the parent objects current frame. */
    utils.getAllActiveChildObjects = function (parentObj) {

        if (!parentObj.isSymbol) {
            return []; 
        }

        var children = [];
        var currFrame = parentObj.currentFrame;
        for (var o = 0; o < parentObj.frames[currFrame].wickObjects.length; o++) {
            children.push(parentObj.frames[currFrame].wickObjects[o]);
        }
        return children; 
    }

    /* Call callback function for every child object in parentObj */
    utils.forEachChildObject = function (parentObj, callback) {
        for(var f = 0; f < parentObj.frames.length; f++) {
            for(var o = 0; o < parentObj.frames[f].wickObjects.length; o++) {
                callback(parentObj.frames[f].wickObjects[o]);
            }
        }
    }

    /* Call callback function for every child object in parentObj's current frame */
    utils.forEachActiveChildObject = function (parentObj, callback) {
        var currFrame = parentObj.currentFrame;
        for(var o = 0; o < parentObj.frames[currFrame].wickObjects.length; o++) {
            callback(parentObj.frames[currFrame].wickObjects[o]);
        }
    }

    /* Call callback function for every child object in parentObj's first frame */
    utils.forEachFirstFrameChildObject = function (parentObj, callback) {
        for(var o = 0; o < parentObj.frames[0].wickObjects.length; o++) {
            callback(parentObj.frames[0].wickObjects[o]);
        }
    }

    /* Excludes children of children */
    utils.getTotalNumChildren = function (parentObj) {
        var count = 0;
        for(var f = 0; f < parentObj.frames.length; f++) {
            for(var o = 0; o < parentObj.frames[f].wickObjects.length; o++) {
                count++;
            }
        }
        return count;
    }

    return utils;

})();

