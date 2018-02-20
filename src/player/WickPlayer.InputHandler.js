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
    
WickPlayerInputHandler = function (canvasContainer, wickProject) {

    var self = this;

    var mouse;
    var mouseDiff;
    var lastMouse;
    var newMouse;
    var keys;
    var keysJustPressed; 
    var keysJustReleased;

    var _cachedKeysDown;
    var _cachedKeysJustPressed;
    var _cachedKeysJustReleased;

    var project;

    var canvas = canvasContainer.children[0];

    self.setup = function () {
        mouse = null;
        keys = [];
        keysJustPressed = [];
        keysJustReleased = [];

        if(bowser.mobile || bowser.tablet) {
            // Touch event (one touch = like a mouse click)
            document.body.addEventListener("touchstart", onTouchStart, false);
            document.body.addEventListener("touchmove", onTouchMove, false);

            // Squash gesture events
            document.body.addEventListener('gesturestart',  function(e) { e.preventDefault(); });
            document.body.addEventListener('gesturechange', function(e) { e.preventDefault(); });
            document.body.addEventListener('gestureend',    function(e) { e.preventDefault(); });
        } else {
            document.body.addEventListener('mousemove', onMouseMove, false);
            document.body.addEventListener("mousedown", onMouseDown, false);
            document.body.addEventListener("mouseup",   onMouseUp,   false);

            document.body.addEventListener("keydown", onKeyDown);
            document.body.addEventListener("keyup", onKeyUp);
        }
    }

    self.update = function () {
        keysJustPressed = [];
        keysJustReleased = [];

        _cachedKeysDown = null;
        _cachedKeysJustPressed = null;
        _cachedKeysJustReleased = null;

        lastMouse = mouse;
        if(newMouse) mouse = newMouse;

        if(mouse && lastMouse) {
            mouseDiff = {
                x: mouse.x - lastMouse.x,
                y: mouse.y - lastMouse.y
            }
        }
        if(mouse && lastMouse) {
            lastMouse.x = mouse.x;
            lastMouse.y = mouse.y;
        }
    }

    self.cleanup = function () {
        document.body.removeEventListener("mousedown", onMouseDown);
        document.body.removeEventListener("mousemove", onMouseMove);
        document.body.removeEventListener("mouseup", onMouseUp);

        document.body.removeEventListener("touchstart", onTouchStart);
        document.body.removeEventListener("touchmove", onTouchMove);

        document.body.removeEventListener("keydown", onKeyDown);
        document.body.removeEventListener("keyup", onKeyUp);
    }
    
    self.getMouse = function () {
        return mouse || {x:0,y:0};
    }

    self.getMouseDiff = function () {
        return mouseDiff || {x:0,y:0};
    }

    self.getKeys = function () {
        return keys || [];
    }

    self.getKeysJustPressed = function () {
        return keysJustPressed || [];
    }

    self.getKeysJustReleased = function () {
        return keysJustReleased || [];
    }

    self.keyIsDown = function (keyString) {
        return self.getKeys()[keyCharToCode[keyString.toUpperCase()]];
    }

    self.keyJustPressed = function (keyString) {
        return self.getKeysJustPressed()[keyCharToCode[keyString.toUpperCase()]];
    }

    self.getAllKeysDown = function () {
        if(_cachedKeysDown) return _cachedKeysDown;

        _cachedKeysDown = [];

        var _keys = self.getKeys();
        for(var i = 0; i < _keys.length; i++) {
            if(_keys[i]) {
                var c = codeToKeyChar[i];
                _cachedKeysDown.push(c);
            }
        }

        return _cachedKeysDown;
    }

    self.getAllKeysJustPressed = function () {
        if(_cachedKeysJustPressed) return _cachedKeysJustPressed;

        _cachedKeysJustPressed = [];

        var _keys = self.getKeysJustPressed();
        for(var i = 0; i < _keys.length; i++) {
            if(_keys[i]) {
                var c = codeToKeyChar[i];
                _cachedKeysJustPressed.push(c);
            }
        }

        return _cachedKeysJustPressed;
    }

    self.getAllKeysJustReleased = function () {
        if(_cachedKeysJustReleased) return _cachedKeysJustReleased;

        _cachedKeysJustReleased = [];

        var _keys = self.getKeysJustReleased();
        for(var i = 0; i < _keys.length; i++) {
            if(_keys[i]) {
                var c = codeToKeyChar[i];
                _cachedKeysJustReleased.push(c);
            }
        }

        return _cachedKeysJustReleased;
    }

    self.hideCursor = function () {
        canvasContainer.className = 'hideCursor'
    }

    self.showCursor = function () {
        canvasContainer.className = ''
    }


    var onMouseMove = function (evt) {

        setMousePos(calcMousePos(canvasContainer, evt));

        canvasContainer.style.cursor = "default";

        // Check if we're hovered over a clickable object...
        var hoveredOverObj = null;
        wickProject.rootObject.getAllActiveChildObjectsRecursive(true).forEachBackwards(function(child) {
            if(!child.isSymbol) return;

            if(!(hoveredOverObj && hoveredOverObj.isButton) && child.isPointInside(self.getMouse())) {
                if(!child.hoveredOver) {
                    child._wasHoveredOver = true;
                }
                if(child.isButton) canvasContainer.style.cursor = child.cursor || "pointer";
                child.hoveredOver = true;
                hoveredOverObj = child;
            } else {
                if(child.hoveredOver) {
                    child._mouseJustLeft = true;
                }
                child.hoveredOver = false;
            }
        });

    }

    var onMouseDown = function (evt) {

        canvasContainer.focus();

        // Hack to avoid "'requestFullscreen' can only be initiated by a user gesture." error
        if(wickPlayer.fullscreenRequested) {
            wickPlayer.enterFullscreen();
            wickPlayer.fullscreenRequested = false;
        }

        var currFrame = wickProject.getCurrentFrame();
        if(currFrame) {
            currFrame._wasClicked = true;
            currFrame._beingClicked = true;
        }
        
        var clickedObj;
        wickProject.rootObject.getAllActiveChildObjectsRecursive(true).forEachBackwards(function(child) {
            if(!(clickedObj && clickedObj.isButton) && child.isPointInside(self.getMouse())) {
                child._wasClicked = true;
                child._beingClicked = true;
                clickedObj = child;
            }
        });

    }

    var onMouseUp = function (evt) {
        var currFrame = wickProject.getCurrentFrame();
        if(currFrame) {
            currFrame._beingClicked = false;
            currFrame._wasClickedOff = true;
        }

        wickProject.rootObject.getAllActiveChildObjectsRecursive(true).forEachBackwards(function(child) {
            child._beingClicked = false;

            if(child.isPointInside(self.getMouse())) {
                child._wasClickedOff = true;
            }
        });
    }

    var onKeyDown = function (event) {
        event.preventDefault();

        // Quit builtin editor
        if(window.wickEditor && event.keyCode === 27) {
            window.wickEditor.guiActionHandler.doAction('stopRunningProject')
        }

        // Check for new keyDown...
        if (!keys[event.keyCode]) {
            keysJustPressed[event.keyCode] = true; 
        }

        keys[event.keyCode] = true;
    }

    var onKeyUp = function (event) {
        event.preventDefault();

        keysJustReleased[event.keyCode] = true;
        
        keys[event.keyCode] = false;
    }

    var onTouchStart = function (evt) {

        document.getElementById('rendererCanvas').focus();

        evt.preventDefault();

        // on iOS, WebAudio context only gets 'unmuted' after first user interaction
        if(!audioContext) {
            wickPlayer.audioPlayer.setup(wickProject);
        }

        var touchPos = getTouchPos(canvasContainer, evt);
        setMousePos(touchPos);

        wickProject.rootObject.getAllActiveChildObjects().forEach(function(child) {
            if(child.isPointInside(touchPos)) {
                child._wasClicked = true;
            }
        });
        

    }

    var onTouchMove = function (evt) {

        evt.preventDefault();
        
        var touchPos = getTouchPos(canvasContainer, evt);
        setMousePos(touchPos);

    }

    var calcMousePos = function (canvas, evt) {
        var canvasBoundingClientRect = canvas.getBoundingClientRect();

        var mouseX = evt.clientX;
        var mouseY = evt.clientY;

        return {
            x: mouseX,
            y: mouseY
        };
    }

    var getTouchPos = function (canvas, evt) {
        var canvasBoundingClientRect = canvas.getBoundingClientRect();

        var touch = evt.targetTouches[0];

        var touchX = touch.pageX;
        var touchY = touch.pageY;

        return {
            x: touchX,
            y: touchY
        };
    }

    var setMousePos = function (newPos) {
        var windowScale = getWindowScale();
        newMouse = {
            x: newPos.x * windowScale.x,
            y: newPos.y * windowScale.y
        }
    }

    var getWindowScale = function () {
        // Fit to screen disabled for now.
        return {
            x:1,
            y:1
        }
        /*return {
            x: wickProject.width / window.innerWidth,
            y: wickProject.height / window.innerHeight
        }*/
    }

}