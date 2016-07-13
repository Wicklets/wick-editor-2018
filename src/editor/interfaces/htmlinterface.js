/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var HTMLInterface = function (wickEditor) {

    this.resize = function () {
        var GUIWidth = parseInt($("#timelineGUI").css("width")) / 2;
        $("#timelineGUI").css('left', (window.innerWidth/2 - GUIWidth)+'px');
    }

    this.syncWithEditorState = function () {

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
        wickEditor.exportProjectAsJSON();
    }

    document.getElementById('openProjectButton').onclick = function (e) {
        $('#importButton').click();
    }

    document.getElementById('exportHTMLButton').onclick = function (e) {
        wickEditor.exportProjectAsWebpage();
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
        document.getElementById('toolOptionsGUI').style.display = 'none';

        wickEditor.fabricInterface.canvas.isDrawingMode = false;
        wickEditor.fabricInterface.currentTool = "cursor";

        wickEditor.fabricInterface.addPaperSVGsTofabricInterface();
    });

    $('#paintbrushToolButton').on('click', function(e) {
        document.getElementById('toolOptionsGUI').style.display = 'block';

        wickEditor.fabricInterface.canvas.isDrawingMode = true;
        wickEditor.fabricInterface.currentTool = "paintbrush";

        wickEditor.fabricInterface.canvas.freeDrawingBrush = new fabric['PencilBrush'](wickEditor.fabricInterface.canvas);
        wickEditor.fabricInterface.canvas.freeDrawingBrush.color = lineColorEl.value;
        wickEditor.fabricInterface.canvas.freeDrawingBrush.width = parseInt(lineWidthEl.value, 10) || 1;
    });

    $('#eraserToolButton').on('click', function(e) {
        document.getElementById('toolOptionsGUI').style.display = 'block';

        wickEditor.fabricInterface.canvas.isDrawingMode = true;
        wickEditor.fabricInterface.currentTool = "eraser";

        wickEditor.fabricInterface.canvas.freeDrawingBrush = new fabric['PencilBrush'](wickEditor.fabricInterface.canvas);
        wickEditor.fabricInterface.canvas.freeDrawingBrush.color = lineColorEl.value;
        wickEditor.fabricInterface.canvas.freeDrawingBrush.width = parseInt(lineWidthEl.value, 10) || 1;
    });

    $('#fillBucketToolButton').on('click', function(e) {
        document.getElementById('toolOptionsGUI').style.display = 'none';

        wickEditor.fabricInterface.canvas.isDrawingMode = false;
        wickEditor.fabricInterface.currentTool = "fillbucket";
    });

    $('#textToolButton').on('click', function(e) {
        var newWickObject = WickObject.fromText('Click to edit text', wickEditor.currentObject);
        wickEditor.actionHandler.doAction('addWickObjectTofabricInterface', {wickObject:newWickObject});
    });

    $('#htmlSnippetToolButton').on('click', function(e) {
        
    });

    var lineWidthEl = document.getElementById('lineWidth');
    var lineColorEl = document.getElementById('lineColor');

    lineWidthEl.onchange = function() {
        wickEditor.fabricInterface.canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
    };

    lineColorEl.onchange = function() {
        wickEditor.fabricInterface.canvas.freeDrawingBrush.color = this.value;
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
        that.reloadScriptingGUI(wickEditor.fabricInterface.getActiveObject());
    });

    $("#onClickButton").on("click", function (e) {
        that.currentScript = 'onClick';
        that.reloadScriptingGUI(wickEditor.fabricInterface.getActiveObject());
    });

    $("#onUpdateButton").on("click", function (e) {
        that.currentScript = 'onUpdate';
        that.reloadScriptingGUI(wickEditor.fabricInterface.getActiveObject());
    });

    $("#onKeyDownButton").on("click", function (e) {
        that.currentScript = 'onKeyDown';
        that.reloadScriptingGUI(wickEditor.fabricInterface.getActiveObject());
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
        that.updateScriptsOnObject(wickEditor.fabricInterface.getActiveObject());
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
        
        var activeObj = wickEditor.fabricInterface.canvas.getActiveObject();

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

        var currentObject = wickEditor.project.getCurrentObject();
        console.log(currentObject)
        for(var i = 0; i < currentObject; i++) {

            var frame = currentObject.frames[i];

        // Create the span that holds all the stuff for each frame

            var frameContainer = document.createElement("span");
            frameContainer.className = "frameContainer";
            frameContainer.style.width = 20 * frame.frameLength + 'px';
            timeline.appendChild(frameContainer);

        // Create the frame element

            var frameDiv = document.createElement("span");
            frameDiv.id = "frame" + i;
            frameDiv.innerHTML = i;
            if(currentObject.currentFrame == i) {
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
            if(currentObject.frames[i].breakpoint) {
                breakpointDiv.className = "breakpointButton enabled";
            } else {
                breakpointDiv.className = "breakpointButton";
            }
            frameContainer.appendChild(breakpointDiv);

            // Add mousedown event to the breakpoint element so we toggle a breakpoint on that frame
            breakpointDiv.addEventListener("mousedown", function(index) {
                return function () {
                    var frame = currentObject.frames[index];
                    frame.breakpoint = !frame.breakpoint;
                    that.updateTimelineGUI(currentObject);
                };
            }(i), false);

        }
    }
    
    this.updateTimelineGUI();

/*********************
    Properties Box
*********************/

    $('#projectSizeX').on('input propertychange', function () {

        CheckInput.callIfPositiveInteger($('#projectSizeX').val(), function(n) {
            wickEditor.syncEditorWithfabricInterface();
            wickEditor.project.resolution.x = n;
            wickEditor.fabricInterface.resize();
            wickEditor.fabricInterface.syncWithEditor();
        });

    });

    $('#projectSizeY').on('input propertychange', function () {

        CheckInput.callIfPositiveInteger($('#projectSizeY').val(), function(n) {
            wickEditor.syncEditorWithfabricInterface();
            wickEditor.project.resolution.y = n;
            wickEditor.fabricInterface.resize();
            wickEditor.fabricInterface.syncWithEditor();
        });

    });

    $('#frameRate').on('input propertychange', function () {

        CheckInput.callIfPositiveInteger($('#frameRate').val(), function(n) {
            wickEditor.project.framerate = n;
        });

    });

    $('#frameIdentifier').on('input propertychange', function () {

         CheckInput.callIfString($('#frameIdentifier').val(), function(frameID) {
            wickEditor.currentObject.frames[wickEditor.currentObject.currentFrame].identifier = frameID;
        });

    });

    document.getElementById('fitScreenCheckbox').onclick = function (e) {
        wickEditor.project.fitScreen = this.checked;
    }

    document.getElementById('drawBordersCheckbox').onclick = function (e) {
        wickEditor.project.drawBorders = this.checked;
    }

    document.getElementById('projectBgColor').onchange = function () {
        wickEditor.project.backgroundColor = this.value;
        wickEditor.fabricInterface.syncWithEditorState();
    };

    $('#objectName').on('input propertychange', function () {
        var newName = $('#objectName').val();
        if(newName === '') {
            wickEditor.fabricInterface.getActiveObject().wickObject.name = undefined;
        } else {
            wickEditor.fabricInterface.getActiveObject().wickObject.name = $('#objectName').val();
        }
    });

    $('#objectPositionX').on('input propertychange', function () {

        wickEditor.fabricInterface.getActiveObject().wickObject.left = $('#objectPositionX').val();

    });

    $('#objectPositionY').on('input propertychange', function () {

        wickEditor.fabricInterface.getActiveObject().wickObject.top = $('#objectPositionY').val();

    });

    document.getElementById('opacitySlider').onchange = function () {
        wickEditor.fabricInterface.getActiveObject().opacity = this.value/255;
        wickEditor.fabricInterface.canvas.renderAll();
    };

    document.getElementById('fontSelector').onchange = function () {
        wickEditor.fabricInterface.getActiveObject().fontFamily = document.getElementById('fontSelector').value;
        wickEditor.fabricInterface.canvas.renderAll();
    }

    document.getElementById('fontColor').onchange = function () {
        wickEditor.fabricInterface.getActiveObject().fill = this.value;
        wickEditor.fabricInterface.canvas.renderAll();
    };

    document.getElementById('fontSize').onchange = function () {
        wickEditor.fabricInterface.getActiveObject().fontSize = this.value;
        wickEditor.fabricInterface.canvas.renderAll();
    };

    $('#htmlTextBox').on('input propertychange', function () {
        wickEditor.fabricInterface.getActiveObject().wickObject.htmlData = $('#htmlTextBox').val();
    });

/************************
       Tooltips
************************/

    $('.tooltipElem').on("mouseover", function(e) {
        $("#tooltipGUI").css('display', 'block');
        $("#tooltipGUI").css('top', wickEditor.mouse.y+5+'px');
        $("#tooltipGUI").css('left', wickEditor.mouse.x+5+'px');
        document.getElementById('tooltipGUI').innerHTML = e.currentTarget.attributes.alt.value;
    });

    $('.tooltipElem').on("mouseout", function(e) {
        $("#tooltipGUI").css('display', 'none');
    });

/************************
      Popup Window
************************/

    // TODO

/************************
    Right click menu
************************/

    $("#editScriptsButton").on("click", function (e) {
        wickEditor.htmlInterface.closeRightClickMenu();
        wickEditor.htmlInterface.openScriptingGUI(wickEditor.fabricInterface.getActiveObject());
    });

    $("#bringToFrontButton").on("click", function (e) {
        wickEditor.htmlInterface.closeRightClickMenu();
        
        var obj   = wickEditor.fabricInterface.canvas.getActiveObject();
        var group = wickEditor.fabricInterface.canvas.getActiveGroup();

        if(!obj && !group) {
            VerboseLog.log("Nothing to delete.");
            return;
        }

        wickEditor.actionHandler.doAction('bringObjectToFront', { obj:obj, group:group });
    });

    $("#sendToBackButton").on("click", function (e) {
        wickEditor.htmlInterface.closeRightClickMenu();

        var obj   = wickEditor.fabricInterface.canvas.getActiveObject();
        var group = wickEditor.fabricInterface.canvas.getActiveGroup();

        if(!obj && !group) {
            VerboseLog.log("Nothing to delete.");
            return;
        }

        wickEditor.actionHandler.doAction('sendObjectToBack', { obj:obj, group:group });
    });

    $("#deleteButton").on("click", function (e) {
        wickEditor.htmlInterface.closeRightClickMenu();
        wickEditor.actionHandler.doAction('delete', {
            obj:   wickEditor.fabricInterface.canvas.getActiveObject(),
            group: wickEditor.fabricInterface.canvas.getActiveGroup()
        });
    });

    $("#editObjectButton").on("click", function (e) {
        wickEditor.htmlInterface.closeRightClickMenu();

        var objectToEdit = wickEditor.fabricInterface.getActiveObject();
        wickEditor.actionHandler.doAction('editObject', {objectToEdit:objectToEdit});
    });

    $("#convertToSymbolButton").on("click", function (e) {
        wickEditor.htmlInterface.closeRightClickMenu();

        var fabCanvas = wickEditor.fabricInterface.canvas;
        wickEditor.actionHandler.doAction('convertSelectionToSymbol', 
            {selection:fabCanvas.getActiveObject() || fabCanvas.getActiveGroup()}
        );
    });

    $("#finishEditingObjectButton").on("click", function (e) {
        wickEditor.htmlInterface.closeRightClickMenu();
        
        wickEditor.actionHandler.doAction('finishEditingCurrentObject', {});
    });

    $("#downloadButton").on("click", function (e) {
        wickEditor.currentObject.getAsFile();
    });

    this.openRightClickMenu = function () {

        // Make rightclick menu visible
        $("#rightClickMenu").css('visibility', 'visible');
        // Attach it to the mouse
        $("#rightClickMenu").css('top', wickEditor.mouse.y+'px');
        $("#rightClickMenu").css('left', wickEditor.mouse.x+'px');

        // Hide everything
        $("#insideSymbolButtons").css('display', 'none');
        $("#symbolButtons").css('display', 'none');
        $("#staticObjectButtons").css('display', 'none');
        $("#commonObjectButtons").css('display', 'none');
        $("#frameButtons").css('display', 'none');

        // Selectively show portions we need depending on editor state

        var fabCanvas = wickEditor.fabricInterface.canvas;
        var selectedObject = fabCanvas.getActiveObject() || fabCanvas.getActiveGroup();

        if(!wickEditor.currentObject.isRoot) {
            $("#insideSymbolButtons").css('display', 'block');
        }
        if(selectedObject) {
            if(selectedObject.wickObject && selectedObject.wickObject.isSymbol) {
                $("#symbolButtons").css('display', 'block');
            } else {
                $("#staticObjectButtons").css('display', 'block');
            }
            $("#commonObjectButtons").css('display', 'block');
            
        } else {
            $("#frameButtons").css('display', 'block');
        }
    }

    this.closeRightClickMenu = function () {
        // Hide rightclick menu
        $("#rightClickMenu").css('visibility', 'hidden');
        $("#rightClickMenu").css('top', '0px');
        $("#rightClickMenu").css('left','0px');

        // Hide all buttons inside rightclick menu
        $("#symbolButtons").css('display', 'none');
        $("#staticObjectButtons").css('display', 'none');
        $("#commonObjectButtons").css('display', 'none');
        $("#frameButtons").css('display', 'none');
    }

/************************
    Properties menu
************************/
    
    // Lil' helper function because these properties must get updated for every type of object
    var updateObjectPropertiesGUI = function(selectedObj) {
        // Display Object properties tab
        $("#objectProperties").css('display', 'inline');

        // Set object properties GUI name 
        if(selectedObj.name) {
            document.getElementById('objectName').value = selectedObj.name;
        } else {
            document.getElementById('objectName').value = '';
        }
        
        // Set object properties GUI position
        document.getElementById('objectPositionX').value = selectedObj.x;
        document.getElementById('objectPositionY').value = selectedObj.y;
    };

    this.updatePropertiesGUI = function() {

        $("#projectProperties").css('display', 'none');
        $("#objectProperties").css('display', 'none');
        $("#textProperties").css('display', 'none');
        $("#soundProperties").css('display', 'none');
        $("#htmlSnippetProperties").css('display', 'none');

        var tab = 'project';

        var selectedObjIDs = wickEditor.fabricInterface.getSelectedObjectIDs();
        if(selectedObjIDs.length == 1) {
            var selectedObj = wickEditor.project.getCurrentObject().getChildByID(selectedObjIDs[0]);
            if(selectedObj.fontData) {
                tab = 'text';
            } else if (selectedObj.audioData) {
                tab = 'sound';
            } else if (selectedObj.htmlData) {
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
                document.getElementById('frameRate').value             = wickEditor.project.framerate;
                document.getElementById('fitScreenCheckbox').checked   = wickEditor.project.fitScreen;
                document.getElementById('drawBordersCheckbox').checked = wickEditor.project.drawBorders;
                $("#projectProperties").css('display', 'inline');
                break;
            case 'symbol':
                updateObjectPropertiesGUI(selectedObj);
                break;
            case 'text':
                updateObjectPropertiesGUI(selectedObj);
                $("#textProperties").css('display', 'inline');
                break;
            case 'sound':
                updateObjectPropertiesGUI(selectedObj);
                $("#soundProperties").css('display', 'inline');
                break;
            case 'htmlSnippet':
                updateObjectPropertiesGUI(selectedObj);
                $("#htmlSnippetProperties").css('display', 'inline');
                break;
        }
    };

    this.updatePropertiesGUI('project');

    this.showBuiltinPlayer = function () {
        document.getElementById("editor").style.display = "none";
        document.getElementById("builtinPlayer").style.display = "block";
        document.getElementById("paperCanvas").style.display = "block";
    }

    this.hideBuiltinPlayer = function () {
        document.getElementById("builtinPlayer").style.display = "none";
        document.getElementById("editor").style.display = "block";
        document.getElementById("paperCanvas").style.display = "none";
    }

/************************
      Builtin player
************************/

    $("#closeBuiltinPlayerButton").on("click", function (e) {
        that.hideBuiltinPlayer();
        WickPlayer.stopRunningCurrentProject();
    });

}
