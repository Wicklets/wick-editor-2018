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
    this.hoverHighlightOverlay;

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
                //var frame = layer.getLastFrame(wickEditor.project.getCurrentObject().playheadPosition);
                var frame = layer.getFrameAtPlayheadPosition(wickEditor.project.getCurrentObject().playheadPosition)
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

        this.hoverHighlightOverlay = document.createElement('div')
        this.hoverHighlightOverlay.className = 'hover-highlight-overlay';

        this.addFrameOverlay.build();
        this.selectionBox.build();

        this.rebuild();
    }

    this.rebuild = function () {
        this.elem.innerHTML = "";
        this.frames = [];
        this.frameStrips = [];

        this.elem.appendChild(framesStripCellContainer)
        //this.elem.appendChild(this.hoverHighlightOverlay)

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
                wickEditor.rightclickmenu.openMenu(null, true);
            else
                wickEditor.rightclickmenu.closeMenu();

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
        thumbnailDiv.style.marginLeft = cssVar('--frame-width')===20 ? '4px' : '11px';
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
        if(this.wickFrame.name === 'New Frame') {
            nameDiv.innerHTML = '';
        }

        if(this.wickFrame.hasSound()) {
            thumbnailDiv.style.display = 'none';
            waveformDiv.style.display = 'block';
            if(this.wickFrame.hasSound()) {
                if(!this.wickFrame._soundDataForPreview) {
                    self.wickFrame._soundDataForPreview = {};
                    var canvas = document.createElement('canvas');
                    canvas.width = 600;
                    canvas.height = 40;
                    //self.wickFrame._soundDataForPreview.howl.play();
                } else {
                    var waveform = wickEditor.canvas.getFastCanvas().getWaveformForFrameSound(self.wickFrame)
                    if(waveform) {
                        waveformDiv.src = waveform.src;
                        var baseWidth = 200*(12.0/10.0);
                        var waveformWidth = baseWidth;
                        waveformWidth = waveformWidth/(12.0/wickEditor.project.framerate);
                        waveformWidth = waveformWidth * (waveform.length)
                        waveformDiv.style.width = waveformWidth + 'px';
                    }
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
                thumbnailDiv.src = 'resources/fullframe.svg';
            } else {
                this.elem.style.backgroundColor = '#FFF';
                thumbnailDiv.src = 'resources/emptyframe.svg';
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

TimelineInterface.Tween = function (wickEditor, timeline) {
    var self = this;

    self.wickTween = null;
    self.wickFrame = null;
    self.wickObject = null;

    this.build = function () {
        /*console.log(self.wickTween)
        console.log(self.wickFrame)*/

        self.elem = document.createElement('div');
        self.elem.className = 'tween';

        self.elem.addEventListener('mousedown', function (e) {

            if(e.button === 2)
                wickEditor.rightclickmenu.openMenu(null, true);
            else
                wickEditor.rightclickmenu.closeMenu();

            //console.log(e)
            e.stopPropagation();

            wickEditor.actionHandler.doAction('movePlayhead', {
                obj: wickEditor.project.currentObject,
                newPlayheadPosition: self.wickFrame.playheadPosition + self.wickTween.playheadPosition,
                newLayer: wickEditor.project.getCurrentLayer()
            });

            /*wickEditor.project.deselectObjectType(WickTween);
            wickEditor.project.selectObject(self.wickTween);
            wickEditor.project.selectObject(self.wickObject);*/
            wickEditor.project.clearSelection();
            wickEditor.project.selectObject(self.wickFrame);
            wickEditor.syncInterfaces();

            timeline.interactions.start("dragTweens", e, {
                tweens: [self],
                frame: self.wickFrame,
            });
        }); 
    }

    this.update = function () {
        //if(!wickEditor.project.isObjectSelected(self.wickObject)) {
            //self.elem.style.display = 'none';
            //return;
        //}

        /*if(wickEditor.project.isObjectSelected(self.wickTween)) {
            //self.elem.style.backgroundColor = 'green';
            self.elem.style.opacity = 1.0;
        } else {
            //self.elem.style.backgroundColor = 'rgba(0,0,0,0)';
            self.elem.style.opacity = 0.3;
        }*/
        self.elem.style.opacity = 1.0;

        //self.elem.style.display = 'block';

        var baseX = self.wickTween.playheadPosition*cssVar('--frame-width');
        var paddingX = cssVar('--frame-width')/2 - 10;
        //if(!timeline.interactions.getCurrent())
        self.elem.style.left = (baseX+paddingX)+"px";

        var baseY = 0;
        var paddingY = cssVar('--layer-height')/2 - 10 - 2;
        self.elem.style.top = baseY+paddingY+"px";

        //self.elem.style.width = cssVar('--frame-width')+"px";
        //self.elem.style.height = cssVar('--layer-height')+'px';
    }
}

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
            var layer = wickEditor.project.getCurrentObject().layers[py];
            if(layer && layer.getFrameAtPlayheadPosition(px)) return;
            
            timeline.framesContainer.addFrameOverlay.elem.style.display = 'block';
            timeline.framesContainer.addFrameOverlay.elem.style.left = roundToNearestN(e.clientX - timeline.framesContainer.elem.getBoundingClientRect().left - cssVar('--frame-width')/2 - 9, cssVar('--frame-width')) + "px";
            timeline.framesContainer.addFrameOverlay.elem.style.top  = roundToNearestN(e.clientY - timeline.framesContainer.elem.getBoundingClientRect().top  - cssVar('--layer-height')/2, cssVar('--layer-height')) + "px";
        });
        this.elem.addEventListener('mouseup', function (e) {
            if(e.button === 2) return;
            if(wickEditor.project.smallFramesMode) return;

            if(timeline.framesContainer.addFrameOverlay.elem.style.display === 'none') return;

            var playheadPosition = Math.round((e.clientX - timeline.framesContainer.elem.getBoundingClientRect().left - cssVar('--frame-width')/2 - 9) / cssVar('--frame-width'));

            /*if(wickEditor.library.isDraggingAsset()) { 
                var asset = wickEditor.library.getSelectedAsset(); 

                if (asset.type == 'audio') {
                    wickEditor.actionHandler.doAction("addSoundToFrame", {
                        asset: asset,
                        playheadPosition: playheadPosition
                    });
                }
                return; 
            }*/
            

            if (playheadPosition < 0) return; // You're behind position 0!

            var newFrame = new WickFrame();
            newFrame.playheadPosition = playheadPosition; 
            
            var layerIndex = Math.round((e.clientY - timeline.framesContainer.elem.getBoundingClientRect().top - cssVar('--layer-height')/2) / cssVar('--layer-height'))
            var layer = wickEditor.project.currentObject.layers[layerIndex];

            wickEditor.actionHandler.doAction('addFrame', {frame:newFrame, layer:layer});
            timeline.framesContainer.addFrameOverlay.elem.style.display = 'none';

            //e.stopPropagation();
        });
        this.elem.addEventListener('mouseout', function (e) {
            timeline.framesContainer.addFrameOverlay.elem.style.display = 'none';
        });

        framesStripCellContainer = document.createElement('span');
        framesStripCellContainer.className = 'frames-strip-cell-container';
        for(var i = 1; i < 70; i++) {
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

TimelineInterface.AddFrameOverlay = function (wickEditor, timeline) {
    this.elem = null;

    var that = this;

    this.build = function () {
        this.elem = document.createElement('div');
        this.elem.className = 'add-frame-overlay';
        this.elem.style.display = 'none';

        var addFrameOverlayImg = document.createElement('img');
        addFrameOverlayImg.className = 'add-frame-overlay-img';
        addFrameOverlayImg.src = 'resources/plus-24-512.png';
        this.elem.appendChild(addFrameOverlayImg);
    }

    this.update = function () {
        
    }
}

TimelineInterface.SelectionBox = function (wickEditor, timeline) {
    this.elem = null;

    this.build = function () {
        this.elem = document.createElement('div');
        this.elem.className = "selection-box";
        this.elem.style.display = 'none';
    }

    this.update = function () {
        
    }
}
