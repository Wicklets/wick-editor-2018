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

	/* */
	var encodeString = function (str) {
		var newStr = str;
		newStr = encodeURI(str);
		newStr = newStr.replace(/'/g, "%27");
		return newStr;
	}

	/* */
	var decodeString = function (str) {
		var newStr = str;
		newStr = newStr.replace(/%27/g, "'");
		newStr = decodeURI(str);
		return newStr;
	}

	/* Encodes scripts to avoid JSON format problems */
	wickSharedUtils.encodeScripts = function (wickObj) {

		if(wickObj.wickScripts) {
			for (var key in wickObj.wickScripts) {
				wickObj.wickScripts[key] = encodeString(wickObj.wickScripts[key]);
			}
		}

		if(wickObj.fontData) {
			wickObj.fontData.text = encodeString(wickObj.fontData.text);
		}

		if(wickObj.isSymbol) {
			wickSharedUtils.forEachChildObject(wickObj, function(currObj) {
				wickSharedUtils.encodeScripts(currObj);
			});
		}

	}

	/* Decodes scripts back to human-readble and eval()-able format */
	wickSharedUtils.decodeScripts = function (wickObj) {
		
		if(wickObj.wickScripts) {
			for (var key in wickObj.wickScripts) {
				wickObj.wickScripts[key] = decodeString(wickObj.wickScripts[key])
			}
		}

		if(wickObj.fontData) {
			wickObj.fontData.text = decodeString(wickObj.fontData.text);
		}

		if(wickObj.isSymbol) {
			wickSharedUtils.forEachChildObject(wickObj, function(currObj) {
				wickSharedUtils.decodeScripts(currObj);
			});
		}

	}

	return wickSharedUtils;

})();