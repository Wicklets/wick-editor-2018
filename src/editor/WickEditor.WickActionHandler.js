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
    function done (args) {
        // Sync interfaces + do other post-action cleanup
        wickEditor.canvas.getInteractiveCanvas().needsUpdate = true;
        if(args && args.dontAddToStack) return;
        wickEditor.project.unsaved = true;
        wickEditor.project.rootObject.generateParentObjectReferences();
        wickEditor.project.regenAssetReferences();
        if(!args || !args.dontSync) wickEditor.syncInterfaces();
        if(args) args.dontSync = null;
    }

    // scrap function, call if you need to cancel an action for some reason
    function scrap (dontUndo) {
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

        newAction._selectionAtState = wickEditor.project.getSelectedObjectsUUIDs();
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

        wickEditor.project.clearSelection();
        action._selectionAtState.forEach(function (uuid) {
            wickEditor.project.selectObjectByUUID(uuid);
        })

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
            var currentFrame = wickEditor.project.getCurrentFrame();
            if(!currentFrame) {
                args.addFrameAction = wickEditor.actionHandler.doAction('addNewFrame', {
                    dontAddToStack: true
                });
            } else {
                if(currentFrame.tweens.length > 0) {
                    args.addLayerAction = wickEditor.actionHandler.doAction('addNewLayer', {
                        dontAddToStack: true
                    });
                    wickEditor.project.rootObject.generateParentObjectReferences()
                    args.addFrameAction = wickEditor.actionHandler.doAction('addNewFrame', {
                        dontAddToStack: true
                    });
                }
            }
            
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
            
            done(args);
        },
        function (args) {
            // Remove objects we added
            args.wickObjects.forEach(function (wickObject) {
                wickEditor.project.currentObject.removeChild(wickObject);
            });

            if(args.addFrameAction) args.addFrameAction.undoAction();
            if(args.addLayerAction) args.addLayerAction.undoAction();

            done(args);
        });

    registerAction('deleteObjects',
        function (args) {
            args.restoredObjects = [];
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
                args.restoredObjects.push(object);
                wickEditor.project.currentObject.removeChild(object);
            });

            // Clear selection after deletion.
            wickEditor.project.clearSelection()
            done(args);
        },
        function (args) {
            for(var i = 0; i < args.restoredObjects.length; i++) {
                wickEditor.project.addObject(args.restoredObjects[i], args.oldZIndices[i], true, args.restoredObjects[i].parentFrame);
            }

            done(args);
        });

    registerAction('deleteFrames',
        function (args) {
            args.restoredFrames = [];
            args.frames.forEach(function (frame) {
                args.restoredFrames.push(frame);
                frame.parentLayer.removeFrame(frame);
            });

            wickEditor.project.getCurrentObject().framesDirty = true;
            wickEditor.project.clearSelection()
            done(args);
        },
        function (args) {
            for(var i = 0; i < args.restoredFrames.length; i++) {
                var frame = args.restoredFrames[i];
                frame.parentLayer.addFrame(frame);
            }

            wickEditor.project.getCurrentObject().framesDirty = true;
            done(args);
        });

    var modifyableAttributes = ["x","y","scaleX","scaleY","rotation","opacity","flipX","flipY","pathData","svgX","svgY","width","height","volume", "loop"];

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

                if(wickObj.pathData && args.modifiedStates[i]['pathData']) {
                    wickObj._renderDirty = true;
                }

                var frame = wickObj.parentFrame;
                if(frame && frame.tweens.length > 0) {
                    if(!frame.getTweenAtFrame(wickObj.parentObject.playheadPosition)) {
                        args.createTweenAction = wickEditor.actionHandler.doAction('createMotionTween', { 
                            dontAddToStack: true,
                            frame: frame,
                            playheadPosition: wickEditor.project.getCurrentObject().playheadPosition-frame.playheadPosition,
                        });
                    }
                }

                if(wickObj.updateFrameTween) wickObj.updateFrameTween();
            };

            done(args);
        },
        function (args) {
            for(var i = 0; i < args.objs.length; i++) {
                var wickObj = args.objs[i];

                if(args.createTweenAction) args.createTweenAction.undoAction();

                // Revert the object's state to it's original pre-transformation state
                modifyableAttributes.forEach(function(attrib) {
                    if(args.originalStates[i][attrib] !== undefined) {
                        wickObj[attrib] = deepCopy(args.originalStates[i][attrib]);
                    }
                });

                if(wickObj.pathData) {
                    wickObj._renderDirty = true;
                }
                
                wickObj.updateFrameTween();
            }

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

            symbol.name = args.symbolName;
            if(args.button) {
                //symbol.layers[0].frames.push(symbol.layers[0].frames[0].copy());
                //symbol.layers[0].frames.push(symbol.layers[0].frames[0].copy());

                /*symbol.layers[0].frames[0].name = 'mouseReleased';
                symbol.layers[0].frames[0].playheadPosition = 0;
                symbol.layers[0].frames[1].name = 'mouseHover';
                symbol.layers[0].frames[1].playheadPosition = 1;
                symbol.layers[0].frames[2].name = 'mousePressed';
                symbol.layers[0].frames[2].playheadPosition = 2;*/
                symbol.name = 'New Button'

                symbol.isButton = true;
            } else if(args.group) {
                symbol.isGroup = true;
                symbol.layers[0].frames[0].wickScript = 'stop();';
                symbol.name = 'New Group'
            } else {
                symbol.name = 'New Clip'
            }

            // Remove objects from original parent (they are inside the symbol now.)
            objects.forEach(function (wickObject) {
                wickEditor.project.currentObject.removeChild(wickObject);
            });
            wickEditor.project.addObject(symbol, undefined, true);

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
            args.layer.removeFrame(args.frame);

            if(args.movePlayheadAction) args.movePlayheadAction.undoAction();

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
            wickEditor.project.rootObject.generateParentObjectReferences();

            done(args);
        },
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();
            var currentLayer = currentObject.getCurrentLayer();
            
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

    registerAction('addNewLayer',
        function (args) {
            var currentObject = wickEditor.project.currentObject;

            // Add an empty frame
            var newLayer = new WickLayer();
            newLayer.frames = []; // Make sure the layer has no frames 

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
                args.removedLayer = args.layer;
                args.removedLayerPosition = currentObject.layers.indexOf(args.removedLayer);
                currentObject.removeLayer(args.removedLayer);
                currentObject.currentLayer = currentObject.layers.length-1;
            }

            currentObject.framesDirty = true;

            done(args);
        },
        function (args) {
            if(args.removedLayer) {
                var currentObject = wickEditor.project.currentObject;
                //currentObject.addLayer(args.removedLayer);
                currentObject.layers.splice(args.removedLayerPosition, 0, args.removedLayer);
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

            wickEditor.project.currentObject.framesDirty = true;

            done(args);
        });

    registerAction('moveFrame',
        function (args) {
            args.oldPlayheadPosition = args.frame.playheadPosition;
            args.oldLayer = args.frame.parentLayer;

            args.frame.playheadPosition = args.newPlayheadPosition;
            args.oldLayer.removeFrame(args.frame);
            args.newLayer.addFrame(args.frame);

            wickEditor.project.currentObject.framesDirty = true;
            done(args);
        },
        function (args) {
            args.frame.playheadPosition = args.oldPlayheadPosition;

            args.newLayer.removeFrame(args.frame);
            args.oldLayer.addFrame(args.frame);

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
                    var overlap = frame.getFramesDistance(args.frame).distB;
                    args.frame.length -= overlap;
                }
            });

            wickEditor.project.currentObject.framesDirty = true;
            done(args);
        },
        function (args) {
            args.frame.length = args.oldFrameLength;
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

            //wickEditor.project.currentObject.playheadPosition = 0;

            // Set the editor to be editing this object at its first frame
            args.prevEditedObject = wickEditor.project.currentObject;
            wickEditor.project.currentObject = args.objectToEdit;

            wickEditor.timeline.resetScrollbars();

            done(args);
        },
        function (args) {
            wickEditor.project.clearSelection();
            wickEditor.project.currentObject = args.prevEditedObject;

            wickEditor.timeline.resetScrollbars();

            done(args);
        });

    registerAction('finishEditingCurrentObject',
        function (args) {
            wickEditor.project.clearSelection();
            wickEditor.project.currentObject.playheadPosition = 0;
            args.prevEditedObject = wickEditor.project.currentObject;
            wickEditor.project.currentObject = wickEditor.project.currentObject.parentObject;

            wickEditor.timeline.resetScrollbars();

            done(args);
        },
        function (args) {
            wickEditor.project.clearSelection();
            wickEditor.project.currentObject = args.prevEditedObject;

            wickEditor.timeline.resetScrollbars();

            done(args);
        });

    registerAction('moveObjectToZIndex',
        function (args) {
            var currFrame = args.objs[0].parentFrame;

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
                currFrame.wickObjects.move(oldIndex, args.newZIndex);
            });

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
            if(newZIndex >= len) newZIndex = len;

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
            args.asset.filename = args.newFilename; 

            done(args);
        },
        function (args) {
            args.asset.filename = args.oldName;

            done(args);
        });

    registerAction('addSoundToFrame', 
        function (args) {
            args.oldAudioAssetUUID = args.frame.audioAssetUUID;
            args.oldFrameLength = args.frame.length;

            args.frame.audioAssetUUID = args.asset.uuid;
            args.frame.volume = 1; 
            args.frame._soundDataForPreview = null;
            wickEditor.audioPlayer.clearCacheForFrame(args.frame)

            var frameLengthInSeconds = wickEditor.audioPlayer.getDurationOfSound(args.asset.uuid)
            var frameLengthInFrames = Math.ceil(frameLengthInSeconds*wickEditor.project.framerate);
            
            args.changeLengthAction = wickEditor.actionHandler.doAction('changeFrameLength', {
                frame: args.frame, 
                newFrameLength: frameLengthInFrames,
                dontAddToStack: true,
            });

            wickEditor.project.getCurrentObject().framesDirty = true;
            done(args);
        },
        function (args) {
            args.frame.audioAssetUUID = args.oldAudioAssetUUID;
            args.frame.length = args.oldFrameLength;

            wickEditor.project.getCurrentObject().framesDirty = true;
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

    registerAction('addKeyframe',
        function (args) {
            args.frame.addTween(args.tween);

            wickEditor.project.getCurrentObject().framesDirty = true;
            done(args);
        },
        function (args) {
            args.frame.removeTween(args.tween);

            wickEditor.project.getCurrentObject().framesDirty = true;
            done(args);
        })

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
            var frame = wickEditor.project.getSelectedObject() || wickEditor.project.getCurrentFrame();
            var copiedFrame = frame.copy();
            copiedFrame.playheadPosition = frame.getNextOpenPlayheadPosition();

            args.movePlayheadAction = wickEditor.actionHandler.doAction('movePlayhead', {
                obj:wickEditor.project.getCurrentObject(),
                newPlayheadPosition:copiedFrame.playheadPosition,
                newLayer:copiedFrame.parentLayer,
                dontAddToStack: true
            });

            wickEditor.project.getCurrentLayer().addFrame(copiedFrame);
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

    registerAction('doBooleanOperation',
        function (args) {
            args.objs.forEach(function(obj) {
                obj._tempZIndex = wickEditor.project.getCurrentFrame().wickObjects.indexOf(obj);
            })
            args.objs.sort(function (a,b) {
                return b._tempZIndex - a._tempZIndex;
            });

            if(args.boolFnName === 'unite') {
                var removeObjs = [];
                for (var i = 1; i < args.objs.length; i++) {
                    removeObjs.push(args.objs[i]);
                }
                var superPath = args.objs[0];
                removeObjs.forEach(function (ro) {
                    superPath.paper = superPath.paper.unite(ro.paper);
                });
                var parentAbsPos = wickEditor.project.currentObject.getAbsolutePosition();
                args.modAction = wickEditor.actionHandler.doAction('modifyObjects', {
                    objs: [superPath],
                    modifiedStates: [{
                        x: superPath.paper.position.x - parentAbsPos.x,
                        y: superPath.paper.position.y - parentAbsPos.y,
                        svgX: superPath.paper.bounds._x,
                        svgY: superPath.paper.bounds._y,
                        width: superPath.paper.bounds._width,
                        height: superPath.paper.bounds._height,
                        pathData: superPath.paper.exportSVG({asString:true}),
                    }],
                    dontAddToStack: true,
                });
                args.deleteAction = wickEditor.actionHandler.doAction('deleteObjects', {
                    objects: removeObjs,
                    dontAddToStack: true
                });
            } else if (args.boolFnName === 'subtract') {
                var cuttingPath = args.objs[0];
                var cutPaths = [];
                for (var i = 1; i < args.objs.length; i++) {
                    cutPaths.push(args.objs[i]);
                }
                var modifiedStates = [];
                var modifiedObjects = [];
                cutPaths.forEach(function (cp) {
                    cp.paper = cp.paper.subtract(cuttingPath.paper);
                    modifiedObjects.push(cp);
                    var parentAbsPos = wickEditor.project.currentObject.getAbsolutePosition();
                    modifiedStates.push({
                        x: cp.paper.position.x - parentAbsPos.x,
                        y: cp.paper.position.y - parentAbsPos.y,
                        svgX: cp.paper.bounds._x,
                        svgY: cp.paper.bounds._y,
                        width: cp.paper.bounds._width,
                        height: cp.paper.bounds._height,
                        pathData: cp.paper.exportSVG({asString:true}),
                    });
                });
                args.modAction = wickEditor.actionHandler.doAction('modifyObjects', {
                    objs: modifiedObjects,
                    modifiedStates: modifiedStates,
                    dontAddToStack: true,
                });
            }

            done(args);
        }, 
        function (args) {
            if(args.modAction) args.modAction.undoAction();
            if(args.deleteAction) args.deleteAction.undoAction();

            done(args);
        });

}