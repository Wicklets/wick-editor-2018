/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var FillBucketTool = function (wickEditor) {

	var that = this;

    var canvas = wickEditor.interfaces['fabric'].canvas;

    this.getCursorImage = function () {
        return 'url(resources/fillbucket-cursor.png) 64 64,default';
    }

    canvas.on('mouse:down', function(e) {
        if(e.e.button != 0) return;
        if(!(wickEditor.currentTool instanceof FillBucketTool)) return;

        var onscreenObjects = wickEditor.project.getCurrentObject().getAllActiveChildObjects();
        updatePaperDataOnVectorWickObjects(onscreenObjects);

        var frameOffset = wickEditor.interfaces.fabric.getCenteredFrameOffset();
        var panOffset = wickEditor.interfaces.fabric.getPanOffset();
        var symbolOffset = wickEditor.project.getCurrentObject().getAbsolutePosition();
        var mouseX = e.e.offsetX - frameOffset.x - panOffset.x - symbolOffset.x;
        var mouseY = e.e.offsetY - frameOffset.y - panOffset.y - symbolOffset.y;
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
    
}