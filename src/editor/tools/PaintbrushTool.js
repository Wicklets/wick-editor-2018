/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

// Note: The actual drawing using the mouse is handled by fabric! See FabricInterface

var PaintbrushTool = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        return 'url(resources/paintbrush-cursor.png) 64 64,default';
    };

    this.brushSize = 5;
    this.brushSmoothing = 10.0;
    this.color = "#B00600";

// Path vectorization

    // Listen for new paths drawn by fabric, vectorize them, and add them to the WickProject as WickObjects
    wickEditor.interfaces.fabric.canvas.on('object:added', function(e) {
        var fabricPath = e.target;

        // Make sure the new object is actually a path created by fabric's drawing tool
        if(fabricPath.type !== "path" || fabricPath.wickObjectID) {
            return;
        }

        // Vectorize the path and create a WickObject out of it
        that.potraceFabricPath(fabricPath, function(SVGData) {
            WickObject.fromSVG(SVGData, function(wickObj) {
                wickObj.x = fabricPath.left - wickEditor.interfaces.fabric.getCenteredFrameOffset().x - fabricPath.width/2  - that.brushSize/2;
                wickObj.y = fabricPath.top  - wickEditor.interfaces.fabric.getCenteredFrameOffset().y - fabricPath.height/2 - that.brushSize/2;
                wickEditor.actionHandler.doAction('addObjects', {wickObjects:[wickObj]})
            });
        });

        // Get rid of original fabric path object
        wickEditor.interfaces.fabric.canvas.remove(e.target);
    });

    this.potraceFabricPath = function (pathFabricObject, callback) {
        pathFabricObject.cloneAsImage(function(clone) {
            var img = new Image();
            img.onload = function () {
                that.potraceImage(img, callback);
            };
            img.src = clone._element.currentSrc || clone._element.src;
        });
    };

    this.potraceImage = function (img, callback) {

        // Scale the image before we pass it to potrace (fixes retina display bugs!)
        var dummyCanvas = document.createElement('canvas');
        var dummyContext = dummyCanvas.getContext('2d');
        dummyCanvas.width = img.width/window.devicePixelRatio;
        dummyCanvas.height = img.height/window.devicePixelRatio;
        dummyContext.drawImage(img, 0,0, img.width,img.height, 0,0, dummyCanvas.width,dummyCanvas.height);
        
        // Send settings and the image data to potrace to vectorize it!
        Potrace.loadImageFromDataURL(dummyCanvas.toDataURL());
        Potrace.setParameter({
            optcurve: true, 
            alphamax: that.brushSmoothing/10
        });
        Potrace.process(function(){
            var SVGData = {
                svgString: Potrace.getSVG(1), 
                fillColor: that.color
            }
            callback(SVGData);
        });
    };

}