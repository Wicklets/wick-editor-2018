/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

if(!window.Tools) Tools = {};

Tools.Paintbrush = function (wickEditor) {

    var that = this;

    this.brushSize = 5;
    this.color = "#000000";

    this.getCursorImage = function () {
        var canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        var context = canvas.getContext('2d');
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var radius = that.brushSize/2 * wickEditor.fabric.canvas.getZoom();

        function invertColor(hexTripletColor) {
            var color = hexTripletColor;
            color = color.substring(1); // remove #
            color = parseInt(color, 16); // convert to integer
            color = 0xFFFFFF ^ color; // invert three bytes
            color = color.toString(16); // convert to hex
            color = ("000000" + color).slice(-6); // pad with leading zeros
            color = "#" + color; // prepend #
            return color;
        }

        context.beginPath();
        context.arc(centerX, centerY, radius+1, 0, 2 * Math.PI, false);
        context.fillStyle = invertColor(that.color);
        context.fill();

        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = that.color;
        context.fill();

        return 'url(' + canvas.toDataURL() + ') 64 64,default';
    };

// Path vectorization

    // Listen for new paths drawn by fabric, vectorize them, and add them to the WickProject as WickObjects
    wickEditor.fabric.canvas.on('object:added', function(e) {
        if(!(wickEditor.fabric.currentTool instanceof Tools.Paintbrush)) return;

        var fabricPath = e.target;

        // Make sure the new object is actually a path created by fabric's drawing tool
        if(fabricPath.type !== "path" || fabricPath.wickObjectRef) {
            return;
        }

        // Vectorize the path and create a WickObject out of it
        potraceFabricPath(fabricPath, function(SVGData) {
            //wickEditor.paper.addSVG(SVGData, {x:fabricPath.left, y:fabricPath.top});
            WickObject.fromPathFile(SVGData, function (wickObject) {
                wickObject.x = fabricPath.left;
                wickObject.y = fabricPath.top;
                wickObject.isNewDrawingPath = true;
                wickEditor.project.addObject(wickObject);
                wickEditor.paper.onWickObjectsChange();
            });
            
            wickEditor.fabric.drawingPath = fabricPath;
            wickEditor.syncInterfaces();
        });

        /*var SVGData = '<svg id="svg" version="1.1" width="'+fabricPath.width+'" height="'+fabricPath.height+'" xmlns="http://www.w3.org/2000/svg">' + fabricPath.toSVG() + '</svg>';
        console.log(SVGData)
        WickObject.fromPathFile(SVGData, function (wickObject) {
            wickObject.x = fabricPath.left;
            wickObject.y = fabricPath.top;
            wickEditor.project.addObject(wickObject);
            wickEditor.paper.onWickObjectsChange();
            
            wickEditor.fabric.drawingPath = fabricPath;
            wickEditor.syncInterfaces();
        });*/
        
    });

    var potraceFabricPath = function (pathFabricObject, callback) {
        // I think there's a bug in cloneAsImage when zoom != 1, this is a hack
        var oldZoom = wickEditor.fabric.canvas.getZoom();
        wickEditor.fabric.canvas.setZoom(1);

        pathFabricObject.cloneAsImage(function(clone) {
            var img = new Image();
            img.onload = function () {
                potraceImage(img, callback, that.color);
            };
            img.src = clone._element.currentSrc || clone._element.src;
        });

        // Put zoom back to where it was before
        wickEditor.fabric.canvas.setZoom(oldZoom);
    };

}