var WickEditor = (function () {

	var wickEditor = {};

	/* Settings */
	var SHOW_PAGE_LEAVE_WARNING = false;

	/* Flag to display feedback when something's being dragged into the editor */
	var showUploadAlert;

	/* Current project in editor */
	var project;

	/* Position of playhead to keep track of what frame we're editing */
	var playheadPosition;
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
		playheadPosition = new PlayheadPosition();

	// Setup canvas

		canvas = new fabric.Canvas('editorCanvas');
		canvas.selectionColor = 'rgba(0,0,5,0.1)';
		canvas.selectionBorderColor = 'grey';
		canvas.selectionLineWidth = 2;

		context = canvas.getContext('2d');

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

		$("#prevFrameButton").on("click", function(e){
			prevFrame();
		});
		$("#nextFrameButton").on("click", function(e){
			nextFrame();
		});

		$("#gotoFrameButton").on("click", function(e){
			//needs to use new playhead system
			//var toFrame = parseInt($('textarea#frameSelector').val());
			//goToFrame(toFrame);
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
			//needs to use playead system
			//goToFrame(canvas.getActiveObject().wickData.toFrame);
			//closeRightClickMenu();
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

	// Load specified frame into canvas
	var loadFrameIntoCanvas = function (specifiedPlayheadPosition) {

		canvas.clear();

		var frame = project.getFrame(playheadPosition);

		console.log(frame)

		for(var i = 0; i < frame.wickObjects.length; i++) {
			frame.wickObjects[i].getFabricObject(function(fabricObj) {
	            canvas.add(fabricObj);
	            console.log(fabricObj)
	        });
		}

	}

	// Moves playhead to specified frame and updates the canvas and project.
	var gotoFrame = function (newFrameIndex) {

		// Store changes made to current frame in the project
		project.storeCanvasIntoFrame(playheadPosition, canvas);

		// Move the playhead
		playheadPosition.moveToFrame(newFrameIndex)

		// Add a new frame to the project if one doesn't exist
		var frame = project.getFrame(playheadPosition);
		if(!frame) {
			project.addEmptyFrame(playheadPosition);
		}

		// Load stuff in the new frame into the canvas
		loadFrameIntoCanvas(playheadPosition);

	}

	// Go to the next frame.
	var nextFrame = function () {

		gotoFrame(playheadPosition.getCurrentFrameIndex()+1)

	}

	// Go to the previous frame.
	var prevFrame = function () {

		if(playheadPosition.getCurrentFrameIndex() <= 0) {

			console.err("prevFrame() called when playhead is at frame 0!");

		} else {

			gotoFrame(playheadPosition.getCurrentFrameIndex()-1)

		}

	}

	// 
	var goToLayer = function () {

		console.err("goToLayer() Not yet implemented!")

	}

	// 
	var moveOutOfObject = function () {

		console.err("moveOutOfObject() Not yet implemented!")

	}

	// 
	var moveInsideObject = function () {

		console.err("moveInsideObject() Not yet implemented!")

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

					oImg.wickData = { clickable: false, toFrame: 0 };

					console.log(oImg)

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
	
	var getProjectAsJSON = function () {
		// make sure project is synced up with canvas
		project.storeCanvasIntoFrame(playheadPosition, canvas);

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

	var loadProjectFromJSON = function (jsonString) {
		project = JSON.parse(jsonString);
		playheadPosition = new PlayheadPosition();
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