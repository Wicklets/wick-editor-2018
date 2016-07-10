/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var PaperCanvas = function (wickEditor) {

/*************
    Setup
**************/

    var that = this;

    this.canvas = document.getElementById('paperCanvas');
    paper.setup(this.canvas);

    /*console.log(document.getElementById('path1'))

    var path1 = paper.project.importSVG(document.getElementById('path1')).removeChildren(0, 1)[0];
    var path2 = paper.project.importSVG(document.getElementById('path2')).removeChildren(0, 1)[0];

    console.log(path1)
    console.log(path2)

    var pathStyleBoolean = {
        strokeColor: new paper.Color(0.8),
        fillColor: new paper.Color(0, 0, 0, 0.0),
        strokeWidth: 1
    };
    path1.style = path2.style = pathStyleBoolean;

    var united = path2.unite(path1);
    united.strokeColor = 'black';
    united.fillColor = 'yellow';
    paper.project.activeLayer.addChild(united)
    console.log(united)
    paper.view.draw();*/

/*********************
    Refresh methods
**********************/

    this.redraw = function () {
        paper.view.draw();
    }

    this.resize = function () {
        this.canvas.style.width  = window.innerWidth  + "px";
        this.canvas.style.height = window.innerHeight + "px";
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    this.refresh = function () {
        that.resize();
        paper.view.draw();
        wickEditor.fabricCanvas.reloadPaperCanvas();
    }

/**************************
    Import/export content
**************************/
    
    /* Use to add a new path */
    this.addPathSVG = function (svgString, x, y, fillColor) {

        var xmlString = svgString
          , parser = new DOMParser()
          , doc = parser.parseFromString(xmlString, "text/xml");

        var group = paper.project.importSVG(doc);
        var path1 = group.removeChildren(0, 1)[0];
        path1.position = new paper.Point(x,y);

        for(var i = 0; i < paper.project.activeLayer._children.length; i++) {
            var path2 = paper.project.activeLayer._children[i];

            var isGroup = path2 instanceof paper.Group;
            if(!isGroup) {
                var intersections = path1.getIntersections(path2);
                if(intersections.length > 0) {

                    var pathStyleBoolean = {
                        strokeColor: new paper.Color(0.8),
                        fillColor: new paper.Color(0, 0, 0, 0.0),
                        strokeWidth: 1
                    };
                    path1.style = path2.style = pathStyleBoolean;

                    console.log("intersection:");
                    console.log(path1);
                    console.log(path2);

                    var union = path1.unite(path2);
                    console.log("unite result:");
                    console.log(union);
                }
            }
        }

        paper.project.activeLayer.addChild(path1);

        that.refresh();

        /*paper.project.importSVG(file, function(item) {
            item.position = new paper.Point(x, y);
            item.fillColor = fillColor;
            // For each item I in canvas:
            //   If there are any intersections between I and item AND I and item have the same fill color:
            //     let B = Boolean OR of the paths, remove I and item, add B to canvas

            var activeLayerChildren = paper.project.activeLayer._children;
            for(var i = 0; i < activeLayerChildren.length; i++) {
                var child = activeLayerChildren[i];

                if(child !== item) {
                    console.log("checking for intersections between:")
                    console.log(child);
                    console.log(item);
                    var intersections = item._children[0].getIntersections(child._children[0]);
                    if(intersections.length > 0) {
                        console.log("intersection!!:");

                        var path1 = item.removeChildren(0, 1)[0];
                        var path2 = child.removeChildren(0, 1)[0];

                        var boolPathU = path1.unite(path2);
                        if(boolPathU) {
                            console.log(boolPathU);
                            boolPathU.style = {
                                fillColor: new paper.Color(1, 0, 0, 0.5),
                                strokeColor: new paper.Color(0, 0, 0),
                                strokeWidth: 0
                            };
                            paper.project.activeLayer.addChild(boolPathU);
                            i = 99999;
                        }
                    }
                }
            }

            that.refresh();
        });*/
    }

    /* Use to add a path that acts as an eraser */
    this.addEraserSVG = function (file, x, y) {
        paper.project.importSVG(file, function(item) {
            item.position = new paper.Point(x, y);
            // Do smoothing on item (need to take extra param)
            // For each item I in canvas:
            //   let B = boolean NOT (i think it's NOT? might be xor?) bewteen I and item, add B to canvas
            that.refresh();
        });
    }

    /* Use to get all SVGs out of the paper.js canvas and into the fabric.js canvas */
    /* Must be called when switching back to the cursor tool and when frame is left. */
    this.getAllSVGs = function () {
        var allSVGs = [];

        var activeLayer = paper.project.activeLayer;
        // Iterate through all items in canvas activeLayer, return em in a list
        for(var i = 0; i < activeLayer.children.length; i++) {
            var child = activeLayer.children[i];

            var isGroup = child instanceof paper.Group;
            if(!isGroup) {

                var width = child.handleBounds.width;
                var height = child.handleBounds.height;

                var left = child.handleBounds.x;
                var top  = child.handleBounds.y;

                child.position = new paper.Point(child.handleBounds.width/2,child.handleBounds.height/2);
                var childSVG = child.exportSVG({asString: true});

                // quick fix for holes turned into their own paths
                if(!childSVG.startsWith("<g")) {
                    childSVG = '<g xmlns="http://www.w3.org/2000/svg" id="svg" fill="#000000" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="" stroke-dashoffset="0" font-family="Times" font-weight="normal" font-size="16" text-anchor="start" mix-blend-mode="normal">' + childSVG + "</g>";
                }

                allSVGs.push({
                    svgString: childSVG, 
                    width:     width, 
                    height:    height,
                    left:      left,
                    top:       top
                });
            }
        }

        paper.project.activeLayer.removeChildren();
        this.refresh();

        return allSVGs;
    }

/*********************
      Fill tool
**********************/

    var hitOptions = {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 0
    };

    function tryFillHole(item, point, d) {

        if(!item.children) {
            return;
        }

        for(var i = 0; i < item.children.length; i++) {
            var child = item.children[i];

            if(child instanceof paper.Path) {
                var hitResult = child.hitTest(point, hitOptions);
                VerboseLog.log("tryFillHole hitResult: ")
                VerboseLog.log(hitResult)
                if(hitResult && hitResult.item.clockwise) {
                    var clone = hitResult.item.clone();
                    clone.fillColor = "#ff0000";
                    that.refresh();
                    paper.project.activeLayer.addChild(clone);
                    return true;
                }
            }

            if(tryFillHole(child, point, d+1)) {
                return true;
            }
        }

        return false;

    }

    function tryFillPath(item, point, d) {

        if(!item.children) {
            return;
        }

        for(var i = 0; i < item.children.length; i++) {
            var child = item.children[i];

            if(child instanceof paper.Path) {
                var hitResult = child.hitTest(point, hitOptions);
                console.log("tryFillPath hitResult: ");
                console.log(hitResult);
                if(hitResult && !hitResult.item.clockwise) {
                    console.log("filling!");
                    console.log(hitResult.item);
                    console.log(i);
                    item.fillColor = "#ff0000";
                    that.refresh();
                }
            }

            tryFillPath(child, point, d+1);
        }

    }

/***************************
    Interactivity events
***************************/

    that.mouseIsDown = false;

    this.mouseDown = function (event) {

        that.mouseIsDown = true;

        currentTool = event.tool;

        VerboseLog.log("paper canvas mouseDown with tool: " + event.tool);

        if (currentTool == "fillbucket") {

            var holeFilled = tryFillHole(paper.project.activeLayer, new paper.Point(event.offsetX, event.offsetY), 0);
            if (holeFilled) {
                that.refresh();
                return;
            }
            
            var pathFilled = tryFillPath(paper.project.activeLayer, new paper.Point(event.offsetX, event.offsetY), 0);
            if (pathFilled) {
                that.refresh();
                return;
            }

        }

        else if (currentTool == "cursor") {

            segment = path = null;
            var hitResult = paper.project.hitTest(new paper.Point(event.offsetX, event.offsetY), hitOptions);
            if (!hitResult)
                return;

            /*if (event.modifiers.shift) {
                if (hitResult.type == 'segment') {
                    hitResult.segment.remove();
                };
                return;
            }*/

            if (hitResult) {
                path = hitResult.item;

                if (hitResult.type == 'segment') {
                    segment = hitResult.segment;
                } else if (hitResult.type == 'stroke') {
                    var location = hitResult.location;
                    segment = path.insert(location.index + 1, event.point);
                    //path.smooth();
                }
            }
            movePath = hitResult.type == 'fill';
            if (movePath)
                paper.project.activeLayer.addChild(hitResult.item);
        }

    };

    this.mouseUp = function (event) {
        that.mouseIsDown = false;
    }

    this.mouseMove = function (event) {
    /*        
        if(!that.mouseIsDown) {

            //paper.project.activeLayer.selected = true;

            var hitResult = paper.project.hitTest(new paper.Point(event.offsetX, event.offsetY), hitOptions);

            if (!hitResult) {
                //paper.project.deselectAll();
                //that.refresh();
                return;
            }

            hitResult.item.selected = true;

            if (hitResult.type == 'segment') {
                //segment = hitResult.segment;
            } else if (hitResult.type == 'stroke') {
                //var location = hitResult.location;
                //segment = path.insert(location.index + 1, event.point);
                //path.smooth();
            }

        }
        */
    }

    this.mouseDrag = function (event) {
        /*
        if (segment) {
            segment.point += event.delta;
            //path.smooth();
        } else if (path) {
            path.position += event.delta;
        }
        */
    }
    
}