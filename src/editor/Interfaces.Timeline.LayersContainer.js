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

TimelineInterface.LayersContainer = function (wickEditor, timeline) {
    var that = this;

    this.elem = null;

    this.layers = null;

    this.build = function () {
        this.elem = document.createElement('div');
        this.elem.className = 'layers-container';

        this.rebuild();
    }

    this.rebuild = function () {
        this.layers = [];

        this.elem.innerHTML = "";

        var wickLayers = wickEditor.project.currentObject.layers;
        wickLayers.forEach(function (wickLayer) {
            var layer = new TimelineInterface.Layer(wickEditor, timeline);

            layer.wickLayer = wickLayer;
            layer.build();
            layer.update();

            that.elem.appendChild(layer.elem);
            that.layers.push(layer);                
        });
    }

    this.update = function () {
        this.layers.forEach(function (layer) {
            layer.update();
        })
    }
}