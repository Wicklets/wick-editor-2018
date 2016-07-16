/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var HTMLInterface = function (wickEditor) {

    this.mouse = {};
    this.keys = [];

    this.resize = function () {
        var GUIWidth = parseInt($("#timelineGUI").css("width")) / 2;
        $("#timelineGUI").css('left', (window.innerWidth/2 - GUIWidth)+'px');
    }

    this.syncWithEditorState = function () {

        this.updateTimelineGUI();
        this.updatePropertiesGUI();
        this.updateRightClickMenuGUI();

    }

/********************
       Events
********************/

    var that = this;

    document.addEventListener('mousemove', function(e) { 
        that.mouse.x = e.clientX;
        that.mouse.y = e.clientY;
    }, false );

    VerboseLog.error("Send mouse events to fabric and paper here. Editor will prob have to store current tool to send events to proper places.");

    document.addEventListener('contextmenu', function (event) { 
        event.preventDefault();
    }, false);

    this.clearKeys = function () {
        that.keys = [];
    }

    document.body.addEventListener("keydown", function (event) {
        that.keys[event.keyCode] = true;

        var controlKeyDown = that.keys[91];
        var shiftKeyDown = that.keys[16];

        var editingTextBox = document.activeElement.nodeName == 'TEXTAREA'
                          || document.activeElement.nodeName == 'INPUT';

        if(!editingTextBox) {
            // Control-shift-z: redo
            if (event.keyCode == 90 && controlKeyDown && shiftKeyDown) {
                wickEditor.actionHandler.redoAction();    
            }
            // Control-z: undo
            else if (event.keyCode == 90 && controlKeyDown) {
                wickEditor.actionHandler.undoAction();
            }
        }

        // Control-s: save
        if (event.keyCode == 83 && controlKeyDown) {
            event.preventDefault();
            that.clearKeys();
            wickEditor.project.saveInLocalStorage();
        }
        // Control-o: open
        else if (event.keyCode == 79 && controlKeyDown) {
            event.preventDefault();
            that.clearKeys();
            $('#importButton').click();
        }

        // Control-a: Select all
        if (event.keyCode == 65 && controlKeyDown) {
            event.preventDefault();
            wickEditor.fabricInterface.deselectAll();
            wickEditor.fabricInterface.selectAll();
        }

        // Backspace: delete selected objects
        if (event.keyCode == 8 && !editingTextBox) {
            event.preventDefault();

            var ids = wickEditor.fabricInterface.getSelectedObjectIDs();
            if(ids.length == 0) {
                VerboseLog.log("Nothing to delete.");
                return;
            }

            wickEditor.actionHandler.doAction('deleteObjects', { ids:ids });
        }

        // Space: Pan viewport
        if (event.keyCode == 32 && !editingTextBox) {
            wickEditor.fabricInterface.panTo(
                that.mouse.x - window.innerWidth/2, 
                that.mouse.y - window.innerHeight/2);
        }

        // Tilde: log project state to canvas (for debugging)
        if (event.keyCode == 192) {
            console.log(wickEditor.project);
            console.log(wickEditor.project.rootObject);
            console.log(wickEditor.project.rootObject.frames[0].wickObjects);
            console.log(wickEditor.fabricInterface);
        }
    });

    document.body.addEventListener("keyup", function (event) {
        that.keys[event.keyCode] = false;
    });

    window.addEventListener('resize', function(e) {
        wickEditor.fabricInterface.resize();
        wickEditor.htmlInterface.resize();
        wickEditor.paperInterface.resize();
    }, false);

    // Setup leave page warning
    window.addEventListener("beforeunload", function (event) {
        var confirmationMessage = 'Warning: All unsaved changes will be lost!';
        (event || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    });

    // In order to ensure that the browser will fire clipboard events, we always need to have something selected
    var focusHiddenArea = function () {
        if($("#scriptingGUI").css('visibility') === 'hidden') {
            $("#hidden-input").val(' ');
            $("#hidden-input").focus().select();
        }
    }

    document.addEventListener("copy", function(event) {

        that.clearKeys();

        // Don't try to copy from the fabric canvas if user is editing text
        if(document.activeElement.nodeName == 'TEXTAREA' || wickEditor.htmlInterface.scriptingIDEopen) {
            return;
        }

        // Make sure an element is focused so that copy event fires properly
        event.preventDefault();
        //focusHiddenArea();

        event.clipboardData.setData('text/wickobjectsjson', wickEditor.getCopyData());
    });

    document.addEventListener("cut", function(event) {
        VerboseLog.error('cut NYI');
    });

    document.addEventListener("paste", function(event) {

        that.clearKeys();

        if(document.activeElement.nodeName === 'TEXTAREA' || wickEditor.htmlInterface.scriptingIDEopen) {
            return;
        }

        event.preventDefault();
        //focusHiddenArea();
        
        var clipboardData = event.clipboardData;
        var items = clipboardData.items;

        for (i=0; i<items.length; i++) {

            var fileType = items[i].type;
            var file = clipboardData.getData(items[i].type);

            if(fileType === 'text/wickobjectsjson') {
                var fileWickObject = WickObject.fromJSONArray(JSON.parse(file), function(objs) {
                    wickEditor.actionHandler.doAction('addObjects', {wickObjects:objs});
                });
            } else {
                var fileWickObject = WickObject.fromFile(file, fileType, function(obj) {
                    wickEditor.actionHandler.doAction('addObjects', {wickObjects:[obj]});
                });
            }

        }
    });

    $("#editorCanvasContainer").on('drop', function(e) {
        // prevent browser from opening the file
        e.stopPropagation();
        e.preventDefault();

        var files = e.originalEvent.dataTransfer.files;

        // Retrieve uploaded files data
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var fileType = file.type;

            var fileWickObject = WickObject.fromFile(file, fileType, function(obj) {
                wickEditor.actionHandler.doAction('addObjects', {wickObjects:[obj]});
            });
        }

        return false;
    });

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
        var newWickObject = WickObject.fromText('Click to edit text');
        newWickObject.x = wickEditor.project.resolution.x/2 - newWickObject.width /2;
        newWickObject.y = wickEditor.project.resolution.y/2 - newWickObject.height/2;
        wickEditor.actionHandler.doAction('addObjects', {wickObjects:[newWickObject]});
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
        that.reloadScriptingGUI();
    });

    $("#onClickButton").on("click", function (e) {
        that.currentScript = 'onClick';
        that.reloadScriptingGUI();
    });

    $("#onUpdateButton").on("click", function (e) {
        that.currentScript = 'onUpdate';
        that.reloadScriptingGUI();
    });

    $("#onKeyDownButton").on("click", function (e) {
        that.currentScript = 'onKeyDown';
        that.reloadScriptingGUI();
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

    this.openScriptingGUI = function () {
        this.scriptingIDEopen = true;
        this.reloadScriptingGUI();
        $("#scriptingGUI").css('visibility', 'visible');
    };

    this.closeScriptingGUI = function () {
        this.scriptingIDEopen = false;
        $("#scriptingGUI").css('visibility', 'hidden');
    };

    this.reloadScriptingGUI = function () {
        
        var selectedObj = wickEditor.getSelectedWickObject();

        if(!selectedObj) {
            this.closeScriptingGUI();
            return;
        }

        if(selectedObj.wickScripts[this.currentScript]) {
            var script = selectedObj.wickScripts[this.currentScript];
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
        for(var i = 0; i < currentObject.frames.length; i++) {

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
        $("#tooltipGUI").css('top', that.mouse.y+5+'px');
        $("#tooltipGUI").css('left', that.mouse.x+5+'px');
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
        wickEditor.htmlInterface.openScriptingGUI();
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

        var selectedObject = wickEditor.getSelectedWickObject();
        wickEditor.actionHandler.doAction('editObject', {objectToEdit:selectedObject});
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
        $("#rightClickMenu").css('display', 'block');
        // Attach it to the mouse
        $("#rightClickMenu").css('top', that.mouse.y+'px');
        $("#rightClickMenu").css('left', that.mouse.x+'px');

    }

    this.closeRightClickMenu = function () {
        // Hide rightclick menu
        $("#rightClickMenu").css('display', 'none');
        $("#rightClickMenu").css('top', '0px');
        $("#rightClickMenu").css('left','0px');
    }

    this.updateRightClickMenuGUI = function () {

        // Hide everything
        $("#insideSymbolButtons").css('display', 'none');
        $("#symbolButtons").css('display', 'none');
        $("#staticObjectButtons").css('display', 'none');
        $("#singleObjectButtons").css('display', 'none');
        $("#commonObjectButtons").css('display', 'none');
        $("#frameButtons").css('display', 'none');

        // Selectively show portions we need depending on editor state

        var selectedSingleObject = wickEditor.getSelectedWickObject();
        var currentObject = wickEditor.project.getCurrentObject();

        var multiObjectSelection = wickEditor.fabricInterface.getSelectedObjectIDs().length > 1;

        if(!currentObject.isRoot) {
            $("#insideSymbolButtons").css('display', 'block');
        }

        if(selectedSingleObject) {
            $("#singleObjectButtons").css('display', 'block');

            if(selectedSingleObject.isSymbol) {
                $("#symbolButtons").css('display', 'block');
            } else {
                $("#staticObjectButtons").css('display', 'block');
            }
            $("#commonObjectButtons").css('display', 'block');
        } else {
            $("#frameButtons").css('display', 'block');
        }

        if(multiObjectSelection) {
            $("#staticObjectButtons").css('display', 'block');
        }

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

        var selectedObj = wickEditor.getSelectedWickObject();
        if(selectedObj) {
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

/************************
      Init sync
************************/

    wickEditor.fabricInterface.resize();
    this.resize();
    wickEditor.paperInterface.resize();
    
    wickEditor.fabricInterface.syncWithEditorState();
    this.syncWithEditorState();
    wickEditor.paperInterface.syncWithEditorState();

}
