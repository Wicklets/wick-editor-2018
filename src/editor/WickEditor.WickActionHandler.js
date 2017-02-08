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
        
    }

    var done = function () {
        // Regen parent refs
        wickEditor.project.rootObject.generateParentObjectReferences();

        // Sync interfaces / render canvas
        wickEditor.syncInterfaces();
        wickEditor.fabric.canvas.renderAll();
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
            var currentFrame = wickEditor.project.currentObject.getCurrentFrame();

            if(args.wickObjects) {
                // Make sure any paths from copy/paste get handled by paper.js
                args.wickObjects.forEach(function (wickObj) {
                    if(wickObj.pathData) {
                        if(!args.paths) args.paths = [];
                        //var path = wickEditor.paper.getPathDataOfWickObject(wickObj.uuidCopiedFrom);
                        var path = {svg:wickObj.pathData, x:wickObj.x, y:wickObj.y}
                        path.selectOnAddToFabric = true;
                        args.paths.push(path);
                    }
                });
                // Save references to added wick objects so they can be removed on undo
                args.addedObjects = [];
                args.wickObjects.forEach(function (wickObj) {
                    if(wickObj.pathData) return;
                    args.addedObjects.push(wickObj);
                });
                // Add all the new wick objects
                args.wickObjects.forEach(function (wickObj) {
                    if(wickObj.pathData) return;
                    wickObj.zIndicesDirty = true;
                    wickEditor.project.addObject(wickObj);
                });
            }

            // Save current state of frame's SVG
            args.oldPathData = currentFrame.pathData;
            if(args.paths) {
                // Add all new paths
                args.paths.forEach(function (pathData) {
                    wickEditor.paper.addPath(pathData.svg, {x:pathData.x, y:pathData.y}, pathData.isEraserPath, pathData.selectOnAddToFabric);
                    if(pathData.isEraserPath) {
                        wickEditor.paper.cleanupPaths();
                        wickEditor.paper.refresh();
                    }
                });            
            }

            // Optimization: Don't update the other paths until later (makes adding paths way faster.) Keep the next line commented out!!!
            //wickEditor.paper.refresh();
            wickEditor.paper.saveFrameSVG();

            done();
        },
        function (args) {
            // Remove objects we added
            (args.wickObjects || []).forEach(function (wickObject) {
                wickEditor.project.currentObject.removeChild(wickObject);
            });

            // Restore old frame SVG state
            if(args.paths) {
                wickEditor.project.currentObject.getCurrentFrame().pathData = args.oldPathData;
                wickEditor.paper.updateWickProject();

                wickEditor.paper.cleanupPaths(true);
                wickEditor.paper.refresh();
            }

            done();
        });

    this.registerAction('deleteObjects',
        function (args) {
            args.restoredObjects = []
            args.oldZIndices = [];

            // Store the old z index vars for each object.
            // Must do this before removing them all.
            args.wickObjects.forEach(function (wickObject) {
                if(wickObject.pathData) {

                } else {
                    var zIndex = wickEditor.project.currentObject.getCurrentFrame().wickObjects.indexOf(wickObject);
                    args.oldZIndices.push(zIndex);
                }
            });

            // Now remove them
            args.oldPathData = wickEditor.project.currentObject.getCurrentFrame().pathData;
            args.wickObjects.forEach(function (wickObject) {
                if(wickObject.pathData) {
                    wickEditor.paper.removePath(wickObject.uuid);
                } else {
                    args.restoredObjects.push(wickObject);
                    wickEditor.project.currentObject.removeChild(wickObject);
                }
            });

            wickEditor.paper.refresh();

            done();
        },
        function (args) {
            for(var i = 0; i < args.restoredObjects.length; i++) {
                wickEditor.project.addObject(args.restoredObjects[i], args.oldZIndices[i]);
            }

            wickEditor.project.currentObject.getCurrentFrame().pathData = args.oldPathData;
            wickEditor.paper.updateWickProject();

            done();
        });

    var modifyableAttributes = ["x","y","scaleX","scaleY","rotation","opacity","flipX","flipY"];

    this.registerAction('modifyObjects',
        function (args) {
            args.originalStates = [];

            for(var i = 0; i < args.objs.length; i++) {
                var wickObj = args.objs[i];
                if(wickObj.pathData) continue;

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

            var currentFrame = wickEditor.project.currentObject.getCurrentFrame();
            args.oldPathData = currentFrame.pathData;
            for(var i = 0; i < args.objs.length; i++) {
                var wickObj = args.objs[i];
                if(!wickObj.pathData) continue;
                wickEditor.paper.modifyPath(wickObj.uuid, {
                    x: args.modifiedStates[i].x || wickObj.x,
                    y: args.modifiedStates[i].y || wickObj.y,
                    scaleX: args.modifiedStates[i].scaleX || 1,
                    scaleY: args.modifiedStates[i].scaleY || 1,
                    rotation: args.modifiedStates[i].rotation || 0
                })
            };
            wickEditor.paper.cleanupPaths();
            wickEditor.paper.refresh();

            done();
        },
        function (args) {
            for(var i = 0; i < args.objs.length; i++) {
                var wickObj = args.objs[i];
                if(wickObj.pathData) continue;

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

            wickEditor.project.currentObject.getCurrentFrame().pathData = args.oldPathData;
            wickEditor.paper.updateWickProject();

            done();
        });

    this.registerAction('convertObjectsToSymbol',
        function (args) {
            var objects = args.objects;

            var symbolZIndex = null;
            /*objects.forEach(function (obj) {
                var objZIndex = wickEditor.project.currentObject.getCurrentFrame().wickObjects.indexOf(obj);
                if(symbolZIndex === null || objZIndex < symbolZIndex) {
                    symbolZIndex = objZIndex;
                }
            });*/

            // Create symbol out of objects
            var symbol = new WickObject.createSymbolFromWickObjects(objects);
            wickEditor.project.addObject(symbol, symbolZIndex, true);
            args.createdSymbol = symbol;

            // Remove objects from original parent (they are inside the symbol now.)
            objects.forEach(function (wickObject) {
                if(wickObject.pathData) {
                    wickEditor.paper.removePath(wickObject.uuid);
                    var firstFrame = symbol.layers[0].frames[0];
                    if(firstFrame.pathDataToAdd === null) firstFrame.pathDataToAdd = [];
                    firstFrame.pathDataToAdd.push({
                        svg: wickObject.pathData,
                        x: wickObject.x,
                        y: wickObject.y
                    });
                } else {
                    wickEditor.project.currentObject.removeChild(wickObject);
                }
            });

            wickEditor.paper.refresh();

            done();
        },
        function (args) {
            var children = args.createdSymbol.getObjectsOnFirstFrame();
            children.forEach(function (child) {
                child.x += child.parentObject.x;
                child.y += child.parentObject.y;
                if(child.pathData) {
                    wickEditor.paper.addPath(child.pathData, {x:child.x, y:child.y});
                } else {
                    wickEditor.project.addObject(child, null, true);
                }
            });
            wickEditor.paper.refresh();
            wickEditor.paper.updateWickProject();

            wickEditor.project.currentObject.removeChild(args.createdSymbol);

            done();
        });

    this.registerAction('breakApartSymbol',
        function (args) {
            args.symbol = args.obj;

            args.children = args.symbol.getObjectsOnFirstFrame();
            args.children.forEach(function (child) {
                child.x += child.parentObject.x;
                child.y += child.parentObject.y;
                if(child.pathData) {
                    wickEditor.paper.addPath(child.pathData, {x:child.x, y:child.y});
                } else {
                    wickEditor.project.addObject(child, null, true);
                }
            });
            wickEditor.paper.refresh();
            wickEditor.paper.updateWickProject();

            wickEditor.project.currentObject.removeChild(args.obj);

            done();
        },
        function (args) {
            args.children.forEach(function (child) {
                child.x -= child.parentObject.x;
                child.y -= child.parentObject.y;
                //wickEditor.project.currentObject.removeChild(child);

                if(child.pathData) {
                    //wickEditor.paper.removePath(child.uuid);
                    var firstFrame = args.symbol.layers[0].frames[0];
                    if(firstFrame.pathDataToAdd === null) firstFrame.pathDataToAdd = [];
                    firstFrame.pathDataToAdd.push({
                        svg: child.pathData,
                        x: child.x,
                        y: child.y
                    });
                } else {
                    wickEditor.project.currentObject.removeChild(wickObject);
                }
            });
            wickEditor.paper.refresh();
            wickEditor.paper.updateWickProject();

            wickEditor.project.addObject(args.symbol);

            done();
        });

    this.registerAction('fillHole',
        function (args) {
            args.oldPathData = wickEditor.project.currentObject.getCurrentFrame().pathData;
            wickEditor.paper.fillAtPoint(args.x, args.y, args.color);
            wickEditor.paper.cleanupPaths();
            wickEditor.paper.refresh();

            done();
        }, 
        function (args) {
            wickEditor.project.currentObject.getCurrentFrame().pathData = args.oldPathData;
            wickEditor.paper.updateWickProject();

            done();
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

            done();
        },
        function (args) {
            var currentObject = wickEditor.project.currentObject;
            currentObject.getCurrentLayer().frames.pop();

            done();
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

            done();
        },
        function (args) {
            var currentObject = wickEditor.project.currentObject;
            currentObject.getCurrentLayer().frames.pop();

            done();
        });

    this.registerAction('deleteFrame',
        function (args) {
            if(!args.frame) return;

            // Add an empty frame
            var frameRemovedData = args.layer.deleteFrame(args.frame);

            args.frameRemoved = frameRemovedData.frame;
            args.frameRemovedIndex = frameRemovedData.i;

            done();
        },
        function (args) {
            args.layer.addFrame(args.frameRemoved, args.frameRemovedIndex);

            done();
        });

    this.registerAction('addNewLayer',
        function (args) {
            var currentObject = wickEditor.project.currentObject;

            // Add an empty frame
            currentObject.addLayer(new WickLayer());

            // Go to last added layer
            currentObject.currentLayer = currentObject.layers.length-1;

            done();
        },
        function (args) {
            var currentObject = wickEditor.project.currentObject;

            // Remove last layer added
            currentObject.layers.pop();

            // Go to last added layer
            currentObject.currentLayer = currentObject.layers.length-1;

            done();
        });

    this.registerAction('removeLayer',
        function (args) {
            var currentObject = wickEditor.project.currentObject;
            if(currentObject.layers.length > 1) {
                args.removedLayer = currentObject.getCurrentLayer();
                currentObject.removeLayer(currentObject.getCurrentLayer());
                currentObject.currentLayer = currentObject.layers.length-1;
            }

            done();
        },
        function (args) {
            if(args.removedLayer) {
                var currentObject = wickEditor.project.currentObject;
                currentObject.addLayer(args.removedLayer);
            }

            done();
        });

    this.registerAction('moveLayerUp',
        function (args) {
            var currentObject = wickEditor.project.currentObject;
            if(currentObject.currentLayer === 0) return;
            currentObject.layers.move(currentObject.currentLayer, currentObject.currentLayer-1);

            done();
        },
        function (args) {
            var currentObject = wickEditor.project.currentObject;
            if(currentObject.currentLayer === currentObject.layers.length-1) return;
            currentObject.layers.move(currentObject.currentLayer, currentObject.currentLayer+1);

            done();
        });

    this.registerAction('moveLayerDown',
        function (args) {
            var currentObject = wickEditor.project.currentObject;
            if(currentObject.currentLayer === currentObject.layers.length-1) return;
            currentObject.layers.move(currentObject.currentLayer, currentObject.currentLayer+1);

            done();
        },
        function (args) {
            var currentObject = wickEditor.project.currentObject;
            if(currentObject.currentLayer === 0) return;
            currentObject.layers.move(currentObject.currentLayer, currentObject.currentLayer-1);

            done();
        });

    /*this.registerAction('addBreakpoint',
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
        });*/

    this.registerAction('extendFrame',
        function (args) {
            args.frame.extend(args.nFramesToExtendBy);
            done();
        },
        function (args) {
            args.frame.shrink(args.nFramesToExtendBy);
            done();
        });

    this.registerAction('shrinkFrame',
        function (args) {
            args.frame.shrink(args.nFramesToShrinkBy);
            done();
        },
        function (args) {
            args.frame.extend(args.nFramesToShrinkBy);
            done();
        });

    this.registerAction('movePlayhead',
        function (args) {
            var proceed = function () {
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

                wickEditor.syncInterfaces();

                done();
            }

            var currentFrame = wickEditor.project.currentObject.getCurrentFrame();
            if(!currentFrame) {
                proceed();
            } else {
                //wickEditor.fabric.projectRenderer.getCanvasThumbnail(function (thumbnail) { 
                //    currentFrame.thumbnail = thumbnail;
                    proceed();
                //});
            }
            
        },
        function (args) {
            wickEditor.fabric.deselectAll();

            args.obj.playheadPosition = args.oldPlayheadPosition;

            done();
        });

    this.registerAction('breakApartImage',
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

    this.registerAction('editObject',
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

    this.registerAction('finishEditingCurrentObject',
        function (args) {
            wickEditor.fabric.deselectAll();
            wickEditor.project.currentObject.playheadPosition = 0;
            args.prevEditedObject = wickEditor.project.currentObject;
            wickEditor.project.currentObject = wickEditor.project.currentObject.parentObject;

            done();
        },
        function (args) {
            wickEditor.fabric.deselectAll();
            wickEditor.project.currentObject = args.prevEditedObject;

            done();
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

            done();
        },
        function (args) {
            for(var i = 0; i < args.objs.length; i++) {
                var obj = args.objs[i]
                obj.zIndicesDirty = true;
                wickEditor.project.currentObject.removeChild(args.objs[i]);
                wickEditor.project.currentObject.getCurrentFrame().wickObjects.splice(args.oldZIndexes[i], 0, obj);
            }

            done();
        });

}