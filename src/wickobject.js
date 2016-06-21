/*****************************
	Object 
*****************************/

var WickObject = function () {

// Internals

	// Used for debugging.
	this.objectName = undefined;

	// Note that the root object is the only object with parentObject as null.
	this.parentObject = null;

// Common

	// Dictionary mapping function names to WickScript object
	this.wickScripts = {
		"onLoad" : "// onLoad\n// This script runs once when this object enters the scene.\n",
		"onClick" : "// onClick\n// This script runs when this object is clicked on.\n",
		"onUpdate": "// onUpdate\n// This script runs repeatedly whenever this object is in the scene.\n",
		"onKeyDown": "// onKeyDown\n// This script runs whenever a key is pressed.\n"
	};

// Static

	// Data, only used by static objects
	this.imageData = undefined;
	this.fontData = undefined;
	this.htmlData = undefined;

// Symbols

	// See design docs for how objects and symbols work.
	this.isSymbol = false;

	// Used to keep track of what frame is being edited
	this.currentFrame = null;

	// List of frames, only used by symbols
	this.frames = undefined;

};

WickObject.prototype.setDefaultPositioningValues = function () {

	this.scaleX = 1;
	this.scaleY = 1;
	this.angle  = 0;
	this.flipX  = false;
	this.flipY  = false;

}

WickObject.prototype.setDefaultSymbolValues = function () {

	this.isSymbol = true;
	this.currentFrame = 0;
	this.frames = [new WickFrame()];

}

WickObject.prototype.setDefaultFontValues = function (text) {

	// See http://fabricjs.com/docs/fabric.IText.html for full fabric.js IText definition
	// Note: We will probably want to change 'editable' in order to have dynamic text in the player, but this still needs more research

	this.fontData = {
		//backgroundColor: undefined,
		//borderColor: undefined,
		//borderDashArray: undefined,
		//borderScaleFactor: undefined, 
		//caching: true,
		cursorColor: '#333',
		cursorDelay: 1000,
		cursorWidth: 2,
		editable: true,
		//editingBorderColor: undefined,
		fontFamily: 'arial',
		fontSize: 40,
		fontStyle: 'normal',
		fontWeight: 'normal',
		hasBorders: false,
		lineHeight: 1.16,
		fill: '#000000',
		//selectionColor: undefined,
		//selectionEnd: undefined,
		//selectionStart: undefined,
		//shadow: undefined,
		//stateProperties: undefined,
		//stroke: undefined,
		//styles: undefined, // Stores variable character styles
		textAlign: 'left',
		//textBackgroundColor: undefined,
		textDecoration: "",
		text: text
	};

}

WickObject.prototype.getCurrentFrame = function() {
	return this.frames[this.currentFrame];
}

WickObject.prototype.addEmptyFrame = function(newFrameIndex) {
	this.frames[newFrameIndex] = new WickFrame();
}

// Used to prepare project for JSONificaion. 
// (JSON files can't have objects with circular references)
WickObject.prototype.removeParentObjectRefences = function() {

	this.parentObject = null;

	if(this.isSymbol) {

		// Recursively remove parent object references of all objects inside this symbol.

		for(var f = 0; f < this.frames.length; f++) {
			var frame = this.frames[f];
			for (var o = 0; o < frame.wickObjects.length; o++) {
				var wickObject = frame.wickObjects[o];
				wickObject.removeParentObjectRefences();
			}
		}
	}

}

// Used to put parent object references back after 
WickObject.prototype.regenerateParentObjectReferences = function() {

	var parentObject = this;

	if(this.isSymbol) {

		// Recursively remove parent object references of all objects inside this symbol.

		for(var f = 0; f < this.frames.length; f++) {
			var frame = this.frames[f];
			for (var o = 0; o < frame.wickObjects.length; o++) {
				frame.wickObjects[o].parentObject = parentObject;
				frame.wickObjects[o].regenerateParentObjectReferences();
			}
		}
	}

}

// Uses all parent's positions to calculate correct position on canvas
WickObject.prototype.getRelativePosition = function () {

	if(this.isRoot) {
		return {
			top: 0,
			left: 0
		};
	} else {
		var parentPosition = this.parentObject.getRelativePosition();
		return {
			top: this.top + parentPosition.top,
			left: this.left + parentPosition.left
		};
	}

}

// 
WickObject.prototype.fixSymbolPosition = function () {

	if(this.isSymbol) {
		var leftmostLeft = null;
		var topmostTop = null;

		WickSharedUtils.forEachFirstFrameChildObject(this, function (currObj) {
			if(!leftmostLeft || currObj.left < leftmostLeft) {
				leftmostLeft = currObj.left;
			}

			if(!topmostTop || currObj.top < topmostTop) {
				topmostTop = currObj.top;
			}
		});

		// Only set left/top if there were actually children in the symbol
		if(leftmostLeft && topmostTop) {
			this.left -= leftmostLeft;
			this.top -= topmostTop;
		}
	}

}

