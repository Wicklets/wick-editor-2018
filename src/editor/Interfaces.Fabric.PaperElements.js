/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var FabricPaperElements = function (wickEditor, fabricInterface) {

    var that = this;

    var paperObjsInCanvas = [];

    this.update = function () {

        var currentObject = wickEditor.project.getCurrentObject();
        var currentFrame = currentObject.getCurrentFrame();

        var allPaths = wickEditor.paper.getAllSVGs();

        // Remove paths that don't exist anymore or need to be regenerated
        var removeTheseObjs = [];
        fabricInterface.canvas._objects.forEach(function(fabricObj) {
            if(!fabricObj || !fabricObj.paperObjectReference) return;

            if(allPaths.indexOf(fabricObj.paperObjectReference) == -1) {
                removeTheseObjs.push(fabricObj);
                paperObjsInCanvas[fabricObj.paperObjectReference.id] = null;
            }
        });
        removeTheseObjs.forEach(function (fabricObj) {
            fabricObj.remove();
        });

        // Add new paths to the fabric canvas from paper.js and update existing paths
        allPaths.forEach(function (path) {
            if(!paperObjsInCanvas[path.id]) {
                createFabricObjectFromPaperObject(path, function (fabricObj) {
                    paperObjsInCanvas[path.id] = fabricObj;
                    fabricInterface.canvas.add(fabricObj);
                    fabricInterface.canvas.renderAll();
                });
            } else {
                updateFabObj(paperObjsInCanvas[path.id], path);
            }
        });

    }

    var createFabricObjectFromPaperObject = function (paperObj, callback) {
        fabric.loadSVGFromString(paperObj.exportSVG({asString:true}), function(objects, options) {
            var pathFabricObj = objects[0];

            pathFabricObj.paperObjectReference = paperObj;

            callback(pathFabricObj);

            //that.syncObjects(wickObj, pathFabricObj);
            //pathFabricObj.setColor(wickObj.svgData.fillColor);

            /*fabric.loadSVGFromString(this.svgData.svgString, function(objects, options) {
                objects[0].fill = that.svgData.fillColor;
                var svgFabricObject = fabric.util.groupSVGElements(objects, options);
                svgFabricObject.scaleX /= window.devicePixelRatio;
                svgFabricObject.scaleY /= window.devicePixelRatio;
                svgFabricObject.setCoords();
                svgFabricObject.cloneAsImage(function(clone) {
                    var element = clone.getElement();
                    var imgSrc = element.src;
                    that.svgCacheImageData = imgSrc;
                    callback();
                }, {enableRetinaScaling:false});
            });*/
            
            /*pathFabricObj.scaleX /= window.devicePixelRatio;
            pathFabricObj.scaleY /= window.devicePixelRatio;
            pathFabricObj.cloneAsImage(function(clone) {
                var element = clone.getElement();
                var imgSrc = element.src;
                wickObj.svgCacheImageData = imgSrc;
                fabric.Image.fromURL(imgSrc, function(newFabricImage) {
                    wickObj.cachedFabricObject = newFabricImage;
                    newFabricImage.wickObjReference = wickObj;
                    callback(newFabricImage);
                });
            }, {enableRetinaScaling:false});*/

            //wickObj.cachedFabricObject = pathFabricObj;

            //callback(pathFabricObj);
        });
    }

    var updateFabObj = function (fabricObj, paperObj, activeObjects) {
        /*fabricObj.left = paperObj.position.x;
        fabricObj.top = paperObj.position.y;
        fabricObj.setCoords();*/
    }

}
