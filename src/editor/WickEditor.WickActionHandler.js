/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/* WickActionHandler.js - General Logic for how undo and redo is handled in the Wick editor. */
/* Only add routines to WickActionHandler if they:
     (1) Change the state of the project and
     (2) Can be undone/redone */

var WickActionHandler = function (wickEditor) {

    var self = this;

    /* WickAction definition. All user actions are expected to be well defined by
   this structure in order to properly be done and undone. */

    var WickAction = function (name, doAction, undoAction) {

        this.name = name;

        /* To be called when an action is committed by the user. */
        this.doAction = doAction;

        /* To be called when this the user undoes this action. This should revert
           the state of the wickEditor or wickObject back to its original state. */
        this.undoAction = undoAction;

        /* 'args' is used to pass any data that the action needs.
           'args' also saves anything that the undo will use later,
           For example, to undo a delete we need to bring back that deleted object...
           In this case the object that gets deleted gets stored in args! */
        this.args = {};

    }

// Undo/redo action stacks

    this.undoStack = [];
    this.redoStack = [];

// doActions and undoActions, dicts that store functions for doing and undoing all actions

    this.doActions = {};
    this.undoActions = {};

    /* Call this to define a new action! */
    this.registerAction = function(name, doFunction, undoFunction) {
        this.doActions[name] = doFunction;
        this.undoActions[name] = undoFunction;
    }

    this.doAction = function (actionName, args) {

        // Create a new WickAction object
        var action = new WickAction(
            actionName,
            this.doActions[actionName],
            this.undoActions[actionName]
        );
        action.fname = actionName;
        if(!action.doAction) {
            console.error(actionName + " is not a defined do action!");
        }
        if(!action.undoAction) {
            console.error(actionName + " is not a defined undo action!");
        }

        // Pass the arguments over to the WickAction and call its doAction function
        action.args = args;
        action.doAction(action.args);

        // Put the action on the undo stack to be undone later
        this.undoStack.push(action);
        this.redoStack = [];

        // Regen parent refs
        wickEditor.project.rootObject.generateParentObjectReferences();

        // Sync interfaces / render canvas
        wickEditor.syncInterfaces();
        wickEditor.fabric.canvas.renderAll();

    }

    this.undoAction = function () {

        // Nothing to undo!
        if (this.undoStack.length == 0) {
            console.log("undoAction(): No actions on the undo stack.");
            return;
        }

        // Get last action on the undo stack
        var action = this.undoStack.pop();

        // Do the action and put it on the redo stack to be redone later
        action.undoAction(action.args);
        this.redoStack.push(action);

        // Sync interfaces
        wickEditor.syncInterfaces();
        
    }

    this.redoAction = function () {

        // Nothing to redo!
        if (this.redoStack.length == 0) {
            console.log("redoAction(): No actions on the redo stack.");
            return;
        }

        // Get last action on the redo stack
        var action = this.redoStack.pop();

        // Do the action and put it back onto the undo stack
        action.doAction(action.args);
        this.undoStack.push(action);

        // Sync interfaces
        wickEditor.syncInterfaces();

    }

    this.clearHistory = function () {
        this.undoStack = [];
        this.redoStack = [];
    }

    this.printHistory = function () {
        this.undoStack.forEach(function (action) {
            console.log("Action " + self.undoStack.indexOf(action) + ":")
            console.log(action.name);
        })
    }

// Register all actions

    this.registerAction('addObjects',
        function (args) {
            // Make a new frame if one doesn't exist at the playhead position
            if(!wickEditor.project.currentObject.getCurrentFrame()) {
                wickEditor.actionHandler.doAction('addNewFrame');
            }

            if(args.wickObjects) {
                // Save references to added wick objects so they can be removed on undo
                args.addedObjects = [];
                args.wickObjects.forEach(function (wickObj) {
                    args.addedObjects.push(wickObj);
                });
                // Add all the new wick objects
                args.wickObjects.forEach(function (wickObj) {
                    wickEditor.project.addObject(wickObj);
                });
            }

            if(args.paths) {
                // Save current state of frame's SVG
                // TODO
                // Add all new paths
                args.paths.forEach(function (path) {
                    wickEditor.paper.addPath(path);
                });
            }
        },
        function (args) {
            // Remove objects we added
            for(var i = 0; i < args.wickObjects.length; i++) {
                var wickObject = args.addedObjects[i];
                wickEditor.project.currentObject.removeChild(wickObject);
            }

            // Restore old frame SVG state
            // TODO
        });

    this.registerAction('deleteObjects',
        function (args) {
            args.restoredObjects = []
            args.oldZIndices = [];

            // Store the old z index vars for each object.
            // Must do this before removing them all.
            for(var i = 0; i < args.objs.length; i++) {
                var obj = args.objs[i];
                var zIndex = wickEditor.project.currentObject.getCurrentFrame().wickObjects.indexOf(obj);
                args.oldZIndices.push(zIndex);
            }

            // Now remove them
            for(var i = 0; i < args.objs.length; i++) {
                var obj = args.objs[i];
                args.restoredObjects.push(obj);
                wickEditor.project.currentObject.removeChild(args.objs[i]);
            }
        },
        function (args) {
            for(var i = 0; i < args.restoredObjects.length; i++) {
                wickEditor.project.addObject(args.restoredObjects[i], args.oldZIndices[i]);
            }
        });

    var modifyableAttributes = ["x","y","scaleX","scaleY","angle","opacity","flipX","flipY"];

    this.registerAction('modifyObjects',
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
            }
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
        });

    this.registerAction('convertSelectionToSymbol',
        function (args) {
            var selectedObjects = wickEditor.fabric.getSelectedObjects(WickObject);

            var symbolZIndex = null;
            selectedObjects.forEach(function (obj) {
                var objZIndex = wickEditor.project.currentObject.getCurrentFrame().wickObjects.indexOf(obj);
                if(symbolZIndex === null || objZIndex < symbolZIndex) {
                    symbolZIndex = objZIndex;
                }
            });
            
            selectedObjects.forEach(function (obj) {
                wickEditor.project.currentObject.removeChild(obj);
                obj.inFrameSVG = false;
            });

            var symbol = new WickObject.createSymbolFromWickObjects(selectedObjects);
            wickEditor.project.addObject(symbol, symbolZIndex, true);
            args.createdSymbol = symbol;
            symbol.selectOnAddToFabric = true;
        },
        function (args) {
            args.symbol = args.createdSymbol;

            args.children = args.symbol.getObjectsOnFirstFrame();
            args.children.forEach(function (child) {
                child.x = child.getAbsolutePosition().x;
                child.y = child.getAbsolutePosition().y;
                wickEditor.project.addObject(child);
            });

            wickEditor.project.currentObject.removeChild(args.createdSymbol);
        });

    this.registerAction('breakApartSymbol',
        function (args) {
            args.symbol = args.obj;

            args.children = args.symbol.getObjectsOnFirstFrame();
            args.children.forEach(function (child) {
                //child.x += args.symbol.x;
                //child.y += args.symbol.y;
                child.x = child.getAbsolutePosition().x;
                child.y = child.getAbsolutePosition().y;
                wickEditor.project.addObject(child);
            });

            wickEditor.project.currentObject.removeChild(args.obj);
        },
        function (args) {
            args.children.forEach(function (child) {
                child.x -= args.symbol.x;
                child.y -= args.symbol.y;
                wickEditor.project.currentObject.removeChild(child);
            });
            wickEditor.project.addObject(args.symbol);
        });

    this.registerAction('addFrame',
        function (args) {
            var currentObject = wickEditor.project.currentObject;

            // Add an empty frame
            currentObject.getCurrentLayer().addFrame(args.frame);

            // Move to that new frame
            wickEditor.actionHandler.doAction('movePlayhead', {
                obj:currentObject,
                newPlayheadPosition:currentObject.getCurrentLayer().getTotalLength()-1
            });
        },
        function (args) {
            var currentObject = wickEditor.project.currentObject;
            currentObject.getCurrentLayer().frames.pop();
        });

    this.registerAction('addNewFrame',
        function (args) {
            var currentObject = wickEditor.project.currentObject;

            // Add an empty frame
            currentObject.getCurrentLayer().addFrame(new WickFrame());

            // Move to that new frame
            wickEditor.actionHandler.doAction('movePlayhead', {
                obj:currentObject,
                newPlayheadPosition:currentObject.getCurrentLayer().getTotalLength()-1
            });
        },
        function (args) {
            var currentObject = wickEditor.project.currentObject;
            currentObject.getCurrentLayer().frames.pop();
        });

    this.registerAction('deleteFrame',
        function (args) {
            if(!args.frame) return;

            // Add an empty frame
            var frameRemovedData = args.layer.deleteFrame(args.frame);

            args.frameRemoved = frameRemovedData.frame;
            args.frameRemovedIndex = frameRemovedData.i;
        },
        function (args) {
            args.layer.addFrame(args.frameRemoved, args.frameRemovedIndex);
        });

    this.registerAction('addNewLayer',
        function (args) {
            var currentObject = wickEditor.project.currentObject;

            // Add an empty frame
            currentObject.addLayer(new WickLayer());

            // Go to last added layer
            currentObject.currentLayer = currentObject.layers.length-1;
        },
        function (args) {
            var currentObject = wickEditor.project.currentObject;

            // Remove last layer added
            currentObject.layers.pop();

            // Go to last added layer
            currentObject.currentLayer = currentObject.layers.length-1;
        });

    this.registerAction('removeLayer',
        function (args) {
            var currentObject = wickEditor.project.currentObject;
            if(currentObject.layers.length > 1) {
                args.removedLayer = currentObject.getCurrentLayer();
                currentObject.removeLayer(currentObject.getCurrentLayer());
                currentObject.currentLayer = currentObject.layers.length-1;
            }
        },
        function (args) {
            if(args.removedLayer) {
                var currentObject = wickEditor.project.currentObject;
                currentObject.addLayer(args.removedLayer);
            }
        });

    this.registerAction('moveLayerUp',
        function (args) {
            var currentObject = wickEditor.project.currentObject;
            if(currentObject.currentLayer === 0) return;
            currentObject.layers.move(currentObject.currentLayer, currentObject.currentLayer-1);
        },
        function (args) {
            var currentObject = wickEditor.project.currentObject;
            if(currentObject.currentLayer === currentObject.layers.length-1) return;
            currentObject.layers.move(currentObject.currentLayer, currentObject.currentLayer+1);
        });

    this.registerAction('moveLayerDown',
        function (args) {
            var currentObject = wickEditor.project.currentObject;
            if(currentObject.currentLayer === currentObject.layers.length-1) return;
            currentObject.layers.move(currentObject.currentLayer, currentObject.currentLayer+1);
        },
        function (args) {
            var currentObject = wickEditor.project.currentObject;
            if(currentObject.currentLayer === 0) return;
            currentObject.layers.move(currentObject.currentLayer, currentObject.currentLayer-1);
        });

    this.registerAction('addBreakpoint',
        function (args) {
            args.oldAutoplayState = args.frame.autoplay;
            args.frame.autoplay = false;
        },
        function (args) {
            args.frame.autoplay = args.oldAutoplayState;
        });

    this.registerAction('removeBreakpoint',
        function (args) {
            args.oldAutoplayState = args.frame.autoplay;
            args.frame.autoplay = true;
        },
        function (args) {
            args.frame.autoplay = args.oldAutoplayState;
        });

    this.registerAction('extendFrame',
        function (args) {
            args.frame.extend(args.nFramesToExtendBy);
        },
        function (args) {
            args.frame.shrink(args.nFramesToExtendBy);
        });

    this.registerAction('shrinkFrame',
        function (args) {
            args.frame.shrink(args.nFramesToShrinkBy);
        },
        function (args) {
            args.frame.extend(args.nFramesToShrinkBy);
        });

    this.registerAction('movePlayhead',
        function (args) {
            wickEditor.fabric.deselectAll();
            
            wickEditor.fabric.onionSkinsDirty = true;
            var currentObject = wickEditor.project.currentObject;

            args.oldPlayheadPosition = args.obj.playheadPosition;

            var oldFrame = currentObject.getCurrentFrame();
            if(args.moveAmount !== undefined) {
                args.obj.playheadPosition += args.moveAmount;
                if(args.obj.playheadPosition < 0) args.obj.playheadPosition = 0;
            } else if (args.newPlayheadPosition !== undefined) {
                args.oldPlayheadPosition = args.obj.playheadPosition;
                args.obj.playheadPosition = args.newPlayheadPosition;
            }
            var newFrame = wickEditor.project.currentObject.getCurrentFrame();
            
        },
        function (args) {
            wickEditor.fabric.deselectAll();

            args.obj.playheadPosition = args.oldPlayheadPosition;
        });

    this.registerAction('breakApartImage',
        function (args) {
            var wickObj = wickEditor.fabric.getSelectedObject(WickObject);
            wickObj.getBlobImages(function (images) {
                images.forEach(function (image) {
                    WickObject.fromImage(image.src, function (newWickObject) {
                        newWickObject.x = wickObj.x-wickObj.width /2;
                        newWickObject.y = wickObj.y-wickObj.height/2;
                        newWickObject.autocropImage(function () {
                            wickEditor.actionHandler.doAction('addObjects', { wickObjects:[newWickObject] });
                            wickEditor.actionHandler.doAction('deleteObjects', { objs:[wickObj] });
                        });
                    })
                });
            });
        },
        function (args) {
            console.error("breakApartImage undo not yet implemented")
        });

    this.registerAction('editObject',
        function (args) {
            wickEditor.fabric.deselectAll();

            // Set the editor to be editing this object at its first frame
            args.prevEditedObject = wickEditor.project.currentObject;
            wickEditor.project.currentObject = args.objectToEdit;
            wickEditor.project.currentObject.currentFrame = 0;
        },
        function (args) {
            wickEditor.fabric.deselectAll();
            wickEditor.project.currentObject = args.prevEditedObject;
        });

    this.registerAction('finishEditingCurrentObject',
        function (args) {
            wickEditor.fabric.deselectAll();
            wickEditor.project.currentObject.playheadPosition = 0;
            args.prevEditedObject = wickEditor.project.currentObject;
            wickEditor.project.currentObject = wickEditor.project.currentObject.parentObject;
        },
        function (args) {
            wickEditor.fabric.deselectAll();
            wickEditor.project.currentObject = args.prevEditedObject;
        });

    this.registerAction('moveObjectToZIndex',
        function (args) {
            args.oldZIndexes = [];
            for(var i = 0; i < args.objs.length; i++) {
                var obj = args.objs[i]
                args.oldZIndexes.push(wickEditor.project.currentObject.getCurrentFrame().wickObjects.indexOf(obj));
            }
            for(var i = 0; i < args.objs.length; i++) {
                var obj = args.objs[i]
                obj.zIndicesDirty = true;
                wickEditor.project.currentObject.getCurrentFrame().wickObjects.splice(args.oldZIndexes[i], 1);
                wickEditor.project.currentObject.getCurrentFrame().wickObjects.splice(args.newZIndex, 0, obj);
            }
        },
        function (args) {
            for(var i = 0; i < args.objs.length; i++) {
                var obj = args.objs[i]
                obj.zIndicesDirty = true;
                wickEditor.project.currentObject.removeChild(args.objs[i]);
                wickEditor.project.currentObject.getCurrentFrame().wickObjects.splice(args.oldZIndexes[i], 0, obj);
            }
        });

}