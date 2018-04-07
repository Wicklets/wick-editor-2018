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
        this.elem.wickData = {wickLayer:this.wickLayer};

        this.elem.appendChild((function () {
            that.nameElem = document.createElement('div');
            that.nameElem.innerHTML = that.wickLayer.identifier;
            that.nameElem.className = 'layer-name';
            that.nameElem.addEventListener('mousedown', function (e) {
                if(wickEditor.project.getCurrentLayer() === that.wickLayer) {
                    renameLayerTextfield.select();
                    renameLayerTextfield.value = that.wickLayer.identifier;
                    renameLayerTextfield.style.display = 'block';
                    e.stopPropagation();
                } else {
                    wickEditor.actionHandler.doAction('movePlayhead', {
                        obj: wickEditor.project.currentObject,
                        newPlayheadPosition: wickEditor.project.currentObject.playheadPosition,
                        newLayer: that.wickLayer
                    });
                }
            });
            return that.nameElem;
        })());

        var renameLayerTextfield = document.createElement('input');
        renameLayerTextfield.className = 'layer-rename-textfield';
        renameLayerTextfield.type = 'text';
        renameLayerTextfield.addEventListener('mouseup', function (e) {
            this.select();
            e.stopPropagation();
        });
        renameLayerTextfield.addEventListener('blur', function (e) {
            that.wickLayer.identifier = renameLayerTextfield.value;
            renameLayerTextfield.style.display = 'none';
            wickEditor.project.currentObject.framesDirty = true;
            wickEditor.syncInterfaces();
        });
        this.elem.appendChild(renameLayerTextfield);

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
            wickEditor.canvas.getInteractiveCanvas().needsUpdate = true;
            wickEditor.syncInterfaces();
            e.stopPropagation();
        }
        this.elem.appendChild(lockLayerButton);

        hideLayerButton = document.createElement('div');
        hideLayerButton.className = 'layer-hide-button';
        hideLayerButton.onclick = function (e) {
            that.wickLayer.hidden = !that.wickLayer.hidden;
            wickEditor.canvas.getInteractiveCanvas().needsUpdate = true;
            wickEditor.syncInterfaces();
        }
        this.elem.appendChild(hideLayerButton);

        //hideLayerButton

        this.elem.gnurl = document.createElement('div');
        this.elem.gnurl.className = 'layer-gnurl'
        this.elem.appendChild(this.elem.gnurl)

        this.elem.gnurl.addEventListener('mousedown', function (e) {
            //if(e.layerX < 30) return;
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
            that.nameElem.style.cursor = 'text';
        } else {
            layerDiv.className = 'layer';
            that.nameElem.style.cursor = 'pointer';
        }
    }
}
