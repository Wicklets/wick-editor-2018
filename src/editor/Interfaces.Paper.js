/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var PaperInterface = function (wickEditor) {

    var self = this;

    var paperCanvas;
    var paperObjectMappings = {};

    var debugLog = true;

    self.setup = function () {
        // Create the canvas to be used with paper.js and init the paper.js instance.
        paperCanvas = document.createElement('canvas');
        paperCanvas.className = 'paperCanvas';
        paperCanvas.style.backgroundColor = "#FFDDDD";
        paperCanvas.style.width  = (wickEditor.project.resolution.x/2)+'px';
        paperCanvas.style.height = (wickEditor.project.resolution.y/2)+'px';
        paper.setup(paperCanvas);
        paper.view.viewSize.width  = wickEditor.project.resolution.x;
        paper.view.viewSize.height = wickEditor.project.resolution.y;

        // (Debug) Put the canvas somewhere we can see it
        if(localStorage.pathDebug === "1") document.body.appendChild(paperCanvas);

        self.onWickObjectsChange();
    }
    
    self.syncWithEditorState = function () {
        
    }
    
    // Called when the wickobjects in the current frame have been modified.
    // Update the paper canvas accordingly.
    self.onWickObjectsChange = function () {
        
        // Generate a list of all wickobjects in the currentframe.
        // ALWAYS do this or you'll be modifying a list while forEaching through it (this is bad)
        var currentFrame = wickEditor.project.currentObject.getCurrentFrame();
        var wickObjects = [];
        if(currentFrame) {
            currentFrame.wickObjects.forEach(function (wickObject) { wickObjects.push(wickObject); });
        }
        
         // For each wickobject in the current frame:
        wickObjects.forEach(function (wickObject) {
            if (!wickObject.pathData) return;
            
            // If there is no corresponding paper path in the paper
            // canvas, create one.
            if(!paperObjectMappings[wickObject.uuid]) {
                
                var xmlString = wickObject.pathData
                  , parser = new DOMParser()
                  , doc = parser.parseFromString(xmlString, "text/xml");
                var group = paper.project.importSVG(doc);

                group.children.forEach(function (child) {
                    // Convert all paper.Shapes into paper.Paths (Paths have boolean ops, Shapes do not)
                    if(child instanceof paper.Shape) {
                        child.remove();
                        group.addChild(child.toPath());
                    }

                    // Boolean ops only work with closed paths (potrace generates open paths for some reason)
                    if(child.closePath) child.closePath();
                });

                group.position = new paper.Point(wickObject.x, wickObject.y);

                // Newly drawn paths need to get checked for intersections on next onPathsNeedCleanup
                if(wickObject.isNewDrawingPath) {
                    group.needsIntersectCheck = true;
                    wickObjects.isNewDrawingPath = undefined;
                }

                paperObjectMappings[wickObject.uuid] = group;

            // If there is, update the path's position/scale/rotation.
            } else {
                
                var path = paperObjectMappings[wickObject.uuid];
                
                path.applyMatrix = true;
                path.position.x = wickObject.x;
                path.position.y = wickObject.y;

                if(path.origRotation === undefined) path.origRotation = 0;
                var newRotation = wickObject.angle;
                if(newRotation !== path.origRotation) {
                    path.rotate(newRotation-path.origRotation);
                    wickObject.parentObject.removeChild(wickObject);
                    self.onPaperCanvasChange();
                    wickEditor.syncInterfaces();
                }

                if(path.origScaleX === undefined) path.origScaleX = 1;
                var newScaleX = wickObject.scaleX;
                if(newScaleX !== path.origScaleX) {
                    path.scaling.x = newScaleX*path.origScaleX;
                    path.origScaleX = wickObject.scaleX;
                }

                if(path.origScaleY === undefined) path.origScaleY = 1;
                var newScaleY = wickObject.scaleY;
                if(newScaleY !== path.origScaleY) {
                    path.scaling.y = newScaleY*path.origScaleY;
                    path.origScaleY = wickObject.scaleY;
                }
                
            }
        });
            
        allPaths = getAllPathsInCanvas();
        // For each path in the paper project:
        allPaths.forEach(function (path) {
            // If the wickobject corresponding to this path no
            // longer exists, delete it from the paper canvas
            var pathExistsInProject = false
            wickObjects.forEach(function (wickObject) {
                if (paperObjectMappings[wickObject.uuid] === path) {
                    pathExistsInProject = true;
                }
            });
            
            if(!pathExistsInProject) {
                removePathFromCanvas(path);
            }
        });
            
        // Apply changes to paper canvas to the current frame SVG.
        applyChangesToFrame();
        
    }
    
    // Called when the paths in the paper canvas have been modified.
    // Update the wickobjects in the current frame accordingly.
    self.onPaperCanvasChange = function () {

        var allPaths = getAllPathsInCanvas();
        
        // For each path in the paper canvas:
        allPaths.forEach(function (path) {
            var wickObject = null;
            for (uuid in paperObjectMappings) {
                if(paperObjectMappings[uuid] === path) {
                    wickObject = wickEditor.project.currentObject.getCurrentFrame().getObjectByUUID(uuid);
                }
            }

            // If there is no corresponding wickobject for this
            // path, create one.
            if (!wickObject) {
                if(debugLog) console.log("no wickObject")
                WickObject.fromPathFile(path.exportSVG({asString:true}), function (wickObject) {
                    wickObject.x = path.position.x;
                    wickObject.y = path.position.y;
                    paperObjectMappings[wickObject.uuid] = path;
                    wickEditor.project.addObject(wickObject, null, true);
                });
            // If there is, update the wickobject's position, reset
            // its rotation/scale, update its pathData, and set the
            // flag to regen its fabric object next sync.
            } else {
                if(debugLog) console.log("wickObject exists")
            }

        });
        
        // For each wickobject in the current frame:
        var currentFrame = wickEditor.project.currentObject.getCurrentFrame();
        var wickObjects = [];
        currentFrame.wickObjects.forEach(function (wickObject) { wickObjects.push(wickObject); });

        wickObjects.forEach(function (wickObject) {
            if (!wickObject.pathData) return;
            // If the paper object corresponding to this wickobject
            // no longer exists, delete it from the project.
            if(!paperObjectMappings[wickObject.uuid]) {
                if(debugLog) console.log("paper object no longer exists")
                wickObject.parentObject.removeChild(wickObject);
            }
        });
            
        // Apply changes to paper canvas to the current frame SVG.
        // ???
        
    }
    
    // Called when overlapping paths need to be cleaned up.
    self.onPathsNeedCleanup = function () {

        var pathsDirty = false;
        
        // Do overlapping path union for paper canvas.
        // Find all paths with needsIntersectCheck flag, these need to be checked for new intersections
        var paths = getAllPathsInCanvas();
        var pathsThatNeedUpdate = [];
        paths.forEach(function(path) {
            if(path.needsIntersectCheck) {
                pathsThatNeedUpdate.push(path);
            }
        });

        if(debugLog) console.log("- - - - - - - - - -");
        if(debugLog) console.log("# of pathsThatNeedUpdate: " + pathsThatNeedUpdate.length);

        // Check for intersections for all paths with needsIntersectCheck flag
        pathsThatNeedUpdate.forEach(function (path) {

            // Find all paths intersecting
            var paths = getAllPathsInCanvas();
            var intersectingPaths = [];
            paths.forEach(function (checkPath) {
                var pathA = path;
                var pathB = checkPath;

                if(pathA === pathB) return;

                var foundIntersection = false;
                for(var a = 0; a < pathA.children.length; a++) {
                    for(var b = 0; b < pathB.children.length; b++) {
                        var childA = pathA.children[a];
                        var childB = pathB.children[b];
                        if (!foundIntersection && childA.intersects(childB)) {
                            foundIntersection = true;
                            intersectingPaths.push(checkPath);
                        }
                    }
                }
            });

            path.needsIntersectCheck = false;

            if(debugLog) console.log("pathsThatNeedUpdate["+pathsThatNeedUpdate.indexOf(path)+"] # intersections: " + intersectingPaths.length);
            
            if(intersectingPaths.length > 0) {

                pathsDirty = true;
                
                var superPath = path.children[0].clone({insert:false});
                intersectingPaths.forEach(function (intersectingPath) {
                    var colorA = intersectingPath.fillColor.components;
                    var colorB = path.fillColor.components;

                    if(colorA.equals(colorB)) {
                        superPath = superPath.unite(intersectingPath.children[0]);
                        removePathFromCanvas(intersectingPath);
                    } else {
                        var splitPath = intersectingPath.children[0].clone();
                        splitPath = splitPath.subtract(path.children[0]);
                        var splitGroup = new paper.Group();
                        splitGroup.addChild(splitPath);
                        splitGroup.needsSplitApartCheck = true;
                        removePathFromCanvas(intersectingPath);
                    }
                });

                var superGroup = new paper.Group();
                superGroup.addChild(superPath);

                removePathFromCanvas(path);

            }
        });

        //Gen list of paths with needs split apart check flag
        //For each path:
            //Make two lists, one will all holes and one with all paths

            //For each path:
                //Make a new group containing only that path
                //Add holes that intersect with that path to the group
                //Add that group to project
        
        if (pathsDirty) {
            self.onPaperCanvasChange();
            wickEditor.syncInterfaces();
        }
        
    }

    self.onEraserPathAdded = function (svgData) {
        //Load SVG
        console.log(svgData)

        //Generate list of all paths intersected by eraserPath

        //For each intersected path:
            //Subtract eraser path

            //Set needsSplitApartCheck true
    }

    self.onFill = function (x,y) {

        var point = new paper.Point(x,y);

        // Try to find a path to fill
        var pathFilled = false;
        var paths = getAllPathsInCanvas();
        paths.forEach(function (path) {
            if(pathFilled) return;

            if(path.contains(point)) {
                console.log("Path filled:");
                console.log(path);

                pathFilled = true;
            }
        });

        // No path filled, try to find a hole to fill
        var holeFilled = false;
        if(!pathFilled) {
            console.log("No path filled, looking for holes now");

            // Find all paths
            var paths = getAllPathsInCanvas();

            // Find all holes
            var holes = [];
            // do it here lol

            // Find all holes with point inside
            var possibleHolesToFill = [];
            // do it here lol

            var holeToFill = null;
            if(possibleHolesToFill.length == 0) {
                // No hole to fill :(
                console.log("no hole found, giving up");
            } else if(possibleHolesToFill.length == 1) {
                holeFilled = possibleHolesToFill[0];
            } else {
                // Calculate smallest hole
            }

            if(holeToFill) {
                holeFilled = true;

                // Subtract all intersecting paths and holes from holeToFill

                // Add holeToFill to project
            }

        }

        if (pathFilled || holeFilled) {
            self.onPaperCanvasChange();
            wickEditor.syncInterfaces();
        }
    }

    self.setPathNeedsIntersectionCheck = function (wickObject) {
        var path = paperObjectMappings[wickObject.uuid];
        if (path) path.needsIntersectCheck = true;
    }
    
    //

    var removePathFromCanvas = function (path) {
        for (uuid in paperObjectMappings) {
            if(paperObjectMappings[uuid] === path) {
                paperObjectMappings[uuid] = null;
            }
        }

        path.remove();
    }
    
    var getAllPathsInCanvas = function () {
        
        var allSVGs = [];

        paper.project.activeLayer.children.forEach(function (child) {
            allSVGs.push(child);
        });

        return allSVGs;
        
    }
    
    var applyChangesToFrame = function () {
        
        var currentFrame = wickEditor.project.currentObject.getCurrentFrame();
        
        if(currentFrame) {
            currentFrame.pathData = paper.project.activeLayer.exportSVG({ asString: true });
        }
        
    }

 }