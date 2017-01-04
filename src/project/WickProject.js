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
    
    this.resolution = {};
    this.resolution.x = 720;
    this.resolution.y = 480;

    this.borderColor = "#DDDDDD";
    this.backgroundColor = "#FFFFFF";

    this.framerate = 12;

    this.fitScreen = false;

    this.renderer = "WickPixiRenderer";
    this.audioPlayer = "WickWebAudioPlayer";

    this.assets = {};

};

WickProject.prototype.createNewRootObject = function () {
    var rootObject = new WickObject();
    rootObject.isSymbol = true;
    rootObject.isRoot = true;
    rootObject.playheadPosition = 0;
    rootObject.currentLayer = 0;
    rootObject.layers = [new WickLayer()];
    rootObject.x = 0;
    rootObject.y = 0;
    rootObject.opacity = 1.0;
    this.rootObject = rootObject;
}

/*****************************
    Assets
*****************************/

WickProject.prototype.loadAsset = function (filename, dataURL) {
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
}

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
    var allObjectsInProject = projectFromJSON.rootObject.getAllChildObjectsRecursive();

    // Backwards compatibility for old Wick projects
    allObjectsInProject.push(projectFromJSON.rootObject);
    allObjectsInProject.forEach(function (wickObj) {
        wickObj.playheadPosition = 0;
        if(!wickObj.uuid) wickObj.uuid = random.uuid4();
        wickObj.id = null;

        if(!wickObj.isSymbol) return;

        wickObj.layers.forEach(function (layer) {
            layer.frames.forEach(function (frame) {
                // Add path data
                if(!frame.pathData) {
                    frame.pathData = "";
                }

                // Add scripts (old projects didn't have frame scripts)
                if(!frame.wickScripts) {
                    frame.wickScripts = {
                        "onLoad" : "",
                        "onUpdate" : ""
                    }
                }
                // Add frame save state option (old projects always implicitly saved frame state)
                if(!frame.alwaysSaveState) frame.alwaysSaveState = false;
            })
        });
    });

    return projectFromJSON;
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

    wickEditor.paper.applyChangesToFrame();

    // Encode scripts/text to avoid JSON format problems
    that.rootObject.encodeStrings();
    
    var JSONProject = JSON.stringify(that, WickProject.Exporter.JSONReplacer);
    
    // Decode scripts back to human-readble and eval()-able format
    that.rootObject.decodeStrings();

    callback(JSONProject);

}

WickProject.prototype.saveInLocalStorage = function () {
    var self = this;
    wickEditor.statusbar.setState('saving');
    this.getAsJSON(function (JSONProject) {
        console.log("Project size: " + JSONProject.length)
        if(JSONProject.length > 5000000) {
            console.log("Project >5MB, compressing...");
            var compressedJSONProject = WickProject.Compressor.compressProject(JSONProject, "LZSTRING-UTF16");
            WickProject.saveProjectJSONInLocalStorage(compressedJSONProject);
            console.log("Compressed size: " + compressedJSONProject.length)
            wickEditor.statusbar.setState('done');
        } else {
            console.log("Project <5MB, not compressing.");
            WickProject.saveProjectJSONInLocalStorage(JSONProject);
            wickEditor.statusbar.setState('done');
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

WickProject.prototype.getCopyData = function (objects) {
    var objectJSONs = [];
    for(var i = 0; i < objects.length; i++) {
        objectJSONs.push(objects[i].getAsJSON());
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

WickProject.prototype.addObject = function (wickObject, zIndex, ignoreSymbolOffset) {

    var frame = this.currentObject.getCurrentFrame();

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
        if(child === obj) {
            that.currentObject = child.parentObject;
        }
    });

    var currentObject = this.currentObject;
    var frameWithChild = currentObject.getFrameWithChild(obj);
    var playheadPositionWithChild = currentObject.getPlayheadPositionAtFrame(frameWithChild);
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

