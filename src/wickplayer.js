var WickPlayer = (function () {

	var wickPlayer = { };

	// Current project being played by player
	var project;

	// Input vars for mouse and (later) keyboard and accelerometer
	var mouse;
	var keys;

	// Canvas stuff (To be replaced with three/webgl/pixi)
	var canvas;
	var context;
	var canvasContainerEl;

	// Screen fitting vars
	var projectFitScreenScale;
	var projectFitScreenTranslate;
	var widthRatio;
	var heightRatio;

	// Audio stuff
	var audioContext;

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

		// Setup canvas
		canvas = document.getElementById("playerCanvas");
		context = canvas.getContext('2d');
		canvasContainerEl = document.getElementById("playerCanvasContainer");

		projectFitScreenScale = 1.0;
		projectFitScreenTranslate = {x : 0, y : 0};

		var AudioContext = window.AudioContext // Default
    					|| window.webkitAudioContext // Safari and old versions of Chrome
    					|| false;
		audioContext = new AudioContext();

		// Check if we're on a mobile device or not
		mobileMode = BrowserDetectionUtils.inMobileMode;
		desktopMode = !mobileMode;

		// Setup mouse and key events (desktop mode)
		mouse = { x : 0, y : 0 };
		keys = [];
		if(desktopMode) {
			canvas.addEventListener('mousemove', onMouseMove, false);
			canvasContainerEl.addEventListener("mousedown", onMouseDown, false);

			document.body.addEventListener("keydown", handleKeyDownInput);
			document.body.addEventListener("keyup", handleKeyUpInput);
		}

		// Setup touch events (mobile mode)
		if(mobileMode) {
			// Touch event (one touch = like a mouse click)
			canvasContainerEl.addEventListener("touchstart", onTouchStart, false);

			// Squash gesture events
			canvasContainerEl.addEventListener('gesturestart', function(e) {  e.preventDefault(); });
			canvasContainerEl.addEventListener('gesturechange', function(e) {  e.preventDefault(); });
			canvasContainerEl.addEventListener('gestureend', function(e) {  e.preventDefault(); });
		}

		// update canvas size on window resize
		window.addEventListener('resize', resizeCanvas, false);

		// Load the project!
		loadJSONProject(projectJSON);
		resizeCanvas();

	}

	wickPlayer.stopRunningCurrentProject = function() {

		stopDrawLoop = true;

		canvasContainerEl.removeEventListener("mousedown", onMouseDown);
		canvasContainerEl.removeEventListener("touchstart", onTouchStart);

		document.body.removeEventListener("keydown", handleKeyDownInput);
		document.body.removeEventListener("keyup", handleKeyUpInput);

		window.removeEventListener('resize', resizeCanvas);

		audioContext.close();

	}

/*****************************
	Opening projects
*****************************/

	var loadJSONProject = function (proj) {
		// Parse dat project
		project = JSON.parse(proj);

		VerboseLog.log("Player loading project:")
		VerboseLog.log(project);

		// Prepare all objects for playing
		WickSharedUtils.decodeScripts(project.rootObject);
		resetAllPlayheads(project.rootObject);
		resetAllEventStates(project.rootObject);
		generateObjectNameReferences(project.rootObject);
		generateObjectParentReferences(project.rootObject);
		generateBuiltinWickFunctions(project.rootObject);
		generateHTMLSnippetDivs(project.rootObject);
		loadImages(project.rootObject);
		loadAudio(project.rootObject);

		// Start draw/update loop
		draw();
		animate();
	}

	/* Create variables inside each wickobject so we can say root.bogoObject.play(); and such */
	var generateObjectNameReferences = function (wickObj) {
		WickSharedUtils.forEachChildObject(wickObj, function(subObj) {
			wickObj[subObj.name] = subObj;

			if(subObj.isSymbol) {
				generateObjectNameReferences(subObj);
			}
		});
	}

	/* We'll need these when evaling scripts */
	var generateObjectParentReferences = function (wickObj) {
		WickSharedUtils.forEachChildObject(wickObj, function(subObj) {
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
				x : wickObj.left + wickObj.width*wickObj.scaleX/2,
				y : wickObj.top + wickObj.height*wickObj.scaleY/2
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

			WickSharedUtils.forEachChildObject(wickObj, function(subObj) {
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
			snippetDiv.style.top = wickObj.top + 'px';
			snippetDiv.style.left = wickObj.left + 'px';
			snippetDiv.innerHTML = wickObj.htmlData;
			document.getElementById('playerCanvasContainer').appendChild(snippetDiv);
		}

		if(wickObj.isSymbol) {
			WickSharedUtils.forEachChildObject(wickObj, function(subObj) {
				generateHTMLSnippetDivs(subObj);
			});
		}

	}

	/* Make sure all objects start at first frame and start playing */
	var resetAllPlayheads = function (wickObj) {

		// Set this object to it's first frame
		wickObj.currentFrame = 0;

		// Stop this object
		// (Note: objects should probably be playing instead of stopped initially)
		wickObj.isPlaying = true;

		// Set this object to need its onLoad script run
		wickObj.onLoadScriptRan = false;

		// Recursively set all timelines to first frame as well
		WickSharedUtils.forEachChildObject(wickObj, function(subObj) {
			if(subObj.isSymbol) {
				resetAllPlayheads(subObj);
			}
		});

	}

	/* */
	var resetAllEventStates = function (wickObj) {

		// Reset the mouse hovered over state flag
		wickObj.hoveredOver = false;

		// Do the same for all this object's children
		WickSharedUtils.forEachChildObject(wickObj, function(subObj) {
			if(subObj.isSymbol) {
				resetAllEventStates(subObj);
			}
		});

	}

	/* Recursively load images of wickObj */
	var loadImages = function (wickObj) {

		WickSharedUtils.forEachChildObject(wickObj, function(subObj) {
			if(subObj.isSymbol) {
				loadImages(subObj);
			} else if(subObj.imageData) {
				subObj.image = new Image();
				subObj.image.src = subObj.imageData;
				subObj.image.onload = function() {
					// Scope issue - fix this, we need it for preloaders
					//subObj.imageIsLoaded = true;
				};
			}
		});
	}

	/* Recursively load audio of wickObj */
	var loadAudio = function (wickObj) {
		WickSharedUtils.forEachChildObject(wickObj, function(subObj) {
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

		// Update canvas size
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		if(project && project.fitScreen) {
			// Calculate how much the project would have to scale to fit either dimension
			widthRatio = window.innerWidth / project.resolution.x;
			heightRatio = window.innerHeight / project.resolution.y;

			// Fit only so much that stuff doesn't get cut off
			if(widthRatio > heightRatio) {
				projectFitScreenScale = heightRatio;
			} else {
				projectFitScreenScale = widthRatio;
			}

			if(widthRatio > heightRatio) {
				projectFitScreenTranslate = {x : window.innerWidth / 2 - project.resolution.x * projectFitScreenScale / 2, y : 0};
			} else {
				projectFitScreenTranslate = {x : 0, y : window.innerHeight / 2 - project.resolution.y * projectFitScreenScale / 2 };
			}
		} else {
			projectFitScreenScale = 1.0;
			projectFitScreenTranslate = {x : 0, y : 0};
		}

	}

/*****************************
	Desktop event functions
*****************************/

	var onMouseMove = function (evt) {

		mouse = getMousePos(canvas, evt);

		// Check if we're hovered over a clickable object...
		var hoveredOverObj = false;
		WickSharedUtils.forEachActiveChildObject(project.rootObject, function(currObj) {
			if(pointInsideObj(currObj, mouse) && wickObjectIsClickable(currObj)) {
				currObj.hoveredOver = true;
				hoveredOverObj = true;
			} else {
				currObj.hoveredOver = false;
			}
		});

		//...and change the cursor if we are
		if(hoveredOverObj) {
			canvasContainerEl.style.cursor = "pointer";
		} else {
			canvasContainerEl.style.cursor = "default";
		}

	}

	var onMouseDown = function (evt) {
		
		WickSharedUtils.forEachActiveChildObject(project.rootObject, function(currObj) {
			if(pointInsideObj(currObj, mouse) && wickObjectIsClickable(currObj)) {
				runOnClickScript(currObj);
			}
		});

	}

	var handleKeyDownInput = function (event) {
		keys[event.keyCode] = true;

		WickSharedUtils.forEachActiveChildObject(project.rootObject, function(currObj) {
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

		var touchPos = getTouchPos(canvas, evt);

		WickSharedUtils.forEachActiveChildObject(project.rootObject, function(currObj) {
			if(pointInsideObj(currObj, touchPos) && wickObjectIsClickable(currObj)) {
				runOnClickScript(currObj);
			}
		});

	}

/*****************************
	Page/DOM Utils
*****************************/

	var getMousePos = function (canvas, evt) {
		var rect = canvas.getBoundingClientRect();

		var centeredCanvasOffsetX = (window.innerWidth - project.resolution.x) / 2;
		var centeredCanvasOffsetY = (window.innerHeight - project.resolution.y) / 2;

		return {
			x: evt.clientX - rect.left - centeredCanvasOffsetX,
			y: evt.clientY - rect.top  - centeredCanvasOffsetY
		};
	}

	var getTouchPos = function (canvas, evt) {
		var rect = canvas.getBoundingClientRect();
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

			WickSharedUtils.forEachActiveChildObject(obj, function (currObj) {
				var subPoint = {
					x : point.x - obj.left,
					y : point.y - obj.top
				};
				if(pointInsideObj(currObj, subPoint)) {
					pointInsideSymbol = true;
				}
			});

			return pointInsideSymbol;

		} else {

			var scaledObjLeft = obj.left;
			var scaledObjTop = obj.top;
			var scaledObjWidth = obj.width*obj.scaleX;
			var scaledObjHeight = obj.height*obj.scaleY;

			return point.x >= scaledObjLeft && 
				   point.y >= scaledObjTop  &&
				   point.x <= scaledObjLeft + scaledObjWidth && 
				   point.y <= scaledObjTop  + scaledObjHeight;

		}
	}

	var wickObjectIsClickable = function (wickObj) {
		return wickObj.wickScripts['onClick'];
	}

/*****************************
	Draw/update loop
*****************************/

	var animate = function () {

		setTimeout(function() {
			if(!stopDrawLoop) {
				requestAnimationFrame(animate);
				update();
				draw();
			}
		}, 1000 / project.framerate);

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

				if(obj.audioBuffer) {
					var rawBuffer = obj.audioBuffer;
					console.log("now playing a sound, that starts with", new Uint8Array(rawBuffer.slice(0, 10)));
					audioContext.decodeAudioData(rawBuffer, function (buffer) {
					    if (!buffer) {
					        console.error("failed to decode:", "buffer null");
					        return;
					    }
					    var source = audioContext.createBufferSource();
					    source.buffer = buffer;
					    source.connect(audioContext.destination);
					    source.start(0);
					    console.log("started...");
					}, function (error) {
					    console.error("failed to decode:", error);
					});
				}
			}

			// Recursively run all onLoads
			if(obj.isSymbol) {
				WickSharedUtils.forEachActiveChildObject(obj, function(subObj) {
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
			WickSharedUtils.forEachActiveChildObject(obj, function(subObj) {
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
		WickSharedUtils.forEachChildObject(obj.parentObj, function(subObj) {
			window[subObj.name] = subObj;
		});

		// Set x,y vars so user doesn't have to use top/left
		obj.x = obj.left;
		obj.y = obj.top;

		for(var i = 0; i < 100; i++) { // !!! why plseae dont do this
			script = script.replace("this.","obj.");
		}
		eval(script);

		// Update top/left ... Note that this will squash top and left, so user can't use those!!
		obj.left = obj.x;
		obj.top = obj.y;

		// Get rid of wickobject reference variables
		WickSharedUtils.forEachChildObject(obj.parentObj, function(subObj) {
			window[subObj.name] = undefined;
		});

	}

	var advanceTimeline = function (obj) {

		// Advance timeline for this object
		if(obj.isPlaying && obj.frames.length > 1) {
			/* Left the frame, all child objects are unloaded, make sure 
			   they run onLoad again next time we come back to this frame */
			WickSharedUtils.forEachActiveChildObject(obj, function(child) {
				child.onLoadScriptRan = false;
			});

			// Advance timeline one frame
			obj.currentFrame++;
			if(obj.currentFrame == obj.frames.length) {
				obj.currentFrame = 0;
			}
		}

		// Recusively advance timelines of all children
		if(obj.isSymbol) {
			WickSharedUtils.forEachActiveChildObject(obj, function(subObj) {
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

		// Calculate centered project window position
		var projectPositionX = (window.innerWidth - project.resolution.x) / 2;
		var projectPositionY = (window.innerHeight - project.resolution.y) / 2;

		// Scale to fit window
		context.save();
		context.translate(projectFitScreenTranslate.x, projectFitScreenTranslate.y);
		context.scale(projectFitScreenScale, projectFitScreenScale);

		// Clear canvas
		context.clearRect(0, 0, canvas.width, canvas.height);

		context.fillStyle = project.backgroundColor;
		context.fillRect(
			projectPositionX, 
			projectPositionY, 
			project.resolution.x, 
			project.resolution.y);

		// Draw root object, this will recursively draw every object!
		context.save();
			context.globalAlpha = 1.0;
			if(!project.fitScreen) {
				context.translate(projectPositionX, projectPositionY);
			}
			drawWickObject(project.rootObject);
		context.restore();

		context.restore();

		// Draw border around project (to hide offscreen objects)
		if(!project.fitScreen) {
			context.fillStyle = "#000000";
			context.fillRect( // top side
				0, 0, 
				window.innerWidth, projectPositionY);
			context.fillRect( // bottom side
				0, projectPositionY + project.resolution.y, 
				window.innerWidth, projectPositionY);
			context.fillRect( // left side
				0, 0, 
				projectPositionX, window.innerHeight);
			context.fillRect( // right side
				projectPositionX+project.resolution.x, 0, 
				projectPositionX, window.innerHeight);
		}
		
		// Draw FPS counter
		context.fillStyle = "White";
		context.font      = "normal 14pt Arial";
		context.fillText(fps.getFPS() + " FPS", canvas.width-80, 29);

	}

	var doTransformationsForObject = function (wickObject) {

		// Translation transforms
		context.translate(wickObject.left, wickObject.top);

		// Rotation transforms
		context.translate(wickObject.width/2, wickObject.height/2);
		context.rotate(wickObject.angle/360*2*3.14159);
		context.translate(-wickObject.width/2, -wickObject.height/2);

		// Scale transforms
		context.scale(wickObject.scaleX, wickObject.scaleY);

		// Horizontal/vertical flip transforms
		if(wickObject.flipX) {
			canvasContext.translate(wickObject.width, 0);
			canvasContext.scale(-1, 1);
		}
		if(wickObject.flipY) {
			canvasContext.translate(wickObject.width, 0);
			canvasContext.scale(-1, 1);
		}

	}

	var drawWickObject = function (obj) {

		var oldOpacity = context.globalAlpha;
		context.globalAlpha = oldOpacity*obj.opacity;

		context.save();
		doTransformationsForObject(obj);

		if(obj.isSymbol) {

			// Recursively draw all sub objects.
			WickSharedUtils.forEachActiveChildObject(obj, function(subObj) {
				drawWickObject(subObj);
			});

		} else {

			// Draw the content of this static object.
			if(obj.imageData) {

				context.drawImage(obj.image, 0, 0);

			} else if(obj.fontData) {

				context.save();
					context.translate(0, obj.fontData.fontSize);
					context.fillStyle = obj.fontData.fill;
					context.font      = "normal " + obj.fontData.fontSize + "px " + obj.fontData.fontFamily;
					context.fillText(obj.fontData.text, 0, 0);
				context.restore();

			}
		}

		context.restore();

		context.globalAlpha = oldOpacity;

	}

	return wickPlayer;

})();