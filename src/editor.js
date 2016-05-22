var WickEditor = (function () {

	var wickEditor = {};

	/* Settings */
	var SHOW_PAGE_LEAVE_WARNING = false;

	/* Flag to display feedback when something's being dragged into the editor */
	var showUploadAlert;

	/* Current project in editor */
	var project;
	var frames = undefined;

	/* Mouse input variables */
	var mouse = {};

	/* Key input variables */
	var keys;

	/* Fabric canvas and context */
	var canvas;
	var context;

/*****************************
	Setup
*****************************/

	wickEditor.setup = function() {

	// Setup editor vars

		showUploadAlert = false;

		project = new WickProject();

		currentFrame = 1;
		document.getElementById("frameSelector").value = currentFrame;

	// Setup canvas

		canvas = new fabric.Canvas('editorCanvas');
		canvas.selectionColor = 'rgba(0,0,5,0.1)';
		canvas.selectionBorderColor = 'grey';
		canvas.selectionLineWidth = 2;

		context = canvas.getContext('2d');

	// Setup main menu events

		$("#exportJSONButton").on("click", function(e){
		exportProjectAsJSON();
		});
		$("#exportHTMLButton").on("click", function(e){
			exportProjectAsHTML();
		});
		$("#runButton").on("click", function(e){
			runProject();
		});
		$("#closeBuiltinPlayerButton").on("click", function(e) {
			closeBuiltinPlayer();
		});

		document.getElementById("importButton").onchange = function(e){
			importJSONProject(document.getElementById("importButton"));
		};

		$("#prevFrameButton").on("click", function(e){
			prevFrame();
		});
		$("#nextFrameButton").on("click", function(e){
			nextFrame();
		});

		$("#gotoFrameButton").on("click", function(e){
			var toFrame = parseInt($('textarea#frameSelector').val());
			goToFrame(toFrame);
		});
		$("#cloneFrameButton").on("click", function(e){
			cloneCurrentFrame();
		});

	// Setup right click menu button events

		$("#bringToFrontButton").on("click", function(e){
			canvas.bringToFront(canvas.getActiveObject());
			closeRightClickMenu();
		});
		$("#sendToBackButton").on("click", function(e){
			canvas.sendToBack(canvas.getActiveObject());
			closeRightClickMenu();
		});
		$("#addScriptButton").on("click", function(e){
			canvas.getActiveObject().wickData.clickable = true;
			canvas.getActiveObject().wickData.toFrame = prompt("Enter a frame:");
			closeRightClickMenu();
		});
		$("#testActionButton").on("click", function(e){
			goToFrame(canvas.getActiveObject().wickData.toFrame);
			closeRightClickMenu();
		});
		$("#deleteButton").on("click", function(e){
			canvas.getActiveObject().remove();
			closeRightClickMenu();
		});

		$("#clearFrameButton").on("click", function(e){
			canvas.clear();
			closeRightClickMenu();
		});

	// Setup mouse events

		document.addEventListener( 'mousemove', function ( event ) {

			mouse.x = event.clientX;
			mouse.y = event.clientY;

		}, false );

		document.getElementById("editorCanvasContainer").addEventListener("mousedown", function(event) {
			closeRightClickMenu();
		}, false);

	// Setup right click events

		if (document.addEventListener) {
			document.addEventListener('contextmenu', function(e) {
				openRightClickMenu();
				e.preventDefault();
			}, false);
		} else {
			document.attachEvent('oncontextmenu', function() {
				openRightClickMenu();
				window.event.returnValue = false;
			});
		}

	// Setup keypress events

		keys = [];

		document.body.addEventListener("keydown", function (e) {
			keys[e.keyCode] = true;
			
			if (keys[16]) { // Shift
				if (keys[39]) { // Right arrow
					nextFrame();
				} else if (keys[37]) { // Left arrow
					prevFrame();
				} else if (keys[190]) { // '.' or '>'
					cloneCurrentFrame();
				}
			}

		});

		document.body.addEventListener("keyup", function (e) {
			keys[e.keyCode] = false;
		});

	// Setup drag/drop events

		$("#editorCanvasContainer").on('dragover', function(e) {
			showUploadAlert = true;
			return false;
		});
		$("#editorCanvasContainer").on('dragleave', function(e) {
			showUploadAlert = false;
			return false;
		});
		$("#editorCanvasContainer").on('drop', function(e) {
			// prevent browser from opening the file
			e.stopPropagation();
			e.preventDefault();

			importFilesDroppedIntoEditor(e.originalEvent.dataTransfer.files);

			return false;
		});

	// Setup leave page warning event

		if(SHOW_PAGE_LEAVE_WARNING) {
			window.addEventListener("beforeunload", function (e) {
				var confirmationMessage = 'Warning: All unsaved changes will be lost!';

				(e || window.event).returnValue = confirmationMessage; //Gecko + IE
				return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
			});
		}

	// Setup window resize events

		var resizeCanvas = function () {
			// resize canvas
			canvas.setWidth( window.innerWidth );
			canvas.setHeight( window.innerHeight );
			canvas.calcOffset();

			// also center timeline
			var GUIWidth = parseInt($("#timelineGUI").css("width"))/2;
			$("#timelineGUI").css('left', canvas.width/2-GUIWidth+'px');

		}
		window.addEventListener('resize', resizeCanvas, false);
		resizeCanvas();

		// start draw/update loop
		var FPS = 30;
		setInterval(function() {
			draw();
		}, 1000/FPS);

	}

/**********************************
	Right-click menu 
**********************************/

	var openRightClickMenu = function () {
		// Make rightclick menu visible
		$("#rightClickMenu").css('visibility', 'visible');
		// Attach it to the mouse
		$("#rightClickMenu").css('top', mouse.y+'px');
		$("#rightClickMenu").css('left', mouse.x+'px');

		// (fabric) Don't show object manipulation options if nothing is selected
		if(canvas.getActiveObject() != undefined) {
			$("#objectManipButtons").css('display', 'inline');
		} else {
			$("#objectManipButtons").css('display', 'none');
		}
	}

	var closeRightClickMenu = function () {
		// Hide rightclick menu
		$("#rightClickMenu").css('visibility', 'hidden');
		$("#rightClickMenu").css('top', '0px');
		$("#rightClickMenu").css('left', '0px');
	}

/*****************************
	Timeline
*****************************/

	// Store current canvas into frame f
	var storeCanvasIntoFrame = function (f) {
		frames[f] = [];
		canvas.forEachObject(function(obj){
			// Deepcopy and add to frame
			frames[f].unshift(jQuery.extend(true, {}, obj));
		});
	}

	// Save serialized frames
	var loadFrame = function (f) {
		canvas.clear();
		if (frames[f] != undefined) {
			for(var i = 0; i < frames[f].length; i++) {
				canvas.add(frames[f][i]);
			}
		}
	}

	// Goes to a specified frame.
	var goToFrame = function (toFrame) {
		storeCanvasIntoFrame(currentFrame);

		currentFrame = toFrame;
		loadFrame(currentFrame);

		document.getElementById("frameSelector").value = currentFrame;
	}

	// Go to the next frame.
	var nextFrame = function () {
		goToFrame(currentFrame + 1);
	}

	// Go to the previous frame.
	var prevFrame = function () {
		var toFrame = currentFrame - 1;
		if (toFrame > 0) {
			goToFrame(toFrame);
		}
	}

	// Go to the next frame and copy the last frame into it.
	var cloneCurrentFrame = function () {
		storeCanvasIntoFrame(currentFrame + 1);
		goToFrame(currentFrame + 1);
	}

/*****************************
	Import content
*****************************/

	var importFilesDroppedIntoEditor = function(files) {
		// retrieve uploaded files data
		// TODO: multiple files at once
		var file = files[0];

		// read file as data URL
		var reader = new FileReader();
		reader.onload = (function(theFile) {
			return function(e) {
				fabric.Image.fromURL(e.target.result, function(oImg) {
					// add new object to fabric canvas
					oImg.left = (canvas.width/2) - (oImg.width/2);
					oImg.top = (canvas.height/2) - (oImg.height/2);

					oImg.wickData = {};
					oImg.wickData.clickable = false;
					oImg.wickData.name = e.target.filename;

					canvas.add(oImg);
				});
			};
		})(file);
		reader.readAsDataURL(file);

		showUploadAlert = false;
	}

/*****************************
	Export projects
*****************************/

	var fabricObjectToWickObject = function (fabObj) {
		wickObj = {};

		wickObj.left     = fabObj.left;
		wickObj.top      = fabObj.top;
		wickObj.width    = fabObj.width;
		wickObj.height   = fabObj.height;
		wickObj.scaleX   = fabObj.scaleX;
		wickObj.scaleY   = fabObj.scaleY;
		wickObj.angle    = fabObj.angle;
		wickObj.flipX    = fabObj.flipX;
		wickObj.flipY    = fabObj.flipY;
		wickObj.opacity  = fabObj.opacity;
		wickObj.src      = fabObj.src;

		wickObj.wickData = fabObj.wickData;

		return wickObj;
	}

	// Converts all fabric objects in all frames into wick objects and JSON stringifies the result
	var getProjectAsJSON = function () {
		storeCanvasIntoFrame(currentFrame);

		wickObjectFrames = [];
		for(var fi = 0; fi < frames.length; fi++) {
			var frame = frames[fi];
			wickObjectFrames[fi] = [];
			for(var i = 0; i < frame.length; i++) {
				var obj = frame[i];
				var srcObj = JSON.parse(JSON.stringify(frame[i]));//hacky way to get src
				wickObj = fabricObjectToWickObject(obj);
				wickObj.src = srcObj.src;
				wickObjectFrames[fi].push(wickObj);
			}
		}
		return JSON.stringify(wickObjectFrames);
	}

	var exportProjectAsJSON = function () {
		// Save JSON project
		var blob = new Blob([getProjectAsJSON()], {type: "text/plain;charset=utf-8"});
		saveAs(blob, "project.json");
	}

	var downloadFile = function (url) {

		var fileString = "";
		var rawFile = new XMLHttpRequest();
		rawFile.open("GET", url, false);
		rawFile.onreadystatechange = function () {
			if(rawFile.readyState === 4) {
				if(rawFile.status === 200 || rawFile.status == 0) {
					fileString = rawFile.responseText;
				}
			}
		}
		rawFile.send(null);
		return fileString;

	}

	var exportProjectAsHTML = function () {
		var fileOut = "";

		// Add the player webpage (need to download the empty player)
		fileOut += downloadFile("empty-player.htm") + "\n";

		// Add the player (need to download the player code)
		fileOut += "<script>" + downloadFile("player.js") + "</script>\n";

		// Bundle the JSON project
		fileOut += "<script>WickPlayer.runProject('" + getProjectAsJSON() + "');</script>" + "\n";

		// Save whole thing as html file
		var blob = new Blob([fileOut], {type: "text/plain;charset=utf-8"});
		saveAs(blob, "project.html");
	}

/*****************************
	Import projects
*****************************/
	
	var wickObjectToFabricObject = function (wickObj, callback) {
		fabric.Image.fromURL(wickObj.src, function(oImg) {
			
			oImg.left     = wickObj.left;
			oImg.top      = wickObj.top;
			oImg.width    = wickObj.width;
			oImg.height   = wickObj.height;
			oImg.scaleX   = wickObj.scaleX;
			oImg.scaleY   = wickObj.scaleY;
			oImg.angle    = wickObj.angle;
			oImg.flipX    = wickObj.flipX;
			oImg.flipY    = wickObj.flipY;
			oImg.opacity  = wickObj.opacity;

			oImg.wickData = wickObj.wickData;

			callback(oImg);
		});
	}

	var importJSONProject = function (filePath) {
		var frames = [[]];

		if(filePath.files && filePath.files[0]) {
			var reader = new FileReader();
			reader.onload = function (e) {
				jsonString = e.target.result;
				loadProjectFromJSON(jsonString);

			};
			reader.readAsText(filePath.files[0]);
		}
	}

	var convertWickObjectToFabricObject = function (fi, i) {

		var wickObj = frames[fi][i];
		wickObjectToFabricObject(wickObj, function(fabricObj) {
			frames[fi][i] = fabricObj;
		});

	}

	var loadProjectFromJSON = function (jsonString) {

		// Load wick objects into frames array
		frames = JSON.parse(jsonString);
		console.log(frames);

		// Convert wick objects to fabric.js objects
		for(var fi = 0; fi < frames.length; fi++) {
			for(var i = 0; i < frames[fi].length; i++) {
				convertWickObjectToFabricObject(fi,i);
			}
		}

		currentFrame = 0;
		loadFrame(currentFrame);
	}

/*****************************
	Run projects
*****************************/

	var runProject = function () {
		// Hide the editor
		document.getElementById("editor").style.display = "none";

		// Show the player
		document.getElementById("builtinPlayer").style.display = "block";

		// JSONify the project and have the builtin player run it
		var JSONProject = getProjectAsJSON();
		WickPlayer.runProject(JSONProject);
	}

	var closeBuiltinPlayer = function() {
		// Show the editor
		document.getElementById("builtinPlayer").style.display = "none";

		// Hide the player
		document.getElementById("editor").style.display = "block";

		// Clean up player
		WickPlayer.stopRunningCurrentProject();
	}

/*****************************
	Draw loop
*****************************/

	var draw = function () {
		if(showUploadAlert) {
			context.fillStyle = '#000';
			context.textAlign = 'center';
			context.font = "30px Arial";
			context.fillText("Drop image to add to scene...",
							canvas.width/2,canvas.height/2);
		}
	}

	return wickEditor;

})();