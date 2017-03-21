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

        /*thumbpreview = document.createElement('div')
        thumbpreview.className = 'thumbnailPreview';
        //document.body.appendChild(thumbpreview)
        wickEditor.project.fitScreen = false;

        thumbRenderer = new WickPixiRenderer(wickEditor.project, thumbpreview, 0.2);
        thumbRenderer.setup();*/

    }
    
    this.syncWithEditorState = function () {

        self.renderThumbnailForFrame(wickEditor.project.getCurrentFrame());

    }

    this.renderThumbnailForFrame = function (wickFrame) {

        thumbRenderer = window.wickRenderer;

        if(!thumbRenderer) return;
        if(!wickFrame) return;

        thumbRenderer.refresh(wickEditor.project.rootObject);

        var layerObjects = [];
        wickEditor.project.getCurrentObject().getAllActiveChildObjects().forEach(function (child) {
            if(child.isOnActiveLayer(wickEditor.project.getCurrentLayer())) {
                layerObjects.push(child);
            }
        });

        setTimeout(function () {
            if(wickPlayer.running) return;

            thumbRenderer.render(layerObjects);
            wickFrame.thumbnail = window.rendererCanvas.getElementsByTagName('canvas')[0].toDataURL('image/jpeg', 0.001);
            //console.log(wickFrame.thumbnail)
            wickEditor.timeline.syncWithEditorState()
        }, 100)

    }

    this.cleanup = function () {
        thumbRenderer.cleanup();
    }
}