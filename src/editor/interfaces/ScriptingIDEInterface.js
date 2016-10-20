/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var ScriptingIDEInterface = function (wickEditor) {

    var that = this;

    this.open = false;
    this.currentScript = 'onLoad';

    this.aceEditor = ace.edit("scriptEditor");
    this.aceEditor.setTheme("ace/theme/chrome");
    this.aceEditor.getSession().setMode("ace/mode/javascript");
    this.aceEditor.$blockScrolling = Infinity; // Makes that weird message go away
    this.aceEditor.setAutoScrollEditorIntoView(true);

    this.beautify = ace.require("ace/ext/beautify");

    var erroneousLine;
    function unhighlightError(){
        that.aceEditor.getSession().removeMarker(erroneousLine);
    }
    function highlightError(lineNumber) {
        unhighlightError();
        var Range = ace.require("ace/range").Range
        erroneousLine = that.aceEditor.session.addMarker(new Range(lineNumber, 0, lineNumber, 144), "errorHighlight", "fullLine");
    }

    this.syncWithEditorState = function () {
        if(this.open) {
            $("#scriptingGUI").css('display', 'block');

            var selectedObj = wickEditor.interfaces['fabric'].getSelectedWickObject();

            if(!selectedObj || !selectedObj.isSymbol) {
                that.clearError();
                $("#noSelectionDiv").css('display', 'block');
                $("#scriptObjectDiv").css('display', 'none');
                document.getElementById("errorMessage").style.display = "none";
                //$("#scriptingGUI").css('height', '20px');
            } else if(selectedObj.wickScripts[that.currentScript] !== undefined) {
                $("#noSelectionDiv").css('display', 'none');
                $("#scriptObjectDiv").css('display', 'block');
                //$("#scriptingGUI").css('height', '230px');

                var script = selectedObj.wickScripts[that.currentScript];
                that.aceEditor.setValue(script, -1);

                document.getElementById("onLoadButton").className = (that.currentScript == 'onLoad' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
                document.getElementById("onUpdateButton").className = (that.currentScript == 'onUpdate' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
                document.getElementById("onClickButton").className = (that.currentScript == 'onClick' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
                document.getElementById("onKeyDownButton").className = (that.currentScript == 'onKeyDown' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
            }
        } else {
            that.clearError();
            $("#scriptingGUI").css('display', 'none');
        }
    }

    this.showError = function (id, scriptType, lineNumber, errorMessage) {
        wickEditor.interfaces.builtinplayer.running = false;
        WickPlayer.stopRunningCurrentProject();
        wickEditor.project.jumpToObject(id);
        wickEditor.syncInterfaces();
        setTimeout(function () {
            wickEditor.interfaces.fabric.selectByIDs([id]);
            wickEditor.interfaces.scriptingide.open = true;
            wickEditor.interfaces.scriptingide.currentScript = scriptType;

            wickEditor.project.rootObject.getChildByID(id).causedAnException = true;

            document.getElementById("errorMessage").innerHTML = errorMessage;
            if(lineNumber) document.getElementById("errorMessage").innerHTML += ", line " + lineNumber;
            document.getElementById("errorMessage").style.display = "block";

            erroneousLine = lineNumber-1;
            highlightError(erroneousLine);

            wickEditor.syncInterfaces();
        }, 100);
    }

    this.clearError = function () {
        unhighlightError();
        document.getElementById("errorMessage").innerHTML = "";
        document.getElementById("errorMessage").style.display = "none";
    }

// Script buttons

    $("#onLoadButton").on("click", function (e) {
        that.currentScript = 'onLoad';
        unhighlightError();
        wickEditor.syncInterfaces();
    });

    $("#onClickButton").on("click", function (e) {
        that.currentScript = 'onClick';
        unhighlightError();
        wickEditor.syncInterfaces();
    });

    $("#onUpdateButton").on("click", function (e) {
        that.currentScript = 'onUpdate';
        unhighlightError();
        wickEditor.syncInterfaces();
    });

    $("#onKeyDownButton").on("click", function (e) {
        that.currentScript = 'onKeyDown';
        unhighlightError();
        wickEditor.syncInterfaces();
    });

// Other buttons

    $("#closeScriptingGUIButton").on("click", function (e) {
        that.open = false;
        that.clearError();
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

        var selectedObj = wickEditor.interfaces.fabric.getSelectedWickObject()
        if(!selectedObj) return;

        selectedObj.hasSyntaxErrors = false;
        for (var key in annot){
            if (annot.hasOwnProperty(key)) {
                if(annot[key].type === 'error') {
                    // There's a syntax error. Set the projectHasErrors flag so the project won't run.
                    //that.projectHasErrors = true;
                    selectedObj.hasSyntaxErrors = true;
                }
            }
        }
    });

    this.resize = function () {
        var GUIWidth = parseInt($("#scriptingGUI").css("width"));
        $("#scriptingGUI").css('left', (window.innerWidth/2 - GUIWidth/2)+'px');
        this.aceEditor.resize();
    }

    window.addEventListener('resize', function(e) {
        that.resize();
    });
    this.resize();

}