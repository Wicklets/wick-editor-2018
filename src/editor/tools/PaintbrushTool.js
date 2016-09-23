var PaintbrushTool = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        return 'url(resources/paintbrush-cursor.png) 64 64,default';
    }

    var fabricInterface = wickEditor.interfaces['fabric'];
    var canvas = fabricInterface.canvas;

    this.brushSize = 5;
    this.brushSmoothing = 10.0;
    this.color = "#B00600";

    canvas.on('mouse:down', function(e) {
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
    }

    this.uniteIntersectingPaths = function () {

        canvas.forEachObject(function(fabObjA) {
            canvas.forEachObject(function(fabObjB) {

                var bothFabObjsArePaths = fabObjA.type === "path" && fabObjB.type === "path";
                var notSameObject = fabObjA.wickObjectID != fabObjB.wickObjectID;
                var bothHaveWickObjectIDs = fabObjA.wickObjectID && fabObjB.wickObjectID;

                if (bothFabObjsArePaths && notSameObject && bothHaveWickObjectIDs) {
                    var pathA = fabObjA.paperPath;
                    var pathB = fabObjB.paperPath;
                    var intersections = pathA.getIntersections(pathB);
                    if(intersections.length > 0) {
                        if(fabObjA.fill === fabObjB.fill) {
                            // Same color: union
                        } else {
                            // Different colors: path with higer z index subtracts from other path 
                        }
                    }
                }

            });
        });

    }

    this.splitPathsWithMultiplePieces = function () {
        canvas.forEachObject(function(fabObj) {
            if(fabObj.type === "path" && fabObj.wickObjectID) {
                var path = fabObj.paperPath;
                // Not sure how to check if the path is multiple pieces...
            }
        });
    }

    // Paths are handled internally by fabric so we have to intercept them as they are added by fabric
    canvas.on('object:added', function(e) {
        if(e.target.type !== "path" || e.target.wickObjectID) {
            return;
        }

        var pathFabricObject = e.target;

        that.potracePath(e.target, function(SVGData) {
            /*if(wickEditor.currentTool.type == "paintbrush") {
                that.convertPathToWickObject(SVGData, pathFabricObject)
            } else if(wickEditor.currentTool.type == "eraser") {
                that.eraseUsingSVG(SVGData);
            }*/

            that.convertPathToWickObject(SVGData, pathFabricObject);

            canvas.remove(e.target);
        });

    });

    this.potracePath = function (pathFabricObject, callback) {
        // New potrace-and-send-to-paper.js brush
        pathFabricObject.cloneAsImage(function(clone) {
            var imgSrc = clone._element.currentSrc || clone._element.src;

            var img = new Image();
            img.onload = function () {
                // Scale the image before we pass it to potrace (fixes retina display bugs!)
                var dummyCanvas = document.createElement('canvas');
                var dummyContext = dummyCanvas.getContext('2d');
                dummyCanvas.width = img.width/window.devicePixelRatio;
                dummyCanvas.height = img.height/window.devicePixelRatio;
                dummyContext.drawImage(img, 0,0, img.width,img.height, 0,0, dummyCanvas.width,dummyCanvas.height);
                
                Potrace.loadImageFromDataURL(dummyCanvas.toDataURL());
                Potrace.setParameter({optcurve: true, alphamax:wickEditor.currentTool.brushSmoothing/10});
                Potrace.process(function(){
                    var SVGData = {svgString:Potrace.getSVG(1), fillColor:canvas.freeDrawingBrush.color}
                    callback(SVGData);
                });
            }
            img.src = imgSrc;
        }); 
    }

    this.convertPathToWickObject = function (SVGData, pathFabricObject) {
        WickObject.fromSVG(SVGData, function(wickObj) {
            wickObj.x = pathFabricObject.left - fabricInterface.getCenteredFrameOffset().x - pathFabricObject.width/2  - fabricInterface.canvas.freeDrawingBrush.width/2;
            wickObj.y = pathFabricObject.top  - fabricInterface.getCenteredFrameOffset().y - pathFabricObject.height/2 - fabricInterface.canvas.freeDrawingBrush.width/2;
            wickEditor.actionHandler.doAction('addObjects', {wickObjects:[wickObj]})
        });
    }

    this.eraseUsingSVG = function (SVGData) {
        console.error("eraseUsingSVG NYI")
    }

}