/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var PaperInterface = function (wickEditor) {

    var self = this;

    var paperCanvas;
    var paperObjectMappings = {};

    self.setup = function () {
        // Create the canvas to be used with paper.js and init the paper.js instance.
        paperCanvas = document.createElement('canvas');
        paperCanvas.className = 'paperCanvas';
        paperCanvas.style.backgroundColor = "#FFDDDD";
        paperCanvas.style.width  = (wickEditor.project.width/2)+'px';
        paperCanvas.style.height = (wickEditor.project.height/2)+'px';
        paper.setup(paperCanvas);
        paper.view.viewSize.width  = wickEditor.project.width;
        paper.view.viewSize.height = wickEditor.project.height;

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
                    if(!(child instanceof paper.Path) && !(child instanceof paper.CompoundPath)) {
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

                wickObject.pathData = group.exportSVG({asString:true});

                paperObjectMappings[wickObject.uuid] = group;

            // If there is, update the path's position/scale/rotation.
            } else {

                var path = paperObjectMappings[wickObject.uuid];

                path.applyMatrix = true;
                path.position.x = wickObject.x;
                path.position.y = wickObject.y;

                wickObject.angle = 0;
                wickObject.scaleX = 1;
                wickObject.scaleY = 1;

                wickObject.pathData = path.exportSVG({asString:true});

                /*

                if(path.origRotation === undefined) path.origRotation = 0;
                var newRotation = wickObject.angle;
                if(newRotation !== path.origRotation) {
                    path.rotate(newRotation-path.origRotation);
                    path.origRotation = wickObject.angle;
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
                }*/
                
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
            var wickObject = getWickObjectOfPath(path);

            // If there is no corresponding wickobject for this
            // path, create one.
            if (!wickObject) {
                //if(verbose) console.log("No wickObject for this path, creating one")
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
                //if(verbose) console.log("wickObject exists, updating wickObject")

                // NYI
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
                //if(verbose) console.log("Path for wickobject no longer exists, deleting wickobject")
                wickObject.parentObject.removeChild(wickObject);
            }
        });
            
        // Apply changes to paper canvas to the current frame SVG.
        applyChangesToFrame();
        
    }
    
    // Called when overlapping paths need to be cleaned up.
    self.onPathsNeedCleanup = function () {

        var pathsDirty = false;
        
        // Do overlapping path union for paper canvas.
        // Find all paths with needsIntersectCheck flag, these need to be checked for new intersections
        var paths = getAllPathsInCanvas();
        var pathsThatNeedIntersectCheck = [];
        paths.forEach(function(path) {
            if(path.needsIntersectCheck) {
                pathsThatNeedIntersectCheck.push(path);
            }
        });
        //pathsThatNeedIntersectCheck.reverse();

        //if(verbose) console.log("# of pathsThatNeedIntersectCheck: " + pathsThatNeedIntersectCheck.length);

        // Check for intersections for all paths with needsIntersectCheck flag
        pathsThatNeedIntersectCheck.forEach(function (path) {

            if(path.dead) return; // paths that were joined/subtracted from arent in the canvas but are still in the array

            // Find all paths intersecting
            var intersectingPaths = getIntersectingPaths(path);

            path.needsIntersectCheck = false;

            //if(verbose) console.log("pathsThatNeedIntersectCheck["+pathsThatNeedIntersectCheck.indexOf(path)+"] # intersections: " + intersectingPaths.length);
            
            if(intersectingPaths.length > 0) {

                pathsDirty = true;

                var superPath = path.children[0].clone({insert:false});
                intersectingPaths.forEach(function (intersectingPath) {
                    if(intersectingPath.dead) return; // paths that were joined/subtracted from arent in the canvas but are still in the array

                    var colorA = intersectingPath.fillColor.components;
                    var colorB = path.fillColor.components;

                    colorA[3]=1;
                    colorB[3]=1;

                    if(colorA.equals(colorB)) {
                        superPath = superPath.unite(intersectingPath.children[0]);

                        removePathFromCanvas(intersectingPath);
                        intersectingPath.dead = true;
                    } else {
                        var splitPath = intersectingPath.children[0].clone();
                        splitPath = splitPath.subtract(path.children[0]);

                        var splitGroup = new paper.Group();
                        splitGroup.addChild(splitPath);
                        splitGroup.needsSplitApartCheck = true;

                        removePathFromCanvas(intersectingPath);
                        intersectingPath.dead = true;
                    }
                });

                var superGroup = new paper.Group();
                superGroup.addChild(superPath);

                removePathFromCanvas(path);

            }
        });

        //Gen list of paths with needs split apart check flag
        var paths2 = getAllPathsInCanvas();
        var pathsThatNeedSplitApartCheck = [];
        paths2.forEach(function(path) {
            if(path.needsSplitApartCheck) {
                pathsThatNeedSplitApartCheck.push(path);
            }
        });
        //pathsThatNeedSplitApartCheck.reverse();

        //console.log("# pathsThatNeedSplitApartCheck = " + pathsThatNeedSplitApartCheck.length);

        //For each path:
        pathsThatNeedSplitApartCheck.forEach(function (pathNeedsSplitCheck) {

            console.log("running split check...");

            if(pathNeedsSplitCheck.children.length !== 1) console.error("something really bad happened");
            if(pathNeedsSplitCheck.children[0] instanceof paper.Path) {
                //console.log("path is not a compoundpath, i.e. has no holes or multiple paths. skipping");
                pathNeedsSplitCheck.needsSplitApartCheck = false;
                return;
            }

            //Make two lists, one will all holes and one with all paths
            var holes = [];
            var fills = [];

            var compPath = pathNeedsSplitCheck.children[0];

            compPath.children.forEach(function (child) {
                if(child.clockwise) {
                    holes.push(child.clone({insert:false}));
                } else {
                    fills.push(child.clone({insert:false}));
                }
            });

            fills.forEach(function (fill) {
                //Make a new group containing only that fill
                var group = new paper.Group();
                paper.project.activeLayer.addChild(group);

                var newCompPath = new paper.CompoundPath(); newCompPath.remove();
                newCompPath.clockwise = false;

                newCompPath.addChild(fill);
                fill.fillColor = compPath.fillColor;
                fill.clockwise = false;
                newCompPath.fillColor = compPath.fillColor;

                //Add holes that intersect with that fill to the group
                holes.forEach(function (hole) {
                    var thisHoleAdded = false;
                    hole.segments.forEach(function (segment) {
                        if(thisHoleAdded) return;
                        if(fill.contains(segment.point)) {
                            newCompPath.addChild(hole);
                            hole.clockwise = true;
                            thisHoleAdded = true;
                        }
                    });
                });

                group.addChild(newCompPath);

                console.log(group)
            });

            removePathFromCanvas(pathNeedsSplitCheck);

            pathNeedsSplitCheck.needsSplitApartCheck = false;
            pathsDirty = true;
        });
        
        if (pathsDirty) {
            self.onPaperCanvasChange();
            wickEditor.syncInterfaces();
        }
        
    }

    self.onEraserPathAdded = function (svgData, x, y) {
        //Load SVG
        var xmlString = svgData
          , parser = new DOMParser()
          , doc = parser.parseFromString(xmlString, "text/xml");
        var group = paper.project.importSVG(doc);
        group.position.x = x;
        group.position.y = y;

        group.children.forEach(function (child) {
            // Boolean ops only work with closed paths (potrace generates open paths for some reason)
            if(child.closePath) child.closePath();
        });

        var path = group;

        var intersectingPaths = getIntersectingPaths(path);

        var pathsErased = false;

        console.log(intersectingPaths)
        intersectingPaths.forEach(function (intersectingPath) {
            //Subtract eraser path
            var splitPath = intersectingPath.children[0].clone();
            splitPath = splitPath.subtract(path.children[0]);
            var splitGroup = new paper.Group();
            splitGroup.addChild(splitPath);
            splitGroup.needsSplitApartCheck = true;
            removePathFromCanvas(intersectingPath);

            //Set needsSplitApartCheck true
            splitGroup.needsIntersectCheck = true;

            pathsErased = true;
        });

        group.remove()

        if(pathsErased) {
            self.onPathsNeedCleanup();
            self.onPaperCanvasChange();
            wickEditor.syncInterfaces();
        }
    }

    self.onFill = function (x,y,fillColorHex) {

        var point = new paper.Point(x,y);

        // Try to find a path to fill
        var pathWasFilled = false;
        var paths = getAllPathsInCanvas();
        paths.forEach(function (path) {
            if(pathWasFilled) return;

            if(path.contains(point)) {
                path.fillColor = fillColorHex;
                var wickObj = getWickObjectOfPath(path);
                wickObj.parentObject.removeChild(wickObj);

                pathWasFilled = true;
            }
        });

        // No path filled, try to find a hole to fill
        var holeWasFilled = false;
        if(!pathWasFilled) {
            console.log("No path filled, looking for holes now");

            // Find all paths
            var groups = getAllPathsInCanvas();

            // Find all holes/fills
            var holes = [];
            var fills = [];
            groups.forEach(function (group) {
                if(!(group.children[0] instanceof paper.CompoundPath)) return; // Paths have no holes
                group.children[0].children.forEach(function (child) {
                    if(child.clockwise) {
                        holes.push(child.clone({insert:false}));
                    } else {
                        fills.push(child.clone({insert:false}));
                    }
                });
            });

            if(holes.length === 0) console.log("No holes in project, giving up")

            // Find all holes with point inside
            var possibleHolesToFill = [];
            holes.forEach(function (hole) {
                if(hole.contains(point)) {
                    possibleHolesToFill.push(hole);
                }
            });

            var holeToFill = null;
            if(possibleHolesToFill.length == 0) {
                // No hole to fill :(
                console.log("no hole found, giving up");
            } else if(possibleHolesToFill.length == 1) {
                holeToFill = possibleHolesToFill[0];
            } else {
                var smallestHole = null;
                possibleHolesToFill.forEach(function (possibleHoleToFill) {
                    if(!smallestHole || possibleHoleToFill.area < smallestHole.area) {
                        smallestHole = possibleHoleToFill;
                    }
                });
                holeToFill = smallestHole;
            }

            if(holeToFill) {
                holeWasFilled = true;

                var clone = holeToFill.clone({insert:false});
                clone.clockwise = false;
                clone.set({fillColor:fillColorHex});

                var compPath = new paper.CompoundPath(); 
                compPath.remove();
                compPath.set({fillColor:fillColorHex});
                compPath.addChild(clone);

                // Subtract all intersecting paths and holes from holeToFill
                holes.forEach(function (hole) {
                    if(hole === holeToFill) return;

                    var added = false;
                    hole.segments.forEach(function (segment) {
                        if(added) return;
                        if(compPath.contains(segment.point)) {
                            added = true;
                            compPath = compPath.subtract(hole);
                        }
                    });
                });
                fills.forEach(function (fill) {
                    var added = false;
                    fill.segments.forEach(function (segment) {
                        if(added) return;
                        if(compPath.contains(segment.point)) {
                            added = true;
                            compPath = compPath.subtract(fill);
                        }
                    });
                });

                var group = new paper.Group();
                group.remove();
                group.addChild(compPath);
                group.fillRule = 'evenodd';
                paper.project.activeLayer.addChild(group);

                holeWasFilled = true;

                group.needsIntersectCheck = true;
            }

        }

        if (pathWasFilled || holeWasFilled) {
            self.onPathsNeedCleanup();
            self.onPaperCanvasChange();
            wickEditor.syncInterfaces();
        }
    }

    /*self.fillByObject = function (wickObj, fillColorHex) {
        paperObjectMappings[wickObj.uuid].fillColor = fillColorHex;

        self.onPathsNeedCleanup();
        self.onPaperCanvasChange();
        wickEditor.syncInterfaces();
    }

    self.getFillOfObject = function (wickObject) {
        var path = paperObjectMappings[wickObj.uuid];

        console.log(path)
    }*/

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

    var getWickObjectOfPath = function (path) {
        for (uuid in paperObjectMappings) {
            if(paperObjectMappings[uuid] === path) {
                return wickEditor.project.getObjectByUUID(uuid);
            }
        }

        return null;
    }

    var getIntersectingPaths = function (path) {
        console.log("getIntersectingPaths")

        var paths = getAllPathsInCanvas();
        var intersectingPaths = [];
        paths.forEach(function (checkPath) {
            var pathA = path;
            var pathB = checkPath;

            if(pathA === pathB) return;

            // Check for intersections
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

            // Check for paths containing each other
            if(!foundIntersection) {
                if(pathContainsPath(pathA, pathB) || pathContainsPath(pathB, pathA)) {
                    foundIntersection = true;
                    intersectingPaths.push(checkPath);
                }
            }
        });
        return intersectingPaths;
    }

    var pathContainsPath = function (path, checkPath) {
        // check if checkPath is inside path

        if(path.children.length > 1) console.error("something really bad happened");
        if(checkPath.children.length > 1) console.error("something really bad happened");

        var points = [];
        var child = checkPath.children[0];
        if (child instanceof paper.Path) {
            child.segments.forEach(function (segment) {
                points.push(segment.point);
            });
        } else if (child instanceof paper.CompoundPath) {
            child.children.forEach(function (compChild) {
                compChild.segments.forEach(function (segment) {
                    points.push(segment.point);
                });
            });
        } else {
            console.error("something really bad happened")
        }

        var foundPointInside = false;
        points.forEach(function (point) {
            if(!foundPointInside && path.contains(point)) {
                foundPointInside = true;
            }
        });

        return foundPointInside;
    }
    
    var applyChangesToFrame = function () {

        /*startTiming()
        
        var currentFrame = wickEditor.project.currentObject.getCurrentFrame();
        
        if(currentFrame) {
            currentFrame.pathData = paper.project.activeLayer.exportSVG({ asString: true });
            stopTiming()
        }*/
        
    }

 }