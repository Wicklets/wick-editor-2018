var WickEditor = (function () {

	var wickEditor = { version: '0' };

	/* Editor settings */
	var SHOW_PAGE_LEAVE_WARNING = true;
	var LOAD_UNIT_TEST_PROJECT = false;

	/* Current project in editor */
	var project;

	/* Current object being edited */
	var currentObject;

	/* Handles all the Fabric.js stuff */
	var fabricCanvas;

	/* Handles all the paper.js stuff */
	var paperCanvas;

	/* Syntax highlighter for script editor window */
	var scriptEditor;

	/* Variables for script editor */
	var defaultScript = 'onLoad';
	var currentScript = defaultScript;

	/* Mouse and keyboard input variables */
	var mouse = {};
	var keys;

/*****************************
	Setup
*****************************/

	wickEditor.setup = function() {

		console.log("WickEditor rev " + wickEditor.version);

	// Setup editor vars

		// Create a new project
		project = new WickProject();
		currentObject = project.rootObject;

		// Setup fabric
		fabricCanvas = new FabricCanvas();

		// Setup paper
		paperCanvas = new PaperCanvas();

		// Setup syntax highligter for scripts window
		scriptEditor = ace.edit("scriptEditor");
	    scriptEditor.setTheme("ace/theme/chrome");
	    scriptEditor.getSession().setMode("ace/mode/javascript");
	    scriptEditor.$blockScrolling = Infinity; // Makes that weird message go away

		// Set the GUI to an initial state
		updateTimelineGUI();

		// Load the 'unit test' project
		if(LOAD_UNIT_TEST_PROJECT) {
			var devTestProjectJSON = WickUtils.downloadFile("tests/unit-test-project.json");
			loadProjectFromJSON(devTestProjectJSON);
		}

	// Setup main menu events

		$("#newProjectButton").on("click", function (e) {
			if(confirm("Create a new project? All unsaved changes to the current project will be lost!")) {
				project = new WickProject();
				currentObject = project.rootObject;
				fabricCanvas.storeObjectsIntoCanvas( currentObject.getCurrentFrame().wickObjects );
				updateTimelineGUI();
			}
		});
		$("#exportJSONButton").on("click", function (e) {
			WickUtils.saveProjectAsJSONFile(getProjectAsJSON());
		});
		$("#exportHTMLButton").on("click", function (e) {
			WickUtils.saveProjectAsHTMLFile(getProjectAsJSON());
		});
		$("#runButton").on("click", function (e) {
			runProject();
		});
		$('#openProjectButton').click(function(){
			$('#importButton').click();
		});

		$("#closeBuiltinPlayerButton").on("click", function (e) {
			closeBuiltinPlayer();
		});

		document.getElementById("importButton").onchange = function (e) {
			WickUtils.readJSONFromFileChooser(
				document.getElementById("importButton"), 
				loadProjectFromJSON
			);
		};

		document.getElementById("importButton").onchange = function (e) {
			WickUtils.readJSONFromFileChooser(
				document.getElementById("importButton"), 
				loadProjectFromJSON
			);
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

		// Update selected objects scripts when script editor text changes
		scriptEditor.getSession().on('change', function(e) {
			if(fabricCanvas.getActiveObject().wickObject.isSymbol) {
				fabricCanvas.getActiveObject().wickObject.wickScripts[currentScript] = scriptEditor.getValue();
			}
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
			convertActiveObjectToSymbol();
		});

		$("#bringToFrontButton").on("click", function (e) {
			console.error("Fix! Uses old fabric canvas");
			//fabricCanvas.bringToFront(fabricCanvas.getActiveObject());
			closeRightClickMenu();
		});
		$("#sendToBackButton").on("click", function (e) {
			console.error("Fix! Uses old fabric canvas");
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

			// Backspace: delete selected objects
			if(keys[8]) {
		        e.preventDefault();

		        if(fabricCanvas.getActiveObject()) {
			        fabricCanvas.getActiveObject().remove();
			    }
		    }
			
			// Right arrow
			if (keys[39]) {
				
			}

			// Left arrow
			if (keys[37]) {
				
			}

			// Tilde: log project state to canvas
			if(keys[192]) {
				console.log(project);
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

					var fileImage = new Image();
					fileImage.src = clone._element.currentSrc;

					fileImage.onload = function() {
						var obj = new WickObject();

						obj.setDefaultPositioningValues();
						obj.width = fileImage.width;
						obj.height = fileImage.height;
						obj.left = e.target.left - clone.width/2;
						obj.top = e.target.top - clone.height/2;

						obj.parentObject = currentObject;
						obj.dataURL = clone._element.currentSrc;

						fabricCanvas.addWickObjectToCanvas(obj);
					}
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
	Editor action utils
*****************************/

var convertActiveObjectToSymbol = function () {

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

}

/*****************************
	GUI
*****************************/

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
			scriptEditor.setValue(script, -1);
		} else {
			var emptyFunctionScript = "// " + currentScript + "\n";
			if(currentScript === "onLoad") {
				emptyFunctionScript += "// This script runs once when this object enters the scene.\n";
			} else if(currentScript === "onClick") {
				emptyFunctionScript += "// This script runs when this object is clicked on.\n";
			} else if(currentScript === "onUpdate") {
				emptyFunctionScript += "// This script runs repeatedly whenever this object is in the scene.\n";
			}
			scriptEditor.setValue(emptyFunctionScript, -1);
		}
	};

	var closeScriptingGUI = function() {
		currentScript = defaultScript;
		$("#scriptingGUI").css('visibility', 'hidden');
	};

	var updateTimelineGUI = function () {

		// Update the paper canvas inside the fabric canvas

		fabricCanvas.reloadPaperCanvas(paperCanvas.getCanvas());

		// Reset the timeline div

		var timeline = document.getElementById("timeline");
		timeline.innerHTML = "";
		timeline.style.width = currentObject.frames.length*23 + 6 + "px";

		for(var i = 0; i < currentObject.frames.length; i++) {

			// Create the frame element
			var frameDiv = document.createElement("span");
			frameDiv.id = "frame" + i;
			frameDiv.innerHTML = i;
			if(currentObject.currentFrame == i) {
				frameDiv.className = "timelineFrame active";
			} else {
				frameDiv.className = "timelineFrame";
			}
			timeline.appendChild(frameDiv);

			// Add mousedown event to the frame element so we can go to that frame when its clicked
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

			obj.parentObject = currentObject;
			obj.objectName = name;
			obj.dataURL = data;

			obj.setDefaultPositioningValues();
			obj.width = fileImage.width;
			obj.height = fileImage.height;
			if(currentObject.isRoot) {
				obj.left = window.innerWidth/2 - obj.width/2;
				obj.top = window.innerHeight/2 - obj.height/2;
			} else {
				obj.left = 0;
				obj.top = 0;
			}

			// Put that wickobject in the fabric canvas
			fabricCanvas.addWickObjectToCanvas(obj);
		}

	}

	var importSound = function (name, data) {

	}

	var importVectors = function (name, data) {

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

/*****************************
	Import projects
*****************************/

	var loadProjectFromJSON = function (jsonString) {
		// Replace current project with project in JSON
		project = JSON.parse(jsonString);

		// Put prototypes back on object ('class methods'), they don't get JSONified on project export.
		putPrototypeBackOnObject(project.rootObject);

		// Regenerate parent object references
		// These were removed earlier because JSON can't handle infinitely recursive objects (duh)
		project.rootObject.regenerateParentObjectReferences();

		// Start editing the first frame of root
		// TODO: Projects should store the current place they were in when last saved
		currentObject = project.rootObject;
		currentObject.currentFrame = 0;

		// Load wickobjects in the frame we moved to into the canvas
		fabricCanvas.storeObjectsIntoCanvas( currentObject.getCurrentFrame().wickObjects );

		updateTimelineGUI();

		console.log("loaded project:");
		console.log(project);
	}

	// This is supposedly a nasty thing to do - think about possible alternatives for IE and stuff
	var putPrototypeBackOnObject = function (obj) {

		// Put the prototype back on this object
		obj.__proto__ = WickObject.prototype;

		// Recursively put the prototypes back on the children objects
		if(obj.isSymbol) {
			for(var f = 0; f < obj.frames.length; f++) {
				var frame = obj.frames[f];
				for (var o = 0; o < frame.wickObjects.length; o++) {
					var wickObject = frame.wickObjects[o];
					putPrototypeBackOnObject(wickObject);
				}
			}
		}
	}

/****************************************
	Run projects with builtin player
*****************************************/

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