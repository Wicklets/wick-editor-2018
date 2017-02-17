/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var FabricProjectRenderer = function (wickEditor, fabricInterface) {

	var self = this;
	var canvas = fabricInterface.canvas;

    self.update = function () {};

    self.getCanvasAsImage = function (callback, args) {

        var selectedObjs = [];
        canvas.forEachObject(function(fabricObj) {
            if(args && args.objs && args.objs.indexOf(fabricObj.wickObjectRef) === -1) return;

            if(fabricObj.wickObjectRef && !fabricObj.isWickGUIElement && fabricObj.wickObjectRef.isOnActiveLayer()) {
                //fabricObj.set('active', true);
                selectedObjs.push(fabricObj);
            }
        });

        if(selectedObjs.length < 1) {
            //canvas._activeObject = selectedObjs[0];
            //console.log("no selectedObjs")
            callback(null);
        } else {
            var group = new fabric.Group([], {
                originX: 'left',
                originY: 'top'
            });
            //for(var i = selectedObjs.length-1; i >= 0; i--) {
            for(var i = 0; i < selectedObjs.length; i++) {
                console.log(selectedObjs[i])
                //group.canvas = canvas // WHAT ??????????????? WHY
                var clone = fabric.util.object.clone(selectedObjs[i]);
                group.addWithUpdate(clone);
            }

            //group.left = Math.round(group.left)
            //group.top = Math.round(group.top)
            group.setCoords();

            var cloneLeft = (group.left)
            var cloneTop = (group.top)

            //var object = fabric.util.object.clone(group);
            var oldZoom = canvas.getZoom();
            //canvas.setZoom(1)
            //canvas.renderAll();
            group.setCoords();

            group.cloneAsImage(function (img) {
                //canvas.setZoom(oldZoom)
                canvas.renderAll();
                group.setCoords();

                group.forEachObject(function(o){ group.removeWithUpdate(o) });
                canvas.remove(group);
                canvas.renderAll();

                callback({
                    x:cloneLeft,
                    y:cloneTop,
                    src:img.getElement().src,
                });
            })

        }

        
    }

    self.getCanvasThumbnail = function (callback) {
        /*self.getCanvasAsImage(function (imageObj) {
            if(!imageObj) {
                callback(null);
                return
            }

            var thumbCanvas = document.createElement('canvas');
            thumbCanvas.width = wickEditor.project.width/10;
            thumbCanvas.height = wickEditor.project.height/10;

            var thumbCtx = thumbCanvas.getContext('2d');
            thumbCtx.clearRect(0,0,thumbCanvas.width,thumbCanvas.height);
            if(!wickEditor.project.transparent) {
                thumbCtx.rect(0, 0, thumbCanvas.width,thumbCanvas.height);
                thumbCtx.fillStyle = wickEditor.project.backgroundColor;
                thumbCtx.fill();
            }

            var image = new Image();
            image.onload = function () {
                thumbCtx.drawImage(image, imageObj.x/10, imageObj.y/10, image.width/10, image.height/10);
                callback(thumbCanvas.toDataURL())
            }
            image.src = imageObj.src;
        });*/

        var selectedObjs = [];
        canvas.forEachObject(function(fabricObj) {
            if(fabricObj.wickObjectRef && !fabricObj.isWickGUIElement && fabricObj.wickObjectRef.isOnActiveLayer()) {
                //fabricObj.set('active', true);
                selectedObjs.push(fabricObj);
            }
        });

        var thumbnailResizeFactor = 10.0;

        var thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = wickEditor.project.width/thumbnailResizeFactor;
        thumbCanvas.height = wickEditor.project.height/thumbnailResizeFactor;

        var thumbCtx = thumbCanvas.getContext('2d');
        thumbCtx.clearRect(0,0,thumbCanvas.width,thumbCanvas.height);
        if(!wickEditor.project.transparent) {
            thumbCtx.rect(0, 0, thumbCanvas.width,thumbCanvas.height);
            thumbCtx.fillStyle = wickEditor.project.backgroundColor;
            thumbCtx.fill();
        }

        selectedObjs.forEach(function (fabricObj) {
            thumbCtx.drawImage(
                fabricObj._element, 
                fabricObj.left/thumbnailResizeFactor, fabricObj.top/thumbnailResizeFactor, 
                fabricObj.width/thumbnailResizeFactor, fabricObj.height/thumbnailResizeFactor
            );
        });

        callback(thumbCanvas.toDataURL());
    }

    self.renderProjectAsGIF = function (callback) {
        self.getProjectAsCanvasSequence(function (canvases) {
            var gif;
            if(wickEditor.project.transparent) {
                gif = new GIF({
                    workers: 2,
                    quality: 10,
                    workerScript: 'lib/gif.worker.js',
                    transparent: true,
                    width: wickEditor.project.width,
                    height: wickEditor.project.height,
                });
            } else {
                gif = new GIF({
                    workers: 2,
                    quality: 10,
                    workerScript: 'lib/gif.worker.js',
                    background: '#fff',
                    width: wickEditor.project.width,
                    height: wickEditor.project.height,
                });
            }

            canvases.forEach(function (canvas) {
                gif.addFrame(canvas, {delay: 1000/wickEditor.project.framerate});
            });

            gif.render();

            gif.on('finished', function(blob) {
                callback(blob);
            });
        });
    }

    self.renderProjectAsWebM = function (callback) {
        var video = new Whammy.Video(15);

        self.getProjectAsCanvasSequence(function (contexts) {

            contexts.forEach(function (context) {
                video.add(context);
            });

            video.compile(false, function(output) {

                var url = webkitURL.createObjectURL(output);

                //document.getElementById('download').href = url;

                window.open(url);

            });

        }, {asContexts:true});
    }

    self.getProjectAsCanvasSequence = function (callback, args) {
        var canvases = [];
        var contexts = [];

        self.getProjectAsImageSequence(function (imgDatas) {

            var proceed = function () {
                images.forEach(function (image) {
                    var gifFrameCanvas = document.createElement('canvas');
                    //gifFrameCanvas.style.position = 'absolute'
                    //gifFrameCanvas.style.left = '0px'
                    //gifFrameCanvas.style.top = '0px'
                    //document.getElementById('editor').appendChild(gifFrameCanvas)
                    gifFrameCanvas.width = wickEditor.project.width;
                    gifFrameCanvas.height = wickEditor.project.height;

                    var gifFrameCtx = gifFrameCanvas.getContext('2d');
                    gifFrameCtx.clearRect(0,0,gifFrameCanvas.width,gifFrameCanvas.height);
                    if(!wickEditor.project.transparent) {
                        gifFrameCtx.rect(0, 0, gifFrameCanvas.width,gifFrameCanvas.height);
                        gifFrameCtx.fillStyle = wickEditor.project.backgroundColor;
                        gifFrameCtx.fill();
                    }
                    gifFrameCtx.drawImage(image.img, image.x, image.y);

                    canvases.push(gifFrameCanvas);
                    contexts.push(gifFrameCtx);
                });

                if(args && args.asContexts) 
                    callback(canvases);
                else
                    callback(contexts);
            }

            var images = [];
            imgDatas.forEach(function (imgData) {
                var image = new Image();
                image.onload = function () { 
                    images.push({img:image, x:imgData.x, y:imgData.y});
                    if(images.length === imgDatas.length) proceed();
                }
                image.src = imgData.src;
            });
        });
    }

    self.getProjectAsImageSequence = function (callback) {

        var imageSequence = [];
        var root = wickEditor.project.rootObject;

        var proceed = function () {
            wickEditor.syncInterfaces();

            setTimeout(function () {
                self.getCanvasAsImage(function (image) {
                    imageSequence.push(image);
                    root.playheadPosition++; 

                    if(wickEditor.project.getCurrentFrame()) {
                        proceed();
                    } else {
                        callback(imageSequence);
                        wickEditor.syncInterfaces();
                    }
                });
            }, 300); console.error("this is very bad here");
        }

        root.playheadPosition = 0;
        proceed();

    }

}




