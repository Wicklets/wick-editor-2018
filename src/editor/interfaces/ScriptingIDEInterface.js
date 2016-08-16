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
            openScriptingGUI();
        } else {
            closeScriptingGUI();
        }
    }

    var closeScriptingGUI = function () {
        $("#scriptingGUI").css('visibility', 'hidden');
    }

    var openScriptingGUI = function () {
        var selectedObj = wickEditor.getSelectedWickObject();

        if(!selectedObj) {
            closeScriptingGUI();
            return;
        }

        if(selectedObj.wickScripts[that.currentScript]) {
            var script = selectedObj.wickScripts[that.currentScript];
            that.aceEditor.setValue(script, -1);
        }

        document.getElementById("onLoadButton").className = (that.currentScript == 'onLoad' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
        document.getElementById("onUpdateButton").className = (that.currentScript == 'onUpdate' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
        document.getElementById("onClickButton").className = (that.currentScript == 'onClick' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
        document.getElementById("onKeyDownButton").className = (that.currentScript == 'onKeyDown' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
    
        $("#scriptingGUI").css('visibility', 'visible');
    }

// GUI/Event handlers

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

    $("#closeScriptingGUIButton").on("click", function (e) {
        that.open = false;
        closeScriptingGUI();
        that.syncWithEditorState();
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
        wickEditor.getSelectedWickObject().wickScripts[that.currentScript] = that.aceEditor.getValue();
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