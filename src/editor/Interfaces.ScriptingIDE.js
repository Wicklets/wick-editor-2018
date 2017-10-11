/* Wick - (c) 2017 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/*  This file is part of Wick. 
    
    Wick is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Wick is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Wick.  If not, see <http://www.gnu.org/licenses/>. */

var ScriptingIDEInterface = function (wickEditor) {

    var that = this;

    var maximized;
    var objectBeingScripted;

    var changeAnnotationTimer;
    var SYNTAX_ERROR_MSG_DELAY = 800;

    var reference = new ScriptingIDEReference(this, wickEditor);

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

            that.aceEditor.setOptions({
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
            })
            var langTools = ace.require('ace/ext/language_tools');
            var staticWordCompleter = {
            getCompletions: function(editor, session, pos, prefix, callback) {
                var wordList = window.wickDocsKeyworksArray;
                callback(null, wordList.map(function(word) {
                    return {
                        caption: word,
                        value: word,
                        meta: "static"
                    };
                }));

                }
            }
            that.aceEditor.completers = [staticWordCompleter]

            that.beautify = ace.require("ace/ext/beautify");

            // Update selected objects scripts when script editor text changes
            that.aceEditor.getSession().on('change', function (e) {
                if(!objectBeingScripted) return;
                objectBeingScripted.wickScript = that.aceEditor.getValue();
            });

            that.aceEditor.getSession().on("changeAnnotation", function(){

                if(objectBeingScripted && objectBeingScripted.scriptError && objectBeingScripted.scriptError.type === 'syntax')
                    objectBeingScripted.scriptError = null;
                updateHeaderText()

                clearTimeout(changeAnnotationTimer);
                changeAnnotationTimer = setTimeout (function () {
                    if(!that.open)return;

                    var annot = that.aceEditor.getSession().getAnnotations();

                    // Look for errors
                    if(!objectBeingScripted) return;

                    if(objectBeingScripted.scriptError && objectBeingScripted.scriptError.type === 'syntax')
                        objectBeingScripted.scriptError = null;

                    for (var key in annot){
                        if (annot.hasOwnProperty(key)) {
                            if(annot[key].type === 'error') {
                                // There's a syntax error. Set the projectHasErrors flag so the project won't run.
                                //that.projectHasErrors = true;
                                if(!objectBeingScripted.scriptError || objectBeingScripted.scriptError.type === 'runtime') {
                                    objectBeingScripted.scriptError = {
                                        message: annot[key].text,
                                        line: annot[key].row+1,
                                        type: 'syntax'
                                    }
                                }
                            }
                        }
                    }
                    updateHeaderText()
                },SYNTAX_ERROR_MSG_DELAY);
            });

            var resizer = document.getElementById('resizeScriptingGUIBar');
            resizer.resizing = false;
            resizer.addEventListener('mousedown', function (e) {
                if(that.open){
                    resizer.resizing = true;
                } else {
                    resizer.resizing = true;
                    that.open = true;
                    that.clearError();
                    that.syncWithEditorState();
                }

            });
            window.addEventListener('mousemove', function (e) {
                if(resizer.resizing) {
                    var newIDEHeight = wickEditor.settings.scriptingIDEHeight - e.movementY;
                    wickEditor.settings.setValue('scriptingIDEHeight', newIDEHeight)
                    document.getElementById('scriptingGUI').style.height = wickEditor.settings.scriptingIDEHeight+'px';
                    that.resize()
                }
            });
            window.addEventListener('mouseup', function (e) {
                resizer.resizing = false
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
            url: "./src/project/Docs.json",
            type: 'GET',
            data: {},
            success: function(data) {
                window.wickDocsKeywords = "";
                window.wickDocsKeyworksArray = [];
                window.wickDocs = data.docs;
                if(!data.docs) return;
                data.docs.forEach(function (doc) {
                    doc.properties.forEach(function (prop) {
                        window.wickDocsKeywords += prop.name.split('(')[0] + "|"
                        window.wickDocsKeyworksArray.push(prop.name.split('(')[0]);
                    });
                });

                reference.setup();
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

        updateHeaderText()

        if(this.open) {
            $("#scriptingGUI").css('display', 'block');
            if(this.justOpened) {
                //this.aceEditor.focus()
                this.justOpened = false;
            }

            if(maximized) {
                document.getElementById('scriptingGUI').style.height = 'calc(100% - 30px)';
            } else {
                document.getElementById('scriptingGUI').style.height = wickEditor.settings.scriptingIDEHeight+'px';
            }
            
            this.aceEditor.resize();
            document.getElementById('closeScriptingGUIButton').style.display = 'block';
            document.getElementById('openScriptingGUIButton').style.display = 'none';
            document.getElementById('beautifyButton').style.display = 'block';
            if(maximized) {
                document.getElementById('expandScriptingGUIButton').style.display = 'none';
                document.getElementById('minimizeScriptingGUIButton').style.display = 'block';
            } else {
                document.getElementById('expandScriptingGUIButton').style.display = 'block';
                document.getElementById('minimizeScriptingGUIButton').style.display = 'none';
            }

            if(objectBeingScripted && (objectBeingScripted instanceof WickObject || objectBeingScripted instanceof WickFrame)) {
                $("#noSelectionDiv").css('display', 'none');
                $("#scriptObjectDiv").css('display', 'block');

                var script = objectBeingScripted.wickScript;
                that.aceEditor.setValue(script, -1);

                /*document.getElementById('scriptEditorObjectName').innerHTML = objectBeingScripted.identifier;

                if(objectBeingScripted instanceof WickFrame) {
                    document.getElementById('scriptEditorObjectThumbnail').src = objectBeingScripted.thumbnail;
                } else {
                    document.getElementById('scriptEditorObjectThumbnail').src = objectBeingScripted.fabricObjectReference._cacheCanvas.toDataURL(); 
                }*/
            } else {
                $("#noSelectionDiv").css('display', 'block');
                $("#scriptObjectDiv").css('display', 'none');

                if(wickEditor.project.getNumSelectedObjects() < 2) {
                    document.getElementById('noSelectionText').innerHTML = "No scriptable object selected!";
                } else {
                    document.getElementById('noSelectionText').innerHTML = "Multiple objects can't be scripted.<br />Group them, or convert them to a Clip or Button!";
                }
            }

        } else {
            //$("#scriptingGUI").css('display', 'none');
            $("#noSelectionDiv").css('display', 'none');
            $("#scriptingGUI").css('height', '30px');
            this.justOpened = true;

            document.getElementById('expandScriptingGUIButton').style.display = 'none';
            document.getElementById('minimizeScriptingGUIButton').style.display = 'none';

            document.getElementById('closeScriptingGUIButton').style.display = 'none';
            document.getElementById('openScriptingGUIButton').style.display = 'block';

            document.getElementById('beautifyButton').style.display = 'none';
        }
    }

    this.showError = function (obj, scriptError) {
        var object = wickEditor.project.getObjectByUUID(obj.uuid);
        var frame = wickEditor.project.getFrameByUUID(obj.uuid);

        wickEditor.project.clearSelection();
        wickEditor.project.selectObject(object || frame);
        (object || frame).scriptError = scriptError;

        if(object) {
            wickEditor.project.jumpToObject(object);
        } else if (frame) {
            wickEditor.project.jumpToFrame(frame);
        }

        this.open = true;

        wickEditor.syncInterfaces();

        this.aceEditor.selection.moveCursorToPosition({row: scriptError.line-1, column: 0});
        this.aceEditor.selection.selectLine();
        /*setTimeout(function () {
            if(object) object.causedAnException = true;

            that.open = true;

            document.getElementById("errorMessage").innerHTML = errorMessage;
            if(lineNumber) document.getElementById("errorMessage").innerHTML += ", line " + lineNumber;
            document.getElementById("errorMessage").style.display = "block";

            wickEditor.syncInterfaces();
        }, 100);*/

    
    }

    this.clearError = function () {
        /*document.getElementById("errorMessage").innerHTML = "";
        document.getElementById("errorMessage").style.display = "hidden";*/

        var framesAndObjects = (wickEditor.project.getAllFrames().concat(wickEditor.project.getAllObjects()));
        framesAndObjects.forEach(function (obj) {
            if(obj.scriptError && obj.scriptError.type === 'runtime') {
                obj.scriptError = null;
            }
        })
    }

    this.beautifyCode = function () {
        var val = that.aceEditor.session.getValue();
        val = js_beautify(val);
        that.aceEditor.session.setValue(val);
        
        var row = that.aceEditor.session.getLength() - 1;
        var column = that.aceEditor.session.getLine(row).length;
        that.aceEditor.gotoLine(row + 1, column);
    }

    var updateHeaderText = function () {
        var header = document.getElementById('scriptingIDEHeader');

        //header.style.color = 'white'
        header.style.backgroundColor = 'rgba(0,0,0,0)';
        header.style.fontWeight = 'normal';

        //document.getElementById('scriptObjectDiv').style.backgroundColor  = 'rgba(0,0,0,0)';

        if(!objectBeingScripted) {
            header.innerHTML = "";
        } else {
            if(objectBeingScripted.scriptError) {
                header.innerHTML = "Line " + objectBeingScripted.scriptError.line + ": " + objectBeingScripted.scriptError.message;
                //header.style.color = 'red';
                header.style.backgroundColor = 'rgb(255,50,70)';
                //document.getElementById('scriptObjectDiv').style.backgroundColor = 'red';
                header.style.fontWeight = 'bold';
            } else if(/*objectBeingScripted.isSymbol*/objectBeingScripted instanceof WickObject) {

                var wickObjectType = "object"
                if(objectBeingScripted.isText) {
                    wickObjectType = 'text'
                } else if(objectBeingScripted.isButton) {
                    wickObjectType = 'button'
                } else if(objectBeingScripted.isGroup) {
                    wickObjectType = 'group'
                } else if(objectBeingScripted.isSymbol) {
                    wickObjectType = 'clip'
                } else if(objectBeingScripted.isPath) {
                    wickObjectType = 'path'
                } else if(objectBeingScripted.isImage) {
                    wickObjectType = 'image'
                }

                header.innerHTML = "Edit scripts of "+wickObjectType+": <strong>"+(objectBeingScripted.name || "(no name)")+"</strong>";
            } else if (objectBeingScripted instanceof WickFrame) {
                var framename = objectBeingScripted.name || (objectBeingScripted.playheadPosition+1)
                header.innerHTML = "Edit scripts of frame: <strong>"+framename+"</strong>";
            } else {
                header.innerHTML = ""
            }
        }
    }

// Other buttons

    $("#closeScriptingGUIButton").on("click", function (e) {
        that.open = false;
        that.clearError();
        that.syncWithEditorState();
    });
    $("#openScriptingGUIButton").on("click", function (e) {
        that.open = true;
        that.clearError();
        that.syncWithEditorState();
    });

    $("#beautifyButton").on("click", function (e) {
        that.beautifyCode();
    });

    $("#expandScriptingGUIButton").on("click", function (e) {
        maximized = true;
        that.syncWithEditorState();
    });
    $("#minimizeScriptingGUIButton").on("click", function (e) {
        maximized = false;
        that.syncWithEditorState();
    });

    /*$("#scriptingIDEHeader").on("click", function (e) {
        that.open = !that.open;
        that.clearError();
        that.syncWithEditorState();
    });
    $("#scriptingIDEHeader").on("mouseover", function (e) {
        if(!that.open)
            $("#scriptingGUI").css('height', '32px');
    });
    $("#scriptingIDEHeader").on("mouseout", function (e) {
        if(!that.open)
            $("#scriptingGUI").css('height', '30px');
    });*/

}