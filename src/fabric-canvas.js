var FabricCanvas = function () {

// Setup fabric canvas

	this.canvas = new fabric.Canvas('editorCanvas');
	this.canvas.selectionColor = 'rgba(0,0,5,0.1)';
	this.canvas.selectionBorderColor = 'grey';
	this.canvas.selectionLineWidth = 2;
	this.canvas.backgroundColor = "#EEE"

	this.context = this.canvas.getContext('2d');

// White box that shows resolution/objects that will be on screen when project is exported

	var frameInside = new fabric.Rect({
		fill: '#FFF',
	});
	frameInside.wickCanvasName = "frame";

	frameInside.hasControls = false;
	frameInside.selectable = false;
	frameInside.evented = false;

	this.canvas.add(frameInside)

}

FabricCanvas.prototype.resize = function (projectWidth, projectHeight) {

	this.canvas.setWidth ( window.innerWidth  );
	this.canvas.setHeight( window.innerHeight );

	// Re-center the white frame box
	this.canvas.forEachObject(function(obj){
		if(obj.wickCanvasName == "frame") {
			obj.width  = projectWidth;
			obj.height = projectHeight;
			obj.left = (window.innerWidth -projectWidth) /2;
			obj.top  = (window.innerHeight-projectHeight)/2;
			obj.setCoords();
		}
	});

	this.canvas.renderAll();
	this.canvas.calcOffset();

}

FabricCanvas.prototype.getActiveObject = function () {

	return this.canvas.getActiveObject();

}

FabricCanvas.prototype.addWickObjectToCanvas = function (wickObject) {

	var canvas = this.canvas;

	var dataURL;
	if(wickObject.isSymbol) {
		dataURL = wickObject.getAllStaticObjectDataURLsRecursively();
	} else {
		dataURL = wickObject.dataURL;
	}

	// Add new object to fabric canvas
	fabric.Image.fromURL(dataURL, function(oImg) {
		oImg.left   = wickObject.left;
		oImg.top    = wickObject.top;
		oImg.scaleX = wickObject.scaleX;
		oImg.scaleY = wickObject.scaleY;
		oImg.angle  = wickObject.angle;
		oImg.flipX  = wickObject.flipX;
		oImg.flipY  = wickObject.flipY;

		oImg.wickObject = wickObject;//JSON.parse(JSON.stringify(wickObject)); // Copy hack

		canvas.add(oImg);
	});

}

FabricCanvas.prototype.getWickObjectsInCanvas = function () {

	var wickObjects = [];

	this.canvas.forEachObject(function(fabricObj) {

		// Take wick object out of fabric object
		var wickObject = fabricObj.wickObject;

		if(wickObject) {
			// Set fabric properties on wick object
			wickObject.left   = fabricObj.left;
			wickObject.top    = fabricObj.top;
			wickObject.scaleX = fabricObj.scaleX;
			wickObject.scaleY = fabricObj.scaleY;
			wickObject.angle  = fabricObj.angle;
			wickObject.flipX  = fabricObj.flipX;
			wickObject.flipY  = fabricObj.flipY;

			wickObjects.push(wickObject);
		}

	});

	return wickObjects;

}

FabricCanvas.prototype.storeObjectsIntoCanvas = function (wickObjects) {

	// Clear canvas except for wick GUI elements
	this.canvas.clear();

	for(var i = 0; i < wickObjects.length; i++) {
		this.addWickObjectToCanvas(wickObjects[i]);
	}

}
