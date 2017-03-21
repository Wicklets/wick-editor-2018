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
    
WickPlayerInputHandler = function (wickPlayer) {

    var self = this;

    var mouse;
    var keys;
    var keysJustPressed; 

    var project;

    var canvasContainer;

    self.setup = function () {
        canvasContainer = window.rendererCanvas;

        mouse = { x : 0, y : 0 };
        keys = [];
        keysJustPressed = [];

        project = wickPlayer.project;

        if(bowser.mobile || bowser.tablet) {
            // Touch event (one touch = like a mouse click)
            canvasContainer.addEventListener("touchstart", onTouchStart, false);
            canvasContainer.addEventListener("touchmove", onTouchMove, false);

            // Squash gesture events
            canvasContainer.addEventListener('gesturestart',  function(e) { e.preventDefault(); });
            canvasContainer.addEventListener('gesturechange', function(e) { e.preventDefault(); });
            canvasContainer.addEventListener('gestureend',    function(e) { e.preventDefault(); });
        } else {
            canvasContainer.addEventListener('mousemove', onMouseMove, false);
            canvasContainer.addEventListener("mousedown", onMouseDown, false);

            canvasContainer.addEventListener("keydown", onKeyDown);
            canvasContainer.addEventListener("keyup", onKeyUp);
        }
    }

    self.update = function () {
        keysJustPressed = [];
    }

    self.cleanup = function () {
        canvasContainer.removeEventListener("mousedown", onMouseDown);
        canvasContainer.removeEventListener("touchstart", onTouchStart);
        canvasContainer.removeEventListener("touchmove", onTouchMove);

        canvasContainer.removeEventListener("keydown", onKeyDown);
        canvasContainer.removeEventListener("keyup", onKeyUp);
    }
    
    self.getMouse = function () {
        return mouse || {x:0,y:0};
    }

    self.getKeys = function () {
        return keys || [];
    }

    self.getKeysJustPressed = function () {
        return keysJustPressed || [];
    }

    self.keyIsDown = function (keyString) {
        return self.getKeys()[keyCharToCode[keyString.toUpperCase()]];
    }

    self.keyJustPressed = function (keyString) {
        return self.getKeysJustPressed()[keyCharToCode[keyString.toUpperCase()]];
    }

    self.hideCursor = function () {
        canvasContainer.className = 'hideCursor'
    }

    self.showCursor = function () {
        canvasContainer.className = ''
    }


    var onMouseMove = function (evt) {

        mouse = getMousePos(canvasContainer, evt);

        // Check if we're hovered over a clickable object...
        var hoveredOverObj = null;
        project.rootObject.getAllActiveChildObjectsRecursive(true).forEachBackwards(function(child) {
            if(child.isPointInside(mouse)) {
                child.hoveredOver = true;
                hoveredOverObj = child;
            } else {
                child.hoveredOver = false;
            }
        });

        //...and change the cursor if we are
        if(hoveredOverObj && hoveredOverObj.isButton) {
            canvasContainer.style.cursor = hoveredOverObj.cursor || "pointer";
        } else {
            canvasContainer.style.cursor = "default";
        }

    }

    var onMouseDown = function (evt) {
        
        project.rootObject.getAllActiveChildObjectsRecursive(true).forEachBackwards(function(child) {
            if(child.isPointInside(mouse)) {
                //project.runScript(child, "onClick");
                child._wasClicked = true;
            }
        });

    }

    var onKeyDown = function (event) {
        event.preventDefault();

        // Check for new keyDown...
        if (!keys[event.keyCode]) {
            keysJustPressed[event.keyCode] = true; 
        }

        keys[event.keyCode] = true;

        /*project.rootObject.getAllActiveChildObjectsRecursive(true).forEach(function(child) {
            child.runScript(child.wickScripts["onKeyDown"], 'onKeyDown');
        });*/
    }

    var onKeyUp = function (event) {
        event.preventDefault();
        
        keys[event.keyCode] = false;
    }

    var onTouchStart = function (evt) {

        evt.preventDefault();

        // on iOS, WebAudio context only gets 'unmuted' after first user interaction
        if(!audioContext) {
            wickPlayer.audioPlayer.setup(project);
        }

        var touchPos = getTouchPos(canvasContainer, evt);
        mouse = touchPos;

        project.rootObject.getAllActiveChildObjects().forEach(function(child) {
            if(child.isPointInside(touchPos)) {
                //project.runScript(child, "onClick");
                child._wasClicked = true;
            }
        });
        

    }

    var onTouchMove = function (evt) {

        evt.preventDefault();
        
        var touchPos = getTouchPos(canvasContainer, evt);
        mouse = touchPos;

    }

    var getMousePos = function (canvas, evt) {
        var canvasBoundingClientRect = canvas.getBoundingClientRect();

        var mouseX = evt.clientX;
        var mouseY = evt.clientY;

        if(project.fitScreen) {
            mouseX -= canvasBoundingClientRect.left;
            mouseY -= canvasBoundingClientRect.top;
        }

        mouseX -= window.wickRenderer.canvasTranslate.x;
        mouseY -= window.wickRenderer.canvasTranslate.y;

        mouseX /=  window.wickRenderer.canvasScale;
        mouseY /=  window.wickRenderer.canvasScale;

        var centeredCanvasOffsetX = (window.innerWidth  - project.width) / 2;
        var centeredCanvasOffsetY = (window.innerHeight - project.height) / 2;

        if(!project.fitScreen) {
            mouseX -= centeredCanvasOffsetX;
            mouseY -= centeredCanvasOffsetY;
        }

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

        if(project.fitScreen) {
            touchX -= canvasBoundingClientRect.left;
            touchY -= canvasBoundingClientRect.top;
        }

        touchX -= window.wickRenderer.canvasTranslate.x;
        touchY -= window.wickRenderer.canvasTranslate.y;

        touchX /=  window.wickRenderer.canvasScale;
        touchY /=  window.wickRenderer.canvasScale;

        var centeredCanvasOffsetX = (window.innerWidth - project.width) / 2;
        var centeredCanvasOffsetY = (window.innerHeight - project.height) / 2;

        if(!project.fitScreen) {
            touchX -= centeredCanvasOffsetX;
            touchY -= centeredCanvasOffsetY;
        }

        return {
            x: touchX,
            y: touchY
        };
    }

}