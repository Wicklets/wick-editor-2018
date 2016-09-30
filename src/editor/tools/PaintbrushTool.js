/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

// Note: The actual drawing using the mouse is handled by fabric! See FabricInterface

var PaintbrushTool = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        return 'url(resources/paintbrush-cursor.png) 64 64,default';
    };

    this.brushSize = 5;
    this.brushSmoothing = 10.0;
    this.color = "#B00600";

    this.updateOnscreenVectors = function (newPath) {
        uniteIntersectingPaths(newPath);
        subtractIntersectingPaths(newPath);
        splitApartPathsWithMultiplePieces();
    }

// Path vectorization

    // Listen for new paths drawn by fabric, vectorize them, and add them to the WickProject as WickObjects
    wickEditor.interfaces.fabric.canvas.on('object:added', function(e) {
        var fabricPath = e.target;

        // Make sure the new object is actually a path created by fabric's drawing tool
        if(fabricPath.type !== "path" || fabricPath.wickObjectID) {
            return;
        }

        // Vectorize the path and create a WickObject out of it
        potraceFabricPath(fabricPath, function(SVGData) {
            var wickObj = WickObject.fromSVG(SVGData);
            wickObj.x = fabricPath.left - wickEditor.interfaces.fabric.getCenteredFrameOffset().x - fabricPath.width/2  - that.brushSize/2;
            wickObj.y = fabricPath.top  - wickEditor.interfaces.fabric.getCenteredFrameOffset().y - fabricPath.height/2 - that.brushSize/2;
            wickEditor.actionHandler.doAction('addObjects', {
                wickObjects: [wickObj]
            });

            wickEditor.tools.paintbrush.updateOnscreenVectors(wickObj);
        });

        // Get rid of original fabric path object
        wickEditor.interfaces.fabric.canvas.remove(e.target);
    });

    var potraceFabricPath = function (pathFabricObject, callback) {
        pathFabricObject.cloneAsImage(function(clone) {
            var img = new Image();
            img.onload = function () {
                potraceImage(img, callback);
            };
            img.src = clone._element.currentSrc || clone._element.src;
        });
    };

    var potraceImage = function (img, callback) {

        // Scale the image before we pass it to potrace (fixes retina display bugs!)
        var dummyCanvas = document.createElement('canvas');
        var dummyContext = dummyCanvas.getContext('2d');
        dummyCanvas.width = img.width/window.devicePixelRatio;
        dummyCanvas.height = img.height/window.devicePixelRatio;
        dummyContext.drawImage(img, 0,0, img.width,img.height, 0,0, dummyCanvas.width,dummyCanvas.height);
        
        // Send settings and the image data to potrace to vectorize it!
        Potrace.loadImageFromDataURL(dummyCanvas.toDataURL());
        Potrace.setParameter({
            optcurve: true, 
            alphamax: that.brushSmoothing/10
        });
        Potrace.process(function(){
            var SVGData = {
                svgString: Potrace.getSVG(1), 
                fillColor: that.color
            }
            callback(SVGData);
        });
    };

// On-canvas vector utils

    var createSVGFromPaths = function (pathString, width, height) {
        return '<svg id="svg" x="0" y="0" version="1.1" width="'+width+'" height="'+height+'" xmlns="http://www.w3.org/2000/svg">' + pathString + '</svg>';
    } 

    var updatePaperDataOnVectorWickObjects = function (wickObjects) {
        wickObjects.forEach(function (child) {
            if(!child.svgData) return;

            var xmlString = child.svgData.svgString
              , parser = new DOMParser()
              , doc = parser.parseFromString(xmlString, "text/xml");
            var paperGroup = paper.project.importSVG(doc);
            var paperPath = paperGroup.removeChildren(0, 1)[0];

            if(paperPath.closePath) paperPath.closePath();
            paperPath.position.x += child.x;
            paperPath.position.y += child.y;

            child.paperPath = paperPath;
        });
    }

    var getAllWickObjectsIntersecting = function (wickObjects, newPath) {
        // Generates a list of all objects with any kind of intersection (this ain't what we want anymore)
        /*var allWickObjectsIntersecting = {};

        wickObjects.forEach(function (wickPathA) {
            if (!wickPathA.svgData) return;
            wickObjects.forEach(function (wickPathB) {
                if (!wickPathB.svgData) return;

                if (wickPathA.id == wickPathB.id) return;

                var paperPathA = wickPathA.paperPath;
                var paperPathB = wickPathB.paperPath;

                var intersections = paperPathA.getIntersections(paperPathB);
                if(intersections.length == 0) return;

                allWickObjectsIntersecting[wickPathA.id] = wickPathA;
                allWickObjectsIntersecting[wickPathB.id] = wickPathB;
            });
        });

        return allWickObjectsIntersecting;*/

        var allWickObjectsIntersecting = {};

        wickObjects.forEach(function (path) {
            if(path === newPath) return;
            var paperPathA = path.paperPath;
            var paperPathB = newPath.paperPath;
            var intersections = paperPathA.getIntersections(paperPathB);
            if(intersections.length > 0) allWickObjectsIntersecting[path.id] = path;
        });

        return allWickObjectsIntersecting;
    }

    var getIDsOfWickObjectsIntersecting = function (intersectingWickObjects) {
        var allWickObjectsIntersectingIDs = [];

        for (var id in intersectingWickObjects) {
            allWickObjectsIntersectingIDs.push(id);
        }

        return allWickObjectsIntersectingIDs;
    }

    var repositionPaperSVG = function (paperObject, x, y) {
        var pathSegments = [];
        if(paperObject.children) {
            paperObject.children.forEach(function (child) {
                child.getSegments().forEach(function (segment) {
                    pathSegments.push(segment);
                });
            });
        } else {
            pathSegments = paperObject.getSegments();
        }
        pathSegments.forEach(function (segment) {
            var oldPoint = segment.getPoint();
            var newPoint = new paper.Point(
                oldPoint.x + x, 
                oldPoint.y + y
            );
            segment.setPoint(newPoint);
        });
    }

// On-canvas vector updates

    // Unite intersecting paths with same fill color
    var uniteIntersectingPaths = function (newPath) {

        var onscreenObjects = wickEditor.project.getCurrentObject().getAllActiveChildObjects();
        updatePaperDataOnVectorWickObjects(onscreenObjects);
        var allWickObjectsIntersecting = getAllWickObjectsIntersecting(onscreenObjects, newPath);
        var allWickObjectsIntersectingIDs = getIDsOfWickObjectsIntersecting(allWickObjectsIntersecting);

        var allPathIDsUnited = [];

        // Create the union of all the paths
        var superPath = undefined;
        for (var id in allWickObjectsIntersecting) {

            var path = allWickObjectsIntersecting[id];

            if(path.id !== newPath.id && path.svgData.fillColor == newPath.svgData.fillColor) {
                if(!superPath) { 
                    superPath = newPath.paperPath;
                    allPathIDsUnited.push(newPath.id);
                }
                console.log("uniting a path");
                allPathIDsUnited.push(id);
                superPath = superPath.unite(allWickObjectsIntersecting[id].paperPath);
            }
        }

        if(superPath) {
            // Delete the paths that became united
            //wickEditor.actionHandler.chainLastCommand();
            wickEditor.actionHandler.doAction('deleteObjects', {
                ids: allPathIDsUnited,
                partOfChain: true
            });

            // Create an SVG with the SVG data of the union
            var pathPosition = superPath.position;
            var superPathBoundsX = superPath.bounds._width;
            var superPathBoundsY = superPath.bounds._height;

            repositionPaperSVG(superPath, -(pathPosition._x - superPathBoundsX/2), -(pathPosition._y - superPathBoundsY/2));

            var SVGData = {
                svgString: createSVGFromPaths(superPath.exportSVG({asString:true}), superPathBoundsX, superPathBoundsY),
                fillColor: newPath.svgData.fillColor
            }

            // Create a WickObject with the SVG we made from the union
            var wickObj = WickObject.fromSVG(SVGData);
            wickObj.x = pathPosition._x - superPath.bounds._width/2;
            wickObj.y = pathPosition._y - superPath.bounds._height/2;
            wickEditor.actionHandler.doAction('addObjects', {
                wickObjects: [wickObj],
                partOfChain: true
            });
        }
    }

    // Subtract intersecting points with different fill colors
    var subtractIntersectingPaths = function (newPath) {

        var onscreenObjects = wickEditor.project.getCurrentObject().getAllActiveChildObjects();
        updatePaperDataOnVectorWickObjects(onscreenObjects);
        var allWickObjectsIntersecting = getAllWickObjectsIntersecting(onscreenObjects, newPath);
        var allWickObjectsIntersectingIDs = getIDsOfWickObjectsIntersecting(allWickObjectsIntersecting);

        var splitApartPathIDs = [];

        for (var id in allWickObjectsIntersecting) {
            if(id !== newPath.id && allWickObjectsIntersecting[id].svgData.fillColor !== newPath.svgData.fillColor) {
                console.log("subtracting a path")

                splitApartPathIDs.push(id)

                var path = allWickObjectsIntersecting[id].paperPath;
                var splitPath = allWickObjectsIntersecting[id].paperPath.subtract(newPath.paperPath);

                var pathPosition = splitPath.position;
                var pathBoundsX = splitPath.bounds._width;
                var pathBoundsY = splitPath.bounds._height;

                repositionPaperSVG(splitPath, -(pathPosition._x - pathBoundsX/2), -(pathPosition._y - pathBoundsY/2));

                var SVGData = {
                    svgString: createSVGFromPaths(splitPath.exportSVG({asString:true}), pathBoundsX, pathBoundsY),
                    fillColor: allWickObjectsIntersecting[id].svgData.fillColor
                }

                var wickObj = WickObject.fromSVG(SVGData);
                wickObj.x = pathPosition._x - splitPath.bounds._width/2;
                wickObj.y = pathPosition._y - splitPath.bounds._height/2;
                wickEditor.actionHandler.doAction('addObjects', {
                    wickObjects: [wickObj],
                    partOfChain: true
                });
            }
        }

        //wickEditor.actionHandler.chainLastCommand();
        wickEditor.actionHandler.doAction('deleteObjects', {
            ids: splitApartPathIDs,
            partOfChain: true
        });

    }

    var splitApartPathsWithMultiplePieces = function () {
        /*var onscreenObjects = wickEditor.project.getCurrentObject().getAllActiveChildObjects();
        updatePaperDataOnVectorWickObjects(onscreenObjects);
        
        onscreenObjects.forEach(function (wickPath) {

            if (!wickPath.svgData) return;

            var children = wickPath.paperPath.children;
            if(!children) return;

            var splitObject = false;

            console.log(children)
            var cutObjects = []

            children.forEach(function (childA) {
                children.forEach(function (childB) {
                    if(childA === childB) return;
                    if(cutObjects.indexOf(childA) !== -1 || cutObjects.indexOf(childB) !== -1)
                    if(childA.clockwise || childB.clockwise) return;

                    var oldParent = childA._parent;
                    childA._parent = null;
                    childB._parent = null;

                    splitObject = true;

                    [childA, childB].forEach(function (path) {
                        var pathPosition = path.position;
                        var pathBoundsX = path.bounds._width;
                        var pathBoundsY = path.bounds._height;

                        repositionPaperSVG(path, -(pathPosition._x - pathBoundsX/2), -(pathPosition._y - pathBoundsY/2));

                        var SVGData = {
                            svgString: createSVGFromPaths(path.exportSVG({asString:true}), pathBoundsX, pathBoundsY),
                            fillColor: wickPath.svgData.fillColor
                        }

                        console.log("add")
                        var wickObj = WickObject.fromSVG(SVGData);
                        wickObj.x = pathPosition._x - path.bounds._width/2;
                        wickObj.y = pathPosition._y - path.bounds._height/2;
                        wickEditor.actionHandler.doAction('addObjects', {
                            wickObjects: [wickObj],
                            partOfChain: true
                        });
                    });

                    childA._parent = oldParent;
                    childB._parent = oldParent;

                    cutObjects.push(childA);
                    cutObjects.push(childB);
                });
            });

            if(splitObject) {
                wickEditor.actionHandler.doAction('deleteObjects', {
                    ids: [wickPath.id],
                    partOfChain: true
                });
            }

        });*/

        onscreenObjects = wickEditor.project.getCurrentObject().getAllActiveChildObjects();
        updatePaperDataOnVectorWickObjects(onscreenObjects);

        onscreenObjects.forEach(function (wickPath) {

            if (!wickPath.svgData) return;

            // No children: doesn't need to be split, is already a single object
            var children = wickPath.paperPath.children;
            if(!children) return;

            // >1 counter-clockwise paths: Must be split apart
            // (i.e., there are two distinct pieces that are not 'holes')
            var solidChildren = [];
            var holeChildren = [];
            children.forEach(function (path) {
                if(!path.clockwise) {
                    solidChildren.push(path);
                } else {
                    holeChildren.push(path);
                }
            });
            if(solidChildren.length <= 1) return;

            console.log("splitting path apart")

            var newWickObjects = [];

            children.forEach(function (path) {
                if(path.clockwise) return;

                // Find all 'holes' that this child contains
                // Create a CompoundPath with all those holes plus the path itself combined
                console.log(holeChildren.length + " holes to check...")
                var holesOfThisPath = [];
                holeChildren.forEach(function(hole) {
                    var pathOwnsThisHole = true;
                    hole.segments.forEach(function(segment) {
                        if(pathOwnsThisHole && !path.contains(segment.point)) {
                            pathOwnsThisHole = false;
                        }
                    });
                    if(pathOwnsThisHole) {
                        console.log("owns dis hole")
                        holesOfThisPath.push(hole);
                    }
                });
                holesOfThisPath.forEach(function (hole) {
                    var i = holeChildren.indexOf(hole);
                    holeChildren.splice(i, 1);
                });

                if(holesOfThisPath.length > 0) {
                    path._parent = null;
                    var compoundPath = new paper.CompoundPath({
                        children: holesOfThisPath.concat([path]),
                        fillColor: path.fillColor
                    });
                    path = compoundPath;
                }

                var pathPosition = path.position;
                var pathBoundsX = path.bounds._width;
                var pathBoundsY = path.bounds._height;

                repositionPaperSVG(path, -(pathPosition._x - pathBoundsX/2), -(pathPosition._y - pathBoundsY/2));

                var SVGData = {
                    svgString: createSVGFromPaths(path.exportSVG({asString:true}), pathBoundsX, pathBoundsY),
                    fillColor: wickPath.svgData.fillColor
                }

                var wickObj = WickObject.fromSVG(SVGData);
                wickObj.x = pathPosition._x - path.bounds._width/2;
                wickObj.y = pathPosition._y - path.bounds._height/2;
                newWickObjects.push(wickObj);
            });
            
            console.log(newWickObjects)
            wickEditor.actionHandler.doAction('addObjects', {
                wickObjects: newWickObjects,
                partOfChain: true
            });

            wickEditor.actionHandler.doAction('deleteObjects', {
                ids: [wickPath.id],
                partOfChain: true
            });

        });

    }

}