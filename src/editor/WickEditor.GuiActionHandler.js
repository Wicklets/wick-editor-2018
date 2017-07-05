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
        if(!this.guiActions[name]) {
            console.error("Error: No GUI action called " + name);
        }

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

    // ENTER
    // Preview play
    registerAction('previewToggle',
        ['ENTER'],
        [],
        {},
        function(args) {
            wickEditor.previewplayer.togglePlaying();
        });

    registerAction('previewPlay',
        [],
        [],
        {},
        function(args) {
            wickEditor.previewplayer.play();
        });

    registerAction('previewPause',
        [],
        [],
        {},
        function(args) {
            wickEditor.previewplayer.stop();
        });

    // ESC
    // Stop Running Project
    registerAction('stopRunningProject',
        ['ESC'],
        [],
        {builtinplayerRunning:true},
        function(args) {
            if(!wickEditor.builtinplayer.running) return;
            wickEditor.builtinplayer.stopRunningProject();
        });

    // Control + SHIFT + Z
    // Redo Action
    registerAction('redo',
        ['Modifier','SHIFT','Z'],
        [],
        {},
        function(args) {
            wickEditor.actionHandler.redoAction();
            wickEditor.syncInterfaces();
        });

    // Control + Z
    // Undo Action
    registerAction('undo',
        ['Modifier','Z'],
        [],
        {},
        function(args) {
            wickEditor.actionHandler.undoAction();
            wickEditor.syncInterfaces();
        });

    // Title
    // Open splash screen
    registerAction('openSplashScreen',
        [],
        [],
        {},
        function(args) {
            wickEditor.splashscreen.openSplashScreen();
        });

    // Control + ENTER
    // Run Project
    registerAction('runProject',
        ['Modifier','ENTER'],
        [],
        {usableInTextBoxes:true},
        function(args) {
            $(":focus").blur();
            
            that.keys = [];
            that.specialKeys = [];

            wickEditor.project.rootObject.getAllChildObjectsRecursive().forEach(function (child) {
                child.causedAnException = false;
            });
            wickEditor.scriptingide.clearError();
            
            WickProject.Exporter.autosaveProject(wickEditor.project);
            wickEditor.project.getAsJSON(function (JSONProject) {
                wickEditor.project.unsaved = false;
                wickEditor.builtinplayer.runProject(JSONProject);
            });

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
            if(!isElectronMode) {
                WickProject.Exporter.autosaveProject(wickEditor.project);
                //wickEditor.guiActionHandler.doAction('exportProjectJSON');
            } else {
                wickEditor.project.getAsJSON(function(JSONProject) {
                    wickEditor.electron.saveProject(JSONProject, wickEditor.project.name);
                }, '\t');
            }
        });

    // Export Project
    registerAction('exportProjectHTML',
        [],
        [],
        {usableInTextBoxes:true},
        function(args) {
            that.keys = [];
            that.specialKeys = [];
            WickProject.Exporter.autosaveProject(wickEditor.project);
            WickProject.Exporter.exportProject(wickEditor.project);
        });

    registerAction('exportProjectJSON',
        ['Modifier','SHIFT','S'],
        [],
        {},
        function(args) {
            WickProject.Exporter.autosaveProject(wickEditor.project);
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

    registerAction('exportFrameSVG',
        [],
        [],
        {},
        function (args) {
            alert("Coming soon!")
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
        [],
        {},
        function(args) {
            that.keys = [];
            if(!isElectronMode) {
                $('#importButton').click();
            } else {
                wickEditor.electron.openProject();
            }
        });

    registerAction('importFile',
        [],
        [],
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
        [],
        {},
        function(args) {
            if(wickEditor.project.isTypeSelected(WickTween)) {
                wickEditor.actionHandler.doAction('deleteObjects', {
                    objects: [wickEditor.project.getSelectedObjectByType(WickTween)]
                });
            } else {
                wickEditor.actionHandler.doAction('deleteObjects', {
                    objects: wickEditor.project.getSelectedObjects()
                });
            }
        });

    // Delete
    // Delete Selected Objects
    registerAction('deleteSelectedObjects2',
        ['DELETE'],
        [],
        {},
        function(args) {
            wickEditor.guiActionHandler.doAction('deleteSelectedObjects');
        });

    var copyKeys  = isChrome ? [] : ['Modifier',"C"];
    var cutKeys   = isChrome ? [] : ['Modifier',"X"];
    var pasteKeys = isChrome ? [] : ['Modifier',"V"];

    registerAction('copy',
        copyKeys,
        [],
        {},
        function(args) {
            wickEditor.rightclickmenu.open = false;
            that.keys = [];

            var copyData = wickEditor.project.getCopyData();
            var copyType
            if(wickEditor.project.getSelectedObjects()[0] instanceof WickObject) {
                copyType = 'text/wickobjectsjson';
            } else {
                copyType = 'text/wickframesjson';
            }
            polyfillClipboardData.setData(copyType, copyData);

            wickEditor.syncInterfaces();
        });

    registerAction('cut',
        cutKeys,
        [],
        {},
        function(args) {
            wickEditor.rightclickmenu.open = false;
            that.keys = [];

            polyfillClipboardData.setData('text/wickobjectsjson', wickEditor.project.getCopyData());

            wickEditor.actionHandler.doAction('deleteObjects', { 
                wickObjects:wickEditor.fabric.getSelectedObjects(WickObject) 
            });

            wickEditor.syncInterfaces();
        });

    registerAction('paste',
        pasteKeys,
        [],
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
                    objs.forEachBackwards(function (obj) {
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
                } else if (fileType === 'text/wickframesjson') {
                    var frames = WickFrame.fromJSONArray(JSON.parse(file));
                    frames.forEach(function (frame) {
                        frame.uuid = random.uuid4();

                        frame.wickObjects.forEach(function (wickObject) {
                            wickObject.getAllChildObjectsRecursive().forEach(function (child) {
                                child.uuid = random.uuid4();
                            });
                        });
                    });
                    wickEditor.actionHandler.doAction('addFrames', {
                        frames:frames
                    });
                } else if (fileType.includes('image')) {
                    //console.log(items[i])
                    reader = new FileReader();
                    reader.onload = function(evt) {
                        var asset = new WickAsset(evt.target.result, 'image', 'Pasted Image');
                        var wickObj = new WickObject();
                        wickObj.assetUUID = wickEditor.project.library.addAsset(asset);
                        wickObj.isImage = true;
                        wickObj.name = 'Pasted Image';
                        wickEditor.actionHandler.doAction('addObjects', {
                            wickObjects:[wickObj]
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
        [],
        {},
        function(args) {
            if(!args.dontWarn && !confirm("Create a new project? All unsaved changes to the current project will be lost!")) {
                return;
            }

            localStorage.removeItem("wickProject");
            
            var project = new WickProject();
            project.name = window.prompt("Enter a name for your new project:", "NewProject") || "NewProject";
            
            wickEditor.guiActionHandler.doAction('openProject', {project:project, dontWarn:true});
        });

    registerAction('openProject',
        [],
        [],
        {},
        function(args) {
            if(!args.dontWarn && !confirm("Open a new project? All unsaved changes to the current project will be lost!")) {
                return;
            }

            var project = args.project;

            wickEditor.project = project;
            if(!args.dontAutosave)
                WickProject.Exporter.autosaveProject(wickEditor.project);

            wickEditor.actionHandler.clearHistory();
            window.wickRenderer.setProject(wickEditor.project);

            wickEditor.fabric.recenterCanvas();
            wickEditor.guiActionHandler.doAction("openProjectSettings");
            wickEditor.paper.needsUpdate = true;
            wickEditor.thumbnailRenderer.renderAllThumbsOnTimeline();
            wickEditor.syncInterfaces();
        });

    registerAction('useTools.cursor',
        [/*'C'*/],
        [],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.cursor);
        });

    registerAction('useTools.pen',
        [],
        [],
        {},
        function (args) {
            wickEditor.changeTool(wickEditor.tools.pen);
        });

    registerAction('useTools.paintbrush',
        [/*'B'*/],
        [],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.paintbrush);
        });

    registerAction('useTools.line',
        [],
        [],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.line);
        });

    registerAction('useTools.eraser',
        [],
        [],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.eraser);
        });

    registerAction('useTools.fillbucket',
        [/*'F'*/],
        [],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.fillbucket);
        });

    registerAction('useTools.rectangle',
        [/*'R'*/],
        [],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.rectangle);
        });

    registerAction('useTools.ellipse',
        [/*'E'*/],
        [],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.ellipse);
        });

    registerAction('useTools.polygon',
        [/*'E'*/],
        [],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.polygon);
        });

    registerAction('useTools.dropper',
        [/*'D'*/],
        [],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.dropper);
        });

    registerAction('useTools.text',
        [/*'T'*/],
        [],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.text);
        });

    registerAction('useTools.zoom',
        [/*'Z'*/],
        [],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.zoom);
        });

    registerAction('useTools.pan',
        [/*'P'*/],
        [],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.pan);
        });

    registerAction('useTools.crop',
        [],
        [],
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.crop);
        });

    registerAction('editScripts',
        ['`'],
        [],
        {},
        function(args) {
            wickEditor.scriptingide.open = !wickEditor.scriptingide.open;
            wickEditor.scriptingide.aceEditor.focus()
            wickEditor.syncInterfaces();
        });

    registerAction('bringToFront',
        ['Modifier', "SHIFT", "UP"],
        [],
        {},
        function(args) {
            wickEditor.actionHandler.doAction('moveObjectToZIndex', {
                objs:wickEditor.project.getSelectedObjects(),
                newZIndex: wickEditor.project.getCurrentFrame().wickObjects.length-1
            });
            //wickEditor.fabric.deselectAll();
        });

    registerAction('sendToBack',
        ['Modifier', "SHIFT", "DOWN"],
        [],
        {},
        function(args) {
            wickEditor.actionHandler.doAction('moveObjectToZIndex', {
                objs:wickEditor.project.getSelectedObjects(),
                newZIndex: 0
            });
            //wickEditor.fabric.deselectAll();
        });

    registerAction('flipHorizontally',
        [],
        [],
        {},
        function(args) {
            /*var selectedObjects = wickEditor.fabric.getSelectedObjects(WickObject);
            var modifiedStates = [];

            selectedObjects.forEach(function (obj) {
                modifiedStates.push({
                    flipX : !obj.flipX
                });
            });

            wickEditor.actionHandler.doAction('modifyObjects', {
                objs: selectedObjects,
                modifiedStates: modifiedStates
            });*/

            wickEditor.fabric.flipSelection(true, false);
        });

    registerAction('flipVertically',
        [],
        [],
        {},
        function(args) {
            /*var selectedObjects = wickEditor.fabric.getSelectedObjects(WickObject);
            var modifiedStates = [];

            selectedObjects.forEach(function (obj) {
                modifiedStates.push({
                    flipY : !obj.flipY
                });
            });
            
            wickEditor.actionHandler.doAction('modifyObjects', {
                objs: selectedObjects,
                modifiedStates: modifiedStates
            });*/

            wickEditor.fabric.flipSelection(false, true);
        });

    registerAction('editObject',
        [],
        [],
        {},
        function(args) {
            wickEditor.project.clearSelection()
            var selectedObject = wickEditor.fabric.getSelectedObject(WickObject);
            wickEditor.fabric.symbolBorders.startEditObjectAnimation(selectedObject);
        });

    registerAction('finishEditingObject',
        [],
        [],
        {},
        function(args) {
            var currObj = wickEditor.project.currentObject;
            wickEditor.fabric.symbolBorders.startLeaveObjectAnimation(currObj);
        });

    registerAction('convertToSymbol',
        ['Modifier', 'SHIFT', '8'],
        [],
        {},
        function(args) {
            wickEditor.actionHandler.doAction('convertObjectsToSymbol', {
                objects: wickEditor.fabric.getSelectedObjects(WickObject)
            });
        });

    registerAction('convertToButton',
        ['Modifier', 'SHIFT', '8'],
        [],
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
        [],
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
        [],
        {},
        function(args) {
            wickEditor.fabric.getSelectedObject(WickObject).downloadAsFile();
            wickEditor.syncInterfaces();
        });

    registerAction('addFrame',
        ['SHIFT', '='],
        [],
        {},
        function(args) {
            wickEditor.actionHandler.doAction('addNewFrame');
        });
    
    registerAction('copyFrame',
        [],
        [],
        {},
        function(args) {
            wickEditor.rightclickmenu.open = false;
            polyfillClipboardData.setData('text/wickobjectsframe', wickEditor.project.getCurrentFrame().getAsJSON());
            wickEditor.syncInterfaces()
        });

    registerAction('pasteFrame',
        [],
        [],
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
        [],
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
        [],
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
        [],
        {},
        function(args) {
            wickEditor.actionHandler.doAction('addNewLayer');
        });

    registerAction('removeLayer',
        [],
        [],
        {},
        function(args) {
            wickEditor.actionHandler.doAction('removeLayer', {});
        });

    registerAction('moveLayerUp',
        [],
        [],
        {},
        function(args) {
            wickEditor.actionHandler.doAction('moveLayerUp', {});
        });

    registerAction('moveLayerDown',
        [],
        [],
        {},
        function(args) {
            wickEditor.actionHandler.doAction('moveLayerDown', {});
        });

    registerAction('createMotionTween',
        [],
        [],
        {},
        function(args) {
            var frame = wickEditor.project.getSelectedObject();
            var currentObject = wickEditor.project.getCurrentObject()

            wickEditor.actionHandler.doAction('createMotionTween', {
                frame: frame,
                playheadPosition: currentObject.playheadPosition-frame.playheadPosition
            });
        });

    registerAction('removeTween',
        [],
        [],
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
        [],
        {},
        function(args) {
            console.error("removeKeyframeButton action NYI")
        });

    registerAction('addNewText',
        [],
        [],
        {},
        function (args) {
            var newWickObject = WickObject.createTextObject('Click to edit text');
            newWickObject.x = wickEditor.project.width/2;
            newWickObject.y = wickEditor.project.height/2;
            newWickObject.textData.fill = '#000000';
            wickEditor.actionHandler.doAction('addObjects', {wickObjects:[newWickObject]});
        });

    registerAction('finishEditingTextbox',
        ['ENTER'],
        [],
        {usableInTextBoxes:true, disabledInScriptingIDE:true},
        function (args) {
            $(":focus").blur();
        });

    registerAction('openProjectSettings',
        [],
        [],
        {},
        function (args) {
            wickEditor.project.clearSelection();
            wickEditor.inspector.openProjectSettings();
            wickEditor.syncInterfaces();
        });

    registerAction('toggleProjectSettings',
        [],
        [],
        {},
        function (args) {
            wickEditor.project.clearSelection();
            wickEditor.inspector.toggleProjectSettings();
            wickEditor.syncInterfaces();
        });

    registerAction('changeFillColorOfSelection', 
        [],
        [],
        {},
        function (args) {
            wickEditor.paper.pathRoutines.setFillColor(wickEditor.project.getSelectedObjects(), args.color);
        });

    registerAction('changeStrokeColorOfSelection', 
        [],
        [],
        {},
        function (args) {
            wickEditor.paper.pathRoutines.setStrokeColor(wickEditor.project.getSelectedObjects(), args.color);
        });

    registerAction('changeStrokeWidthOfSelection',
        [],
        [],
        {},
        function (args) {
            wickEditor.paper.pathRoutines.setStrokeWidth(wickEditor.project.getSelectedObjects(), args.strokeWidth);
        });

    registerAction('copyFrameForward', 
        [],
        [],
        {},
        function (args) {
            var frame = wickEditor.project.getSelectedObject();
            var copiedFrame = frame.copy();
            copiedFrame.playheadPosition = frame.getNextOpenPlayheadPosition();

            wickEditor.project.getCurrentLayer().addFrame(copiedFrame);
            wickEditor.project.getCurrentObject().playheadPosition = copiedFrame.playheadPosition;
            wickEditor.project.clearSelection();
            wickEditor.project.selectObject(copiedFrame);
            wickEditor.project.currentObject.framesDirty = true;
            wickEditor.project.rootObject.generateParentObjectReferences();
            wickEditor.project.regenAssetReferences();

            wickEditor.syncInterfaces();
        });

    registerAction('duplicateSelection',
        [],
        [],
        {},
        function (args) {
            var selectedObjects = wickEditor.project.getSelectedObjects();
            var duplicates = [];

            selectedObjects.forEach(function (selectedObject) {
                var copy = selectedObject.copy();
                //var absPos = selectedObject.getAbsolutePosition();
                copy.x += 50;
                copy.y += 50;
                duplicates.push(copy);
            });

            wickEditor.actionHandler.doAction('addObjects', {
                wickObjects:duplicates
            });
        })

    registerAction('doBooleanOperation',
        [],
        [],
        {},
        function (args) {
            var objs = wickEditor.project.getSelectedObjects();
            var boolFnName = args.boolFnName;
            wickEditor.paper.pathRoutines.doBooleanOperation(boolFnName, objs); 
        });

    registerAction('resetSettings',
        [],
        [],
        {},
        function (args) {
            wickEditor.settings.setDefaults();
            wickEditor.syncInterfaces();
        });

    registerAction('createObjectFromAsset',
        [],
        [],
        {},
        function (args) {
            var asset = wickEditor.library.getSelectedAsset();
            var wickObj;

            if(asset.type === 'image') {
                wickObj = new WickObject();
                wickObj.assetUUID = asset.uuid;
                wickObj.isImage = true;
            } else if(asset.type === 'audio') {
                wickObj = new WickObject();
                wickObj.assetUUID = asset.uuid;
                wickObj.isSound = true;
                wickObj.width = 50;
                wickObj.height = 50;
            }

            if(!wickObj) return;
            wickEditor.actionHandler.doAction('addObjects', {
                wickObjects:[wickObj]
            });

        });

    registerAction('deleteAsset',
        [],
        [],
        {},
        function (args) {
            wickEditor.actionHandler.doAction('deleteAsset', {
                asset: wickEditor.library.getSelectedAsset()
            });
        });

    registerAction('renameAsset',
        [],
        [],
        {},
        function (args) {
            wickEditor.actionHandler.doAction('renameAsset', {
                asset: wickEditor.library.getSelectedAsset()
            });
        });

}