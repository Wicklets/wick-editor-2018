var FabricCanvas = function () {

	// When a fabric object is created from a wick object (and vice versa), 
	// these properties must be set on the new object
	this.sharedFabricWickObjectProperties = [
		"left",
		"top",
		"scaleX",
		"scaleY",
		"angle",
		"flipX",
		"flipY"
	];

// Setup fabric canvas

	this.canvas = new fabric.Canvas('editorCanvas');
	this.canvas.selectionColor = 'rgba(0,0,5,0.1)';
	this.canvas.selectionBorderColor = 'grey';
	this.canvas.selectionLineWidth = 2;
	this.canvas.backgroundColor = "#EEE"

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

	// When a path is done being drawn, create a wick object out of it.
	// This is to get around the player currently not supporting paths.
	//
	// Later on, we will rasterize the path drawn by fabric, and vectorize it using potrace.
	// The vectors can then be edited with paper.js.
	//
	this.canvas.on('object:added', function(e) {
		/*var activeObject = e.target;
		console.log(activeObject.get('left'), activeObject.get('top'));*/
		if(e.target.type === "path") {
			console.log(e.target)

			e.target.cloneAsImage(function(clone) {
				// Create a new wick object with that data
				var obj = new WickObject();
				//obj.objectName = theFile.name;
				obj.dataURL = clone._element.currentSrc;
				obj.left = (window.innerWidth/2);
				obj.top = (window.innerHeight/2);
				obj.scaleX = 1;
				obj.scaleY = 1;
				obj.angle  = 0;
				obj.flipX  = false;
				obj.flipY  = false;
				//obj.parentObject = currentObject;

				// Put that wickobject in the fabric canvas
				that.addWickObjectToCanvas(obj);
			});

			that.canvas.remove(e.target);
		}
	});

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
		opacity: 0
	});
	this.dragToImportFileText.wickCanvasName = "dragToImportFileText";

	this.dragToImportFileText.hasControls = false;
	this.dragToImportFileText.selectable = false;
	this.dragToImportFileText.evented = false;

	this.canvas.add(this.dragToImportFileText);

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

FabricCanvas.prototype.getActiveObject = function () {

	return this.canvas.getActiveObject();

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

	this.dragToImportFileText.left = window.innerWidth/2;
	this.dragToImportFileText.top  = window.innerHeight/2;
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

	var canvas = this.canvas;

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
			group.top = wickObject.top;
			group.left = wickObject.left;
			canvas.add(group);
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

		fabric.Image.fromURL(wickObject.dataURL, function(oImg) {
			for(var i = 0; i < sharedFabricWickObjectProperties.length; i++) {
				var prop = sharedFabricWickObjectProperties[i];
				oImg[prop] = wickObject[prop];
			}

			oImg.wickObject = wickObject;

			callback(oImg);
		});

	}

}

FabricCanvas.prototype.addWickObjectToCanvas = function (wickObject) {

	var canvas = this.canvas;

	this.makeFabricObjectFromWickObject(wickObject, function(fabricObject) {
		canvas.add(fabricObject);
	});

}

FabricCanvas.prototype.storeObjectsIntoCanvas = function (wickObjects) {

	var canvas = this.canvas;

	this.clearCanvas();

	// Add the requested wick objects the canvas
	for(var i = 0; i < wickObjects.length; i++) {
		this.addWickObjectToCanvas(wickObjects[i]);
	}

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

			wickObjects.push(wickObject);
		}

	});

	return wickObjects;

}
