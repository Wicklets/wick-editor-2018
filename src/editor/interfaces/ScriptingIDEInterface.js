/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var ScriptingIDEInterface = function (wickEditor) {

    var that = this;

    var maximized;
    var objectBeingScripted;

    this.setup = function () {
        maximized = false;
        objectBeingScripted = null;

        this.open = false;
        this.currentScript = 'onLoad';

        this.aceEditor = ace.edit("scriptEditor");
        this.aceEditor.setTheme("ace/theme/chrome");
        this.aceEditor.getSession().setMode("ace/mode/javascript");
        this.aceEditor.$blockScrolling = Infinity; // Makes that weird message go away
        this.aceEditor.setAutoScrollEditorIntoView(true);

        this.beautify = ace.require("ace/ext/beautify");

        // Update selected objects scripts when script editor text changes
        this.aceEditor.getSession().on('change', function (e) {
            if(!objectBeingScripted) return;
            objectBeingScripted.wickScripts[that.currentScript] = that.aceEditor.getValue();
        });

        this.aceEditor.getSession().on("changeAnnotation", function(){
            var annot = that.aceEditor.getSession().getAnnotations();

            // Look for errors
            if(!objectBeingScripted) return;

            objectBeingScripted.hasSyntaxErrors = false;
            for (var key in annot){
                if (annot.hasOwnProperty(key)) {
                    if(annot[key].type === 'error') {
                        // There's a syntax error. Set the projectHasErrors flag so the project won't run.
                        //that.projectHasErrors = true;
                        objectBeingScripted.hasSyntaxErrors = true;
                    }
                }
            }
        });

        this.resize = function () {
            var GUIWidth = parseInt($("#scriptingGUI").css("width"));
            //$("#scriptingGUI").css('left', (window.innerWidth/2 - GUIWidth/2)+'px');
            this.aceEditor.resize();
        }

        window.addEventListener('resize', function(e) {
            that.resize();
        });
        this.resize();
    }

    this.editScriptsOfObject = function (obj, args) {
        objectBeingScripted = obj;

        if(args && args.dontOpenIDE) {

        } else {
            this.open = true;
        }

        this.syncWithEditorState();
    }

    this.clearSelection = function () {
        objectBeingScripted = null;

        this.syncWithEditorState();
    }

    var erroneousLine;
    function unhighlightError() {
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

            this.aceEditor.resize();
            if(maximized) {
                document.getElementById('expandScriptingGUIButton').style.display = 'none';
                document.getElementById('minimizeScriptingGUIButton').style.display = 'block';
            } else {
                document.getElementById('expandScriptingGUIButton').style.display = 'block';
                document.getElementById('minimizeScriptingGUIButton').style.display = 'none';
            }

            if(objectBeingScripted && (objectBeingScripted.isSymbol || objectBeingScripted instanceof WickFrame)) {
                $("#noSelectionDiv").css('display', 'none');
                $("#scriptObjectDiv").css('display', 'block');

                var script = objectBeingScripted.wickScripts[that.currentScript];
                that.aceEditor.setValue(script, -1);
                
                if(objectBeingScripted instanceof WickFrame) {
                    document.getElementById("onClickButton").style.display   = 'block';
                    document.getElementById("onKeyDownButton").style.display = 'block';
                    document.getElementById("onClickButton").style.display   = 'none';
                    document.getElementById("onKeyDownButton").style.display = 'none';
                } else {
                    document.getElementById("onClickButton").style.display   = 'block';
                    document.getElementById("onKeyDownButton").style.display = 'block';
                    document.getElementById("onClickButton").style.display   = 'block';
                    document.getElementById("onKeyDownButton").style.display = 'block';
                }

                document.getElementById("onLoadButton").className = (that.currentScript == 'onLoad' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
                document.getElementById("onUpdateButton").className = (that.currentScript == 'onUpdate' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
                document.getElementById("onClickButton").className = (that.currentScript == 'onClick' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
                document.getElementById("onKeyDownButton").className = (that.currentScript == 'onKeyDown' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
            } else {
                $("#noSelectionDiv").css('display', 'block');
                $("#scriptObjectDiv").css('display', 'none');
            }

        } else {
            $("#scriptingGUI").css('display', 'none');
        }
    }

    this.showError = function (id, scriptType, lineNumber, errorMessage) {
        wickEditor.project.jumpToObject(id);
        wickEditor.syncInterfaces();
        setTimeout(function () {
            wickEditor.fabric.selectByIDs([id]);
            that.editScriptsOfObject(wickEditor.project.getObjectByID(id));
            wickEditor.scriptingide.currentScript = scriptType;

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
        document.getElementById("errorMessage").style.display = "hidden";
    }

// Script buttons

    $("#onLoadButton").on("click", function (e) {
        that.currentScript = 'onLoad';
        unhighlightError();
        wickEditor.syncInterfaces();
        that.clearError();
    });

    $("#onClickButton").on("click", function (e) {
        that.currentScript = 'onClick';
        unhighlightError();
        wickEditor.syncInterfaces();
        that.clearError();
    });

    $("#onUpdateButton").on("click", function (e) {
        that.currentScript = 'onUpdate';
        unhighlightError();
        wickEditor.syncInterfaces();
        that.clearError();
    });

    $("#onKeyDownButton").on("click", function (e) {
        that.currentScript = 'onKeyDown';
        unhighlightError();
        wickEditor.syncInterfaces();
        that.clearError();
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

    $("#expandScriptingGUIButton").on("click", function (e) {
        document.getElementById('scriptingGUI').style.height = 'calc(100% - 33px)';
        maximized = true;
        that.syncWithEditorState();
    });
    $("#minimizeScriptingGUIButton").on("click", function (e) {
        document.getElementById('scriptingGUI').style.height = '300px';
        maximized = false;
        that.syncWithEditorState();
    });

}