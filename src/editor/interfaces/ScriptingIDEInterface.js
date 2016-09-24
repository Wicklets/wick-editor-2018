/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var ScriptingIDEInterface = function (wickEditor) {

    var that = this;

    this.open = false;
    this.currentScript = 'onLoad';
    this.projectHasErrors = false;

    this.aceEditor = ace.edit("scriptEditor");
    this.aceEditor.setTheme("ace/theme/chrome");
    this.aceEditor.getSession().setMode("ace/mode/javascript");
    this.aceEditor.$blockScrolling = Infinity; // Makes that weird message go away

    this.beautify = ace.require("ace/ext/beautify");

    this.syncWithEditorState = function () {
        if(this.open) {
            $("#scriptingGUI").css('display', 'block');

            var selectedObj = wickEditor.interfaces['fabric'].getSelectedWickObject();

            if(!selectedObj) {
                $("#noSelectionDiv").css('display', 'block');
                $("#scriptObjectDiv").css('display', 'none');
                $("#scriptingGUI").css('height', '20px');
            } else if(selectedObj.wickScripts[that.currentScript] !== undefined) {
                $("#noSelectionDiv").css('display', 'none');
                $("#scriptObjectDiv").css('display', 'block');
                $("#scriptingGUI").css('height', '230px');

                var script = selectedObj.wickScripts[that.currentScript];
                that.aceEditor.setValue(script, -1);

                document.getElementById("onLoadButton").className = (that.currentScript == 'onLoad' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
                document.getElementById("onUpdateButton").className = (that.currentScript == 'onUpdate' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
                document.getElementById("onClickButton").className = (that.currentScript == 'onClick' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
                document.getElementById("onKeyDownButton").className = (that.currentScript == 'onKeyDown' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
            }
        } else {
            $("#scriptingGUI").css('display', 'none');
        }
    }
// Script buttons

    $("#onLoadButton").on("click", function (e) {
        that.currentScript = 'onLoad';
        wickEditor.syncInterfaces();
    });

    $("#onClickButton").on("click", function (e) {
        that.currentScript = 'onClick';
        wickEditor.syncInterfaces();
    });

    $("#onUpdateButton").on("click", function (e) {
        that.currentScript = 'onUpdate';
        wickEditor.syncInterfaces();
    });

    $("#onKeyDownButton").on("click", function (e) {
        that.currentScript = 'onKeyDown';
        wickEditor.syncInterfaces();
    });

// Other buttons

    $("#closeScriptingGUIButton").on("click", function (e) {
        that.open = false;
        that.syncWithEditorState();
    });

    $("#beautifyButton").on("click", function (e) {
        var val = that.aceEditor.session.getValue();
        val = js_beautify(val);
        that.aceEditor.session.setValue(val);
    });

// Ace events

    // Update selected objects scripts when script editor text changes
    this.aceEditor.getSession().on('change', function (e) {
        wickEditor.interfaces['fabric'].getSelectedWickObject().wickScripts[that.currentScript] = that.aceEditor.getValue();
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