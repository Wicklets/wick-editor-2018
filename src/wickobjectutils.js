 var WickObjectUtils = (function () {

	var wickUtils = { };

	// This is supposedly a nasty thing to do - think about possible alternatives for IE and stuff
	wickUtils.putWickObjectPrototypeBackOnObject = function (obj) {

		// Put the prototype back on this object
		obj.__proto__ = WickObject.prototype;

		// Recursively put the prototypes back on the children objects
		if(obj.isSymbol) {
			WickSharedUtils.forEachChildObject(obj, function(currObj) {
				wickUtils.putWickObjectPrototypeBackOnObject(currObj);
			});
		}
	}

	wickUtils.getWickObjectAsJSON = function (wickObject, currentObject) {
		// Remove parent object references 
		// (can't JSONify objects with circular references, player doesn't need them anyway)
		wickObject.removeParentObjectRefences();

		// Encode scripts to avoid JSON format problems
		WickSharedUtils.encodeText(wickObject);

		var JSONWickObject = JSON.stringify(wickObject);

		// Put prototypes back on object ('class methods'), they don't get JSONified on project export.
		wickUtils.putWickObjectPrototypeBackOnObject(wickObject);

		// Put parent object references back in all objects
		wickObject.parentObject = currentObject;
		wickObject.regenerateParentObjectReferences();

		// Decode scripts back to human-readble and eval()-able format
		WickSharedUtils.decodeText(wickObject);

		return JSONWickObject;
	}

	wickUtils.getWickObjectArrayAsJSON = function (wickObjects, currentObject, groupLeft, groupTop) {
		for(var i = 0; i < wickObjects.length; i++) {
			// Remove parent object references 
			// (can't JSONify objects with circular references, player doesn't need them anyway)
			wickObjects[i].removeParentObjectRefences();

			// Move object to group's relative position
			wickObjects[i].left += groupLeft;
			wickObjects[i].top += groupTop;

			// Encode scripts to avoid JSON format problems
			WickSharedUtils.encodeText(wickObjects[i]);
		}

		var JSONWickObjects = JSON.stringify(wickObjects);

		for(var i = 0; i < wickObjects.length; i++) {
			// Put prototypes back on object ('class methods'), they don't get JSONified on project export.
			wickUtils.putWickObjectPrototypeBackOnObject(wickObjects[i]);

			// Reposition object back into place
			wickObjects[i].left -= groupLeft;
			wickObjects[i].top -= groupTop;

			// Put parent object references back in all objects
			wickObjects[i].parentObject = currentObject;
			wickObjects[i].regenerateParentObjectReferences();

			// Decode scripts back to human-readble and eval()-able format
			WickSharedUtils.decodeText(wickObjects[i]);
		}

		return JSONWickObjects;
	}

	wickUtils.getWickObjectFromJSON = function (jsonString, currentObject) {
		// Parse JSON
		var newWickObject = JSON.parse(jsonString);

		// Put prototypes back on object ('class methods'), they don't get JSONified on project export.
		wickUtils.putWickObjectPrototypeBackOnObject(newWickObject);

		// Regenerate parent object references
		// These were removed earlier because JSON can't handle infinitely recursive objects (duh)
		newWickObject.parentObject = currentObject;
		newWickObject.regenerateParentObjectReferences();

		// Decode scripts back to human-readble and eval()-able format
		WickSharedUtils.decodeText(newWickObject);

		return newWickObject;
	}

	wickUtils.getWickObjectArrayFromJSON = function (jsonString, currentObject) {
		// Parse JSON
		var newWickObjects = JSON.parse(jsonString);

		for(var i = 0; i < newWickObjects.length; i++) {
			// Put prototypes back on object ('class methods'), they don't get JSONified on project export.
			wickUtils.putWickObjectPrototypeBackOnObject(newWickObjects[i]);

			// Regenerate parent object references
			// These were removed earlier because JSON can't handle infinitely recursive objects (duh)
			newWickObjects[i].parentObject = currentObject;
			newWickObjects[i].regenerateParentObjectReferences();

			// Decode scripts back to human-readble and eval()-able format
			WickSharedUtils.decodeText(newWickObjects[i]);
		}

		return newWickObjects;
	}

	wickUtils.createWickObjectFromImage = function (imgSrc, left, top, parentObject, callback) {
		var fileImage = new Image();
		fileImage.src = imgSrc;

		fileImage.onload = function() {

			var obj = new WickObject();

			obj.setDefaultPositioningValues();
			obj.width = fileImage.width / window.devicePixelRatio;
			obj.height = fileImage.height / window.devicePixelRatio;
			obj.left = left;
			obj.top = top;

			obj.parentObject = parentObject;
			obj.imageData = fileImage.src;

			callback(obj);
		}
	}

	wickUtils.copyWickObjectJSONToClipboard = function (clipboardData, fabricCanvas, currentObject) {
		var obj = fabricCanvas.getCanvas().getActiveObject() 
		var group = fabricCanvas.getCanvas().getActiveGroup();
		
		if(group) {
			var groupObjs = [];
			var items = group._objects;
			//group._restoreObjectsState();
			for(var i = 0; i < items.length; i++) {
				groupObjs.push(items[i].wickObject);
			}
			var groupObjsJSON = WickObjectUtils.getWickObjectArrayAsJSON(groupObjs, currentObject, group.left, group.top);
			clipboardData.setData('text/wickobjectarrayjson', groupObjsJSON);
		} else {
			var selectedWickObject = obj.wickObject;
			var objJSON = WickObjectUtils.getWickObjectAsJSON(selectedWickObject, currentObject);
			clipboardData.setData('text/wickobjectjson', objJSON);
		}
	}

	wickUtils.pasteWickObjectJSONFromClipboardIntoCanvas = function (fileType, clipboardData, fabricCanvas, currentObject) {

		if(fileType === 'text/wickobjectjson') {

			// Get JSON from clipboard, create wick object from it
			var wickObjectJSON = clipboardData.getData('text/wickobjectjson');
			var wickObject = WickObjectUtils.getWickObjectFromJSON(wickObjectJSON, currentObject);

			wickObject.top += 55;
			wickObject.left += 55; // just to position it a bit over (temporary)

			fabricCanvas.addWickObjectToCanvas(wickObject);

		} else if(fileType === 'text/wickobjectarrayjson') {

			var wickObjectJSON = clipboardData.getData('text/wickobjectarrayjson');

			var wickObjects = WickObjectUtils.getWickObjectArrayFromJSON(wickObjectJSON, currentObject);
			for(var i = 0; i < wickObjects.length; i++) {
				console.log(wickObjects)
				fabricCanvas.addWickObjectToCanvas(wickObjects[i]);
			}

		}

	}

	return wickUtils;

})();