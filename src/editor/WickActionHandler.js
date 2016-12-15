/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/* WickActionHandler.js - General Logic for how undo and redo is handled in the Wick editor. */

var WickActionHandler = function (wickEditor) {

    /* WickAction definition. All user actions are expected to be well defined by
   this structure in order to properly be done and undone. */

    var WickAction = function (doAction, undoAction) {

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
        wickEditor.interfaces.fabric.canvas.renderAll();

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

// Register all actions

    this.registerAction('addObjects', 
        function (args) {
            // Make a new frame if one doesn't exist at the playhead position
            if(!wickEditor.project.getCurrentObject().getCurrentFrame()) {
                wickEditor.actionHandler.doAction('addNewFrame');
            }

            // Add those boys and save their IDs so we can remove them on undo
            args.addedObjectIDs = [];
            for(var i = 0; i < args.wickObjects.length; i++) {
                var wickObj = args.wickObjects[i];

                wickEditor.project.addObject(wickObj);
                args.addedObjectIDs.push(wickObj.id);
            }
        },
        function (args) {
            // Remove objects we added
            for(var i = 0; i < args.wickObjects.length; i++) {
                wickEditor.project.getCurrentObject().removeChildByID(args.addedObjectIDs[i]);
            }
        });

    this.registerAction('deleteObjects', 
        function (args) {
            args.restoredWickObjects = []
            args.oldZIndices = [];

            // Store the old z index vars for each object. 
            // Must do this before removing them all.
            for(var i = 0; i < args.ids.length; i++) {
                var obj = wickEditor.project.getCurrentObject().getChildByID(args.ids[i]);
                var zIndex = wickEditor.project.getCurrentObject().getCurrentFrame().wickObjects.indexOf(obj);
                args.oldZIndices.push(zIndex);
            }

            // Now remove them
            for(var i = 0; i < args.ids.length; i++) {
                var obj = wickEditor.project.getCurrentObject().getChildByID(args.ids[i]);
                args.restoredWickObjects.push(obj);
                wickEditor.project.getCurrentObject().removeChildByID(args.ids[i]);
            }
        },
        function (args) {
            for(var i = 0; i < args.restoredWickObjects.length; i++) {
                wickEditor.project.addObject(args.restoredWickObjects[i], args.oldZIndices[i]);
            }
        });

    var modifyableAttributes = ["x","y","scaleX","scaleY","angle","opacity","flipX","flipY"];// get rid of these .....

    this.registerAction('modifyObjects', 
        function (args) {
            args.originalStates = [];

            for(var i = 0; i < args.ids.length; i++) {
                var wickObj = wickEditor.project.getCurrentObject().getChildByID(args.ids[i]);

                args.originalStates[i] = {};
                modifyableAttributes.forEach(function(attrib) {
                    args.originalStates[i][attrib] = wickObj[attrib];
                });

                // This is silly what's a better way ???
                if(wickObj.fontData) {
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

                if(args.modifiedStates[i].svgFillColor) {
                    args.originalStates[i].svgFillColor = wickObj.svgData.fillColor;
                    wickObj.svgData.fillColor = args.modifiedStates[i].svgFillColor;
                    wickObj.forceFabricCanvasRegen = true;
                }

                if(wickObj.svgData) VectorToolUtils.updatePaperDataOnVectorWickObjects([wickObj]);
                var SVGNeedsRefresh = 
                    (args.modifiedStates[i].angle !== undefined && args.modifiedStates[i].angle !== 0) || 
                    (args.modifiedStates[i].scaleX !== undefined && args.modifiedStates[i].scaleX !== 1) || 
                    (args.modifiedStates[i].scaleY !== undefined && args.modifiedStates[i].scaleY !== 1)
                if(wickObj.svgData && SVGNeedsRefresh) {
                    var paperPath = wickObj.paperPath;

                    paperPath.applyMatrix = true;
                    paperPath.scale(wickObj.scaleX,wickObj.scaleY);
                    paperPath.rotate(wickObj.angle);

                    var updatedSVGWickObject = createSVGWickObject(paperPath, wickObj.svgData.fillColor);
                    updatedSVGWickObject.x += wickEditor.project.getCurrentObject().getAbsolutePosition().x;
                    updatedSVGWickObject.y += wickEditor.project.getCurrentObject().getAbsolutePosition().y;

                    wickObj.paperPath = paperPath;

                    wickObj.cachedFabricObject = null;
                    wickObj.svgData = updatedSVGWickObject.svgData;
                    wickObj.forceFabricCanvasRegen = true;
                    wickObj.angle = 0;
                    wickObj.scaleX = 1;
                    wickObj.scaleY = 1;
                    wickObj.width = null;
                    wickObj.height = null;
                }
                
                // This is silly what's a better way ???
                if(wickObj.tweens.length === 1) {
                    var tween = WickTween.fromWickObjectState(wickObj);
                    tween.frame = wickObj.parentObject.getRelativePlayheadPosition(wickObj);
                    wickObj.tweens.push(tween);
                }
            }
        },
        function (args) {
            for(var i = 0; i < args.ids.length; i++) {
                var wickObj = wickEditor.project.getCurrentObject().getChildByID(args.ids[i]);

                // Revert the object's state to it's original pre-transformation state
                modifyableAttributes.forEach(function(attrib) {
                    if(args.originalStates[i][attrib] !== undefined) {
                        wickObj[attrib] = args.originalStates[i][attrib];
                    }
                });

                // This is silly what's a better way ???
                if(wickObj.fontData) {
                    wickObj.fontData.text = args.originalStates[i].text;
                    wickObj.fontData.fontFamily = args.originalStates[i].fontFamily;
                    wickObj.fontData.fontSize = args.originalStates[i].fontSize;
                    wickObj.fontData.fontStyle = args.originalStates[i].fontStyle;
                    wickObj.fontData.fontWeight = args.originalStates[i].fontWeight;
                    wickObj.fontData.textDecoration = args.originalStates[i].textDecoration;
                    wickObj.fontData.fill = args.originalStates[i].fill;
                }

                if(args.originalStates[i].svgFillColor) {
                    wickObj.svgData.fillColor = args.originalStates[i].svgFillColor;
                    wickObj.forceFabricCanvasRegen = true;
                }
            }
        });

    this.registerAction('addNewFrame', 
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();

            // Add an empty frame
            currentObject.getCurrentLayer().addFrame(new WickFrame());

            // Move to that new frame
            wickEditor.actionHandler.doAction('movePlayhead', {
                obj:currentObject,
                newPlayheadPosition:currentObject.getCurrentLayer().getTotalLength()-1
            });
        },
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();
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
            var currentObject = wickEditor.project.getCurrentObject();

            // Add an empty frame
            currentObject.addLayer(new WickLayer());

            // Go to last added layer
            currentObject.currentLayer = currentObject.layers.length-1;
        },
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();

            // Remove last layer added
            currentObject.layers.pop();

            // Go to last added layer
            currentObject.currentLayer = currentObject.layers.length-1;
        });

    this.registerAction('removeLayer', 
        function (args) {
            var currentObject = wickEditor.project.getCurrentObject();
            if(currentObject.layers.length > 1) {
                args.removedLayer = currentObject.getCurrentLayer();
                currentObject.removeLayer(currentObject.getCurrentLayer());
                currentObject.currentLayer = currentObject.layers.length-1;
            }
        },
        function (args) {
            if(args.removedLayer) {
                var currentObject = wickEditor.project.getCurrentObject();
                currentObject.addLayer(args.removedLayer);
            }
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
            wickEditor.interfaces['fabric'].deselectAll();

            args.oldPlayheadPosition = args.obj.playheadPosition;

            if(args.moveAmount) {

                args.obj.playheadPosition += args.moveAmount;
                if(args.obj.playheadPosition < 0) args.obj.playheadPosition = 0;

            } else if (args.newPlayheadPosition) {

                args.oldPlayheadPosition = args.obj.playheadPosition;
                args.obj.playheadPosition = args.newPlayheadPosition;

            }
            
        },
        function (args) {
            wickEditor.interfaces['fabric'].deselectAll();

            args.obj.playheadPosition = args.oldPlayheadPosition;
        });

    this.registerAction('convertSelectionToSymbol', 
        function (args) {
            var selectedObjects = wickEditor.interfaces['fabric'].getSelectedWickObjects();

            var currObj = wickEditor.project.getCurrentObject();
            if(currObj.parentObject) currObj.fixOriginPoint()

            var symbolZIndex = null;
            selectedObjects.forEach(function (obj) {
                var objZIndex = wickEditor.project.getCurrentObject().getCurrentFrame().wickObjects.indexOf(obj);
                if(symbolZIndex === null || objZIndex < symbolZIndex) {
                    symbolZIndex = objZIndex;
                }
            });
            
            selectedObjects.forEach(function (obj) {
                wickEditor.project.getCurrentObject().removeChildByID(obj.id);
            });

            var symbol = new WickObject.createSymbolFromWickObjects(selectedObjects);
            wickEditor.project.addObject(symbol, symbolZIndex);
            args.createdSymbolID = symbol.id;
            symbol.fixOriginPoint(true);
            symbol.selectOnAddToFabric = true;
        },
        function (args) {
            args.symbol = wickEditor.project.rootObject.getChildByID(args.createdSymbolID);

            args.children = args.symbol.getObjectsOnFirstFrame();
            args.children.forEach(function (child) {
                child.x = child.getAbsolutePosition().x;
                child.y = child.getAbsolutePosition().y;
                wickEditor.project.addObject(child);
            });

            wickEditor.project.getCurrentObject().removeChildByID(args.createdSymbolID);
        });

    this.registerAction('breakApartSymbol', 
        function (args) {
            args.symbol = wickEditor.project.rootObject.getChildByID(args.id);

            args.children = args.symbol.getObjectsOnFirstFrame();
            args.children.forEach(function (child) {
                //child.x += args.symbol.x;
                //child.y += args.symbol.y;
                child.x = child.getAbsolutePosition().x;
                child.y = child.getAbsolutePosition().y;
                wickEditor.project.addObject(child);
            });

            wickEditor.project.getCurrentObject().removeChildByID(args.id);
        },
        function (args) {
            args.children.forEach(function (child) {
                child.x -= args.symbol.x;
                child.y -= args.symbol.y;
                wickEditor.project.getCurrentObject().removeChildByID(child.id);
            });
            wickEditor.project.addObject(args.symbol);
        });

    this.registerAction('editObject', 
        function (args) {
            wickEditor.interfaces['fabric'].deselectAll();

            // Set the editor to be editing this object at its first frame
            args.prevEditedObjectID = wickEditor.project.getCurrentObject().id;
            wickEditor.project.currentObjectID = args.objectToEdit.id;
            wickEditor.project.getCurrentObject().currentFrame = 0;
        },
        function (args) {
            wickEditor.interfaces['fabric'].deselectAll();
            wickEditor.project.getCurrentObject().fixOriginPoint(); // hack to get around fabric.js lack of rotation around anchorpoint
            
            wickEditor.project.currentObjectID = args.prevEditedObjectID;
        });

    this.registerAction('finishEditingCurrentObject', 
        function (args) {
            wickEditor.interfaces['fabric'].deselectAll();
            wickEditor.project.getCurrentObject().fixOriginPoint(); // hack to get around fabric.js lack of rotation around anchorpoint

            wickEditor.project.getCurrentObject().playheadPosition = 0;
            args.prevEditedObjectID = wickEditor.project.getCurrentObject().id;
            wickEditor.project.currentObjectID = wickEditor.project.getCurrentObject().parentObject.id;
        },
        function (args) {
            wickEditor.interfaces['fabric'].deselectAll();
            //wickEditor.project.getCurrentObject().fixOriginPoint(); // hack to get around fabric.js lack of rotation around anchorpoint
            
            wickEditor.project.currentObjectID = args.prevEditedObjectID;
        });

    this.registerAction('moveObjectToZIndex', 
        function (args) {
            args.oldZIndexes = [];
            for(var i = 0; i < args.ids.length; i++) {
                var obj = wickEditor.project.getCurrentObject().getChildByID(args.ids[i]);
                args.oldZIndexes.push(wickEditor.project.getCurrentObject().getCurrentFrame().wickObjects.indexOf(obj));
            }
            for(var i = 0; i < args.ids.length; i++) {
                var obj = wickEditor.project.getCurrentObject().getChildByID(args.ids[i]);
                obj.zIndicesDirty = true;
                wickEditor.project.getCurrentObject().getCurrentFrame().wickObjects.splice(args.oldZIndexes[i], 1);
                wickEditor.project.getCurrentObject().getCurrentFrame().wickObjects.splice(args.newZIndex, 0, obj);
            }
        },
        function (args) {  
            for(var i = 0; i < args.ids.length; i++) {
                var obj = wickEditor.project.getCurrentObject().getChildByID(args.ids[i]);
                obj.zIndicesDirty = true;
                wickEditor.project.getCurrentObject().removeChildByID(args.ids[i]);
                wickEditor.project.getCurrentObject().getCurrentFrame().wickObjects.splice(args.oldZIndexes[i], 0, obj);
            }
        });

}