/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var WickHTMLGUIHandler = function (wickEditor) {

    this.syncWithEditor = function () {

        var GUIWidth = parseInt($("#timelineGUI").css("width")) / 2;
        var timelineOffset = window.innerWidth/2 - GUIWidth;
        $("#timelineGUI").css('left', timelineOffset+'px');

        this.updateTimelineGUI();
        this.updatePropertiesGUI();

    }

/********************
      Menu Bar
********************/

    document.getElementById('newProjectButton').onclick = function (e) {
        wickEditor.newProject();
    }

    document.getElementById('exportJSONButton').onclick = function (e) {
        wickEditor.saveProject();
    }

    document.getElementById('openProjectButton').onclick = function (e) {
        $('#importButton').click();
    }

    document.getElementById('exportHTMLButton').onclick = function (e) {
        wickEditor.exportProject();
    }

    document.getElementById('runButton').onclick = function (e) {
        wickEditor.runProject();
    }

    document.getElementById('importButton').onchange = function (e) {
        var that = this;

        var filePath = document.getElementById("importButton");
        if(filePath.files && filePath.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                wickEditor.openProject(e.target.result);
            };
            reader.readAsText(filePath.files[0]);
        }

        var importButton = $("importButton");
        importButton.replaceWith( importButton = importButton.clone( true ) );
    }

/********************
       Toolbar
********************/

    $('#mouseToolButton').on('click', function(e) {
        wickEditor.fabricCanvas.stopDrawingMode();
    });

    $('#paintbrushToolButton').on('click', function(e) {
        wickEditor.fabricCanvas.startDrawingMode();
    });

    $('#textToolButton').on('click', function(e) {
        var newWickObject = WickObject.fromText('Click to edit text', wickEditor.currentObject);
        wickEditor.actionHandler.doAction('addWickObjectToFabricCanvas', {wickObject:newWickObject});
    });

    $('#htmlSnippetToolButton').on('click', function(e) {
        
    });

    var lineWidthEl = document.getElementById('lineWidth');
    var lineColorEl = document.getElementById('lineColor');

    FabricCanvas.prototype.startDrawingMode = function() {
        document.getElementById('toolOptions').style.display = 'block';

        wickEditor.fabricCanvas.getCanvas().isDrawingMode = true;

        wickEditor.fabricCanvas.getCanvas().freeDrawingBrush = new fabric['PencilBrush'](wickEditor.fabricCanvas.getCanvas());
        wickEditor.fabricCanvas.getCanvas().freeDrawingBrush.color = lineColorEl.value;
        wickEditor.fabricCanvas.getCanvas().freeDrawingBrush.width = parseInt(lineWidthEl.value, 10) || 1;
    }

    FabricCanvas.prototype.stopDrawingMode = function() {
        document.getElementById('toolOptions').style.display = 'none';

        wickEditor.fabricCanvas.getCanvas().isDrawingMode = false;
    }

    lineWidthEl.onchange = function() {
        wickEditor.fabricCanvas.getCanvas().freeDrawingBrush.width = parseInt(this.value, 10) || 1;
    };

    lineColorEl.onchange = function() {
        wickEditor.fabricCanvas.getCanvas().freeDrawingBrush.color = this.value;
    };

/********************
    Scripting IDE
********************/

    this.aceEditor = ace.edit("scriptEditor");
    this.aceEditor.setTheme("ace/theme/chrome");
    this.aceEditor.getSession().setMode("ace/mode/javascript");
    this.aceEditor.$blockScrolling = Infinity; // Makes that weird message go away

    this.beautify = ace.require("ace/ext/beautify");

    this.scriptingIDEopen = false;

    this.currentScript = 'onLoad';

    this.projectHasErrors = false;

// GUI/Event handlers

    var that = this;

    $("#onLoadButton").on("click", function (e) {
        that.currentScript = 'onLoad';
        that.reloadScriptingGUI(wickEditor.fabricCanvas.getActiveObject());
    });

    $("#onClickButton").on("click", function (e) {
        that.currentScript = 'onClick';
        that.reloadScriptingGUI(wickEditor.fabricCanvas.getActiveObject());
    });

    $("#onUpdateButton").on("click", function (e) {
        that.currentScript = 'onUpdate';
        that.reloadScriptingGUI(wickEditor.fabricCanvas.getActiveObject());
    });

    $("#onKeyDownButton").on("click", function (e) {
        that.currentScript = 'onKeyDown';
        that.reloadScriptingGUI(wickEditor.fabricCanvas.getActiveObject());
    });

    $("#closeScriptingGUIButton").on("click", function (e) {
        that.closeScriptingGUI();
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
        that.updateScriptsOnObject(wickEditor.fabricCanvas.getActiveObject());
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

    this.openScriptingGUI = function (activeObj) {
        this.scriptingIDEopen = true;
        this.reloadScriptingGUI(activeObj);
        $("#scriptingGUI").css('visibility', 'visible');
    };

    this.closeScriptingGUI = function () {
        this.scriptingIDEopen = false;
        $("#scriptingGUI").css('visibility', 'hidden');
    };

    this.updateScriptsOnObject = function (activeObj) {
        activeObj.wickObject.wickScripts[this.currentScript] = this.aceEditor.getValue();
    }

    this.reloadScriptingGUI = function () {
        
        var activeObj = wickEditor.fabricCanvas.getCanvas().getActiveObject();

        if(!activeObj || !activeObj.wickObject) {
            this.closeScriptingGUI();
            return;
        }

        if(activeObj && activeObj.wickObject.wickScripts && activeObj.wickObject.wickScripts[this.currentScript]) {
            var script = activeObj.wickObject.wickScripts[this.currentScript];
            this.aceEditor.setValue(script, -1);
        }

        document.getElementById("onLoadButton").className = (this.currentScript == 'onLoad' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
        document.getElementById("onUpdateButton").className = (this.currentScript == 'onUpdate' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
        document.getElementById("onClickButton").className = (this.currentScript == 'onClick' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
        document.getElementById("onKeyDownButton").className = (this.currentScript == 'onKeyDown' ? "button buttonInRow activeScriptButton" : "button buttonInRow");
    };

/****************
    Timeline
****************/

    $("#addEmptyFrameButton").on("click", function (e) {
        wickEditor.actionHandler.doAction('addEmptyFrame', []);
    });

    $("#extendFrameButton").on("click", function (e) {
        wickEditor.actionHandler.doAction('extendFrame', {nFramesToExtendBy:1});
    });

    $("#shrinkFrameButton").on("click", function (e) {
        wickEditor.actionHandler.doAction('shrinkFrame', {nFramesToShrinkBy:1});
    });

    this.updateTimelineGUI = function () {

        var that = this;

        // Reset the timeline div
        var timeline = document.getElementById("timeline");
        timeline.innerHTML = "";
        timeline.style.width = 3000+'px';//wickEditor.currentObject.frames.length*100 + 6 + "px";

        for(var i = 0; i < wickEditor.currentObject.frames.length; i++) {

            var frame = wickEditor.currentObject.frames[i];

        // Create the span that holds all the stuff for each frame

            var frameContainer = document.createElement("span");
            frameContainer.className = "frameContainer";
            frameContainer.style.width = 20 * frame.frameLength + 'px';
            timeline.appendChild(frameContainer);

        // Create the frame element

            var frameDiv = document.createElement("span");
            frameDiv.id = "frame" + i;
            frameDiv.innerHTML = i;
            if(wickEditor.currentObject.currentFrame == i) {
                frameDiv.className = "timelineFrame active";
            } else {
                frameDiv.className = "timelineFrame";
            }
            frameDiv.style.width = 20 * frame.frameLength + 'px';
            frameContainer.appendChild(frameDiv);

            // Add mousedown event to the frame element so we can go to that frame when its clicked
            frameDiv.addEventListener("mousedown", function(index) {
                return function () {
                    wickEditor.actionHandler.doAction('gotoFrame', {toFrame : index});
                };
            }(i), false);

        // Create the breakpoint toggle element

            var breakpointDiv = document.createElement("span");
            if(wickEditor.currentObject.frames[i].breakpoint) {
                breakpointDiv.className = "breakpointButton enabled";
            } else {
                breakpointDiv.className = "breakpointButton";
            }
            frameContainer.appendChild(breakpointDiv);

            // Add mousedown event to the breakpoint element so we toggle a breakpoint on that frame
            breakpointDiv.addEventListener("mousedown", function(index) {
                return function () {
                    var frame = wickEditor.currentObject.frames[index];
                    frame.breakpoint = !frame.breakpoint;
                    that.updateTimelineGUI(wickEditor.currentObject);
                };
            }(i), false);

        }
    }
    
    this.updateTimelineGUI(wickEditor.currentObject);

/*********************
    Properties Box
*********************/

    var testPositiveInteger = function(n, setFunc) {
        var num = Number(n);
        if((typeof num === 'number') && (num % 1 == 0) && (num > 0)) {
            setFunc(num);
            console.log(wickEditor.project);
        }
    }

    $('#projectSizeX').on('input propertychange', function () {

        testPositiveInteger($('#projectSizeX').val(), function(n) {
            wickEditor.syncEditorWithFabricCanvas();
            wickEditor.project.resolution.x = n;
            wickEditor.fabricCanvas.resize();
            wickEditor.syncFabricCanvasWithEditor();
        });

    });

    $('#projectSizeY').on('input propertychange', function () {

        testPositiveInteger($('#projectSizeY').val(), function(n) {
            wickEditor.syncEditorWithFabricCanvas();
            wickEditor.project.resolution.y = n;
            wickEditor.fabricCanvas.resize();
            wickEditor.syncFabricCanvasWithEditor();
        });

    });

    $('#frameRate').on('input propertychange', function () {

        testPositiveInteger($('#frameRate').val(), function(n) {
            wickEditor.project.framerate = n;
        });

    });

    document.getElementById('fitScreenCheckbox').onclick = function (e) {
        wickEditor.project.fitScreen = this.checked;
    }

    document.getElementById('projectBgColor').onchange = function () {
        wickEditor.project.backgroundColor = this.value;
        wickEditor.fabricCanvas.setBackgroundColor(this.value);
    };

    $('#objectName').on('input propertychange', function () {
        var newName = $('#objectName').val();
        if(newName === '') {
            wickEditor.fabricCanvas.getActiveObject().wickObject.name = undefined;
        } else {
            wickEditor.fabricCanvas.getActiveObject().wickObject.name = $('#objectName').val();
        }
    });

    document.getElementById('opacitySlider').onchange = function () {
        wickEditor.fabricCanvas.getActiveObject().opacity = this.value/255;
        wickEditor.fabricCanvas.getCanvas().renderAll();
    };

    document.getElementById('fontSelector').onchange = function () {
        wickEditor.fabricCanvas.getActiveObject().fontFamily = document.getElementById('fontSelector').value;
        wickEditor.fabricCanvas.getCanvas().renderAll();
    }

    document.getElementById('fontColor').onchange = function () {
        wickEditor.fabricCanvas.getActiveObject().fill = this.value;
        wickEditor.fabricCanvas.getCanvas().renderAll();
    };

    document.getElementById('fontSize').onchange = function () {
        wickEditor.fabricCanvas.getActiveObject().fontSize = this.value;
        wickEditor.fabricCanvas.getCanvas().renderAll();
    };

    $('#htmlTextBox').on('input propertychange', function () {
        wickEditor.fabricCanvas.getActiveObject().wickObject.htmlData = $('#htmlTextBox').val();
    });

/************************
       Tooltips
************************/

    $('.tooltipElem').on("mouseover", function(e) {
        $("#tooltipGUI").css('visibility', 'visible');
        $("#tooltipGUI").css('top', wickEditor.mouse.y+5+'px');
        $("#tooltipGUI").css('left', wickEditor.mouse.x+5+'px');
        document.getElementById('tooltipGUI').innerHTML = e.currentTarget.attributes.alt.value;
    });

    $('.tooltipElem').on("mouseout", function(e) {
        $("#tooltipGUI").css('visibility', 'hidden');
    });

/************************
    Context menu
************************/

    webix.ui({
        view:"contextmenu",
        id:"context_menu",
        data:[
            { value:"Edit Scripts", id:"edit_scripts" },
            { value:"Bring to Front", id:"bring_to_front" },
            { value:"Send to Back", id:"send_to_back" },
            { value:"Delete", id:"delete" },
            { value:"Edit Object", id:"edit_object" },
            { value:"Convert to Symbol", id:"convert_to_symbol" },
            { value:"Finish Editing Object", id:"finish_editing_object" },
            { value:"Create MovieClip", id:"create_movie_clip" }
        ],
        on:{
            onItemClick:function(id){
                //var menu = this.getMenu(id);
                //webix.message(menu.getItem(id).value);
                if(id === "edit_scripts") {
                    wickEditor.htmlGUIHandler.openScriptingGUI(wickEditor.fabricCanvas.getActiveObject());
                } else if (id == "bring_to_front") {
                    VerboseLog.error("NYI");
                } else if (id == "send_to_back") {
                    VerboseLog.error("NYI");
                } else if (id == "delete") {
                    wickEditor.actionHandler.doAction('delete', {
                        obj:   wickEditor.fabricCanvas.getCanvas().getActiveObject(),
                        group: wickEditor.fabricCanvas.getCanvas().getActiveGroup()
                    });
                } else if (id == "edit_object") {
                    var objectToEdit = wickEditor.fabricCanvas.getActiveObject();
                    wickEditor.actionHandler.doAction('editObject', {objectToEdit:objectToEdit});
                } else if (id == "convert_to_symbol") {
                    wickEditor.htmlGUIHandler.closeRightClickMenu();

                    var fabCanvas = wickEditor.fabricCanvas.getCanvas();
                    wickEditor.actionHandler.doAction('convertSelectionToSymbol', 
                        {selection:fabCanvas.getActiveObject() || fabCanvas.getActiveGroup()}
                    );
                } else if (id == "finish_editing_object") {
                    wickEditor.actionHandler.doAction('finishEditingCurrentObject', {});
                } else if (id == "create_movie_clip") {
                    VerboseLog.error("NYI");
                }
            }
        },
        master:"editor"
    });
    var contextMenu = $$("context_menu");

    this.updateContextMenu = function () {
        var fabCanvas = wickEditor.fabricCanvas.getCanvas();
        var selectedObject = fabCanvas.getActiveObject() || fabCanvas.getActiveGroup();

        // Hide all items
        contextMenu.hideItem("edit_scripts");
        contextMenu.hideItem("bring_to_front");
        contextMenu.hideItem("send_to_back");
        contextMenu.hideItem("delete");
        contextMenu.hideItem("edit_object");
        contextMenu.hideItem("convert_to_symbol");
        contextMenu.hideItem("finish_editing_object");
        contextMenu.hideItem("create_movie_clip");

        // Selectively show items depending on editor state
        if(!wickEditor.currentObject.isRoot) {
            contextMenu.showItem("finish_editing_object");
        }
        if(selectedObject) {
            if(selectedObject.wickObject && selectedObject.wickObject.isSymbol) {
                contextMenu.showItem("edit_object");
            } else {
                contextMenu.showItem("convert_to_movie_clip");
            }
           contextMenu.showItem("bring_to_front");
           contextMenu.showItem("send_to_back");
           contextMenu.showItem("delete");
        } else {
            contextMenu.showItem("create_movie_clip");
        }
    }

    this.closeContextMenu = function () {
        contextMenu.hide();
    }

/************************
    Properties menu
************************/

    this.updatePropertiesGUI = function() {

        $("#projectProperties").css('display', 'none');
        $("#objectProperties").css('display', 'none');
        $("#textProperties").css('display', 'none');
        $("#htmlSnippetProperties").css('display', 'none');

        var tab = 'project';

        var newSelectedObject = wickEditor.fabricCanvas.getActiveObject();
        if(newSelectedObject) {
            if(newSelectedObject.wickObject.fontData) {
                tab = 'text';
            } else if (newSelectedObject.wickObject.htmlData) {
                tab = 'htmlSnippet';
            } else {
                tab = 'symbol';
            }
        }

        switch(tab) {
            case 'project':
                document.getElementById('projectBgColor').value        = wickEditor.project.backgroundColor;
                document.getElementById('projectSizeX').value          = wickEditor.project.resolution.x;
                document.getElementById('projectSizeY').value          = wickEditor.project.resolution.y;
                document.getElementById('frameRate').innerHTML         = wickEditor.project.framerate;
                document.getElementById('fitScreenCheckbox').checked   = wickEditor.project.fitScreen;
                $("#projectProperties").css('display', 'inline');
                break;
            case 'symbol':
                var name = wickEditor.fabricCanvas.getActiveObject().wickObject.name;
                if(name) {
                    document.getElementById('objectName').value = name;
                } else {
                    document.getElementById('objectName').value = '';
                }
                $("#objectProperties").css('display', 'inline');
                break;
            case 'text':

                $("#textProperties").css('display', 'inline');
                break;
            case 'htmlSnippet':

                $("#htmlSnippetProperties").css('display', 'inline');
                break;
        }

    };

    this.updatePropertiesGUI('project');

/************************
      Builtin player
************************/

    $("#closeBuiltinPlayerButton").on("click", function (e) {
        wickEditor.closeBuiltinPlayer();
    });

}
