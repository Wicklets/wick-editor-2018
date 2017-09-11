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
    
var ThumbnailRendererInterface = function (wickEditor) {

    var self = this;

    var renderer;
    var canvasContainer;

    self.setup = function () {
        /*canvasContainer = document.getElementById('previewRenderContainer');
        canvasContainer.style.width = wickEditor.project.width+'px';
        canvasContainer.style.height = wickEditor.project.height+'px';
        renderer = new WickPixiRenderer(canvasContainer);*/
    }
    
    self.syncWithEditorState = function () {
        var frame = wickEditor.project.getCurrentFrame();
        if(frame) {
            self.renderThumbnailForFrame(frame);
        }
    }

    self.renderThumbnailForFrame = function (wickFrame) {
        if(!canvasContainer) {
            // we have to use the renderer from the preview player because pixi gets mad if theres >1 renderer
            // later just make a big global renderer owned by the editor that everybody can use
            var otherRenderer = wickEditor.previewplayer.getRenderer();
            renderer = otherRenderer.renderer;
            canvasContainer = otherRenderer.canvasContainer;
        }
        if(canvasContainer) {
            canvasContainer.style.width = wickEditor.project.width+'px';
            canvasContainer.style.height = wickEditor.project.height+'px';

            renderer.renderWickObjects(wickEditor.project, wickFrame.wickObjects);
            var canvas = canvasContainer.children[0];
            wickFrame.thumbnail = canvas.toDataURL('image/png');
        }
    }

    self.renderAllThumbsOnTimeline = function () {
        // force renderer to preload everything
        renderer.renderWickObjects(wickEditor.project, []);

        var allFrames = wickEditor.project.currentObject.getAllFrames();
        setTimeout(function () {
            allFrames.forEach(function (frame) {
                self.renderThumbnailForFrame(frame);
            });
            wickEditor.timeline.syncWithEditorState();
        }, 500); // eh just give it a little time to get ready
    }

}
