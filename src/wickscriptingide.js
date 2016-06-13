var WickScriptingIDE = function () {

	this.aceEditor = ace.edit("scriptEditor");
	this.aceEditor.setTheme("ace/theme/chrome");
	this.aceEditor.getSession().setMode("ace/mode/javascript");
	this.aceEditor.$blockScrolling = Infinity; // Makes that weird message go away

	var currentScript = 'onLoad';

	this.open = false;


	$("#onLoadButton").on("click", function (e) {
		currentScript = 'onLoad';
	});

	$("#onClickButton").on("click", function (e) {
		currentScript = 'onClick';
	});

	$("#onUpdateButton").on("click", function (e) {
		currentScript = 'onUpdate';
	});

	$("#closeScriptingGUIButton").on("click", function (e) {
		//this.closeScriptingGUI(); //scope issue
	});


	this.openScriptingGUI = function () {
		this.open = true;
		$("#scriptingGUI").css('visibility', 'visible');
	};

	this.closeScriptingGUI = function () {
		this.open = false;
		$("#scriptingGUI").css('visibility', 'hidden');
	};

	this.updateScriptsOnObject = function (activeObj) {
		if(activeObj.wickObject.isSymbol) {
			activeObj.wickObject.wickScripts[currentScript] = this.aceEditor.getValue();
		}
	}

	this.reloadScriptingGUITextArea = function (activeObj) {
		if(activeObj && activeObj.wickObject.wickScripts && activeObj.wickObject.wickScripts[currentScript]) {
			var script = activeObj.wickObject.wickScripts[currentScript];
			this.aceEditor.setValue(script, -1);
		}

		document.getElementById("onLoadButton").className = (currentScript == 'onLoad' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
		document.getElementById("onUpdateButton").className = (currentScript == 'onUpdate' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
		document.getElementById("onClickButton").className = (currentScript == 'onClick' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
	};

}
