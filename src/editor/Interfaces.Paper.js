/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var PaperInterface = function (wickEditor) {

    var paperCanvas;

    var currentFrame;
    var SVGDataDirty;

	this.setup = function () {
        // Create the canvas to be used with paper.js and init the paper.js instance.
		paperCanvas = document.createElement('canvas');
        paperCanvas.className = 'paperCanvas';
		paper.setup(paperCanvas);

        // (Debug) Put the canvas somewhere we can see it
        document.body.appendChild(paperCanvas);

        // Set initial frame to load SVG data from
        currentFrame = wickEditor.project.getCurrentObject().getCurrentFrame();
        SVGDataDirty = true;
	}

    this.addSVG = function (svgString) {
        addSVGToCanvas(svgString);
    }

    this.syncWithEditorState = function () {
        if(!paper.project) return; // sync may get called before paper.js is ready

        var newFrame = wickEditor.project.getCurrentObject().getCurrentFrame();
        if(newFrame !== currentFrame) {
            // Set SVGData of currentFrame to svg data from paper.js
            if(currentFrame) currentFrame.svgData = paper.project.exportSVG({ asString: true });

            SVGDataDirty = true;
        }
        currentFrame = newFrame;

        // Only update the paper.js canvas if new SVG data exists in the WickProject
        if (!SVGDataDirty) return;

        paper.project.clear();

        // currentFrame may be null if the playhead isn't over a frame
        if (!currentFrame) return;

        addSVGToCanvas(currentFrame.svgData);
        SVGDataDirty = false;
    }

    var addSVGToCanvas = function (svgString) {
        var xmlString = svgString
          , parser = new DOMParser()
          , doc = parser.parseFromString(xmlString, "text/xml");
        var paperGroup = paper.project.importSVG(doc);
    }

    /*
    this.syncWithEditorState = function () {
    	
 	}

 	this.updatePaperDataOnVectorWickObjects = function (wickObjects) {
        paper.project.activeLayer.removeChildren();

        wickObjects.forEach(function (wickObject) {
            if(!wickObject.svgData) return;

            var xmlString = wickObject.svgData.svgString
              , parser = new DOMParser()
              , doc = parser.parseFromString(xmlString, "text/xml");
            var paperGroup = paper.project.importSVG(doc);
            var paperPath = paperGroup.removeChildren(0, 1)[0];
            if(paperPath.toPath) paperPath = paperPath.toPath({insert:false})

            if(paperPath.closePath) paperPath.closePath();
            paperPath.position.x += wickObject.x - wickObject.width/2;
            paperPath.position.y += wickObject.y - wickObject.height/2;

            wickObject.paperPath = paperPath;
        });
    }

    this.createSVGWickObject = function (paperPath, fillColor) {
        var pathPosition = paperPath.position;
        var pathBoundsX = paperPath.bounds._width;
        var pathBoundsY = paperPath.bounds._height;

        that.repositionPaperSVG(paperPath, -(pathPosition._x - pathBoundsX/2), -(pathPosition._y - pathBoundsY/2));

        var SVGData = {
            svgString: that.createSVGFromPaths(paperPath.exportSVG({asString:true}), pathBoundsX, pathBoundsY),
            fillColor: fillColor
        }
        var wickObj = WickObject.fromSVG(SVGData);
        wickObj.x = pathPosition._x// - paperPath.bounds._width/2;
        wickObj.y = pathPosition._y// - paperPath.bounds._height/2;
        return wickObj;
    }

    this.repositionPaperSVG = function (paperObject, x, y) {
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

    this.createSVGFromPaths = function (pathString, width, height) {
        return '<svg id="svg" x="0" y="0" version="1.1" width="'+width+'" height="'+height+'" xmlns="http://www.w3.org/2000/svg">' + pathString + '</svg>';
    } 

    this.getIntersectedObjects = function (wickObj, targetObjects) {
        var pathA = wickObj.paperPath;

        var intersectedObjects = [];
        targetObjects.forEach(function (targetWickObj) {
            if(!targetWickObj.paperPath) return;
            if(targetWickObj.id === wickObj.id) return;

            var pathB = targetWickObj.paperPath;

            console.log(pathA)
            console.log(pathB)
            var intersections = pathA.getIntersections(pathB);
            if(intersections.length > 0) {
                intersectedObjects.push(pathB);
            } else {
                console.log("nope")
            }
        });
        return intersectedObjects;
    }
    */
 }