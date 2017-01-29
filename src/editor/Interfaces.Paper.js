/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var PaperInterface = function (wickEditor) {

    var self = this;

    // Paper.js canvas view
    var paperCanvas;

    // Lookup table used when ActionHandler wants to modify/delete paths
    var wickToPaperMappings = {};

    // Reference to current frame in Wick project
    var currentFrame;

/******************************
    API
******************************/

    self.setup = function () {
        // Create the canvas to be used with paper.js and init the paper.js instance.
        paperCanvas = document.createElement('canvas');
        paperCanvas.className = 'paperCanvas';
        paperCanvas.style.backgroundColor = "#FFDDDD";
        paperCanvas.style.width  = (wickEditor.project.width /2)+'px';
        paperCanvas.style.height = (wickEditor.project.height/2)+'px';
        paper.setup(paperCanvas);
        paper.view.viewSize.width  = wickEditor.project.width;
        paper.view.viewSize.height = wickEditor.project.height;

        // If we're debugging, make the paper.js canvas visible
        if(localStorage.pathDebug === "1") {
            document.body.appendChild(paperCanvas);
        }
    }
    
    self.syncWithEditorState = function () {

        // Check for frame change
        var oldFrame = currentFrame;
        currentFrame = wickEditor.project.currentObject.getCurrentFrame();

        if(oldFrame !== currentFrame) {
            self.updateWickProject();
        }

    }

    self.saveFrameSVG = function () {
        saveFrameSVG();
    }

    self.updateWickProject = function () {
        // Clear all groups from paper canvas
        paper.project.clear();

        // This happens when paths are added to a frame that hasn't been
        // touched by paper.js yet. So add all those paths to the path SVG
        if(currentFrame && currentFrame.pathDataToAdd) {
            currentFrame.pathDataToAdd.forEach(function (pathData) {
                self.addPath(pathData.svg, {x:pathData.x, y:pathData.y});
            });
            currentFrame.pathDataToAdd = null;
            saveFrameSVG();
            paper.project.clear();
        }

        // Regen wick objects on the current frame using paper canvas
        clearPathWickObjects();

        // Load SVG from currentFrame
        if(currentFrame && currentFrame.pathData) {
            var paperGroup = importSVG(currentFrame.pathData);
            paperGroup.parent.insertChildren(paperGroup.index, paperGroup.removeChildren());
            paperGroup.remove();
        }

        // Regen wick objects for currentFrame
        regenWickObjects();
    }

    self.addPath = function (svgString, offset, isEraserPath, selectOnAddToFabric) {
        var paperGroup = importSVG(svgString);

        paperGroup.dirtyFromWick = true;
        paperGroup.isEraserPath = isEraserPath;

        // Convert all paper.Shapes into paper.Paths (Paths have boolean ops, Shapes do not)
        paperGroup.children.forEach(function (child) {
            if(!(child instanceof paper.Path) && !(child instanceof paper.CompoundPath)) {
                child.remove();
                var newChild = child.toPath({insert:false});
                //newChild = newChild.unite(new paper.Path({insert:false}));
                newChild.clockwise =false;
                paperGroup.addChild(newChild);
            }
        });

        // Boolean ops only work with closed paths (potrace generates open paths for some reason)
        paperGroup.children.forEach(function (child) {
            if(child.closePath) child.closePath();
        });

        paperGroup.selectOnAddToFabric = selectOnAddToFabric;

        if(offset)
            paperGroup.position = new paper.Point(offset.x, offset.y);

        var oldPosition = {x: paperGroup.position.x, y: paperGroup.position.y};
        WickObject.fromPathFile(paperGroup.exportSVG({asString:true}), function (wickObject) {
            wickObject.x = oldPosition.x;
            wickObject.y = oldPosition.y;
            wickEditor.project.addObject(wickObject, null, true);
            /*if(group.selectOnAddToFabric) {
                wickObject.selectOnAddToFabric = true;
                group.selectOnAddToFabric = false;
            }*/
            wickToPaperMappings[wickObject.uuid] = paperGroup;
        });
    }

    self.modifyPath = function (uuid, modifiedState) {
        var group = wickToPaperMappings[uuid];

        group.position = new paper.Point(modifiedState.x, modifiedState.y);
        group.scale(modifiedState.scaleX, modifiedState.scaleY);
        group.rotate(modifiedState.rotation);

        group.dirtyFromWick = true;
    }

    self.removePath = function (uuid) {
        var group = wickToPaperMappings[uuid];

        group.remove();
    }

    self.cleanupPaths = function (force) {
        var groups = getAllGroupsInCanvas();
        groups.reverse();

        groups.forEach(function (group) {
            if(group.dead) return; 
            if(!group.dirtyFromWick && !force) return;

            if(force) console.log('force!');

            group.dirtyFromWick = false;

            var touchingGroups = getTouchingPaths(group);
            if(touchingGroups.length < 1) return;

            var superPath = group.children[0].clone({insert:false});
            touchingGroups.forEach(function (touchingGroup) {
                if(touchingGroup.dead) return;

                var colorA = touchingGroup.fillColor.components;
                var colorB = group.fillColor.components;
                colorA[3]=1;
                colorB[3]=1;

                if(!group.isEraserPath && colorA.equals(colorB)) {
                    //if(superPath.closePath) superPath.closePath();
                    superPath = superPath.unite(touchingGroup.children[0]);

                    touchingGroup.remove();
                    touchingGroup.dead = true;
                } else {
                    var splitPath = touchingGroup.children[0].clone();
                    //if(splitPath.closePath) splitPath.closePath();
                    splitPath = splitPath.subtract(group.children[0]);

                    var splitGroup = new paper.Group();
                    splitGroup.addChild(splitPath);

                    touchingGroup.remove();
                    touchingGroup.dead = true;

                    if(splitGroup.children[0] instanceof paper.Path) return;

                    //Make two lists, one will all holes and one with all paths
                    var holes = [];
                    var fills = [];

                    var compPath = splitGroup.children[0];

                    compPath.children.forEach(function (child) {
                        if(child.clockwise) {
                            holes.push(child.clone({insert:false}));
                        } else {
                            fills.push(child.clone({insert:false}));
                        }
                    });

                    fills.forEach(function (fill) {
                        // Make a new group containing only that fill
                        var newgroup = new paper.Group();
                        paper.project.activeLayer.addChild(newgroup);

                        var newCompPath = new paper.CompoundPath(); newCompPath.remove();
                        newCompPath.clockwise = false;

                        newCompPath.addChild(fill);
                        fill.fillColor = compPath.fillColor;
                        fill.clockwise = false;
                        newCompPath.fillColor = compPath.fillColor;

                        // Add holes that intersect with that fill to the group
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

                        newgroup.addChild(newCompPath);
                    });

                    splitGroup.remove();
                    if(group.isEraserPath) group.remove();
                }
            });

            if(!group.isEraserPath) {
                var superGroup = new paper.Group();
                superGroup.addChild(superPath);
            }

            group.remove();
        });

    }

    self.fillAtPoint = function (x,y,fillColorHex) {
        var point = new paper.Point(x,y);

        // Try to find a path to fill
        var pathWasFilled = false;
        var paths = getAllGroupsInCanvas();
        paths.forEach(function (path) {
            if(pathWasFilled) return;

            if(path.contains(point)) {
                path.fillColor = fillColorHex;
                pathWasFilled = true;
            }
        });

        // No path filled, try to find a hole to fill
        var holeWasFilled = false;
        if(!pathWasFilled) {
            console.log("No path filled, looking for holes now");

            // Find all paths
            var groups = getAllGroupsInCanvas();

            // Find all holes/fills
            var holes = [];
            var fills = [];
            groups.forEach(function (group) {
                var children = [];
                if(group.children && (group.children[0] instanceof paper.CompoundPath)) 
                    children = group.children[0].children;
                else
                    children = group.children;
                
                children.forEach(function (child) {
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
                group.dirtyFromWick = true;
            }

        }

        if (pathWasFilled || holeWasFilled) {
            console.log("well we filled something lol");
        }
    }

    self.refresh = function () {
        saveFrameSVG();
        regenWickObjects();
    }

    self.getPathDataOfWickObject = function (uuid) {
        var group = wickToPaperMappings[uuid];
        return {
            svg: group.exportSVG({asString:true}),
            x: group.position.x,
            y: group.position.y
        }
    }


/******************************
    Util
******************************/

    // Generate a list of all groups in the paper.js canvas
    var getAllGroupsInCanvas = function () {
        var allGroups = [];

        paper.project.activeLayer.children.forEach(function (child) {
            allGroups.push(child);
        });

        return allGroups;
    }

    // SVG -> paper.js importer
    var importSVG = function (svgString) {
        var xmlString = svgString
          , parser = new DOMParser()
          , doc = parser.parseFromString(xmlString, "text/xml");

        return paper.project.importSVG(doc);
    }

    // Save the paper.js canvas state in the current frame
    var saveFrameSVG = function () {
        if(currentFrame) 
            currentFrame.pathData = paper.project.activeLayer.exportSVG({ asString: true });
    }

    // Remove all existing path wick objects from frame
    var clearPathWickObjects = function () {
        wickToPaperMappings = {};

        if(currentFrame) {
            var pathWickObjects = [];

            currentFrame.wickObjects.forEach(function (wickObject) {
                if(wickObject.pathData) {
                    pathWickObjects.push(wickObject);
                }
            });

            pathWickObjects.forEach(function (pathWickObject) {
                pathWickObject.parentObject.removeChild(pathWickObject);
            }); 
        }
    }

    // Sync the state of the paper.js canvas with the Wick project
    var regenWickObjects = function () {
        var groups = getAllGroupsInCanvas();
        groups.reverse();

        // Remove all existing path wick objects from frame
        clearPathWickObjects();

        // Create new wick objects for all current paths
        groups.forEach(function (group) {
            var oldPosition = {x:group.position.x, y:group.position.y};
            group.position = new paper.Point(0,0);
            WickObject.fromPathFile(group.exportSVG({asString:true}), function (wickObject) {
                wickObject.x = oldPosition.x;
                wickObject.y = oldPosition.y;
                wickEditor.project.addObject(wickObject, null, true);
                if(group.selectOnAddToFabric) {
                    wickObject.selectOnAddToFabric = true;
                    group.selectOnAddToFabric = false;
                }
                wickToPaperMappings[wickObject.uuid] = group;
            });
            group.position = new paper.Point(oldPosition.x, oldPosition.y);
        });
    }

    // Return all paths touching 'path'
    var getTouchingPaths = function (path) {
        var paths = getAllGroupsInCanvas();
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

    // Return true if 'checkPath' is inside 'path'
    var pathContainsPath = function (path, checkPath) {
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
            console.log(child)
        }

        var foundPointInside = false;
        points.forEach(function (point) {
            if(!foundPointInside && path.contains(point)) {
                foundPointInside = true;
            }
        });

        return foundPointInside;
    }

 }