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
		WickSharedUtils.encodeScripts(wickObject);

		var JSONWickObject = JSON.stringify(wickObject);

		// Put prototypes back on object ('class methods'), they don't get JSONified on project export.
		wickUtils.putWickObjectPrototypeBackOnObject(wickObject);

		// Put parent object references back in all objects
		wickObject.parentObject = currentObject;
		wickObject.regenerateParentObjectReferences();

		// Decode scripts back to human-readble and eval()-able format
		WickSharedUtils.decodeScripts(wickObject);

		return JSONWickObject;
	}

	wickUtils.getWickObjectFromJSON = function (jsonString, currentObject) {
		// Replace current project with project in JSON
		var newWickObject = JSON.parse(jsonString);

		// Put prototypes back on object ('class methods'), they don't get JSONified on project export.
		wickUtils.putWickObjectPrototypeBackOnObject(newWickObject);

		// Regenerate parent object references
		// These were removed earlier because JSON can't handle infinitely recursive objects (duh)
		newWickObject.parentObject = currentObject;
		newWickObject.regenerateParentObjectReferences();

		// Decode scripts back to human-readble and eval()-able format
		WickSharedUtils.decodeScripts(newWickObject);

		return newWickObject;
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

	return wickUtils;

})();