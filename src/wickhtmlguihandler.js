var WickHTMLGUIHandler = function (wickEditor) {

    this.syncWithEditor = function () {

        var GUIWidth = parseInt($("#timelineGUI").css("width")) / 2;
        var timelineOffset = window.innerWidth/2 - GUIWidth;
        $("#timelineGUI").css('left', timelineOffset+'px');

        this.updateTimelineGUI();
        this.updatePropertiesGUI();

    }

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

    this.updateTimelineGUI = function () {

        var that = this;

        // Reset the timeline div
        var timeline = document.getElementById("timeline");
        timeline.innerHTML = "";
        timeline.style.width = wickEditor.currentObject.frames.length*23 + 6 + "px";

        for(var i = 0; i < wickEditor.currentObject.frames.length; i++) {

        // Create the span that holds all the stuff for each frame

            var frameContainer = document.createElement("span");
            frameContainer.className = "frameContainer";
            timeline.appendChild(frameContainer);

            var timeline = document.getElementById("timeline");

        // Create the frame element

            var frameDiv = document.createElement("span");
            frameDiv.id = "frame" + i;
            frameDiv.innerHTML = i;
            if(wickEditor.currentObject.currentFrame == i) {
                frameDiv.className = "timelineFrame active";
            } else {
                frameDiv.className = "timelineFrame";
            }
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
            wickEditor.syncFabricCanvasWithEditor();
        });

    });

    $('#projectSizeY').on('input propertychange', function () {

        testPositiveInteger($('#projectSizeY').val(), function(n) {
            wickEditor.syncEditorWithFabricCanvas();
            wickEditor.project.resolution.y = n;
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

    document.getElementById('drawBordersCheckbox').onclick = function (e) {
        wickEditor.project.drawBorders = this.checked;
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
    Right click menu
************************/

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

        var fabCanvas = wickEditor.fabricCanvas.getCanvas();
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
                document.getElementById('drawBordersCheckbox').checked = wickEditor.project.drawBorders;
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

}
