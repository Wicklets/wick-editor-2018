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

var CanvasBackdrop = function (wickEditor, canvasContainer) {

    var self = this;

    var backdropDiv = document.createElement('div');
    backdropDiv.style.position = 'absolute';
    backdropDiv.style.top = '0px';
    backdropDiv.style.left = '0px';
    canvasContainer.prepend(backdropDiv);

    self.update = function () {
        self.updateViewTransforms();
    }

    self.updateViewTransforms = function () {
        var pan = wickEditor.canvas.getPan();
        var zoom = wickEditor.canvas.getZoom();

        var width = wickEditor.project.width;
        var height = wickEditor.project.height;

        var tx = (pan.x)+width*(zoom-1)/2;
        var ty = (pan.y)+height*(zoom-1)/2;
        var transform = 'translate('+tx+'px,'+ty+'px) scale('+zoom+', '+zoom+')';
        backdropDiv.style.width = width+'px';
        backdropDiv.style.height = height+'px';
        backdropDiv.style["-ms-transform"] = transform;
        backdropDiv.style["-webkit-transform"] = transform;
        backdropDiv.style["transform"] = transform;

        self.setColor(wickEditor.project.backgroundColor);
    }

    self.setColor = function (color) {
        backdropDiv.style.backgroundColor = color;
    }

}