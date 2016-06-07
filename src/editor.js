var WickEditor = (function () {

	var wickEditor = { version: '0' };

	/* Current project in editor */
	var project;

	/* Current object being edited */
	var currentObject;

	/* Handles all the Fabric.js stuff */
	var fabricCanvas;

	/* Handles all the paper.js stuff */
	var paperCanvas;

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

		// Setup fabric
		fabricCanvas = new FabricCanvas();

		// Setup paper
		paperCanvas = new PaperCanvas();

		// Set the GUI to an initial state
		updateTimelineGUI();

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

	// Setup scripting GUI events

		$("#onLoadButton").on("click", function (e) {
			changeCurrentScript('onLoad');
		});

		$("#onClickButton").on("click", function (e) {
			changeCurrentScript('onClick');
		});

		$("#onUpdateButton").on("click", function (e) {
			changeCurrentScript('onUpdate');
		});

		$("#closeScriptingGUIButton").on("click", function (e) {
			closeScriptingGUI();
		});

		$("#scriptTextArea").bind('input propertychange', function() {
			fabricCanvas.getActiveObject().wickObject.wickScripts[currentScript] = this.value;
		});

		// Load scripts into the script editor GUI
		fabricCanvas.getCanvas().on('object:selected', function(e) {
			reloadScriptingGUI();
		});

		// Clear scripting bar when object deselected
		fabricCanvas.getCanvas().on('selection:cleared', function(e) {
			closeScriptingGUI();
		});

	// Setup toolbar GUI events

		$("#mouseToolButton").on("click", function (e) {
			fabricCanvas.stopDrawingMode();
		});

		$("#paintbrushToolButton").on("click", function (e) {
			fabricCanvas.startDrawingMode();
		});

	// Setup timeline GUI events

		$("#addEmptyFrameButton").on("click", function (e) {
			// Add an empty frame
			currentObject.addEmptyFrame(currentObject.frames.length);

			// Move to that new frame
			gotoFrame(currentObject.frames.length-1);

			// Update GUI
			resizeWindow();
			updateTimelineGUI();
		});

	// Setup right click menu button events

		$("#convertToSymbolButton").on("click", function (e) {
			var symbol = new WickObject();

			symbol.parentObject = currentObject;
			symbol.left = fabricCanvas.getActiveObject().left;
			symbol.top = fabricCanvas.getActiveObject().top;
			symbol.setDefaultPositioningValues();
			symbol.setDefaultSymbolValues();

			// TODO: Convert multiple symbols to objects
			symbol.frames[0].wickObjects[0] = fabricCanvas.getActiveObject().wickObject;
			symbol.frames[0].wickObjects[0].parentObject = symbol;
			symbol.frames[0].wickObjects[0].left = 0;
			symbol.frames[0].wickObjects[0].top = 0;

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
			openScriptingGUI();
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

		document.getElementById("editorCanvasContainer").addEventListener("keydown", function (e) {
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

		document.getElementById("editorCanvasContainer").addEventListener("keyup", function (e) {
			keys[e.keyCode] = false;
		});

	// Path to wick object conversion
	// This should not be here, the current drawing system is temporary though, so get rid of it later

		// When a path is done being drawn, create a wick object out of it.
		// This is to get around the player currently not supporting paths.
		//
		// Later on, we will rasterize the path drawn by fabric, and vectorize it using potrace.
		// The vectors can then be edited with paper.js.
		//
		fabricCanvas.getCanvas().on('object:added', function(e) {
			if(e.target.type === "path") {
				e.target.cloneAsImage(function(clone) {
					// Create a new wick object with the paths data
					var obj = new WickObject();
					obj.dataURL = clone._element.currentSrc;
					obj.left = e.target.left - clone.width/2;
					obj.top = e.target.top - clone.height/2;
					obj.setDefaultPositioningValues();
					obj.parentObject = currentObject;

					// Put that wickobject in the fabric canvas
					fabricCanvas.addWickObjectToCanvas(obj);
				});

				fabricCanvas.getCanvas().remove(e.target);
			}
		});

	// The extended version of the fabric canvas fires off a mouse:down event on right clicks
	// We use this here to select an item with a right click

		fabricCanvas.getCanvas().on('mouse:down', function(e) {
			if(e.target) {
				var id = fabricCanvas.getCanvas().getObjects().indexOf(e.target);
				fabricCanvas.getCanvas().setActiveObject(fabricCanvas.getCanvas().item(id));
			}
		});

	// Setup drag/drop events

		$("#editorCanvasContainer").on('dragover', function(e) {
			fabricCanvas.showDragToImportFileAlert();
			return false;
		});
		$("#editorCanvasContainer").on('dragleave', function(e) {
			fabricCanvas.hideDragToImportFileAlert();
			return false;
		});
		$("#editorCanvasContainer").on('drop', function(e) {
			// prevent browser from opening the file
			e.stopPropagation();
			e.preventDefault();

			importFilesDroppedIntoEditor(e.originalEvent.dataTransfer.files);

			fabricCanvas.hideDragToImportFileAlert();

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

		// move playhead
		currentObject.currentFrame = newFrameIndex;

		// Load wickobjects in the frame we moved to into the canvas
		fabricCanvas.storeObjectsIntoCanvas( currentObject.getCurrentFrame().wickObjects );

		updateTimelineGUI();

	}

	// 
	var moveOutOfObject = function () {

		// Store changes made to current frame in the project
		currentObject.frames[currentObject.currentFrame].wickObjects = fabricCanvas.getWickObjectsInCanvas();

		// Set the editor to be editing the parent object
		currentObject = currentObject.parentObject;

		// Load wickobjects in the frame we moved to into the canvas
		fabricCanvas.storeObjectsIntoCanvas( currentObject.getCurrentFrame().wickObjects );

		updateTimelineGUI();

	}

	// 
	var moveInsideObject = function (object) {

		// Store changes made to current frame in the project
		currentObject.frames[currentObject.currentFrame].wickObjects = fabricCanvas.getWickObjectsInCanvas();

		// Set the editor to be editing this object at its first frame
		currentObject = object;
		currentObject.currentFrame = 0;

		// Load wickobjects in the frame we moved to into the canvas
		fabricCanvas.storeObjectsIntoCanvas( currentObject.getCurrentFrame().wickObjects );

		updateTimelineGUI();

	}

/*****************************
	GUI
*****************************/

	var defaultScript = 'onLoad';
	var currentScript = defaultScript;

	var openScriptingGUI = function () {
		$("#scriptingGUI").css('visibility', 'visible');
		reloadScriptingGUI();
	};

	var reloadScriptingGUI = function() {
		changeCurrentScript(defaultScript);
	};

	var changeCurrentScript = function(scriptString) {
		currentScript = scriptString;
		reloadScriptingGUITextArea();
	};

	var reloadScriptingGUITextArea = function() {
		var activeObj = fabricCanvas.getActiveObject();
		if(activeObj && activeObj.wickObject.wickScripts && activeObj.wickObject.wickScripts[currentScript]) {
			var script = fabricCanvas.getActiveObject().wickObject.wickScripts[currentScript];
			$("#scriptTextArea").val(script);
		} else {
			$("#scriptTextArea").val("");
		}
	};

	var closeScriptingGUI = function() {
		currentScript = defaultScript;
		$("#scriptingGUI").css('visibility', 'hidden');
	};

	var updateTimelineGUI = function () {

		console.log("updateTimelineGUI() called. project state:")
		console.log(project.rootObject.frames)

		// Update the paper canvas inside the fabric canvas.

		fabricCanvas.reloadPaperCanvas(paperCanvas.getCanvas());

		// Update timeline GUI to match the current object's frames.

		var timeline = document.getElementById("timeline");
		timeline.innerHTML = "";

		for(var i = 0; i < currentObject.frames.length; i++) {

			var frameDiv = document.createElement("div");
			frameDiv.id = "frame" + i;
			frameDiv.innerHTML = i;
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
		for (var i = 0; i < files.length; i++) {
			var file = files[i];

			// Read file as data URL
			var reader = new FileReader();
			reader.onload = (function(theFile) {
				return function(e) {
					// TODO: Check filetype for image/sound/video/etc.

					importImage(theFile.name, e.target.result)
				};
			})(file);
			reader.readAsDataURL(file);
		}
	}

	var importImage = function (name, data) {

		var fileImage = new Image();
		fileImage.src = data;

		fileImage.onload = function() {
			// Create a new wick object with that data
			var obj = new WickObject();
			obj.setDefaultPositioningValues();
			obj.objectName = name;
			obj.dataURL = data;
			obj.left = 0//(window.innerWidth/2);
			obj.top = 0//(window.innerHeight/2);
			obj.width = fileImage.width;
			obj.height = fileImage.height;
			obj.parentObject = currentObject;

			// Put that wickobject in the fabric canvas
			fabricCanvas.addWickObjectToCanvas(obj);
		}

	}

/*****************************
	Export projects
*****************************/
	
	var getProjectAsJSON = function () {
		// Store changes made to current frame in the project
		currentObject.frames[currentObject.currentFrame].wickObjects = fabricCanvas.getWickObjectsInCanvas();

		// Remove parent object references 
		// (can't JSONify objects with circular references, player doesn't need them anyway)
		project.rootObject.removeParentObjectRefences();

		var JSONProject = JSON.stringify(project);

		// Put parent object references back in all objects
		project.rootObject.regenerateParentObjectReferences();

		return JSONProject;
	}

	var exportProjectAsJSONFile = function () {
		// Save JSON project and have user download it
		var blob = new Blob([getProjectAsJSON()], {type: "text/plain;charset=utf-8"});
		saveAs(blob, "project.json");
	}

	var exportProjectAsHTML = function () {
		var fileOut = "";

		// Add the player webpage (need to download the empty player)
		fileOut += WickUtils.downloadFile("player.htm") + "\n";

		// Add the any libs that the player needs
		fileOut += "<script>" + WickUtils.downloadFile("src/fpscounter.js") + "</script>\n";

		// Add the player (need to download the player code)
		fileOut += "<script>" + WickUtils.downloadFile("src/player.js") + "</script>\n";

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
		console.error("Remember to put prototypes back on objects here.");

		project = JSON.parse(jsonString);
		project.rootObject.regenerateParentObjectReferences();
		currentObject = project.rootObject;
		gotoFrame(0);
		updateTimelineGUI();
	}

/*****************************
	Run projects
*****************************/

	var runProject = function () {
		// Hide the editor, show the player
		document.getElementById("editor").style.display = "none";
		document.getElementById("builtinPlayer").style.display = "block";

		// JSONify the project and have the builtin player run it
		var JSONProject = getProjectAsJSON();
		WickPlayer.runProject(JSONProject);
	}

	var closeBuiltinPlayer = function() {
		// Show the editor, hide the player
		document.getElementById("builtinPlayer").style.display = "none";
		document.getElementById("editor").style.display = "block";

		// Clean up player
		WickPlayer.stopRunningCurrentProject();
	}

	return wickEditor;

})();