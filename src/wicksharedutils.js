/* Util functions that both the player and the editor need */

var WickSharedUtils = (function () {

	var wickSharedUtils = { };

	/* Call callback function for every child object in parentObj */
	wickSharedUtils.forEachChildObject = function (parentObj, callback) {
		for(var f = 0; f < parentObj.frames.length; f++) {
			for(var o = 0; o < parentObj.frames[f].wickObjects.length; o++) {
				callback(parentObj.frames[f].wickObjects[o]);
			}
		}
	}

	/* Call callback function for every child object in parentObj's current frame */
	wickSharedUtils.forEachActiveChildObject = function (parentObj, callback) {
		var currFrame = parentObj.currentFrame;
		for(var o = 0; o < parentObj.frames[currFrame].wickObjects.length; o++) {
			callback(parentObj.frames[currFrame].wickObjects[o]);
		}
	}

	/* Encodes scripts to avoid JSON format problems */
	wickSharedUtils.encodeScripts = function (wickObj) {

		if(wickObj.isSymbol) {
			for (var key in wickObj.wickScripts) {
				wickObj.wickScripts[key] = encodeURI(wickObj.wickScripts[key]);
			}

			wickSharedUtils.forEachChildObject(wickObj, function(currObj) {
				wickSharedUtils.encodeScripts(currObj);
			});
		}

	}

	/* Decodes scripts back to human-readble and eval()-able format */
	wickSharedUtils.decodeScripts = function (wickObj) {
		
		if(wickObj.isSymbol) {
			for (var key in wickObj.wickScripts) {
				wickObj.wickScripts[key] = decodeURI(wickObj.wickScripts[key]);
			}

			wickSharedUtils.forEachChildObject(wickObj, function(currObj) {
				wickSharedUtils.decodeScripts(currObj);
			});
		}

	}

	return wickSharedUtils;

})();