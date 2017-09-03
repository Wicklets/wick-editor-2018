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

    var thumbpreview;
    var thumbRenderer;

    this.setup = function () {
        
    }
    
    this.syncWithEditorState = function () {

        self.renderThumbnailForFrame(wickEditor.project.getCurrentFrame());

    }

    this.renderThumbnailForFrame = function (wickFrame) {

        thumbRenderer = window.wickRenderer;

        if(!thumbRenderer) return;

        thumbRenderer.refresh(wickEditor.project.rootObject);

        var layerObjects = [];
        wickEditor.project.getCurrentObject().getAllActiveChildObjects().forEach(function (child) {
            if(child.isOnActiveLayer(wickEditor.project.getCurrentLayer())) {
                layerObjects.push(child);
            }
        });

        setTimeout(function () {
            thumbRenderer.render(layerObjects);
            if(wickEditor.previewplayer.playing) return;
            if(!wickFrame) return;
            
            wickFrame.thumbnail = window.rendererCanvas.getElementsByTagName('canvas')[0].toDataURL('image/jpeg', 0.001);
            wickEditor.timeline.syncWithEditorState();
        }, 100);

    }

    this.renderAllThumbsOnTimeline = function () {
        var oldPlayheadPosition = wickEditor.project.currentObject.playheadPosition;
        var oldLayer = wickEditor.project.currentObject.currentLayer;
        var oldCurr = wickEditor.project.currentObject;

        wickEditor.project.currentObject.getAllFrames().forEach(function (frame) {
            wickEditor.project.currentObject.currentLayer = wickEditor.project.currentObject.layers.indexOf(frame.parentLayer)
            wickEditor.project.currentObject.playheadPosition = frame.playheadPosition
            wickEditor.thumbnailRenderer.renderThumbnailForFrame(frame)
        });
        
        wickEditor.project.currentObject.currentLayer = oldLayer;
        wickEditor.project.currentObject = oldCurr;
        wickEditor.project.currentObject.playheadPosition = oldPlayheadPosition;
    }

    this.cleanup = function () {
        thumbRenderer.cleanup();
    }
}