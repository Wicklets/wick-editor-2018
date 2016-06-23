var WickEditor = function () {

/*****************************
	Settings/Consts
*****************************/
	
	this.version = 'pre-alpha';

	this.AUTO_LOAD_UNIT_TEST_PROJECT = true;
	this.UNIT_TEST_PROJECT_PATH = "tests/sounds2.json";

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

	// Setup timeline controller gui
	this.htmlGUIHandler = new WickHTMLGUIHandler(this);

	// Setup action handler
	this.actionHandler = new WickActionHandler(this);

	// Load the 'unit test' project
	if(this.AUTO_LOAD_UNIT_TEST_PROJECT) {
		var devTestProjectJSON = WickFileUtils.downloadFile(this.UNIT_TEST_PROJECT_PATH);
		this.loadProjectFromJSON(devTestProjectJSON);
	}


// move this code to wicktooltips.js

	$('.tooltipElem').on("mouseover", function(e) {
		$("#tooltipGUI").css('visibility', 'visible');
		$("#tooltipGUI").css('top', wickEditor.mouse.y+5+'px');
		$("#tooltipGUI").css('left', wickEditor.mouse.x+5+'px');
		document.getElementById('tooltipGUI').innerHTML = e.currentTarget.attributes.alt.value;
	});

	$('.tooltipElem').on("mouseout", function(e) {
		$("#tooltipGUI").css('visibility', 'hidden');
	});

	this.openRightClickMenu = function () {

		// Make rightclick menu visible
		
		// Attach it to the mouse
		$("#rightClickMenu").css('top', wickEditor.mouse.y+'px');
		$("#rightClickMenu").css('left', wickEditor.mouse.x+'px');

		// Hide everything

		$("#insideSymbolButtons").css('display', 'none');
		$("#symbolButtons").css('display', 'none');
		$("#staticObjectButtons").css('display', 'none');
		$("#commonObjectButtons").css('display', 'none');
		$("#frameButtons").css('display', 'none');

		// Selectively show portions we need depending on editor state

		var fabCanvas = wickEditor.fabricCanvas.getCanvas();
		var selectedObject = fabCanvas.getActiveObject() || fabCanvas.getActiveGroup();

		if(!wickEditor.currentObject.isRoot) {
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

	this.closeRightClickMenu = function () {
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
	this.fabricCanvas.repositionOriginCrosshair(
		this.project.resolution.x, 
		this.project.resolution.y,
		this.currentObject.left,
		this.currentObject.top
	);

	$("#scriptEditor").css('width', window.innerWidth - 330);

	// Also center timeline GUI
	var GUIWidth = parseInt($("#timelineGUI").css("width")) / 2;
	var timelineOffset = window.innerWidth/2 - GUIWidth;
	$("#timelineGUI").css('left', timelineOffset+'px');
}

WickEditor.prototype.updateMousePosition = function (event) {
	this.mouse.x = event.clientX;
	this.mouse.y = event.clientY;
}

WickEditor.prototype.clearKeys = function () {
	this.keys = [];
}

WickEditor.prototype.handleKeyboardInput = function (eventType, event) {

	var that = this;

	if(eventType === "keydown") {

		this.keys[event.keyCode] = true;

		//VerboseLog.log("keydown");
		//VerboseLog.log(event.keyCode);
		//VerboseLog.log(this.keys);

		var controlKeyDown = this.keys[91];
		var shiftKeyDown = this.keys[16];

		// Control-shift-z: redo
		if (event.keyCode == 90 && controlKeyDown && shiftKeyDown) {
			this.actionHandler.redoAction();	
		}
		// Control-z: undo
		else if (event.keyCode == 90 && controlKeyDown) {
			this.actionHandler.undoAction();
		}
		// Control-s: save
		else if (event.keyCode == 83 && controlKeyDown) {
			event.preventDefault();
			this.clearKeys();
			this.saveProject();
		}
		// Control-o: open
		else if (event.keyCode == 79 && controlKeyDown) {
			event.preventDefault();
			this.clearKeys();
			$('#importButton').click();
		}

		// Control-a: Select all
		if (event.keyCode == 65 && controlKeyDown) {
			event.preventDefault();
			this.fabricCanvas.selectAll();
		}

		// Backspace: delete selected objects
		if (event.keyCode == 8 && document.activeElement.nodeName != 'TEXTAREA') {
			event.preventDefault();
			this.deleteSelectedObjects();	
		}

		// Tilde: log project state to canvas (for debugging)
		if (event.keyCode == 192) {
			console.log(this.project);
			console.log(this.fabricCanvas);
		}

	} else if(eventType === "keyup") {

		this.keys[event.keyCode] = false;

		//VerboseLog.log("keyup");
		//VerboseLog.log(event.keyCode);
		//VerboseLog.log(this.keys);

	}

}

WickEditor.prototype.handleCopyEvent = function (event) {
	if(!this.scriptingIDE.open) {
		this.syncProjectWithFabricCanvas();
		event.preventDefault();
		WickObjectUtils.copyWickObjectJSONToClipboard(event.clipboardData, this.fabricCanvas, this.currentObject);
	}
}

/****************************************
    Timeline pleayhead moving methods
****************************************/

// 
WickEditor.prototype.moveOutOfObject = function () {

	this.fabricCanvas.deselectAll();

	// Store changes made to current frame in the project
	this.syncProjectWithFabricCanvas();

	// Set the editor to be editing the parent object
	this.currentObject = this.currentObject.parentObject;

	// Load wickobjects in the frame we moved to into the canvas
	this.syncFabricCanvasWithProject();

	this.htmlGUIHandler.updateTimelineGUI(this.currentObject);

	this.fabricCanvas.repositionOriginCrosshair(
		this.project.resolution.x, 
		this.project.resolution.y,
		this.currentObject.left,
		this.currentObject.top
	);

}

// 
WickEditor.prototype.moveInsideObject = function (object) {

	this.fabricCanvas.deselectAll();

	// Store changes made to current frame in the project
	this.syncProjectWithFabricCanvas();

	// Set the editor to be editing this object at its first frame
	this.currentObject = object;
	this.currentObject.currentFrame = 0;

	// Load wickobjects in the frame we moved to into the canvas
	this.syncFabricCanvasWithProject();

	this.htmlGUIHandler.updateTimelineGUI(this.currentObject);

	this.fabricCanvas.repositionOriginCrosshair(
		this.project.resolution.x, 
		this.project.resolution.y,
		this.currentObject.left,
		this.currentObject.top
	);

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

WickEditor.prototype.addNewText = function (text) {

	var textWickObject = new WickObject();

	textWickObject.setDefaultPositioningValues();
	textWickObject.setDefaultFontValues(text);
	textWickObject.left = window.innerWidth/2;
	textWickObject.top = window.innerHeight/2;

	textWickObject.parentObject = this.currentObject;

	this.fabricCanvas.addWickObjectToCanvas(textWickObject);

	this.syncProjectWithFabricCanvas();
	this.syncFabricCanvasWithProject();

}

WickEditor.prototype.addNewHTMLSnippet = function () {

	var htmlSnippetWickObject = new WickObject();

	htmlSnippetWickObject.setDefaultPositioningValues();
	htmlSnippetWickObject.htmlData = '<iframe width="560" height="315" src="https://www.youtube.com/embed/AxZ6RG5UeiU" frameborder="0" allowfullscreen></iframe>';
	htmlSnippetWickObject.left = window.innerWidth/2;
	htmlSnippetWickObject.top = window.innerHeight/2;

	htmlSnippetWickObject.parentObject = this.currentObject;

	this.fabricCanvas.addWickObjectToCanvas(htmlSnippetWickObject);

	this.syncProjectWithFabricCanvas();
	this.syncFabricCanvasWithProject();

}

/***********************************
      Right click menu methods
***********************************/

WickEditor.prototype.convertSelectedObjectToSymbol = function () {

	this.syncProjectWithFabricCanvas();

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

			symbol.frames[0].wickObjects[i].left = selectedObject._objects[i].left;
			symbol.frames[0].wickObjects[i].top = selectedObject._objects[i].top;
		}

		symbol.fixSymbolPosition();

		var max = 0;
		while(selectedObject._objects.length > 0 && max < 100) {
			max++;
			console.error("Infinite loop is prob happening here");
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

	this.fabricCanvas.deselectAll();

}

WickEditor.prototype.deleteSelectedObjects = function () {
	this.actionHandler.doAction('delete', {
		obj:   this.fabricCanvas.getCanvas().getActiveObject(),
		group: this.fabricCanvas.getCanvas().getActiveGroup()
	});
}

WickEditor.prototype.editSelectedObject = function () {
	this.moveInsideObject(this.fabricCanvas.getActiveObject().wickObject);
}

WickEditor.prototype.editScriptsOfSelectedObject = function () {
	this.scriptingIDE.openScriptingGUI(this.fabricCanvas.getActiveObject());
}

WickEditor.prototype.finishEditingObject = function () {
	this.moveOutOfObject();
}

WickEditor.prototype.sendSelectedObjectToBack = function () {
	this.fabricCanvas.sendSelectedObjectToBack();
}

WickEditor.prototype.bringSelectedObjectToFront = function () {
	this.fabricCanvas.bringSelectedObjectToFront();
}

WickEditor.prototype.clearFrame = function () {
	console.error("Not yet implemented");
}

/*****************************
       Import content
*****************************/

WickEditor.prototype.importFilesPastedIntoEditor = function (event) {
	if(!this.scriptingIDE.open) { 
		event.preventDefault();

		var clipboardData = event.clipboardData;
		var items = clipboardData.items;

		for (i=0; i<items.length; i++) {

			var fileType = items[i].type;
			var file = clipboardData.getData(items[i].type);

			console.log("pasted filetype: " + fileType);

			if (fileType === 'image/png') {
				var blob = items[i].getAsFile();
				var URLObj = window.URL || window.webkitURL;
				var source = URLObj.createObjectURL(blob);
				this.importImageFile("File names for pasted images not set.", source);
			} else if (fileType == 'text/plain') {
				this.addNewText(file)
			} else if (fileType == 'text/wickobjectjson' ||
				       fileType == 'text/wickobjectarrayjson') {
				WickObjectUtils.pasteWickObjectJSONFromClipboardIntoCanvas(fileType, clipboardData, this.fabricCanvas, this.currentObject);
			}	
		}
	}
}

WickEditor.prototype.importFilesDroppedIntoEditor = function(files) {

	var that = this;

	// Retrieve uploaded files data
	for (var i = 0; i < files.length; i++) {
		var file = files[i];

		// Read file as data URL
		var dataURLReader = new FileReader();
		dataURLReader.onload = (function(theFile) { return function(e) {

			VerboseLog.log("readAsDataURL():");
			VerboseLog.log("Dropped file: " + theFile.name);
			VerboseLog.log("Dropped filetype: " + file.type);

			if (['image/png', 'image/jpeg', 'image/bmp'].indexOf(file.type) != -1) {
				that.importImageFile(theFile.name, e.target.result)
			} else if(['audio/mp3', 'audio/wav', 'audio/ogg'].indexOf(file.type) != -1) {
				that.importAudioFile(theFile.name, e.target.result);
			} else if(['application/json'].indexOf(file.type) != -1) {
				that.importProjectFile(file);
			}

		}; })(file);
		dataURLReader.readAsDataURL(file);
	}
}

WickEditor.prototype.importProjectFile = function (file) {
	var that = this;

	var reader = new FileReader();
	reader.onloadend = function(e) {
		that.loadProjectFromJSON(this.result);
	};
	reader.readAsText(file);
}

WickEditor.prototype.importImageFile = function (name, data) {

	var left = 0;
	var top = 0;
	if(this.currentObject.isRoot) {
		left = window.innerWidth/2;
		top = window.innerHeight/2;
	}

	var that = this;
	WickObjectUtils.createWickObjectFromImage(
		data, 
		left, 
		top, 
		this.currentObject, 
		function(o) { that.fabricCanvas.addWickObjectToCanvas(o); }
	);

}

WickEditor.prototype.importAudioFile = function (name, data) {

	var audioWickObject = new WickObject();

	audioWickObject.setDefaultPositioningValues();
	audioWickObject.audioData = data;
	audioWickObject.left = window.innerWidth/2;
	audioWickObject.top = window.innerHeight/2;

	audioWickObject.parentObject = this.currentObject;

	this.fabricCanvas.addWickObjectToCanvas(audioWickObject);

	this.syncProjectWithFabricCanvas();
	this.syncFabricCanvasWithProject();

}

WickEditor.prototype.importVectorFile = function (name, data) {

}

/**********************************
  Project Open/Save/Import/Export
**********************************/

WickEditor.prototype.syncProjectWithFabricCanvas = function () {
	this.currentObject.frames[this.currentObject.currentFrame].wickObjects = this.fabricCanvas.getWickObjectsInCanvas(this.project.resolution);
}

WickEditor.prototype.syncFabricCanvasWithProject = function () {
	this.fabricCanvas.storeObjectsIntoCanvas( this.currentObject.getCurrentFrame().wickObjects, this.project.resolution );
}

WickEditor.prototype.newProject = function () {

	if(confirm("Create a new project? All unsaved changes to the current project will be lost!")) {
		this.project = new WickProject();
		this.currentObject = this.project.rootObject;
		this.syncFabricCanvasWithProject();
		this.htmlGUIHandler.updateTimelineGUI(this.currentObject);
	}

}

WickEditor.prototype.saveProject = function () {
	WickFileUtils.saveProjectAsJSONFile(this.getProjectAsJSON());
}

WickEditor.prototype.openProject = function () {
	var that = this;
	WickFileUtils.readJSONFromFileChooser(
		document.getElementById("importButton"), 
		function(p) { that.loadProjectFromJSON(p) }
	);
}

WickEditor.prototype.exportProject = function () {
	WickFileUtils.saveProjectAsHTMLFile(this.getProjectAsJSON());
}

WickEditor.prototype.getProjectAsJSON = function () {
	// Store changes made to current frame in the project
	this.syncProjectWithFabricCanvas();

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

	// Reset bg color
	this.fabricCanvas.setBackgroundColor(this.project.backgroundColor);

	// Load wickobjects in the frame we moved to into the canvas
	this.syncFabricCanvasWithProject();

	this.htmlGUIHandler.updateTimelineGUI(this.currentObject);
	this.htmlGUIHandler.updatePropertiesGUI('project');
}

/*************************
      Builtin player
*************************/

WickEditor.prototype.runProject = function () {
	if(this.scriptingIDE.projectHasErrors) {
		if(!confirm("There are syntax errors in the project! Are you sure you want to run it?")) {
			return;
		}
	}
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
