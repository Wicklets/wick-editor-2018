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

        return; //not quite ready yet

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
        that.potraceFabricPath(fabricPath, function(SVGData) {
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

    this.potraceFabricPath = function (pathFabricObject, callback) {
        pathFabricObject.cloneAsImage(function(clone) {
            var img = new Image();
            img.onload = function () {
                that.potraceImage(img, callback);
            };
            img.src = clone._element.currentSrc || clone._element.src;
        });
    };

    this.potraceImage = function (img, callback) {

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

    var createSVGFromPaths = function (pathString) {
        return '<svg id="svg" x="0" y="0" version="1.1" width="88" height="102" xmlns="http://www.w3.org/2000/svg">' + pathString + '</svg>';
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

    var getAllWickObjectsIntersecting = function (wickObjects) {
        var allWickObjectsIntersecting = {};

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

        return allWickObjectsIntersecting;
    }

    var getIDsOfWickObjectsIntersecting = function (intersectingWickObjects) {
        var allWickObjectsIntersectingIDs = [];

        for (var id in intersectingWickObjects) {
            allWickObjectsIntersectingIDs.push(id);
        }

        return allWickObjectsIntersectingIDs;
    }

// On-canvas vector updates

    // Unite intersecting paths with same fill color
    var uniteIntersectingPaths = function (newPath) {

        var onscreenObjects = wickEditor.project.getCurrentObject().getAllActiveChildObjects();
        updatePaperDataOnVectorWickObjects(onscreenObjects);
        var allWickObjectsIntersecting = getAllWickObjectsIntersecting(onscreenObjects);
        var allWickObjectsIntersectingIDs = getIDsOfWickObjectsIntersecting(allWickObjectsIntersecting);

        // Create the union of all the paths
        var superPath = undefined;
        for (var id in allWickObjectsIntersecting) {

            var path = allWickObjectsIntersecting[id];

            if(path.id !== newPath.id && path.svgData.fillColor == newPath.svgData.fillColor) {
                if(!superPath) superPath = newPath.paperPath;
                console.log("uniting a path")
                superPath = superPath.unite(allWickObjectsIntersecting[id].paperPath);
            }
        }

        if(superPath) {
            // Delete the paths that became united
            //wickEditor.actionHandler.chainLastCommand();
            wickEditor.actionHandler.doAction('deleteObjects', {
                ids: allWickObjectsIntersectingIDs,
                partOfChain: true
            });

            // Create an SVG with the SVG data of the union
            var pathPosition = superPath.position;
            var superPathBoundsX = superPath.bounds._width;
            var superPathBoundsY = superPath.bounds._height;

            // reposition path such that origin is (0,0)
            var superPathSegments = superPath.getSegments();
            // get array of all da segments if its a compaundpath
            superPathSegments.forEach(function (segment) {
                var oldPoint = segment.getPoint();
                var newPoint = new paper.Point(
                    oldPoint.x - (pathPosition._x - superPathBoundsX/2), 
                    oldPoint.y - (pathPosition._y - superPathBoundsY/2)
                );
                segment.setPoint(newPoint);
            });

            var SVGData = {
                svgString: createSVGFromPaths(superPath.exportSVG({asString:true})),
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
        var allWickObjectsIntersecting = getAllWickObjectsIntersecting(onscreenObjects);
        var allWickObjectsIntersectingIDs = getIDsOfWickObjectsIntersecting(allWickObjectsIntersecting);

        for (var id in allWickObjectsIntersecting) {
            if(id !== newPath.id && allWickObjectsIntersecting[id].svgData.fillColor !== newPath.svgData.fillColor) {
                console.log("subtracting a path")

                var path = allWickObjectsIntersecting[id].paperPath;
                var splitPath = allWickObjectsIntersecting[id].paperPath.subtract(newPath.paperPath);

                var SVGData = {
                    svgString: createSVGFromPaths(splitPath.exportSVG({asString:true})),
                    fillColor: '#000000'
                }

                // Create a WickObject with the SVG we made from the union
                var wickObj = WickObject.fromSVG(SVGData);
                wickObj.x = 0//pathPosition._x - splitPath.bounds._width/2;
                wickObj.y = 0//pathPosition._y - splitPath.bounds._height/2;
                wickEditor.actionHandler.doAction('addObjects', {
                    wickObjects: [wickObj],
                    partOfChain: true
                });
            }
        }

        //wickEditor.actionHandler.chainLastCommand();
        wickEditor.actionHandler.doAction('deleteObjects', {
            ids: allWickObjectsIntersectingIDs,
            partOfChain: true
        });

    }

    var splitApartPathsWithMultiplePieces = function () {
        var onscreenObjects = wickEditor.project.getCurrentObject().getAllActiveChildObjects();

        onscreenObjects.forEach(function (wickPath) {
            if (!wickPath.svgData) return;

            // if its a compound path and there are no intersections, split it into separate wickobjects.
        });
    }

}