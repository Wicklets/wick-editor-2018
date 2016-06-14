var WickEditor = (function () {

	var wickEditor = { version: 'pre-alpha' };

/*****************************
	Settings
*****************************/
	
	var SHOW_PAGE_LEAVE_WARNING = false;
	var AUTO_LOAD_UNIT_TEST_PROJECT = false;
	var UNIT_TEST_PROJECT_PATH = "tests/simple.json";

/*****************************
	Setup editor vars
*****************************/

	/* Current project in editor */
	var project;

	/* Current object being edited */
	var currentObject;

	/* Handles all the Fabric.js stuff */
	var fabricCanvas;

	/* Handles all the paper.js stuff */
	var paperCanvas;

	/* Scripting IDE */
	var scriptingIDE;

	/* Timeline controller */
	var timelineController;

	/* Action handler (undo/redo stack) */
	var actionHandler;

	/* Mouse and keyboard input variables */
	var mouse = {};
	var keys;

/*****************************
	Setup editor
*****************************/

	wickEditor.setup = function() {

		console.log("WickEditor rev " + wickEditor.version);

		// Create a new project
		project = new WickProject();
		currentObject = project.rootObject;

		// Setup fabric
		fabricCanvas = new FabricCanvas();

		// Setup paper
		paperCanvas = new PaperCanvas();

		// Setup scripting IDE
		scriptingIDE = new WickScriptingIDE();

		// Set the timeline controller GUI to an initial state
		timelineController = new WickTimelineController();
		timelineController.updateGUI(currentObject);

		// Setup action handler
		actionHandler = new WickActionHandler();

		// Load the 'unit test' project
		if(AUTO_LOAD_UNIT_TEST_PROJECT) {
			var devTestProjectJSON = WickFileUtils.downloadFile(UNIT_TEST_PROJECT_PATH);
			loadProjectFromJSON(devTestProjectJSON);
		}

/**********************************
	Setup event handlers
**********************************/

	// Setup mouse move event

		document.addEventListener( 'mousemove', function ( event ) {

			mouse.x = event.clientX;
			mouse.y = event.clientY;

		}, false );


	// Setup right click events

		document.addEventListener('contextmenu', function(e) {
			e.preventDefault();
		}, false);

	// The extended version of the fabric canvas fires off a mouse:down event on right clicks
	// We use this here to select an item with a right click

		fabricCanvas.getCanvas().on('mouse:down', function(e) {
			if(e.e.button == 2) {

				if (e.target && e.target.wickObject) {
					// Programatically set active object of fabric canvas
					var id = fabricCanvas.getCanvas().getObjects().indexOf(e.target);
					fabricCanvas.getCanvas().setActiveObject(fabricCanvas.getCanvas().item(id));
				}

				if(!e.target) {
					// Didn't right click an object, deselect everything
					fabricCanvas.getCanvas().deactivateAll().renderAll();
				}
				WickEditor.openRightClickMenu();

			} else {
				WickEditor.closeRightClickMenu();
			}
		});

	// Setup keypress events

		keys = [];

		document.getElementById("editorCanvasContainer").addEventListener("keydown", function (e) {
			keys[e.keyCode] = true;

			var controlKeyDown = keys[91];
			var shiftKeyDown = keys[16];

			// Control-shift-z: redo
			if(e.keyCode == 90 && controlKeyDown && shiftKeyDown) {
				console.error("Redo not yet bound to hotkey!");
			}
			// Control-z: undo
			else if(e.keyCode == 90 && controlKeyDown) {
				actionHandler.undoAction();
			}

			// Backspace: delete selected objects
			if(e.keyCode == 8) {
				e.preventDefault();
				wickEditor.deleteSelectedObject();
			}

			// Tilde: log project state to canvas (for debugging)
			if(e.keyCode == 192) {
				console.log(project);
				console.log(fabricCanvas);
			}

		});

		document.getElementById("editorCanvasContainer").addEventListener("keyup", function (e) {
			keys[e.keyCode] = false;
		});

	// Setup copy/paste events

		var focusHiddenArea = function() {
			// In order to ensure that the browser will fire clipboard events, we always need to have something selected
			$("#hidden-input").val(' ');
			$("#hidden-input").focus().select();
		};

		document.addEventListener("copy", function(e) {
			var clipboardData = e.clipboardData;
			if(!scriptingIDE.open) {
				focusHiddenArea();
				e.preventDefault();
				WickObjectUtils.copyWickObjectJSONToClipboard(clipboardData, fabricCanvas, currentObject);
			}
		});

		document.addEventListener("paste", function(e) {
			var clipboardData = e.clipboardData;
			if(!scriptingIDE.open) { 
				focusHiddenArea();
				e.preventDefault();

				var items = clipboardData.items;

				for (i=0; i<items.length; i++) {

					var fileType = items[i].type;
					var file = clipboardData.getData(items[i].type);

					if (fileType === 'image/png') {
						var blob = items[i].getAsFile();
						var URLObj = window.URL || window.webkitURL;
						var source = URLObj.createObjectURL(blob);
						importImage("File names for pasted images not set.", source);
					} else if (fileType == 'text/wickobjectjson' ||
						       fileType == 'text/wickobjectarrayjson') {
						WickObjectUtils.pasteWickObjectJSONFromClipboardIntoCanvas(fileType, clipboardData, fabricCanvas, currentObject);
					}	
				}
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

	// Setup window resize event

		var resizeWindow = function () {
			resizeCanvasAndGUI();
		}
		window.addEventListener('resize', resizeWindow, false);
		resizeWindow();

	// Scripting IDE events

		// Update selected objects scripts when script editor text changes
		scriptingIDE.aceEditor.getSession().on('change', function (e) {
			scriptingIDE.updateScriptsOnObject(fabricCanvas.getActiveObject());
		});

	// Fabric.js events

		fabricCanvas.getCanvas().on('object:selected', function (e) {
			scriptingIDE.reloadScriptingGUITextArea(fabricCanvas.getActiveObject());
		});

		fabricCanvas.getCanvas().on('selection:cleared', function (e) {
			scriptingIDE.closeScriptingGUI();
		});

		fabricCanvas.getCanvas().on('object:added', function(e) {
			if(e.target.type === "path") {
				var path = e.target;
				fabricCanvas.convertPathToWickObjectAndAddToCanvas(path, currentObject);
				fabricCanvas.getCanvas().remove(path);
			}
		});

	}

	var resizeCanvasAndGUI = function () {
		// Resize canvas
		fabricCanvas.resize(
			project.resolution.x, 
			project.resolution.y
		);

		// Also center timeline GUI
		var GUIWidth = parseInt($("#timelineGUI").css("width")) / 2;
		var timelineOffset = window.innerWidth/2 - GUIWidth;
		$("#timelineGUI").css('left', timelineOffset+'px');
	}

/***********************************
	Timeline GUI methods
***********************************/

	// Moves playhead to specified frame and updates the canvas and project.
	wickEditor.gotoFrame = function (newFrameIndex) {

		// Store changes made to current frame in the project
		currentObject.frames[currentObject.currentFrame].wickObjects = fabricCanvas.getWickObjectsInCanvas();

		// move playhead
		currentObject.currentFrame = newFrameIndex;

		// Load wickobjects in the frame we moved to into the canvas
		fabricCanvas.storeObjectsIntoCanvas( currentObject.getCurrentFrame().wickObjects );

		timelineController.updateGUI(currentObject);

	}

	wickEditor.addEmptyFrame = function () {

		// Add an empty frame
		currentObject.addEmptyFrame(currentObject.frames.length);

		// Move to that new frame
		WickEditor.gotoFrame(currentObject.frames.length-1);

		// Update GUI
		resizeCanvasAndGUI();
		timelineController.updateGUI(currentObject);

	}

/***********************************
	Main menu bar GUI methods
***********************************/

	wickEditor.newProject = function () {

		if(confirm("Create a new project? All unsaved changes to the current project will be lost!")) {
			project = new WickProject();
			currentObject = project.rootObject;
			fabricCanvas.storeObjectsIntoCanvas( currentObject.getCurrentFrame().wickObjects );
			timelineController.updateGUI(currentObject);
		}

	}

	wickEditor.saveProject = function () {

		WickFileUtils.saveProjectAsJSONFile(getProjectAsJSON());

	}

	wickEditor.openProject = function () {
		WickFileUtils.readJSONFromFileChooser(
			document.getElementById("importButton"), 
			loadProjectFromJSON
		);
	}

	wickEditor.exportProject = function () {
		WickFileUtils.saveProjectAsHTMLFile(getProjectAsJSON());
	}

/***********************************
	Toolbar GUI methods
***********************************/

	wickEditor.startDrawingMode = function () {
		fabricCanvas.startDrawingMode();
	}

	wickEditor.stopDrawingMode = function () {
		fabricCanvas.stopDrawingMode();	
	}

	wickEditor.addNewText = function () {

		var textWickObject = new WickObject();

		textWickObject.setDefaultPositioningValues();
		textWickObject.left = window.innerWidth/2;
		textWickObject.top = window.innerHeight/2;

		textWickObject.parentObject = currentObject;

		textWickObject.fontData = {
			text: 'Click to edit text',
			fontFamily: 'arial black'
		};

		fabricCanvas.addWickObjectToCanvas(textWickObject);

		WickEditor.gotoFrame(currentObject.currentFrame);
	}

/***********************************
	Right click GUI methods
***********************************/

	wickEditor.deleteSelectedObject = function () {

		var doAction = function () {
			if (fabricCanvas.getCanvas().getActiveGroup()) {
				fabricCanvas.getCanvas().getActiveGroup().forEachObject(function(o) { 
					fabricCanvas.getCanvas().remove(o);
				});
				fabricCanvas.getCanvas().discardActiveGroup().renderAll();
			} else {
				fabricCanvas.getCanvas().remove(fabricCanvas.getCanvas().getActiveObject());
			}
		}

		var obj = fabricCanvas.getCanvas().getActiveObject() 
		var group = fabricCanvas.getCanvas().getActiveGroup();
		var groupObjs = [];
		
		if(group) {
			var items = group._objects;
			group._restoreObjectsState();
			for(var i = 0; i < items.length; i++) {
				groupObjs.push(items[i]);
			}
		}

		var undoAction = function () {
			if(group) {
				for(var i = 0; i < groupObjs.length; i++) {
					fabricCanvas.getCanvas().add(groupObjs[i]);
				}
			} else {
				fabricCanvas.getCanvas().add(obj);
			}
		}

		var action = new WickAction(doAction,undoAction);
		actionHandler.doAction(action);
		
	}

	wickEditor.convertSelectedObjectToSymbol = function () {

		var symbol = new WickObject();

		var selectedObject = fabricCanvas.getCanvas().getActiveObject() || fabricCanvas.getCanvas().getActiveGroup();

		symbol.parentObject = currentObject;
		symbol.left = selectedObject.left;
		symbol.top = selectedObject.top;
		symbol.setDefaultPositioningValues();
		symbol.setDefaultSymbolValues();

		if (selectedObject._objects) {
			// Multiple objects are selected, put them all in the new symbol
			for(var i = 0; i < selectedObject._objects.length; i++) {
				symbol.frames[0].wickObjects[i] = selectedObject._objects[i].wickObject;
				symbol.frames[0].wickObjects[i].parentObject = symbol;

				// Position child objects relative to symbols position
				var childOldLeft = symbol.frames[0].wickObjects[i].left;
				var childOldTop = symbol.frames[0].wickObjects[i].top;
				var childNewLeft = childOldLeft - symbol.left;
				var childNewTop = childOldTop - symbol.top;
				symbol.frames[0].wickObjects[i].left = childNewLeft;
				symbol.frames[0].wickObjects[i].top = childNewTop;
			}
			while(selectedObject._objects.length > 0) {
				selectedObject._objects[0].remove();
			}
		} else {
			// Only one object is selected
			symbol.frames[0].wickObjects[0] = selectedObject.wickObject;
			symbol.frames[0].wickObjects[0].parentObject = symbol;
			symbol.frames[0].wickObjects[0].left = 0;
			symbol.frames[0].wickObjects[0].top = 0;

			selectedObject.remove();
		}

		fabricCanvas.addWickObjectToCanvas(symbol);

		// deselect everything
		fabricCanvas.getCanvas().deactivateAll().renderAll();

		WickEditor.gotoFrame(currentObject.currentFrame);

	}

	wickEditor.editSelectedObject = function () {
		moveInsideObject(fabricCanvas.getActiveObject().wickObject);
	}

	wickEditor.editScriptsOfSelectedObject = function () {
		scriptingIDE.openScriptingGUI();
		scriptingIDE.reloadScriptingGUITextArea(fabricCanvas.getActiveObject());
	}

	wickEditor.finishEditingObject = function () {
		moveOutOfObject();
	}

	wickEditor.sendSelectedObjectToBack = function () {
		console.error("Not yet implemented");
	}

	wickEditor.bringSelectedObjectToFront = function () {
		console.error("Not yet implemented");
	}

	wickEditor.clearFrame = function () {
		console.error("Not yet implemented");
	}

/*****************************
	should be in wickpropertiesgui.js
*****************************/

	var updatePropertiesGUI = function(tab) {

		$("#projectProperties").css('display', 'none');
		$("#symbolProperties").css('display', 'none');
		$("#textProperties").css('display', 'none');

		switch(tab) {
			case 'project':
				$("#propertiesGUI").css('display', 'inline');
				$("#projectProperties").css('display', 'inline');
				break;
			case 'symbol':
				$("#propertiesGUI").css('display', 'inline');
				$("#symbolProperties").css('display', 'inline');
				break;
			case 'edit':
				$("#propertiesGUI").css('display', 'inline');
				$("#textProperties").css('display', 'inline');
				break;
			case 'hide':
				$("#propertiesGUI").css('display', 'none');
				break;
			case 'show':
				$("#propertiesGUI").css('display', 'inline');
				break;
		}

	};

/*****************************
	should be in wickscriptingide.js
*****************************/

	var openScriptingGUI = function () {
		scriptingIDE.open = true;
		$("#scriptingGUI").css('visibility', 'visible');
		reloadScriptingGUI();
	};

	var reloadScriptingGUI = function() {
		changeCurrentScript('onLoad');
	};

	var changeCurrentScript = function(scriptString) {
		currentScript = scriptString;
		reloadScriptingGUITextArea();
	};

	var reloadScriptingGUITextArea = function() {
		var activeObj = fabricCanvas.getActiveObject();
		if(activeObj && activeObj.wickObject.wickScripts && activeObj.wickObject.wickScripts[currentScript]) {
			var script = fabricCanvas.getActiveObject().wickObject.wickScripts[currentScript];
			scriptingIDE.aceEditor.setValue(script, -1);
		}

		document.getElementById("onLoadButton").className = (currentScript == 'onLoad' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
		document.getElementById("onUpdateButton").className = (currentScript == 'onUpdate' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
		document.getElementById("onClickButton").className = (currentScript == 'onClick' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
	};

	var closeScriptingGUI = function() {
		scriptingIDE.open = false;
		$("#scriptingGUI").css('visibility', 'hidden');
	};

/*****************************
	GUI
*****************************/

	var resizeCanvasAndGUI = function () {
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

/***************************************
	should be in wickrightclickmenu.js
***************************************/

	wickEditor.openRightClickMenu = function () {

		var createButton = function (buttonName, functionName) {
			var button = "";
			button += '<div class="button" ';
			button += 'onclick="WickEditor.closeRightClickMenu(); ';
			button += 'WickEditor.' + functionName + '();">';
			button += buttonName + '</div>'
			return button
		}

		// Make rightclick menu visible
		$("#rightClickMenu").css('visibility', 'visible');
		// Attach it to the mouse
		$("#rightClickMenu").css('top', mouse.y+'px');
		$("#rightClickMenu").css('left', mouse.x+'px');

		$("#insideSymbolButtons").css('display', 'none');
		$("#symbolButtons").css('display', 'none');
		$("#staticObjectButtons").css('display', 'none');
		$("#commonObjectButtons").css('display', 'none');
		$("#frameButtons").css('display', 'none');

		if(!currentObject.isRoot) {
			$("#insideSymbolButtons").css('display', 'block');
		}

		var selectedObject = fabricCanvas.getCanvas().getActiveObject() 
		                  || fabricCanvas.getCanvas().getActiveGroup();
		if(selectedObject) {
			if(selectedObject.wickObject && selectedObject.wickObject.isSymbol) {
				$("#symbolButtons").css('display', 'block');
			} else {
				$("#staticObjectButtons").css('display', 'block');
			}
			$("#commonObjectButtons").css('display', 'block');
			
		} else {
			$("#frameButtons").css('display', 'block');
		}
	}

	wickEditor.closeRightClickMenu = function () {
		// Hide rightclick menu
		$("#rightClickMenu").css('visibility', 'hidden');
		$("#rightClickMenu").css('top', '0px');
		$("#rightClickMenu").css('left','0px');

		$("#symbolButtons").css('display', 'none');
		$("#staticObjectButtons").css('display', 'none');
		$("#commonObjectButtons").css('display', 'none');
		$("#frameButtons").css('display', 'none');
	}

/****************************************
	Builtin player GUI
*****************************************/

	wickEditor.runProject = function () {
		// Hide the editor, show the player
		document.getElementById("editor").style.display = "none";
		document.getElementById("builtinPlayer").style.display = "block";

		// JSONify the project and have the builtin player run it
		var JSONProject = getProjectAsJSON();
		WickPlayer.runProject(JSONProject);
	}

	wickEditor.closeBuiltinPlayer = function() {
		// Show the editor, hide the player
		document.getElementById("builtinPlayer").style.display = "none";
		document.getElementById("editor").style.display = "block";

		// Clean up player
		WickPlayer.stopRunningCurrentProject();
	}

/*******************************
	Internal timeline methods
*******************************/

	// 
	var moveOutOfObject = function () {

		// Store changes made to current frame in the project
		currentObject.frames[currentObject.currentFrame].wickObjects = fabricCanvas.getWickObjectsInCanvas();

		// Set the editor to be editing the parent object
		currentObject = currentObject.parentObject;

		// Load wickobjects in the frame we moved to into the canvas
		fabricCanvas.storeObjectsIntoCanvas( currentObject.getCurrentFrame().wickObjects );

		timelineController.updateGUI(currentObject);

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

		timelineController.updateGUI(currentObject);

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

		var left = 0;
		var top = 0;
		if(currentObject.isRoot) {
			left = window.innerWidth/2;
			top = window.innerHeight/2;
		}

		WickObjectUtils.createWickObjectFromImage(
			data, 
			left, 
			top, 
			currentObject, 
			function(o) { fabricCanvas.addWickObjectToCanvas(o); }
		);

	}

	var importSound = function (name, data) {

	}

	var importVectors = function (name, data) {

	}

/**********************************
	Import/Export JSON projects
**********************************/
	
	var getProjectAsJSON = function () {
		// Store changes made to current frame in the project
		currentObject.frames[currentObject.currentFrame].wickObjects = fabricCanvas.getWickObjectsInCanvas();

		// Remove parent object references 
		// (can't JSONify objects with circular references, player doesn't need them anyway)
		project.rootObject.removeParentObjectRefences();

		// Encode scripts to avoid JSON format problems
		WickSharedUtils.encodeScripts(project.rootObject);

		var JSONProject = JSON.stringify(project);

		// Put parent object references back in all objects
		project.rootObject.regenerateParentObjectReferences();

		// Decode scripts back to human-readble and eval()-able format
		WickSharedUtils.decodeScripts(project.rootObject);

		return JSONProject;
	}

	var loadProjectFromJSON = function (jsonString) {
		// Replace current project with project in JSON
		project = JSON.parse(jsonString);

		// Put prototypes back on object ('class methods'), they don't get JSONified on project export.
		WickObjectUtils.putWickObjectPrototypeBackOnObject(project.rootObject);

		// Regenerate parent object references
		// These were removed earlier because JSON can't handle infinitely recursive objects (duh)
		project.rootObject.regenerateParentObjectReferences();

		// Decode scripts back to human-readble and eval()-able format
		WickSharedUtils.decodeScripts(project.rootObject);

		// Start editing the first frame of root
		// TODO: Projects should store the current place they were in when last saved
		currentObject = project.rootObject;
		currentObject.currentFrame = 0;

		// Load wickobjects in the frame we moved to into the canvas
		fabricCanvas.storeObjectsIntoCanvas( currentObject.getCurrentFrame().wickObjects );

		timelineController.updateGUI(currentObject);
	}

	return wickEditor;

})();