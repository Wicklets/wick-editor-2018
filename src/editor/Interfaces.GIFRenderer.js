/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var GIFRendererInterface = function (wickEditor) {

	var self = this;

    var gifCanvas;
    var gifRenderer;

    self.setup = function () {

        /*gifCanvas = document.createElement('div');

        gifRenderer = new WickPixiRenderer(wickEditor.project, gifCanvas, 1.0);
        gifRenderer.setup();*/

    }

    self.syncWithEditorState = function () {

    };

    self.renderProjectAsGIF = function (callback) {

        gifRenderer = window.wickRenderer;

        wickEditor.project.fitScreen = false;

        var gifFrameDataURLs = [];

        wickEditor.project.currentObject = wickEditor.project.rootObject;
        var len = wickEditor.project.rootObject.getTotalTimelineLength();
        gifRenderer.refresh(wickEditor.project.rootObject);
        for (var i = 0; i < len; i++) {
            wickEditor.project.rootObject.playheadPosition = i;
            gifRenderer.render(wickEditor.project.getCurrentObject().getAllActiveChildObjects());
            gifFrameDataURLs.push(window.rendererCanvas.getElementsByTagName('canvas')[0].toDataURL());
        }
        //gifRenderer.cleanup();

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

        var gifFrameImages = [];

        var proceed;

        gifFrameDataURLs.forEach(function (gifFrameDataURL) {
            var gifFrameImage = new Image();
            gifFrameImage.onload = function () {
                gifFrameImages.push(gifFrameImage);
                if(gifFrameImages.length === gifFrameDataURLs.length) {
                    proceed();
                }
            }
            gifFrameImage.src = gifFrameDataURL;
        });

        proceed = function () {
            gifFrameImages.forEach(function (gifFrameImage) {
                gif.addFrame(gifFrameImage, {delay: 1000/wickEditor.project.framerate});
            });

            gif.render();

            gif.on('finished', function(blob) {
                callback(blob);
            });     
        }

    }

    self.cleanup = function () {
        gifRenderer.cleanup();
    }

}
