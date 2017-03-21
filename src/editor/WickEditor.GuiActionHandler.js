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

/* GuiActionHandler.js - Interface for routines that don't need undo/redo functionality */

var GuiActionHandler = function (wickEditor) {

    var that = this;

    /* Initialize list of GuiActions. */
    this.guiActions = {};

    var registerAction = function (name, hotkeys, elementIds, requiredParams, action) {
        that.guiActions[name] = new GuiAction(hotkeys, elementIds, requiredParams, action);
    }

    this.doAction = function (name, args) {
        if(args) 
            this.guiActions[name].doAction(args);
        else
            this.guiActions[name].doAction({});
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
            if(!(wickEditor.currentTool instanceof Tools.Pan)) {
                wickEditor.lastTool = wickEditor.currentTool;
                wickEditor.currentTool = wickEditor.tools.pan;
                wickEditor.syncInterfaces();
            }
        });

    // ESC
    // Stop Running Project
    registerAction('stopRunningProject',
        ['ESC'],
        [],
        {},
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
        {usableInTextBoxes:true},
        function(args) {
            that.keys = [];
            that.specialKeys = [];

            wickEditor.project.rootObject.getAllChildObjectsRecursive().forEach(function (child) {
                child.causedAnException = false;
            });
            wickEditor.scriptingide.clearError();
            wickEditor.project.getAsJSON(function (JSONProject) {
                WickProject.saveProjectJSONInLocalStorage(JSONProject);
                wickEditor.builtinplayer.runProject(JSONProject);
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
    registerAction('exportProjectHTML',
        ['Modifier','SHIFT','S'],
        ['exportHTMLButton'],
        {usableInTextBoxes:true},
        function(args) {
            that.keys = [];
            that.specialKeys = [];
            wickEditor.project.saveInLocalStorage();
            WickProject.Exporter.exportProject(wickEditor.project);
        });

    registerAction('exportProjectJSON',
        [],
        ['exportProjectAsJSONButton'],
        {},
        function(args) {
            wickEditor.project.getAsJSON(function(JSONProject) {
                var blob = new Blob([JSONProject], {type: "text/plain;charset=utf-8"});
                saveAs(blob, wickEditor.project.name+".json");
            }, '\t');
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
            wickEditor.gifRenderer.renderProjectAsGIF(function (blob) {
                saveAs(blob, wickEditor.project.name+".gif");
                //window.open(URL.createObjectURL(blob));
            });
        });

    // Export project as WebM
    registerAction('exportProjectWebM',
        [],
        [],
        {},
        function (args) {
            alert("NYI")
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
            wickEditor.currentTool = wickEditor.tools.cursor;
            wickEditor.project.clearSelection();
            wickEditor.project.currentObject.getAllActiveChildObjects().forEach(function (obj) {
                if(obj.parentFrame.parentLayer !== wickEditor.project.getCurrentLayer()) return;
                wickEditor.project.selectObject(obj);
            });
            wickEditor.syncInterfaces();
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
                newPlayheadPosition: wickEditor.project.currentObject.playheadPosition-1
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
                newPlayheadPosition: wickEditor.project.currentObject.playheadPosition+1
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
                objects:wickEditor.project.getSelectedObjects()
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
                objects:wickEditor.project.getSelectedObjects()
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
                    var objs = WickObject.fromJSONArray(JSON.parse(file));
                    // Make sure to reset uuids!
                    objs.forEach(function (obj) {
                        obj.getAllChildObjectsRecursive().forEach(function (child) {
                            child.uuid = random.uuid4();
                        });
                        obj.getAllFrames().forEach(function (frame) {
                            frame.uuid = random.uuid4();
                        });
                    });
                    wickEditor.actionHandler.doAction('addObjects', {
                        wickObjects:objs
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
                        var newObj = WickObject.fromImage(evt.target.result);
                        newObj.x = wickEditor.project.width/2;
                        newObj.y = wickEditor.project.height/2;
                        wickEditor.actionHandler.doAction('addObjects', {
                            wickObjects:[newObj]
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

            window.wickRenderer.setProject(wickEditor.project);
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
            wickEditor.changeTool(wickEditor.tools.cursor);
        });

    registerAction('useTools.Paintbrush',
        [/*'B'*/],
        ['paintbrushToolButton'],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.paintbrush);
        });

    registerAction('useTools.Eraser',
        [],
        ['eraserToolButton'],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.eraser);
        });

    registerAction('useTools.FillBucket',
        [/*'F'*/],
        ['fillbucketToolButton'],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.fillbucket);
        });

    registerAction('useTools.Rectangle',
        [/*'R'*/],
        ['rectangleToolButton'],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.rectangle);
        });

    registerAction('useTools.Ellipse',
        [/*'E'*/],
        ['ellipseToolButton'],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.ellipse);
        });

    registerAction('useTools.Dropper',
        [/*'D'*/],
        ['dropperToolButton'],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.dropper);
        });

    registerAction('useTools.Text',
        [/*'T'*/],
        ['textToolButton'],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.text);
        });

    registerAction('useTools.Zoom',
        [/*'Z'*/],
        ['zoomToolButton'],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.zoom);
        });

    registerAction('useTools.Pan',
        [/*'P'*/],
        ['panToolButton'],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.pan);
        });

    registerAction('useTools.Crop',
        [],
        ['cropToolButton'],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.crop);
        });

    registerAction('editScripts',
        [],
        ['editScriptsButton', 'editSymbolScriptsButton', 'editScriptsButtonProperties'],
        {},
        function(args) {
            var selectedObj = wickEditor.fabric.getSelectedObject(WickObject);
            wickEditor.scriptingide.open = true;
            wickEditor.syncInterfaces();
        });

    registerAction('editFrameScripts',
        [],
        ['editFrameScriptsButton', 'editFrameScriptsRightClick'],
        {},
        function(args) {
            wickEditor.project.clearSelection()
            wickEditor.project.selectObject(wickEditor.project.getCurrentFrame());
            wickEditor.scriptingide.open = true;
            wickEditor.syncInterfaces();
        });

    registerAction('bringToFront',
        ['Modifier', "SHIFT", "UP"],
        ['bringToFrontButton'],
        {},
        function(args) {
            wickEditor.actionHandler.doAction('moveObjectToZIndex', {
                objs:wickEditor.project.getSelectedObjects(),
                newZIndex: wickEditor.project.getCurrentFrame().wickObjects.length-1
            });
            wickEditor.fabric.deselectAll();
        });

    registerAction('sendToBack',
        ['Modifier', "SHIFT", "DOWN"],
        ['sendToBackButton'],
        {},
        function(args) {
            wickEditor.actionHandler.doAction('moveObjectToZIndex', {
                objs:wickEditor.project.getSelectedObjects(),
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
        ['editObjectButton', 'editSymbolButton', 'editObjectButtonProperties'],
        {},
        function(args) {
            wickEditor.project.clearSelection()
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
        ['Modifier', 'SHIFT', '8'],
        ['convertToSymbolButton', 'createSymbolButton'],
        {},
        function(args) {
            wickEditor.actionHandler.doAction('convertObjectsToSymbol', {
                objects: wickEditor.fabric.getSelectedObjects(WickObject)
            });
        });

    registerAction('convertToButton',
        ['Modifier', 'SHIFT', '8'],
        ['convertToSymbolButton', 'createSymbolButton'],
        {},
        function(args) {
            wickEditor.actionHandler.doAction('convertObjectsToSymbol', {
                objects: wickEditor.fabric.getSelectedObjects(WickObject),
                button: true
            });
        });

    registerAction('convertFramesToSymbol',
        [],
        [],
        {},
        function (args) {
            wickEditor.actionHandler.doAction('convertFramesToSymbol', {
                frames: wickEditor.project.getSelectedObjects()
            });
        })

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
    
    registerAction('copyFrame',
        [],
        ['copyFrameButton'],
        {},
        function(args) {
            wickEditor.rightclickmenu.open = false;
            polyfillClipboardData.setData('text/wickobjectsframe', wickEditor.project.getCurrentFrame().getAsJSON());
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
            var frame = wickEditor.project.getCurrentFrame();
            if(!frame) {
                var frames = wickEditor.project.currentObject.getCurrentLayer().frames;
                frame = frames[frames.length - 1];
            }

            var frameEndingIndex = wickEditor.project.currentObject.getPlayheadPositionAtFrame(
                frame
            ) + frame.length - 1;

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
            var frame = wickEditor.project.getCurrentFrame();

            //var frameEndingIndex = wickEditor.project.currentObject.getPlayheadPositionAtFrame(frame) + frame.frameLength - 1;
            //var framesToShrink = frameEndingIndex - wickEditor.project.currentObject.playheadPosition;
            //framesToShrink = Math.max(1, framesToShrink)

            wickEditor.actionHandler.doAction('shrinkFrame', {
                nFramesToShrinkBy: 1,
                frame: frame
            });
        });

    registerAction('addLayer',
        ['Modifier', 'SHIFT', '9'],
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

    registerAction('addTween',
        [],
        ['addTweenButton'],
        {},
        function(args) {
            var selectedObj = wickEditor.fabric.getSelectedObject(WickObject);
            var tween = WickTween.fromWickObjectState(selectedObj);
            tween.frame = selectedObj.parentObject.getRelativePlayheadPosition(selectedObj);
            selectedObj.addTween(tween);
            wickEditor.syncInterfaces();
        });

    registerAction('removeTween',
        [],
        ['removeTweenButton'],
        {},
        function(args) {
            var selectedObj = wickEditor.fabric.getSelectedObject(WickObject);
            var playheadPosition = selectedObj.parentObject.getRelativePlayheadPosition(selectedObj);

            var foundTween = null;
            selectedObj.tweens.forEach(function (tween) {
                if(tween.frame === playheadPosition) {
                    foundTween = tween;
                }
            });

            if(foundTween) {
                selectedObj.tweens.splice(selectedObj.tweens.indexOf(foundTween), 1);
            }
            
            wickEditor.syncInterfaces();
        });

    registerAction('removeKeyframe',
        [],
        ['removeKeyframeButton'],
        {},
        function(args) {
            console.error("removeKeyframeButton action NYI")
        });

    registerAction('addNewText',
        [],
        [],
        {},
        function (args) {
            var newWickObject = WickObject.fromText('Click to edit text');
            newWickObject.x = wickEditor.project.width/2;
            newWickObject.y = wickEditor.project.height/2;
            newWickObject.fontData.fill = '#000000';
            wickEditor.actionHandler.doAction('addObjects', {wickObjects:[newWickObject]});
        });

    registerAction('finishEditingTextbox',
        ['ENTER'],
        [],
        {usableInTextBoxes:true, disabledInScriptingIDE:true},
        function (args) {
            $(":focus").blur();
        });

}