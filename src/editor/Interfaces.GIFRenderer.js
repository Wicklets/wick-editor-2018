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
    
var GIFRendererInterface = function (wickEditor) {

	var self = this;

    self.setup = function () {
        self.canvasContainer = document.createElement('div');
        self.canvasContainer.style.position = 'absolute';
        self.canvasContainer.style.left = '0px';
        self.canvasContainer.style.top = '0px';
        self.canvasContainer.style.width = wickEditor.project.width+'px';
        self.canvasContainer.style.height = wickEditor.project.height+'px';
        self.renderer = new WickTwoRenderer(self.canvasContainer);
        self.renderer.setup();
    }

    self.syncWithEditorState = function () {

    }

    self.renderProjectAsGIF = function (callback) {

        var gifFrameDataURLs = [];

        self.canvasContainer.style.width = wickEditor.project.width+'px';
        self.canvasContainer.style.height = wickEditor.project.height+'px';

        wickEditor.project.currentObject = wickEditor.project.rootObject;
        var len = wickEditor.project.rootObject.getTotalTimelineLength();
        for (var i = 0; i < len; i++) {
            wickEditor.project.rootObject.playheadPosition = i;
            wickEditor.project.applyTweens();
            self.renderer.render(wickEditor.project, wickEditor.project.rootObject.getAllActiveChildObjects());
            var canvas = self.canvasContainer.children[0];
            gifFrameDataURLs.push(canvas.toDataURL());
        }

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

        function proceed () {
            gifFrameImages.forEach(function (gifFrameImage) {
                gif.addFrame(gifFrameImage, {delay: 1000/wickEditor.project.framerate});
            });

            gif.render();

            gif.on('finished', function(blob) {
                callback(blob);
            });     
        }

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

    }

}
