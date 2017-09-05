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

    this.library = new AssetLibrary();

    this.name = "NewProject";

    this.onionSkinning = false;
    this.smallFramesMode = false;
    
    this.width = 720;
    this.height = 480;

    this.backgroundColor = "#FFFFFF";
    this.transparent = false;

    this.pixelPerfectRendering = false;

    this.framerate = 12;

    this.fitScreen = false;

    this.uuid = random.uuid4();

    //this.assets = {};

    this._selection = [];

    if(window.wickVersion) this.wickVersion = window.wickVersion;

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

WickProject.fromZIP = function (file, callback) {
      JSZip.loadAsync(file).then(function (zip) {
          return zip.file("index.html").async("text");
        }).then(function (txt) {
          callback(WickProject.fromWebpage(txt));
        });
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

    WickProject.fixForBackwardsCompatibility(projectFromJSON);
    projectFromJSON.library.__proto__ = AssetLibrary.prototype;
    AssetLibrary.addPrototypes(projectFromJSON.library);

    // Decode scripts back to human-readble and eval()-able format
    projectFromJSON.rootObject.decodeStrings();

    // Add references to wickobject's parents (optimization)
    projectFromJSON.rootObject.generateParentObjectReferences();
    projectFromJSON.regenAssetReferences();

    // Start at the first from of the root object
    projectFromJSON.currentObject = projectFromJSON.rootObject;
    projectFromJSON.rootObject.playheadPosition = 0;
    projectFromJSON.currentObject.currentLayer = 0;

    projectFromJSON.currentObject = projectFromJSON.rootObject;

    return projectFromJSON;
}

// Backwards compatibility for old Wick projects
WickProject.fixForBackwardsCompatibility = function (project) {

    var allObjectsInProject = project.rootObject.getAllChildObjectsRecursive();
    allObjectsInProject.push(project.rootObject);
    allObjectsInProject.forEach(function (wickObj) {
        if(wickObj.tweens) wickObj.tweens = null;

        if(!wickObj.isSymbol) return
        wickObj.layers.forEach(function (layer) {
            if(!layer.locked) layer.locked = false;
            if(!layer.hidden) layer.hidden = false;
            layer.frames.forEach(function (frame) {
                if(!frame.tweens) frame.tweens = [];
                frame.tweens.forEach(function (tween) {
                    if(!tween.rotations) tween.rotations = 0;
                });
            });
        });
    });

    if(!project._selection){
        project._selection = [];
    }

    if(!project.smallFramesMode) {
        project.smallFramesMode = false;
    }

    if(!project.library) {
        project.library = new AssetLibrary();

        allObjectsInProject.forEach(function (wickObject) {
            if(wickObject.imageData) {
                var asset = new WickAsset(wickObject.imageData, 'image', 'untitled');
                wickObject.assetUUID = project.library.addAsset(asset);
                wickObject.isImage = true;
                wickObject.imageData = null;
                wickObject.name = 'untitled';
            } else if(wickObject.audioData) {
                var asset = new WickAsset(wickObject.imageData, 'audio', 'untitled');
                var assetUUID = project.library.addAsset(asset);
            }
        })
    }

    project.library.__proto__ = AssetLibrary.prototype;
    project.library.regenAssetUUIDs();

}

/*WickProject.fromLocalStorage = function () {

    if(!localStorage) {
        console.error("LocalStorage not available. Loading blank project");
        return new WickProject();
    }
    
    var autosavedProjectJSON = localStorage.getItem('wickProject');

    if(!autosavedProjectJSON) {
        console.log("No autosaved project. Loading blank project.");
        return new WickProject();
    }

    var project = WickProject.fromJSON(autosavedProjectJSON);
    
    if(!project.wickVersion) {
        return new WickProject();
    } else {
        return project;
    }

}*/

WickProject.prototype.getAsJSON = function (callback, format) {

    var self = this;

    // Encode scripts/text to avoid JSON format problems
    self.rootObject.encodeStrings();

    // Remove unused library assets
    /*var removeAssetUUIDs = [];
    for(uuid in self.library.assets) {
        var asset = self.library.assets[uuid];
        var assetBeingUsed = false;
        self.getAllObjects().forEach(function (obj) {
            if(obj.assetUUID === asset.uuid) assetBeingUsed = true;
        });
        if(!assetBeingUsed) {
            removeAssetUUIDs.push(asset.uuid);
        }
    };
    removeAssetUUIDs.forEach(function (uuid) {
        self.library.deleteAsset(uuid);
    });*/
    
    var JSONProject = JSON.stringify(self, WickProject.Exporter.JSONReplacer, format);
    
    // Decode scripts back to human-readble and eval()-able format
    self.rootObject.decodeStrings();

    callback(JSONProject);

}

/*WickProject.prototype.saveInLocalStorage = function () {
    var self = this;
    this.getAsJSON(function (JSONProject) {
        console.log("Project size: " + JSONProject.length)
        if(JSONProject.length > 5000000) {
            wickEditor.alertbox.showMessage("Project too large to autosave");
            return;

            console.log("Project >5MB, compressing...");
            var compressedJSONProject = WickProject.Compressor.compressProject(JSONProject, "LZSTRING-UTF16");
            WickProject.saveProjectJSONInLocalStorage(compressedJSONProject);
            console.log("Compressed size: " + compressedJSONProject.length);
        } else {
            console.log("Project <5MB, not compressing.");
            WickProject.saveProjectJSONInLocalStorage(JSONProject);
        }
        self.unsaved = false;
        wickEditor.syncInterfaces()
    });
}

WickProject.saveProjectJSONInLocalStorage = function (projectJSON) {
    if(localStorage) {
        try {
            wickEditor.alertbox.showProjectSavedMessage();
            localStorage.setItem('wickProject', projectJSON);
        } catch (err) {
            console.error("LocalStorage could not save project, threw error:");
            console.log(err);
        }
    } else {
        console.error("LocalStorage not available.")
    }
}*/

WickProject.prototype.getCopyData = function () {
    var objectJSONs = [];
    var objects = this.getSelectedObjects();
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

WickProject.prototype.getAllFrames = function () {
    var frames = [];

    var allObjectsInProject = this.getAllObjects();
    allObjectsInProject.forEach(function (obj) {
        frames = frames.concat(obj.getAllFrames());
    });

    return frames;
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

WickProject.prototype.getObject = function (name) {
    return this.getObjectByName(name);
}

WickProject.prototype.getObjectByName = function (name) {
    var allObjectsInProject = this.rootObject.getAllChildObjectsRecursive();
    allObjectsInProject.push(this.rootObject);

    var foundObj = null;
    allObjectsInProject.forEach(function (object) {
        if(foundObj) return;
        if(object.name === name) {
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
    
    if(zIndex === undefined || zIndex === null) {
        frame.wickObjects.push(wickObject);
    } else {
        frame.wickObjects.splice(zIndex, 0, wickObject);
    }

    this.rootObject.generateParentObjectReferences();

}

WickProject.prototype.getNextAvailableName = function (baseName) {

    var nextName = baseName;
    var number = 0;

    this.getAllObjects().forEach(function (object) {
        if(!object.name) return;
        var nameSuffix = object.name.split(baseName)[1]

        if(nameSuffix === "") {
            if(number === 0)
                number = 1;
        } else {
            var prefixNumber = parseInt(nameSuffix);
            if(!isNaN(prefixNumber) && prefixNumber > number) 
                number = prefixNumber;
        }
    });

    if(number === 0) {
        return baseName;
    } else {
        return baseName + " " + (number+1);
    }

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
            if(frame.scriptError && frame.scriptError.type === 'syntax') {
                projectHasSyntaxErrors = true;
            }
        });

        if(child.scriptError && child.scriptError.type === 'syntax') {
            projectHasSyntaxErrors = true;
        }
    });

    return projectHasSyntaxErrors;

}

WickProject.prototype.handleWickError = function (e, objectCausedError) {

    if (window.wickEditor) {
        //if(!wickEditor.builtinplayer.running) return;

        console.log("Exception thrown while running script of WickObject: " + this.name);
        console.log(e);
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
        //if(wickEditor.builtinplayer.running) wickEditor.builtinplayer.stopRunningProject()
        
        wickEditor.builtinplayer.stopRunningProject()

        wickEditor.scriptingide.showError(objectCausedError, {
            message: e,
            line: lineNumber,
            type: 'runtime'
        });

        objectCausedError.scriptError = {
            message: e,
            line: lineNumber,
            type: 'runtime'
        }

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

WickProject.prototype.isTypeSelected = function (type) {
    var self = this;
    var selected = false;

    this._selection.forEach(function (uuid) {
        var obj = self.getObjectByUUID(uuid) 
               || self.getFrameByUUID(uuid) 
               || self.getPlayRangeByUUID(uuid)
               //|| self.getTweenByUUID(uuid);
        if(obj instanceof type) selected = true;
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

WickProject.prototype.getSelectedObjectByType = function (type) {
    var selectedObjects = this.getSelectedObjects();
    returnObject = null;
    
    selectedObjects.forEach(function (obj) {
        if(obj instanceof type) {
            returnObject = obj;
        }
    })

    return returnObject;
}

WickProject.prototype.getSelectedObjects = function () {
    var self = this;

    var objs = [];
    this._selection.forEach(function (uuid) {
        var obj = self.getObjectByUUID(uuid) 
               || self.getFrameByUUID(uuid) 
               || self.getPlayRangeByUUID(uuid)
               //|| self.getTweenByUUID(uuid);
        if(obj) objs.push(obj);
    });

    return objs;
}

WickProject.prototype.getSelectedObjectsUUIDs = function () {
    var self = this;

    var objs = [];
    this._selection.forEach(function (uuid) {
        var obj = self.getObjectByUUID(uuid) 
               || self.getFrameByUUID(uuid) 
               || self.getPlayRangeByUUID(uuid)
               //|| self.getTweenByUUID(uuid);
        if(obj) objs.push(obj.uuids);
    });

    return objs;
}

WickProject.prototype.getNumSelectedObjects = function (obj) {
    return this.getSelectedObjects().length;
}

WickProject.prototype.selectObject = function (obj) {
    wickEditor.inspector.clearSpecialMode();
    if(this._selection.indexOf(obj.uuid) === -1)
        this._selection.push(obj.uuid);
}

WickProject.prototype.clearSelection = function () {
    this._selection = [];
}

WickProject.prototype.deselectObjectType = function (type) {
    var deselectionHappened = false;
    
    for ( var i = 0; i < this._selection.length; i++ ) {
        var uuid = this._selection[i];
        var obj = this.getObjectByUUID(uuid) 
               || this.getFrameByUUID(uuid) 
               || this.getPlayRangeByUUID(uuid)
               //|| this.getTweenByUUID(uuid);
        if(obj instanceof type) {
            this._selection[i] = null;
            deselectionHappened = true;
        }
    }

    this._selection = this._selection.filter(function (obj) {
        return obj !== null;
    });

    return deselectionHappened;
}

WickProject.prototype.getIntersectingPaths = function (path) {

    return [];

}

WickProject.prototype.loadBuiltinFunctions = function (contextObject) {

    var objectScope = null;
    if(contextObject instanceof WickObject) {
        objectScope = contextObject.parentObject;
    } else if (contextObject instanceof WickFrame) {
        objectScope = contextObject.parentLayer.parentWickObject;
    }

    window.project = wickPlayer.project || wickEditor.project;
    window.parentObject = contextObject.parentObject;
    window.root = project.rootObject;

    window.play           = function ()      { objectScope.play(); }
    window.stop           = function ()      { objectScope.stop(); }
    window.movePlayheadTo = function (frame) { objectScope.movePlayheadTo(frame); }
    window.gotoAndStop    = function (frame) { objectScope.gotoAndStop(frame); }
    window.gotoAndPlay    = function (frame) { objectScope.gotoAndPlay(frame); }
    window.gotoNextFrame  = function ()      { objectScope.gotoNextFrame(); }
    window.gotoPrevFrame  = function ()      { objectScope.gotoPrevFrame(); }

    window.keyIsDown      = function (keyString) { return wickPlayer.inputHandler.keyIsDown(keyString); };
    window.keyJustPressed = function (keyString) { return wickPlayer.inputHandler.keyJustPressed(keyString); }
    window.mouseX = wickPlayer.inputHandler.getMouse().x;
    window.mouseY = wickPlayer.inputHandler.getMouse().y;
    window.mouseMoveX = wickPlayer.inputHandler.getMouseDiff().x;
    window.mouseMoveY = wickPlayer.inputHandler.getMouseDiff().y;
    window.tiltX = getTiltX();
    window.tiltY = getTiltY();
    window.hideCursor = function () { wickPlayer.hideCursor(); };
    window.showCursor = function () { wickPlayer.showCursor(); };

    // WickObjects in same frame (scope) are accessable without using root./parent.
    if(objectScope) {
        objectScope.getAllActiveChildObjects().forEach(function(child) {
            if(child.name) window[child.name] = child;
        });
    }

}

WickProject.prototype.runScript = function (obj, fnName, arg1, arg2, arg3) {

    this.loadBuiltinFunctions(obj);

    try {
        if(obj[fnName]) obj[fnName](arg1, arg2, arg3);
    } catch (e) {
        this.handleWickError(e,obj);
    }

}

var WickObjectBuiltins = [
    'load',
    'update',
    'mousedown',
    'mouseover',
    'mouseup',
    "mouseout",
    "keypressed",
    "keydown",
    "keyreleased",
];

WickProject.prototype.loadScriptOfObject = function (obj) {
    
    try { 
        var dummy = {};
        var load = undefined;
        var update = undefined;
        var mousedown = undefined;
        var mouseover = undefined;
        var mouseup = undefined;
        var mouseout = undefined;
        var keydown = undefined;
        var keypressed = undefined;
        var keyreleased = undefined;
        obj._scopeWrapper = function () {
            var dummyLoaderScript = "";
            WickObjectBuiltins.forEach(function (builtinName) {
                dummyLoaderScript += '\ndummy.'+builtinName+"="+builtinName+";"
            });

            (wickPlayer || wickEditor).project.loadBuiltinFunctions(obj);

            var evalScript = /*'"use strict"; ' + */obj.wickScript + dummyLoaderScript;
            eval(evalScript);
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
        console.log(window.wickEditor)
        if (window.wickEditor) {
            //if(!wickEditor.builtinplayer.running) return;

            console.log("Exception thrown while running script of WickObject: " + obj.name);
            console.log(e);
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
            //if(wickEditor.builtinplayer.running) wickEditor.builtinplayer.stopRunningProject()
            wickEditor.builtinplayer.stopRunningProject()
            wickEditor.scriptingide.showError(obj, {
                message: e,
                line: lineNumber,
                type: 'runtime'
            });

        } else {
            alert("An exception was thrown while running a WickObject script. See console!");
            console.log(e);
        }
    };
}

WickProject.prototype.regenAssetReferences = function () {

    var self = this;

    self.getAllObjects().forEach(function (obj) {
        obj.asset = self.library.getAsset(obj.assetUUID);
    });

}

WickProject.prototype.getDuplicateName = function () {
    var foundDuplicate = null;

    this.getAllObjects().forEach(function (object) {
        object.getAllFrames().forEach(function (frame) {
            var names = [];
            frame.wickObjects.forEach(function (obj) {
                names.push(obj.name);
            });

            names = names.filter(function (n) {
                return n !== undefined && n !== '';
            });

            //http://stackoverflow.com/questions/840781/easiest-way-to-find-duplicate-values-in-a-javascript-array
            var uniq = names
            .map(function (name) {
              return {count: 1, name: name}
            })
            .reduce(function (a, b) {
              a[b.name] = (a[b.name] || 0) + b.count
              return a
            }, {})

            //var duplicates = Object.keys(uniq).filter((a) => uniq[a] > 1)
            var duplicates = Object.keys(uniq).filter(function (a) {
                return uniq[a] > 1;
            });

            if(duplicates.length > 0) foundDuplicate = duplicates[0];
        });
    });

    return foundDuplicate;
}

WickProject.prototype.prepareForPlayer = function () {
    var self = this;

    self.regenAssetReferences();

    self.getAllObjects().forEach(function (obj) {
        obj.prepareForPlayer();
    });
}

WickProject.prototype.tick = function () {
    this.applyTweens();

    var allObjectsInProject = this.rootObject.getAllChildObjectsRecursive();

    // Make sure all playhead positions are up to date 
    // (this is deferred to outside the main tick code so things don't get confusing)
    allObjectsInProject.forEach(function (obj) {
        if(obj._newPlayheadPosition !== undefined)
            obj.playheadPosition = obj._newPlayheadPosition;
    });

    allObjectsInProject.forEach(function (obj) {
        obj._newPlayheadPosition = undefined;
        obj._forceNewPlayheadPosition = undefined;
    });
    allObjectsInProject.forEach(function (obj) {
        obj.getAllFrames().forEach(function (frame) {
            frame._wasActiveLastTick = frame._active;
            frame._active = frame.isActive();
        });
    });
    allObjectsInProject.forEach(function (obj) {
        obj._wasActiveLastTick = obj._active;
        obj._active = obj.isActive();
    });
    
    this.rootObject.tick();
    
    // If a playhead position was changed through a script, make sure the 
    // change is reflected on next render (things look more responsive)
    allObjectsInProject.forEach(function (obj) {
        if(obj._newPlayheadPosition !== undefined && obj._forceNewPlayheadPosition) {
            //obj.playheadPosition = obj._newPlayheadPosition;
            //obj._newPlayheadPosition = null;
            //obj._forceNewPlayheadPosition = null;
        }
    });
}

WickProject.prototype.applyTweens = function () {
    this.getAllFrames().forEach(function (frame) {
        frame.applyTween();
    });
}