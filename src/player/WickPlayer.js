/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var WickPlayer = function () {

    var self = this;

    self.project;

    self.inputHandler;
    self.renderer;
    self.audioPlayer;

    self.canvasContainer;

    var initialStateProject;
    var stopDrawLoop;


    self.runProject = function (projectJSON, canvasContainer) {

        stopDrawLoop = false;

        self.canvasContainer = canvasContainer;

        // Load the project!
        self.project = WickProject.fromJSON(projectJSON);
        initialStateProject = WickProject.fromJSON(projectJSON);
        self.project.fitScreen = !window.wickEditor;
        initialStateProject.fitScreen = !window.wickEditor;

        // Setup all the handlers n stuff
        self.inputHandler = new WickPlayerInputHandler(this, self.canvasContainer);
        self.renderer = new WickPixiRenderer(self.project, self.canvasContainer);
        self.audioPlayer = new WickWebAudioPlayer(self.project);

        self.inputHandler.setup();
        if(!bowser.mobile && !bowser.tablet) self.audioPlayer.setup();
        self.renderer.setup();

        animate();

        var preloader = new WickPreloader();

    }

    self.stopRunningProject = function () {

        self.project = null;

        stopDrawLoop = true;

        self.inputHandler.cleanup();
        self.audioPlayer.cleanup();
        self.renderer.cleanup();

    }

    self.enterFullscreen = function () {
        var elem;

        if(window.self !== window.top) {
            // Inside iframe
            elem = window.frameElement;
            console.log(elem)
        } else {
            // Not inside iframe
            elem = document.getElementById("rendererCanvas")
        }

        if (screenfull.enabled) {
            console.log("tryin to fullscreen");
            screenfull.request(elem);
        }
    }

    var animate = function () {

        if(self.project.framerate < 60) {
            setTimeout(function() {

                if(!stopDrawLoop) {
                    
                    self.project.rootObject.update();
                    self.project.rootObject.applyTweens();
                    self.renderer.render();
                    animate();
                    //requestAnimationFrame(animate);
                }
            }, 1000 / self.project.framerate);

        } else {

            if(!stopDrawLoop) {
                requestAnimationFrame(animate);
            }
            self.project.rootObject.update();
            self.project.rootObject.applyTweens();
            self.renderer.render();

        }

        keysJustPressed = []; 
    }





///////////// DEPRACTAETION ZOOOOEN!!!!!!!!!!!!!!!!!!!!!!!

    self.cloneObject = function (wickObj) {
        var clone = wickObj.copy();
        clone._isClone = true;

        // pixi stuff
        //renderer.refreshPixiSceneForObject(clone);
        //wickObj.parentObject.pixiContainer.addChild(clone.pixiContainer || clone.pixiSprite || clone.pixiText)

        // player stuff
        resetAllPlayheads(clone);
        resetAllEventStates(clone);

        clone.parentObject = project.rootObject;
        project.addObject(clone);
        renderer.refresh(clone);

        //project.addObject(clone);
        //clone.parentObject = project.rootObject;
        //wickObj.parentObject.addChild
        //project.regenerateUniqueIDs(project.rootObject);

        return clone;
    }

    self.deleteObject = function (wickObj) {
        //project.currentObject.removeChildByID(wickObj.id);
        // So for now don't actually delete it, just make it go away somehow cos i'm lazy
        wickObj.deleted = true;
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
        wickObject.justEnteredFrame = true;
        wickObject.onNewFrame = true;
        wickObject.onLoadScriptRan = false;
        wickObject.playheadPosition = 0;
        wickObject.isPlaying = true;

        // Don't forget to reset the childrens states
        if(wickObject.isSymbol) {
            wickObject.getAllChildObjects().forEach(function (child) {
                wickPlayer.resetStateOfObject(child);
            });
        }

    }

}