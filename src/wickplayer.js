var WickPlayer = (function () {

	var wickPlayer = { };

	// Current project being played by player
	var project;

	// Input vars for mouse and (later) keyboard and accelerometer
	var mousePos;

	// Canvas stuff
	var canvas;
	var context;

	var canvasContainerEl;

	// Flags for different player modes (phone or desktop)
	var mobileMode;
	var desktopMode;

	// Set this to true to stop the next requestAnimationFrame
	var stopDrawLoop;

/*****************************
	Page/DOM Utils
*****************************/

	var getMousePos = function (canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
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
	Player Setup
*****************************/

	wickPlayer.runProject = function(projectJSON) {

		stopDrawLoop = false;

		// Setup canvas
		canvas = document.getElementById("playerCanvas");
		context = canvas.getContext('2d');

		canvasContainerEl = document.getElementById("playerCanvasContainer");

		// Check if we're on a mobile device or not
		mobileMode = BrowserDetectionUtils.inMobileMode;
		desktopMode = !mobileMode;

		// Setup mouse events (desktop mode)
		if(desktopMode) {
			canvas.addEventListener('mousemove', onMouseMove, false);
			canvasContainerEl.addEventListener("mousedown", onMouseDown, false);
		}

		// Setup touch events (mobile mode)
		if(mobileMode) {
			canvasContainerEl.addEventListener("touchstart", onTouchStart, false);
		}

		// update canvas size on window resize
		window.addEventListener('resize', resizeCanvas, false);
		resizeCanvas();

		// Load the project!
		loadJSONProject(projectJSON);

	}

	wickPlayer.stopRunningCurrentProject = function() {

		stopDrawLoop = true;
		canvasContainerEl.removeEventListener("mousedown", onMouseDown);
		canvasContainerEl.removeEventListener("touchstart", onTouchStart);
		window.removeEventListener('resize', resizeCanvas);

	}

/*****************************
	Opening projects
*****************************/

	var loadJSONProject = function (proj) {
		project = JSON.parse(proj);

		console.log("Player loading project:")
		console.log(project);

		WickSharedUtils.decodeScripts(project.rootObject);
		resetAllPlayheads(project.rootObject);
		loadImages(project.rootObject);

		// Start draw/update loop
		animate();
	}

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

	var loadImages = function (wickObj) {

		// Recursively load images of wickObj
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

/*****************************
	Common event functions
*****************************/

	var resizeCanvas = function () {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}

/*****************************
	Desktop event functions
*****************************/

	var onMouseMove = function (evt) {

		mousePos = getMousePos(canvas, evt);

		// Check if we're hovered over a clickable object...
		var hoveredOverObj = false;
		WickSharedUtils.forEachActiveChildObject(project.rootObject, function(currObj) {
			if(pointInsideObj(currObj, mousePos) && wickObjectIsClickable(currObj)) {
				hoveredOverObj = true;
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
			if(pointInsideObj(currObj, mousePos) && wickObjectIsClickable(currObj)) {
				runOnClickScript(currObj);
			}
		});

	}

/*****************************
	Mobile event functions
*****************************/

	var onTouchStart = function (evt) {

		var touchPos = getTouchPos(canvas, evt);

		WickSharedUtils.forEachActiveChildObject(project.rootObject, function(currObj) {
			if(pointInsideObj(currObj, touchPos) && wickObjectIsClickable(currObj)) {
				runOnClickScript(currObj);
			}
		});

	}

/*****************************
	Utils
*****************************/

	/* Probably broken right now !!! Needs to use parent's position !!! */
	var pointInsideObj = function(obj, point) {

		var scaledObjLeft = obj.left;
		var scaledObjTop = obj.top;
		var scaledObjWidth = obj.width*obj.scaleX;
		var scaledObjHeight = obj.height*obj.scaleY;

		var centeredCanvasOffsetX = (window.innerWidth - project.resolution.x) / 2;
		var centeredCanvasOffsetY = (window.innerHeight - project.resolution.y) / 2;

		return point.x >= scaledObjLeft + centeredCanvasOffsetX && 
			   point.y >= scaledObjTop  + centeredCanvasOffsetY &&
			   point.x <= scaledObjLeft + scaledObjWidth + centeredCanvasOffsetX && 
			   point.y <= scaledObjTop  + scaledObjHeight + centeredCanvasOffsetY;
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

			// Run onLoad script
			if(obj && obj.wickScripts) {
				//console.log(obj.wickScripts['onLoad']);
				evalScript(obj, obj.wickScripts.onLoad);
				obj.onLoadScriptRan = true;
			} else {
				//console.log("obj contains no wickScripts or onLoad function");
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
		if(obj && obj.wickScripts) {
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

	var evalScript = function (obj, script) {

		var gotoAndPlay = function (frame) {
			project.rootObject.currentFrame = frame;
			project.rootObject.isPlaying = true;
		}
		var gotoAndStop = function (frame) {
			project.rootObject.currentFrame = frame;
			project.rootObject.isPlaying = false;
		}
		var play = function (frame) {
			project.rootObject.isPlaying = true;
		}
		var stop = function (frame) {
			project.rootObject.isPlaying = false;
		}

		for(var i = 0; i < 100; i++) { // !!! why plseae dont do this
			script = script.replace("this.","obj.");
		}
		eval(script);

	}

	var advanceTimeline = function (obj) {

		// Advance timeline for this object
		if(obj.isPlaying) {
			obj.currentFrame++;
			if(obj.currentFrame == obj.frames.length) {
				obj.currentFrame = 0;
			}

			if(obj.frames[obj.currentFrame].breakpoint) {
				obj.isPlaying = false;
			}

			obj.onLoadScriptRan = false;
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
		// Clear canvas
		context.clearRect(0, 0, canvas.width, canvas.height);

		context.fillStyle = project.backgroundColor;
		context.fillRect(0,0, window.innerWidth,window.innerHeight);

		// Draw root object, this will recursively draw every object!
		context.save();
			context.translate(
				(window.innerWidth - project.resolution.x) / 2, 
				(window.innerHeight - project.resolution.y) / 2);
			drawWickObject(project.rootObject);
		context.restore();

		// Draw FPS counter
		context.fillStyle = "Black";
		context.font      = "normal 14pt Arial";
		context.fillText(fps.getFPS() + " FPS", canvas.width-80, 29);

	}

	var doRotationForObject = function (wickObject) {

		context.translate(wickObject.width/2, wickObject.height/2);
		context.rotate(wickObject.angle/360*2*3.14159);
		context.translate(-wickObject.width/2, -wickObject.height/2);

	}

	var drawWickObject = function (obj) {

		if(obj.isSymbol) {

			// Recursively draw all sub objects.

			context.save();
			context.translate(obj.left, obj.top);
			doRotationForObject(obj);
			context.scale(obj.scaleX, obj.scaleY);

				WickSharedUtils.forEachActiveChildObject(obj, function(subObj) {
					drawWickObject(subObj);
				});

			context.restore();

		} else {

			// Draw the content of this static object.

			context.save();

				context.translate(obj.left, obj.top);
				doRotationForObject(obj);
				context.scale(obj.scaleX, obj.scaleY);

				if(obj.imageData) {
					context.drawImage(obj.image, 0, 0);
				} else if(obj.fontData) {
					context.fillStyle = "Black";
					context.font      = "normal " + obj.fontData.fontSize + "px " + obj.fontData.fontFamily;
					context.fillText(obj.fontData.text, 0, 0);
				}

			context.restore();
			
		}

	}

	return wickPlayer;

})();