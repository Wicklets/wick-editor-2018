/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/* GuiActionHandler.js - Abstraction for actions which may be performed through
    the WickEditor GUI. */

var GuiActionHandler = function (wickEditor) {

    var that = this;

    /* Set up vars needed for input listening. */
    this.keys = [];
    this.specialKeys = [];
    var editingTextBox = false;

    /* Define special keys */
    var modifierKeys = ["Windows","Command","FirefoxCommand","Ctrl"];
    var shiftKeys = ["Shift"];

    /* Initialize list of GuiActions. */
    var guiActions = [];

    var activeElemIsTextBox = function () {
        var activeElem = document.activeElement.nodeName;
        editingTextBox = activeElem == 'TEXTAREA' || activeElem == 'INPUT';
        return editingTextBox;
    }

    /* GuiAction definition. All possible actions performable through interacting 
    with the Wick Editor GUI are expected to be well defined by this structure .*/
    var GuiAction = function (hotkeys, elementIds, requiredParams, action) {

        var that = this;

        /* Function to be called when either a hotkey or element fires. */
        this.doAction = action;

        /* Options for special cases */
        this.requiredParams = requiredParams;

        /* Array of key strings which trigger the action function. */
        this.hotkeys = hotkeys;
        this.specialKeys = [];
        if(this.hotkeys.indexOf("Modifier") !== -1) {
            this.specialKeys.push("Modifier");
            this.hotkeys.splice(this.hotkeys.indexOf("Modifier"), 1);
        }
        if(this.hotkeys.indexOf("Shift") !== -1) {
            this.specialKeys.push("Shift");
            this.hotkeys.splice(this.hotkeys.indexOf("Shift"), 1);
        }

        /* Array of Wick Editor element ID's which trigger the action function. */
        this.elementIds = elementIds;
        this.elementIds.forEach(function (elementID) {
            if(!document.getElementById(elementID)) return;
            document.getElementById(elementID).onclick = function (e) {
                wickEditor.interfaces.rightclickmenu.open = false;
                that.doAction({});
            }
        });

        /* Check for DOMEvent in requiredParam */
        if(requiredParams.DOMEvent) {
            document.addEventListener(requiredParams.DOMEvent, function(event) {
                if(activeElemIsTextBox()) return;
                wickEditor.interfaces.rightclickmenu.open = false;
                event.preventDefault();
                focusHiddenArea();
                that.doAction({clipboardData:event.clipboardData});
            });
        }

        guiActions.push(this);
    }

    /* For calling GUI actions manually */
    this.pressButton = function (id) {
        guiActions.forEach(function(guiAction) {
            if(guiAction.elementIds.indexOf(id) !== -1) {
                guiAction.doAction({});
            }
        });
    }

/*************************
    Key listeners
*************************/

    // Fixes hotkey breaking bug
    $(window).focus(function() {
        that.keys = [];
        that.specialKeys = [];
    });
    $(window).blur(function() {
        that.keys = [];
        that.specialKeys = [];
    });

    document.body.addEventListener("keydown", function (event) {
        handleKeyEvent(event, "keydown");
    });
    document.body.addEventListener("keyup", function (event) {
        handleKeyEvent(event, "keyup");
    });

    var handleKeyEvent = function (event, eventType) {

        var keyChar = codeToKeyChar[event.keyCode];
        var keyDownEvent = eventType === 'keydown';
        if (modifierKeys.indexOf(keyChar) !== -1) {
            that.specialKeys["Modifier"] = keyDownEvent;
            that.keys = [];
        } else if (shiftKeys.indexOf(keyChar) !== -1) {
            that.specialKeys["Shift"] = keyDownEvent;
            that.keys = [];
        } else {
            that.keys[event.keyCode] = keyDownEvent;
        }

        // get this outta here
        if(event.keyCode == 32 && eventType === 'keyup' && !activeElemIsTextBox()) {
            wickEditor.interfaces.fabric.useLastUsedTool();
            wickEditor.syncInterfaces();
        }

        guiActions.forEach(function(guiAction) {

            if (wickEditor.interfaces.builtinplayer.running && !guiAction.requiredParams.builtinplayerRunning) return;

            var stringkeys = [];
            for (var numkey in that.keys) {
                if (that.keys.hasOwnProperty(numkey) && that.keys[numkey]) {
                    stringkeys.push(codeToKeyChar[numkey]);
                }
            }
            var stringspecialkeys = [];
            for (var numkey in that.specialKeys) {
                if (that.specialKeys.hasOwnProperty(numkey) && that.specialKeys[numkey]) {
                    stringspecialkeys.push(numkey);
                }
            }

            var cmpArrays = function (a,b) {
                return a.sort().join(',') === b.sort().join(',');
            }

            var hotkeysMatch = cmpArrays(guiAction.hotkeys, stringkeys)
            var specialKeysMatch = cmpArrays(guiAction.specialKeys, stringspecialkeys);

            if(!hotkeysMatch || !specialKeysMatch) return;
            if(guiAction.hotkeys.length === 0) return;
            if(activeElemIsTextBox() && !guiAction.requiredParams.usableInTextBoxes) return;

            wickEditor.interfaces.rightclickmenu.open = false;
            event.preventDefault();
            guiAction.doAction({});
            that.keys = [];
        });
    };

    // In order to ensure that the browser will fire clipboard events, we always need to have something selected
    var focusHiddenArea = function () {
        if($("#scriptingGUI").css('visibility') === 'hidden') {
            $("#hidden-input").val(' ');
            $("#hidden-input").focus().select();
        }
    }

/****************************
    GuiAction Definitions
*****************************/

    // Space
    // Open Pan Tool
    new GuiAction(
        ['Space'], 
        [], 
        {}, 
        function(args) {
            if(!(wickEditor.interfaces.fabric.currentTool instanceof PanTool)) {
                wickEditor.interfaces.fabric.lastTool = wickEditor.interfaces.fabric.currentTool;
                wickEditor.interfaces.fabric.currentTool = wickEditor.interfaces.fabric.tools.pan;
                wickEditor.syncInterfaces();
            }
        });

    // Esc
    // Stop Running Project
    new GuiAction(
        ['Esc'], 
        [], 
        {builtinplayerRunning : true}, 
        function(args) {
            if(!wickEditor.interfaces.builtinplayer.running) return;
            wickEditor.interfaces.builtinplayer.stopRunningProject();
        });

    // Control + Shift + Z
    // Redo Action
    new GuiAction(
        ['Modifier','Shift','Z'], 
        ['redoButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.redoAction();
        });

    // Control + Z
    // Undo Action
    new GuiAction(
        ['Modifier','Z'], 
        ['undoButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.undoAction();
        });

    // Title
    // Open splash screen
    new GuiAction(
        [], 
        ['editorTitle'], 
        {}, 
        function(args) {
            wickEditor.interfaces.splashscreen.openSplashScreen();
        });

    // Control + Enter
    // Run Project
    new GuiAction(
        ['Modifier','Enter'], 
        ['runButton'], 
        {}, 
        function(args) {
            that.keys = [];
            that.specialKeys = [];

            wickEditor.interfaces.statusbar.setState('saving');

            wickEditor.project.rootObject.getAllChildObjectsRecursive().forEach(function (child) {
                child.causedAnException = false;
            });
            wickEditor.interfaces.scriptingide.clearError();
            wickEditor.project.getAsJSON(function (JSONProject) {
                WickProject.saveProjectJSONInLocalStorage(JSONProject);
                wickEditor.interfaces.builtinplayer.runProject(JSONProject);
                wickEditor.interfaces.statusbar.setState('done');
            })
        });

    // Control + 0
    // Recenter Canvas
    new GuiAction(
        ['Modifier','0'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.recenterCanvas();
        });

    // Control + S
    // Save Project
    new GuiAction(
        ['Modifier','S'], 
        [], 
        {usableInTextBoxes:true}, 
        function(args) {
            that.keys = [];
            that.specialKeys = [];
            wickEditor.project.saveInLocalStorage();
        });

    // Export Project
    new GuiAction(
        ['Modifier','Shift','S'], 
        ['exportHTMLButton'], 
        {usableInTextBoxes:true}, 
        function(args) {
            that.keys = [];
            that.specialKeys = [];
            WickProjectExporter.exportProject(wickEditor.project);
        });

    // Control + O
    // Open File
    new GuiAction(
        ['Modifier','O'], 
        ['openProjectButton'], 
        {}, 
        function(args) {
            that.keys = [];
            $('#importButton').click();
        });

    // Control + A
    // Select All
    new GuiAction(
        ['Modifier','A'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.currentTool = wickEditor.interfaces.fabric.tools.cursor;
            wickEditor.syncInterfaces();
            wickEditor.interfaces['fabric'].deselectAll();
            wickEditor.interfaces['fabric'].selectAll();
        });

    // Up
    // Move current object up one pixel
    new GuiAction(
        ['Up'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(0,-1);
        });

    // Down
    // Move current object down one pixel
    new GuiAction(
        ['Down'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(0,1);
        });

    // Left
    // Move current object left one pixel
    new GuiAction(
        ['Left'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(-1,0);
        });

    // Right
    // Move current object right one pixel
    new GuiAction(
        ['Right'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(1,0);
        });

    // Modifier+Up
    // Move current object up ten pixels
    new GuiAction(
        ['Shift', 'Up'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(0,-10);
        });

    // Modifier+Down
    // Move current object down ten pixels
    new GuiAction(
        ['Shift', 'Down'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(0,10);
        });

    // Modifier+Left
    // Move current object left ten pixels
    new GuiAction(
        ['Shift', 'Left'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(-10,0);
        });

    // Modifier+Right
    // Move current object right ten pixels
    new GuiAction(
        ['Shift', 'Right'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(10,0);
        });

    // <
    // Move Playhead Left
    new GuiAction(
        [','], 
        [], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction("movePlayhead", {
                obj: wickEditor.project.getCurrentObject(),
                moveAmount: -1
            })
            wickEditor.syncInterfaces();
        });

    // >
    // Move Playhead Right
    new GuiAction(
        ['.'], 
        [], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction("movePlayhead", {
                obj: wickEditor.project.getCurrentObject(),
                moveAmount: 1
            })
            wickEditor.syncInterfaces();
        });

    // Down
    // Move Current Object Down Layer
    new GuiAction(
        ['Down'], 
        [],
        {}, 
        function(args) {
            if(wickEditor.project.getCurrentObject().currentLayer < wickEditor.project.getCurrentObject().layers.length-1)
                wickEditor.project.getCurrentObject().currentLayer ++;
            wickEditor.syncInterfaces();
        });

    // Backspace
    // Delete Selected Objects
    new GuiAction(
        ['Backspace'], 
        ['deleteButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction('deleteObjects', { 
                ids:wickEditor.interfaces['fabric'].getSelectedObjectIDs() 
            });
        });

    // Delete
    // Delete Selected Objects
    new GuiAction(
        ['Delete'], 
        ['deleteButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction('deleteObjects', { 
                ids:wickEditor.interfaces['fabric'].getSelectedObjectIDs() 
            });
        });


    new GuiAction(
        ['Modifier',"C"], 
        ['copyButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.rightclickmenu.open = false;
            that.keys = [];

            var clipboardData = window.polyfillClipboardData//(window.polyfillClipboardData || args.clipboardData);
            if(clipboardData) {
                clipboardData.setData('text/wickobjectsjson', wickEditor.project.getCopyData(wickEditor.interfaces['fabric'].getSelectedObjectIDs()));
            }
        });

    new GuiAction(
        ['Modifier',"X"], 
        ['cutButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.rightclickmenu.open = false;
            that.keys = [];

            var clipboardData = window.polyfillClipboardData//(window.polyfillClipboardData || args.clipboardData);
            if(clipboardData) {
                clipboardData.setData('text/wickobjectsjson', wickEditor.project.getCopyData(wickEditor.interfaces['fabric'].getSelectedObjectIDs()));
                wickEditor.actionHandler.doAction('deleteObjects', { ids:wickEditor.interfaces['fabric'].getSelectedObjectIDs() });
            }
        });

    new GuiAction(
        ['Modifier',"V"], 
        ['pasteButton'], 
        {},
        function(args) {
            wickEditor.interfaces.rightclickmenu.open = false;
            that.keys = [];

            var clipboardData = window.polyfillClipboardData//(window.polyfillClipboardData || args.clipboardData);
            if(!clipboardData) return;
            var items = clipboardData.items || clipboardData.types;

            for (i=0; i<items.length; i++) {

                var fileType = items[i].type || items[i];
                var file = clipboardData.getData(fileType);

                if(fileType === 'text/wickobjectsjson') {
                    var fileWickObject = WickObject.fromJSONArray(JSON.parse(file), function(objs) {
                        objs.forEach(function (obj) {
                            obj.selectOnAddToFabric = true;
                            obj.getAllChildObjectsRecursive().forEach(function (child) {
                                child.id = null;
                            });
                            //obj.x += 50;
                            //obj.y += 50;
                        })
                        wickEditor.actionHandler.doAction('addObjects', {
                            wickObjects:objs
                        });
                    });
                } else if (fileType === 'text/plain') {
                    var newObj = WickObject.fromText(file);
                    newObj.selectOnAddToFabric = true;
                    wickEditor.actionHandler.doAction('addObjects', {
                        wickObjects:[newObj]
                    });
                } else {
                    console.error("Pasting files with type " + fileType + "NYI.")
                }

            }
        });

    new GuiAction(
        [], 
        ['settingsButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces["settings"].open = true;
            wickEditor.syncInterfaces();
        });

    new GuiAction(
        [], 
        ['newProjectButton'], 
        {}, 
        function(args) {
            if(!confirm("Create a new project? All unsaved changes to the current project will be lost!")) {
                return;
            }
            wickEditor.project = new WickProject();
            localStorage.removeItem("wickProject");
            wickEditor.interfaces.fabric.recenterCanvas();
            wickEditor.syncInterfaces();
        });

    new GuiAction(
        [], 
        ['exportProjectAsJSONButton'], 
        {}, 
        function(args) {
            wickEditor.project.getAsJSON(function(JSONProject) {
                var blob = new Blob([JSONProject], {type: "text/plain;charset=utf-8"});
                saveAs(blob, "project.json");
            });
        });

    new GuiAction(
        [], 
        ['saveProjectToLocalStorageButton'], 
        {}, 
        function(args) {
            wickEditor.project.saveInLocalStorage();
        });

    new GuiAction(
        ['C'], 
        ['cursorToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.cursor);
        });

    new GuiAction(
        ['B'], 
        ['paintbrushToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.paintbrush);
        });

    new GuiAction(
        ['F'], 
        ['fillbucketToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.fillbucket);
        });

    new GuiAction(
        ['R'], 
        ['rectangleToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.rectangle);
        });

    new GuiAction(
        ['E'], 
        ['ellipseToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.ellipse);
        });

    new GuiAction(
        ['D'], 
        ['dropperToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.dropper);
        });

    new GuiAction(
        ['T'], 
        ['textToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.text);
        });

    new GuiAction(
        ['Z'], 
        ['zoomToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.zoom);
        });

    new GuiAction(
        ['P'], 
        ['panToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.pan);
        });

    new GuiAction(
        [], 
        ['cropToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.crop);
        });

    new GuiAction(
        [], 
        ['backgroundremoveToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.backgroundremove);
        });

    new GuiAction(
        [], 
        ['editScriptsButton', 'editSymbolScriptsButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces['scriptingide'].open = true;
            wickEditor.syncInterfaces();
        });

    new GuiAction(
        ['Modifier', "Shift", "Up"], 
        ['bringToFrontButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction('moveObjectToZIndex', { 
                ids: wickEditor.interfaces["fabric"].getSelectedObjectIDs(),
                newZIndex: wickEditor.project.getCurrentObject().getCurrentFrame().wickObjects.length
            });
            wickEditor.interfaces['fabric'].deselectAll();
        });

    new GuiAction(
        ['Modifier', "Shift", "Down"], 
        ['sendToBackButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction('moveObjectToZIndex', { 
                ids: wickEditor.interfaces["fabric"].getSelectedObjectIDs(),
                newZIndex: 0
            });
            wickEditor.interfaces['fabric'].deselectAll();
        });

    new GuiAction(
        [], 
        ['editObjectButton', 'editSymbolButton'], 
        {}, 
        function(args) {
            var selectedObject = wickEditor.interfaces.fabric.getSelectedWickObject();
            wickEditor.interfaces.fabric.symbolBorders.startEditObjectAnimation(selectedObject);
        });

    new GuiAction(
        [], 
        ['finishEditingObjectButton'], 
        {}, 
        function(args) {
            var currObj = wickEditor.project.getCurrentObject();
            wickEditor.interfaces.fabric.symbolBorders.startLeaveObjectAnimation(currObj);
        });

    new GuiAction(
        [], 
        ['convertToSymbolButton', 'createSymbolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.scriptingide.open = true;
            var fabCanvas = wickEditor.interfaces['fabric'].canvas;
            wickEditor.actionHandler.doAction('convertSelectionToSymbol', 
                {selection:fabCanvas.getActiveObject() || fabCanvas.getActiveGroup()}
            );
        });

    new GuiAction(
        [], 
        ['breakApartButton'], 
        {}, 
        function(args) {
            var selectedObjectIDs = wickEditor.interfaces.fabric.getSelectedObjectIDs();
            wickEditor.actionHandler.doAction('breakApartSymbol', {id:selectedObjectIDs[0]} );
        });

    new GuiAction(
        [], 
        ['downloadButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces['fabric'].getSelectedWickObject().downloadAsFile();
        });

    new GuiAction(
        [], 
        ['addFrameButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction('addNewFrame');
        });
    
    new GuiAction(
        [], 
        ['deleteFrameButton'], 
        {}, 
        function(args) {
            var currentObject = wickEditor.project.getCurrentObject();
            var frame = currentObject.getCurrentFrame();
            var layer = currentObject.getCurrentLayer();
            wickEditor.actionHandler.doAction('deleteFrame', {
                frame: frame,
                layer: layer
            });
        });

    new GuiAction(
        [], 
        ['extendFrameButton'], 
        {}, 
        function(args) {
            var frame = wickEditor.project.getCurrentObject().getCurrentFrame();
            if(!frame) {
                var frames = wickEditor.project.getCurrentObject().getCurrentLayer().frames;
                frame = frames[frames.length - 1];
            }

            var frameEndingIndex = wickEditor.project.getCurrentObject().getPlayheadPositionAtFrame(
                frame
            ) + frame.frameLength - 1;

            var framesToExtend = wickEditor.project.getCurrentObject().playheadPosition - frameEndingIndex;

            wickEditor.actionHandler.doAction('extendFrame', {
                nFramesToExtendBy: Math.max(1, framesToExtend),
                frame: frame
            });
        });

    new GuiAction(
        [], 
        ['shrinkFrameButton'], 
        {}, 
        function(args) {
            var frame = wickEditor.project.getCurrentObject().getCurrentFrame();

            var frameEndingIndex = wickEditor.project.getCurrentObject().getPlayheadPositionAtFrame(
                frame
            ) + frame.frameLength - 1;

            var framesToShrink = frameEndingIndex - wickEditor.project.getCurrentObject().playheadPosition;

            wickEditor.actionHandler.doAction('shrinkFrame', {   
                nFramesToShrinkBy: Math.max(1, framesToShrink), 
                frame: frame
            });
        });

    new GuiAction(
        [], 
        ['addLayerButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction('addNewLayer');
        });

    new GuiAction(
        [], 
        ['removeLayerButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction('removeLayer');
        });

    new GuiAction(
        [], 
        ['addBreakpointButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction('addBreakpoint', {
                frame: wickEditor.project.getCurrentObject().getCurrentFrame()
            });
        });

    new GuiAction(
        [], 
        ['removeBreakpointButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction('removeBreakpoint', {
                frame: wickEditor.project.getCurrentObject().getCurrentFrame()
            });
        });

    new GuiAction(
        [], 
        ['cropImageButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces['cropImageInterface'].open = true;
            wickEditor.syncInterfaces();
        });

    new GuiAction(
        [], 
        ['addKeyframeButton'], 
        {}, 
        function(args) {
            var selectedObj = wickEditor.interfaces.fabric.getSelectedWickObject();
            var tween = WickTween.fromWickObjectState(selectedObj);
            tween.frame = selectedObj.parentObject.getRelativePlayheadPosition(selectedObj);
            selectedObj.tweens.push(tween);
        });

    new GuiAction(
        [], 
        ['removeKeyframeButton'], 
        {}, 
        function(args) {
            console.error("removeKeyframeButton action NYI")
        });

}