var FabricCanvas = function (wickEditor) {

	var that = this;

	// When a fabric object is created from a wick object (and vice versa), 
	// these properties must be set on the new object
	this.sharedFabricWickObjectProperties = [
		"left",
		"top",
		"width",
		"height",
		"scaleX",
		"scaleY",
		"angle",
		"flipX",
		"flipY",
		"opacity"
	];

// Setup fabric canvas

	this.canvas = new fabric.CanvasEx('editorCanvas');
	this.canvas.selectionColor = 'rgba(0,0,5,0.1)';
	this.canvas.selectionBorderColor = 'grey';
	this.canvas.selectionLineWidth = 2;
	this.canvas.backgroundColor = "#EEE";

	this.context = this.canvas.getContext('2d');

// Setup drawing tool options GUI

	this.lineWidthEl = document.getElementById('lineWidth');
	this.lineColorEl = document.getElementById('lineColor');

	this.lineWidthEl.onchange = function() {
		that.canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
		//this.previousSibling.innerHTML = this.value;
	};

	this.lineColorEl.onchange = function() {
		that.canvas.freeDrawingBrush.color = this.value;
	};

// Fabric object that holds the paper canvas (isn't set up yet - editor handles that)

	this.paperCanvas = undefined;

// White box that shows resolution/objects that will be on screen when project is exported

	this.frameInside = new fabric.Rect({
		fill: '#FFF',
	});

	this.frameInside.hasControls = false;
	this.frameInside.selectable = false;
	this.frameInside.evented = false;

	this.canvas.add(this.frameInside)

// Crosshair that shows where (0,0) of the current object is

	fabric.Image.fromURL('resources/origin.png', function(obj) {
		that.originCrosshair = obj;

		that.originCrosshair.left = (window.innerWidth -wickEditor.project.resolution.x)/2- that.originCrosshair.width/2;
		that.originCrosshair.top  = (window.innerHeight-wickEditor.project.resolution.y)/2- that.originCrosshair.height/2;

		that.originCrosshair.hasControls = false;
		that.originCrosshair.selectable = false;
		that.originCrosshair.evented = false;

		that.canvas.add(that.originCrosshair);
	});

// Text and fade that alerts the user to drop files into editor
// Shows up when a file is dragged over the editor

	// Fade
	this.dragToImportFileFade = new fabric.Rect({
		fill: '#000',
		opacity: 0
	});

	this.dragToImportFileFade.hasControls = false;
	this.dragToImportFileFade.selectable = false;
	this.dragToImportFileFade.evented = false;

	this.canvas.add(this.dragToImportFileFade);

	// Text
	this.dragToImportFileText = new fabric.Text('Drop file to import', {
		fill: '#000',
		fontFamily: 'arial',
		opacity: 0
	});

	this.dragToImportFileText.hasControls = false;
	this.dragToImportFileText.selectable = false;
	this.dragToImportFileText.evented = false;

	this.canvas.add(this.dragToImportFileText);

	var that = this;
	$("#editorCanvasContainer").on('dragover', function(e) {
		that.showDragToImportFileAlert();
		return false;
	});
	$("#editorCanvasContainer").on('dragleave', function(e) {
		that.hideDragToImportFileAlert();
		return false;
	});
	$("#editorCanvasContainer").on('drop', function(e) {
		that.hideDragToImportFileAlert();
		return false;
	});

// Events

	var that = this;
	var canvas = this.canvas;

	canvas.on('mouse:down', function(e) {
		if(e.e.button == 2) {

			if (e.target && e.target.wickObject) {
				// Programatically set active object of fabric canvas
				var id = canvas.getObjects().indexOf(e.target);
				canvas.setActiveObject(canvas.item(id));
			}

			if(!e.target) {
				// Didn't right click an object, deselect everything
				canvas.deactivateAll().renderAll();
			}
			wickEditor.htmlGUIHandler.openRightClickMenu();

		} else {
			wickEditor.htmlGUIHandler.closeRightClickMenu();
		}
	});

	canvas.on('object:added', function(e) {
		if(e.target.type === "path") {
			var path = e.target;
			that.convertPathToWickObjectAndAddToCanvas(path, wickEditor.currentObject);
			canvas.remove(path);
		}
	});

	canvas.on('object:selected', function (e) {

		var newSelectedObject = canvas.getActiveObject();

		wickEditor.scriptingIDE.reloadScriptingGUI(newSelectedObject);

		if(newSelectedObject) {
			if(newSelectedObject.wickObject.fontData) {
				wickEditor.htmlGUIHandler.updatePropertiesGUI('text');
			} else if (newSelectedObject.wickObject.htmlData) {
				wickEditor.htmlGUIHandler.updatePropertiesGUI('htmlSnippet');
			} else {
				wickEditor.htmlGUIHandler.updatePropertiesGUI('symbol');
			}
		} else {
			wickEditor.htmlGUIHandler.updatePropertiesGUI('project');
		}
	});

	canvas.on('selection:cleared', function (e) {
		wickEditor.scriptingIDE.closeScriptingGUI();
		wickEditor.htmlGUIHandler.updatePropertiesGUI('project');
	});

}

FabricCanvas.prototype.clearCanvas = function () {

	var canvas = this.canvas;

	// Clear canvas except for wick GUI elements
	this.canvas.forEachObject(function(fabricObj) {
		if(fabricObj.wickObject) {
			canvas.remove(fabricObj);
		} 
	});

}

FabricCanvas.prototype.selectAll = function () {

	var objs = [];
	this.canvas.getObjects().map(function(o) {
		if(o.wickObject) {
			o.set('active', true);
			return objs.push(o);
		}
	});

	var group = new fabric.Group(objs, {
		originX: 'left', 
		originY: 'top'
	});

	this.canvas._activeObject = null;

	this.canvas.setActiveGroup(group.setCoords()).renderAll();

}

FabricCanvas.prototype.deselectAll = function () {

	wickEditor.htmlGUIHandler.updatePropertiesGUI('project');

	var activeGroup = this.canvas.getActiveGroup();
	if(activeGroup) {
		activeGroup.removeWithUpdate(activeGroup);
		this.canvas.renderAll();
	}

	this.canvas.deactivateAll().renderAll();

}

FabricCanvas.prototype.setBackgroundColor = function (color) {
	this.frameInside.fill = color;
	this.canvas.renderAll();
}

FabricCanvas.prototype.getCanvas = function() {
	return this.canvas;
}

FabricCanvas.prototype.getActiveObject = function () {
	return this.canvas.getActiveObject();
}

FabricCanvas.prototype.sendSelectedObjectToBack = function () {
	console.error("Don't forget to handle muliple objects here!");

	this.getActiveObject().sendToBack();
	this.frameInside.sendToBack();
}

FabricCanvas.prototype.bringSelectedObjectToFront = function () {
	console.error("Don't forget to handle muliple objects here!");
	
	this.getActiveObject().bringToFront();
}

FabricCanvas.prototype.resize = function (projectWidth, projectHeight) {

	// Reposition all fabric objects to use new wick canvas origin

	var oldWidth = this.canvas.getWidth();
	var oldHeight = this.canvas.getHeight();

	this.canvas.setWidth ( window.innerWidth  );
	this.canvas.setHeight( window.innerHeight );

	var diffWidth = this.canvas.getWidth() - oldWidth;
	var diffHeight = this.canvas.getHeight() - oldHeight;

	this.canvas.forEachObject(function(fabricObj) {
		fabricObj.left += diffWidth/2;
		fabricObj.top += diffHeight/2;
	});

	// Re-center the import file alert text and fade

	this.dragToImportFileFade.width = window.innerWidth;
	this.dragToImportFileFade.height = window.innerWidth;
	this.dragToImportFileFade.left = 0;
	this.dragToImportFileFade.top  = 0;
	this.dragToImportFileFade.setCoords();

	this.dragToImportFileText.left = window.innerWidth/2-this.dragToImportFileText.width/2;
	this.dragToImportFileText.top  = window.innerHeight/2-this.dragToImportFileText.height/2;
	this.dragToImportFileText.setCoords();

	// Re-center the white frame box

	this.frameInside.width  = projectWidth;
	this.frameInside.height = projectHeight;
	this.frameInside.left = (window.innerWidth -projectWidth) /2;
	this.frameInside.top  = (window.innerHeight-projectHeight)/2;
	this.frameInside.setCoords();

	this.canvas.renderAll();
	this.canvas.calcOffset();

}

FabricCanvas.prototype.repositionOriginCrosshair = function (projectWidth, projectHeight, currentObjectLeft, currentObjectTop) {
	// Move the origin crosshair to the current origin
	if(this.originCrosshair) { // window resize can happen before originCrosshair's image is loaded
		this.originCrosshair.left = (window.innerWidth -projectWidth) /2 - this.originCrosshair.width/2;
		this.originCrosshair.top  = (window.innerHeight-projectHeight)/2 - this.originCrosshair.height/2;
		this.originCrosshair.left += currentObjectLeft;
		this.originCrosshair.top += currentObjectTop;
		this.canvas.renderAll();
	}
}

/***************************************
	Drawing mode
****************************************/

FabricCanvas.prototype.startDrawingMode = function() {
	this.canvas.isDrawingMode = true;

	document.getElementById('toolOptions').style.display = 'block';
	this.canvas.freeDrawingBrush = new fabric['PencilBrush'](this.canvas);
	this.canvas.freeDrawingBrush.color = this.lineColorEl.value;
	this.canvas.freeDrawingBrush.width = parseInt(this.lineWidthEl.value, 10) || 1;
}

FabricCanvas.prototype.stopDrawingMode = function() {
	this.canvas.isDrawingMode = false;

	document.getElementById('toolOptions').style.display = 'none';
}

/***************************************
	Non-Wick Object fabric objects
****************************************/

FabricCanvas.prototype.reloadPaperCanvas = function(paperCanvas) {

	var that = this;

	// Get rid of the old paper canvas object if it exists

	that.canvas.remove(that.paperCanvas)

	// Add a new paper canvas

	var paperCanvasDataURL = paperCanvas.toDataURL();

	fabric.Image.fromURL(paperCanvasDataURL, function(oImg) {
		oImg.hasControls = false;
		oImg.selectable = false;
		oImg.evented = false;
		that.paperCanvas = oImg;
		that.canvas.add(oImg);
	});

}

FabricCanvas.prototype.showDragToImportFileAlert = function() {

	this.canvas.bringToFront(this.dragToImportFileFade);
	this.canvas.bringToFront(this.dragToImportFileText);

	this.dragToImportFileFade.opacity = 0.3;
	this.dragToImportFileText.opacity = 1.0;
	this.canvas.renderAll();

}

FabricCanvas.prototype.hideDragToImportFileAlert = function() {

	this.dragToImportFileFade.opacity = 0;
	this.dragToImportFileText.opacity = 0;
	this.canvas.renderAll();

}

/*******************************************
	Wick Objects -> Fabric Canvas
********************************************/

FabricCanvas.prototype.makeFabricObjectFromWickObject = function (wickObject, callback) {

	var that = this;

	if(wickObject.isSymbol) {
		
		var makeGroupOutOfFabricObjects = function (fabricObjects) {
			// Create a group out of all objects on the first frame of this dynamic object
			var group = new fabric.Group();

			for(var i = 0; i < fabricObjects.length; i++) {
				group.addWithUpdate(fabricObjects[i]);
			}

			// Add that group to the fabric canvas
			group.wickObject = wickObject;
			group.isGroup = true;
			return group;
		}

		// Create a list of every object in the first frame of the symbol
		var firstFrameObjects = wickObject.frames[0].wickObjects;
		var firstFrameFabricObjects = [];

		for(var i = 0; i < firstFrameObjects.length; i++) {

			this.makeFabricObjectFromWickObject(firstFrameObjects[i], function(fabricObject) {
				//firstFrameFabricObjects[i] = fabricObject; //scope issue, need to use a closure here
				firstFrameFabricObjects.push(fabricObject);

				// List fully populated
				if(firstFrameFabricObjects.length == firstFrameObjects.length) {
					var group = makeGroupOutOfFabricObjects(firstFrameFabricObjects);
					group.opacity = wickObject.opacity;
					that.canvas.add(group);
				}
			})

		}

	} else {

		var setWickObjectPropertiesOnFabricObject = function(fabricObj, wickObj) {
			// Set shared wick/fabric positioning properties
			for(var i = 0; i < sharedFabricWickObjectProperties.length; i++) {
				var prop = sharedFabricWickObjectProperties[i];
				fabricObj[prop] = wickObj[prop];
			}

			// Position the fabric object relative to it's parents.
			//var relativePosition = that.getRelativePosition(wickObject);
			var relativePosition = wickObj.getRelativePosition();
			fabricObj.top = relativePosition.top;
			fabricObj.left = relativePosition.left;

			// Set the fabric.js option to only select if the pixel you're over isn't transparent
			fabricObj.perPixelTargetFind = true;
			fabricObj.targetFindTolerance = 4;

			// Store a reference to the wick object inside the fabric object
			// to use when we put this object back into the project.
			fabricObj.wickObject = wickObj;
		}

		var sharedFabricWickObjectProperties = this.sharedFabricWickObjectProperties;

		if(wickObject.imageData) {

			fabric.Image.fromURL(wickObject.imageData, function(newFabricImage) {
				setWickObjectPropertiesOnFabricObject(newFabricImage, wickObject);

				callback(newFabricImage);
			});

		} else if(wickObject.fontData) {

			// Set font properties
			var newFabricText = new fabric.IText(wickObject.fontData.text, { 
				fontFamily: wickObject.fontData.fontFamily,
				fontSize: wickObject.fontData.fontSize,
				fill: wickObject.fontData.fill,
				text: wickObject.fontData.text
			});

			setWickObjectPropertiesOnFabricObject(newFabricText, wickObject);

			callback(newFabricText);

		} else if(wickObject.htmlData) {

			fabric.Image.fromURL('resources/htmlsnippet.png', function(snippet) {

				wickObject.width = snippet.width / window.devicePixelRatio;
				wickObject.height = snippet.height / window.devicePixelRatio;

				setWickObjectPropertiesOnFabricObject(snippet, wickObject);

				callback(snippet);
			});

		}

	}

}

FabricCanvas.prototype.storeObjectsIntoCanvas = function (wickObjects, projectResolution) {

	var canvas = this.canvas;

	this.clearCanvas();

	// Add the requested wick objects the canvas
	for(var i = 0; i < wickObjects.length; i++) {
		// Reposition the wickobject so that 0,0 is fabrics origin, not the wick frames origin
		wickObjects[i].left += (window.innerWidth - projectResolution.x) / 2;
		wickObjects[i].top += (window.innerHeight - projectResolution.y) / 2;

		this.addWickObjectToCanvas(wickObjects[i]);
	}

}

FabricCanvas.prototype.addWickObjectToCanvas = function (wickObject) {

	var canvas = this.canvas;
	
	this.makeFabricObjectFromWickObject(wickObject, function(fabricObject) {
		canvas.add(fabricObject);
	});

}

FabricCanvas.prototype.convertPathToWickObjectAndAddToCanvas = function (fabricPath, currentObject) {
	var that = this;

	fabricPath.cloneAsImage(function(clone) {
		var imgSrc = clone._element.currentSrc || clone._element.src;

		var left = fabricPath.left - clone.width/2/window.devicePixelRatio;
		var top = fabricPath.top - clone.height/2/window.devicePixelRatio;

		var parentPos = wickEditor.currentObject.getRelativePosition();
		left -= parentPos.left;
		top -= parentPos.top;

		WickObjectUtils.createWickObjectFromImage(
			imgSrc, 
			left, 
			top, 
			currentObject, 
			function(obj) { 
				that.addWickObjectToCanvas(obj) 
			}
		);
	});
}

/*******************************************
	Fabric Canvas -> Wick Objects
********************************************/

FabricCanvas.prototype.getWickObjectsInCanvas = function (projectResolution) {

	var sharedFabricWickObjectProperties = this.sharedFabricWickObjectProperties;

	var wickObjects = [];

	this.canvas.forEachObject(function(fabricObj) {

		// Take wick object out of fabric object
		var wickObject = fabricObj.wickObject;

		// Don't create a wick object if the fabric object isn't holding one
		// (i.e. if it's the white frame or another gui element inside the fabric canvas)
		if(wickObject) {
			// Set fabric properties on wick object
			for(var i = 0; i < sharedFabricWickObjectProperties.length; i++) {
				var prop = sharedFabricWickObjectProperties[i];
				wickObject[prop] = fabricObj[prop];
			}

			if(wickObject.fontData) {
				wickObject.fontData.text = fabricObj.text;
				wickObject.fontData.fill = fabricObj.fill;
				wickObject.fontData.fontSize = fabricObj.fontSize;
				wickObject.fontData.fontFamily = fabricObj.fontFamily;
			}

			if(wickObject.parentObject) {
				var parentsPositionTotal = wickObject.parentObject.getRelativePosition();
				wickObject.left -= parentsPositionTotal.left;
				wickObject.top -= parentsPositionTotal.top;

				wickObject.fixSymbolPosition();
			}

			// Reposition the wickobject so that 0,0 is the canvases origin, not fabric's origin.
			wickObject.left -= (window.innerWidth - projectResolution.x) / 2;
			wickObject.top -= (window.innerHeight - projectResolution.y) / 2;

			wickObjects.unshift(wickObject);
		}

	});

	return wickObjects;

}