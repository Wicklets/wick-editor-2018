/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var WickPlayer = function () {

    var self = this;

    self.project;

    self.inputHandler;
    self.audioPlayer;

    self.canvasContainer;

    self.running = false;

    var initialStateProject;

    var tick;


    self.runProject = function (projectJSON) {

        self.running = true;

        tick = 1;

        window.rendererCanvas = document.getElementById('playerCanvasContainer');
        self.canvasContainer = window.rendererCanvas;

        // Load the project!
        self.project = WickProject.fromJSON(projectJSON);
        initialStateProject = WickProject.fromJSON(projectJSON);
        self.project.fitScreen = !window.wickEditor;
        initialStateProject.fitScreen = !window.wickEditor;
        self.project.prepareForPlayer();
        initialStateProject.prepareForPlayer();

        // Setup renderer/input/audio player
        if(!window.wickRenderer) {
            window.wickRenderer = new WickPixiRenderer(self.canvasContainer);
            window.wickRenderer.setProject(self.project);
            window.wickRenderer.setup();
        }
        window.wickRenderer.setProject(self.project);
        self.inputHandler = new WickPlayerInputHandler(this, self.canvasContainer);
        self.audioPlayer = new WickWebAudioPlayer(self.project);

        self.inputHandler.setup();
        if(!bowser.mobile && !bowser.tablet) self.audioPlayer.setup();
        window.wickRenderer.refresh(self.project.rootObject);

        var preloader = new WickPreloader();

        self.project.tick();
        window.wickRenderer.render(self.project.rootObject.getAllActiveChildObjects());
        update();

    }

    self.stopRunningProject = function () {

        self.running = false;

        update();
        clearTimeout(loopTimeout);

        self.project = null;

        self.inputHandler.cleanup();
        self.audioPlayer.cleanup();
        //window.wickRenderer.cleanup();

    }

    self.enterFullscreen = function () {
        window.wickRenderer.enterFullscreen();
    }

    var loopTimeout;
    var update = function () {

        if(!self.running) return;

        if(self.project.framerate < 60) {
            loopTimeout = setTimeout(function() {

                if(self.running) {

                    self.project.tick();
                    window.wickRenderer.render(self.project.rootObject.getAllActiveChildObjects());
                    self.inputHandler.update();

                    update();
                }
            }, 1000 / self.project.framerate);

        } else {

            if(self.running) {
                requestAnimationFrame(update);
            }
            self.project.tick();
            window.wickRenderer.render(self.project.rootObject.getAllActiveChildObjects());
            self.inputHandler.update();

        }

    }





///////////// DEPRACTAETION ZOOOOEN!!!!!!!!!!!!!!!!!!!!!!!

    self.cloneObject = function (wickObj) {
        var clone = wickObj.copy();
        clone.isClone = true;

        clone.prepareForPlayer()

        clone.parentObject = wickObj.parentObject;
        clone.parentObject.getCurrentLayer().getCurrentFrame().wickObjects.push(clone);
        self.project.rootObject.generateParentObjectReferences();

        window.pixiRenderer.refresh(clone);

        return clone;
    }

    self.deleteObject = function (wickObj) {
        //project.currentObject.removeChildByID(wickObj.id);
        // So for now don't actually delete it, just make it go away somehow cos i'm lazy
        wickObj._deleted = true;
        // JUST GET IT OUTTA HERE I DONT CARE ................. 
        // it's like 8am pls forgive me for this
        wickObj.x = 80608060 + Math.random()*10000;
        wickObj.y = 80608060 + Math.random()*10000;
        wickObj.name = undefined;
    }

    self.resetStateOfObject = function (wickObject) {

        // Clones go away because they have no original state! :O
        if(wickObject.isClone) {
            project.currentObject.removeChild(wickObject);
            return;
        }

        var initialStateObject = initialStateProject.getObjectByUUID(wickObject.uuid);
        if(!initialStateObject) return;

        // TOXXXIC
        //console.log("-------------");
        var blacklist = ['alphaMask', 'pixiSprite', 'pixiContainer', 'pixiText', 'imageData', 'audioData', 'wickScripts', 'parentObject', 'layers'];
        for (var name in wickObject) {
            if (name !== 'undefined' && wickObject.hasOwnProperty(name) && blacklist.indexOf(name) === -1) {
                if(initialStateObject[name] !== wickObject[name]) {
                    //console.log(name)
                    //console.log(wickObject[name] + " // " + initialStateObject[name])
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
                wickPlayer.resetStateOfObject(child);
            });
        }

    }

}