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
    this.playhead = new TimelineInterface.Playhead(wickEditor, timeline);
    this.selectionBox = new TimelineInterface.SelectionBox(wickEditor, timeline);

    var framesStrip;

    this.build = function () {
        this.elem = document.createElement('div');
        this.elem.className = 'frames-container';

        this.elem.addEventListener('mousemove', function (e) {
            timeline.framesContainer.playhead.ghostElem.style.display = 'block';
            timeline.framesContainer.playhead.setGhostPosition(e);
        });

        this.elem.addEventListener('mousedown', function (e) {
            timeline.interactions.start('dragSelectionBox', e, {});

            wickEditor.project.clearSelection();

            var layerIndex = Math.round((e.clientY - timeline.framesContainer.elem.getBoundingClientRect().top - cssVar('--layer-height')/2) / cssVar('--layer-height'))
            var layer = wickEditor.project.currentObject.layers[layerIndex];
            wickEditor.actionHandler.doAction('movePlayhead', {
                obj: wickEditor.project.currentObject,
                newPlayheadPosition: Math.round((e.clientX - 9 - timeline.framesContainer.elem.getBoundingClientRect().left - cssVar('--frame-width')/2) / cssVar('--frame-width')),
                newLayer: layer,
            });

            if(wickEditor.project.smallFramesMode) {
                var layer = wickEditor.project.getCurrentLayer();
                var frame = layer.getLastFrame(wickEditor.project.getCurrentObject().playheadPosition);
                if(frame) wickEditor.project.selectObject(frame);
                wickEditor.syncInterfaces();
            }
            timeline.framesContainer.update();
        });

        this.elem.addEventListener('mouseout', function (e) {
            timeline.framesContainer.playhead.ghostElem.style.display = 'none';
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

        this.addFrameOverlay.build();
        this.playhead.build();
        this.selectionBox.build();

        this.rebuild();
    }

    this.rebuild = function () {
        this.elem.innerHTML = "";
        this.frames = [];
        this.frameStrips = [];

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
        this.elem.appendChild(this.playhead.elem);
        this.elem.appendChild(this.playhead.ghostElem);
        this.elem.appendChild(this.selectionBox.elem);
    }

    this.update = function () {
        this.frames.forEach(function (frame) {
            frame.update();
        });
        this.playhead.update();

        framesStrip.update();

        var scrollX = -timeline.horizontalScrollBar.getScrollPosition();
        var scrollY = -timeline.verticalScrollBar.getScrollPosition();
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