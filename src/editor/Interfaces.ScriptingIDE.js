/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var ScriptingIDEInterface = function (wickEditor) {

    var that = this;

    var maximized;
    var objectBeingScripted;

    this.setup = function () {
        maximized = false;
        objectBeingScripted = null;

        this.open = false;

        this.aceEditor = ace.edit("scriptEditor");
        this.aceEditor.setTheme("ace/theme/chrome");
        this.aceEditor.getSession().setMode("ace/mode/javascript");
        this.aceEditor.$blockScrolling = Infinity; // Makes that weird message go away
        this.aceEditor.setAutoScrollEditorIntoView(true);

        this.beautify = ace.require("ace/ext/beautify");

        // Update selected objects scripts when script editor text changes
        this.aceEditor.getSession().on('change', function (e) {
            if(!objectBeingScripted) return;
            objectBeingScripted.wickScript = that.aceEditor.getValue();
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

    this.syncWithEditorState = function () {
        objectBeingScripted = wickEditor.project.getSelectedObject();

        if(this.open) {
            $("#scriptingGUI").css('display', 'block');
            $(".ace_text-input").focus();

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

                var script = objectBeingScripted.wickScript;
                that.aceEditor.setValue(script, -1);
            } else {
                $("#noSelectionDiv").css('display', 'block');
                $("#scriptObjectDiv").css('display', 'none');
            }

        } else {
            $("#scriptingGUI").css('display', 'none');
        }
    }

    this.showError = function (obj, lineNumber, errorMessage) {
        var object = wickEditor.project.getObjectByUUID(obj.uuid);
        var frame = wickEditor.project.getFrameByUUID(obj.uuid);

        console.log(object)
        console.log(frame)

        if(object) {
            wickEditor.project.jumpToObject(object);
        } else if (frame) {
            wickEditor.project.jumpToFrame(frame);
        }

        wickEditor.syncInterfaces();
        setTimeout(function () {
            if(object) {
                wickEditor.project.clearSelection()
                wickEditor.project.selectObject(object)
            }
            if(object) wickEditor.fabric.selectObjects([object]);

            if(object) object.causedAnException = true;

            that.open = true;

            document.getElementById("errorMessage").innerHTML = errorMessage;
            if(lineNumber) document.getElementById("errorMessage").innerHTML += ", line " + lineNumber;
            document.getElementById("errorMessage").style.display = "block";

            wickEditor.syncInterfaces();
        }, 100);
    }

    this.clearError = function () {
        document.getElementById("errorMessage").innerHTML = "";
        document.getElementById("errorMessage").style.display = "hidden";
    }

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