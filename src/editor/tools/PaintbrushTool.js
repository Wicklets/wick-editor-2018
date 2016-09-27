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

            wickEditor.tools.paintbrush.updateOnscreenVectors();
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

    this.updateOnscreenVectors = function () {

        return; // not quite ready yet...

    // (1) Make sure all vector WickObjects have updated paper objects

        var onscreenObjects = wickEditor.project.getCurrentObject().getAllActiveChildObjects();

        onscreenObjects.forEach(function (child) {
            if(!child.svgData) return;

            var xmlString = child.svgData.svgString
              , parser = new DOMParser()
              , doc = parser.parseFromString(xmlString, "text/xml");
            var paperGroup = paper.project.importSVG(doc);
            var paperPath = paperGroup.removeChildren(0, 1)[0];

            if(paperPath.closePath) paperPath.closePath();
            //paperPath.style.fillColor = fillColor;
            paperPath.position.x += child.x;
            paperPath.position.y += child.y;

            child.paperPath = paperPath;
        });

    // (2) Unite intersecting paths with same fill color

        var allWickObjectsIntersecting = {};

        // Find all intersections between paths
        onscreenObjects.forEach(function (wickPathA) {
            if (!wickPathA.svgData) return;
            onscreenObjects.forEach(function (wickPathB) {
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

        var allWickObjectsIntersectingIDs = [];
        for (var id in allWickObjectsIntersecting) {
            allWickObjectsIntersectingIDs.push(id);
        }

        // Create the union of all the paths
        var superPath = undefined;
        for (var id in allWickObjectsIntersecting) {
            if(!superPath) {
                superPath = allWickObjectsIntersecting[id].paperPath;
            } else {
                superPath = superPath.unite(allWickObjectsIntersecting[id].paperPath);
            }
        }

        if(superPath) {
            // Delete the paths that became united
            wickEditor.actionHandler.chainLastCommand(); // So that the undo also undoes the action that triggered the vector update
            wickEditor.actionHandler.doAction('deleteObjects', {
                ids: allWickObjectsIntersectingIDs,
                partOfChain: true
            });

            // Create an SVG with the SVG data of the union
            var createSVGFromPaths = function (pathString) {
                return '<svg id="svg" version="1.1" width="88" height="102" xmlns="http://www.w3.org/2000/svg">' + pathString + '</svg>';
            } 
            var SVGData = {
                svgString: createSVGFromPaths(superPath.exportSVG({asString:true})),
                fillColor: "#000000"
            }

            // Create a WickObject with the SVG we made from the union
            var wickObj = WickObject.fromSVG(SVGData);
            wickObj.x = 0;
            wickObj.y = 0;
            wickEditor.actionHandler.doAction('addObjects', {
                wickObjects: [wickObj],
                partOfChain: true
            });
        }

    // (3) Subtract intersecting points with different fill colors



    // (4) Split apart paths with multiple pieces

        onscreenObjects.forEach(function (wickPath) {
            if (!wickPath.svgData) return;

            // uh oh!
        });

    }

}