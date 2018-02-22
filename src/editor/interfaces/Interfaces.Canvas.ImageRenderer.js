// https://stackoverflow.com/questions/20958078/resize-a-base-64-image-in-javascript-without-using-canvas
// Takes a data URI and returns the Data URI corresponding to the resized image at the wanted size.
function resizedataURL(datas, wantedWidth, wantedHeight, callback)
    {
        // We create an image to receive the Data URI
        var img = document.createElement('img');

        // When the event "onload" is triggered we can resize the image.
        img.onload = function()
            {        
                // We create a canvas and get its context.
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');

                // We set the dimensions at the wanted size.
                canvas.width = wantedWidth;
                canvas.height = wantedHeight;

                // We resize the image with the canvas method drawImage();
                ctx.drawImage(this, 0, 0, wantedWidth, wantedHeight);

                var dataURI = canvas.toDataURL();

                callback(dataURI);
            };

        // We put the Data URI in the image's src attribute
        img.src = datas;
    }
// Use it like that : resizedataURL('yourDataURIHere', 50, 50);


/* Wick - (c) 2017 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/*  This file is part of Wick. 
    
    Wick is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Wick is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Wick.  If not, see <http://www.gnu.org/licenses/>. */
    

/* move this to Interfaces.Canvas and call it ImageRenderer or something */

var ImageRenderer = function () {

	var self = this;

    self.renderProjectAsGIF = function (callback) {

        retrieveCanvas();

        self.renderer.reorderAllObjects(wickEditor.project)

        self.renderer.preloadAllAssets(wickEditor.project, function () {

            function buildAndSaveGIF () {
                gifFrameImages.forEach(function (gifFrameImage) {
                    gif.addFrame(gifFrameImage, {delay: 1000/wickEditor.project.framerate});
                });

                gif.render();

                gif.on('finished', function(blob) {
                    callback(blob);
                    self.renderer.renderWickObjects(wickEditor.project, [], 2);
                    wickEditor.canvas.getInteractiveCanvas().show();
                });
            }

            var gifFrameDataURLs = [];

            wickEditor.project.currentObject = wickEditor.project.rootObject;
            var len = wickEditor.project.rootObject.getTotalTimelineLength();
            for (var i = 0; i < len; i++) {
                wickEditor.project.rootObject.playheadPosition = i;
                wickEditor.project.applyTweens();
                self.renderer.renderWickObjects(wickEditor.project, wickEditor.project.rootObject.getAllActiveChildObjects(), 1);
                var canvas = self.canvasContainer.children[0];
                gifFrameDataURLs.push(canvas.toDataURL());
            }

            gif = new GIF({
                workers: 2,
                quality: 10,
                workerScript: 'lib/gif.worker.js',
                background: '#FF0000',
                width: wickEditor.project.width,
                height: wickEditor.project.height,
            });

            var gifFrameImages = [];

            gifFrameDataURLs.forEach(function (gifFrameDataURL) {
                resizedataURL(gifFrameDataURL, wickEditor.project.width, wickEditor.project.height, function (resizedGifFrameDataURL) {
                    var gifFrameImage = new Image();
                    gifFrameImage.onload = function () {
                        gifFrameImages.push(gifFrameImage);
                        if(gifFrameImages.length === gifFrameDataURLs.length) {
                            buildAndSaveGIF();
                        }
                    }

                    gifFrameImage.src = resizedGifFrameDataURL;
                })
            });
        });

    }

    self.renderProjectAsPNG = function (callback) {
        retrieveCanvas()

        wickEditor.project.currentObject = wickEditor.project.rootObject;
        self.renderer.renderWickObjects(wickEditor.project, wickEditor.project.rootObject.getAllActiveChildObjects());
        var canvas = self.canvasContainer.children[0];
        callback(dataURItoBlob(canvas.toDataURL()))
        //callback(canvas.toDataURL())
    }

    self.getCanvasAsDataURL = function (callback) {
        retrieveCanvas()

        wickEditor.project.currentObject = wickEditor.project.rootObject;
        self.renderer.renderWickObjects(wickEditor.project, wickEditor.project.rootObject.getAllActiveChildObjects(), 2);
        var canvas = self.canvasContainer.children[0];
        
        callback(canvas.toDataURL())
    }

    function retrieveCanvas () {
        if(!self.canvasContainer) {
            var otherRenderer = wickEditor.canvas.getFastCanvas().getRenderer();
            self.renderer = otherRenderer.renderer;
            self.canvasContainer = otherRenderer.canvasContainer;
        }
        self.canvasContainer.style.width = wickEditor.project.width+'px';
        self.canvasContainer.style.height = wickEditor.project.height+'px';
    }

    return self;

};
