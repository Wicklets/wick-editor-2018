/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */



var ScriptingIDEInterface = function (wickEditor) {

    var that = this;

    var maximized;
    var objectBeingScripted;

    this.justOpened = true;

    this.setup = function () {
        var proceed = function () {
            maximized = false;
            objectBeingScripted = null;

            that.open = false;

            that.aceEditor = ace.edit("scriptEditor");
            that.aceEditor.setTheme("ace/theme/idle_fingers");
            that.aceEditor.getSession().setMode("ace/mode/javascript");
            that.aceEditor.$blockScrolling = Infinity; // Makes that weird message go away
            that.aceEditor.setAutoScrollEditorIntoView(true);

            that.beautify = ace.require("ace/ext/beautify");

            // Update selected objects scripts when script editor text changes
            that.aceEditor.getSession().on('change', function (e) {
                if(!objectBeingScripted) return;
                objectBeingScripted.wickScript = that.aceEditor.getValue();
            });

            that.aceEditor.getSession().on("changeAnnotation", function(){
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

            that.resize = function () {
                var GUIWidth = parseInt($("#scriptingGUI").css("width"));
                //$("#scriptingGUI").css('left', (window.innerWidth/2 - GUIWidth/2)+'px');
                that.aceEditor.resize();
            }

            window.addEventListener('resize', function(e) {
                that.resize();
            });
            that.resize();
        }
        $.ajax({
            url: "../src/project/Docs.json",
            type: 'GET',
            data: {},
            success: function(data) {
                window.wickDocs = "";
                data.docs.forEach(function (doc) {
                    doc.properties.forEach(function (prop) {
                        window.wickDocs += prop.name.split('(')[0] + "|"
                    });
                });
            },
            error: function () {
                console.log("ajax: error")
            },
            complete: function(response, textStatus) {
                proceed();
            }
        });
    }

    this.syncWithEditorState = function () {
        objectBeingScripted = wickEditor.project.getSelectedObject();

        if(this.open) {
            $("#scriptingGUI").css('display', 'block');
            if(this.justOpened) {
                $(".ace_text-input").focus();
                this.justOpened = false;
            }

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
            this.justOpened = true;
        }
    }

    this.showError = function (obj, lineNumber, errorMessage) {
        var object = wickEditor.project.getObjectByUUID(obj.uuid);
        var frame = wickEditor.project.getFrameByUUID(obj.uuid);

        wickEditor.project.clearSelection();
        wickEditor.project.selectObject(obj)

        if(object) {
            wickEditor.project.jumpToObject(object);
        } else if (frame) {
            wickEditor.project.jumpToFrame(frame);
        }

        wickEditor.syncInterfaces();
        setTimeout(function () {
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