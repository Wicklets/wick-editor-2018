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

TimelineInterface.Layer = function (wickEditor, timeline) {
    var that = this;

    this.elem = null

    this.wickLayer = null;

    var lockLayerButton;
    var hideLayerButton;

    this.build = function () {
        var wickLayers = wickEditor.project.currentObject.layers;

        this.elem = document.createElement('div');
        this.elem.className = "layer";
        this.elem.style.top = (wickLayers.indexOf(this.wickLayer) * cssVar('--layer-height')) + 'px';
        this.elem.innerHTML = this.wickLayer.identifier;
        this.elem.wickData = {wickLayer:this.wickLayer};

        //div creation block for selection overlay
        var layerSelectionOverlayDiv = document.createElement('div');
        layerSelectionOverlayDiv.className = 'layer-selection-overlay';
        this.elem.appendChild(layerSelectionOverlayDiv);
        
        //div creation block for gnurl overlay
        /*var gnurl = document.createElement('div');
        gnurl.className = 'layer-gnurl';
        this.elem.appendChild(gnurl);*/
        
        lockLayerButton = document.createElement('div');
        lockLayerButton.className = 'layer-lock-button';
        lockLayerButton.onclick = function (e) {
            that.wickLayer.locked = !that.wickLayer.locked;
            wickEditor.syncInterfaces();
            e.stopPropagation();
        }
        this.elem.appendChild(lockLayerButton);

        hideLayerButton = document.createElement('div');
        hideLayerButton.className = 'layer-hide-button';
        hideLayerButton.onclick = function (e) {
            that.wickLayer.hidden = !that.wickLayer.hidden;
            wickEditor.syncInterfaces();
        }
        this.elem.appendChild(hideLayerButton);

        //hideLayerButton

        this.elem.addEventListener('mousedown', function (e) {
            if(e.layerX < 30) return;
            wickEditor.actionHandler.doAction('movePlayhead', {
                obj: wickEditor.project.currentObject,
                newPlayheadPosition: wickEditor.project.currentObject.playheadPosition,
                newLayer: that.wickLayer
            });
            timeline.interactions.start('dragLayer', e, {layer:that});
        });
    }

    this.update = function () {
        var layerIsSelected = wickEditor.project.getCurrentLayer() === this.wickLayer;
        var selectionOverlayDiv = this.elem.getElementsByClassName('layer-selection-overlay')[0];
        selectionOverlayDiv.style.display = layerIsSelected ? 'block' : 'none';
        
        if(this.wickLayer.hidden) {
            hideLayerButton.className = 'layer-hide-button layer-hidden';
        } else {
            hideLayerButton.className = 'layer-hide-button';
        }

        if(this.wickLayer.locked) {
            lockLayerButton.className = 'layer-lock-button layer-locked';
        } else {
            lockLayerButton.className = 'layer-lock-button';
        }

        var layerDiv = this.elem;
        if (layerIsSelected === true) {
            layerDiv.className = 'layer active-layer';
        } else {
            layerDiv.className = 'layer';
        }
    }
}