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

FabricCanvas.prototype.clearCanvas = function () {

	var canvas = this.canvas;

	// Clear canvas except for wick GUI elements
	this.canvas.forEachObject(function(fabricObj) {
		if(!fabricObj.wickCanvasName) {
			//fabricObj.remove();
			canvas.remove(fabricObj)
		} 
	});

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
			canvas.add(group);
		}

		var firstFrameObjects = wickObject.frames[0].wickObjects;
		var firstFrameFabricObjects = [];
		for(var i = 0; i < firstFrameObjects.length; i++) {
			this.makeFabricObjectFromWickObject(firstFrameObjects[i], function(fabricObject) {
				//firstFrameFabricObjects[i] = fabricObject; //scope issue
				firstFrameFabricObjects.push(fabricObject);
				if(firstFrameFabricObjects.length == firstFrameObjects.length) {
					makeGroupOutOfFabricObjects(firstFrameFabricObjects);
				}
			})
		}

	} else {

		fabric.Image.fromURL(wickObject.dataURL, function(oImg) {
			oImg.left   = wickObject.left;
			oImg.top    = wickObject.top;
			oImg.scaleX = wickObject.scaleX;
			oImg.scaleY = wickObject.scaleY;
			oImg.angle  = wickObject.angle;
			oImg.flipX  = wickObject.flipX;
			oImg.flipY  = wickObject.flipY;

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
