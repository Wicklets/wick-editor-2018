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

/* WickActionHandler - General Logic for how undo and redo is handled in the Wick editor. */
/* Only add routines to WickActionHandler if they:
     (1) Change the state of the project and
     (2) Can be undone/redone */

var WickActionHandler = function (wickEditor) {

    var self = this;

// Class definitions

    /* Class to define WickActions */
    var WickAction = function (name, doFn, undoFn) {

        this.name = name;

        /* To be called when an action is committed by the user. */
        this.doFn = doFn;

        /* To be called when this the user undoes this action. This should revert
           the state of the wickEditor or wickObject back to its original state. */
        this.undoFn = undoFn;

    }

    /* Class to store data of actions done, stored in the undo/redo stacks */
    var StackAction = function (name, args) {
        /* name is used as a key to the dict of action definitions */
        this.name = name;

        /* 'args' is used to pass any data that the action needs.
           'args' also saves anything that the undo will use later,
           For example, to undo a delete we need to bring back that deleted object...
           In this case the object that gets deleted gets stored in args! */
        this.args = args;

        this.doAction = function () {
            //console.log("StackAction: do " + this.name);
            actions[this.name].doFn(this.args);
        }

        this.undoAction = function () {
            //console.log("StackAction: undo " + this.name);
            actions[this.name].undoFn(this.args);
        }
    }

// Private vars

    // Actions dict, stores action definitions
    var actions = {};

    // Undo/redo action stacks
    var undoStack = [];
    var redoStack = [];

    /* Call this to define a new action! */
    var registerAction = function(name, doFunction, undoFunction) {
        actions[name] = new WickAction(name, doFunction, undoFunction);
    }

    // done function, call when a WickAction is finished
    var done = function (args) {
        // Sync interfaces + do other post-action cleanup
        if(args && args.dontAddToStack) return;
        wickEditor.project.unsaved = true;
        wickEditor.project.rootObject.generateParentObjectReferences();
        wickEditor.project.regenAssetReferences();
        wickEditor.syncInterfaces();
        wickEditor.fabric.canvas.renderAll();
    }

    // scrap function, 
    var scrap = function (dontUndo) {
        actionBeingDone = false;

        if(!dontUndo) {
            self.undoAction();
        }
        redoStack.pop();

        done();
    }

// API

    this.doAction = function (actionName, args) {
        if(!args) args = {};

        // Check for invalid action
        if(!actions[actionName]) {
            console.error(actionName + " is not a defined WickAction!");
            return;
        }

        // Put the action on the undo stack to be undone later
        var newAction = new StackAction(actionName, args);

        if(!args.dontAddToStack) undoStack.push(newAction);
        newAction.doAction();

        redoStack = [];

        return newAction;

    }

    this.undoAction = function () {

        // Nothing to undo!
        if (undoStack.length == 0) {
            console.log("undoAction(): No actions on the undo stack.");
            return;
        }

        // Get last action on the undo stack
        var action = undoStack.pop();

        // Do the action and put it on the redo stack to be redone later
        action.undoAction();
        redoStack.push(action);
        
    }

    this.redoAction = function () {

        // Nothing to redo!
        if (redoStack.length == 0) {
            console.log("redoAction(): No actions on the redo stack.");
            return;
        }

        // Get last action on the redo stack
        var action = redoStack.pop();

        // Do the action and put it back onto the undo stack
        action.doAction();
        undoStack.push(action);

    }

    this.clearHistory = function () {
        undoStack = [];
        redoStack = [];
    }

    this.printHistory =  function () {
        console.log(undoStack)
    }

    this.getHistoryLength =  function () {
        return undoStack.length
    }

// Register all actions

    registerAction('addObjects',
        function (args) {
            wickEditor.project.clearSelection();

            // Make a new frame if one doesn't exist at the playhead position
            if(!wickEditor.project.getCurrentFrame()) {
                args.addFrameAction = wickEditor.actionHandler.doAction('addNewFrame', {
                    dontAddToStack: true
                });
            }
            var currentFrame = wickEditor.project.getCurrentFrame();
            
            // Save references to added wick objects so they can be removed on undo
            if(args.addedObjects) {
                args.addedObjects.forEach(function (wickObj) {
                    wickEditor.project.addObject(wickObj, args.sendToBack ? 0 : null, true);
                });
            } else {
                args.addedObjects = [];
                args.wickObjects.forEach(function (wickObj) {
                    args.addedObjects.push(wickObj);
                });

                // Add all the new wick objects
                args.wickObjects.forEach(function (wickObj) {
                    wickEditor.project.addObject(wickObj, args.sendToBack ? 0 : null);
                    if(!args.dontSelectObjects) wickEditor.project.selectObject(wickObj)
                });
            }
            
            wickEditor.paper.needsUpdate = true;
            done(args);
        },
        function (args) {
            // Remove objects we added
            args.wickObjects.forEach(function (wickObject) {
                wickEditor.project.currentObject.removeChild(wickObject);
            });

            if(args.addFrameAction) args.addFrameAction.undoAction();

            wickEditor.paper.needsUpdate = true;
            done(args);
        });

    registerAction('deleteObjects',
        function (args) {
            args.restoredObjects = [];
            args.restoredFrames = [];
            args.restoredPlayRanges = [];
            //args.restoredTweens = [];
            args.oldZIndices = [];

            // Store the old z index vars for each object.
            // Must do this before removing them all.
            args.objects.forEach(function (object) {
                if(object instanceof WickObject) {
                    var zIndex = wickEditor.project.getCurrentFrame().wickObjects.indexOf(object);
                    args.oldZIndices.push(zIndex);
                }
            });

            // Now remove them
            args.objects.forEach(function (object) {
                if(object instanceof WickObject) {
                    args.restoredObjects.push(object);
                    wickEditor.project.currentObject.removeChild(object);
                } else if (object instanceof WickFrame) {
                    args.restoredFrames.push(object);
                    object.remove();
                    wickEditor.project.currentObject.framesDirty = true;
                } else if (object instanceof WickPlayRange) {
                    wickEditor.project.currentObject.removePlayRange(object);
                    args.restoredPlayRanges.push(object)
                    wickEditor.project.currentObject.framesDirty = true;
                }/* else if (object instanceof WickTween) {
                    wickEditor.project.getSelectedObjectByType(WickObject).removeTween(object);
                    args.restoredTweens.push(object)
                    wickEditor.project.currentObject.framesDirty = true;
                }*/
            });

            wickEditor.paper.needsUpdate = true;
            done(args);
        },
        function (args) {
            for(var i = 0; i < args.restoredObjects.length; i++) {
                wickEditor.project.addObject(args.restoredObjects[i], args.oldZIndices[i], true);
            }

            args.restoredPlayRanges.forEach(function (restorePlayRange) {
                wickEditor.project.getCurrentObject().addPlayRange(restorePlayRange);
                wickEditor.project.currentObject.framesDirty = true;
            });

            args.restoredFrames.forEach(function (restoreFrame) {
                restoreFrame.parentLayer.addFrame(restoreFrame);
                wickEditor.project.currentObject.framesDirty = true;
            });

            /*args.restoredTweens.forEach(function (restoreTween) {
                restoreFrame.parentLayer.addTween(restoreTween);
                wickEditor.project.currentObject.framesDirty = true;
            });*/

            wickEditor.paper.needsUpdate = true;
            done(args);
        });

    var modifyableAttributes = ["x","y","scaleX","scaleY","rotation","opacity","flipX","flipY","pathData","textData","width"];

    registerAction('modifyObjects',
        function (args) {
            
            args.originalStates = [];

            for(var i = 0; i < args.objs.length; i++) {
                var wickObj = args.objs[i];

                args.originalStates[i] = {};
                modifyableAttributes.forEach(function(attrib) {
                    args.originalStates[i][attrib] = deepCopy(wickObj[attrib]);
                });

                modifyableAttributes.forEach(function(attrib) {
                    if(args.modifiedStates[i][attrib] !== undefined) {
                        wickObj[attrib] = deepCopy(args.modifiedStates[i][attrib]);
                    }
                });

                if(wickObj.pathData) {
                    if(args.modifiedStates[i]['pathData'] 
                    || args.modifiedStates[i]['rotation'] !== 0 
                    || args.modifiedStates[i]['scaleX'] !== 1
                    || args.modifiedStates[i]['scaleY'] !== 1
                    || args.modifiedStates[i]['flipX'] !== false
                    || args.modifiedStates[i]['flipY'] !== false) {
                        wickEditor.paper.pathRoutines.refreshPathData(wickObj);
                        wickObj.forceFabricCanvasRegen = true;
                        wickObj._renderDirty = true;
                    }
                }
                if(wickObj.textData) {
                    if(args.modifiedStates[i]['textData']) {
                        wickObj._renderDirty = true;
                    }
                }

                var frame = wickObj.parentFrame;
                if(frame.tweens.length > 0) {
                    if(!frame.getTweenAtFrame(wickObj.parentObject.playheadPosition)) {
                        args.createTweenAction = wickEditor.actionHandler.doAction('createMotionTween', { 
                            dontAddToStack: true,
                            frame: frame,
                            playheadPosition: wickObj.parentObject.playheadPosition,
                        });
                    }
                }

                wickObj.updateFrameTween();
            };

            wickEditor.paper.needsUpdate = true;
            done(args);
        },
        function (args) {
            for(var i = 0; i < args.objs.length; i++) {
                var wickObj = args.objs[i];

                if(args.createTweenAction) args.createTweenAction.undoAction();

                // Revert the object's state to it's original pre-transformation state
                modifyableAttributes.forEach(function(attrib) {
                    if(attrib === 'pathData') wickObj.forceFabricCanvasRegen = true;
                    if(args.originalStates[i][attrib] !== undefined) {
                        wickObj[attrib] = deepCopy(args.originalStates[i][attrib]);
                    }
                });

                if(args.originalStates[i]['pathData']) {
                    wickObj.forceFabricCanvasRegen = true;
                }
                if(wickObj.pathData) {
                    if(args.originalStates[i]['rotation'] || args.originalStates[i]['scaleX'] || args.originalStates[i]['scaleY']) {
                        wickEditor.paper.pathRoutines.refreshPathData(wickObj);
                        wickObj._renderDirty = true;
                    }
                }
                
                wickObj.updateFrameTween();
            }

            wickEditor.paper.needsUpdate = true;
            done(args);
        });

    registerAction('convertObjectsToSymbol',
        function (args) {
            var objects = args.objects.concat([]);//make sure we dont modify the original array

            objects.forEach(function(obj) {
                obj._tempZIndex = wickEditor.project.getCurrentFrame().wickObjects.indexOf(obj);
            })
            objects.sort(function (a,b) {
                return a._tempZIndex - b._tempZIndex;
            });

            // Create symbol out of objects
            objects.forEach(function (obj) {
                obj.uuid = random.uuid4();
            })

            var symbol = new WickObject.createSymbolFromWickObjects(objects);
            args.createdSymbol = symbol;

            if(args.button) {
                symbol.addPlayRange(new WickPlayRange(0,1,'mouseup','#4a6588'));
                symbol.addPlayRange(new WickPlayRange(1,2,'mouseover','#4a6588'));
                symbol.addPlayRange(new WickPlayRange(2,3,'mousedown','#4a6588'));
                symbol.isButton = true;
            }
            if(args.group) {
                symbol.isGroup = true;
            }

            // Remove objects from original parent (they are inside the symbol now.)
            objects.forEach(function (wickObject) {
                wickEditor.project.currentObject.removeChild(wickObject);
            });
            wickEditor.project.addObject(symbol, undefined, true);

            if(args.symbolName) {
                symbol.name = wickEditor.project.getNextAvailableName(args.symbolName);
            } else if(args.button) {
                symbol.name = wickEditor.project.getNextAvailableName("New Button");
            } else if(args.group) {
                symbol.name = wickEditor.project.getNextAvailableName("New Group");
            } else {
                symbol.name = wickEditor.project.getNextAvailableName("New Clip");
            }

            wickEditor.project.clearSelection()
            wickEditor.project.selectObject(symbol)

            done(args);
        },
        function (args) {
            var children = args.createdSymbol.getObjectsOnFirstFrame();
            children.forEach(function (child) {
                child.x += child.parentObject.x;
                child.y += child.parentObject.y;
                child.uuid = random.uuid4();
                wickEditor.project.addObject(child, null, true);
            });

            wickEditor.project.currentObject.removeChild(args.createdSymbol);

            done(args);
        });

    /*registerAction('convertFramesToSymbol', 
        function (args) {
            args.createdSymbol = WickObject.createSymbolFromWickFrames(args.frames);

            wickEditor.actionHandler.doAction('deleteObjects', {objects:args.frames});

            var newFrame = new WickFrame();
            newFrame.playheadPosition = wickEditor.project.getCurrentObject().playheadPosition;
            newFrame.wickObjects = [args.createdSymbol];
            wickEditor.actionHandler.doAction('addFrame', {frame:newFrame, layer:wickEditor.project.getCurrentObject().getCurrentLayer()});

            done(args); 
        }, 
        function (args) {
            console.error("convertFramesToSymbol undo NYI!");

            done(args); 
        });*/

    registerAction('breakApartSymbol',
        function (args) {
            args.symbol = args.obj;

            args.children = args.symbol.getObjectsOnFirstFrame();
            args.children.forEach(function (child) {
                args.origOffsetX = child.parentObject.x;
                args.origOffsetY = child.parentObject.y;
                child.x += child.parentObject.x;
                child.y += child.parentObject.y;
                wickEditor.project.addObject(child, null, true);
            });

            wickEditor.project.currentObject.removeChild(args.obj);

            done(args);
        },
        function (args) {
            args.children.forEach(function (child) {
                child.x -= args.origOffsetX;
                child.y -= args.origOffsetY;
                wickEditor.project.currentObject.removeChild(child);
            });

            wickEditor.project.addObject(args.symbol);

            done(args);
        });

    registerAction('addFrame',
        function (args) {
            var currentObject = wickEditor.project.currentObject;

            if (args.layer.getFrameAtPlayheadPosition(args.frame.playheadPosition)) {
                scrap(true); return;
            }

            // Add frame
            args.layer.addFrame(args.frame);
            wickEditor.project.clearSelection();
            wickEditor.project.selectObject(args.frame);

            // Move to that new frame
            args.movePlayheadAction = wickEditor.actionHandler.doAction('movePlayhead', {
                obj:currentObject,
                newPlayheadPosition:args.frame.playheadPosition,
                newLayer:args.layer,
                dontAddToStack: true
            });

            currentObject.framesDirty = true;

            done(args);
        },
        function (args) {
            var currentObject = wickEditor.project.currentObject;
            //args.layer.frames.pop();
            args.layer.removeFrame(args.frame);

            args.movePlayheadAction.undoAction();

            currentObject.framesDirty = true;

            done(args);
        });

    registerAction('addFrames',
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();
            var currentLayer = currentObject.getCurrentLayer();

            wickEditor.project.clearSelection();
            args.frames.forEach(function (frame) {
                frame.playheadPosition = currentLayer.getNextOpenPlayheadPosition(frame.playheadPosition);
                currentLayer.addFrame(frame);
                wickEditor.project.selectObject(frame);
            });

            currentObject.framesDirty = true;
            wickEditor.project.rootObject.generateParentObjectReferences()
            wickEditor.thumbnailRenderer.renderAllThumbsOnTimeline();

            done(args);
        },
        function (args) {
            args.frames.forEach(function (frame) {
                currentLayer.removeFrame(frame);
            });

            currentObject.framesDirty = true;
        })

    registerAction('addNewFrame',
        function (args) {
            var currentObject = wickEditor.project.currentObject;

            // Add an empty frame
            var newFrame = new WickFrame();
            newFrame.playheadPosition = wickEditor.project.getCurrentObject().playheadPosition
            currentObject.getCurrentLayer().addFrame(newFrame);

            currentObject.framesDirty = true;

            done(args);
        },
        function (args) {
            var currentObject = wickEditor.project.currentObject;
            currentObject.getCurrentLayer().frames.pop();

            currentObject.framesDirty = true;

            done(args);
        });

    registerAction('deleteFrame',
        function (args) {
            if(!args.frame) return;

            // Add an empty frame
            var frameRemovedData = args.layer.deleteFrame(args.frame);

            args.frameRemoved = frameRemovedData.frame;
            args.frameRemovedIndex = frameRemovedData.i;

            currentObject.framesDirty = true;

            done(args);
        },
        function (args) {
            args.layer.addFrame(args.frameRemoved, args.frameRemovedIndex);

            currentObject.framesDirty = true;

            done(args);
        });

    registerAction('addNewLayer',
        function (args) {
            var currentObject = wickEditor.project.currentObject;

            // Add an empty frame
            var newLayer = new WickLayer();
            newLayer.frames = [new WickFrame()];
            newLayer.frames[0].playheadPosition = 0;
            currentObject.addLayer(newLayer);

            // Go to last added layer
            currentObject.currentLayer = currentObject.layers.length-1;

            currentObject.framesDirty = true;

            done(args);
        },
        function (args) {
            var currentObject = wickEditor.project.currentObject;

            // Remove last layer added
            currentObject.layers.pop();

            // Go to last added layer
            currentObject.currentLayer = currentObject.layers.length-1;

            currentObject.framesDirty = true;

            done(args);
        });

    registerAction('removeLayer',
        function (args) {
            var currentObject = wickEditor.project.currentObject;
            if(currentObject.layers.length > 1) {
                args.removedLayer = currentObject.getCurrentLayer();
                currentObject.removeLayer(currentObject.getCurrentLayer());
                currentObject.currentLayer = currentObject.layers.length-1;
            }

            currentObject.framesDirty = true;

            done(args);
        },
        function (args) {
            if(args.removedLayer) {
                var currentObject = wickEditor.project.currentObject;
                currentObject.addLayer(args.removedLayer);
            }

            currentObject.framesDirty = true;

            done(args);
        });

    registerAction('moveLayer',
        function (args) {
            args.oldIndex = wickEditor.project.currentObject.layers.indexOf(args.layer);
            wickEditor.project.currentObject.layers.move(args.oldIndex, args.newIndex);
            wickEditor.project.currentObject.currentLayer = args.newIndex;

            wickEditor.project.currentObject.framesDirty = true;

            done(args);
        },
        function (args) {
            wickEditor.project.currentObject.layers.move(args.newIndex, args.oldIndex);
            wickEditor.project.currentObject.currentLayer = args.oldIndex;

            currentObject.framesDirty = true;

            done(args);
        });

    registerAction('moveFrame',
        function (args) {
            args.oldPlayheadPosition = args.frame.playheadPosition;
            args.oldLayer = args.frame.parentLayer;

            args.frame.playheadPosition = args.newPlayheadPosition;
            args.oldLayer.removeFrame(args.frame);
            args.newLayer.addFrame(args.frame);

            //args.oldProjectPlayheadPosition = wickEditor.project.getCurrentObject().playheadPosition;
            //wickEditor.project.getCurrentObject().playheadPosition = args.newPlayheadPosition;

            /*var touching = false;
            args.newLayer.frames.forEach(function (frame) {
                if(frame!==args.frame && frame.touchesFrame(args.frame)) {
                    touching = true;
                }
            });
            if(touching) {
                scrap();return;
            }*/

            /*wickEditor.actionHandler.doAction('movePlayhead', {
                obj: wickEditor.project.currentObject,
                newPlayheadPosition: args.newPlayheadPosition
            });*/

            wickEditor.project.currentObject.framesDirty = true;
            done(args);
        },
        function (args) {
            args.frame.playheadPosition = args.oldPlayheadPosition;

            args.newLayer.removeFrame(args.frame);
            args.oldLayer.addFrame(args.frame);

            //wickEditor.project.getCurrentObject().playheadPosition = args.oldProjectPlayheadPosition;

            wickEditor.project.currentObject.framesDirty = true;
            done(args);
        });

    registerAction('moveFrames', 
        function (args) {
            var fixNegativeOffset = 0;
            for (var i = 0; i < args.framesMoveActionData.length; i++) {
                var frameMoveData = args.framesMoveActionData[i]
                if(frameMoveData.newPlayheadPosition < 0) {
                    fixNegativeOffset = -Math.min(fixNegativeOffset, frameMoveData.newPlayheadPosition)
                }
            }

            var newPlayheadPosition = 0;
            var newLayer = wickEditor.project.getCurrentLayer();

            args.moveFrameActions = [];
            for (var i = 0; i < args.framesMoveActionData.length; i++) {
                var frameMoveData = args.framesMoveActionData[i]
                newPlayheadPosition = frameMoveData.newPlayheadPosition+fixNegativeOffset;
                newLayer = frameMoveData.newLayer;
                args.moveFrameActions.push(wickEditor.actionHandler.doAction('moveFrame', {
                    frame: frameMoveData.frame, 
                    newPlayheadPosition: newPlayheadPosition,
                    newLayer: newLayer,
                    dontAddToStack: true
                }));
            }

            for (var i = 0; i < args.framesMoveActionData.length; i++) {
                var currFrame = args.framesMoveActionData[i].frame
                var touching = false;
                args.framesMoveActionData[i].newLayer.frames.forEach(function (frame) {
                    if(frame!==currFrame && frame.touchesFrame(currFrame)) {
                        touching = true;
                    }
                    if(frame.playheadPosition < 0) {
                        touching = true;
                    }
                });
                if(touching) {
                    scrap();
                }
            }

            args.movePlayheadAction = wickEditor.actionHandler.doAction('movePlayhead', {
                obj: wickEditor.project.getCurrentObject(),
                newPlayheadPosition: newPlayheadPosition,
                newLayer: frameMoveData.newLayer,
                dontAddToStack: true
            });

            wickEditor.project.currentObject.framesDirty = true;
            done(args);
        },
        function (args) {
            args.moveFrameActions.forEach(function (moveFrameAction) {
                moveFrameAction.undoAction();
            })

            if(args.movePlayheadAction) args.movePlayheadAction.undoAction();

            wickEditor.project.currentObject.framesDirty = true;
            done(args);
        });

    registerAction('changeFrameLength',
        function (args) {
            args.oldFrameLength = args.frame.length;
            args.frame.length = Math.max(1, args.newFrameLength);

            var touching = false;
            args.frame.parentLayer.frames.forEach(function (frame) {
                if(frame!==args.frame && frame.touchesFrame(args.frame)) {
                    touching = true;
                }
            });
            if(touching) {
                scrap();
                return;
            }

            wickEditor.project.currentObject.framesDirty = true;
            done(args);
        },
        function (args) {
            args.frame.length = args.oldFrameLength;
            wickEditor.project.currentObject.framesDirty = true;
            done(args);
        });

    registerAction('addPlayRange',
        function (args) {          
            var currentObject = wickEditor.project.getCurrentObject(); 
            
            var playRanges = currentObject.getPlayRanges(); 
        
            for (var i=0; i < playRanges.length; i++) {
                oldPlayRange = playRanges[i]; 

                newStart = args.playRange.getStart(); 
                oldStart = oldPlayRange.getStart(); 
                oldEnd = oldPlayRange.getEnd(); 

                // This playRange overlaps with an old one. 
                if (newStart >= oldStart && newStart < oldEnd) { 
                    args.playRange = null; 
                    break
                } 
                
            }
        
            if (args.playRange) {
                currentObject.addPlayRange(args.playRange); 
                wickEditor.project.currentObject.framesDirty = true;
            }
        
            done(args);
        },
        function (args) {
            if (args.playRange) {
                wickEditor.project.getCurrentObject().removePlayRange(args.playRange)
                wickEditor.project.currentObject.framesDirty = true;
            }
            
            done(args);
        });

    registerAction('modifyPlayRange',
        function (args) {
            args.oldStart = args.playRange.start;
            args.oldEnd   = args.playRange.end;

            if(args.start !== undefined && args.end !== undefined) {
                args.playRange.changeStartAndEnd(args.start, args.end);
            } else {
                if(args.start !== undefined) args.playRange.changeStart(args.start);
                if(args.end   !== undefined) args.playRange.changeEnd  (args.end);
            }

            var touching = false;
            wickEditor.project.getCurrentObject().playRanges.forEach(function (playRange) {
                if(args.playRange === playRange) return;
                if(args.playRange.touchingPlayrange(playRange)) touching = true;
            });
            if(touching) {
                scrap(); 
                return;
            }

            wickEditor.project.currentObject.framesDirty = true;
            done(args);
        },
        function (args) {
            if(args.oldStart !== undefined) args.playRange.start = args.oldStart;
            if(args.oldEnd   !== undefined) args.playRange.end = args.oldEnd;

            wickEditor.project.currentObject.framesDirty = true;
            done(args);
        });

    registerAction('movePlayhead',
        function (args) {
            wickEditor.project.deselectObjectType(WickObject);
            
            args.newPlayheadPosition = Math.max(0, args.newPlayheadPosition)
            
            var currentObject = wickEditor.project.currentObject;

            args.oldPlayheadPosition = args.obj.playheadPosition;
            args.oldLayer = args.obj.currentLayer;

            if(args.newPlayheadPosition !== undefined) {
                var oldFrame = wickEditor.project.getCurrentFrame();
                args.obj.playheadPosition = args.newPlayheadPosition;
                var newFrame = wickEditor.project.getCurrentFrame();
            }

            if(args.newLayer) {
                args.obj.currentLayer = args.obj.layers.indexOf(args.newLayer)
            }

            wickEditor.paper.needsUpdate = true;

            done(args);
            
        },
        function (args) {
            args.obj.playheadPosition = args.oldPlayheadPosition;
            args.obj.currentLayer = args.oldLayer;

            done(args);
        });

    registerAction('editObject',
        function (args) {
            wickEditor.project.clearSelection();

            // Set the editor to be editing this object at its first frame
            args.prevEditedObject = wickEditor.project.currentObject;
            wickEditor.project.currentObject = args.objectToEdit;

            wickEditor.thumbnailRenderer.renderAllThumbsOnTimeline();
            wickEditor.paper.needsUpdate = true;

            done(args);
        },
        function (args) {
            wickEditor.project.clearSelection();
            wickEditor.project.currentObject = args.prevEditedObject;

            wickEditor.paper.needsUpdate = true;

            done(args);
        });

    registerAction('finishEditingCurrentObject',
        function (args) {
            wickEditor.project.clearSelection();
            wickEditor.project.currentObject.playheadPosition = 0;
            args.prevEditedObject = wickEditor.project.currentObject;
            wickEditor.project.currentObject = wickEditor.project.currentObject.parentObject;

            wickEditor.thumbnailRenderer.renderAllThumbsOnTimeline();

            done(args);
        },
        function (args) {
            wickEditor.project.clearSelection();
            wickEditor.project.currentObject = args.prevEditedObject;

            done(args);
        });

    registerAction('moveObjectToZIndex',
        function (args) {
            var currFrame = wickEditor.project.getCurrentFrame();

            args.oldZIndexes = [];
            args.objs.forEach(function (obj) {
                args.oldZIndexes.push(currFrame.wickObjects.indexOf(obj));
            });

            args.objs.sort(function (a,b) {
                if(args.newZIndex === 0)
                    return currFrame.wickObjects.indexOf(a) < currFrame.wickObjects.indexOf(b);
                else 
                    return currFrame.wickObjects.indexOf(a) > currFrame.wickObjects.indexOf(b);
            });

            args.objs.forEach(function (obj) {
                var oldIndex = currFrame.wickObjects.indexOf(obj);
                //console.log(oldIndex)
                currFrame.wickObjects.move(oldIndex, args.newZIndex);
            });

            /*for(var i = 0; i < args.objs.length; i++) {
                var obj = args.objs[i]
                var frame = wickEditor.project.getCurrentFrame();
                var oldZIndex = frame.wickObjects.indexOf(obj);
                var newIndex = args.newIndex;

                wickEditor.project.getCurrentFrame().wickObjects.splice(args.oldZIndexes[i], 1);
                wickEditor.project.getCurrentFrame().wickObjects.splice(args.newZIndex, 0, obj);
            }*/

            done(args);
        },
        function (args) {
            var currFrame = wickEditor.project.getCurrentFrame();

            args.objs.sort(function (a,b) {
                if(args.newZIndex === 0)
                    return currFrame.wickObjects.indexOf(a) < currFrame.wickObjects.indexOf(b);
                else 
                    return currFrame.wickObjects.indexOf(a) > currFrame.wickObjects.indexOf(b);
            });

            args.objs.forEach(function (obj) {
                var oldIndex = currFrame.wickObjects.indexOf(obj);
                var newIndex = args.oldZIndexes[args.objs.indexOf(obj)];
                currFrame.wickObjects.move(oldIndex, newIndex);
            });

            done(args);
        });

    registerAction('moveObjectForwards',
        function (args) {
            var newZIndex = 0;
            args.objs.forEach(function (obj) {
                var z = obj.getZIndex();
                if(z+1 > newZIndex) {
                    newZIndex = z+1;
                }
            });

            var len = args.objs[0].parentFrame.wickObjects.length-1;
            if(newZIndex >= len) newIndex = len;

            args.moveAction = wickEditor.actionHandler.doAction('moveObjectToZIndex', {
                objs: args.objs,
                newZIndex: newZIndex,
                dontAddToStack: true
            });

            done(args);
        },
        function (args) {
            args.moveAction.undoAction();

            done(args);
        });

    registerAction('moveObjectBackwards',
        function (args) {
            var newZIndex = args.objs[0].parentFrame.wickObjects.length-1;
            args.objs.forEach(function (obj) {
                var z = obj.getZIndex();
                if(z-1 < newZIndex) {
                    newZIndex = z-1;
                }
            });

            if(newZIndex < 0) newZIndex = 0;

            args.moveAction = wickEditor.actionHandler.doAction('moveObjectToZIndex', {
                objs: args.objs,
                newZIndex: newZIndex,
                dontAddToStack: true
            });

            done(args);
        },
        function (args) {
            args.moveAction.undoAction();

            done(args);
        });

    registerAction('deleteAsset', 
        function (args) {
            var asset = args.asset;
            args.recoverAsset = args.asset;

            var objectsWithAsset = [];
            wickEditor.project.getAllObjects().forEach(function (wickObject) {
                if(wickObject.assetUUID === asset.uuid) {
                    objectsWithAsset.push(wickObject);
                }
            })
            wickEditor.project.getAllFrames().forEach(function (wickFrame) {
                if(wickFrame.audioAssetUUID === asset.uuid) {
                    wickFrame.audioAssetUUID = null;
                }
            })

            args.deleteAction = wickEditor.actionHandler.doAction('deleteObjects', {
                objects: objectsWithAsset,
                dontAddToStack: true
            });

            wickEditor.project.library.deleteAsset(asset.uuid);

            done(args);
        },
        function (args) {
            wickEditor.project.library.addAsset(args.recoverAsset);

            args.deleteAction.undoAction();

            done(args);
        });

    registerAction('renameAsset', 
        function (args) {
            var asset = args.asset;
            
            args.oldName =  args.asset.filename;
            args.asset.filename = prompt("Enter a new name for the asset:") || "Untitled";

            done(args);
        },
        function (args) {
            args.asset.filename = args.oldName;

            done(args);
        });

    registerAction('addSoundToFrame', 
        function (args) {
            args.oldAssetUUID = args.frame.audioAssetUUID;
            args.frame.audioAssetUUID = args.asset.uuid;

            done(args);
        },
        function (args) {
            args.frame.audioAssetUUID = args.oldAssetUUID;

            done(args);
        });

    registerAction('createMotionTween', 
        function (args) {
            var frame = args.frame;
            
            if(frame.wickObjects.length > 1 || frame.wickObjects[0].isPath) {
                args.createClipAction = wickEditor.actionHandler.doAction('convertObjectsToSymbol', {
                    objects: frame.wickObjects,
                    dontAddToStack: true,
                    group: true,
                    symbolName: 'Tweened Objects'
                });
            }
            
            var wickObj = frame.wickObjects[0];
            var tween = WickTween.fromWickObjectState(wickObj);
            tween.playheadPosition = args.playheadPosition;

            frame.addTween(tween);
            args.addedTween = tween;
            wickEditor.project.getCurrentObject().framesDirty = true;

            done(args);
        },
        function (args) {
            var frame = args.frame;
            frame.removeTween(args.addedTween);
            wickEditor.project.getCurrentObject().framesDirty = true;

            if(args.createClipAction) args.createClipAction.undoAction();

            done(args);
        });

    registerAction('deleteMotionTween', 
        function (args) {
            var frame = args.frame;
            args.removedTween = frame.getCurrentTween();
            frame.removeTween(args.removedTween);
            wickEditor.project.getCurrentObject().framesDirty = true;

            done(args);
        },
        function (args) {
            var frame = args.frame;
            frame.addTween(args.removedTween);
            wickEditor.project.getCurrentObject().framesDirty = true;

            done(args);
        });

    registerAction('moveMotionTween',
        function (args) {
            args.oldPlayheadPosition = args.tween.playheadPosition;
            var boundPlayheadPosition = Math.min(Math.max(0, args.newPlayheadPosition), args.frame.length-1);
            if(args.frame.getTweenAtPlayheadPosition(boundPlayheadPosition)) {
                boundPlayheadPosition = args.oldPlayheadPosition;
            }
            args.tween.playheadPosition = boundPlayheadPosition;
            
            wickEditor.project.currentObject.framesDirty = true;
            done(args);
        }, 
        function (args) {
            args.tween.playheadPosition = args.oldPlayheadPosition

            wickEditor.project.currentObject.framesDirty = true;
            done(args);
        });

    registerAction('copyFrameForward',
        function (args) {
            var frame = wickEditor.project.getSelectedObject();
            var copiedFrame = frame.copy();
            copiedFrame.playheadPosition = frame.getNextOpenPlayheadPosition();

            args.movePlayheadAction = wickEditor.actionHandler.doAction('movePlayhead', {
                obj:wickEditor.project.getCurrentObject(),
                newPlayheadPosition:copiedFrame.playheadPosition,
                newLayer:copiedFrame.parentLayer,
                dontAddToStack: true
            });

            wickEditor.project.getCurrentLayer().addFrame(copiedFrame);
            // wickEditor.project.getCurrentObject().playheadPosition = copiedFrame.playheadPosition;
            wickEditor.project.clearSelection();
            wickEditor.project.selectObject(copiedFrame);

            args.addedFrame = copiedFrame;

            wickEditor.project.currentObject.framesDirty = true;
            done(args);
        }, 
        function (args) {
            wickEditor.project.getCurrentLayer().removeFrame(args.copiedFrame);

            args.movePlayheadAction.undoAction();

            wickEditor.project.currentObject.framesDirty = true;
            done(args);
        });

    registerAction('extendFrameToPosition',
        function (args) {
            var frame = wickEditor.project.getSelectedObject();
            var timelinePlayheadPosition = wickEditor.project.getCurrentObject().playheadPosition;
            var framePlayheadPosition = frame.playheadPosition;

            args.changedFrame = frame;
            args.oldLength = frame.length;
            var numFramesToExtend = timelinePlayheadPosition - framePlayheadPosition + 1;
            frame.length = numFramesToExtend;

            wickEditor.project.currentObject.framesDirty = true;
            done(args);
        }, 
        function (args) {
            args.changedFrame.length = args.oldLength;

            wickEditor.project.currentObject.framesDirty = true;
            done(args);
        });

    registerAction('doBooleanOperation',
        function (args) {
            var removeObjs = args.objs;
            if(args.boolFnName === 'subtract') {
                removeObjs = [args.objs[0]];
            }
            if(args.boolFnName === 'intersect') {
                removeObjs = [args.objs[args.objs.length-1]];
            }

            args.deleteAction = wickEditor.actionHandler.doAction('deleteObjects', {
                objects: removeObjs,
                dontAddToStack: true
            });
            args.addAction = wickEditor.actionHandler.doAction('addObjects', {
                wickObjects: [wickEditor.paper.pathRoutines.getBooleanOpResult(args.boolFnName, args.objs)],
                dontAddToStack: true
            });

            done(args);
        }, 
        function (args) {
            args.addAction.undoAction();
            args.deleteAction.undoAction();

            done(args);
        });

}