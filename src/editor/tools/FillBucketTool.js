/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var FillBucketTool = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        return 'url("resources/fillbucket-cursor.png") 64 64,default';
    };

    var canvas = wickEditor.interfaces.fabric.canvas;

    canvas.on('mouse:down', function (e) {
        if(e.e.button != 0) return;
        if(!(wickEditor.interfaces.fabric.currentTool instanceof FillBucketTool)) return;

        var onscreenObjects = wickEditor.project.getCurrentObject().getAllActiveChildObjects();
        updatePaperDataOnVectorWickObjects(onscreenObjects);

        var mouseScreenSpace = wickEditor.interfaces.fabric.screenToCanvasSpace(e.e.offsetX, e.e.offsetY);
        var mousePoint = new paper.Point(mouseScreenSpace.x, mouseScreenSpace.y);

        // Try filling paths
        var filledPath = false;
        onscreenObjects.forEach(function (wickPath) {

            if (filledPath) return;
            if (!wickPath.svgData) return;

            if(wickPath.paperPath.contains(mousePoint)) {
                filledPath = true;
                
                wickEditor.actionHandler.doAction('modifyObjects', { 
                    ids: [wickPath.id], 
                    modifiedStates: [{ svgFillColor : wickEditor.interfaces.fabric.tools.paintbrush.color }] 
                });
            }

        });

        if(filledPath) return;

        // Try filling holes

        // Unite all on-screen paths 
        var allPathsUnion = undefined;
        onscreenObjects.forEach(function (wickPath) {
            if (!wickPath.svgData) return;

            var path = wickPath.paperPath.clone({insert:false});

            if(!allPathsUnion) {
                allPathsUnion = path;
            } else {
                allPathsUnion = allPathsUnion.unite(path);
            }
        });

        if(!allPathsUnion) return;

        // Subtract union of all paths from huge rectangle
        var hugeRectangle = new paper.Path.Rectangle(new paper.Point(-1000,-1000), new paper.Size(2000,2000));
        var negativeSpace = hugeRectangle.subtract(allPathsUnion);

        var holes = [];

        // Generate holes
        negativeSpace.children.forEach(function (negativeSpaceChildA) {
            if(!negativeSpaceChildA.clockwise) return;
            if(negativeSpaceChildA.area === 4000000) return;

            var pathsContained = [];
            negativeSpace.children.forEach(function (negativeSpaceChildB) {
                if(negativeSpaceChildA === negativeSpaceChildB) return;
                if(!negativeSpaceChildB.clockwise) return;
                if(negativeSpaceChildB.area === 4000000) return;

                var pathOwnsThisHole = true;
                negativeSpaceChildB.segments.forEach(function(segment) {
                    if(!negativeSpaceChildA.contains(segment.point)) {
                        pathOwnsThisHole = false;
                    }
                });
                if(pathOwnsThisHole) {
                    pathsContained.push(negativeSpaceChildB);
                }
            });

            if(pathsContained.length > 0) {
                var compoundPath = new paper.CompoundPath();
                compoundPath.removeChildren();
                compoundPath.addChild(negativeSpaceChildA.clone({insert:false}))
                pathsContained.forEach(function (hole) {
                    compoundPath.addChild(hole.clone({insert:false}));
                });
                holes.push(compoundPath);

                compoundPath.children.forEach(function (child) {
                    child.clockwise = !child.clockwise;
                });
            } else {
                holes.push(negativeSpaceChildA.clone({insert:false}));
            }

        });

        // Find a piece containing the mouse point that also has a coresponding hole with closed==false
        holes.forEach(function (hole) {
            if(!hole.contains(mousePoint)) return;

            wickEditor.actionHandler.doAction('addObjects', {
                wickObjects: [createSVGWickObject(hole, wickEditor.interfaces.fabric.tools.paintbrush.color)],
                partOfChain: true
            });
        });
    });

    var updatePaperDataOnVectorWickObjects = function (wickObjects) {
        paper.project.activeLayer.removeChildren();

        wickObjects.forEach(function (wickObject) {
            if(!wickObject.svgData) return;

            var xmlString = wickObject.svgData.svgString
              , parser = new DOMParser()
              , doc = parser.parseFromString(xmlString, "text/xml");
            var paperGroup = paper.project.importSVG(doc);
            var paperPath = paperGroup.removeChildren(0, 1)[0];
            if(paperPath.toPath) paperPath = paperPath.toPath({insert:false})

            /*if(wickObject.angle !== 0 || wickObject.scaleX !== 1 || wickObject.scaleY !== 1) {

                if(paperPath.closePath) paperPath.closePath();
                paperPath.applyMatrix = true;
                paperPath.scale(wickObject.scaleX,wickObject.scaleY);
                paperPath.rotate(wickObject.angle);

                var updatedSVGWickObject = createSVGWickObject(paperPath, wickObject.svgData.fillColor);

                wickEditor.actionHandler.doAction('deleteObjects', {
                    ids: [wickObject.id],
                    partOfChain: true
                });
                wickEditor.actionHandler.doAction('addObjects', {
                    wickObjects: [(updatedSVGWickObject)],
                    partOfChain: true
                });

                wickObject.paperPath = paperPath;

            } else {*/

                if(paperPath.closePath) paperPath.closePath();
                paperPath.position.x += wickObject.x;
                paperPath.position.y += wickObject.y;

                wickObject.paperPath = paperPath;
            //}
        });
    }

    var createSVGWickObject = function (paperPath, fillColor) {
        var pathPosition = paperPath.position;
        var pathBoundsX = paperPath.bounds._width;
        var pathBoundsY = paperPath.bounds._height;

        repositionPaperSVG(paperPath, -(pathPosition._x - pathBoundsX/2), -(pathPosition._y - pathBoundsY/2));

        var SVGData = {
            svgString: createSVGFromPaths(paperPath.exportSVG({asString:true}), pathBoundsX, pathBoundsY),
            fillColor: fillColor
        }
        var wickObj = WickObject.fromSVG(SVGData);
        wickObj.x = pathPosition._x - paperPath.bounds._width/2;
        wickObj.y = pathPosition._y - paperPath.bounds._height/2;
        return wickObj;
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

    var createSVGFromPaths = function (pathString, width, height) {
        return '<svg id="svg" x="0" y="0" version="1.1" width="'+width+'" height="'+height+'" xmlns="http://www.w3.org/2000/svg">' + pathString + '</svg>';
    } 

}