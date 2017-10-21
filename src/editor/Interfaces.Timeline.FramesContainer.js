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

TimelineInterface.FramesContainer = function (wickEditor, timeline) {
    var that = this;

    this.elem = null;

    this.frames = null;
    this.frameStrips = null;

    this.addFrameOverlay = new TimelineInterface.AddFrameOverlay(wickEditor, timeline);
    this.selectionBox = new TimelineInterface.SelectionBox(wickEditor, timeline);

    var framesStrip;
    var framesStripCellContainer;

    this.build = function () {
        this.elem = document.createElement('div');
        this.elem.className = 'frames-container';

        this.elem.addEventListener('mousedown', function (e) {
            timeline.interactions.start('dragSelectionBox', e, {});

            var layerIndex = Math.round((e.clientY - timeline.framesContainer.elem.getBoundingClientRect().top - cssVar('--layer-height')/2) / cssVar('--layer-height'))
            var layer = wickEditor.project.currentObject.layers[layerIndex];
            wickEditor.actionHandler.doAction('movePlayhead', {
                obj: wickEditor.project.currentObject,
                newPlayheadPosition: Math.round((e.clientX - 9 - timeline.framesContainer.elem.getBoundingClientRect().left - cssVar('--frame-width')/2) / cssVar('--frame-width')),
                newLayer: layer,
            });

            wickEditor.project.clearSelection();
            if(e.button === 2) {
                var layer = wickEditor.project.getCurrentLayer();
                var frame = layer.getLastFrame(wickEditor.project.getCurrentObject().playheadPosition);
                if(frame) wickEditor.project.selectObject(frame);
                wickEditor.syncInterfaces();
            }
            timeline.framesContainer.update();
        });

        timeline.elem.addEventListener('mousewheel', function(e) {
            that.addFrameOverlay.elem.style.display = 'none'
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

            /*if(wickEditor.inputHandler.specialKeys["SHIFT"]) {
                var currentFrameWidth = cssVar('--frame-width');

                var newFrameWidth = currentFrameWidth + delta * 3;
                newFrameWidth = Math.min(newFrameWidth, 100);
                newFrameWidth = Math.max(newFrameWidth, 23);

                document.body.style.setProperty('--frame-width', newFrameWidth+'px');

                wickEditor.project.currentObject.framesDirty = true;
                wickEditor.syncInterfaces();
            } else {*/
                if(timeline.verticalScrollBar.elem.style.display === 'none') return;
                timeline.verticalScrollBar.scroll(-delta*10);
                that.update();
            //}
        });

        framesStripCellContainer = document.createElement('span');
        framesStripCellContainer.className = 'frames-cell-container';
        for(var i = 0; i < 70; i++) {
            var framesStripCell = document.createElement('div');
            framesStripCell.className = 'frames-cell';
            framesStripCell.style.left = i*20 + 10 + 'px'
            
            framesStripCellContainer.appendChild(framesStripCell);
        }
        this.elem.appendChild(framesStripCellContainer)

        this.addFrameOverlay.build();
        this.selectionBox.build();

        this.rebuild();
    }

    this.rebuild = function () {
        this.elem.innerHTML = "";
        this.frames = [];
        this.frameStrips = [];

        this.elem.appendChild(framesStripCellContainer)

        var wickLayers = wickEditor.project.currentObject.layers;
        wickLayers.forEach(function (wickLayer) {
            framesStrip = new TimelineInterface.FramesStrip(wickEditor, timeline);
            framesStrip.wickLayer = wickLayer;
            framesStrip.build();
            framesStrip.wickLayer = wickLayer;
            that.elem.appendChild(framesStrip.elem);
            that.frameStrips.push(framesStrip)

            wickLayer.frames.forEach(function(wickFrame) {
                var frame = new TimelineInterface.Frame(wickEditor, timeline);

                frame.wickFrame = wickFrame;
                frame.wickLayer = wickLayer;
                frame.build();

                that.frames.push(frame);
                that.elem.appendChild(frame.elem);
            });
        });

        this.elem.appendChild(this.addFrameOverlay.elem);
        this.elem.appendChild(this.selectionBox.elem);
    }

    this.update = function () {
        this.frames.forEach(function (frame) {
            frame.update();
        });

        this.frameStrips.forEach(function (frameStrip) {
            frameStrip.update();
        });

        var shift = timeline.horizontalScrollBar.getScrollPosition();
        framesStripCellContainer.style.left = (shift-shift%cssVar('--frame-width'))+'px';

        var scrollX = -timeline.horizontalScrollBar.getScrollPosition();
        var scrollY = -timeline.verticalScrollBar.getScrollPosition();
        if(wickEditor.project.getCurrentObject().layers.length < 4) {
            scrollY = 0;
            timeline.verticalScrollBar.reset();
        }
        $('.frames-container').css('left', scrollX+cssVar('--layers-width')      +'px');
        $('.frames-container').css('top',  scrollY+cssVar('--number-line-height')+'px');
        $('.layers-container').css('top',  scrollY+cssVar('--number-line-height')+'px');
    }

    this.getFrames = function (wickFrames) {
        var frames = [];
        wickFrames.forEach(function (wickFrame) {
            that.frames.forEach(function (frame) {
                if(frame.wickFrame === wickFrame) {
                    frames.push(frame);
                }
            })
        });
        return frames;
    }
}