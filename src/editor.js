var WickEditor = (function () {

	var wickEditor = { version: '0' };

	/* Settings */
	var SHOW_PAGE_LEAVE_WARNING = false;

	/* Flag to display feedback when something's being dragged into the editor */
	var showUploadAlert;

	/* Current project in editor */
	var project;

	/* Position of playhead to keep track of what object and frame of that object we're editing */
	var playheadPosition;

	/* Reference to current object we're inside */
	var currentObjectBeingEdited;

	/* Mouse input variables */
	var mouse = {};

	/* Key input variables */
	var keys;

	/* Fabric canvas and context */
	var fabricCanvas;
	var fabricContext;

	var frameInside;

/*****************************
	Setup
*****************************/

	wickEditor.setup = function() {

		console.log("WickEditor rev " + wickEditor.version)

	// Setup editor vars

		showUploadAlert = false;

		project = new WickProject();
		playheadPosition = new PlayheadPosition();

		// Start editor inside root object (which we can't ever leave from)
		currentObjectBeingEdited = project.rootObject;

		// Add some empty frames (temporary - just for testing timeline GUI.)
		var emptyFrameAddPosition = new PlayheadPosition();
		var nFramesToAdd = 7;
		for (var i = 1; i <= nFramesToAdd; i ++) {
			emptyFrameAddPosition.moveToFrame(i);
			project.addEmptyFrame(emptyFrameAddPosition);
		}
		updateTimelineGUI();

	// Setup fabric canvas

		fabricCanvas = new fabric.Canvas('editorCanvas');
		fabricCanvas.selectionColor = 'rgba(0,0,5,0.1)';
		fabricCanvas.selectionBorderColor = 'grey';
		fabricCanvas.selectionLineWidth = 2;
		fabricCanvas.backgroundColor = "#EEE"

		fabricContext = fabricCanvas.getContext('2d');

	// White box that shows resolution/objects that will be on screen when project is exported

		frameInside = new fabric.Rect({
			fill: '#FFF',
		});
		frameInside.wickCanvasName = "frame";

		frameInside.width = project.resolution.x;
		frameInside.height = project.resolution.y;
		frameInside.left = (window.innerWidth-project.resolution.x)/2;
		frameInside.top = (window.innerHeight-project.resolution.y)/2;

		frameInside.hasControls = false;
		frameInside.selectable = false;
		frameInside.evented = false;

		fabricCanvas.add(frameInside)

	// Setup main menu events

		$("#exportJSONButton").on("click", function(e){
			exportProjectAsJSONFile();
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

	// Setup right click menu button events

		$("#bringToFrontButton").on("click", function(e){
			fabricCanvas.bringToFront(fabricCanvas.getActiveObject());
			closeRightClickMenu();
		});
		$("#sendToBackButton").on("click", function(e){
			fabricCanvas.sendToBack(fabricCanvas.getActiveObject());
			closeRightClickMenu();
		});
		$("#editScriptsButton").on("click", function(e){
			fabricCanvas.getActiveObject().wickData.toFrame = prompt("Enter script:");
			closeRightClickMenu();
		});
		$("#deleteButton").on("click", function(e){
			fabricCanvas.getActiveObject().remove();
			closeRightClickMenu();
		});

		$("#clearFrameButton").on("click", function(e){
			//canvas.clear();
			//closeRightClickMenu();
			console.log("clearFrameButton hack!!!!!!!!!!!!!!!!")
			var fabricObjectsInCanvas = [];

			fabricCanvas.forEachObject(function(obj){
				// Deepcopy and add to frame
				fabricObjectsInCanvas.unshift(jQuery.extend(true, {}, obj));
			});
			console.log(fabricObjectsInCanvas);
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
			        closeRightClickMenu();
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
			fabricCanvas.setWidth( window.innerWidth );
			fabricCanvas.setHeight( window.innerHeight );
			fabricCanvas.calcOffset();

			fabricCanvas.forEachObject(function(obj){
				if(obj.wickCanvasName == "frame") {
					obj.width = project.resolution.x;
					obj.height = project.resolution.y;
					obj.left = (window.innerWidth-project.resolution.x)/2;
					obj.top = (window.innerHeight-project.resolution.y)/2;
					obj.setCoords();
				}
			});

			// also center timeline
			var GUIWidth = parseInt($("#timelineGUI").css("width"))/2;
			$("#timelineGUI").css('left', fabricCanvas.width/2-GUIWidth+'px');

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
		if(fabricCanvas.getActiveObject() != undefined) {
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

	// Load specified frame into fabric canvas
	var refreshObjectsOnCanvas = function () {

		fabricCanvas.clear();

		fabricCanvas.add(frameInside);

		var frame = project.getFrame(playheadPosition);

		for(var i = 0; i < frame.wickObjects.length; i++) {
			frame.wickObjects[i].getFabricObject(function(fabricObj) {
				fabricCanvas.add(fabricObj);
			});
		}

	}

	// Moves playhead to specified frame and updates the canvas and project.
	var gotoFrame = function (newFrameIndex) {

		console.log("Moving playhead to frame " + newFrameIndex);

		// Store changes made to current frame in the project
		project.storeCanvasIntoFrame(playheadPosition, fabricCanvas);

		// Move the playhead
		playheadPosition.moveToFrame(newFrameIndex);

		// Load stuff in the new frame into the canvas
		refreshObjectsOnCanvas();

		// Update timeline GUI
		updateTimelineGUI();

	}

	// 
	var moveOutOfObject = function () {

		console.err("moveOutOfObject() Not yet implemented!")

	}

	// 
	var moveInsideObject = function () {

		console.err("moveInsideObject() Not yet implemented!")

	}

	var updateTimelineGUI = function () {

		var timeline = document.getElementById("timeline");
		timeline.innerHTML = "";

		for(var i = 0; i < currentObjectBeingEdited.frames.length; i++) {

			var frameDiv = document.createElement("div");
			frameDiv.id = "frame" + i;
			if(playheadPosition.getCurrentFrameIndex() == i) {
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
		// retrieve uploaded files data
		// TODO: multiple files at once
		var file = files[0];

		// read file as data URL
		var reader = new FileReader();
		reader.onload = (function(theFile) {
			return function(e) {
				fabric.Image.fromURL(e.target.result, function(oImg) {
					// add new object to fabric canvas
					oImg.left = (fabricCanvas.width/2) - (oImg.width/2);
					oImg.top = (fabricCanvas.height/2) - (oImg.height/2);
					
					oImg.wickData = { subWickObjects: [] };

					fabricCanvas.add(oImg);
				});
			};
		})(file);
		reader.readAsDataURL(file);

		showUploadAlert = false;
	}

/*****************************
	Export projects
*****************************/
	
	var getProjectAsJSON = function () {
		// make sure project is synced up with canvas
		project.storeCanvasIntoFrame(playheadPosition, fabricCanvas);

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

/*****************************
	Draw loop
*****************************/

	var draw = function () {

		if(showUploadAlert) {
			// Draw this when a file is hovered over the editor
			fabricContext.fillStyle = '#000';
			fabricContext.textAlign = 'center';
			fabricContext.font = "30px Arial";
			fabricContext.fillText(
				"Drop image to add to scene...",
				fabricContext.width/2,
				fabricContext.height/2
			);
		}
	}

	return wickEditor;

})();