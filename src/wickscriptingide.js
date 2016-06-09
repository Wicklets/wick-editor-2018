var WickScriptingIDE = function () {

	this.aceEditor = ace.edit("scriptEditor");
	this.aceEditor.setTheme("ace/theme/chrome");
	this.aceEditor.getSession().setMode("ace/mode/javascript");
	this.aceEditor.$blockScrolling = Infinity; // Makes that weird message go away

}

WickScriptingIDE.prototype.nothing = function() {
};