var WickPlayer = (function () {

    var wickPlayer = { };

    // Current project being played by player
    var project;

    // Input vars for mouse and (later) keyboard and accelerometer
    var mouse;
    var keys;

    // Canvas stuff (To be replaced with three/webgl/pixi)
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
        
        // Setup renderer
        rendererContainerEl = document.getElementById("playerCanvasContainer");
        renderer = PIXI.autoDetectRenderer(project.resolution.x, project.resolution.y, {backgroundColor : 0x1099bb});
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
            rendererContainerEl.addEventListener("touchstart", onTouchStart, false);

            // Squash gesture events
            rendererContainerEl.addEventListener('gesturestart', function(e) {  e.preventDefault(); });
            rendererContainerEl.addEventListener('gesturechange', function(e) {  e.preventDefault(); });
            rendererContainerEl.addEventListener('gestureend', function(e) {  e.preventDefault(); });
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

    var playSound = function (rawBuffer) {
        VerboseLog.log("now playing a sound, that starts with", new Uint8Array(rawBuffer.slice(0, 10))[0]);
        audioContext.decodeAudioData(rawBuffer, function (buffer) {
            if (!buffer) {
                VerboseLog.error("failed to decode:", "buffer null");
                return;
            }
            var source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);
            VerboseLog.log("started...");
        }, function (error) {
            VerboseLog.error("failed to decode:", error);
        });
    }

/*****************************
    Opening projects
*****************************/

    var loadJSONProject = function (proj) {
        // Parse dat project
        project = JSON.parse(proj);

        VerboseLog.log("Player loading project:")
        VerboseLog.log(project);

        // Put prototypes back on WickObjects
        WickObjectUtils.putWickObjectPrototypeBackOnObject(project.rootObject);

        // Decode scripts/text from json-safe format
        project.rootObject.decodeStrings();

        // Prepare all objects for being played/drawn
        resetAllPlayheads(project.rootObject);
        resetAllEventStates(project.rootObject);
        resetAllPositioningVariables(project.rootObject);

        // Regenerate WickObject stuff that we lost when the projects was JSONified
        generateObjectNameReferences(project.rootObject);
        generateObjectParentReferences(project.rootObject);
        generateBuiltinWickFunctions(project.rootObject);
        generateHTMLSnippetDivs(project.rootObject);

        // Convert base 64 data into content
        loadImages(project.rootObject);
        if(!mobileMode) {
            loadAudio(project.rootObject);
        }
    }

    /* Create variables inside each wickobject so we can say root.bogoObject.play(); and such */
    var generateObjectNameReferences = function (wickObj) {
        WickObjectUtils.forEachChildObject(wickObj, function(subObj) {
            wickObj[subObj.name] = subObj;

            if(subObj.isSymbol) {
                generateObjectNameReferences(subObj);
            }
        });
    }

    /* We'll need these when evaling scripts */
    var generateObjectParentReferences = function (wickObj) {
        WickObjectUtils.forEachChildObject(wickObj, function(subObj) {
            subObj.parentObj = wickObj;
            if(subObj.isSymbol) {
                generateObjectParentReferences(subObj);
            }
        });
    }

    /* */
    var generateBuiltinWickFunctions = function (wickObj) {

        wickObj.hitTest = function (otherObj) {

            if(!otherObj) {
                console.error('hitTest with invalid object as param!!')
            }

            // TODO: Use proper rectangle collision
            var wickObjCentroid = {
                x : wickObj.x + wickObj.width*wickObj.scaleX/2,
                y : wickObj.y + wickObj.height*wickObj.scaleY/2
            };
            return pointInsideObj(otherObj, wickObjCentroid);
        }

        if(wickObj.isSymbol) {
            // Setup builtin wick scripting methods and objects
            wickObj.play = function (frame) {
                wickObj.isPlaying = true;

                wickObj.currentFrame ++;
                if(wickObj.currentFrame == wickObj.frames.length) {
                    wickObj.currentFrame = 0;
                }
            }
            wickObj.stop = function (frame) {
                wickObj.isPlaying = false;
            }
            wickObj.gotoAndPlay = function (frame) {
                wickObj.isPlaying = true;
                wickObj.currentFrame = frame;
            }
            wickObj.gotoAndStop = function (frame) {
                wickObj.isPlaying = false;
                wickObj.currentFrame = frame;
            }
            wickObj.gotoNextFrame = function () {
                wickObj.currentFrame ++;
                if(wickObj.currentFrame >= wickObj.frames.length) {
                    wickObj.currentFrame = wickObj.frames.length-1;
                }
            }
            wickObj.gotoPrevFrame = function () {
                wickObj.currentFrame --;
                if(wickObj.currentFrame < 0) {
                    wickObj.currentFrame = 0;
                }
            }

            WickObjectUtils.forEachChildObject(wickObj, function(subObj) {
                generateBuiltinWickFunctions(subObj);
            });
        }
    }

    /* */
    var generateHTMLSnippetDivs = function (wickObj) {

        if (wickObj.htmlData) {
            var snippetDiv = document.createElement("div");
            snippetDiv.style.position = 'fixed';
            snippetDiv.style.width = '600px';
            snippetDiv.style.height = '600px';
            snippetDiv.style.left = wickObj.x + 'px';
            snippetDiv.style.top = wickObj.y + 'px';
            snippetDiv.innerHTML = wickObj.htmlData;
            document.getElementById('playerCanvasContainer').appendChild(snippetDiv);
        }

        if(wickObj.isSymbol) {
            WickObjectUtils.forEachChildObject(wickObj, function(subObj) {
                generateHTMLSnippetDivs(subObj);
            });
        }

    }

    /* Make sure all objects start at first frame and start playing */
    var resetAllPlayheads = function (wickObj) {

        // Set all playhead vars
        if(wickObj.isSymbol) {

            // set all elapsedFrames to 0
            for(var i = 0; i < wickObj.frames.length; i++) {
                wickObj.frames[i].elapsedFrames = 0;
            }

            // Set this object to it's first frame
            wickObj.currentFrame = 0;

            // Start the object playing
            wickObj.isPlaying = true;

            // Recursively set all playhead vars of children
            WickObjectUtils.forEachChildObject(wickObj, function(subObj) {
                resetAllPlayheads(subObj);
            });
        }
    }

    /* */
    var resetAllEventStates = function (wickObj) {

        // Reset the mouse hovered over state flag
        wickObj.hoveredOver = false;

        // Set this object to need its onLoad script run
        wickObj.onLoadScriptRan = false;

        // Do the same for all this object's children
        if(wickObj.isSymbol) {
            WickObjectUtils.forEachChildObject(wickObj, function(subObj) {
                resetAllEventStates(subObj);
            });
        }

    }

    /* */
    var resetAllPositioningVariables = function (wickObj) {

        // Set x,y to top and left, top and left are only used to save the initial position
        wickObj.x = wickObj.left;
        wickObj.y = wickObj.top;

        // Do the same for all this object's children
        if(wickObj.isSymbol) {
            WickObjectUtils.forEachChildObject(wickObj, function(subObj) {
                resetAllPositioningVariables(subObj);
            });
        }

    }

    /* Recursively load images of wickObj */
    var loadImages = function (wickObj) {

        WickObjectUtils.forEachChildObject(wickObj, function(subObj) {
            if (subObj.isSymbol) {
                loadImages(subObj);
            } else if (subObj.imageData) {
                subObj.pixiSprite = PIXI.Sprite.fromImage(subObj.imageData);
                subObj.pixiSprite.interactive = true;
                subObj.buttonMode = true;
            } else if (subObj.fontData) {
                var style = {
                    font : "normal " + subObj.fontData.fontSize + "px " + subObj.fontData.fontFamily,
                    fill : subObj.fontData.fill,
                    wordWrap : true,
                    wordWrapWidth : 440
                };

                subObj.pixiText = new PIXI.Text(subObj.fontData.text, style);
            }
        });
    }

    /* Recursively load audio of wickObj */
    var loadAudio = function (wickObj) {
        WickObjectUtils.forEachChildObject(wickObj, function(subObj) {
            if(subObj.isSymbol) {
                loadAudio(subObj);
            } else if(subObj.audioData) {
                var rawData = subObj.audioData.split(",")[1]; // cut off extra filetype/etc data
                var rawBuffer = Base64ArrayBuffer.decode(rawData);
                subObj.audioBuffer = rawBuffer;
            }
        });
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
                rendererContainerEl.style.marginLeft = offset + "px";
                rendererContainerEl.style.paddingTop = "0px";
            } else {
                var offset = (window.innerHeight - project.resolution.y * projectFitScreenScale) / 2;
                rendererContainerEl.style.marginLeft = "0px";
                rendererContainerEl.style.paddingTop = offset + "px";
            }
        } else {
            renderer.view.style.width  = project.resolution.x + "px";
            renderer.view.style.height = project.resolution.y + "px";

            var offsetX = (window.innerWidth  - project.resolution.x) / 2;
            var offsetY = (window.innerHeight - project.resolution.y) / 2;

            rendererContainerEl.style.marginLeft = offsetX + "px";
            rendererContainerEl.style.paddingTop = offsetY + "px";
        }

    }

/*****************************
    Desktop event functions
*****************************/

    var onMouseMove = function (evt) {

        mouse = getMousePos(renderer.view, evt);

        // Check if we're hovered over a clickable object...
        var hoveredOverObj = false;
        WickObjectUtils.forEachActiveChildObject(project.rootObject, function(currObj) {
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
        
        WickObjectUtils.forEachActiveChildObject(project.rootObject, function(currObj) {
            if(pointInsideObj(currObj, mouse) && wickObjectIsClickable(currObj)) {
                runOnClickScript(currObj);
            }
        });

    }

    var handleKeyDownInput = function (event) {
        keys[event.keyCode] = true;

        WickObjectUtils.forEachActiveChildObject(project.rootObject, function(currObj) {
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

        var touchPos = getTouchPos(evt);

        WickObjectUtils.forEachActiveChildObject(project.rootObject, function(currObj) {
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

        var centeredCanvasOffsetX = (window.innerWidth - project.resolution.x) / 2;
        var centeredCanvasOffsetY = (window.innerHeight - project.resolution.y) / 2;

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

        if(!project.fitScreen) {
            mouseX -= centeredCanvasOffsetX;
            mouseY -= centeredCanvasOffsetY;
        }

        return {
            x: mouseX,
            y: mouseY
        };
    }

    var getTouchPos = function (evt) {
        var touch = evt.targetTouches[0];
        return {
            x: touch.pageX,
            y: touch.pageY
        };
    }

/*****************************
    WickObject Utils
*****************************/

    /*  */
    var pointInsideObj = function(obj, point) {

        if(obj.isSymbol) {

            var pointInsideSymbol = false;

            WickObjectUtils.forEachActiveChildObject(obj, function (currObj) {
                var subPoint = {
                    x : point.x - obj.x,
                    y : point.y - obj.y
                };
                if(pointInsideObj(currObj, subPoint)) {
                    pointInsideSymbol = true;
                }
            });

            return pointInsideSymbol;

        } else {

            var scaledObjX = obj.x;
            var scaledObjY = obj.y;
            var scaledObjWidth = obj.width*obj.scaleX;
            var scaledObjHeight = obj.height*obj.scaleY;

            return point.x >= scaledObjX && 
                   point.y >= scaledObjY  &&
                   point.x <= scaledObjX + scaledObjWidth && 
                   point.y <= scaledObjY  + scaledObjHeight;

        }
    }

    var wickObjectIsClickable = function (wickObj) {
        return wickObj.wickScripts['onClick'];
    }

/*****************************
    Draw/update loop
*****************************/

    var animate = function () {

        if(!stopDrawLoop) {
            requestAnimationFrame(animate);
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

        // Run obj's onLoad if necessary, then all subObj's
        runOnLoadScript(obj);

        // Run obj's update if necessary, then all subObj's
        runUpdateScript(obj);

        // Advance obj's timeline one frame, then subobj's timelines
        advanceTimeline(obj);

    }

    var runOnLoadScript = function (obj) {

        if(!obj.onLoadScriptRan) {

            // Check for breakpoint
            if(obj.isSymbol && obj.frames[obj.currentFrame].breakpoint) {
                obj.isPlaying = false;
            }

            // Run onLoad script
            if(obj && !obj.isRoot && obj.wickScripts) {
                evalScript(obj, obj.wickScripts.onLoad);
                obj.onLoadScriptRan = true;

                // Play sound at the same time as when onLoad script runs
                if(audioContext && obj.audioBuffer) {
                    playSound(obj.audioBuffer);
                }
            }

            // Recursively run all onLoads
            if(obj.isSymbol) {
                WickObjectUtils.forEachActiveChildObject(obj, function(subObj) {
                    runOnLoadScript(subObj);
                });
            }

        }

    }

    var runUpdateScript = function (obj) {

        // Run update script
        if(obj && !obj.isRoot && obj.wickScripts) {
            evalScript(obj, obj.wickScripts.onUpdate);
        }

        // Recursively run all updates
        if(obj.isSymbol) {
            WickObjectUtils.forEachActiveChildObject(obj, function(subObj) {
                runUpdateScript(subObj);
            });
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

        // Setup wickobject reference variables
        var root = project.rootObject;
        var parent = obj.parentObj;

        // WickObjects in same frame (scope) are accessable without using root./parent.
        WickObjectUtils.forEachChildObject(obj.parentObj, function(subObj) {
            window[subObj.name] = subObj;
        });

        // 'this.' can access the object running this script
        for(var i = 0; i < 100; i++) { // !!! why plseae dont do this
            script = script.replace("this.","obj.");
        }
        
        // Run da script!!
        eval(script);

        // Get rid of wickobject reference variables
        WickObjectUtils.forEachChildObject(obj.parentObj, function(subObj) {
            window[subObj.name] = undefined;
        });

    }

    var advanceTimeline = function (obj) { 
        // Advance timeline for this object
        if(obj.isPlaying && obj.frames.length > 1) {
            /* Left the frame, all child objects are unloaded, make sure 
               they run onLoad again next time we come back to this frame */
            WickObjectUtils.forEachActiveChildObject(obj, function(child) {
                child.onLoadScriptRan = false;
            });

            // Multiframes
            var frame = obj.frames[obj.currentFrame];
            if (frame.elapsedFrames == frame.frameLength) {
                obj.currentFrame++;
                frame.elapsedFrames = 0;
            } else {
                frame.elapsedFrames++;
            }
            
            if(obj.currentFrame == obj.frames.length) {
                obj.currentFrame = 0;
            }
        }

        // Recusively advance timelines of all children
        if(obj.isSymbol) {
            WickObjectUtils.forEachActiveChildObject(obj, function(subObj) {
                if(subObj.isSymbol) {
                    advanceTimeline(subObj);
                }
            });
        }

    }

/*****************************
    Draw
*****************************/

    var draw = function () {

        var graphics = new PIXI.Graphics();
        graphics.beginFill(parseInt(project.backgroundColor.replace("#","0x")));
        graphics.drawRect(0, 0, project.resolution.x, project.resolution.y)
        graphics.endFill();
        renderer.render(graphics);

        var baseTransform = {
            x:       0,
            y:       0,
            angle:   0,
            scaleX:  1.0,
            scaleY:  1.0,
            opacity: 1.0
        };
        drawWickObject(project.rootObject, baseTransform);

    }

    var drawWickObject = function (wickObj, transform) {
        // Apply transformation
        if(!wickObj.isRoot) {
            transform.x       += wickObj.x;
            transform.y       += wickObj.y;
            transform.angle   += wickObj.angle/360*2*3.14159;
            transform.scaleX  *= wickObj.scaleX;
            transform.scaleY  *= wickObj.scaleY;
            if(wickObj.opacity) transform.opacity *= wickObj.opacity;
        }

        if(wickObj.isSymbol) {
            WickObjectUtils.forEachActiveChildObject(wickObj, function(subObj) {
                drawWickObject(subObj, transform);
            });
        } else {
            if(wickObj.pixiSprite) {
                wickObj.pixiSprite.x        = transform.x;
                wickObj.pixiSprite.y        = transform.y;
                wickObj.pixiSprite.rotation = transform.angle;
                wickObj.pixiSprite.scale.x  = transform.scaleX;
                wickObj.pixiSprite.scale.y  = transform.scaleY;
                wickObj.pixiSprite.alpha    = transform.opacity;
                renderer.render(wickObj.pixiSprite);
            } else if(wickObj.pixiText) {
                wickObj.pixiText.x        = transform.x;
                wickObj.pixiText.y        = transform.y;
                wickObj.pixiText.rotation = transform.angle;
                wickObj.pixiText.scale.x  = transform.scaleX;
                wickObj.pixiText.scale.y  = transform.scaleY;
                wickObj.pixiText.alpha    = transform.opacity;
                renderer.render(wickObj.pixiText);
            }
        }

        // Undo transformation
        if(!wickObj.isRoot) {
            transform.x       -= wickObj.x;
            transform.y       -= wickObj.y;
            transform.angle   -= wickObj.angle/360*2*3.14159;
            transform.scaleX  /= wickObj.scaleX;
            transform.scaleY  /= wickObj.scaleY;
            if(wickObj.opacity) transform.opacity /= wickObj.opacity;
        }
    }

    return wickPlayer;

})();