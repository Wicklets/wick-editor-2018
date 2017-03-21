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

    /* Class to store data of actions done, stored in the undo/redo stacks */
    var StackActionGroup = function () {
        this.stackActions = [];

        this.doActions = function () {
            this.stackActions.forEach(function (stackAction) {
                stackAction.doAction();
            });
        }

        this.undoActions = function () {
            this.stackActions.forEachBackwards(function (stackAction) {
                stackAction.undoAction();
            });
        }

        this.redoActions = function () {
            this.stackActions.forEachBackwards(function (stackAction) {
                stackAction.doAction();
            });
        }
    }

// Private vars

    // Actions dict, stores action definitions
    var actions = {};

    // Undo/redo action stacks
    var undoStack = [];
    var redoStack = [];

    // Flag that determines if we should chain actions in the stack
    var actionBeingDone = false;

    // Flag to ignore actions called by actions if they're being undone/redone
    var initialAction = true;

    /* Call this to define a new action! */
    var registerAction = function(name, doFunction, undoFunction) {
        actions[name] = new WickAction(name, doFunction, undoFunction);
    }

    // done function, call when a WickAction is finished
    var done = function () {
        actionBeingDone = false;

        // Sync interfaces + do other post-action cleanup
        wickEditor.project.rootObject.generateParentObjectReferences();
        wickEditor.syncInterfaces();
        wickEditor.fabric.canvas.renderAll();
    }

    // scrap function, 
    var scrap = function (dontUndo) {
        actionBeingDone = false;

        if(!dontUndo) self.undoAction();
        redoStack.pop();

        done();
    }

// API

    this.doAction = function (actionName, args) {
        if(!args) args = {};

        if(!initialAction) return;

        // Check for invalid action
        if(!actions[actionName]) {
            console.error(actionName + " is not a defined WickAction!");
            return;
        }

        // Put the action on the undo stack to be undone later
        var newAction = new StackAction(actionName, args);
        if(actionBeingDone) {
            // Action triggered by another action, chain them together
            var lastActionGroup = undoStack.pop();
            lastActionGroup.stackActions.push(newAction);
            undoStack.push(lastActionGroup);
            newAction.doAction();
        } else {
            // Action triggered normally (form outside WickActionHandler), create new group
            var newGroup = new StackActionGroup();
            newGroup.stackActions.push(newAction);
            actionBeingDone = true;
            undoStack.push(newGroup);
            newGroup.doActions();
        }
        redoStack = [];

    }

    this.undoAction = function () {

        // Nothing to undo!
        if (undoStack.length == 0) {
            console.log("undoAction(): No actions on the undo stack.");
            return;
        }

        initialAction = false;

        // Get last action on the undo stack
        var actionGroup = undoStack.pop();

        // Do the action and put it on the redo stack to be redone later
        actionGroup.undoActions();
        redoStack.push(actionGroup);

        initialAction = true;
        
    }

    this.redoAction = function () {

        // Nothing to redo!
        if (redoStack.length == 0) {
            console.log("redoAction(): No actions on the redo stack.");
            return;
        }

        initialAction = false

        // Get last action on the redo stack
        var actionGroup = redoStack.pop();

        // Do the action and put it back onto the undo stack
        actionGroup.redoActions();
        undoStack.push(actionGroup);

        initialAction = true

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
                wickEditor.actionHandler.doAction('addNewFrame');
            }
            var currentFrame = wickEditor.project.getCurrentFrame();

            // Save references to added wick objects so they can be removed on undo
            args.addedObjects = [];
            args.wickObjects.forEach(function (wickObj) {
                args.addedObjects.push(wickObj);
            });

            // Add all the new wick objects
            args.wickObjects.forEach(function (wickObj) {
                wickObj.zIndicesDirty = true;
                wickEditor.project.addObject(wickObj);
                if(!args.dontSelectObjects) wickEditor.project.selectObject(wickObj)
            });
            
            done();
        },
        function (args) {
            // Remove objects we added
            args.wickObjects.forEach(function (wickObject) {
                wickEditor.project.currentObject.removeChild(wickObject);
            });

            done();
        });

    registerAction('deleteObjects',
        function (args) {
            args.restoredObjects = [];
            args.restoredFrames = [];
            args.restoredPlayRanges = [];
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
                }
            });

            done();
        },
        function (args) {
            for(var i = 0; i < args.restoredObjects.length; i++) {
                wickEditor.project.addObject(args.restoredObjects[i], args.oldZIndices[i]);
            }

            args.restoredPlayRanges.forEach(function (restorePlayRange) {
                wickEditor.project.getCurrentObject().addPlayRange(restorePlayRange);
                wickEditor.project.currentObject.framesDirty = true;
            });

            args.restoredFrames.forEach(function (restoreFrame) {
                restoreFrame.parentLayer.addFrame(restoreFrame);
                wickEditor.project.currentObject.framesDirty = true;
            });

            done();
        });

    var modifyableAttributes = ["x","y","scaleX","scaleY","rotation","opacity","flipX","flipY"];

    registerAction('modifyObjects',
        function (args) {
            args.originalStates = [];

            for(var i = 0; i < args.objs.length; i++) {
                var wickObj = args.objs[i];

                args.originalStates[i] = {};
                modifyableAttributes.forEach(function(attrib) {
                    args.originalStates[i][attrib] = wickObj[attrib];
                });

                // This is silly what's a better way ???
                if(wickObj.fontData) {
                    wickObj.forceFabricCanvasRegen = true;
                    args.originalStates[i].text = wickObj.fontData.text;
                    args.originalStates[i].fontFamily = wickObj.fontData.fontFamily;
                    args.originalStates[i].fontSize = wickObj.fontData.fontSize;
                    args.originalStates[i].fontWeight = wickObj.fontData.fontWeight;
                    args.originalStates[i].fontStyle = wickObj.fontData.fontStyle;
                    args.originalStates[i].textDecoration = wickObj.fontData.textDecoration;
                    args.originalStates[i].fill = wickObj.fontData.fill;
                }

                modifyableAttributes.forEach(function(attrib) {
                    if(args.modifiedStates[i][attrib] !== undefined) {
                        wickObj[attrib] = args.modifiedStates[i][attrib];
                    }
                });
                
                // This is silly what's a better way ???
                if(wickObj.fontData) {
                    if(args.modifiedStates[i].text) wickObj.fontData.text = args.modifiedStates[i].text;
                    if(args.modifiedStates[i].fontFamily) wickObj.fontData.fontFamily = args.modifiedStates[i].fontFamily;
                    if(args.modifiedStates[i].fontSize) wickObj.fontData.fontSize = args.modifiedStates[i].fontSize;
                    if(args.modifiedStates[i].fontWeight) wickObj.fontData.fontWeight = args.modifiedStates[i].fontWeight;
                    if(args.modifiedStates[i].fontStyle) wickObj.fontData.fontStyle = args.modifiedStates[i].fontStyle;
                    if(args.modifiedStates[i].textDecoration) wickObj.fontData.textDecoration = args.modifiedStates[i].textDecoration;
                    if(args.modifiedStates[i].fill) wickObj.fontData.fill = args.modifiedStates[i].fill;
                }
                
                // This is silly what's a better way ???
                if(wickObj.tweens.length > 0) {
                    var tween = WickTween.fromWickObjectState(wickObj);
                    tween.frame = wickObj.parentObject.getRelativePlayheadPosition(wickObj);
                    wickObj.addTween(tween);
                }
            };

            done();
        },
        function (args) {
            for(var i = 0; i < args.objs.length; i++) {
                var wickObj = args.objs[i];

                // Revert the object's state to it's original pre-transformation state
                modifyableAttributes.forEach(function(attrib) {
                    if(args.originalStates[i][attrib] !== undefined) {
                        wickObj[attrib] = args.originalStates[i][attrib];
                    }
                });

                // This is silly what's a better way ???
                if(wickObj.fontData) {
                    wickObj.forceFabricCanvasRegen = true;
                    wickObj.fontData.text = args.originalStates[i].text;
                    wickObj.fontData.fontFamily = args.originalStates[i].fontFamily;
                    wickObj.fontData.fontSize = args.originalStates[i].fontSize;
                    wickObj.fontData.fontStyle = args.originalStates[i].fontStyle;
                    wickObj.fontData.fontWeight = args.originalStates[i].fontWeight;
                    wickObj.fontData.textDecoration = args.originalStates[i].textDecoration;
                    wickObj.fontData.fill = args.originalStates[i].fill;
                }
            }

            done();
        });

    registerAction('convertObjectsToSymbol',
        function (args) {
            var objects = args.objects;

            var symbolZIndex = null;
            /*objects.forEach(function (obj) {
                var objZIndex = wickEditor.project.getCurrentFrame().wickObjects.indexOf(obj);
                if(symbolZIndex === null || objZIndex < symbolZIndex) {
                    symbolZIndex = objZIndex;
                }
            });*/

            // Create symbol out of objects
            objects.forEach(function (obj) {
                obj.uuid = random.uuid4();
            })

            var symbol = new WickObject.createSymbolFromWickObjects(objects);
            symbol.zIndicesDirty = true;
            wickEditor.project.addObject(symbol, symbolZIndex, true);
            args.createdSymbol = symbol;

            if(args.button) {
                symbol.addPlayRange(new WickPlayRange(0,1,'mouseup'));
                symbol.addPlayRange(new WickPlayRange(1,2,'mouseover'));
                symbol.addPlayRange(new WickPlayRange(2,3,'mousedown'));
                symbol.isButton = true;
            }

            // Remove objects from original parent (they are inside the symbol now.)
            objects.forEach(function (wickObject) {
                wickEditor.project.currentObject.removeChild(wickObject);
            });

            done();
        },
        function (args) {
            var children = args.createdSymbol.getObjectsOnFirstFrame();
            children.forEach(function (child) {
                child.x += child.parentObject.x;
                child.y += child.parentObject.y;
                child.uuid = random.uuid4();
                wickEditor.project.addObject(child, null, true);
                child.zIndicesDirty = true;
            });

            wickEditor.project.currentObject.removeChild(args.createdSymbol);

            done();
        });

    registerAction('convertFramesToSymbol', 
        function (args) {
            args.createdSymbol = WickObject.createSymbolFromWickFrames(args.frames);

            wickEditor.actionHandler.doAction('deleteObjects', {objects:args.frames});

            var newFrame = new WickFrame();
            newFrame.playheadPosition = wickEditor.project.getCurrentObject().playheadPosition;
            newFrame.wickObjects = [args.createdSymbol];
            wickEditor.actionHandler.doAction('addFrame', {frame:newFrame, layer:wickEditor.project.getCurrentObject().getCurrentLayer()});

            done(); 
        }, 
        function (args) {
            console.error("convertFramesToSymbol undo NYI!");

            done(); 
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
                child.zIndicesDirty = true;
            });

            wickEditor.project.currentObject.removeChild(args.obj);

            done();
        },
        function (args) {
            args.children.forEach(function (child) {
                child.x -= args.origOffsetX;
                child.y -= args.origOffsetY;
                wickEditor.project.currentObject.removeChild(child);
            });

            wickEditor.project.addObject(args.symbol);
            args.symbol.zIndicesDirty = true;

            done();
        });

    registerAction('fillHole',
        function (args) {
            args.oldPathData = wickEditor.project.getCurrentFrame().pathData;
            wickEditor.paper.fillAtPoint(args.x, args.y, args.color);
            wickEditor.paper.cleanupPaths();
            wickEditor.paper.refresh();

            done();
        }, 
        function (args) {
            wickEditor.project.getCurrentFrame().pathData = args.oldPathData;
            wickEditor.paper.updateWickProject();

            done();
        });

    registerAction('addFrame',
        function (args) {
            var currentObject = wickEditor.project.currentObject;

            if (args.layer.getFrameAtPlayheadPosition(args.frame.playheadPosition)) {
                scrap(true); return;
            }

            // Add an empty frame
            args.layer.addFrame(args.frame);

            // Move to that new frame
            wickEditor.actionHandler.doAction('movePlayhead', {
                obj:currentObject,
                newPlayheadPosition:args.frame.playheadPosition,
                newLayer:args.layer
            });

            currentObject.framesDirty = true;

            done();
        },
        function (args) {
            var currentObject = wickEditor.project.currentObject;
            //args.layer.frames.pop();
            args.layer.removeFrame(args.frame);

            currentObject.framesDirty = true;

            done();
        });

    registerAction('addNewFrame',
        function (args) {
            var currentObject = wickEditor.project.currentObject;

            // Add an empty frame
            var newFrame = new WickFrame();
            newFrame.playheadPosition = wickEditor.project.getCurrentObject().playheadPosition
            currentObject.getCurrentLayer().addFrame(newFrame);

            currentObject.framesDirty = true;

            done();
        },
        function (args) {
            var currentObject = wickEditor.project.currentObject;
            currentObject.getCurrentLayer().frames.pop();

            currentObject.framesDirty = true;

            done();
        });

    registerAction('deleteFrame',
        function (args) {
            if(!args.frame) return;

            // Add an empty frame
            var frameRemovedData = args.layer.deleteFrame(args.frame);

            args.frameRemoved = frameRemovedData.frame;
            args.frameRemovedIndex = frameRemovedData.i;

            currentObject.framesDirty = true;

            done();
        },
        function (args) {
            args.layer.addFrame(args.frameRemoved, args.frameRemovedIndex);

            currentObject.framesDirty = true;

            done();
        });

    registerAction('addNewLayer',
        function (args) {
            var currentObject = wickEditor.project.currentObject;

            // Add an empty frame
            var newLayer = new WickLayer();
            newLayer.frames = [];
            currentObject.addLayer(newLayer);

            // Go to last added layer
            currentObject.currentLayer = currentObject.layers.length-1;

            currentObject.framesDirty = true;

            done();
        },
        function (args) {
            var currentObject = wickEditor.project.currentObject;

            // Remove last layer added
            currentObject.layers.pop();

            // Go to last added layer
            currentObject.currentLayer = currentObject.layers.length-1;

            currentObject.framesDirty = true;

            done();
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

            done();
        },
        function (args) {
            if(args.removedLayer) {
                var currentObject = wickEditor.project.currentObject;
                currentObject.addLayer(args.removedLayer);
            }

            currentObject.framesDirty = true;

            done();
        });

    registerAction('moveLayer',
        function (args) {
            args.oldIndex = wickEditor.project.currentObject.layers.indexOf(args.layer);
            wickEditor.project.currentObject.layers.move(args.oldIndex, args.newIndex);
            wickEditor.project.currentObject.currentLayer = args.newIndex;

            wickEditor.project.currentObject.framesDirty = true;

            done();
        },
        function (args) {
            wickEditor.project.currentObject.layers.move(args.newIndex, args.oldIndex);
            wickEditor.project.currentObject.currentLayer = args.oldIndex;

            currentObject.framesDirty = true;

            done();
        });

    registerAction('moveFrame',
        function (args) {
            args.oldPlayheadPosition = args.frame.playheadPosition;
            args.oldLayer = args.frame.parentLayer;

            args.frame.playheadPosition = args.newPlayheadPosition;
            args.oldLayer.removeFrame(args.frame);
            args.newLayer.addFrame(args.frame);

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

            //wickEditor.project.currentObject.framesDirty = true;
            //done();
        },
        function (args) {
            args.frame.playheadPosition = args.oldPlayheadPosition;

            args.newLayer.removeFrame(args.frame);
            args.oldLayer.addFrame(args.frame);
            
            //wickEditor.project.currentObject.framesDirty = true;
            //done();
        });

    registerAction('moveFrames', 
        function (args) {
            for (var i = 0; i < args.framesMoveActionData.length; i++) {
                var frameMoveData = args.framesMoveActionData[i]
                wickEditor.actionHandler.doAction('moveFrame', {
                    frame: frameMoveData.frame, 
                    newPlayheadPosition: frameMoveData.newPlayheadPosition,
                    newLayer: frameMoveData.newLayer
                });
            }

            for (var i = 0; i < args.framesMoveActionData.length; i++) {
                var currFrame = args.framesMoveActionData[i].frame
                var touching = false;
                args.framesMoveActionData[i].newLayer.frames.forEach(function (frame) {
                    if(frame!==currFrame && frame.touchesFrame(currFrame)) {
                        touching = true;
                    }
                });
                if(touching) {
                    scrap();return;
                }
            }

            wickEditor.project.currentObject.framesDirty = true;
            done();
        },
        function (args) {
            

            wickEditor.project.currentObject.framesDirty = true;
            done();
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
                scrap();return;
            }

            wickEditor.project.currentObject.framesDirty = true;
            done();
        },
        function (args) {
            args.frame.length = args.oldFrameLength;
            wickEditor.project.currentObject.framesDirty = true;
            done();
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
        
            done();
        },
        function (args) {
            if (args.playRange) {
                wickEditor.project.getCurrentObject().removePlayRange(args.playRange)
                wickEditor.project.currentObject.framesDirty = true;
            }
            
            done();
        });

    registerAction('modifyPlayRange',
        function (args) {
            args.oldStart = args.start;
            args.oldEnd   = args.end;
            
            if(args.start !== undefined && args.end !== undefined) {
                args.playRange.changeStartAndEnd(args.start, args.end);
            } else {
                if(args.start !== undefined) args.playRange.changeStart(args.start);
                if(args.end   !== undefined) args.playRange.changeEnd  (args.end);
            }

            wickEditor.project.currentObject.framesDirty = true;
            done();
        },
        function (args) {
            if(args.oldStart !== undefined) args.playRange.start = args.oldStart;
            if(args.oldEnd   !== undefined) args.playRange.end = args.oldEnd;

            wickEditor.project.currentObject.framesDirty = true;
            done();
        });

    registerAction('movePlayhead',
        function (args) {
            wickEditor.fabric.forceModifySelectedObjects()
            wickEditor.project.deselectObjectType(WickObject);
            
            args.newPlayheadPosition = Math.max(0, args.newPlayheadPosition)
            
            wickEditor.fabric.onionSkinsDirty = true;
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

            done();
            
        },
        function (args) {
            wickEditor.fabric.forceModifySelectedObjects()
            wickEditor.project.deselectObjectType(WickObject);

            args.obj.playheadPosition = args.oldPlayheadPosition;
            args.obj.currentLayer = args.oldLayer;

            done();
        });

    registerAction('breakApartImage',
        function (args) {
            var wickObj = wickEditor.fabric.getSelectedObject(WickObject);
            wickObj.getBlobImages(function (images) {
                images.forEach(function (image) {
                    var newWickObject = WickObject.fromImage(image.src);
                    newWickObject.x = wickObj.x-wickObj.width /2;
                    newWickObject.y = wickObj.y-wickObj.height/2;
                    newWickObject.autocropImage(function () {
                        wickEditor.actionHandler.doAction('addObjects', { 
                            wickObjects:[newWickObject] 
                        });
                        wickEditor.actionHandler.doAction('deleteObjects', { 
                            wickObjects:[wickObj] 
                        });
                        done();
                    });
                });
            });
        },
        function (args) {
            console.error("breakApartImage undo not yet implemented")
        });

    registerAction('editObject',
        function (args) {
            wickEditor.fabric.deselectAll();

            // Set the editor to be editing this object at its first frame
            args.prevEditedObject = wickEditor.project.currentObject;
            wickEditor.project.currentObject = args.objectToEdit;
            wickEditor.project.currentObject.currentFrame = 0;

            done();
        },
        function (args) {
            wickEditor.fabric.deselectAll();
            wickEditor.project.currentObject = args.prevEditedObject;

            done();
        });

    registerAction('finishEditingCurrentObject',
        function (args) {
            wickEditor.project.currentObject.zIndicesDirty = true;

            wickEditor.fabric.deselectAll();
            wickEditor.project.currentObject.playheadPosition = 0;
            args.prevEditedObject = wickEditor.project.currentObject;
            wickEditor.project.currentObject = wickEditor.project.currentObject.parentObject;

            done();
        },
        function (args) {
            args.prevEditedObject.zIndicesDirty = true;

            wickEditor.fabric.deselectAll();
            wickEditor.project.currentObject = args.prevEditedObject;

            done();
        });

    registerAction('moveObjectToZIndex',
        function (args) {
            args.oldZIndexes = [];
            for(var i = 0; i < args.objs.length; i++) {
                var obj = args.objs[i]
                args.oldZIndexes.push(wickEditor.project.getCurrentFrame().wickObjects.indexOf(obj));
            }
            for(var i = 0; i < args.objs.length; i++) {
                var obj = args.objs[i]
                var frame = wickEditor.project.getCurrentFrame();
                var oldZIndex = frame.wickObjects.indexOf(obj)
                var newIndex = args.newIndex;
                obj.zIndicesDirty = true;

                wickEditor.project.getCurrentFrame().wickObjects.splice(args.oldZIndexes[i], 1);
                wickEditor.project.getCurrentFrame().wickObjects.splice(args.newZIndex, 0, obj);
            }

            done();
        },
        function (args) {
            for(var i = 0; i < args.objs.length; i++) {
                var obj = args.objs[i]
                obj.zIndicesDirty = true;
                wickEditor.project.currentObject.removeChild(args.objs[i]);
                wickEditor.project.getCurrentFrame().wickObjects.splice(args.oldZIndexes[i], 0, obj);
            }

            done();
        });

}