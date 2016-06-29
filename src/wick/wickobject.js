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
    this.fontData = undefined;
    this.htmlData = undefined;

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
    gifSymbol.setDefaultSymbolValues();

    var gif = document.getElementById("gifImportDummyElem");
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
                    o.left = window.innerWidth/2;
                    o.top = window.innerHeight/2;
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
    var htmlSnippetWickObject = new WickObject(parentObject);

    htmlSnippetWickObject.setDefaultPositioningValues();
    htmlSnippetWickObject.htmlData = '<iframe width="560" height="315" src="https://www.youtube.com/embed/AxZ6RG5UeiU" frameborder="0" allowfullscreen></iframe>';
    htmlSnippetWickObject.left = window.innerWidth/2;
    htmlSnippetWickObject.top = window.innerHeight/2;

    htmlSnippetWickObject.parentObject = this.currentObject;

    this.fabricCanvas.addWickObjectToCanvas(htmlSnippetWickObject);

    this.syncEditorWithFabricCanvas();
    this.syncFabricCanvasWithEditor();
}

WickObject.fromAudioFile = function (audioData, parentObject) {
    var audioWickObject = new WickObject(parentObject);

    audioWickObject.setDefaultPositioningValues();
    audioWickObject.audioData = audioData;
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

        symbol.frames[0].wickObjects[i].left = wickObjects[i].left;
        symbol.frames[0].wickObjects[i].top  = wickObjects[i].top;
    }

    symbol.fixSymbolPosition();

    return symbol;

}

WickObject.prototype.setDefaultPositioningValues = function () {

    this.scaleX = 1;
    this.scaleY = 1;
    this.angle  = 0;
    this.flipX  = false;
    this.flipY  = false;

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
   fixSymbolPosition shifts everything over so that the symbol will always be at the 
   same absolute position. */
WickObject.prototype.fixSymbolPosition = function () {

    if(this.isSymbol) {
        var leftmostLeft = null;
        var topmostTop = null;

        WickObjectUtils.forEachFirstFrameChildObject(this, function (currObj) {
            if(!leftmostLeft || currObj.left < leftmostLeft) {
                leftmostLeft = currObj.left;
            }

            if(!topmostTop || currObj.top < topmostTop) {
                topmostTop = currObj.top;
            }
        });

        // Only set left/top if there were actually children in the symbol
        if(leftmostLeft && topmostTop) {
            this.left -= leftmostLeft;
            this.top -= topmostTop;
        }
    }

}

/* */
var encodeString = function (str) {
    var newStr = str;
    newStr = encodeURI(str);
    newStr = newStr.replace(/'/g, "%27");
    return newStr;
}

/* */
var decodeString = function (str) {
    var newStr = str;
    newStr = newStr.replace(/%27/g, "'");
    newStr = decodeURI(str);
    return newStr;
}

/* Encodes scripts to avoid JSON format problems */
WickObject.prototype.encodeStrings = function () {

    if(this.wickScripts) {
        for (var key in this.wickScripts) {
            this.wickScripts[key] = encodeString(this.wickScripts[key]);
        }
    }

    if(this.fontData) {
        this.fontData.text = encodeString(this.fontData.text);
    }

    if(this.isSymbol) {
        WickObjectUtils.forEachChildObject(this, function(currObj) {
            currObj.encodeStrings();
        });
    }

}

/* Decodes scripts back to human-readble and eval()-able format */
WickObject.prototype.decodeStrings = function () {
    
    if(this.wickScripts) {
        for (var key in this.wickScripts) {
            this.wickScripts[key] = decodeString(this.wickScripts[key])
        }
    }

    if(this.fontData) {
        this.fontData.text = decodeString(this.fontData.text);
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

    return utils;

})();

