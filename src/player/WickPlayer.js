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

    self.project;

    self.inputHandler;
    self.audioPlayer;

    self.canvasContainer;

    self.running = false;

    var initialStateProject;
    var stats;
    var statsEnabled = true;

    self.runProject = function (projectJSON) {

        try {
            if(window.parent && window.parent.wickEditor) window.wickEditor = window.parent.wickEditor;
        } catch (e) {
            console.log(e)
        }

        self.running = true;

        self.canvasContainer = document.getElementById('playerCanvasContainer');

        if(statsEnabled) {
            stats = new Stats();
            stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
            document.body.appendChild( stats.dom );
        }

        resetElapsedTime();

        // Load the project!
        self.project = WickProject.fromJSON(projectJSON);
        initialStateProject = WickProject.fromJSON(projectJSON);
        self.project.fitScreen = bowser.tablet || bowser.mobile;
        initialStateProject.fitScreen = bowser.tablet || bowser.mobile;

        self.canvasContainer.style.width = self.project.width+'px';
        self.canvasContainer.style.height = self.project.height+'px';

        self.project.rootObject.generateObjectNameReferences(self.project.rootObject);
        initialStateProject.rootObject.generateObjectNameReferences(initialStateProject.rootObject);

        self.project.prepareForPlayer();
        initialStateProject.prepareForPlayer();

        // Setup renderer/input/audio player
        self.renderer = new WickTwoRenderer(self.canvasContainer);
        self.inputHandler = new WickPlayerInputHandler(self.canvasContainer, self.project);
        self.audioPlayer = new WickHowlerAudioPlayer(self.project);
        self.htmlElemInjector = new WickHTMLElemInjector(self.project);

        self.inputHandler.setup(); 
        if(!bowser.mobile && !bowser.tablet) self.audioPlayer.setup();
        self.htmlElemInjector.setup();
        self.renderer.setup();

        var preloader = new WickPreloader();

        update(false);
    }

    self.stopRunningProject = function () {

        self.running = false;

        update();
        clearTimeout(loopTimeout);

        self.project = null;

        self.inputHandler.cleanup();
        self.audioPlayer.cleanup();
    }

    var loopTimeout;
    var update = function (firstTick) {

        if(!self.running) return;

        if(statsEnabled) stats.begin();

        if(self.project.framerate < 60) {
            loopTimeout = setTimeout(function() {

                if(self.running) {

                    if(!firstTick) self.project.tick();
                    if(self.project) self.renderer.render(self.project, self.project.rootObject.getAllActiveChildObjects());
                    if(self.project) self.htmlElemInjector.update();
                    self.inputHandler.update(false);

                    update();
                }
            }, 1000 / self.project.framerate);

        } else {

            if(self.running) {
                requestAnimationFrame(function () { update(false) });
            }
            if(!firstTick) self.project.tick();
            self.renderer.render(self.project, self.project.rootObject.getAllActiveChildObjects());
            self.htmlElemInjector.update();
            self.inputHandler.update();

        }

        if(statsEnabled) stats.end();

    }


///////////// DEPRECATED ZOOOOOONE!!!!!!!!!!!!!!!!!!!!!!!

    self.cloneObject = function (wickObj) {
        var clone = wickObj.copy();
        clone.isClone = true;
        clone.asset = wickObj.asset;

        clone.prepareForPlayer()

        clone.parentObject = wickObj.parentObject;
        clone.parentObject.getCurrentLayer().getCurrentFrame().wickObjects.push(clone);
        self.project.rootObject.generateParentObjectReferences();

        //window.wickRenderer.refresh(clone);

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
        var blacklist = ['asset', 'alphaMask', 'pixiSprite', 'pixiContainer', 'pixiText', 'audioData', 'wickScripts', 'parentObject', 'layers', '_active', '_wasActiveLastTick', '_scopeWrapper', 'parentFrame', 'bbox', 'tweens'];
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
                wickPlayer.resetStateOfObject(child);
            });
        }

    }

}
