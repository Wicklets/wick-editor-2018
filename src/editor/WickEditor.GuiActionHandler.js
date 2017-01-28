/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/* GuiActionHandler.js - Abstraction for actions which may be performed through
    the WickEditor GUI. Don't add routines that aren't supposed to be undone or
    redone, add those to WickActionHandler. */

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

    this.doAction = function (name, args) {
        if(args) 
            guiActions[name].doAction(args);
        else
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
                wickEditor.rightclickmenu.open = false;
                that.doAction({});
            }
        });

        /* Check for DOMEvent in requiredParam */
        if(requiredParams.DOMEvent) {
            document.addEventListener(requiredParams.DOMEvent, function(event) {
                if(activeElemIsTextBox()) return;
                wickEditor.rightclickmenu.open = false;
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
            wickEditor.fabric.useLastUsedTool();
            wickEditor.syncInterfaces();
        }

        for(actionName in guiActions) { (function () {
            var guiAction = guiActions[actionName];

            if (wickEditor.builtinplayer.running && !guiAction.requiredParams.builtinplayerRunning) return;

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

            wickEditor.rightclickmenu.open = false;
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
    registerAction('openTools.Pan',
        ['SPACE'],
        [],
        {},
        function(args) {
            if(!(wickEditor.fabric.currentTool instanceof Tools.Pan)) {
                wickEditor.fabric.lastTool = wickEditor.fabric.currentTool;
                wickEditor.fabric.currentTool = wickEditor.fabric.tools.pan;
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
            if(!wickEditor.builtinplayer.running) return;
            wickEditor.builtinplayer.stopRunningProject();
        });

    // Control + SHIFT + Z
    // Redo Action
    registerAction('redo',
        ['Modifier','SHIFT','Z'],
        ['redoButton'],
        {},
        function(args) {
            wickEditor.actionHandler.redoAction();
            wickEditor.syncInterfaces();
        });

    // Control + Z
    // Undo Action
    registerAction('undo',
        ['Modifier','Z'],
        ['undoButton'],
        {},
        function(args) {
            wickEditor.actionHandler.undoAction();
            wickEditor.syncInterfaces();
        });

    // Title
    // Open splash screen
    registerAction('openSplashScreen',
        [],
        ['editorTitle'],
        {},
        function(args) {
            wickEditor.splashscreen.openSplashScreen();
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

            wickEditor.statusbar.setState('saving');

            wickEditor.project.rootObject.getAllChildObjectsRecursive().forEach(function (child) {
                child.causedAnException = false;
            });
            wickEditor.scriptingide.clearError();
            wickEditor.project.getAsJSON(function (JSONProject) {
                WickProject.saveProjectJSONInLocalStorage(JSONProject);
                wickEditor.builtinplayer.runProject(JSONProject);
                wickEditor.statusbar.setState('done');
            })
        });

    // Control + 0
    // Recenter Canvas
    registerAction('recenterCanvas',
        ['Modifier','0'],
        [],
        {},
        function(args) {
            wickEditor.fabric.recenterCanvas();
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
            WickProject.Exporter.exportProject(wickEditor.project);
        });

    // Export Project as .zip
    registerAction('exportProjectZIP',
        [],
        [],
        {usableInTextBoxes:true},
        function(args) {
            that.keys = [];
            that.specialKeys = [];
            WickProject.Exporter.exportProject(wickEditor.project, {zipped:true});
        });

    // Export project as animated GIF
    registerAction('exportProjectGIF',
        [],
        [],
        {},
        function (args) {
            wickEditor.fabric.projectRenderer.renderProjectAsGIF(function (blob) {
                window.open(URL.createObjectURL(blob));
            });
        });

    // Export project as WebM
    registerAction('exportProjectWebM',
        [],
        [],
        {},
        function (args) {
            wickEditor.fabric.projectRenderer.renderProjectAsWebM(function () {
                
            });
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
            wickEditor.fabric.currentTool = wickEditor.fabric.tools.cursor;
            wickEditor.syncInterfaces();
            wickEditor.fabric.deselectAll();
            wickEditor.fabric.selectAll();
        });

    // Up
    // Move current object up one pixel
    registerAction('moveSelectionUp',
        ['UP'],
        [],
        {},
        function(args) {
            wickEditor.fabric.moveSelection(0,-1);
        });

    // Down
    // Move current object down one pixel
    registerAction('moveSelectionDown',
        ['DOWN'],
        [],
        {},
        function(args) {
            wickEditor.fabric.moveSelection(0,1);
        });

    // LEFT
    // Move current object left one pixel
    registerAction('moveSelectionLeft',
        ['LEFT'],
        [],
        {},
        function(args) {
            wickEditor.fabric.moveSelection(-1,0);
        });

    // Right
    // Move current object right one pixel
    registerAction('moveSelectionRight',
        ['RIGHT'],
        [],
        {},
        function(args) {
            wickEditor.fabric.moveSelection(1,0);
        });

    // Modifier+UP
    // Move current object up ten pixels
    registerAction('moveSelectionUp10x',
        ['SHIFT', 'UP'],
        [],
        {},
        function(args) {
            wickEditor.fabric.moveSelection(0,-10);
        });

    // Modifier+Down
    // Move current object down ten pixels
    registerAction('moveSelectionDown10x',
        ['SHIFT', 'DOWN'],
        [],
        {},
        function(args) {
            wickEditor.fabric.moveSelection(0,10);
        });

    // Modifier+Left
    // Move current object left ten pixels
    registerAction('moveSelectionLeft10x',
        ['SHIFT', 'LEFT'],
        [],
        {},
        function(args) {
            wickEditor.fabric.moveSelection(-10,0);
        });

    // Modifier+Right
    // Move current object right ten pixels
    registerAction('moveSelectionRight10x',
        ['SHIFT', 'RIGHT'],
        [],
        {},
        function(args) {
            wickEditor.fabric.moveSelection(10,0);
        });

    // <
    // Move Playhead LEFT
    registerAction('movePlayheadLeft',
        [','],
        [],
        {},
        function(args) {
            wickEditor.actionHandler.doAction("movePlayhead", {
                obj: wickEditor.project.currentObject,
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
                obj: wickEditor.project.currentObject,
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
            if(wickEditor.project.currentObject.currentLayer < wickEditor.project.currentObject.layers.length-1)
                wickEditor.project.currentObject.currentLayer ++;
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
                wickObjects:wickEditor.fabric.getSelectedObjects()
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
                wickObjects:wickEditor.fabric.getSelectedObjects()
            });
        });

    var copyKeys  = isChrome ? [] : ['Modifier',"C"];
    var cutKeys   = isChrome ? [] : ['Modifier',"X"];
    var pasteKeys = isChrome ? [] : ['Modifier',"V"];

    registerAction('copy',
        copyKeys,
        ['copyButton'],
        {},
        function(args) {
            wickEditor.rightclickmenu.open = false;
            that.keys = [];

            //if(!isChrome) {
                polyfillClipboardData.setData('text/wickobjectsjson', wickEditor.project.getCopyData(wickEditor.fabric.getSelectedObjects(WickObject)));
            //}

            wickEditor.syncInterfaces();
        });

    registerAction('cut',
        cutKeys,
        ['cutButton'],
        {},
        function(args) {
            wickEditor.rightclickmenu.open = false;
            that.keys = [];

            //if(!isChrome) {
                polyfillClipboardData.setData('text/wickobjectsjson', wickEditor.project.getCopyData(wickEditor.fabric.getSelectedObjects(WickObject)));
            //}

            wickEditor.actionHandler.doAction('deleteObjects', { 
                wickObjects:wickEditor.fabric.getSelectedObjects(WickObject) 
            });

            wickEditor.syncInterfaces();
        });

    registerAction('paste',
        pasteKeys,
        ['pasteButton'],
        {},
        function(args) {
            wickEditor.rightclickmenu.open = false;
            that.keys = [];

            var clipboardData = window.polyfillClipboardData//(window.polyfillClipboardData || args.clipboardData);
            if(args.clipboardData) clipboardData = args.clipboardData;
            if(!clipboardData) return;
            var items = clipboardData.items || clipboardData.types;

            for (i=0; i<items.length; i++) {

                var fileType = items[i].type || items[i];
                var file = clipboardData.getData(fileType);
                
                if(fileType === 'text/wickobjectsjson') {
                    var fileWickObject = WickObject.fromJSONArray(JSON.parse(file), function(objs) {
                        objs.forEach(function (obj) {
                            obj.getAllChildObjectsRecursive().forEach(function (child) {
                                child.uuid = null;
                            });
                        });
                        wickEditor.actionHandler.doAction('addObjects', {
                            wickObjects:objs
                        });
                    });
                /*} else if (fileType === 'text/plain') {
                    var newObj = WickObject.fromText(file);
                    newObj.x = wickEditor.project.width/2;
                    newObj.y = wickEditor.project.height/2;
                    wickEditor.actionHandler.doAction('addObjects', {
                        wickObjects:[newObj]
                    });*/
                } else if (fileType.includes('image')) {
                    //console.log(items[i])
                    reader = new FileReader();
                    reader.onload = function(evt) {
                        //console.log(evt.target.result)
                        WickObject.fromImage(evt.target.result, function (newObj) {
                            newObj.x = wickEditor.project.width/2;
                            newObj.y = wickEditor.project.height/2;
                            wickEditor.actionHandler.doAction('addObjects', {
                                wickObjects:[newObj]
                            });
                        });
                    };
                    reader.readAsDataURL(items[i].getAsFile());
                } else {
                    console.error("Pasting files with type " + fileType + "NYI.")
                }

            }

            wickEditor.syncInterfaces();
        });

    registerAction('newProject',
        [],
        ['newProjectButton'],
        {},
        function(args) {
            if(!confirm("Create a new project? All unsaved changes to the current project will be lost!")) {
                return;
            }
            wickEditor.actionHandler.clearHistory();
            wickEditor.project = new WickProject();
            localStorage.removeItem("wickProject");
            wickEditor.fabric.recenterCanvas();
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

    registerAction('useTools.Cursor',
        [/*'C'*/],
        ['cursorToolButton'],
        {},
        function(args) {
            wickEditor.fabric.changeTool(wickEditor.fabric.tools.cursor);
        });

    registerAction('useTools.Paintbrush',
        [/*'B'*/],
        ['paintbrushToolButton'],
        {},
        function(args) {
            wickEditor.fabric.changeTool(wickEditor.fabric.tools.paintbrush);
        });

    registerAction('useTools.Eraser',
        [],
        ['eraserToolButton'],
        {},
        function(args) {
            wickEditor.fabric.changeTool(wickEditor.fabric.tools.eraser);
        });

    registerAction('useTools.FillBucket',
        [/*'F'*/],
        ['fillbucketToolButton'],
        {},
        function(args) {
            wickEditor.fabric.changeTool(wickEditor.fabric.tools.fillbucket);
        });

    registerAction('useTools.Rectangle',
        [/*'R'*/],
        ['rectangleToolButton'],
        {},
        function(args) {
            wickEditor.fabric.changeTool(wickEditor.fabric.tools.rectangle);
        });

    registerAction('useTools.Ellipse',
        [/*'E'*/],
        ['ellipseToolButton'],
        {},
        function(args) {
            wickEditor.fabric.changeTool(wickEditor.fabric.tools.ellipse);
        });

    registerAction('useTools.Dropper',
        [/*'D'*/],
        ['dropperToolButton'],
        {},
        function(args) {
            wickEditor.fabric.changeTool(wickEditor.fabric.tools.dropper);
        });

    registerAction('useTools.Text',
        [/*'T'*/],
        ['textToolButton'],
        {},
        function(args) {
            wickEditor.fabric.changeTool(wickEditor.fabric.tools.text);
        });

    registerAction('useTools.Zoom',
        [/*'Z'*/],
        ['zoomToolButton'],
        {},
        function(args) {
            wickEditor.fabric.changeTool(wickEditor.fabric.tools.zoom);
        });

    registerAction('useTools.Pan',
        [/*'P'*/],
        ['panToolButton'],
        {},
        function(args) {
            wickEditor.fabric.changeTool(wickEditor.fabric.tools.pan);
        });

    registerAction('useTools.Crop',
        [],
        ['cropToolButton'],
        {},
        function(args) {
            wickEditor.fabric.changeTool(wickEditor.fabric.tools.crop);
        });

    registerAction('useTools.BackgroundRemove',
        [],
        ['backgroundremoveToolButton'],
        {},
        function(args) {
            wickEditor.fabric.changeTool(wickEditor.fabric.tools.backgroundremove);
        });

    registerAction('editScripts',
        [],
        ['editScriptsButton', 'editSymbolScriptsButton', 'editScriptsButtonProperties'],
        {},
        function(args) {
            var selectedObj = wickEditor.fabric.getSelectedObject(WickObject);
            wickEditor.scriptingide.editScriptsOfObject(selectedObj);
            wickEditor.syncInterfaces();
        });

    registerAction('editFrameScripts',
        [],
        ['editFrameScriptsButton', 'editFrameScriptsRightClick'],
        {},
        function(args) {
            wickEditor.fabric.deselectAll();
            var selectedFrame = wickEditor.project.currentObject.getCurrentFrame();
            wickEditor.scriptingide.editScriptsOfObject(selectedFrame);
            wickEditor.syncInterfaces();
        });

    registerAction('bringToFront',
        ['Modifier', "SHIFT", "UP"],
        ['bringToFrontButton'],
        {},
        function(args) {
            wickEditor.actionHandler.doAction('moveObjectToZIndex', {
                objs:wickEditor.fabric.getSelectedObjects(WickObject),
                newZIndex: wickEditor.project.currentObject.getCurrentFrame().wickObjects.length
            });
            wickEditor.fabric.deselectAll();
        });

    registerAction('sendToBack',
        ['Modifier', "SHIFT", "DOWN"],
        ['sendToBackButton'],
        {},
        function(args) {
            wickEditor.actionHandler.doAction('moveObjectToZIndex', {
                objs:wickEditor.fabric.getSelectedObjects(WickObject),
                newZIndex: 0
            });
            wickEditor.fabric.deselectAll();
        });

    registerAction('flipHorizontally',
        [],
        [],
        {},
        function(args) {
            var selectedObjects = wickEditor.fabric.getSelectedObjects(WickObject);
            var modifiedStates = [];

            selectedObjects.forEach(function (obj) {
                modifiedStates.push({
                    flipX : !obj.flipX
                });
            });

            wickEditor.actionHandler.doAction('modifyObjects', {
                objs: selectedObjects,
                modifiedStates: modifiedStates
            });
        });

    registerAction('flipVertically',
        [],
        [],
        {},
        function(args) {
            var selectedObjects = wickEditor.fabric.getSelectedObjects(WickObject);
            var modifiedStates = [];

            selectedObjects.forEach(function (obj) {
                modifiedStates.push({
                    flipY : !obj.flipY
                });
            });
            
            wickEditor.actionHandler.doAction('modifyObjects', {
                objs: selectedObjects,
                modifiedStates: modifiedStates
            });
        });

    registerAction('editObject',
        [],
        ['editObjectButton', 'editSymbolButton'],
        {},
        function(args) {
            var selectedObject = wickEditor.fabric.getSelectedObject(WickObject);
            wickEditor.fabric.symbolBorders.startEditObjectAnimation(selectedObject);
        });

    registerAction('finishEditingObject',
        [],
        ['finishEditingObjectButton', 'finishEditingObjectFabricButton'],
        {},
        function(args) {
            var currObj = wickEditor.project.currentObject;
            wickEditor.fabric.symbolBorders.startLeaveObjectAnimation(currObj);
        });

    registerAction('convertToSymbol',
        [],
        ['convertToSymbolButton', 'createSymbolButton'],
        {},
        function(args) {
            var fabCanvas = wickEditor.fabric.canvas;
            wickEditor.actionHandler.doAction('convertObjectsToSymbol', {
                objects: wickEditor.fabric.getSelectedObjects(WickObject)
            });
        });

    registerAction('breakApart',
        [],
        ['breakApartButton'],
        {},
        function(args) {
            var selectedObject = wickEditor.fabric.getSelectedObject(WickObject);
            if(selectedObject.isSymbol) {
                wickEditor.actionHandler.doAction('breakApartSymbol', {
                    obj:selectedObject
                });
            } else {
                wickEditor.actionHandler.doAction('breakApartImage', {
                    obj:selectedObject
                });
            }
        });

    registerAction('downloadObject',
        [],
        ['downloadButton'],
        {},
        function(args) {
            wickEditor.fabric.getSelectedObject(WickObject).downloadAsFile();
            wickEditor.syncInterfaces();
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
            var currentObject = wickEditor.project.currentObject;
            var frame = currentObject.getCurrentFrame();
            var layer = currentObject.getCurrentLayer();
            wickEditor.actionHandler.doAction('deleteFrame', {
                frame: frame,
                layer: layer
            });
        });

    registerAction('copyFrame',
        [],
        ['copyFrameButton'],
        {},
        function(args) {
            wickEditor.rightclickmenu.open = false;
            polyfillClipboardData.setData('text/wickobjectsframe', wickEditor.project.currentObject.getCurrentFrame().getAsJSON());
            wickEditor.syncInterfaces()
        });

    registerAction('pasteFrame',
        [],
        ['pasteFrameButton'],
        {},
        function(args) {
            var frameJSON = polyfillClipboardData.getData('text/wickobjectsframe');
            var frame = WickFrame.fromJSON(frameJSON);
            wickEditor.actionHandler.doAction('addFrame', {
                frame:frame
            });
        });

    registerAction('extendFrame',
        ['SHIFT', '.'],
        ['extendFrameButton'],
        {},
        function(args) {
            var frame = wickEditor.project.currentObject.getCurrentFrame();
            if(!frame) {
                var frames = wickEditor.project.currentObject.getCurrentLayer().frames;
                frame = frames[frames.length - 1];
            }

            var frameEndingIndex = wickEditor.project.currentObject.getPlayheadPositionAtFrame(
                frame
            ) + frame.frameLength - 1;

            var framesToExtend = wickEditor.project.currentObject.playheadPosition - frameEndingIndex;

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
            var frame = wickEditor.project.currentObject.getCurrentFrame();

            //var frameEndingIndex = wickEditor.project.currentObject.getPlayheadPositionAtFrame(frame) + frame.frameLength - 1;
            //var framesToShrink = frameEndingIndex - wickEditor.project.currentObject.playheadPosition;
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
            wickEditor.actionHandler.doAction('removeLayer', {});
        });

    registerAction('moveLayerUp',
        [],
        ['moveLayerUpButton'],
        {},
        function(args) {
            wickEditor.actionHandler.doAction('moveLayerUp', {});
        });

    registerAction('moveLayerDown',
        [],
        ['moveLayerDownButton'],
        {},
        function(args) {
            wickEditor.actionHandler.doAction('moveLayerDown', {});
        });

    registerAction('addKeyframe',
        [],
        ['addKeyframeButton'],
        {},
        function(args) {
            var selectedObj = wickEditor.fabric.getSelectedObject(WickObject);
            var tween = WickTween.fromWickObjectState(selectedObj);
            tween.frame = selectedObj.parentObject.getRelativePlayheadPosition(selectedObj);
            selectedObj.addTween(tween);
        });

    registerAction('removeKeyframe',
        [],
        ['removeKeyframeButton'],
        {},
        function(args) {
            console.error("removeKeyframeButton action NYI")
        });

}