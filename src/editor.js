var WickEditor = (function () {

	var wickEditor = { version: '0' };

	/* Current project in editor */
	var project;

	/* Current object being edited */
	var currentObject;

	/* Object that handles all the Fabric.js stuff */
	var fabricCanvas;

	/* Mouse and keyboard input variables */
	var mouse = {};
	var keys;

/*****************************
	Setup
*****************************/

	wickEditor.setup = function() {

		console.log("WickEditor rev " + wickEditor.version)

	// Setup editor vars

		// Create a new project
		project = new WickProject();
		currentObject = project.rootObject;

		// Add some empty frames (temporary - just for testing timeline GUI.)
		var nFramesToAdd = 7;
		for (var i = 1; i <= nFramesToAdd; i ++) {
			currentObject.addEmptyFrame(i);
		}
		updateTimelineGUI();

		// Setup fabric
		fabricCanvas = new FabricCanvas();

	// Setup main menu events

		$("#exportJSONButton").on("click", function (e) {
			exportProjectAsJSONFile();
		});
		$("#exportHTMLButton").on("click", function (e) {
			exportProjectAsHTML();
		});
		$("#runButton").on("click", function (e) {
			runProject();
		});
		$("#closeBuiltinPlayerButton").on("click", function (e) {
			closeBuiltinPlayer();
		});

		document.getElementById("importButton").onchange = function (e) {
			importJSONProject(document.getElementById("importButton"));
		};

	// Setup right click menu button events

		$("#convertToSymbolButton").on("click", function (e) {
			var symbol = new WickObject();
			symbol.left = fabricCanvas.getActiveObject().left;
			symbol.top = fabricCanvas.getActiveObject().top;
			symbol.scaleX = 1;
			symbol.scaleY = 1;
			symbol.angle = 0;
			symbol.flipX = false;
			symbol.flipY = false;
			symbol.isSymbol = true;
			symbol.currentFrame = 0;
			symbol.parentObject = currentObject;
			symbol.wickScripts = {};
			symbol.frames = [new WickFrame()];
			symbol.frames[0].wickObjects[0] = fabricCanvas.getActiveObject().wickObject;
			symbol.frames[0].wickObjects[0].left = 0;
			symbol.frames[0].wickObjects[0].top = 0;
			symbol.frames[0].wickObjects[0].parentObject = symbol;
			fabricCanvas.getActiveObject().remove();
			fabricCanvas.addWickObjectToCanvas(symbol);

			gotoFrame(currentObject.currentFrame);
			closeRightClickMenu();
		});

		$("#bringToFrontButton").on("click", function (e) {
			console.error("Fix! Uses old fabric canvas")
			//fabricCanvas.bringToFront(fabricCanvas.getActiveObject());
			closeRightClickMenu();
		});
		$("#sendToBackButton").on("click", function (e) {
			console.error("Fix! Uses old fabric canvas")
			//fabricCanvas.sendToBack(fabricCanvas.getActiveObject());
			closeRightClickMenu();
		});
		$("#deleteButton").on("click", function (e) {
			fabricCanvas.getActiveObject().remove();
			closeRightClickMenu();
		});

		$("#editObjectButton").on("click", function (e) {
			moveInsideObject(fabricCanvas.getActiveObject().wickObject);
			closeRightClickMenu();
		});
		$("#editScriptsButton").on("click", function (e) {
			console.error("Fix! Uses old fabric canvas")
			//fabricCanvas.getActiveObject().wickData.toFrame = prompt("Enter script:");
			closeRightClickMenu();
		});

		$("#finishEditingObjectButton").on("click", function (e) {
			moveOutOfObject();
			closeRightClickMenu();
		});

		$("#clearFrameButton").on("click", function (e) {
			fabricCanvas.clear();
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

			if(keys[8]) {
		        e.preventDefault();

		        if(fabricCanvas.getActiveObject()) {
			        fabricCanvas.getActiveObject().remove();
			    }
		    }
			
			if (keys[39]) { // Right arrow
				
			} else if (keys[37]) { // Left arrow
				
			}

		});

		document.body.addEventListener("keyup", function (e) {
			keys[e.keyCode] = false;
		});

	// Setup drag/drop events

		$("#editorCanvasContainer").on('dragover', function(e) {
			$("#fileImportOverlay").css('visibility', 'visible');
			return false;
		});
		$("#editorCanvasContainer").on('dragleave', function(e) {
			$("#fileImportOverlay").css('visibility', 'hidden');
			return false;
		});
		$("#editorCanvasContainer").on('drop', function(e) {
			// prevent browser from opening the file
			e.stopPropagation();
			e.preventDefault();

			importFilesDroppedIntoEditor(e.originalEvent.dataTransfer.files);

			$("#fileImportOverlay").css('visibility', 'hidden');

			return false;
		});

	// Setup leave page warning event

		var SHOW_PAGE_LEAVE_WARNING = false;
		if(SHOW_PAGE_LEAVE_WARNING) {
			window.addEventListener("beforeunload", function (e) {
				var confirmationMessage = 'Warning: All unsaved changes will be lost!';

				(e || window.event).returnValue = confirmationMessage; //Gecko + IE
				return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
			});
		}

	// Setup window resize events

		var resizeWindow = function () {

			// Resize canvas
			fabricCanvas.resize(
				project.resolution.x, 
				project.resolution.y
			);

			// Also center timeline
			var GUIWidth = parseInt($("#timelineGUI").css("width")) / 2;
			var timelineOffset = window.innerWidth/2 - GUIWidth;
			$("#timelineGUI").css('left', timelineOffset+'px');

		}
		window.addEventListener('resize', resizeWindow, false);
		resizeWindow();

		// Start draw/update loop
		// Not currently using this - fabric.js handles everything
		/*
		var FPS = 30;
		setInterval(function() {
			draw();
		}, 1000/FPS);*/

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

		// Update right click menu depending on what type of wickobject is selected
		$("#commonObjectButtons").css('display', 'none');
		$("#symbolButtons").css('display', 'none');
		$("#staticObjectButtons").css('display', 'none');
		$("#finishEditingObjectButton").css('display', 'none');

		// Only show "Finish Editing Object" button if we're not in root
		if(currentObject.parentObject) {
			$("#finishEditingObjectButton").css('display', 'inline');
		}

		if(fabricCanvas.getActiveObject()) {
			$("#commonObjectButtons").css('display', 'inline');
			if(fabricCanvas.getActiveObject().wickObject.isSymbol) {
				$("#symbolButtons").css('display', 'inline');
			} else {
				$("#staticObjectButtons").css('display', 'inline');
			}
		}
	}

	var closeRightClickMenu = function () {
		// Hide rightclick menu
		$("#rightClickMenu").css('visibility', 'hidden');
		$("#rightClickMenu").css('top', '0px');
		$("#rightClickMenu").css('left','0px');
	}

/*****************************
	Timeline
*****************************/

	// Moves playhead to specified frame and updates the canvas and project.
	var gotoFrame = function (newFrameIndex) {

		// Store changes made to current frame in the project
		currentObject.frames[currentObject.currentFrame].wickObjects = fabricCanvas.getWickObjectsInCanvas();

		currentObject.currentFrame = newFrameIndex;

		// Load wickobjects in the frame we moved to into the canvas
		fabricCanvas.storeObjectsIntoCanvas( currentObject.getCurrentFrame().wickObjects );

		updateTimelineGUI();

		console.log("Synced fabric canvas and project. Result:")
		console.log(project);

	}

	// 
	var moveOutOfObject = function () {

		// Store changes made to current frame in the project
		currentObject.frames[currentObject.currentFrame].wickObjects = fabricCanvas.getWickObjectsInCanvas();

		currentObject = currentObject.parentObject;

		// Load wickobjects in the frame we moved to into the canvas
		fabricCanvas.storeObjectsIntoCanvas( currentObject.getCurrentFrame().wickObjects );

		updateTimelineGUI();

		console.log("Synced fabric canvas and project. Result:")
		console.log(project);

	}

	// 
	var moveInsideObject = function (object) {

		// Store changes made to current frame in the project
		currentObject.frames[currentObject.currentFrame].wickObjects = fabricCanvas.getWickObjectsInCanvas();

		currentObject = object;
		currentObject.currentFrame = 0;

		// Load wickobjects in the frame we moved to into the canvas
		fabricCanvas.storeObjectsIntoCanvas( currentObject.getCurrentFrame().wickObjects );

		updateTimelineGUI();

		console.log("Synced fabric canvas and project. Result:")
		console.log(project);

	}

	var updateTimelineGUI = function () {

		var timeline = document.getElementById("timeline");
		timeline.innerHTML = "";

		for(var i = 0; i < currentObject.frames.length; i++) {

			var frameDiv = document.createElement("div");
			frameDiv.id = "frame" + i;
			if(currentObject.currentFrame == i) {
				frameDiv.className = "timelineFrame active";
			} else {
				frameDiv.className = "timelineFrame";
			}
			timeline.appendChild(frameDiv);

			document.getElementById("frame" + i).addEventListener("mousedown", function(index) {
				return function () {
					gotoFrame(index);
				};
			}(i), false);
		}

	}

/*****************************
	Import content
*****************************/

	var importFilesDroppedIntoEditor = function(files) {
		// Retrieve uploaded files data
		// TODO: multiple files at once
		var file = files[0];

		// Read file as data URL
		var reader = new FileReader();
		reader.onload = (function(theFile) {
			return function(e) {
				// Upload successful, we have the data URL
				var fileDataURL = e.target.result;

				// Create a new wick object with that data
				var obj = new WickObject();
				obj.dataURL = fileDataURL;
				obj.left = (window.innerWidth/2);
				obj.top = (window.innerHeight/2);
				obj.scaleX = 1;
				obj.scaleY = 1;
				obj.angle  = 0;
				obj.flipX  = false;
				obj.flipY  = false;
				obj.parentObject = currentObject;

				// Put that wickobject in the fabric canvas
				fabricCanvas.addWickObjectToCanvas(obj);
			};
		})(file);
		reader.readAsDataURL(file);
	}

/*****************************
	Export projects
*****************************/
	
	var getProjectAsJSON = function () {
		// Store changes made to current frame in the project
		console.error("Missing code here! Read comment")

		return JSON.stringify(project);
	}

	var exportProjectAsJSONFile = function () {
		// Save JSON project and have user download it
		var blob = new Blob([getProjectAsJSON()], {type: "text/plain;charset=utf-8"});
		saveAs(blob, "project.json");
	}

	var exportProjectAsHTML = function () {
		var fileOut = "";

		// Add the player webpage (need to download the empty player)
		fileOut += WickUtils.downloadFile("empty-player.htm") + "\n";

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

	var importJSONProject = function (filePath) {
		if(filePath.files && filePath.files[0]) {
			var reader = new FileReader();
			reader.onload = function (e) {
				jsonString = e.target.result;
				loadProjectFromJSON(jsonString);
			};
			reader.readAsText(filePath.files[0]);
		}
	}

	var loadProjectFromJSON = function (jsonString) {
		project = JSON.parse(jsonString);
		playheadPosition = new PlayheadPosition();
		loadFrame(currentFrame);
	}

/*****************************
	Run projects
*****************************/

	var runProject = function () {
		console.log("Running project in builtin player:")
		console.log(project)

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

	return wickEditor;

})();