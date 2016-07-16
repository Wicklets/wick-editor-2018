/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var WickProject = function () {

    // Create the root object. The editor is always editing the root 
    // object or its sub-objects and cannot ever leave the root object.
    this.rootObject = WickObject.createNewRootObject();

    // Only used by the editor. Keeps track of current object editor is editing.
    this.currentObjectID = this.rootObject.id;
    this.rootObject.currentFrame = 0;
    
    this.resolution = {};
    this.resolution.x = 650;
    this.resolution.y = 500;

    this.backgroundColor = "#FFFFFF";

    this.framerate = 12;

    this.fitScreen = false;
    this.borderColor = "#FFFFFF";

};

/*****************************
    Import/Export
*****************************/

WickProject.fromJSON = function (JSONString) {
    // Replace current project with project in JSON
    var projectFromJSON = JSON.parse(JSONString);

    // Put prototypes back on object ('class methods'), they don't get JSONified on project export.
    projectFromJSON.__proto__ = WickProject.prototype;
    WickObjectUtils.putWickObjectPrototypeBackOnObject(projectFromJSON.rootObject);

    // Decode scripts back to human-readble and eval()-able format
    projectFromJSON.rootObject.decodeStrings();

    return projectFromJSON;
}

WickProject.prototype.exportAsHTMLFile = function () {
    var fileOut = "";

    // Add the player webpage (need to download the empty player)
    fileOut += FileDownloader.downloadFile("src/player/emptyplayer.htm") + "\n";

    // All libs needed by the player. 
    requiredLibFiles = [
        "lib/pixi.min.js",
        "lib/fpscounter.js",
        "lib/verboselog.js",
        "lib/browserdetection.js",
        "lib/base64-arraybuffer.js",
    ];

    // Player code. 
    requiredPlayerFiles =[
        "src/project/wickobject.js",
        "src/player/wickplayer.js",
    ];

    for (var libIndex = 0; libIndex < requiredLibFiles.length; libIndex++) {
        file = requiredLibFiles[libIndex];
        fileOut += "<script>" + FileDownloader.downloadFile(file) + "</script>\n";
    }

    for (var srcIndex = 0; srcIndex < requiredPlayerFiles.length; srcIndex++) {
        file = requiredPlayerFiles[srcIndex];
        fileOut += "<script>" + FileDownloader.downloadFile(file) + "</script>\n";
    }

    // Bundle the JSON project
    this.getAsJSON(function (JSONProject) {
        fileOut += "<script>WickPlayer.runProject('" + JSONProject + "');</script>" + "\n";

        // Save whole thing as html file
        var blob = new Blob([fileOut], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "project.html");
    });
}

WickProject.prototype.exportAsJSONFile = function () {
    // Save JSON project and have user download it
    this.getAsJSON(function (JSONProject) {
        var blob = new Blob([JSONProject], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "project.json");
    });
}

WickProject.prototype.getAsJSON = function (callback) {

    // Rasterize SVGs
    var that = this;
    this.rootObject.generateSVGCacheImages(function () {
        // Encode scripts/text to avoid JSON format problems
        that.rootObject.encodeStrings();

        var JSONProject = JSON.stringify(that);
        
        // Decode scripts back to human-readble and eval()-able format
        that.rootObject.decodeStrings();

        callback(JSONProject);
    });

}

WickProject.prototype.saveInLocalStorage = function () {
    if(localStorage) {
        try {
            VerboseLog.log("Saving project to local storage...");
            this.getAsJSON(function (JSONProject) {
                localStorage.setItem('wickProject', JSONProject);
            });
        } catch (err) {
            VerboseLog.error("LocalStorage could not save project, threw error:");
            VerboseLog.log(err);
        }
    } else {
        console.error("LocalStorage not available.")
    }
}

/*********************************
    Access project wickobjects
*********************************/

WickProject.prototype.regenerateUniqueIDs = function (wickObject) {
    var that = this;

    if(!wickObject.id) {
        wickObject.id = this.rootObject.getLargestID() + 1;
    }

    if(wickObject.isSymbol) {
        wickObject.forEachChildObject(function (child) {
            that.regenerateUniqueIDs(child);
        });
    }
}

WickProject.prototype.addObject = function (wickObject, zIndex) {

    if(zIndex === undefined) {
        this.getCurrentObject().getCurrentFrame().wickObjects.push(wickObject);
    } else {
        this.getCurrentObject().getCurrentFrame().wickObjects.splice(zIndex, 0, wickObject);
    }

    this.regenerateUniqueIDs(this.rootObject);

}

WickProject.prototype.getObjectByID = function (id) {

    if(id == 0) {
        return this.rootObject;
    }

    return this.rootObject.getChildByID(id);

}

WickProject.prototype.getCurrentObject = function () {

    return this.getObjectByID(this.currentObjectID);

}