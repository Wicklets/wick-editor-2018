var WickEditor = function () {

/*****************************
	Settings/Consts
*****************************/
	
	this.version = 'pre-alpha';

	this.AUTO_LOAD_UNIT_TEST_PROJECT = true;
	this.UNIT_TEST_PROJECT_PATH = "tests/simple.json";

/*********************************
	Initialize all editor vars
*********************************/

	console.log("WickEditor rev " + this.version);

	// Create a new project
	this.project = new WickProject();
	this.currentObject = this.project.rootObject;

	// Input
	this.mouse = {};
	this.keys = [];

	// Setup fabric
	this.fabricCanvas = new FabricCanvas(this);

	// Setup paper
	this.paperCanvas = new PaperCanvas(this);

	// Setup scripting IDE
	this.scriptingIDE = new WickScriptingIDE(this);

	// Set the timeline controller GUI to an initial state
	this.timelineController = new WickTimelineController(this);

	// Setup action handler
	this.actionHandler = new WickActionHandler(this);

	// Load the 'unit test' project
	if(this.AUTO_LOAD_UNIT_TEST_PROJECT) {
		var devTestProjectJSON = WickFileUtils.downloadFile(this.UNIT_TEST_PROJECT_PATH);
		this.loadProjectFromJSON(devTestProjectJSON);
	}

// temporary!! should be somewhere else

	var that = this;

	var testPositiveInteger = function(n, setFunc) {
		var num = Number(n);
		if((typeof num === 'number') && (num % 1 == 0) && (num > 0)) {
			setFunc(num);
			console.log(that.project);
		}
	}

    $('#projectSizeX').on('input propertychange', function() {

    	testPositiveInteger($('#projectSizeX').val(), function(n) {
    		that.project.resolution.x = n;
    	});

	});

	$('#projectSizeY').on('input propertychange', function() {

    	testPositiveInteger($('#projectSizeY').val(), function(n) {
    		that.project.resolution.y = n;
    	});

	});

	$('#frameRate').on('input propertychange', function() {

    	testPositiveInteger($('#frameRate').val(), function(n) {
    		that.project.framerate = n;
    	});

	});

}

/***********************************
	Event handlers
***********************************/

WickEditor.prototype.resizeCanvasAndGUI = function () {
	// Resize canvas
	this.fabricCanvas.resize(
		this.project.resolution.x, 
		this.project.resolution.y
	);

	// Also center timeline GUI
	var GUIWidth = parseInt($("#timelineGUI").css("width")) / 2;
	var timelineOffset = window.innerWidth/2 - GUIWidth;
	$("#timelineGUI").css('left', timelineOffset+'px');
}

WickEditor.prototype.updateMousePosition = function (event) {
	this.mouse.x = event.clientX;
	this.mouse.y = event.clientY;
}

WickEditor.prototype.handleKeyboardInput = function (eventType, event) {

	if(eventType === "keydown") {

		this.keys[event.keyCode] = true;

		var controlKeyDown = this.keys[91];
		var shiftKeyDown = this.keys[16];

		// Control-shift-z: redo
		if(event.keyCode == 90 && controlKeyDown && shiftKeyDown) {
			this.actionHandler.redoAction();	
		}
		// Control-z: undo
		else if(event.keyCode == 90 && controlKeyDown) {
			this.actionHandler.undoAction();
		}

		// Backspace: delete selected objects
		if(event.keyCode == 8) {
			event.preventDefault();
			wickEditor.deleteSelectedObject();
		}

		// Tilde: log project state to canvas (for debugging)
		if(event.keyCode == 192) {
			console.log(project);
			console.log(fabricCanvas);
		}

	} else if(eventType === "keyup") {

		this.keys[event.keyCode] = false;

	}

}

WickEditor.prototype.handleCopyEvent = function (event) {
	if(!this.scriptingIDE.open) {
		event.preventDefault();
		WickObjectUtils.copyWickObjectJSONToClipboard(event.clipboardData, this.fabricCanvas, this.currentObject);
	}
}

WickEditor.prototype.handlePasteEvent = function (event) {
	if(!this.scriptingIDE.open) { 
		event.preventDefault();

		var clipboardData = event.clipboardData;
		var items = clipboardData.items;

		for (i=0; i<items.length; i++) {

			var fileType = items[i].type;
			var file = clipboardData.getData(items[i].type);

			this.handlePastedItem(fileType, file);
		}
	}
}

WickEditor.prototype.handlePastedItem = function (fileType, file) {
	if (fileType === 'image/png') {
		var blob = items[i].getAsFile();
		var URLObj = window.URL || window.webkitURL;
		var source = URLObj.createObjectURL(blob);
		this.importImage("File names for pasted images not set.", source);
	} else if (fileType == 'text/wickobjectjson' ||
		       fileType == 'text/wickobjectarrayjson') {
		WickObjectUtils.pasteWickObjectJSONFromClipboardIntoCanvas(fileType, clipboardData, fabricCanvas, currentObject);
	}	
}

/***********************************
  Timeline pleayhead moving methods
***********************************/

// Moves playhead to specified frame and updates the canvas and project.
WickEditor.prototype.gotoFrame = function (newFrameIndex) {

	// Store changes made to current frame in the project
	this.currentObject.frames[this.currentObject.currentFrame].wickObjects = this.fabricCanvas.getWickObjectsInCanvas();

	// move playhead
	this.currentObject.currentFrame = newFrameIndex;

	// Load wickobjects in the frame we moved to into the canvas
	this.fabricCanvas.storeObjectsIntoCanvas( this.currentObject.getCurrentFrame().wickObjects );

	this.timelineController.updateGUI(this.currentObject);

}

WickEditor.prototype.addEmptyFrame = function () {

	// Add an empty frame
	this.currentObject.addEmptyFrame(this.currentObject.frames.length);

	// Move to that new frame
	this.gotoFrame(this.currentObject.frames.length-1);

	// Update GUI
	this.resizeCanvasAndGUI();
	this.timelineController.updateGUI(this.currentObject);

}

// 
WickEditor.prototype.moveOutOfObject = function () {

	// Store changes made to current frame in the project
	this.currentObject.frames[this.currentObject.currentFrame].wickObjects = this.fabricCanvas.getWickObjectsInCanvas();

	// Set the editor to be editing the parent object
	this.currentObject = this.currentObject.parentObject;

	// Load wickobjects in the frame we moved to into the canvas
	this.fabricCanvas.storeObjectsIntoCanvas( this.currentObject.getCurrentFrame().wickObjects );

	this.timelineController.updateGUI(this.currentObject);

}

// 
WickEditor.prototype.moveInsideObject = function (object) {

	// Store changes made to current frame in the project
	this.currentObject.frames[this.currentObject.currentFrame].wickObjects = this.fabricCanvas.getWickObjectsInCanvas();

	// Set the editor to be editing this object at its first frame
	this.currentObject = object;
	this.currentObject.currentFrame = 0;

	// Load wickobjects in the frame we moved to into the canvas
	this.fabricCanvas.storeObjectsIntoCanvas( this.currentObject.getCurrentFrame().wickObjects );

	this.timelineController.updateGUI(this.currentObject);

}

/***********************************
        Toolbar methods
***********************************/

WickEditor.prototype.startDrawingMode = function () {
	this.fabricCanvas.startDrawingMode();
}

WickEditor.prototype.stopDrawingMode = function () {
	this.fabricCanvas.stopDrawingMode();	
}

WickEditor.prototype.addNewText = function () {

	var textWickObject = new WickObject();

	textWickObject.setDefaultPositioningValues();
	textWickObject.left = window.innerWidth/2;
	textWickObject.top = window.innerHeight/2;

	textWickObject.parentObject = this.currentObject;

	textWickObject.fontData = {
		text: 'Click to edit text',
		fontFamily: 'arial black'
	};

	this.fabricCanvas.addWickObjectToCanvas(textWickObject);

	this.gotoFrame(this.currentObject.currentFrame);
}

/***********************************
      Right click menu methods
***********************************/

WickEditor.prototype.openRightClickMenu = function () {

	// Make rightclick menu visible
	$("#rightClickMenu").css('visibility', 'visible');
	// Attach it to the mouse
	$("#rightClickMenu").css('top', this.mouse.y+'px');
	$("#rightClickMenu").css('left', this.mouse.x+'px');

	// Hide everything

	$("#insideSymbolButtons").css('display', 'none');
	$("#symbolButtons").css('display', 'none');
	$("#staticObjectButtons").css('display', 'none');
	$("#commonObjectButtons").css('display', 'none');
	$("#frameButtons").css('display', 'none');

	// Selectively show portions we need depending on editor state

	var fabCanvas = this.fabricCanvas.getCanvas();
	var selectedObject = fabCanvas.getActiveObject() || fabCanvas.getActiveGroup();

	if(!this.currentObject.isRoot) {
		$("#insideSymbolButtons").css('display', 'block');
	}
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

WickEditor.prototype.closeRightClickMenu = function () {
	// Hide rightclick menu
	$("#rightClickMenu").css('visibility', 'hidden');
	$("#rightClickMenu").css('top', '0px');
	$("#rightClickMenu").css('left','0px');

	// Hide all buttons inside rightclick menu
	$("#symbolButtons").css('display', 'none');
	$("#staticObjectButtons").css('display', 'none');
	$("#commonObjectButtons").css('display', 'none');
	$("#frameButtons").css('display', 'none');
}

WickEditor.prototype.deleteSelectedObject = function () {

	this.actionHandler.doAction('delete');

}

WickEditor.prototype.convertSelectedObjectToSymbol = function () {

	var symbol = new WickObject();

	var fabCanvas = this.fabricCanvas.getCanvas();
	var selectedObject = fabCanvas.getActiveObject() || fabCanvas.getActiveGroup();

	symbol.parentObject = this.currentObject;
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

	this.fabricCanvas.addWickObjectToCanvas(symbol);

	// deselect everything
	this.fabricCanvas.getCanvas().deactivateAll().renderAll();

	this.gotoFrame(this.currentObject.currentFrame);

}

WickEditor.prototype.editSelectedObject = function () {
	this.moveInsideObject(fabricCanvas.getActiveObject().wickObject);
}

WickEditor.prototype.editScriptsOfSelectedObject = function () {
	this.scriptingIDE.openScriptingGUI();
	this.scriptingIDE.reloadScriptingGUITextArea(this.fabricCanvas.getActiveObject());
}

WickEditor.prototype.finishEditingObject = function () {
	this.moveOutOfObject();
}

WickEditor.prototype.sendSelectedObjectToBack = function () {
	console.error("Not yet implemented");
}

WickEditor.prototype.bringSelectedObjectToFront = function () {
	console.error("Not yet implemented");
}

WickEditor.prototype.clearFrame = function () {
	console.error("Not yet implemented");
}

/*****************************
    Properties box methods
*****************************/

WickEditor.prototype.updatePropertiesGUI = function(tab) {

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
       Import content
*****************************/

WickEditor.prototype.importFilesDroppedIntoEditor = function(files) {
	// Retrieve uploaded files data
	for (var i = 0; i < files.length; i++) {
		var file = files[i];

		// Read file as data URL
		var reader = new FileReader();
		reader.onload = (function(theFile) {
			return function(e) {
				// TODO: Check filetype for image/sound/video/etc.
				this.importImage(theFile.name, e.target.result)
			};
		})(file);
		reader.readAsDataURL(file);
	}
}

WickEditor.prototype.importImage = function (name, data) {

	var left = 0;
	var top = 0;
	if(this.currentObject.isRoot) {
		left = window.innerWidth/2;
		top = window.innerHeight/2;
	}

	WickObjectUtils.createWickObjectFromImage(
		data, 
		left, 
		top, 
		this.currentObject, 
		function(o) { fabricCanvas.addWickObjectToCanvas(o); }
	);

}

WickEditor.prototype.importSound = function (name, data) {

}

WickEditor.prototype.importVectors = function (name, data) {

}

/**********************************
  Project Open/Save/Import/Export
**********************************/

WickEditor.prototype.newProject = function () {

	if(confirm("Create a new project? All unsaved changes to the current project will be lost!")) {
		this.project = new WickProject();
		this.currentObject = this.project.rootObject;
		this.fabricCanvas.storeObjectsIntoCanvas( this.currentObject.getCurrentFrame().wickObjects );
		this.timelineController.updateGUI(this.currentObject);
	}

}

WickEditor.prototype.saveProject = function () {
	WickFileUtils.saveProjectAsJSONFile(this.getProjectAsJSON());
}

WickEditor.prototype.openProject = function () {
	WickFileUtils.readJSONFromFileChooser(
		document.getElementById("importButton"), 
		this.loadProjectFromJSON
	);
}

WickEditor.prototype.exportProject = function () {
	WickFileUtils.saveProjectAsHTMLFile(this.getProjectAsJSON());
}

WickEditor.prototype.getProjectAsJSON = function () {
	// Store changes made to current frame in the project
	this.currentObject.frames[this.currentObject.currentFrame].wickObjects = this.fabricCanvas.getWickObjectsInCanvas();

	// Remove parent object references 
	// (can't JSONify objects with circular references, player doesn't need them anyway)
	this.project.rootObject.removeParentObjectRefences();

	// Encode scripts to avoid JSON format problems
	WickSharedUtils.encodeScripts(this.project.rootObject);

	var JSONProject = JSON.stringify(this.project);

	// Put parent object references back in all objects
	this.project.rootObject.regenerateParentObjectReferences();

	// Decode scripts back to human-readble and eval()-able format
	WickSharedUtils.decodeScripts(this.project.rootObject);

	return JSONProject;
}

WickEditor.prototype.loadProjectFromJSON = function (jsonString) {
	// Replace current project with project in JSON
	this.project = JSON.parse(jsonString);

	// Put prototypes back on object ('class methods'), they don't get JSONified on project export.
	WickObjectUtils.putWickObjectPrototypeBackOnObject(this.project.rootObject);

	// Regenerate parent object references
	// These were removed earlier because JSON can't handle infinitely recursive objects (duh)
	this.project.rootObject.regenerateParentObjectReferences();

	// Decode scripts back to human-readble and eval()-able format
	WickSharedUtils.decodeScripts(this.project.rootObject);

	// Start editing the first frame of root
	// TODO: Projects should store the current place they were in when last saved
	this.currentObject = this.project.rootObject;
	this.currentObject.currentFrame = 0;

	// Load wickobjects in the frame we moved to into the canvas
	this.fabricCanvas.storeObjectsIntoCanvas( this.currentObject.getCurrentFrame().wickObjects );

	this.timelineController.updateGUI(this.currentObject);
}

/*************************
    Builtin player GUI
*************************/

WickEditor.prototype.runProject = function () {
	// Hide the editor, show the player
	document.getElementById("editor").style.display = "none";
	document.getElementById("builtinPlayer").style.display = "block";

	// JSONify the project and have the builtin player run it
	var JSONProject = this.getProjectAsJSON();
	WickPlayer.runProject(JSONProject);
}

WickEditor.prototype.closeBuiltinPlayer = function() {
	// Show the editor, hide the player
	document.getElementById("builtinPlayer").style.display = "none";
	document.getElementById("editor").style.display = "block";

	// Clean up player
	WickPlayer.stopRunningCurrentProject();
}
