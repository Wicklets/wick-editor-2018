var WickScriptingIDE = function (wickEditor) {

	this.aceEditor = ace.edit("scriptEditor");
	this.aceEditor.setTheme("ace/theme/chrome");
	this.aceEditor.getSession().setMode("ace/mode/javascript");
	this.aceEditor.$blockScrolling = Infinity; // Makes that weird message go away

	this.open = false;

	this.currentScript = 'onLoad';

	this.projectHasErrors = false;

// GUI/Event handlers

	var that = this;

	$("#onLoadButton").on("click", function (e) {
		that.currentScript = 'onLoad';
		that.reloadScriptingGUI(wickEditor.fabricCanvas.getActiveObject());
	});

	$("#onClickButton").on("click", function (e) {
		that.currentScript = 'onClick';
		that.reloadScriptingGUI(wickEditor.fabricCanvas.getActiveObject());
	});

	$("#onUpdateButton").on("click", function (e) {
		that.currentScript = 'onUpdate';
		that.reloadScriptingGUI(wickEditor.fabricCanvas.getActiveObject());
	});

	$("#closeScriptingGUIButton").on("click", function (e) {
		that.closeScriptingGUI();
	});

	$("#refBtnPlay").on("click", function (e) {
		console.log("refBtnPlay");
	});

	$("#refBtnStop").on("click", function (e) {
		console.log("refBtnStop");
	});

	$("#refBtnGotoAndStop").on("click", function (e) {
		console.log("refBtnGotoAndStop");
	});

	$("#refBtnGotoAndPlay").on("click", function (e) {
		console.log("refBtnGotoAndPlay");
	});

	$("#refBtnHitTest").on("click", function (e) {
		console.log("refBtnHitTest");
	});

	$("#refBtnRoot").on("click", function (e) {
		console.log("refBtnRoot");
	});

	// Update selected objects scripts when script editor text changes
	this.aceEditor.getSession().on('change', function (e) {
		that.updateScriptsOnObject(wickEditor.fabricCanvas.getActiveObject());
	});

	this.aceEditor.getSession().on("changeAnnotation", function(){
		var annot = that.aceEditor.getSession().getAnnotations();

		// Look for errors

		that.projectHasErrors = false;
		for (var key in annot){
			if (annot.hasOwnProperty(key)) {
				if(annot[key].type === 'error') {
					// Oh no! There's an error. Set the projectHasErrors flag so the project won't run.
					that.projectHasErrors = true;
				}
			}
		}
	});

}

WickScriptingIDE.prototype.openScriptingGUI = function (activeObj) {
	this.open = true;
	this.reloadScriptingGUI(activeObj);
	$("#scriptingGUI").css('visibility', 'visible');
};

WickScriptingIDE.prototype.closeScriptingGUI = function () {
	this.open = false;
	$("#scriptingGUI").css('visibility', 'hidden');
};

WickScriptingIDE.prototype.updateScriptsOnObject = function (activeObj) {
	activeObj.wickObject.wickScripts[this.currentScript] = this.aceEditor.getValue();
}

WickScriptingIDE.prototype.reloadScriptingGUI = function (activeObj) {
	
	if(!activeObj || !activeObj.wickObject) {
		this.closeScriptingGUI();
		return;
	}

	if(activeObj && activeObj.wickObject.wickScripts && activeObj.wickObject.wickScripts[this.currentScript]) {
		var script = activeObj.wickObject.wickScripts[this.currentScript];
		this.aceEditor.setValue(script, -1);
	}

	document.getElementById("onLoadButton").className = (this.currentScript == 'onLoad' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
	document.getElementById("onUpdateButton").className = (this.currentScript == 'onUpdate' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
	document.getElementById("onClickButton").className = (this.currentScript == 'onClick' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
};
