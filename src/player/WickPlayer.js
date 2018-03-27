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
    
var WickPlayer = function () {

    var self = this;

    self.running = false;

    var initialStateProject;
    var stats;

    self.runProject = function (projectJSON) {

        if(localStorage.enableStats) {
            stats = new Stats();
            stats.showPanel(1);
            document.body.appendChild(stats.dom);
        }

        try {
            if(window.parent && window.parent.wickEditor) window.wickEditor = window.parent.wickEditor;
        } catch (e) {
            console.log(e)
        }

        self.running = true;

        self.canvasContainer = document.getElementById('playerCanvasContainer');

        resetElapsedTime();

        // Load the project!
        self.project = WickProject.fromJSON(projectJSON);
        initialStateProject = WickProject.fromJSON(projectJSON);

        self.canvasContainer.style.width = self.project.width+'px';
        self.canvasContainer.style.height = self.project.height+'px';
        self.canvasContainer.style.backgroundColor = self.project.backgroundColor;

        self.project.rootObject.generateObjectNameReferences(self.project.rootObject);
        initialStateProject.rootObject.generateObjectNameReferences(initialStateProject.rootObject);

        self.project.prepareForPlayer();
        initialStateProject.prepareForPlayer();

        // Make the camera
        window.camera = new WickCamera(self.project);

        // Setup renderer/input/audio player
        self.renderer = new WickPixiRenderer(self.canvasContainer);
        self.inputHandler = new WickPlayerInputHandler(self.canvasContainer, self.project);
        self.audioPlayer = new WickHowlerAudioPlayer(self.project);
        self.audioPlayer.reloadSoundsInProject(self.project);

        self.inputHandler.setup();

        self.project.loadFonts(function () {
            self.renderer.preloadAllAssets(self.project, function () {
                startUpdate();
            });
        });
    }

    window.runProject = function (projectJSON) {
        self.runProject(projectJSON)
    }

    self.stopRunningProject = function () {

        self.running = false;

        update();
        clearTimeout(loopTimeout);

        self.project = null;

        self.inputHandler.cleanup();
        self.audioPlayer.cleanup();
    }

    function startUpdate(fps) {
        then = Date.now();
        startTime = then;
        update(false);
    }

    var loopTimeout;
    var update = function (firstTick) {

        if(!self.running) return;

        if(stats) stats.begin();

        requestAnimationFrame(function() { update(false); });

        now = Date.now();
        elapsed = now - then;

        var fpsInterval = 1000/self.project.framerate;
        if (self.project.framerate === 60 || elapsed > fpsInterval) {
            then = now - (elapsed % fpsInterval);
            
            deleteObjects = [];
            if(!firstTick) {
                self.project.rootObject.generateObjectNameReferences()
                self.project.tick();
            }
            deleteObjects.forEach(function (d) {
                self.renderer.cleanupObjectTextures(d);
                d.remove();
                if(d.objectClonedFrom) {
                    var removeIndex = d.objectClonedFrom.clones.indexOf(d);
                    if(removeIndex !== -1) {
                        d.objectClonedFrom.clones.splice(removeIndex, 1);
                    }
                }
            });
            var activeObjs = self.project.rootObject.getAllActiveChildObjects();
            self.renderer.renderWickObjects(self.project, activeObjs, null, true);
            
            checkForSounds();

            self.inputHandler.update();
        }

        if(stats) stats.end();

    }

    function checkForSounds () {
        self.project.getAllFrames().forEach(function (frame) {
            if(frame._wantsToPlaySound) {
                self.audioPlayer.playSoundOnFrame(frame);
                frame._wantsToPlaySound = false;
            }
            if(frame._wantsToStopSound) {
                self.audioPlayer.stopSoundOnFrame(frame);
                frame._wantsToStopSound = false;
            }
        });
    }

    self.cloneObject = function (wickObj, args) {
        var clone = wickObj.copy();
        clone.name = undefined;
        clone.isClone = true;
        for(key in args) {
            clone[key] = args[key];
        }
        clone.asset = wickObj.asset;

        wickObj.clones.push(clone);

        clone.objectClonedFrom = wickObj;

        clone.prepareForPlayer()

        clone.parentObject = wickObj.parentObject;
        clone.parentFrame = wickObj.parentFrame;
        clone.parentObject.getCurrentLayer().getCurrentFrame().wickObjects.push(clone);
        clone.generateParentObjectReferences();

        return clone;
    }

    self.deleteObject = function (wickObj) {
        deleteObjects.push(wickObj);
        
    }

    self.resetStateOfObject = function (wickObject) {

        // Clones go away because they have no original state! :O
        if(wickObject.isClone) {
            self.deleteObject(wickObject)
            return;
        }

        var initialStateObject = initialStateProject.getObjectByUUID(wickObject.uuid);
        if(!initialStateObject) return;

        // TOXXXIC
        //console.log("-------------");
        var blacklist = ['_hitBox', 'asset', 'alphaMask', 'pixiSprite', 'pixiContainer', 'pixiText', 'audioData', 'wickScripts', 'parentObject', 'layers', '_active', '_wasActiveLastTick', '_scopeWrapper', 'parentFrame', 'bbox', 'tweens'];
        for (var name in wickObject) {
            if (name !== 'undefined' && wickObject.hasOwnProperty(name) && blacklist.indexOf(name) === -1) {
                if(initialStateObject[name] !== wickObject[name]) {
                    wickObject[name] = initialStateObject[name];
                }
            }
        }
        
        wickObject.hoveredOver = false;
        wickObject.playheadPosition = 0;
        wickObject._playing = true;

        // Don't forget to reset the childrens states
        if(wickObject.isSymbol) {
            wickObject.getAllChildObjects().forEach(function (child) {
                if(child.isSymbol)
                    wickPlayer.resetStateOfObject(child);
            });
        }

    }

}

// this is temporary, need a better system for this...
function runProject (json) {
    window.wickPlayer = new WickPlayer(); 
    window.wickPlayer.runProject(json);
}

function tryToLoadProjectFromWindowHash () {
    if(window.location.hash) {
        var projectPath = window.location.hash.slice(1); // remove first char (the hash)

        var xhr = new XMLHttpRequest();
        xhr.open('GET', projectPath, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function(e) {
          if (this.status == 200) {
            var byteArray = new Uint8Array(this.response);
            var wickProjectJSON = LZString.decompressFromUint8Array(byteArray);
            runProject(wickProjectJSON);
          }
        };

        xhr.send();
    }
}
if(!window.WickEditor) tryToLoadProjectFromWindowHash();
