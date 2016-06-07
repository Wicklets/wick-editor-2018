var WickPlayer = (function () {

	var wickPlayer = { };

	var project;

	var mousePos;

	var canvas;
	var context;

	var mobileMode;
	var desktopMode;

/*****************************
	Page/DOM Utils
*****************************/

	var inMobileMode = function () {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}

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

		// Setup canvas
		canvas = document.getElementById("playerCanvas");
		context = canvas.getContext('2d');

		var canvasContainerEl = document.getElementById("playerCanvasContainer");

		// Check if we're on a mobile device or not
		mobileMode = inMobileMode();
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
		var resizeCanvas = function () {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}
		window.addEventListener('resize', resizeCanvas, false);
		resizeCanvas();

		// Load the project!
		loadJSONProject(projectJSON);

	}

	wickPlayer.stopRunningCurrentProject = function() {

		console.error("WARNING: Builtin player cleanup (in WickPlayer.stopRunningCurrentProject()) not yet implemented! This can lead to slowness/problems!!")

	}

/*****************************
	Opening projects
*****************************/

	var loadJSONProject = function (proj) {
		project = JSON.parse(proj);

		console.log("Player loading project:")
		console.log(project);
		
		resetAllPlayheads(project.rootObject);
		loadImages(project.rootObject);

		// Start draw/update loop
		animate();
	}

	var resetAllPlayheads = function (wickObj) {

		// Set this object to it's first frame
		wickObj.currentFrame = 0;

		// Recursively set all timelines to first frame as well
		forEachChildObject(wickObj, function(subObj) {
			if(subObj.isSymbol) {
				resetAllPlayheads(subObj);
			}
		});

	}

	var loadImages = function (wickObj) {

		// Recursively load images of wickObj
		forEachChildObject(wickObj, function(subObj) {
			if(subObj.isSymbol) {
				loadImages(subObj);
			} else {
				subObj.image = new Image();
				subObj.image.src = subObj.dataURL;
				subObj.image.onload = function() {
					// Scope issue - fix this, we need it for preloaders
					//subObj.imageIsLoaded = true;
				};
			}
		});
	}

/*****************************
	Desktop Event functions
*****************************/

	var onMouseMove = function (evt) {

		mousePos = getMousePos(canvas, evt);

		// Check if we're hovered over a clickable object...
		var hoveredOverObj = false;
		for(var i = 0; i < currentFrameObjects.length; i++) {
			var obj = currentFrameObjects[i];
			if(pointInsideObj(obj, mousePos)) {
				hoveredOverObj = true;
				break;
			} else {
				obj.hoveredOver = false;
			}
		}

		//...and change the cursor if we are
		if(hoveredOverObj) {
			canvasContainerEl.style.cursor = "pointer";
		} else {
			canvasContainerEl.style.cursor = "default";
		}

	}

	var onMouseDown = function (evt) {
		
		// Check if we clicked a clickable object
		for(var i = 0; i < currentFrameObjects.length; i++) {
			var obj = currentFrameObjects[i];
			if(obj.clickable && pointInsideObj(obj, mousePos)) {
				project.rootObject.currentFrame = obj.toFrame;
				console.log("Went to frame " + currentFrame);
				draw();
				break;
			}
		}

	}

/*****************************
	Mobile Event functions
*****************************/

	var onTouchStart = function (evt) {

		// Check if we touched a clickable object
		for(var i = 0; i < frames[currentFrame].length; i++) {
			var obj = frames[currentFrame][i];
			if(obj.clickable && pointInsideObj(obj, getTouchPos(canvas, evt))) {
				currentFrame = obj.toFrame;
				console.log("Went to frame " + currentFrame);
				draw();
				break;
			}
		}

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

		return point.x >= scaledObjLeft && 
			   point.y >= scaledObjTop &&
			   point.x <= scaledObjLeft + scaledObjWidth && 
			   point.y <= scaledObjTop + scaledObjHeight;
	}

	/* Call callback function for every child object in parentObj */
	var forEachChildObject = function (parentObj, callback) {
		for(var f = 0; f < parentObj.frames.length; f++) {
			for(var o = 0; o < parentObj.frames[f].wickObjects.length; o++) {
				callback(parentObj.frames[f].wickObjects[o]);
			}
		}
	}

	/* Call callback function for every child object in parentObj's current frame */
	var forEachActiveChildObject = function (parentObj, callback) {
		var currFrame = parentObj.currentFrame;
		for(var o = 0; o < parentObj.frames[currFrame].wickObjects.length; o++) {
			callback(parentObj.frames[currFrame].wickObjects[o]);
		}
	}

/*****************************
	Draw/update loop
*****************************/

	var animate = function () {

		setTimeout(function() {
			requestAnimationFrame(animate);
			update();
			draw();
		}, 1000 / project.framerate);

	}

	var update = function () {
		
		// Advance all timelines one frame
		advanceTimeline(project.rootObject);

		// Run scripts
		// TODO

	}

	var advanceTimeline = function (obj) {

		obj.currentFrame++;
		if(obj.currentFrame == obj.frames.length) {
			obj.currentFrame = 0;
		}

		forEachActiveChildObject(obj, function(subObj) {
			if(subObj.isSymbol) {
				advanceTimeline(subObj);
			}
		});

	}

	var draw = function () {
		// Clear canvas
		context.clearRect(0, 0, canvas.width, canvas.height);

		// Draw root object, this will recursively draw every object!
		drawWickObject(project.rootObject);

		// Draw FPS counter
		context.fillStyle = "Black";
		context.font      = "normal 14pt Arial";
		context.fillText(fps.getFPS() + " FPS", canvas.width-80, 29);

	}

	var drawWickObject = function (obj) {

		if(obj.isSymbol) {

			// Recursively draw all sub objects.

			context.save();
			context.translate(obj.left, obj.top);
			context.scale(obj.scaleX, obj.scaleY);

				forEachActiveChildObject(obj, function(subObj) {
					drawWickObject(subObj);
				});

			context.restore();

		} else {

			// Draw the content of this static object.

			context.save();

				context.translate(obj.left, obj.top);
				context.scale(obj.scaleX, obj.scaleY);
				context.drawImage(obj.image, 0, 0);

			context.restore();
			
		}

	}

	return wickPlayer;

})();