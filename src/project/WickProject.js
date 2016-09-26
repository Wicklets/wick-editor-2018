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

    // Format of the line we're looking for: <script>WickPlayer.runProject('<<JSON PROJECT IS HERE>>');</script>
    var webpageStringLines = webpageString.split('\n');
    webpageStringLines.forEach(function (line) {
        if(line.startsWith("<script>WickPlayer.runProject(")) {
            extractedProjectJSON = line.split("'")[1];
        }
    });

    if(!extractedProjectJSON) {
        // Oh no, something went wrong
        console.error("Bundled JSON project not found in specified HTML file (webpageString). The HTML supplied might not be a Wick project, or zach might have changed the way projects are bundled. See WickProjectExporter.js!");
        return null;
    } else {
        // Found a bundled project's JSON, let's load it!
        return WickProject.fromJSON(extractedProjectJSON);
    }
}

WickProject.fromJSON = function (JSONString) {
    // Replace current project with project in JSON
    var projectFromJSON = JSON.parse(JSONString);

    // Put prototypes back on object ('class methods'), they don't get JSONified on project export.
    projectFromJSON.__proto__ = WickProject.prototype;
    WickObjectUtils.putWickObjectPrototypeBackOnObject(projectFromJSON.rootObject);

    // Decode scripts back to human-readble and eval()-able format
    projectFromJSON.rootObject.decodeStrings();

    projectFromJSON.rootObject.regenerateParentObjectReferences();

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

    console.log("Loading project from local storage...");
    return WickProject.fromJSON(autosavedProjectJSON);

}

WickProject.prototype.getAsJSON = function (callback) {

    // Rasterize SVGs
    var that = this;
    this.rootObject.generateSVGCacheImages(function () {
        // Encode scripts/text to avoid JSON format problems
        that.rootObject.encodeStrings();
        
        var JSONProject = JSON.stringify(that, WickObjectUtils.JSONReplacer);
        
        // Decode scripts back to human-readble and eval()-able format
        that.rootObject.decodeStrings();

        callback(JSONProject);
    });

}

WickProject.prototype.saveInLocalStorage = function () {
    if(localStorage) {
        try {
            this.getAsJSON(function (JSONProject) {
                localStorage.setItem('wickProject', JSONProject);
                console.log("Project saved to local storage.");
            });
        } catch (err) {
            console.error("LocalStorage could not save project, threw error:");
            console.log(err);
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

    if(!wickObject.id && wickObject.id!=0) {
        wickObject.id = this.rootObject.getLargestID() + 1;
    }

    if(wickObject.isSymbol) {
        wickObject.getAllChildObjects().forEach(function (child) {
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

    return this.rootObject.getChildByID(id);

}

WickProject.prototype.getCurrentObject = function () {

    return this.getObjectByID(this.currentObjectID);

}