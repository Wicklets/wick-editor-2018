/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var WickProject = function () {

    // Create the root object. The editor is always editing the root
    // object or its sub-objects and cannot ever leave the root object.
    this.createNewRootObject();

    // Only used by the editor. Keeps track of current object editor is editing.
    this.currentObject = this.rootObject;
    this.rootObject.currentFrame = 0;

    this.name = "NewProject";

    this.onionSkinning = false;
    
    this.width = 720;
    this.height = 480;

    this.borderColor = "#DDDDDD";
    this.backgroundColor = "#FFFFFF";
    this.transparent = false;

    this.pixelPerfectRendering = true;

    this.framerate = 12;

    this.fitScreen = false;

    //this.assets = {};

    this._selection = [];

};

WickProject.prototype.createNewRootObject = function () {
    var rootObject = new WickObject();
    rootObject.isSymbol = true;
    rootObject.isRoot = true;
    rootObject.playheadPosition = 0;
    rootObject.currentLayer = 0;
    var firstLayer = new WickLayer();
    firstLayer.identifier = "Layer 1";
    rootObject.layers = [firstLayer];
    rootObject.x = 0;
    rootObject.y = 0;
    rootObject.opacity = 1.0;
    this.rootObject = rootObject;
    this.rootObject.generateParentObjectReferences();
}

/*****************************
    Assets
*****************************/

/*WickProject.prototype.loadAsset = function (filename, dataURL) {
    // Avoid duplicate names
    var newFilename = filename;
    var i = 2;
    while(this.assets[newFilename]) {
        newFilename = filename + " " + i;
        i++;
    }

    console.log(dataURL.length);
    this.assets[newFilename] = LZString.compressToBase64(dataURL);
    console.log(this.assets[newFilename].length);

    return filename;
}

WickProject.prototype.getAsset = function (filename) {
    return LZString.decompressFromBase64(this.assets[filename]);
}*/

/*****************************
    Import/Export
*****************************/

WickProject.fromFile = function (file, callback) {

    var reader = new FileReader();
    reader.onload = function(e) {
        if (file.type === "text/html") {
            callback(WickProject.fromWebpage(e.target.result));
        } else if (file.type === "application/json") {
            callback(WickProject.fromJSON(e.target.result));
        }
    };
    reader.readAsText(file);

}

WickProject.fromWebpage = function (webpageString) {

    var extractedProjectJSON;

    var webpageStringLines = webpageString.split('\n');
    webpageStringLines.forEach(function (line) {
        if(line.startsWith("<script>WickPlayer.runProject(")) {
            extractedProjectJSON = line.split("'")[1];
        }
    });

    if(!extractedProjectJSON) {
        // Oh no, something went wrong
        console.error("Bundled JSON project not found in specified HTML file (webpageString). The HTML supplied might not be a Wick project, or zach might have changed the way projects are bundled. See WickProject.Exporter.js!");
        return null;
    } else {
        // Found a bundled project's JSON, let's load it!
        return WickProject.fromJSON(extractedProjectJSON);
    }
}

WickProject.fromJSON = function (rawJSONProject) {

    var JSONString = WickProject.Compressor.decompressProject(rawJSONProject);

    // Replace current project with project in JSON
    var projectFromJSON = JSON.parse(JSONString);

    // Put prototypes back on object ('class methods'), they don't get JSONified on project export.
    projectFromJSON.__proto__ = WickProject.prototype;
    WickObject.addPrototypes(projectFromJSON.rootObject);

    // Decode scripts back to human-readble and eval()-able format
    projectFromJSON.rootObject.decodeStrings();

    // Add references to wickobject's parents (optimization)
    projectFromJSON.rootObject.generateParentObjectReferences();

    // Start at the first from of the root object
    projectFromJSON.currentObject = projectFromJSON.rootObject;
    projectFromJSON.rootObject.playheadPosition = 0;
    projectFromJSON.currentObject.currentLayer = 0;

    WickProject.fixForBackwardsCompatibility(projectFromJSON);

    return projectFromJSON;
}

// Backwards compatibility for old Wick projects
WickProject.fixForBackwardsCompatibility = function (project) {
    // WickProject.resolution was replaced with project.width and project.height
    project._selection = [];
    if(!project.width) project.width = project.resolution.x;
    if(!project.height) project.height = project.resolution.y;
    if(!project.transparent) project.transparent = false;
    if(!project.pixelPerfectRendering) project.pixelPerfectRendering = false;

    var allObjectsInProject = project.rootObject.getAllChildObjectsRecursive();
    allObjectsInProject.push(project.rootObject);
    allObjectsInProject.forEach(function (wickObj) {
        // WickObjects no longer store what frame they're on
        wickObj.playheadPosition = 0;

        // WickObject.id was replaced with WickObject.uuid
        if(!wickObj.uuid) wickObj.uuid = random.uuid4();
        wickObj.id = null;

        // Sound WickObjects now have a volume variable
        if(!wickObj.volume) wickObj.volume = 1.0;

        // WickObject.angle was replaced with WickObject.rotation
        if(wickObj.angle !== null && wickObj.rotation === undefined) {
            wickObj.rotation = wickObj.angle;
            wickObj.angle = null;
        }

        if(wickObj.tweens) {
            wickObj.tweens.forEach(function (tween) {
                if(!tween.tweenType) tween.tweenType = 'Linear';
                if(!tween.tweenDir) tween.tweenDir = 'None';
            });
        }

        if(wickObj.wickScripts) {
            wickObj.wickScript = "this.onLoad = function () {\n"+WickProject.Compressor.decodeString(wickObj.wickScripts['onLoad'])+"\n}\n\nthis.onUpdate = function () {\n"+WickProject.Compressor.decodeString(wickObj.wickScripts['onUpdate'])+"\n}\n\nthis.onClick = function () {\n"+WickProject.Compressor.decodeString(wickObj.wickScripts['onClick'])+"\n}\n\n"
            wickObj.wickScripts = null;
        }

        if(!wickObj.isSymbol) return;
        wickObj.layers.forEach(function (layer) {
            if(!layer.identifier) layer.identifier = "Untitled Layer";

            layer.frames.forEach(function (frame) {
                // Frames now have uuids
                if(!frame.uuid) frame.uuid = random.uuid4();

                // 'frameLength' is now just 'length'
                if(frame.frameLength) {
                    frame.length = frame.frameLength;
                    frame.frameLength = null;
                }

                // Frames store where they are on the timeline
                if(frame.playheadPosition === undefined) {
                    frame.playheadPosition = layer.frames.indexOf(frame)
                }

                // Frames now have SVG path data
                if(!frame.pathData) {
                    frame.pathData = "";
                }
                if(!frame.pathDataToAdd) {
                    frame.pathDataToAdd = null;
                }

                // Frames no longer store onion skin images (made projects too big)
                if(frame.cachedImageData) frame.cachedImageData = null;

                // Frames now have scripts
                if(!frame.wickScript && !frame.wickScripts) {
                    frame.wickScripts = {
                        "onLoad" : "",
                        "onUpdate" : ""
                    }
                }

                if(frame.wickScripts) {
                    frame.wickScript = "this.onLoad = function () {\n"+WickProject.Compressor.decodeString(frame.wickScripts['onLoad'])+"\n}\n\nthis.onUpdate = function () {\n"+WickProject.Compressor.decodeString(frame.wickScripts['onUpdate'])+"\n}\n"
                    frame.wickScripts = null
                }

                // Frames can now not save their states 
                // (old projects always implicitly saved frame state)
                if(!frame.alwaysSaveState) frame.alwaysSaveState = false;
            });
        });
    });
}

WickProject.fromLocalStorage = function () {

    if(!localStorage) {
        console.error("LocalStorage not available. Loading blank project");
        return new WickProject();
    }
    
    var autosavedProjectJSON = localStorage.getItem('wickProject');

    if(!autosavedProjectJSON) {
        console.log("No autosaved project. Loading blank project.");
        return new WickProject();
    }
    
    return WickProject.fromJSON(autosavedProjectJSON);

}

WickProject.prototype.getAsJSON = function (callback, args) {

    var that = this;

    // Encode scripts/text to avoid JSON format problems
    that.rootObject.encodeStrings();
    
    var JSONProject = JSON.stringify(that, WickProject.Exporter.JSONReplacer);
    
    // Decode scripts back to human-readble and eval()-able format
    that.rootObject.decodeStrings();

    callback(JSONProject);

}

WickProject.prototype.saveInLocalStorage = function () {
    var self = this;
    this.getAsJSON(function (JSONProject) {
        console.log("Project size: " + JSONProject.length)
        if(JSONProject.length > 5000000) {
            console.log("Project >5MB, compressing...");
            var compressedJSONProject = WickProject.Compressor.compressProject(JSONProject, "LZSTRING-UTF16");
            WickProject.saveProjectJSONInLocalStorage(compressedJSONProject);
            console.log("Compressed size: " + compressedJSONProject.length);
        } else {
            console.log("Project <5MB, not compressing.");
            WickProject.saveProjectJSONInLocalStorage(JSONProject);
        }
    });
}

WickProject.saveProjectJSONInLocalStorage = function (projectJSON) {
    if(localStorage) {
        try {
            localStorage.setItem('wickProject', projectJSON);
        } catch (err) {
            console.error("LocalStorage could not save project, threw error:");
            console.log(err);
        }
    } else {
        console.error("LocalStorage not available.")
    }
}

WickProject.prototype.getCopyData = function () {
    var objectJSONs = [];
    var objects = this.getSelectedObjects();
    for(var i = 0; i < objects.length; i++) {
        objects[i].uuidCopiedFrom = objects[i].uuid;
        objectJSONs.push(objects[i].getAsJSON());
        objects[i].uuidCopiedFrom = null;
    }
    var clipboardObject = {
        /*position: {top  : group.top  + group.height/2,
                   left : group.left + group.width/2},*/
        groupPosition: {x : 0,
                        y : 0},
        wickObjectArray: objectJSONs
    }
    return JSON.stringify(clipboardObject);
}

/*********************************
    Access project wickobjects
*********************************/

WickProject.prototype.getCurrentObject = function () {
    return this.currentObject;
}

WickProject.prototype.getCurrentLayer = function () {
    return this.getCurrentObject().getCurrentLayer();
}

WickProject.prototype.getCurrentFrame = function () {
    return this.getCurrentObject().getCurrentLayer().getCurrentFrame();
}

WickProject.prototype.getObjectByUUID = function (uuid) {
    var allObjectsInProject = this.rootObject.getAllChildObjectsRecursive();
    allObjectsInProject.push(this.rootObject);

    var foundObj = null;
    allObjectsInProject.forEach(function (object) {
        if(foundObj) return;
        if(object.uuid === uuid) {
            foundObj = object;
        }
    });

    return foundObj;
}

WickProject.prototype.getFrameByUUID = function (uuid) {
    var allObjectsInProject = this.rootObject.getAllChildObjectsRecursive();
    allObjectsInProject.push(this.rootObject);

    var foundFrame = null;
    allObjectsInProject.forEach(function (object) {
        if(!object.isSymbol) return;
        object.layers.forEach(function (layer) {
            layer.frames.forEach(function (frame) {
                if(frame.uuid === uuid) {
                    foundFrame = frame;
                }   
            });
        })
    });

    return foundFrame;
}

WickProject.prototype.addObject = function (wickObject, zIndex, ignoreSymbolOffset) {

    var frame = this.getCurrentFrame();

    if(!ignoreSymbolOffset) {
        var insideSymbolOffset = this.currentObject.getAbsolutePosition();
        wickObject.x -= insideSymbolOffset.x;
        wickObject.y -= insideSymbolOffset.y;
    }

    if(!wickObject.uuid) wickObject.uuid = random.uuid4();
    
    if(zIndex === undefined) {
        frame.wickObjects.push(wickObject);
    } else {
        frame.wickObjects.splice(zIndex, 0, wickObject);
    }

    this.rootObject.generateParentObjectReferences();

}

WickProject.prototype.jumpToObject = function (obj) {

    var that = this;

    this.rootObject.getAllChildObjectsRecursive().forEach(function (child) {
        if(child.uuid === obj.uuid) {
            that.currentObject = child.parentObject;
        }
    });

    var currentObject = this.currentObject;
    var frameWithChild = currentObject.getFrameWithChild(obj);
    var playheadPositionWithChild = frameWithChild.playheadPosition
    currentObject.playheadPosition = playheadPositionWithChild;

}

WickProject.prototype.jumpToFrame = function (frame) {

    var that = this;

    var allObjectsInProject = this.rootObject.getAllChildObjectsRecursive();
    allObjectsInProject.push(this.rootObject);
    allObjectsInProject.forEach(function (child) {
        if(!child.isSymbol) return;
        child.layers.forEach(function (layer) {
            layer.frames.forEach(function (currframe) {
                if(frame === currframe) {
                    that.currentObject = child;
                }
            })
        })
    });

    var currentObject = this.currentObject;
    var frameWithChild = frame;
    var playheadPositionWithChild = frameWithChild.playheadPosition
    currentObject.playheadPosition = playheadPositionWithChild;
}

WickProject.prototype.hasSyntaxErrors = function () {

    var projectHasSyntaxErrors = false;

    this.rootObject.getAllChildObjectsRecursive().forEach(function (child) {
        if(child.hasSyntaxErrors) {
            projectHasSyntaxErrors = true;
        }
    });

    return projectHasSyntaxErrors;

}

WickProject.prototype.isObjectSelected = function (obj) {
    var selected = false;

    this._selection.forEach(function (uuid) {
        if(obj.uuid === uuid) selected = true;
    });

    return selected;
}

WickProject.prototype.getSelectedObject = function () {
    var selectedObjects = this.getSelectedObjects();
    if(selectedObjects.length !== 1) {
        return null;
    } else {
        return selectedObjects[0];
    }
}

WickProject.prototype.getSelectedObjects = function () {
    var self = this;

    var objs = [];
    this._selection.forEach(function (uuid) {
        var obj = self.getObjectByUUID(uuid) || self.getFrameByUUID(uuid);
        if(obj) objs.push(obj);
    });

    return objs;
}

WickProject.prototype.getNumSelectedObjects = function (obj) {
    return(this._selection.length);
}

WickProject.prototype.selectObject = function (obj) {
    this._selection.push(obj.uuid);
}

WickProject.prototype.clearSelection = function () {
    this._selection = [];
}

WickProject.prototype.deselectObjectType = function (type) {
    for ( var i = 0; i < this._selection.length; i++ ) {
        if(this._selection[i] instanceof type) this._selection[i] = null;
    }
}
