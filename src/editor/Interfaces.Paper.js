/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var PaperInterface = function (wickEditor) {

    var that = this;

    var paperCanvas;
    var paperObjectWickMappings = {};

    var currentFrame;
    var SVGDataDirty;

    var ready = false;

    var debugLog = true;

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


    this.setup = function () {
        // Set initial frame to load SVG data from
        currentFrame = wickEditor.project.currentObject.getCurrentFrame();
        SVGDataDirty = true;
        ready = true;

        this.syncWithEditorState();
    }

    this.syncWithEditorState = function () {
        if (!ready) return;
        if (!paper.project) return; // sync may get called before paper.js is ready

        var newFrame = wickEditor.project.currentObject.getCurrentFrame();
        if(newFrame !== currentFrame) {
            // Set SVGData of currentFrame to svg data from paper.js
            this.applyChangesToFrame();

            SVGDataDirty = true;
        }
        currentFrame = newFrame;

        if(currentFrame) {
            var pathsToUpdate = [];
            currentFrame.wickObjects.forEach(function (wickObject) {
                if(wickObject.pathData && !wickObject.inFrameSVG) {
                    pathsToUpdate.push(wickObject);
                }
            });
            pathsToUpdate.forEach(function (wickObject) {
                wickObject.parentObject.removeChild(wickObject);
                addSVGToCanvas(wickObject.pathData, {x:wickObject.x, y:wickObject.y});
            });
            if(pathsToUpdate.length > 0) {
                that.applyChangesToFrame()
            }
        }

        // Only update the paper.js canvas if new SVG data exists in the WickProject
        if (!SVGDataDirty) return;

        paper.project.clear();
        paperObjectWickMappings = {};

        // currentFrame may be null if the playhead isn't over a frame
        if (!currentFrame) return;

        addSVGGroupToCanvas(currentFrame.pathData);
        resetPathWickObjects();
        SVGDataDirty = false;
    }

    this.updatePaperSceneForObject = function (wickObject, deleted) {
        var path = paperObjectWickMappings[wickObject.uuid];

        if(!path) {
            wickObject.parentObject.removeChild(wickObject);
            addSVGToCanvas(wickObject.pathData, {x:wickObject.x, y:wickObject.y});
        } else if (deleted) {
            paperObjectWickMappings[wickObject.uuid] = null;
            path.remove();
        } else {
            path.applyMatrix = true;
            path.position.x = wickObject.x;
            path.position.y = wickObject.y;

            if(path.origRotation === undefined) path.origRotation = 0;
            var newRotation = wickObject.angle;
            if(newRotation !== path.origRotation) {
                path.rotation = newRotation-path.origRotation;
                path.origRotation = wickObject.angle;
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
    }

    this.applyChangesToFrame = function () {
        if(currentFrame) 
            currentFrame.pathData = paper.project.activeLayer.exportSVG({ asString: true });
    }

    this.addSVG = function (svgString, offset) {
        addSVGToCanvas(svgString, offset);
    }

    this.updateTouchingPaths = function () {

        // Find all paths with needsIntersectCheck flag, these need to be checked for new intersections
        var paths = getAllSVGs();
        var pathsThatNeedUpdate = [];
        paths.forEach(function(path) {
            if(path.needsIntersectCheck) {
                pathsThatNeedUpdate.push(path);
            }
        });

        if (debugLog) console.log("- - - - - - - - - -");
        if (debugLog) console.log("# of pathsThatNeedUpdate: " + pathsThatNeedUpdate.length);

        // Check for intersections for all paths with needsIntersectCheck flag
        pathsThatNeedUpdate.forEach(function (path) {

            // Find all paths intersecting
            var paths = getAllSVGs();
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

            if (debugLog) console.log("pathsThatNeedUpdate["+pathsThatNeedUpdate.indexOf(path)+"] # intersections: " + intersectingPaths.length);
        });
    }

    this.fillHole = function (x,y) {

    }

    this.eraseWithPath = function (pathData) {

    }

    this.setPathNeedsUpdate = function (wickObject) {
        var path = paperObjectWickMappings[wickObject.uuid];
        if(path)
            path.needsIntersectCheck = true;
    }


    var getAllSVGs = function () {
        var allSVGs = [];

        paper.project.activeLayer.children.forEach(function (child) {
            allSVGs.push(child);
        });

        return allSVGs;
    }

    var resetPathWickObjects = function () {
        if (debugLog) console.log("resetPathWickObjects")

        var removedWOs = [];
        currentFrame.wickObjects.forEach(function (wickObject) {
            if (!wickObject.pathData) return;
            removedWOs.push(wickObject);
        });
        removedWOs.forEach(function (wickObject) {
            wickObject.parentObject.removeChild(wickObject);
        })

        getAllSVGs().forEach(function (path) {
            addWickObjectFromPaperData(path);
        });
    }
    var addWickObjectFromPaperData = function (path) {
        WickObject.fromPathFile(path.exportSVG({asString:true}), function (wickObject) {
            wickObject.x = path.position.x;
            wickObject.y = path.position.y;
            wickObject.inFrameSVG = true;
            paperObjectWickMappings[wickObject.uuid] = path;
            wickEditor.project.addObject(wickObject);
        });
    }

    var addSVGGroupToCanvas = function (svgString) {
        if(!svgString) return;

        var xmlString = svgString
          , parser = new DOMParser()
          , doc = parser.parseFromString(xmlString, "text/xml");
        var paperGroup = paper.project.importSVG(doc);
        if(paperGroup.closePath) paperGroup.closePath();
        
        paperGroup.parent.insertChildren(paperGroup.index,  paperGroup.removeChildren());
        paperGroup.remove();
    }

    var addSVGToCanvas = function (svgString, offset) {
        var xmlString = svgString
          , parser = new DOMParser()
          , doc = parser.parseFromString(xmlString, "text/xml");
        var paperGroup = paper.project.importSVG(doc);
        if(paperGroup.closePath) paperGroup.closePath();

        if(offset)
            paperGroup.position = new paper.Point(offset.x, offset.y);

        addWickObjectFromPaperData(paperGroup);
    }

 }