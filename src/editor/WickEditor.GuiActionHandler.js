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

    var registerAction = function (name, hotkeys, title, requiredParams, action) {
        that.guiActions[name] = new GuiAction(hotkeys, title, requiredParams, action);
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
    var GuiAction = function (hotkeys, title, requiredParams, action) {

        var that = this;

        /* Function to be called when either a hotkey or element fires. */
        this.doAction = action;

        /* What this action should be labeled as in the hotkeys window */
        this.title = title;

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

    registerAction('openTools.Pan',
        ['SPACE'],
        'Pan',
        {},
        function(args) {
            if(!(wickEditor.currentTool instanceof Tools.Pan)) {
                wickEditor.lastTool = wickEditor.currentTool;
                wickEditor.currentTool = wickEditor.tools.pan;
                wickEditor.syncInterfaces();
            }
        });

    registerAction('previewToggle',
        ['ENTER'],
        'Play/Pause Preview',
        {},
        function(args) {
            wickEditor.previewplayer.togglePlaying();
        });

    registerAction('previewPlay',
        [],
        [],
        {},
        function(args) {
            wickEditor.previewplayer.play(args.loop);
        });

    registerAction('previewPause',
        [],
        [],
        {},
        function(args) {
            wickEditor.previewplayer.stop();
        });

    registerAction('stopRunningProject',
        ['ESC'],
        'Stop Running Project',
        {builtinplayerRunning:true},
        function(args) {
            if(!wickEditor.builtinplayer.running) return;
            wickEditor.builtinplayer.stopRunningProject();
        });

    registerAction('redo',
        ['Modifier','SHIFT','Z'],
        'Redo',
        {},
        function(args) {
            wickEditor.actionHandler.redoAction();
        });

    registerAction('undo',
        ['Modifier','Z'],
        'Undo',
        {},
        function(args) {
            wickEditor.actionHandler.undoAction();
        });

    registerAction('runProject',
        ['Modifier','ENTER'],
        'Run Project',
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

    registerAction('recenterCanvas',
        ['Modifier','0'],
        'Recenter Canvas',
        {},
        function(args) {
            wickEditor.fabric.recenterCanvas();
        });

    registerAction('saveProject',
        ['Modifier','S'],
        'Save',
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
        'Save As',
        {},
        function(args) {
            WickProject.Exporter.autosaveProject(wickEditor.project);
            WickProject.Exporter.exportProject(wickEditor.project, {json:true});
        });

    registerAction('exportProjectZIP',
        [],
        [],
        {usableInTextBoxes:true},
        function(args) {
            that.keys = [];
            that.specialKeys = [];
            WickProject.Exporter.exportProject(wickEditor.project, {zipped:true});
        });

    registerAction('exportProjectGIF',
        [],
        [],
        {},
        function (args) {
            wickEditor.gifRenderer.renderProjectAsGIF(function (blob) {
                saveAs(blob, wickEditor.project.name+".gif");
            });
        });

    registerAction('exportFrameSVG',
        [],
        [],
        {},
        function (args) {
            wickEditor.guiActionHandler.doAction('useTools.pathCursor')
            wickEditor.paper.pathRoutines.getProjectAsSVG()
        });

    registerAction('exportProjectPNG',
        [],
        [],
        {},
        function (args) {
            wickEditor.gifRenderer.renderProjectAsPNG(function (blob) {
                saveAs(blob, wickEditor.project.name+".png");
            });
        });

    registerAction('exportProjectWebM',
        [],
        [],
        {},
        function (args) {
            alert("NYI")
        });

    registerAction('openFile',
        ['Modifier','O'],
        'Open',
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

    registerAction('selectAll',
        ['Modifier','A'],
        'Select All',
        {},
        function(args) {
            if(!(wickEditor.currentTool instanceof Tools.PathCursor))
                wickEditor.currentTool = wickEditor.tools.cursor;

            wickEditor.project.clearSelection();
            wickEditor.project.currentObject.getAllActiveChildObjects().forEach(function (obj) {
                if(obj.parentFrame.parentLayer !== wickEditor.project.getCurrentLayer()) return;
                wickEditor.project.selectObject(obj);
            });
            wickEditor.syncInterfaces();
        });

    registerAction('moveSelection',
        [],
        [],
        {},
        function (args) {
            var modifiedStates = [];
            var objs = wickEditor.project.getSelectedObjects();
            objs.forEach(function (obj) {
                var wickObj = obj;
                modifiedStates.push({
                    x : wickObj.x + args.x,
                    y : wickObj.y + args.y,
                    scaleX : obj.isPath ? 1 : obj.scaleX,
                    scaleY : obj.isPath ? 1 : obj.scaleY,
                    rotation : obj.isPath ? 0 : obj.rotation,
                    flipX : obj.isPath ? false : obj.flipX,
                    flipY : obj.isPath ? false : obj.flipY
                });
            });

            wickEditor.actionHandler.doAction('modifyObjects', {
                objs: objs,
                modifiedStates: modifiedStates
            });
        });

    registerAction('deselectAll',
        ['Modifier','SHIFT','A'],
        'Deselect All',
        {},
        function(args) {
            wickEditor.project.clearSelection();
            wickEditor.syncInterfaces();
        });

    registerAction('moveSelectionUp',
        ['UP'],
        'Move selection up 1px',
        {},
        function(args) {
            wickEditor.guiActionHandler.doAction('moveSelection', {
                x:0, y:-1
            })
        });

    registerAction('moveSelectionDown',
        ['DOWN'],
        'Move selection down 1px',
        {},
        function(args) {
            wickEditor.guiActionHandler.doAction('moveSelection', {
                x:0, y:1
            })
        });

    registerAction('moveSelectionLeft',
        ['LEFT'],
        'Move selection left 1px',
        {},
        function(args) {
            wickEditor.guiActionHandler.doAction('moveSelection', {
                x:-1, y:0
            })
        });

    registerAction('moveSelectionRight',
        ['RIGHT'],
        'Move selection right 1px',
        {},
        function(args) {
            wickEditor.guiActionHandler.doAction('moveSelection', {
                x:1, y:0
            })
        });

    registerAction('moveSelectionUp10x',
        ['SHIFT', 'UP'],
        'Move selection up 10px',
        {},
        function(args) {
            wickEditor.guiActionHandler.doAction('moveSelection', {
                x:0, y:-10
            })
        });

    registerAction('moveSelectionDown10x',
        ['SHIFT', 'DOWN'],
        'Move selection down 10px',
        {},
        function(args) {
            wickEditor.guiActionHandler.doAction('moveSelection', {
                x:0, y:10
            })
        });

    registerAction('moveSelectionLeft10x',
        ['SHIFT', 'LEFT'],
        'Move selection left 10px',
        {},
        function(args) {
            wickEditor.guiActionHandler.doAction('moveSelection', {
                x:-10, y:0
            })
        });

    registerAction('moveSelectionRight10x',
        ['SHIFT', 'RIGHT'],
        'Move selection right 10px',
        {},
        function(args) {
            wickEditor.guiActionHandler.doAction('moveSelection', {
                x:10, y:0
            })
        });

    registerAction('movePlayheadLeft',
        [','],
        'Previous frame',
        {},
        function(args) {
            wickEditor.actionHandler.doAction("movePlayhead", {
                obj: wickEditor.project.currentObject,
                newPlayheadPosition: wickEditor.project.currentObject.playheadPosition-1
            })
        });

    registerAction('movePlayheadRight',
        ['.'],
        'Next frame',
        {},
        function(args) {
            wickEditor.actionHandler.doAction("movePlayhead", {
                obj: wickEditor.project.currentObject,
                newPlayheadPosition: wickEditor.project.currentObject.playheadPosition+1
            })
        });

    // BACKSPACE
    // Delete Selected Objects
    registerAction('deleteSelectedObjects',
        ['BACKSPACE'],
        null,
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
        'Delete Selection',
        {},
        function(args) {
            wickEditor.guiActionHandler.doAction('deleteSelectedObjects');
        });

    var copyKeys  = isChrome ? [] : ['Modifier',"C"];
    var cutKeys   = isChrome ? [] : ['Modifier',"X"];
    var pasteKeys = isChrome ? [] : ['Modifier',"V"];

    registerAction('copy',
        copyKeys,
        'Copy',
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

            //wickEditor.syncInterfaces();
        });

    registerAction('cut',
        cutKeys,
        'Cut',
        {},
        function(args) {
            wickEditor.guiActionHandler.doAction('copy');
            wickEditor.guiActionHandler.doAction('deleteSelectedObjects');
        });

    registerAction('paste',
        pasteKeys,
        'Paste',
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
                        if(obj.name) obj.name = obj.name + ' copy';
                        obj.getAllChildObjectsRecursive().forEach(function (child) {
                            child.uuid = random.uuid4();
                            (child.layers||[]).forEach(function (layer) {
                                layer.frames.forEach(function (frame) {
                                    frame.uuid = random.uuid4();
                                })
                            });
                            //child.name = "";
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
                    var firstPlayheadPosition = null;
                    frames.forEach(function (frame) {
                        if(!firstPlayheadPosition || frame.playheadPosition < firstPlayheadPosition) 
                            firstPlayheadPosition = frame.playheadPosition;
                    });
                    frames.forEach(function (frame) {
                        frame.uuid = random.uuid4();
                        if(frame.name) frame.name = frame.name + ' copy';
                        frame.playheadPosition -= firstPlayheadPosition;
                        frame.playheadPosition += wickEditor.project.getCurrentObject().playheadPosition;

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
        });

    registerAction('newProject',
        [],
        [],
        {},
        function(args) {
            if(!args.dontWarn && !confirm("Create a new project? All unsaved changes to the current project will be lost!")) {
                return;
            }
            
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

            wickEditor.actionHandler.clearHistory();

            wickEditor.fabric.recenterCanvas();
            wickEditor.guiActionHandler.doAction("openProjectSettings");
            wickEditor.paper.needsUpdate = true;
            wickEditor.thumbnailRenderer.renderAllThumbsOnTimeline();
            wickEditor.project.currentObject.framesDirty = true;
            wickEditor.syncInterfaces();
        });

    registerAction('useTools.cursor',
        ['C'],
        'Switch to Cursor',
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.cursor);
        });

    registerAction('useTools.pathCursor',
        ['P'],
        'Switch to Path Cursor',
        {},
        function (args) {
            wickEditor.changeTool(wickEditor.tools.pathCursor);
        });

    registerAction('useTools.paintbrush',
        ['B'],
        'Switch to Brush',
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.paintbrush);
        });

    registerAction('useTools.line',
        ['L'],
        'Switch to Line',
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.line);
        });

    registerAction('useTools.eraser',
        ['E'],
        'Switch to Eraser',
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.eraser);
        });

    registerAction('useTools.fillbucket',
        ['G'],
        'Switch to Fill Bucket',
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.fillbucket);
        });

    registerAction('useTools.rectangle',
        ['R'],
        'Switch to Rectangle',
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.rectangle);
        });

    registerAction('useTools.ellipse',
        ['S'],
        'Switch to Ellipse',
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.ellipse);
        });

    registerAction('useTools.pen',
        ['O'],
        'Switch to Pen',
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.pen);
        });

    registerAction('useTools.dropper',
        ['D'],
        'Switch to Eyedropper',
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.dropper);
        });

    registerAction('useTools.text',
        ['T'],
        'Switch to Text',
        {},
        function(args) {
            wickEditor.changeTool(wickEditor.tools.text);
        });

    registerAction('useTools.zoom',
        ['Z'],
        'Switch to Zoom',
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

    registerAction('editScripts',
        ['`'],
        'Open Scripting Window',
        {},
        function(args) {
            wickEditor.scriptingide.open = !wickEditor.scriptingide.open;
            wickEditor.scriptingide.aceEditor.focus()
            wickEditor.syncInterfaces();
        });

    registerAction('bringToFront',
        ['Modifier', "SHIFT", "UP"],
        'Bring to Front',
        {},
        function(args) {
            wickEditor.actionHandler.doAction('moveObjectToZIndex', {
                objs:wickEditor.project.getSelectedObjects(),
                newZIndex: wickEditor.project.getCurrentFrame().wickObjects.length-1
            });
        });

    registerAction('sendToBack',
        ['Modifier', "SHIFT", "DOWN"],
        'Send to Back',
        {},
        function(args) {
            wickEditor.actionHandler.doAction('moveObjectToZIndex', {
                objs:wickEditor.project.getSelectedObjects(),
                newZIndex: 0
            });
        });

    registerAction('moveBackwards',
        ['Modifier', "DOWN"],
        'Move Backwards',
        {},
        function(args) {
            wickEditor.actionHandler.doAction('moveObjectBackwards', {
                objs: wickEditor.project.getSelectedObjects()
            });
        });

    registerAction('moveForwards',
        ['Modifier', "UP"],
        'Move Forwards',
        {},
        function(args) {
            wickEditor.actionHandler.doAction('moveObjectForwards', {
                objs: wickEditor.project.getSelectedObjects()
            });
        });

    registerAction('flipHorizontally',
        [],
        [],
        {},
        function(args) {
            var modifiedStates = [];
            var objs = wickEditor.project.getSelectedObjects();
            objs.forEach(function (obj) {
                var wickObj = obj;
                modifiedStates.push({
                    flipX : !obj.flipX,
                });
            });

            wickEditor.actionHandler.doAction('modifyObjects', {
                objs: objs,
                modifiedStates: modifiedStates
            });
        });

    registerAction('flipVertically',
        [],
        [],
        {},
        function(args) {
            var modifiedStates = [];
            var objs = wickEditor.project.getSelectedObjects();
            objs.forEach(function (obj) {
                var wickObj = obj;
                modifiedStates.push({
                    flipY : !obj.flipY
                });
            });

            wickEditor.actionHandler.doAction('modifyObjects', {
                objs: objs,
                modifiedStates: modifiedStates
            });
        });

    registerAction('editObject',
        [],
        [],
        {},
        function(args) {
            var selectedObject = wickEditor.project.getSelectedObject();
            wickEditor.project.clearSelection()
            wickEditor.actionHandler.doAction('editObject', { objectToEdit: selectedObject });
        });

    registerAction('finishEditingObject',
        [],
        [],
        {},
        function(args) {
            wickEditor.actionHandler.doAction('finishEditingCurrentObject', {});
        });

    registerAction('convertToSymbol',
        [],
        [],
        {},
        function(args) {
            wickEditor.actionHandler.doAction('convertObjectsToSymbol', {
                objects: wickEditor.project.getSelectedObjects()
            });
        });

    registerAction('convertToButton',
        [],
        [],
        {},
        function(args) {
            wickEditor.actionHandler.doAction('convertObjectsToSymbol', {
                objects: wickEditor.project.getSelectedObjects(),
                button: true
            });
        });

    registerAction('convertToGroup',
        ['Modifier', 'G'],
        'Group Selection',
        {},
        function(args) {
            wickEditor.actionHandler.doAction('convertObjectsToSymbol', {
                objects: wickEditor.project.getSelectedObjects(),
                group: true
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
        ["Modifier", "B"],
        'Break Apart Selection',
        {},
        function(args) {
            var selectedObject = wickEditor.project.getSelectedObject();
            wickEditor.actionHandler.doAction('breakApartSymbol', {
                obj:selectedObject
            });
        });

    registerAction('downloadObject',
        [],
        [],
        {},
        function(args) {
            wickEditor.project.getSelectedObject().downloadAsFile();
            wickEditor.syncInterfaces();
        });

    registerAction('addFrame',
        [],
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
        'Extend Frame',
        {},
        function(args) {
            var frame = wickEditor.project.getCurrentFrame();
            if(!frame) {
                var frames = wickEditor.project.currentObject.getCurrentLayer().frames;
                frame = frames[frames.length - 1];
            }

            var frameEndingIndex = frame.playheadPosition + frame.length - 1;

            var framesToExtend = wickEditor.project.currentObject.playheadPosition - frameEndingIndex;

            wickEditor.actionHandler.doAction('extendFrame', {
                nFramesToExtendBy: Math.max(1, framesToExtend),
                frame: frame
            });
        });

    registerAction('shrinkFrame',
        ['SHIFT', ','],
        'Shrink Frame',
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
        [],
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
    
    registerAction('deleteMotionTween',
        [],
        [],
        {},
        function(args) {
            var frame = wickEditor.project.getSelectedObject();
            var currentObject = wickEditor.project.getCurrentObject()

            wickEditor.actionHandler.doAction('deleteMotionTween', {
                frame: frame,
                playheadPosition: currentObject.playheadPosition-frame.playheadPosition
            });
        });

    registerAction('addNewText',
        [],
        [],
        {},
        function (args) {
            var newWickObject = WickObject.createTextObject('Click to edit text');
            newWickObject.x = wickEditor.project.width/2;
            newWickObject.y = wickEditor.project.height/2;
            wickEditor.actionHandler.doAction('addObjects', {wickObjects:[newWickObject]});
        });

    registerAction('finishEditingTextbox',
        ['ENTER'],
        null,
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

    registerAction('openEditorSettings',
        [],
        [],
        {},
        function (args) {
            wickEditor.editorSettings.open();
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
            wickEditor.project.getSelectedObjects().forEach(function (obj) {
                if(obj.isText) {
                    obj.textData.fill = args.color;
                }
            })
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

    registerAction('changeStrokeCapAndJoinOfSelection',
        [],
        [],
        {},
        function (args) {
            wickEditor.paper.pathRoutines.setStrokeCapAndJoin(
                wickEditor.project.getSelectedObjects(), 
                args.strokeCap,
                args.strokeJoin);
        });

    registerAction('copyFrameForward', 
        [],
        [],
        {},
        function (args) {
            wickEditor.actionHandler.doAction('copyFrameForward');
        });

    registerAction('extendFrameToPosition',
        [],
        [],
        {},
        function (args) {
            wickEditor.actionHandler.doAction('extendFrameToPosition');
        });

    registerAction('duplicateSelection',
        ['Modifier', 'D'],
        'Duplicate Selection',
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
            wickEditor.actionHandler.doAction('doBooleanOperation', {
                boolFnName: args.boolFnName,
                objs: wickEditor.project.getSelectedObjects()
            });
        });

    registerAction('resetSettings',
        [],
        [],
        {},
        function (args) {
            wickEditor.settings.setDefaults();
            wickEditor.syncInterfaces();
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

    registerAction('createObjectFromAsset',
        [],
        [],
        {},
        function (args) {
            var asset = args.asset;

            if(asset.type === 'image') {
                var wickObj = new WickObject();
                wickObj.assetUUID = asset.uuid;
                wickObj.isImage = true;
                wickObj.x = args.x;
                wickObj.y = args.y;
                wickEditor.actionHandler.doAction('addObjects', {
                    wickObjects:[wickObj]
                });
            } else if(asset.type === 'audio') {
                wickEditor.actionHandler.doAction('addSoundToFrame', {
                    frame: wickEditor.project.getCurrentFrame(),
                    asset: args.asset
                });
            }

        });

    registerAction('createSoundFromAsset',
        [],
        [],
        {},
        function (args) {
            var asset = args.asset;

            if(asset.type === 'audio') {
                wickEditor.actionHandler.doAction('addSoundToFrame', {
                    frame: args.frame,
                    asset: args.asset
                });
            }

        });

}