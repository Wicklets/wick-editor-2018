/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var FillBucketTool = function (wickEditor) {

	var that = this;

    var canvas = wickEditor.interfaces['fabric'].canvas;

    this.getCursorImage = function () {
        return 'url(resources/fillbucket-cursor.png) 64 64,default';
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

    var createSVGFromPaths = function (pathString, width, height) {
        return '<svg id="svg" x="0" y="0" version="1.1" width="'+width+'" height="'+height+'" xmlns="http://www.w3.org/2000/svg">' + pathString + '</svg>';
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

    canvas.on('mouse:down', function(e) {
        if(e.e.button != 0) return;
        if(!(wickEditor.currentTool instanceof FillBucketTool)) return;

        var onscreenObjects = wickEditor.project.getCurrentObject().getAllActiveChildObjects();
        updatePaperDataOnVectorWickObjects(onscreenObjects);

        var mouseX = e.e.offsetX - wickEditor.interfaces.fabric.getCenteredFrameOffset().x
        var mouseY = e.e.offsetY - wickEditor.interfaces.fabric.getCenteredFrameOffset().y
        var mousePoint = new paper.Point(mouseX, mouseY);

        // Try filling paths
        var filledPath = false;
        onscreenObjects.forEach(function (wickPath) {

            if (filledPath) return;
            if (!wickPath.svgData) return;

            if(wickPath.paperPath.contains(mousePoint)) {
                console.log("fill path")
                filledPath = true;
                
                wickEditor.actionHandler.doAction('deleteObjects', {
                    ids: [wickPath.id],
                    partOfChain: true
                });
                wickEditor.actionHandler.doAction('addObjects', {
                    wickObjects: [createSVGWickObject(wickPath.paperPath, wickEditor.tools.paintbrush.color)],
                    partOfChain: true
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

        console.log(holes)

        // Find a piece containing the mouse point that also has a coresponding hole with closed==false
        holes.forEach(function (hole) {
            if(!hole.contains(mousePoint)) return;

            wickEditor.actionHandler.doAction('addObjects', {
                wickObjects: [createSVGWickObject(hole, wickEditor.tools.paintbrush.color)],
                partOfChain: true
            });
        });
    });
    
	/*canvas.on('mouse:down', function(e) {
        if(e.e.button != 0) return;
        wickEditor.interfaces['rightclickmenu'].open = false;
        if(wickEditor.currentTool instanceof FillBucketTool) {
            fabricInterface.deselectAll();

            canvas.forEachObject(function(fabricObj) {
                if(fabricObj.paperPath) {
                    var mousePoint = new paper.Point(
                        e.e.offsetX - fabricInterface.getCenteredFrameOffset().x, 
                        e.e.offsetY - fabricInterface.getCenteredFrameOffset().y);

                    // Find paths before attempting to find holes
                    var intersectedPath = getPaperObjectIntersectingWithPoint(fabricObj.paperPath, mousePoint, true);
                    if(!intersectedPath) {
                        intersectedPath = getPaperObjectIntersectingWithPoint(fabricObj.paperPath, mousePoint, false);
                    }

                    if(!intersectedPath) return;

                    var pathObj = wickEditor.project.rootObject.getChildByID(fabricObj.wickObjectID);

                    if(intersectedPath.clockwise) {
                        console.log("hole filled");

                        if(pathObj.svgData.fillColor == wickEditor.currentTool.color) {
                            // Delete the hole

                            var intersectedEntirePath = intersectedPath._parent.children[0];

                            var exportedSVGData = intersectedEntirePath.exportSVG({asString:true});
                            var svgString = '<svg version="1.1" id="Livello_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="588px" height="588px" enable-background="new 20.267 102.757 588 588" xml:space="preserve">'+exportedSVGData+'</svg>';
                            var svgData = {svgString:svgString, fillColor:wickEditor.currentTool.color}
                            WickObject.fromSVG(svgData, function(wickObj) {
                                //wickObj.x = pathFabricObject.left - fabricInterface.getFrameOffset().x - pathFabricObject.width/2  - fabricInterface.canvas.freeDrawingBrush.width/2;
                                //wickObj.y = pathFabricObject.top  - fabricInterface.getFrameOffset().y - pathFabricObject.height/2 - fabricInterface.canvas.freeDrawingBrush.width/2;
                                wickObj.x = pathObj.x;
                                wickObj.y = pathObj.y;
                                // Note: if add is called before delete, delete will fire off before add and during state sync an extra object will be added.
                                // Add functionaitly to FabricInterface to handle these weird async issues!
                                wickEditor.actionHandler.doAction('deleteObjects', { ids:[pathObj.id] });
                                wickEditor.actionHandler.doAction('addObjects', { wickObjects:[wickObj] });
                            });
                        } else {
                            // If they are different colors:
                            //     Delete the hole, but also make an in-place copy of it with wickEditor.currentTool.color.

                        }
                    } else {
                        console.log("path filled");
                        // Path filled: Change the color of that path.

                        pathObj.svgData.fillColor = wickEditor.currentTool.color;
                        canvas.remove(fabricObj); // to force regeneration of fabric path object

                        wickEditor.syncInterfaces();
                    }
                }
            });
        }
    });

    var getPaperObjectIntersectingWithPoint = function (item, point, fillClockwise) {

        var hitOptions = {
            segments: true,
            stroke: true,
            fill: true,
            tolerance: 0
        };

        // Look for a hit on item
        var hitResult = item.hitTest(point, hitOptions);
        if(hitResult && hitResult.item.clockwise == fillClockwise) {
            return hitResult.item;
        }

        // Didn't find what we were looking for, so look for a hit on item's children
        if(!item.children) return null;

        for(var i = 0; i < item.children.length; i++) {
            var hitSVG = getPaperObjectIntersectingWithPoint(item.children[i], point, fillClockwise);
            if(hitSVG) {
                return hitSVG;
            }
        }

        return null;
    }*/

}