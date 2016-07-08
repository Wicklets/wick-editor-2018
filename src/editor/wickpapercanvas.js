/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var PaperCanvas = function (wickEditor) {

/*************
    Setup
**************/

    var that = this;

    this.canvas = document.getElementById('paperCanvas');
    paper.setup(this.canvas);

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

/*********************
    Import content
**********************/

    this.addSVG = function (file, x, y) {
        paper.project.importSVG(file, function(item) {
            item.position = new paper.Point(x, y);
            // For each item I in canvas:
            //   If there are any intersections between I and item:
            //     let B = Boolean OR of the paths, remove I and item, add B
            that.refresh();
        });
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
                VerboseLog.log("tryFillPath hitResult: ")
                VerboseLog.log(hitResult)
                if(hitResult && !hitResult.item.clockwise) {
                    console.log("filling!")
                    console.log(hitResult.item);
                    console.log(i)
                    item.fillColor = "#ff0000";
                }
            }

            tryFillPath(child, point, d+1);
        }

    }

/***************************
    Interactivity events
***************************/

    this.mouseDown = function (event) {

        currentTool = event.tool;

        VerboseLog.log("paper canvas mouseDown with tool: " + event.tool);

        if (currentTool == "fillbucket") {

            console.log("recursiveHitTest:")

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

    this.mouseMove = function (event) {
        /*
        paper.project.activeLayer.selected = false;
        //if (event.item) {
        //    event.item.selected = true;
        //}

        var hitResult = paper.project.hitTest(new paper.Point(event.offsetX, event.offsetY), hitOptions);
        if (!hitResult) return;

        hitResult.item.selected = true;

        that.resize();
        paper.view.draw();
        wickEditor.fabricCanvas.reloadPaperCanvas();


        if (hitResult.type == 'segment') {
            //segment = hitResult.segment;
        } else if (hitResult.type == 'stroke') {
            //var location = hitResult.location;
            //segment = path.insert(location.index + 1, event.point);
            //path.smooth();

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