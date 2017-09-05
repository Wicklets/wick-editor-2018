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

    self.setup = function () {
        self.canvasContainer = document.createElement('div');
        self.canvasContainer.style.position = 'absolute';
        self.canvasContainer.style.left = '0px';
        self.canvasContainer.style.top = '0px';
        self.renderer = new WickTwoRenderer(self.canvasContainer);
        self.renderer.setup();
    }
    
    self.syncWithEditorState = function () {
        self.renderThumbnailForFrame(wickEditor.project.getCurrentFrame());
    }

    self.renderThumbnailForFrame = function (wickFrame) {
        if(!wickFrame) return;

        self.canvasContainer.style.width = wickEditor.project.width+'px';
        self.canvasContainer.style.height = wickEditor.project.height+'px';

        //self.renderer.render(wickEditor.project, wickFrame.wickObjects);

        //var svg = self.canvasContainer.children[0];
        
        // SO SLOW >:(
        /*svgAsDataUri(svg, {}, function(uri) {
            wickFrame.thumbnail = uri;
            wickEditor.timeline.syncWithEditorState();
        });*/
        /*html2canvas(svg, {
            onrendered: function(canvas) {
                theCanvas = canvas;
                document.body.appendChild(canvas);
            }
        });*/
    }

    self.renderAllThumbsOnTimeline = function () {
        var allFrames = wickEditor.project.currentObject.getAllFrames();
        allFrames.forEach(function (frame) {
            self.renderThumbnailForFrame(frame);
        });
    }

}