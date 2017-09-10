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
            var otherRenderer = wickEditor.previewplayer.getRenderer();
            renderer = otherRenderer.renderer;
            canvasContainer = otherRenderer.canvasContainer;
        }
        if(canvasContainer) {
            canvasContainer.style.width = wickEditor.project.width+'px';
            canvasContainer.style.height = wickEditor.project.height+'px';

            renderer.renderWickObjects(wickEditor.project, wickEditor.project.rootObject.getAllActiveChildObjects());
            var canvas = canvasContainer.children[0];
            wickFrame.thumbnail = canvas.toDataURL('image/png');
        }
    }

    self.renderAllThumbsOnTimeline = function () {
        var allFrames = wickEditor.project.currentObject.getAllFrames();
        allFrames.forEach(function (frame) {
            self.renderThumbnailForFrame(frame);
        });
    }

}
