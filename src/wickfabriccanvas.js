var FabricCanvas = function (wickEditor) {

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
		"flipY"
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

	var that = this;

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
	this.frameInside.wickCanvasName = "frameInside";

	this.frameInside.hasControls = false;
	this.frameInside.selectable = false;
	this.frameInside.evented = false;

	this.canvas.add(this.frameInside)

// Text and fade that alerts the user to drop files into editor
// Shows up when a file is dragged over the editor

	// Fade
	this.dragToImportFileFade = new fabric.Rect({
		fill: '#000',
		opacity: 0
	});
	this.dragToImportFileFade.wickCanvasName = "dragToImportFileFade";

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
	this.dragToImportFileText.wickCanvasName = "dragToImportFileText";

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
			wickEditor.openRightClickMenu();

		} else {
			wickEditor.closeRightClickMenu();
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
				wickEditor.updatePropertiesGUI('text');
			} else {
				wickEditor.updatePropertiesGUI('symbol');
			}
		} else {
			wickEditor.updatePropertiesGUI('project');
		}
	});

	canvas.on('selection:cleared', function (e) {
		wickEditor.scriptingIDE.closeScriptingGUI();
		wickEditor.updatePropertiesGUI('project');
	});

}

FabricCanvas.prototype.clearCanvas = function () {

	var canvas = this.canvas;

	// Clear canvas except for wick GUI elements
	this.canvas.forEachObject(function(fabricObj) {
		if(!fabricObj.wickCanvasName) {
			canvas.remove(fabricObj);
		} 
	});

}

FabricCanvas.prototype.getCanvas = function() {
	return this.canvas;
}

FabricCanvas.prototype.getActiveObject = function () {
	return this.canvas.getActiveObject();
}

FabricCanvas.prototype.sendSelectedObjectToBack = function () {
	this.getActiveObject().sendToBack();
	this.frameInside.sendToBack();
}

FabricCanvas.prototype.bringSelectedObjectToFront = function () {
	this.getActiveObject().bringToFront();
}

FabricCanvas.prototype.selectAll = function () {

	var objs = [];
	this.canvas.getObjects().map(function(o) {
		if(o.wickObject) {
			return objs.push(o);
		}
	});

	var group = new fabric.Group(objs, {
		originX: 'center', 
		originY: 'center'
	});

	this.canvas._activeObject = null;

	this.canvas.setActiveGroup(group.setCoords()).renderAll();

}

FabricCanvas.prototype.resize = function (projectWidth, projectHeight) {

	this.canvas.setWidth ( window.innerWidth  );
	this.canvas.setHeight( window.innerHeight );

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

	this.canvas.forEachObject(function(fabricObj) {
		if(fabricObj.wickCanvasName === "paperCanvas") {
			that.canvas.remove(fabricObj);
		} 
	});

	// Add a new paper canvas

	var paperCanvasDataURL = paperCanvas.toDataURL();

	fabric.Image.fromURL(paperCanvasDataURL, function(oImg) {
		oImg.wickCanvasName = "paperCanvas";
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
	Fabric Canvas <-> Wick Project Utils 
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
			that.canvas.add(group);
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
					makeGroupOutOfFabricObjects(firstFrameFabricObjects);
				}
			})

		}

	} else {

		var sharedFabricWickObjectProperties = this.sharedFabricWickObjectProperties;

		if(wickObject.imageData) {

			fabric.Image.fromURL(wickObject.imageData, function(newFabricImage) {
				// Set shared wick/fabric positioning properties
				for(var i = 0; i < sharedFabricWickObjectProperties.length; i++) {
					var prop = sharedFabricWickObjectProperties[i];
					newFabricImage[prop] = wickObject[prop];
				}

				// Position the fabric object relative to it's parents.
				//var relativePosition = that.getRelativePosition(wickObject);
				var relativePosition = wickObject.getRelativePosition();
				newFabricImage.top = relativePosition.top;
				newFabricImage.left = relativePosition.left;

				// Set the fabric.js option to only select if the pixel you're over isn't transparent
				newFabricImage.perPixelTargetFind = true;
				newFabricImage.targetFindTolerance = 4;

				// Store a reference to the wick object inside the fabric object
				// to use when we put this object back into the project.
				newFabricImage.wickObject = wickObject;

				callback(newFabricImage);
			});

		} else if(wickObject.fontData) {

			// Set font properties
			var newFabricText = new fabric.IText(wickObject.fontData.text, { 
				fontFamily: wickObject.fontData.fontFamily,
				text: wickObject.fontData.text
			});

			// Set shared wick/fabric positioning properties
			for(var i = 0; i < sharedFabricWickObjectProperties.length; i++) {
				var prop = sharedFabricWickObjectProperties[i];
				newFabricText[prop] = wickObject[prop];
			}

			// Position the fabric object relative to it's parents.
			//var relativePosition = that.getRelativePosition(wickObject);
			var relativePosition = wickObject.getRelativePosition();
			newFabricText.top = relativePosition.top;
			newFabricText.left = relativePosition.left;

			// Set the fabric.js option to only select if the pixel you're over isn't transparent
			newFabricText.perPixelTargetFind = true;
			newFabricText.targetFindTolerance = 4;

			// Store a reference to the wick object inside the fabric object
			// to use when we put this object back into the project.
			newFabricText.wickObject = wickObject;

			callback(newFabricText);

		}

	}

}

FabricCanvas.prototype.storeObjectsIntoCanvas = function (wickObjects) {

	var canvas = this.canvas;

	this.clearCanvas();

	// Add the requested wick objects the canvas
	for(var i = 0; i < wickObjects.length; i++) {
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
		WickObjectUtils.createWickObjectFromImage(
			imgSrc, 
			left, 
			top, 
			currentObject, 
			function(obj) { that.addWickObjectToCanvas(obj) }
		);
	});
}

FabricCanvas.prototype.getWickObjectsInCanvas = function () {

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
				wickObject.fontData.fontFamily = fabricObj.fontFamily;
			}

			if(wickObject.parentObject) {
				var parentsPositionTotal = wickObject.parentObject.getRelativePosition();
				wickObject.top -= parentsPositionTotal.top;
				wickObject.left -= parentsPositionTotal.left;
			}

			wickObjects.unshift(wickObject);
		}

	});

	return wickObjects;

}
