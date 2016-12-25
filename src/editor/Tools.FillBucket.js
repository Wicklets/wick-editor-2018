/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var FillBucketTool = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        return 'url("resources/fillbucket-cursor.png") 64 64,default';
    };

    var canvas = wickEditor.fabric.canvas;

    canvas.on('mouse:down', function (e) {
        if(e.e.button != 0) return;
        if(!(wickEditor.fabric.currentTool instanceof FillBucketTool)) return;

        var onscreenObjects = wickEditor.project.getCurrentObject().getAllActiveChildObjects();
        VectorToolUtils.updatePaperDataOnVectorWickObjects(onscreenObjects);

        var mouseScreenSpace = wickEditor.fabric.screenToCanvasSpace(e.e.offsetX, e.e.offsetY);
        var mousePoint = new paper.Point(mouseScreenSpace.x, mouseScreenSpace.y);
        var insideSymbolOffset = wickEditor.project.getCurrentObject().getAbsolutePosition();
        mousePoint.x -= insideSymbolOffset.x;
        mousePoint.y -= insideSymbolOffset.y;

        // Try filling paths
        var filledPath = false;
        onscreenObjects.forEach(function (wickPath) {

            if (filledPath) return;
            
            if(wickPath.paperPath.contains(mousePoint)) {
                filledPath = true;
                
                wickEditor.actionHandler.doAction('modifyObjects', { 
                    ids: [wickPath.id], 
                    modifiedStates: [{ svgFillColor : wickEditor.fabric.tools.paintbrush.color }] 
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

            var holeWickObj = VectorToolUtils.createSVGWickObject(hole, wickEditor.fabric.tools.paintbrush.color);
            holeWickObj.x += wickEditor.project.getCurrentObject().getAbsolutePosition().x;
            holeWickObj.y += wickEditor.project.getCurrentObject().getAbsolutePosition().y;
            wickEditor.actionHandler.doAction('addObjects', {
                wickObjects: [holeWickObj],
                partOfChain: true
            });
        });
    });

}