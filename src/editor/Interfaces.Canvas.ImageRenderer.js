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

        if(!self.canvasContainer) {
            // we have to use the renderer from the preview player because pixi gets mad if theres >1 renderer
            // later just make a big global renderer owned by the editor that everybody can use
            var otherRenderer = wickEditor.canvas.getPixiCanvas().getRenderer();
            self.renderer = otherRenderer.renderer;
            self.canvasContainer = otherRenderer.canvasContainer;
        }

        var gifFrameDataURLs = [];

        self.canvasContainer.style.width = wickEditor.project.width+'px';
        self.canvasContainer.style.height = wickEditor.project.height+'px';

        wickEditor.project.currentObject = wickEditor.project.rootObject;
        var len = wickEditor.project.rootObject.getTotalTimelineLength();
        for (var i = 0; i < len; i++) {
            wickEditor.project.rootObject.playheadPosition = i;
            wickEditor.project.applyTweens();
            //self.renderer.renderWickObjects(wickEditor.project, wickEditor.project.rootObject.getAllActiveChildObjects());
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

        /*var gif;
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
        }*/

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

    self.renderProjectAsPNG = function (callback) {
        if(!self.canvasContainer) {
            // we have to use the renderer from the preview player because pixi gets mad if theres >1 renderer
            // later just make a big global renderer owned by the editor that everybody can use
            var otherRenderer = wickEditor.canvas.getPixiCanvas().getRenderer();
            self.renderer = otherRenderer.renderer;
            self.canvasContainer = otherRenderer.canvasContainer;
        }
        
        self.canvasContainer.style.width = wickEditor.project.width+'px';
        self.canvasContainer.style.height = wickEditor.project.height+'px';

        wickEditor.project.currentObject = wickEditor.project.rootObject;
        self.renderer.renderWickObjects(wickEditor.project, wickEditor.project.rootObject.getAllActiveChildObjects());
        var canvas = self.canvasContainer.children[0];
        callback(dataURItoBlob(canvas.toDataURL()))
        //callback(canvas.toDataURL())
    }

    self.getCanvasAsDataURL = function (callback) {
        if(!self.canvasContainer) {
            // we have to use the renderer from the preview player because pixi gets mad if theres >1 renderer
            // later just make a big global renderer owned by the editor that everybody can use
            var otherRenderer = wickEditor.canvas.getPixiCanvas().getRenderer();
            self.renderer = otherRenderer.renderer;
            self.canvasContainer = otherRenderer.canvasContainer;
        }

        wickEditor.project.currentObject = wickEditor.project.rootObject;
        self.renderer.renderWickObjects(wickEditor.project, wickEditor.project.rootObject.getAllActiveChildObjects(), 2);
        var canvas = self.canvasContainer.children[0];
        
        callback(canvas.toDataURL())
    }

    return self;

};
