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
    var modifierKeys = ["WINDOWS","COMMAND","FIREFOXCOMMAND","CTRL"];
    var shiftKeys = ["SHIFT"];

    /* Initialize list of GuiActions. */
    var guiActions = {};

    var activeElemIsTextBox = function () {
        var activeElem = document.activeElement.nodeName;
        editingTextBox = activeElem == 'TEXTAREA' || activeElem == 'INPUT';
        return editingTextBox;
    }

    var registerAction = function (name, hotkeys, elementIds, requiredParams, action) {
        guiActions[name] = new GuiAction(hotkeys, elementIds, requiredParams, action);
    }

    this.doAction = function (name) {
        guiActions[name].doAction({});
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
        if(this.hotkeys.indexOf("SHIFT") !== -1) {
            this.specialKeys.push("SHIFT");
            this.hotkeys.splice(this.hotkeys.indexOf("SHIFT"), 1);
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
    }

    /* For calling GUI actions manually */
    this.pressButton = function (id) {
        for(actionName in guiActions) {
            var guiAction = guiActions[actionName];
            if(guiAction.elementIds.indexOf(id) !== -1) {
                guiAction.doAction({});
            }
        };
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
            that.specialKeys["SHIFT"] = keyDownEvent;
            that.keys = [];
        } else {
            that.keys[event.keyCode] = keyDownEvent;
        }

        // get this outta here
        if(event.keyCode == 32 && eventType === 'keyup' && !activeElemIsTextBox()) {
            wickEditor.interfaces.fabric.useLastUsedTool();
            wickEditor.syncInterfaces();
        }

        for(actionName in guiActions) { (function () {
            var guiAction = guiActions[actionName];

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
        })()};
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

    // SPACE
    // Open Pan Tool
    registerAction('openPanTool',
        ['SPACE'], 
        [], 
        {}, 
        function(args) {
            if(!(wickEditor.interfaces.fabric.currentTool instanceof PanTool)) {
                wickEditor.interfaces.fabric.lastTool = wickEditor.interfaces.fabric.currentTool;
                wickEditor.interfaces.fabric.currentTool = wickEditor.interfaces.fabric.tools.pan;
                wickEditor.syncInterfaces();
            }
        });

    // ESC
    // Stop Running Project
    registerAction('stopRunningProject',
        ['ESC'], 
        [], 
        {builtinplayerRunning : true}, 
        function(args) {
            if(!wickEditor.interfaces.builtinplayer.running) return;
            wickEditor.interfaces.builtinplayer.stopRunningProject();
        });

    // Control + SHIFT + Z
    // Redo Action
    registerAction('redo',
        ['Modifier','SHIFT','Z'], 
        ['redoButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.redoAction();
        });

    // Control + Z
    // Undo Action
    registerAction('undo',
        ['Modifier','Z'], 
        ['undoButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.undoAction();
        });

    // Title
    // Open splash screen
    registerAction('openSplashScreen',
        [], 
        ['editorTitle'], 
        {}, 
        function(args) {
            wickEditor.interfaces.splashscreen.openSplashScreen();
        });

    // Control + ENTER
    // Run Project
    registerAction('runProject',
        ['Modifier','ENTER'], 
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
    registerAction('recenterCanvas',
        ['Modifier','0'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.recenterCanvas();
        });

    // Control + S
    // Save Project
    registerAction('saveProject',
        ['Modifier','S'], 
        [], 
        {usableInTextBoxes:true}, 
        function(args) {
            that.keys = [];
            that.specialKeys = [];
            wickEditor.project.saveInLocalStorage();
        });

    // Export Project
    registerAction('exportProject',
        ['Modifier','SHIFT','S'], 
        ['exportHTMLButton'], 
        {usableInTextBoxes:true}, 
        function(args) {
            that.keys = [];
            that.specialKeys = [];
            WickProjectExporter.exportProject(wickEditor.project);
        });

    // Control + O
    // Open File
    registerAction('openFile',
        ['Modifier','O'], 
        ['openProjectButton'], 
        {}, 
        function(args) {
            that.keys = [];
            $('#importButton').click();
        });

    // Control + A
    // Select All
    registerAction('selectAll',
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
    registerAction('moveSelectionUp',
        ['UP'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(0,-1);
        });

    // Down
    // Move current object down one pixel
    registerAction('moveSelectionDown',
        ['DOWN'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(0,1);
        });

    // LEFT
    // Move current object left one pixel
    registerAction('moveSelectionLeft',
        ['LEFT'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(-1,0);
        });

    // Right
    // Move current object right one pixel
    registerAction('moveSelectionRight',
        ['RIGHT'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(1,0);
        });

    // Modifier+UP
    // Move current object up ten pixels
    registerAction('moveSelectionUp10x',
        ['SHIFT', 'UP'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(0,-10);
        });

    // Modifier+Down
    // Move current object down ten pixels
    registerAction('moveSelectionDown10x',
        ['SHIFT', 'DOWN'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(0,10);
        });

    // Modifier+Left
    // Move current object left ten pixels
    registerAction('moveSelectionLeft10x',
        ['SHIFT', 'LEFT'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(-10,0);
        });

    // Modifier+Right
    // Move current object right ten pixels
    registerAction('moveSelectionRight10x',
        ['SHIFT', 'RIGHT'], 
        [], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.moveSelection(10,0);
        });

    // <
    // Move Playhead LEFT
    registerAction('movePlayheadLeft',
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
    registerAction('movePlayheadRight',
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
    // Move Down Layer
    registerAction('moveDownLayer',
        ['DOWN'], 
        [],
        {}, 
        function(args) {
            if(wickEditor.project.getCurrentObject().currentLayer < wickEditor.project.getCurrentObject().layers.length-1)
                wickEditor.project.getCurrentObject().currentLayer ++;
            wickEditor.syncInterfaces();
        });

    // BACKSPACE
    // Delete Selected Objects
    registerAction('deleteSelectedObjects',
        ['BACKSPACE'], 
        ['deleteButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction('deleteObjects', { 
                ids:wickEditor.interfaces['fabric'].getSelectedObjectIDs() 
            });
        });

    // Delete
    // Delete Selected Objects
    registerAction('deleteSelectedObjects2',
        ['DELETE'], 
        ['deleteButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction('deleteObjects', { 
                ids:wickEditor.interfaces['fabric'].getSelectedObjectIDs() 
            });
        });

    registerAction('copy',
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

    registerAction('cut',
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

    registerAction('paste',
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

    registerAction('newProject',
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

    registerAction('exportProjectAsJSON',
        [], 
        ['exportProjectAsJSONButton'], 
        {}, 
        function(args) {
            wickEditor.project.getAsJSON(function(JSONProject) {
                var blob = new Blob([JSONProject], {type: "text/plain;charset=utf-8"});
                saveAs(blob, "project.json");
            });
        });

    registerAction('saveProjectToLocalStorage',
        [], 
        ['saveProjectToLocalStorageButton'], 
        {}, 
        function(args) {
            wickEditor.project.saveInLocalStorage();
        });

    registerAction('useCursorTool',
        ['C'], 
        ['cursorToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.cursor);
        });

    registerAction('usePaintbrushTool',
        ['B'], 
        ['paintbrushToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.paintbrush);
        });

    registerAction('useFillBucketTool',
        ['F'], 
        ['fillbucketToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.fillbucket);
        });

    registerAction('useRectangleTool',
        ['R'], 
        ['rectangleToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.rectangle);
        });

    registerAction('useEllipseTool',
        ['E'], 
        ['ellipseToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.ellipse);
        });

    registerAction('useDropperTool',
        ['D'], 
        ['dropperToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.dropper);
        });

    registerAction('useTextTool',
        ['T'], 
        ['textToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.text);
        });

    registerAction('useZoomTool',
        ['Z'], 
        ['zoomToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.zoom);
        });

    registerAction('usePanTool',
        ['P'], 
        ['panToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.pan);
        });

    registerAction('useCropTool',
        [], 
        ['cropToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.crop);
        });

    registerAction('useBackgroundRemoveTool',
        [], 
        ['backgroundremoveToolButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.changeTool(wickEditor.interfaces.fabric.tools.backgroundremove);
        });

    registerAction('editScripts',
        [], 
        ['editScriptsButton', 'editSymbolScriptsButton', 'editScriptsButtonProperties'], 
        {}, 
        function(args) {
            var selectedObj = wickEditor.interfaces.fabric.getSelectedWickObject();
            console.log(selectedObj);
            wickEditor.interfaces['scriptingide'].editScriptsOfObject(selectedObj);
            wickEditor.syncInterfaces();
        });

    registerAction('editFrameScripts',
        [], 
        ['editFrameScriptsButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces.fabric.deselectAll();
            var selectedFrame = wickEditor.project.getCurrentObject().getCurrentFrame();
            wickEditor.interfaces['scriptingide'].editScriptsOfObject(selectedFrame);
            wickEditor.syncInterfaces();
        });

    registerAction('bringToFront',
        ['Modifier', "SHIFT", "UP"], 
        ['bringToFrontButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction('moveObjectToZIndex', { 
                ids: wickEditor.interfaces["fabric"].getSelectedObjectIDs(),
                newZIndex: wickEditor.project.getCurrentObject().getCurrentFrame().wickObjects.length
            });
            wickEditor.interfaces['fabric'].deselectAll();
        });

    registerAction('sendToBack',
        ['Modifier', "SHIFT", "DOWN"], 
        ['sendToBackButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction('moveObjectToZIndex', { 
                ids: wickEditor.interfaces["fabric"].getSelectedObjectIDs(),
                newZIndex: 0
            });
            wickEditor.interfaces['fabric'].deselectAll();
        });

    registerAction('flipHorizontally',
        [], 
        [], 
        {}, 
        function(args) {
            var selectedObjects = wickEditor.interfaces.fabric.getSelectedWickObjects();
            var selectedObjectIDs = [];
            var modifiedStates = [];

            selectedObjects.forEach(function (obj) {
                selectedObjectIDs.push(obj.id);
                modifiedStates.push({ 
                    flipX : !obj.flipX
                });
            });

            wickEditor.actionHandler.doAction('modifyObjects', { 
                ids: selectedObjectIDs, 
                modifiedStates: modifiedStates 
            });
        });

    registerAction('flipVertically',
        [], 
        [], 
        {}, 
        function(args) {
            var selectedObjects = wickEditor.interfaces.fabric.getSelectedWickObjects();
            var selectedObjectIDs = [];
            var modifiedStates = [];

            selectedObjects.forEach(function (obj) {
                selectedObjectIDs.push(obj.id);
                modifiedStates.push({ 
                    flipY : !obj.flipY
                });
            });
            
            wickEditor.actionHandler.doAction('modifyObjects', { 
                ids: selectedObjectIDs, 
                modifiedStates: modifiedStates 
            });
        });

    registerAction('editObject',
        [], 
        ['editObjectButton', 'editSymbolButton'], 
        {}, 
        function(args) {
            var selectedObject = wickEditor.interfaces.fabric.getSelectedWickObject();
            wickEditor.interfaces.fabric.symbolBorders.startEditObjectAnimation(selectedObject);
        });

    registerAction('finishEditingObject',
        [], 
        ['finishEditingObjectButton', 'finishEditingObjectFabricButton'], 
        {}, 
        function(args) {
            var currObj = wickEditor.project.getCurrentObject();
            wickEditor.interfaces.fabric.symbolBorders.startLeaveObjectAnimation(currObj);
        });

    registerAction('convertToSymbol',
        [], 
        ['convertToSymbolButton', 'createSymbolButton'], 
        {}, 
        function(args) {
            var fabCanvas = wickEditor.interfaces['fabric'].canvas;
            wickEditor.actionHandler.doAction('convertSelectionToSymbol', 
                {selection:fabCanvas.getActiveObject() || fabCanvas.getActiveGroup()}
            );
        });

    registerAction('breakApart',
        [], 
        ['breakApartButton'], 
        {}, 
        function(args) {
            var selectedObjectIDs = wickEditor.interfaces.fabric.getSelectedObjectIDs();
            wickEditor.actionHandler.doAction('breakApartSymbol', {id:selectedObjectIDs[0]} );
        });

    registerAction('downloadObject',
        [], 
        ['downloadButton'], 
        {}, 
        function(args) {
            wickEditor.interfaces['fabric'].getSelectedWickObject().downloadAsFile();
        });

    registerAction('addFrame',
        ['SHIFT', '='], 
        ['addFrameButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction('addNewFrame');
        });
    
    registerAction('deleteFrame',
        ['SHIFT', '-'], 
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

    registerAction('extendFrame',
        ['SHIFT', '.'], 
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

    registerAction('shrinkFrame',
        ['SHIFT', ','], 
        ['shrinkFrameButton'], 
        {}, 
        function(args) {
            var frame = wickEditor.project.getCurrentObject().getCurrentFrame();

            //var frameEndingIndex = wickEditor.project.getCurrentObject().getPlayheadPositionAtFrame(frame) + frame.frameLength - 1;
            //var framesToShrink = frameEndingIndex - wickEditor.project.getCurrentObject().playheadPosition;
            //framesToShrink = Math.max(1, framesToShrink)

            wickEditor.actionHandler.doAction('shrinkFrame', {   
                nFramesToShrinkBy: 1, 
                frame: frame
            });
        });

    registerAction('addLayer',
        [], 
        ['addLayerButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction('addNewLayer');
        });

    registerAction('removeLayer',
        [], 
        ['removeLayerButton'], 
        {}, 
        function(args) {
            wickEditor.actionHandler.doAction('removeLayer');
        });

    registerAction('addKeyframe',
        [], 
        ['addKeyframeButton'], 
        {}, 
        function(args) {
            var selectedObj = wickEditor.interfaces.fabric.getSelectedWickObject();
            var tween = WickTween.fromWickObjectState(selectedObj);
            tween.frame = selectedObj.parentObject.getRelativePlayheadPosition(selectedObj);
            selectedObj.tweens.push(tween);
        });

    registerAction('removeKeyframe',
        [], 
        ['removeKeyframeButton'], 
        {}, 
        function(args) {
            console.error("removeKeyframeButton action NYI")
        });

}