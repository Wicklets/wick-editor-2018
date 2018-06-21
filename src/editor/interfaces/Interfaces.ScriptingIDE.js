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

    var self = this;

    var openLast;

    var maximized;
    var objectBeingScripted;

    var changeAnnotationTimer;
    var SYNTAX_ERROR_MSG_DELAY = 800;

    var reference;

    this.setup = function () {
        maximized = false;
        objectBeingScripted = null;

        self.open = false;
        openLast = false;

        reference = new ScriptingIDEReference(this, wickEditor);
        window.wickDocsKeywords = "";
        window.wickDocsKeyworksArray = [];
        window.wickDocs.forEach(function (doc) {
            doc.properties.forEach(function (prop) {
                window.wickDocsKeywords += prop.name.split('(')[0] + "|"
                window.wickDocsKeyworksArray.push(prop.name.split('(')[0]);
            });
        });
        reference.setup();

        var beautify = ace.require("ace/ext/beautify");
        var langTools = ace.require('ace/ext/language_tools');

        self.aceEditor = ace.edit("scriptEditor");
        self.aceEditor.setTheme("ace/theme/idle_fingers");
        self.aceEditor.getSession().setMode("ace/mode/javascript");
        self.aceEditor.$blockScrolling = Infinity;
        self.aceEditor.setAutoScrollEditorIntoView(true);
        self.aceEditor.setOptions({
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
        })
        self.aceEditor.completers = [{
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
        }];

        self.aceEditor.getSession().on('change', onChange);
        self.aceEditor.getSession().on("changeAnnotation", onChangeAnnotation);
        self.aceEditor.on('changeSelection', onChangeSelection);

        self.aceEditor.commands.addCommand({
            name: "...",
            exec: function() {
                self.open = false;
                self.syncWithEditorState();
            },
            bindKey: {mac: "`", win: "`"}
        })

        var resizer = document.getElementById('resizeScriptingGUIBar');
        resizer.resizing = false;
        resizer.addEventListener('mousedown', function (e) {
            if(self.open && !maximized){
                resizer.resizing = true;
            } else {
                self.open = true;
                self.clearError();
                self.syncWithEditorState();
            }

        });
        window.addEventListener('mousemove', function (e) {
            if(resizer.resizing) {
                var newIDEHeight = wickEditor.settings.scriptingIDEHeight - e.movementY;
                newIDEHeight = Math.max(newIDEHeight, 50);
                wickEditor.settings.setValue('scriptingIDEHeight', newIDEHeight)
                document.getElementById('scriptingGUI').style.height = wickEditor.settings.scriptingIDEHeight+'px';
                self.resize()
            }
        });
        window.addEventListener('mouseup', function (e) {
            resizer.resizing = false
        });

        self.resize = function () {
            self.aceEditor.resize();
        }

        window.addEventListener('resize', function(e) {
            self.resize();
        });
        self.resize();

        $("#closeScriptingGUIButton").on("click", function (e) {
            self.open = false;
            self.clearError();
            self.syncWithEditorState();
        });
        $("#openScriptingGUIButton").on("click", function (e) {
            self.open = true;
            self.clearError();
            self.syncWithEditorState();
        });

        $("#beautifyButton").on("click", function (e) {
            beautifyCode();
        });

        $("#expandScriptingGUIButton").on("click", function (e) {
            maximized = true;
            self.syncWithEditorState();
        });
        $("#minimizeScriptingGUIButton").on("click", function (e) {
            maximized = false;
            self.syncWithEditorState();
        });
        
    }

    this.syncWithEditorState = function () {
        oldObjectBeingScripting = objectBeingScripted;
        objectBeingScripted = wickEditor.project.getSelectedObject() || wickEditor.project.getCurrentFrame();

        updateHeaderText()

        if(this.open) {
            $("#scriptEditor").css('display', 'block');

            if(maximized) {
                document.getElementById('scriptingGUI').style.height = 'calc(100% - 24px)';
            } else {
                if(wickEditor.settings.scriptingIDEHeight < 50)
                    wickEditor.settings.scriptingIDEHeight = 50;
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

            if(objectBeingScripted && wickEditor.project.getNumSelectedObjects() < 2 && ((objectBeingScripted instanceof WickObject && !objectBeingScripted.isPath && !objectBeingScripted.isImage) || objectBeingScripted instanceof WickFrame)) {
                $("#noSelectionDiv").css('display', 'none');
                $("#scriptObjectDiv").css('display', 'block');

                var script = objectBeingScripted.wickScript;
                if(self.aceEditor.getValue() !== objectBeingScripted.wickScript)
                    self.aceEditor.setValue(script, -1);
            } else {
                $("#noSelectionDiv").css('display', 'block');
                $("#scriptObjectDiv").css('display', 'none');

                if(objectBeingScripted && objectBeingScripted.isPath) {
                    document.getElementById('noSelectionText').innerHTML = "Paths can't be scripted. <br />Group it, or convert it to a Clip or Button!";
                } else if(objectBeingScripted && objectBeingScripted.isImage) {
                    document.getElementById('noSelectionText').innerHTML = "Images can't be scripted. <br />Group it, or convert it to a Clip or Button!";
                } else if(wickEditor.project.getNumSelectedObjects() < 2) {
                    document.getElementById('noSelectionText').innerHTML = "No scriptable object selected!";
                } else {
                    document.getElementById('noSelectionText').innerHTML = "Multiple objects can't be scripted.<br />Group them, or convert them to a Clip or Button!";
                }
            }

        } else {
            $("#scriptEditor").css('display', 'none');
            $("#noSelectionDiv").css('display', 'none');
            $("#scriptingGUI").css('height', '24px');

            document.getElementById('expandScriptingGUIButton').style.display = 'none';
            document.getElementById('minimizeScriptingGUIButton').style.display = 'none';

            document.getElementById('closeScriptingGUIButton').style.display = 'none';
            document.getElementById('openScriptingGUIButton').style.display = 'block';

            document.getElementById('beautifyButton').style.display = 'none';
        }

        if(objectBeingScripted !== oldObjectBeingScripting) {
            self.aceEditor.getSession().setUndoManager(new ace.UndoManager())
        }

        if(openLast && !self.open) {
            document.activeElement.blur();
        }
        openLast = self.open;
    }

    self.displayError = function (obj, scriptError) {
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
    }

    self.clearError = function () {
        var framesAndObjects = (wickEditor.project.getAllFrames().concat(wickEditor.project.getAllObjects()));
        framesAndObjects.forEach(function (obj) {
            if(obj.scriptError && obj.scriptError.type === 'runtime') {
                obj.scriptError = null;
            }
        })
    }

    function onChange (e) {
        if(!objectBeingScripted) return;
            objectBeingScripted.wickScript = self.aceEditor.getValue();
    }

    function onChangeAnnotation (e) {
        if(objectBeingScripted && objectBeingScripted.scriptError && objectBeingScripted.scriptError.type === 'syntax')
            objectBeingScripted.scriptError = null;
        updateHeaderText()

        clearTimeout(changeAnnotationTimer);
        changeAnnotationTimer = setTimeout (function () {
            if(!self.open)return;

            var annot = self.aceEditor.getSession().getAnnotations();

            // Look for errors
            if(!objectBeingScripted) return;

            if(objectBeingScripted.scriptError && objectBeingScripted.scriptError.type === 'syntax')
                objectBeingScripted.scriptError = null;

            for (var key in annot){
                if (annot.hasOwnProperty(key)) {
                    if(annot[key].type === 'error') {
                        // There's a syntax error. Set the projectHasErrors flag so the project won't run.
                        //self.projectHasErrors = true;
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
    }

    function onChangeSelection () {
        var position = self.aceEditor.getCursorPosition();
        var token = self.aceEditor.session.getTokenAt(position.row, position.column);
        if(token) {
            reference.highlightPropButton(token.value);
        }
    }

    function beautifyCode () {
        var val = self.aceEditor.session.getValue();
        val = js_beautify(val);
        self.aceEditor.session.setValue(val);
        
        var row = self.aceEditor.session.getLength() - 1;
        var column = self.aceEditor.session.getLine(row).length;
        self.aceEditor.gotoLine(row + 1, column);
    }

    function updateHeaderText () {
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

}