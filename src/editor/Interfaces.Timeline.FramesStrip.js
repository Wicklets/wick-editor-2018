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

TimelineInterface.FramesStrip = function (wickEditor, timeline) {
    var that = this;

    this.elem = null;

    this.wickLayer = null;

    var framesStripCellContainer;

    this.build = function () {
        var wickLayers = wickEditor.project.getCurrentObject().layers;

        this.elem = document.createElement('div');
        this.elem.className = 'frames-strip';
        this.elem.style.top = (wickLayers.indexOf(this.wickLayer) * cssVar('--layer-height')) + 'px';
        this.elem.addEventListener('mousemove', function (e) {
            if(wickEditor.project.smallFramesMode) return;
            
            var px = Math.round((e.clientX - timeline.framesContainer.elem.getBoundingClientRect().left - cssVar('--frame-width')/2)      / cssVar('--frame-width'))
            var py = Math.round((e.clientY - timeline.framesContainer.elem.getBoundingClientRect().top  - cssVar('--layer-height')/2) / cssVar('--layer-height'))

            if(timeline.interactions.getCurrent()) return;
            if(wickEditor.project.getCurrentObject().layers[py].getFrameAtPlayheadPosition(px)) return;
            
            timeline.framesContainer.addFrameOverlay.elem.style.display = 'block';
            timeline.framesContainer.addFrameOverlay.elem.style.left = roundToNearestN(e.clientX - timeline.framesContainer.elem.getBoundingClientRect().left - cssVar('--frame-width')/2 - 9, cssVar('--frame-width')) + 10 + "px";
            timeline.framesContainer.addFrameOverlay.elem.style.top  = roundToNearestN(e.clientY - timeline.framesContainer.elem.getBoundingClientRect().top  - cssVar('--layer-height')/2, cssVar('--layer-height')) + "px";
        });
        this.elem.addEventListener('mousedown', function (e) {
            if(e.button === 2) return;
            if(wickEditor.project.smallFramesMode) return;
            /*wickEditor.actionHandler.doAction('movePlayhead', {
                obj: wickEditor.project.currentObject,
                newPlayheadPosition: Math.round((e.clientX - timeline.framesContainer.elem.getBoundingClientRect().left - cssVar('--frame-width')/2) / cssVar('--frame-width')),
            });*/
            if(timeline.framesContainer.addFrameOverlay.elem.style.display === 'none') return;
            var newFrame = new WickFrame();
            newFrame.playheadPosition = Math.round((e.clientX - timeline.framesContainer.elem.getBoundingClientRect().left - cssVar('--frame-width')/2 - 9) / cssVar('--frame-width'))
            
            var layerIndex = Math.round((e.clientY - timeline.framesContainer.elem.getBoundingClientRect().top - cssVar('--layer-height')/2) / cssVar('--layer-height'))
            var layer = wickEditor.project.currentObject.layers[layerIndex];
            
            wickEditor.actionHandler.doAction('addFrame', {frame:newFrame, layer:layer});
            timeline.framesContainer.addFrameOverlay.elem.style.display = 'none';
        });
        this.elem.addEventListener('mouseout', function (e) {
            timeline.framesContainer.addFrameOverlay.elem.style.display = 'none';
        });

        framesStripCellContainer = document.createElement('span');
        framesStripCellContainer.className = 'frames-strip-cell-container';
        for(var i = 0; i < 50; i++) {
            var framesStripCell = document.createElement('div');
            framesStripCell.className = 'frames-strip-cell';
            if(i===0){
                framesStripCell.className += " frames-strip-cell-first"
                framesStripCell.style.left = i*cssVar('--frame-width') + 'px'
            } else {
                framesStripCell.style.left = i*cssVar('--frame-width') + 5 + 'px'
            }
            
            framesStripCellContainer.appendChild(framesStripCell);
        }
        this.elem.appendChild(framesStripCellContainer)
    }

    this.update = function () {
        var shift = timeline.horizontalScrollBar.getScrollPosition();
        framesStripCellContainer.style.left = (shift-shift%cssVar('--frame-width'))+'px';
        this.elem.style.cursor = wickEditor.project.smallFramesMode ? 'deafult' : 'pointer';
    }
}