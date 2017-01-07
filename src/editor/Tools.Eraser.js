/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

if(!window.Tools) Tools = {};

Tools.Eraser = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        var canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        var context = canvas.getContext('2d');
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var radius = wickEditor.fabric.tools.paintbrush.brushSize/2 * wickEditor.fabric.canvas.getZoom();

        context.beginPath();
        context.arc(centerX, centerY, radius+1, 0, 2 * Math.PI, false);
        context.fillStyle = "#000000"
        context.fill();

        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = "#FFFFFF";
        context.fill();

        return 'url(' + canvas.toDataURL() + ') 64 64,default';
    };
    
    this.brushSize = 5;
    this.color = "#000000";

// Path vectorization

    wickEditor.fabric.canvas.on('object:added', function(e) {
        if(!(wickEditor.fabric.currentTool instanceof Tools.Eraser)) return;

        var fabricPath = e.target;

        // Make sure the new object is actually a path created by fabric's drawing tool
        if(fabricPath.type !== "path" || fabricPath.wickObjectRef) {
            return;
        }

        //var svgData = '<svg id="svg" version="1.1" width="6" height="5" xmlns="http://www.w3.org/2000/svg">' + fabricPath.toSVG() + '</svg>'
        //wickEditor.paper.onEraserPathAdded(svgData);
        potraceFabricPath(fabricPath, function(SVGData) {
            wickEditor.paper.onEraserPathAdded(SVGData, fabricPath.left, fabricPath.top);
        });

        fabricPath.remove();
        
    });

    var potraceFabricPath = function (pathFabricObject, callback) {
        // I think there's a bug in cloneAsImage when zoom != 1, this is a hack
        var oldZoom = wickEditor.fabric.canvas.getZoom();
        wickEditor.fabric.canvas.setZoom(1);

        pathFabricObject.cloneAsImage(function(clone) {
            var img = new Image();
            img.onload = function () {
                potraceImage(img, callback);
            };
            img.src = clone._element.currentSrc || clone._element.src;
        });

        // Put zoom back to where it was before
        wickEditor.fabric.canvas.setZoom(oldZoom);
    };

    var potraceImage = function (img, callback) {

        // Scale the image before we pass it to potrace (fixes retina display bugs!)
        var dummyCanvas = document.createElement('canvas');
        var dummyContext = dummyCanvas.getContext('2d');
        //var zoom = wickEditor.fabric.canvas.getZoom();
        dummyCanvas.width = img.width/window.devicePixelRatio;
        dummyCanvas.height = img.height/window.devicePixelRatio;
        dummyContext.drawImage(img, 0,0, img.width,img.height, 0,0, img.width/window.devicePixelRatio,img.height/window.devicePixelRatio);
        
        // Send settings and the image data to potrace to vectorize it!
        Potrace.loadImageFromDataURL(dummyCanvas.toDataURL());
        Potrace.setParameter({
            optcurve: false,
            alphamax: 1.0
        });
        Potrace.process(function(){
            callback(Potrace.getSVG(1, null, that.color));
        });
    };

}