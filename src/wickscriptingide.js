var WickScriptingIDE = function (wickEditor) {

// Init

	this.aceEditor = ace.edit("scriptEditor");
	this.aceEditor.setTheme("ace/theme/chrome");
	this.aceEditor.getSession().setMode("ace/mode/javascript");
	this.aceEditor.$blockScrolling = Infinity; // Makes that weird message go away

	this.beautify = ace.require("ace/ext/beautify");

	this.open = false;

	this.currentScript = 'onLoad';

	this.projectHasErrors = false;

// GUI/Event handlers

	var that = this;

// Editor Tabs

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

	$("#onKeyDownButton").on("click", function (e) {
		that.currentScript = 'onKeyDown';
		that.reloadScriptingGUI(wickEditor.fabricCanvas.getActiveObject());
	});

	$("#closeScriptingGUIButton").on("click", function (e) {
		that.closeScriptingGUI();
	});

// Script refs

	document.getElementById("refBtnPlay").addEventListener("dragstart", function(ev) {
	    ev.dataTransfer.setData("text", "play();");
	});

	document.getElementById("refBtnStop").addEventListener("dragstart", function(ev) {
	    ev.dataTransfer.setData("text", "stop();");
	});

	document.getElementById("refBtnGotoAndStop").addEventListener("dragstart", function(ev) {
	    ev.dataTransfer.setData("text", "gotoAndStop(frame);");
	});

	document.getElementById("refBtnGotoAndPlay").addEventListener("dragstart", function(ev) {
	    ev.dataTransfer.setData("text", "gotoAndPlay(frame);");
	});

	document.getElementById("refBtnGotoNextFrame").addEventListener("dragstart", function(ev) {
	    ev.dataTransfer.setData("text", "gotoNextFrame();");
	});

	document.getElementById("refBtnGotoPrevFrame").addEventListener("dragstart", function(ev) {
	    ev.dataTransfer.setData("text", "gotoPrevFrame();");
	});

	$("#beautifyButton").on("click", function (e) {
		var val = that.aceEditor.session.getValue();
		val = js_beautify(val);
		that.aceEditor.session.setValue(val);
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
					// There's a syntax error. Set the projectHasErrors flag so the project won't run.
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
	document.getElementById("onKeyDownButton").className = (this.currentScript == 'onKeyDown' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
};
