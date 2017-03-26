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
    rootObject.playRanges = [];
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
        if(line.startsWith("<script>var wickPlayer = new WickPlayer(); wickPlayer.runProject(")) {
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

    projectFromJSON.currentObject = projectFromJSON.rootObject;

    // Regenerate name refs
    projectFromJSON.rootObject.generateObjectNameReferences(projectFromJSON.rootObject);

    return projectFromJSON;
}

// Backwards compatibility for old Wick projects
WickProject.fixForBackwardsCompatibility = function (project) {

    var allObjectsInProject = project.rootObject.getAllChildObjectsRecursive();
    allObjectsInProject.push(project.rootObject);
    allObjectsInProject.forEach(function (wickObj) {
        if(!wickObj.isSymbol) return
        wickObj.layers.forEach(function (layer) {
            layer.frames.forEach(function (frame) {
                
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

WickProject.prototype.getAsJSON = function (callback, format) {

    var that = this;

    // Encode scripts/text to avoid JSON format problems
    that.rootObject.encodeStrings();
    
    var JSONProject = JSON.stringify(that, WickProject.Exporter.JSONReplacer, format);
    
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

WickProject.prototype.getAllObjects = function () {
    var allObjectsInProject = this.rootObject.getAllChildObjectsRecursive();
    return allObjectsInProject;
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

WickProject.prototype.getPlayRangeByUUID = function (uuid) {
    var allObjectsInProject = this.rootObject.getAllChildObjectsRecursive();
    allObjectsInProject.push(this.rootObject);

    var foundPlayrange = null;
    allObjectsInProject.forEach(function (object) {
        if(foundPlayrange) return;
        if(!object.isSymbol) return;

        object.playRanges.forEach(function(playRange) {
            if(playRange.uuid === uuid) {
                foundPlayrange = playRange;
            }
        });
    });

    return foundPlayrange;
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
        child.getAllFrames().forEach(function (frame) {
            if(frame.hasSyntaxErrors) {
                projectHasSyntaxErrors = true;
            }
        });

        if(child.hasSyntaxErrors) {
            projectHasSyntaxErrors = true;
        }
    });

    return projectHasSyntaxErrors;

}

WickProject.prototype.handleWickError = function (e, objectCausedError) {
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
        wickEditor.scriptingide.showError(objectCausedError, lineNumber, e);

    } else {
        alert("An exception was thrown while running a WickObject script. See console!");
        console.log(e);
    }
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
        var obj = self.getObjectByUUID(uuid) || self.getFrameByUUID(uuid) || self.getPlayRangeByUUID(uuid);
        if(obj) objs.push(obj);
    });

    return objs;
}

WickProject.prototype.getNumSelectedObjects = function (obj) {
    return(this._selection.length);
}

WickProject.prototype.selectObject = function (obj) {
    this._selection.push(obj.uuid);
    wickEditor.properties.setTab('selection')
}

WickProject.prototype.clearSelection = function () {
    this._selection = [];
}

WickProject.prototype.deselectObjectType = function (type) {
    var deselectionHappened = false;

    for ( var i = 0; i < this._selection.length; i++ ) {
        var uuid = this._selection[i];
        var obj = this.getObjectByUUID(uuid) || this.getFrameByUUID(uuid) || this.getPlayRangeByUUID(uuid);
        if(obj instanceof type) {
            this._selection[i] = null;
            deselectionHappened = true;
        }
    }

    return deselectionHappened;
}

WickProject.prototype.loadBuiltinFunctions = function (contextObject) {

    var objectScope = null;
    if(contextObject instanceof WickObject) {
        objectScope = contextObject.parentObject;
    } else if (contextObject instanceof WickFrame) {
        objectScope = contextObject.parentLayer.parentWickObject;
    }

    window.project = wickPlayer.project || wickEditor.project;
    window.root = project.rootObject;

    window.play           = function ()      { objectScope.play(); }
    window.stop           = function ()      { objectScope.stop(); }
    window.movePlayheadTo = function (frame) { objectScope.movePlayheadTo(frame); }
    window.gotoAndStop    = function (frame) { objectScope.gotoAndStop(frame); }
    window.gotoAndPlay    = function (frame) { objectScope.gotoAndPlay(frame); }

    window.stopAllSounds = function () { wickPlayer.getAudioPlayer().stopAllSounds(); };
    window.keyIsDown      = function (keyString) { return wickPlayer.inputHandler.keyIsDown(keyString); };
    window.keyJustPressed = function (keyString) { return wickPlayer.inputHandler.keyJustPressed(keyString); }
    window.mouseX = wickPlayer.inputHandler.getMouse().x;
    window.mouseY = wickPlayer.inputHandler.getMouse().y;
    window.tiltX = getTiltX();
    window.tiltY = getTiltY();
    window.hideCursor = function () { wickPlayer.hideCursor(); };
    window.showCursor = function () { wickPlayer.showCursor(); };
    window.enterFullscreen = function () { wickPlayer.enterFullscreen(); }

    // WickObjects in same frame (scope) are accessable without using root./parent.
    if(objectScope) {
        objectScope.getAllChildObjects().forEach(function(child) {
            if(child.name) window[child.name] = child;
        });
    }

}

WickProject.prototype.runScript = function (obj, fnName) {

    this.loadBuiltinFunctions(obj);

    try {
        if(obj[fnName]) obj[fnName]();
    } catch (e) {
        this.handleWickError(e,obj);
    }

}

var WickObjectBuiltins = [
    'load',
    'update',
    'mousedown',
    'mouseover',
    'mouseout'
];

WickProject.prototype.loadScriptOfObject = function (obj) {
    try { 
        var dummy = {};
        var load = undefined;
        var update = undefined;
        var mousedown = undefined;
        var mouseover = undefined;
        var mouseout = undefined;
        obj._scopeWrapper = function () {
            var dummyLoaderScript = "";
            WickObjectBuiltins.forEach(function (builtinName) {
                dummyLoaderScript += '\ndummy.'+builtinName+"="+builtinName+";"
            });

            (wickEditor || wickPlayer).project.loadBuiltinFunctions(obj);

            eval(obj.wickScript + dummyLoaderScript);
        }
        obj._scopeWrapper();

        WickObjectBuiltins.forEach(function (builtinName) {
            var fn = dummy[builtinName];
            if(fn) {
                obj[builtinName] = fn;
            } else {
                obj[builtinName] = function () { return; };
            }
        })
    } catch (e) { 
        console.log(e) 
    };
}

WickProject.prototype.prepareForPlayer = function () {
    var self = this;

    self.getAllObjects().forEach(function (obj) {
        obj.prepareForPlayer();
    });
}

WickProject.prototype.tick = function () {
    var allObjectsInProject = this.rootObject.getAllChildObjectsRecursive();

    allObjectsInProject.forEach(function (obj) {
        obj._newPlayheadPosition = undefined;

        obj.getAllFrames().forEach(function (frame) {
            frame._wasActiveLastTick = frame._active;
            frame._active = frame.isActive();
        });

        obj._wasActiveLastTick = obj._active;
        obj._active = obj.isActive();
    });
    
    this.rootObject.tick();

    allObjectsInProject.forEach(function (obj) {
        if(obj._newPlayheadPosition !== undefined)
            obj.playheadPosition = obj._newPlayheadPosition;
    });
}