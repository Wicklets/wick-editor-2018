/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var WickPlayer = (function () {

    var wickPlayer = { };

    // Current project being played by player
    var project;

    // Input vars for mouse and keyboard
    var mouse = {x:0, y:0};
    var keys = [];
    var key; // last key pressed

    // Renderer
    var rendererContainerEl;
    var renderer;
    var stage;

    var projectFitScreenScale;
    var projectFitScreenTranslate;

    // Audio stuff
    var audioContext;
    var readyToStartWebAudioContext;

    // Flags for different player modes (phone or desktop)
    var mobileMode;
    var desktopMode;

    // Set this to true to stop the next requestAnimationFrame
    var stopDrawLoop;

/*****************************
    Player Setup
*****************************/

    wickPlayer.runProject = function(projectJSON) {

        stopDrawLoop = false;

        // Check if we're on a mobile device or not
        mobileMode = BrowserDetectionUtils.inMobileMode;
        desktopMode = !mobileMode;

        // Setup WebAudio context
        if(!mobileMode) {
            setupWebAudioContext();
        }

        // Load the project!
        loadJSONProject(projectJSON);

        // Make sure we're in the rootObject (the editor can save what object was last edited)
        project.currentObjectID = project.rootObject.id;

        // Setup renderer
        rendererContainerEl = document.getElementById("playerCanvasContainer");
        var rendererOptions = {
            backgroundColor : "#DDDDDD", 
            resolution: window.devicePixelRatio };
        renderer = PIXI.autoDetectRenderer(project.resolution.x, project.resolution.y, rendererOptions);
        renderer.clearBeforeRender = false;

        // Get rid of old canvas (if it exists)
        var oldRendererCanvas = document.getElementById("rendererCanvas");
        if(oldRendererCanvas) {
            rendererContainerEl.removeChild(rendererContainerEl.childNodes[0]);
        }

        // Add renderer canvas
        rendererContainerEl.appendChild(renderer.view);
        renderer.view.id = "rendererCanvas";
        stage = new PIXI.Container();

        projectFitScreenScale = 1.0;
        projectFitScreenTranslate = {x : 0, y : 0};

        resizeCanvas();
        animate();

        // Setup mouse and key events (desktop mode)
        mouse = { x : 0, y : 0 };
        keys = [];
        if(desktopMode) {
            renderer.view.addEventListener('mousemove', onMouseMove, false);
            rendererContainerEl.addEventListener("mousedown", onMouseDown, false);

            document.body.addEventListener("keydown", handleKeyDownInput);
            document.body.addEventListener("keyup", handleKeyUpInput);
        }

        // Setup touch events (mobile mode)
        if(mobileMode) {
            // Touch event (one touch = like a mouse click)
            document.body.addEventListener("touchstart", onTouchStart, false);

            // Squash gesture events
            document.body.addEventListener('gesturestart',  function(e) { e.preventDefault(); });
            document.body.addEventListener('gesturechange', function(e) { e.preventDefault(); });
            document.body.addEventListener('gestureend',    function(e) { e.preventDefault(); });
        }

        // update canvas size on window resize
        window.addEventListener('resize', resizeCanvas, false);

    }

    wickPlayer.stopRunningCurrentProject = function() {

        stopDrawLoop = true;

        rendererContainerEl.removeEventListener("mousedown", onMouseDown);
        rendererContainerEl.removeEventListener("touchstart", onTouchStart);

        document.body.removeEventListener("keydown", handleKeyDownInput);
        document.body.removeEventListener("keyup", handleKeyUpInput);

        window.removeEventListener('resize', resizeCanvas);

        audioContext.close();

    }

/*****************************
    WebAudio Context
*****************************/

    var setupWebAudioContext = function () {
        var AudioContext = window.AudioContext // Default
                        || window.webkitAudioContext // Safari and old versions of Chrome
                        || false;
        audioContext = new AudioContext();

        if(!audioContext) {
            alert("WebAudio not supported! Sounds will not play.");
            return;
        }

        // Setup dummy node and discard it to get webaudio context running
        if(audioContext.createGainNode) {
            audioContext.createGainNode();
        } else {
            audioContext.createGain();
        }
    }

    var playSound = function (buffer, loop) {
        if(!project.muted) {
            var source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.loop = loop;
            source.start(0);
            console.log("started...");
        }
    }

/*****************************
    Opening projects
*****************************/

    var loadJSONProject = function (proj) {
        // Parse dat project
        project = JSON.parse(proj);

        console.log("Player loading project:")
        console.log(project);

        // Put prototypes back on WickObjects
        WickObject.addPrototypes(project.rootObject);

        // Decode scripts/text from json-safe format
        project.rootObject.decodeStrings();

        // Prepare all objects for being played/drawn
        resetAllPlayheads(project.rootObject);
        resetAllEventStates(project.rootObject);

        // Regenerate WickObject stuff that we lost when the projects was JSONified
        generateObjectNameReferences(project.rootObject);
        generateObjectParentReferences(project.rootObject);

        project.rootObject.regenerateParentObjectReferences();

        // Convert base 64 data into content
        loadImages(project.rootObject);
        if(!mobileMode) {
            loadAudio(project.rootObject);
        }
    }

    /* Create variables inside each wickobject so we can say root.bogoObject.play(); and such */
    var generateObjectNameReferences = function (wickObj) {
        wickObj.getAllChildObjects().forEach(function(subObj) {
            wickObj[subObj.name] = subObj;

            if(subObj.isSymbol) {
                generateObjectNameReferences(subObj);
            }
        });
    }

    /* We'll need these when evaling scripts */
    var generateObjectParentReferences = function (wickObj) {
        wickObj.getAllChildObjects().forEach(function(subObj) {
            subObj.parentObj = wickObj;
            if(subObj.isSymbol) {
                generateObjectParentReferences(subObj);
            }
        });
    }

    /* Make sure all objects start at first frame and start playing */
    var resetAllPlayheads = function (wickObj) {

        // Set all playhead vars
        if(wickObj.isSymbol) {
            // Set this object to it's first frame
            wickObj.playheadPosition = 0;

            // Start the object playing
            wickObj.isPlaying = true;

            // Recursively set all playhead vars of children
            wickObj.getAllChildObjects().forEach(function(subObj) {
                resetAllPlayheads(subObj);
            });
        }
    }

    /* */
    var resetAllEventStates = function (wickObj) {

        // Reset the mouse hovered over state flag
        wickObj.hoveredOver = false;

        // All WickObjects are ready to play their sounds, run their onLoad scripts, etc.
        wickObj.justEnteredFrame = true;
        wickObj.onNewFrame = true;

        // Do the same for all this object's children
        if(wickObj.isSymbol) {
            wickObj.getAllChildObjects().forEach(function(subObj) {
                resetAllEventStates(subObj);
            });
        }

    }

    /* Recursively load images of wickObj */
    var loadImages = function (wickObj) {

        wickObj.pixiContainer = new PIXI.Container();

        wickObj.getAllChildObjects().forEach(function(subObj) {
            if (subObj.isSymbol) {
                loadImages(subObj);
                wickObj.pixiContainer.addChild(subObj.pixiContainer);
            } else if (subObj.imageData || subObj.svgCacheImageData) {
                // Generate alpha mask for per-pixel hit detection
                var image = new Image();
                image.onload = function () {
                    var canvas = document.createElement('canvas');
                    var w = Math.floor(subObj.width);
                    var h = Math.floor(subObj.height);
                    canvas.height = h;
                    canvas.width = w;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage( image, 0, 0, w, h );
                    var imgdata = ctx.getImageData(0,0,w,h);
                    var rgba = imgdata.data;

                    subObj.alphaMask = [];
                    for (var y = 0; y < h; y ++) {
                        for (var x = 0; x < w; x ++) {
                            var alphaMaskIndex = x+y*w;
                            //console.log(alphaMaskIndex)
                            subObj.alphaMask[alphaMaskIndex] = rgba[alphaMaskIndex*4+3] === 0;
                        }
                    }

                }
                image.src = subObj.imageData || subObj.svgCacheImageData;

                subObj.pixiSprite = PIXI.Sprite.fromImage(subObj.imageData || subObj.svgCacheImageData);
                wickObj.pixiContainer.addChild(subObj.pixiSprite);
            } else if (subObj.fontData) {
                var style = {
                    font : "normal " + subObj.fontData.fontSize + "px " + subObj.fontData.fontFamily,
                    fill : subObj.fontData.fill,
                    wordWrap : true,
                    wordWrapWidth : 440
                };
                subObj.pixiText = new PIXI.Text(subObj.fontData.text, style);
                subObj.setText = function (text) { subObj.pixiText.setText(text); };
                wickObj.pixiContainer.addChild(subObj.pixiText);
            }
        });
    }

    /* Recursively load audio of wickObj */
    var loadAudio = function (wickObj) {

        if(wickObj.audioData) {
            var rawData = wickObj.audioData.split(",")[1]; // cut off extra filetype/etc data
            var rawBuffer = Base64ArrayBuffer.decode(rawData);
            //wickObj.audioBuffer = rawBuffer;
            audioContext.decodeAudioData(rawBuffer, function (buffer) {
                if (!buffer) {
                    console.error("failed to decode:", "buffer null");
                    return;
                }
                wickObj.audioBuffer = buffer
                wickObj.playSound = function () {
                    playSound(wickObj.audioBuffer, wickObj.loopSound);
                }
            }, function (error) {
                console.error("failed to decode:", error);
            });
        }

        if(wickObj.isSymbol) {
            wickObj.getAllChildObjects().forEach(function(subObj) {
                loadAudio(subObj);
            });
        }
    }

/*****************************
    Common event functions
*****************************/

    var resizeCanvas = function () {

        if(project && project.fitScreen) {
            // Calculate how much the project would have to scale to fit either dimension
            widthRatio  = window.innerWidth  / project.resolution.x;
            heightRatio = window.innerHeight / project.resolution.y;

            // Fit only so much that stuff doesn't get cut off
            if(widthRatio > heightRatio) {
                projectFitScreenScale = heightRatio;
            } else {
                projectFitScreenScale = widthRatio;
            }

            renderer.view.style.width  = project.resolution.x * projectFitScreenScale + "px";
            renderer.view.style.height = project.resolution.y * projectFitScreenScale + "px";

            if(widthRatio > heightRatio) {
                var offset = (window.innerWidth - project.resolution.x * projectFitScreenScale) / 2;
                rendererContainerEl.style.paddingLeft = offset + "px";
                rendererContainerEl.style.paddingTop  = "0px";
            } else {
                var offset = (window.innerHeight - project.resolution.y * projectFitScreenScale) / 2;
                rendererContainerEl.style.paddingLeft = "0px";
                rendererContainerEl.style.paddingTop  = offset + "px";
            }
        } else {
            renderer.view.style.width  = project.resolution.x + "px";
            renderer.view.style.height = project.resolution.y + "px";

            var offsetX = (window.innerWidth  - project.resolution.x) / 2;
            var offsetY = (window.innerHeight - project.resolution.y) / 2;

            rendererContainerEl.style.paddingLeft   = offsetX + "px";
            rendererContainerEl.style.paddingRight  = offsetX + "px";
            rendererContainerEl.style.paddingTop    = offsetY + "px";
            rendererContainerEl.style.paddingBottom = offsetY + "px";
        }

    }

/*****************************
    Desktop event functions
*****************************/

    var onMouseMove = function (evt) {

        mouse = getMousePos(renderer.view, evt);

        // Check if we're hovered over a clickable object...
        var hoveredOverObj = false;
        project.rootObject.getAllActiveChildObjects().forEach(function(currObj) {
            if(pointInsideObj(currObj, mouse) && wickObjectIsClickable(currObj)) {
                currObj.hoveredOver = true;
                hoveredOverObj = true;
            } else {
                currObj.hoveredOver = false;
            }
        });

        //...and change the cursor if we are
        if(hoveredOverObj) {
            rendererContainerEl.style.cursor = "pointer";
        } else {
            rendererContainerEl.style.cursor = "default";
        }

    }

    var onMouseDown = function (evt) {
        
        project.rootObject.getAllActiveChildObjects().forEach(function(currObj) {
            if(pointInsideObj(currObj, mouse) && wickObjectIsClickable(currObj)) {
                runOnClickScript(currObj);
            }
        });

    }

    var handleKeyDownInput = function (event) {
        keys[event.keyCode] = true;
        key = codeToKeyChar[event.keyCode];

        project.rootObject.getAllActiveChildObjects().forEach(function(currObj) {
            runKeyDownScript(currObj);
        });
    }

    var handleKeyUpInput = function (event) {
        keys[event.keyCode] = false;
    }

/*****************************
    Mobile event functions
*****************************/

    var onTouchStart = function (evt) {

        evt.preventDefault();

        // on iOS, WebAudio context only gets 'unmuted' after first user interaction
        if(!audioContext) {
            setupWebAudioContext();
            loadAudio(project.rootObject);
        }

        var touchPos = getTouchPos(renderer.view, evt);

        project.rootObject.getAllActiveChildObjects().forEach(function(currObj) {
            if(pointInsideObj(currObj, touchPos) && wickObjectIsClickable(currObj)) {
                runOnClickScript(currObj);
            }
        });

    }

/*****************************
    Page/DOM Utils
*****************************/

    var getMousePos = function (canvas, evt) {
        var canvasBoundingClientRect = canvas.getBoundingClientRect();

        var mouseX = evt.clientX;
        var mouseY = evt.clientY;

        if(project.fitScreen) {
            mouseX -= canvasBoundingClientRect.left;
            mouseY -= canvasBoundingClientRect.top;
        }

        mouseX -= projectFitScreenTranslate.x;
        mouseY -= projectFitScreenTranslate.y;

        mouseX /=  projectFitScreenScale;
        mouseY /=  projectFitScreenScale;

        var centeredCanvasOffsetX = (window.innerWidth - project.resolution.x) / 2;
        var centeredCanvasOffsetY = (window.innerHeight - project.resolution.y) / 2;

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

        touchX -= projectFitScreenTranslate.x;
        touchY -= projectFitScreenTranslate.y;

        touchX /=  projectFitScreenScale;
        touchY /=  projectFitScreenScale;

        var centeredCanvasOffsetX = (window.innerWidth - project.resolution.x) / 2;
        var centeredCanvasOffsetY = (window.innerHeight - project.resolution.y) / 2;

        if(!project.fitScreen) {
            touchX -= centeredCanvasOffsetX;
            touchY -= centeredCanvasOffsetY;
        }

        return {
            x: touchX,
            y: touchY
        };
    }

/*****************************
    WickObject Utils
*****************************/

    /*  */
    var pointInsideObj = function(obj, point, parentScaleX, parentScaleY) {

        if(!parentScaleX) {
            parentScaleX = 1.0;
        }
        if(!parentScaleY) {
            parentScaleY = 1.0;
        }

        if(obj.isSymbol) {

            var pointInsideSymbol = false;

            obj.getAllActiveChildObjects().forEach(function (currObj) {
                var subPoint = {
                    x : point.x - obj.x,
                    y : point.y - obj.y
                };
                if(pointInsideObj(currObj, subPoint, obj.scaleX, obj.scaleY)) {
                    pointInsideSymbol = true;
                }
            });

            return pointInsideSymbol;

        } else {

            var scaledObjX = obj.x;
            var scaledObjY = obj.y;
            var scaledObjWidth = obj.width*obj.scaleX*parentScaleX;
            var scaledObjHeight = obj.height*obj.scaleY*parentScaleY;

            if ( point.x >= scaledObjX && 
                 point.y >= scaledObjY  &&
                 point.x <= scaledObjX + scaledObjWidth && 
                 point.y <= scaledObjY  + scaledObjHeight ) {

                if(!obj.alphaMask) return true;

                var objectRelativePointX = point.x - scaledObjX;
                var objectRelativePointY = point.y - scaledObjY;
                var objectAlphaMaskIndex = (Math.floor(objectRelativePointX)%Math.floor(obj.width))+(Math.floor(objectRelativePointY)*Math.floor(obj.width));
                return !obj.alphaMask[(objectAlphaMaskIndex)];

            }

            return false;

        }
    }

    var wickObjectIsClickable = function (wickObj) {
        var isClickable = false;

        wickObj.wickScripts['onClick'].split("\n").forEach(function (line) {
            if(isClickable) return;
            line = line.trim();
            if(!line.startsWith("//") && line !== "") {
                isClickable = true;
            }
        });

        return isClickable
    }

/*****************************
    Draw/update loop
*****************************/

    var animate = function () {

        if(project.framerate < 60) {
            setTimeout(function() {

                if(!stopDrawLoop) {
                    
                    update();
                    draw();
                    animate();
                    //requestAnimationFrame(animate);
                }
            }, 1000 / project.framerate);

        } else {

            if(!stopDrawLoop) {
                requestAnimationFrame(animate);
            }
            update();
            draw();

        }

    }

/*****************************
    Update/run scripts
*****************************/

    var update = function () {
        
        updateObj(project.rootObject);

    }

    var updateObj = function (obj) {

        if(obj.onNewFrame) {
            if(obj.isSymbol && !obj.getCurrentFrame().autoplay) {
                obj.isPlaying = false;
            }

            obj.onNewFrame = false;
        }

        if(obj.justEnteredFrame) {

            runOnLoadScript(obj);
            
            if(audioContext && obj.audioBuffer && obj.autoplaySound) {
                obj.playSound();
            }

            obj.justEnteredFrame = false;
        }

        runUpdateScript(obj);

        if(obj.isSymbol) {
            advanceTimeline(obj);

            obj.getAllActiveChildObjects().forEach(function(subObj) {
                updateObj(subObj);
            });
        }

        obj.readyToAdvance = true;

    }

    var runOnLoadScript = function (obj) {

        // Run onLoad script
        if(obj && !obj.isRoot && obj.wickScripts) {
            evalScript(obj, obj.wickScripts.onLoad);
        }

    }

    var runUpdateScript = function (obj) {

        // Run update script
        if(obj && !obj.isRoot && obj.wickScripts) {
            evalScript(obj, obj.wickScripts.onUpdate);
        }

    }

    var runOnClickScript = function (obj) {

        if(obj.wickScripts.onClick) {
            evalScript(obj, obj.wickScripts.onClick);
        }

    }

    var runKeyDownScript = function (obj) {

        if(obj.wickScripts.onKeyDown) {
            evalScript(obj, obj.wickScripts.onKeyDown);
        }

    }

    var evalScript = function (obj, script) {

        // Setup builtin wick scripting methods and objects
        var play          = function ()      { obj.parentObj.play(); }
        var stop          = function ()      { obj.parentObj.stop(); }
        var gotoAndPlay   = function (frame) { obj.parentObj.gotoAndPlay(frame); }
        var gotoAndStop   = function (frame) { obj.parentObj.gotoAndStop(frame); }
        var gotoNextFrame = function ()      { obj.parentObj.gotoNextFrame(); }
        var gotoPrevFrame = function ()      { obj.parentObj.gotoPrevFrame(); }

        // Setup keycode shortcuts
        var isKeyDown = function (keyString) { return keys[keyCharToCode[keyString]]; };

        // Setup wickobject reference variables
        var root = project.rootObject;
        var parent = obj.parentObj;

        // WickObjects in same frame (scope) are accessable without using root./parent.
        obj.parentObj.getAllChildObjects().forEach(function(subObj) {
            window[subObj.name] = subObj;
        });

        // 'this.' can access the object running this script
        for(var i = 0; i < 100; i++) { // !!! why plseae dont do this
            script = script.replace("this.","obj.");
        }
        
        // Run da script!!
        try {
            eval(script);
        } catch (e) {
            if(window.wickEditor) {
                console.error("Exeption thrown while running script of WickObject with ID " + obj.id)
                console.log(e);
                wickEditor.interfaces.builtinplayer.running = false;
                WickPlayer.stopRunningCurrentProject();
                wickEditor.syncInterfaces();
            } else {
                alert("An exception was thrown while running a WickObject script. See console!");
                console.log(e);
            }
        }

        // Get rid of wickobject reference variables
        obj.parentObj.getAllChildObjects().forEach(function(subObj) {
            window[subObj.name] = undefined;
        });

    }

    var advanceTimeline = function (obj) { 
        // Advance timeline for this object
        if(obj.isPlaying && obj.readyToAdvance) {

            var oldFrame = obj.getCurrentFrame();
            obj.playheadPosition ++;

            // If we reached the end, go back to the beginning 
            if(obj.playheadPosition >= obj.getTotalTimelineLength()) {
                obj.playheadPosition = 0;
            }

            var newFrame = obj.getCurrentFrame();

            if(oldFrame !== newFrame) {
                obj.onNewFrame = true;
                obj.getAllActiveChildObjects().forEach(function (child) {
                    child.justEnteredFrame = true;
                });
            }
        }

    }

/*****************************
    Draw
*****************************/

    var draw = function () {

        var graphics = new PIXI.Graphics();
        graphics.beginFill(parseInt(project.backgroundColor.replace("#","0x")));
        graphics.drawRect(0, 0, project.resolution.x, project.resolution.y);
        graphics.endFill();
        renderer.render(graphics);

        resetAllPixiObjects(project.rootObject);
        updatePixiObjectTransforms(project.rootObject);
        renderer.render(project.rootObject.pixiContainer);
    }

    var resetAllPixiObjects = function (wickObj) {

        wickObj.getAllChildObjects().forEach(function(subObj) {
            if(subObj.pixiSprite) {
                subObj.pixiSprite.visible = false;
            }
            if(subObj.pixiText) {
                subObj.pixiText.visible = false;
            }
            if(subObj.pixiContainer) {
                subObj.pixiContainer.visible = false;
            }

            if(subObj.isSymbol) {
                resetAllPixiObjects(subObj);
            }
        });

    }

    var updatePixiObjectTransforms = function (wickObj) {

        if(wickObj.isSymbol) {
            wickObj.pixiContainer.visible = true;
            if(!wickObj.isRoot) {
                wickObj.pixiContainer.anchor = new PIXI.Point(0.5, 0.5);
                wickObj.pixiContainer.position.x        = wickObj.x;
                wickObj.pixiContainer.position.y        = wickObj.y;
                wickObj.pixiContainer.rotation = wickObj.angle/360*2*3.14159;
                wickObj.pixiContainer.scale.x  = wickObj.scaleX;
                wickObj.pixiContainer.scale.y  = wickObj.scaleY;
                if(wickObj.flipX) { wickObj.pixiContainer.scale.x *= -1; wickObj.pixiContainer.position.x += wickObj.width }
                if(wickObj.flipY) { wickObj.pixiContainer.scale.y *= -1; wickObj.pixiContainer.position.y += wickObj.height }
                wickObj.pixiContainer.alpha    = wickObj.opacity;
            }
            wickObj.getAllActiveChildObjects().forEach(function(subObj) {
                updatePixiObjectTransforms(subObj);
            });
        } else {
            if(wickObj.pixiSprite) {
                wickObj.pixiSprite.visible = true;
                wickObj.pixiSprite.anchor = new PIXI.Point(0.5, 0.5);
                wickObj.pixiSprite.x        = wickObj.x + wickObj.width /2*wickObj.scaleX;
                wickObj.pixiSprite.y        = wickObj.y + wickObj.height/2*wickObj.scaleY;
                wickObj.pixiSprite.rotation = wickObj.angle/360*2*3.14159;
                wickObj.pixiSprite.scale.x  = wickObj.scaleX / window.devicePixelRatio;
                wickObj.pixiSprite.scale.y  = wickObj.scaleY / window.devicePixelRatio;
                if(wickObj.flipX) wickObj.pixiSprite.scale.x *= -1;
                if(wickObj.flipY) wickObj.pixiSprite.scale.y *= -1;
                wickObj.pixiSprite.alpha    = wickObj.opacity;
            } else if(wickObj.pixiText) {
                wickObj.pixiText.visible = true;
                //wickObj.pixiText.anchor = new PIXI.Point(0.5, 0.5);
                wickObj.pixiText.x        = wickObj.x;
                wickObj.pixiText.y        = wickObj.y;
                wickObj.pixiText.rotation = wickObj.angle/360*2*3.14159;
                wickObj.pixiText.scale.x  = wickObj.scaleX;
                wickObj.pixiText.scale.y  = wickObj.scaleY;
                if(wickObj.flipX) wickObj.pixiText.scale.x *= -1;
                if(wickObj.flipY) wickObj.pixiText.scale.y *= -1;
                wickObj.pixiText.alpha    = wickObj.opacity;
            }
        }

    }

    return wickPlayer;

})();