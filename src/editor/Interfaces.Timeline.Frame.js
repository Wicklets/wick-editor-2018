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

TimelineInterface.Frame = function (wickEditor, timeline) {
    var self = this;

    var selectionOverlayDiv = null;
    var thumbnailDiv = null;
    var waveformDiv = null;
    var hasScriptsIconDiv = null;
    var nameDiv = null;

    this.wickFrame = null;
    this.wickLayer = null;

    var tweens = [];
    var scriptIcon = null;

    this.build = function () {
        var wickLayers = wickEditor.project.getCurrentObject().layers;

        this.elem = document.createElement('div');
        this.elem.className = "frame";
        this.elem.style.left = (self.wickFrame.playheadPosition * cssVar('--frame-width')) - 4 + 'px';
        this.elem.style.top = (wickLayers.indexOf(self.wickLayer) * cssVar('--layer-height')) + 'px';
        this.elem.style.width = (self.wickFrame.length * cssVar('--frame-width') - cssVar('--common-padding')/2) + 'px';
        this.elem.style.height = cssVar('--layer-height')-cssVar('--common-padding')+'px'
        this.elem.wickData = {wickFrame:self.wickFrame};
        this.elem.addEventListener('mouseup', function (e) {
            /*wickEditor.actionHandler.doAction('movePlayhead', {
                obj: wickEditor.project.currentObject,
                newPlayheadPosition: self.wickFrame.playheadPosition,
                newLayer: self.wickFrame.parentLayer
            });
            wickEditor.project.clearSelection()
            wickEditor.project.selectObject(self.wickFrame)
            timeline.framesContainer.update();*/
        });
        this.elem.addEventListener('mousedown', function (e) {

            if(e.button === 2)
                wickEditor.rightclickmenu.openMenu();

            if(!wickEditor.project.isObjectSelected(self.wickFrame)) {
                if(!e.shiftKey) wickEditor.project.clearSelection();
                wickEditor.project.selectObject(self.wickFrame);
                
            }
            wickEditor.actionHandler.doAction('movePlayhead', {
                obj: wickEditor.project.currentObject,
                newPlayheadPosition: self.wickFrame.playheadPosition + Math.floor((e.offsetX+2) / cssVar('--frame-width')),
                newLayer: self.wickFrame.parentLayer
            });
            

            timeline.interactions.start("dragFrame", e, {
                frames: timeline.framesContainer.getFrames(wickEditor.project.getSelectedObjects())
            });

            e.stopPropagation();
        });
        this.elem.addEventListener('dblclick', function (e) {
            //wickEditor.guiActionHandler.doAction('copyFrameForward')
        });
        this.elem.addEventListener('mouseout', function (e) {
            timeline.framesContainer.hoverHighlightOverlay.style.display = 'none';
        });
        this.elem.addEventListener('mousemove', function (e) {
            if(e.target.className !== 'frame') {
                timeline.framesContainer.hoverHighlightOverlay.style.display = 'none';
                return;
            }

            var rect = self.elem.getBoundingClientRect();
            var x = rect.left-193+12 + (e.offsetX - (e.offsetX%cssVar('--frame-width')));
            x += timeline.horizontalScrollBar.getScrollPosition()
            var y = rect.top-70+9;
            timeline.framesContainer.hoverHighlightOverlay.style.left = x+'px';
            timeline.framesContainer.hoverHighlightOverlay.style.top = y+'px';
            timeline.framesContainer.hoverHighlightOverlay.style.display = 'block';
        });

        thumbnailDiv = document.createElement('img');
        thumbnailDiv.className = "frame-thumbnail";
        this.elem.appendChild(thumbnailDiv);

        waveformDiv = document.createElement('img');
        waveformDiv.className = "frame-waveform";
        this.elem.appendChild(waveformDiv);

        nameDiv = document.createElement('div');
        nameDiv.className = "frame-name";
        this.elem.appendChild(nameDiv);

        selectionOverlayDiv = document.createElement('div');
        selectionOverlayDiv.className = "selection-overlay";
        this.elem.appendChild(selectionOverlayDiv);

        hasScriptsIconDiv = document.createElement('div');
        hasScriptsIconDiv.className = "has-scripts-icon";
        this.elem.appendChild(hasScriptsIconDiv);

        var extenderHandleRight = document.createElement('div');
        extenderHandleRight.className = "frame-extender-handle frame-extender-handle-right";
        extenderHandleRight.addEventListener('mousedown', function (e) {
            timeline.interactions.start("dragFrameWidth", e, {frame:self});
            e.stopPropagation();
        });
        this.elem.appendChild(extenderHandleRight);
        
//        var extenderHandleLeft = document.createElement('div');
//        extenderHandleLeft.className = "frame-extender-handle-left";
//        extenderHandleLeft.addEventListener('mousedown', function (e) {
//            timeline.interactions.start("dragFrameWidth", e, {frame:self});
//            e.stopPropagation();
//        });
//        self.elem.appendChild(extenderHandleLeft);

        tweens = [];
        this.wickFrame.tweens.forEach(function (wickTween) {
            var tween = new TimelineInterface.Tween(wickEditor, timeline);
            tween.wickTween = wickTween;
            tween.wickFrame = self.wickFrame;
            tween.build();
            self.elem.appendChild(tween.elem);
            tweens.push(tween)
        });
    }

    this.update = function () {
        if(wickEditor.project.smallFramesMode) {
            this.elem.style.borderRadius = '0px';
        } else {
            this.elem.style.borderRadius = '2px';
        }

        hasScriptsIconDiv.style.display = this.wickFrame.hasScript() ? 'block' : 'none';
        hasScriptsIconDiv.onclick = function () {
            wickEditor.guiActionHandler.doAction('editScripts')
        }

        nameDiv.innerHTML = this.wickFrame.name || '';

        if(this.wickFrame.audioAssetUUID) {
            thumbnailDiv.style.display = 'none';
            waveformDiv.style.display = 'block';
            if(this.wickFrame.audioAssetUUID) {
                if(!this.wickFrame._soundDataForPreview) {
                    self.wickFrame._soundDataForPreview = {};
                    var canvas = document.createElement('canvas');
                    canvas.width = 600;
                    canvas.height = 40;
                    var asset = wickEditor.project.library.getAsset(this.wickFrame.audioAssetUUID);
                    var src = asset.getData();
                    var scwf = new SCWF();
                    scwf.generate(src, {
                        onComplete: function(png, pixels) {
                            self.wickFrame._soundDataForPreview.waveform = png;
                        }
                    });
                    this.wickFrame._soundDataForPreview.howl = new Howl({
                        src: [src],
                        loop: false,
                        volume: 1.0,
                        onend:  function(id) { return;self.onSoundEnd(id); },
                        onStop: function(id) { return;self.onSoundStop(id); },
                        onPlay: function(id) { return;self.onSoundPlay(id); }
                    });
                    //self.wickFrame._soundDataForPreview.howl.play();
                } else {
                    waveformDiv.src = self.wickFrame._soundDataForPreview.waveform;
                    var baseWidth = 200*(12.0/10.0);
                    var waveformWidth = baseWidth;
                    waveformWidth = waveformWidth/(12.0/wickEditor.project.framerate);
                    waveformWidth = waveformWidth * (self.wickFrame._soundDataForPreview.howl._sprite.__default[1]/1000.0)
                    waveformDiv.style.width = waveformWidth + 'px';
                }
                this.elem.style.backgroundColor = '#FFF';
            } else {
                this.wickFrame._soundDataForPreview = null;
            }
        } else {
            //var src = this.wickFrame.thumbnail;
            waveformDiv.style.display = 'none';
            if(this.wickFrame.tweens.length > 0) {
                thumbnailDiv.style.display = 'none';
                this.elem.style.backgroundColor = '#e4eafb';
            } else if(this.wickFrame.wickObjects.length > 0) {
                this.elem.style.backgroundColor = '#EEE';
                thumbnailDiv.src = '/resources/fullframe.svg';
            } else {
                this.elem.style.backgroundColor = '#FFF';
                thumbnailDiv.src = '/resources/emptyframe.svg';
            }
            /* else if(!src || wickEditor.project.smallFramesMode) {
                thumbnailDiv.style.display = 'block';
                thumbnailDiv.src = '/resources/whitepage.png';
                this.elem.style.backgroundColor = '#FFF';
            } else if(src) {
                thumbnailDiv.style.display = 'block';
                thumbnailDiv.src = src;
                this.elem.style.backgroundColor = wickEditor.project.backgroundColor;//'#FFF';
            }*/
        }
        
        if (wickEditor.project.isObjectSelected(this.wickFrame)) {
            selectionOverlayDiv.style.display = 'block';
            selectionOverlayDiv.className = 'selection-overlay'
        } else if (this.wickFrame.scriptError) {
            selectionOverlayDiv.style.display = 'block';
            selectionOverlayDiv.className = 'selection-overlay selection-overlay-error'
        } else {
            selectionOverlayDiv.style.display = 'none';
        }

        tweens.forEach(function (tween) {
            tween.update();
        });
    }
}