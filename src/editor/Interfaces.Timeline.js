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
    
var TimelineInterface = function (wickEditor) {

    var self = this;

// Internal stuff

    var lastObject;

    var timeline;

    var cssVars;
    var cssVar;

/***********************************************************
    Interface API
***********************************************************/

    self.setup = function () {

        // Load style vars from CSS

        cssVars = window.getComputedStyle(document.body);
        cssVar = function (varName) {
            return parseInt(cssVars.getPropertyValue(varName));
        }

        // Build timeline in DOM

        timeline = new Timeline();
        timeline.build();

        // Setup mouse events for interactions

        currentInteraction = null;
        window.addEventListener('mousemove', function (e) {
            updateInteraction(e);
        });
        window.addEventListener('mouseup', function (e) {
            finishInteraction(e);
        });
    }

    self.syncWithEditorState = function () {

        if (lastObject !== wickEditor.project.currentObject || wickEditor.project.currentObject.framesDirty) {
            wickEditor.project.currentObject.framesDirty = false;
            lastObject = wickEditor.project.currentObject;

            timeline.rebuild();
        }

        timeline.update();

    }

/***********************************************************
    Div building objects
***********************************************************/

    var Timeline = function () {
        this.elem = null;

        this.layersContainer = new LayersContainer();
        this.framesContainer = new FramesContainer();
        this.horizontalScrollBar = new HorizontalScrollBar();
        this.verticalScrollBar = new VerticalScrollBar();
        this.numberLine = new NumberLine();

        this.build = function () {
            this.elem = document.createElement('div');
            this.elem.className = 'timeline';
            document.getElementById('timelineGUI').appendChild(this.elem);

            this.framesContainer.build();
            this.elem.appendChild(this.framesContainer.elem);

            this.layersContainer.build();
            this.elem.appendChild(this.layersContainer.elem);

            this.numberLine.build();
            this.elem.appendChild(this.numberLine.elem);

            var hideNumberlinePiece = document.createElement('div');
            hideNumberlinePiece.className = 'hide-number-line-piece';
            this.elem.appendChild(hideNumberlinePiece);
            
            var hideLayersPiece = document.createElement('div');
            hideLayersPiece.className = 'layer-toolbar';
            this.elem.appendChild(hideLayersPiece);

            var addLayerButton = document.createElement('div');
            addLayerButton.className = 'layer-tools-button add-layer-button';
            addLayerButton.addEventListener('mousedown', function (e) {
                wickEditor.guiActionHandler.doAction('addLayer');
            });
            hideLayersPiece.appendChild(addLayerButton);

            var deleteLayerButton = document.createElement('div');
            deleteLayerButton.className = 'layer-tools-button delete-layer-button';
            deleteLayerButton.addEventListener('mousedown', function (e) {
                wickEditor.guiActionHandler.doAction('removeLayer');
            });
            hideLayersPiece.appendChild(deleteLayerButton);

            this.horizontalScrollBar.build();
            this.elem.appendChild(this.horizontalScrollBar.elem);

            var hideScrollbarConnectPiece  = document.createElement('div'); 
            hideScrollbarConnectPiece.className = 'hide-scrollbar-connect-piece';
            this.elem.appendChild(hideScrollbarConnectPiece); 

            this.verticalScrollBar.build();
            this.elem.appendChild(this.verticalScrollBar.elem);
        }
        
        this.rebuild = function () {
            this.layersContainer.rebuild();
            this.framesContainer.rebuild();
            this.numberLine.rebuild();
        }

        this.update = function () {
            this.layersContainer.update();
            this.framesContainer.update();
            this.elem.style.height = this.calculateHeight() + "px";

            this.numberLine.update();

            this.horizontalScrollBar.update();
            this.verticalScrollBar.update();
        }

        this.calculateHeight = function () {
            var maxTimelineHeight = cssVar("--max-timeline-height");
            var expectedTimelineHeight = this.layersContainer.layers.length * cssVar("--layer-height") + 58; 
            return Math.min(expectedTimelineHeight, maxTimelineHeight); 
        }
    }

    var LayersContainer = function () {
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
                var layer = new Layer();

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

    var Layer = function () {
        var that = this;

        this.elem = null

        this.wickLayer = null;

        this.build = function () {
            var wickLayers = wickEditor.project.currentObject.layers;

            this.elem = document.createElement('div');
            this.elem.className = "layer";
            this.elem.style.top = (wickLayers.indexOf(this.wickLayer) * cssVar('--layer-height')) + 'px';
            this.elem.innerHTML = this.wickLayer.identifier;
            this.elem.wickData = {wickLayer:this.wickLayer};

            var layerSelectionOverlayDiv = document.createElement('div');
            layerSelectionOverlayDiv.className = 'layer-selection-overlay';
            this.elem.appendChild(layerSelectionOverlayDiv);

            this.elem.addEventListener('mousedown', function (e) {
                wickEditor.actionHandler.doAction('movePlayhead', {
                    obj: wickEditor.project.currentObject,
                    newPlayheadPosition: wickEditor.project.currentObject.playheadPosition,
                    newLayer: that.wickLayer
                });
                startInteraction('dragLayer', e, {layer:that});
            });
        }

        this.update = function () {
            var layerIsSelected = wickEditor.project.getCurrentLayer() === this.wickLayer;
            var selectionOverlayDiv = this.elem.getElementsByClassName('layer-selection-overlay')[0];
            selectionOverlayDiv.style.display = layerIsSelected ? 'block' : 'none';
            
            var layerDiv = this.elem;
            if (layerIsSelected === true) {
                layerDiv.className = 'layer active-layer';
            } else {
                layerDiv.className = 'layer';
            }
        }
    }

    var FramesContainer = function () {
        var that = this;

        this.elem = null;

        this.frames = null;
        this.frameStrips = null;

        this.addFrameOverlay = new AddFrameOverlay();
        this.playhead = new Playhead();
        this.selectionBox = new SelectionBox();

        this.build = function () {
            this.elem = document.createElement('div');
            this.elem.className = 'frames-container';
            this.elem.addEventListener('mousedown', function (e) {
                startInteraction('dragSelectionBox', e, {});
            });

            this.elem.addEventListener('mousedown', function (e) {
                wickEditor.project.clearSelection();
                timeline.framesContainer.update();
            });

            timeline.elem.addEventListener('mousewheel', function(e) {
                that.addFrameOverlay.elem.style.display = 'none'
                var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

                if(wickEditor.inputHandler.specialKeys["Modifier"]) {
                    var currentFrameWidth = cssVar('--frame-width');

                    var newFrameWidth = currentFrameWidth + delta * 3;
                    newFrameWidth = Math.min(newFrameWidth, 100)
                    newFrameWidth = Math.max(newFrameWidth, 30)

                    document.body.style.setProperty('--frame-width', newFrameWidth+'px');

                    wickEditor.project.currentObject.framesDirty = true;
                    wickEditor.syncInterfaces();
                } else if (wickEditor.inputHandler.specialKeys["SHIFT"]) {
                    timeline.horizontalScrollBar.scroll(delta*15);
                    that.update();
                } else {
                    timeline.verticalScrollBar.scroll(-delta*10);
                    that.update();
                }
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
                var framesStrip = new FramesStrip();
                framesStrip.wickLayer = wickLayer;
                framesStrip.build();
                framesStrip.wickLayer = wickLayer;
                that.elem.appendChild(framesStrip.elem);
                that.frameStrips.push(framesStrip)

                wickLayer.frames.forEach(function(wickFrame) {
                    var frame = new Frame();

                    frame.wickFrame = wickFrame;
                    frame.wickLayer = wickLayer;
                    frame.build();

                    that.frames.push(frame);
                    that.elem.appendChild(frame.elem);
                });
            });

            this.elem.appendChild(this.addFrameOverlay.elem);
            this.elem.appendChild(this.playhead.elem);
            this.elem.appendChild(this.selectionBox.elem);
        }

        this.update = function () {
            this.frames.forEach(function (frame) {
                frame.update();
            });
            this.playhead.update();

            $('.frames-container').css('left', timeline.horizontalScrollBar.scrollAmount+cssVar('--layers-width')+'px');
            $('.frames-container').css('top', timeline.verticalScrollBar.scrollAmount+'px');
            $('.layers-container').css('top', timeline.verticalScrollBar.scrollAmount+'px');
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

    var Frame = function () {
        var that = this;

        var selectionOverlayDiv = null;
        var thumbnailDiv = null;

        this.wickFrame = null;
        this.wickLayer = null;

        this.build = function () {
            var wickLayers = wickEditor.project.getCurrentObject().layers;

            this.elem = document.createElement('div');
            this.elem.className = "frame";
            this.elem.style.left = (that.wickFrame.playheadPosition * cssVar('--frame-width')) - 4 + 'px';
            this.elem.style.top = (wickLayers.indexOf(that.wickLayer) * cssVar('--layer-height')) + 'px';
            this.elem.style.width = (that.wickFrame.length * cssVar('--frame-width') - cssVar('--common-padding')/2) + 'px';
            this.elem.style.height = cssVar('--layer-height')-cssVar('--common-padding')+'px'
            this.elem.wickData = {wickFrame:that.wickFrame};
            this.elem.addEventListener('mouseup', function (e) {
                /*wickEditor.actionHandler.doAction('movePlayhead', {
                    obj: wickEditor.project.currentObject,
                    newPlayheadPosition: that.wickFrame.playheadPosition,
                    newLayer: that.wickFrame.parentLayer
                });
                wickEditor.project.clearSelection()
                wickEditor.project.selectObject(that.wickFrame)
                timeline.framesContainer.update();*/
            });
            this.elem.addEventListener('mousedown', function (e) {
                if(!wickEditor.project.isObjectSelected(that.wickFrame)) {
                    wickEditor.actionHandler.doAction('movePlayhead', {
                        obj: wickEditor.project.currentObject,
                        newPlayheadPosition: that.wickFrame.playheadPosition,
                        newLayer: that.wickFrame.parentLayer
                    });
                    wickEditor.project.clearSelection()
                    wickEditor.project.selectObject(that.wickFrame)
                    //timeline.framesContainer.update();
                    wickEditor.syncInterfaces()
                }

                startInteraction("dragFrame", e, {frames:timeline.framesContainer.getFrames(wickEditor.project.getSelectedObjects())});
                
                if(e.button === 2) {
                    wickEditor.rightclickmenu.openMenu();
                } else {
                    wickEditor.rightclickmenu.closeMenu();
                }

                e.stopPropagation();
            });

            thumbnailDiv = document.createElement('img');
            thumbnailDiv.className = "frame-thumbnail";
            this.elem.appendChild(thumbnailDiv);

            selectionOverlayDiv = document.createElement('div');
            selectionOverlayDiv.className = "selection-overlay";
            this.elem.appendChild(selectionOverlayDiv);

            var extenderHandleRight = document.createElement('div');
            extenderHandleRight.className = "frame-extender-handle frame-extender-handle-right";
            extenderHandleRight.addEventListener('mousedown', function (e) {
                startInteraction("dragFrameWidth", e, {frame:that});
                e.stopPropagation();
            });
            this.elem.appendChild(extenderHandleRight);
            
            /*var extenderHandleLeft = document.createElement('div');
            extenderHandleLeft.className = "frame-extender-handle frame-extender-handle-left";
            extenderHandleLeft.addEventListener('mousedown', function (e) {
                startInteraction("dragFrameWidth", e, {frame:that});
                e.stopPropagation();
            });
            that.elem.appendChild(extenderHandleLeft);*/
        }

        this.update = function () {
            var src = this.wickFrame.thumbnail;
            if(src) {
                thumbnailDiv.src = src;
            } else {
                thumbnailDiv.src = 'https://www.yireo.com/images/stories/joomla/whitepage.png';
            }

            if (wickEditor.project.isObjectSelected(this.wickFrame)) {
                selectionOverlayDiv.style.display = 'block';
            } else {
                selectionOverlayDiv.style.display = 'none';
            }
        }
    }

    var FramesStrip = function () {
        var that = this;

        this.elem = null;

        this.wickLayer = null;

        this.build = function () {
            var wickLayers = wickEditor.project.getCurrentObject().layers;

            this.elem = document.createElement('div');
            this.elem.className = 'frames-strip';
            this.elem.style.top = (wickLayers.indexOf(this.wickLayer) * cssVar('--layer-height')) + 'px';
            this.elem.addEventListener('mousemove', function (e) {
                var px = Math.round((e.clientX - timeline.framesContainer.elem.getBoundingClientRect().left - cssVar('--frame-width')/2)      / cssVar('--frame-width'))
                var py = Math.round((e.clientY - timeline.framesContainer.elem.getBoundingClientRect().top  - cssVar('--layer-height')/2) / cssVar('--layer-height'))

                if(currentInteraction) return;
                if(wickEditor.project.getCurrentObject().layers[py].getFrameAtPlayheadPosition(px)) return;
                
                timeline.framesContainer.addFrameOverlay.elem.style.display = 'block';
                timeline.framesContainer.addFrameOverlay.elem.style.left = roundToNearestN(e.clientX - timeline.framesContainer.elem.getBoundingClientRect().left - cssVar('--frame-width')/2 - 9, cssVar('--frame-width')) + 10 + "px";
                timeline.framesContainer.addFrameOverlay.elem.style.top  = roundToNearestN(e.clientY - timeline.framesContainer.elem.getBoundingClientRect().top  - cssVar('--layer-height')/2, cssVar('--layer-height')) + "px";
            });
            this.elem.addEventListener('mouseup', function (e) {
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
            for(var i = 0; i < 100; i++) {
                var framesStripCell = document.createElement('div');
                framesStripCell.className = 'frames-strip-cell';
                if(i===0){
                    framesStripCell.className += " frames-strip-cell-first"
                    framesStripCell.style.left = i*cssVar('--frame-width') + 'px'
                } else {
                    framesStripCell.style.left = i*cssVar('--frame-width') + 5 + 'px'
                }
                
                this.elem.appendChild(framesStripCell);
            }
        }

        this.update = function () {

        }
    }

    var Playhead = function () {
        this.elem = null;

        this.x = null;

        this.build = function () {
            this.elem = document.createElement('div');
            this.elem.className = 'playhead';
        }

        this.update = function () {
            this.x = wickEditor.project.currentObject.playheadPosition * cssVar('--frame-width') + cssVar('--frame-width')/2 - cssVar('--playhead-width')/2 + 9;
            this.elem.style.left = this.x + 'px';
        }
    }

    var AddFrameOverlay = function () {
        this.elem = null;

        var that = this;

        this.build = function () {
            this.elem = document.createElement('div');
            this.elem.className = 'add-frame-overlay';
            this.elem.style.display = 'none';

            var addFrameOverlayImg = document.createElement('img');
            addFrameOverlayImg.className = 'add-frame-overlay-img';
            addFrameOverlayImg.src = 'http://iconshow.me/media/images/Mixed/Free-Flat-UI-Icons/png/512/plus-24-512.png';
            this.elem.appendChild(addFrameOverlayImg);
        }

        this.update = function () {
            
        }
    }

    var SelectionBox = function () {
        this.elem = null;

        this.build = function () {
            this.elem = document.createElement('div');
            this.elem.className = "selection-box";
            this.elem.style.display = 'none';
        }

        this.update = function () {
            
        }
    }

    var HorizontalScrollBar = function () {
        var that = this;

        this.elem = null;

        var leftButton;
        var rightButton;
        var head;

        this.scrollAmount;

        this.build = function () {
            this.elem = document.createElement('div');
            this.elem.className = 'scrollbar horizontal-scrollbar';

            that.scrollAmount = 0;

            head = document.createElement('div');
            head.className = 'scrollbar-head scrollbar-head-horizontal';
            head.addEventListener('mousedown', function (e) {
                startInteraction('dragHorizontalScrollbarHead')
            })
            this.elem.appendChild(head);

            leftButton = document.createElement('div');
            leftButton.className = 'scrollbar-button scrollbar-button-left';
            leftButton.addEventListener('mousedown', function (e) {
                that.scroll(20);
            });
            this.elem.appendChild(leftButton);

            rightButton = document.createElement('div');
            rightButton.className = 'scrollbar-button scrollbar-button-right';
            rightButton.addEventListener('mousedown', function (e) {
                that.scroll(-20);
            });
            this.elem.appendChild(rightButton);
        }

        this.update = function () {
            head.style.marginLeft = -that.scrollAmount + cssVar('--scrollbar-thickness') + 'px';
        }

        this.scroll = function (scrollAmt) {
            that.scrollAmount = Math.min(that.scrollAmount + scrollAmt, 0);
            timeline.framesContainer.update();
            timeline.numberLine.update();
            that.update();
        }
    }

    var VerticalScrollBar = function () {
        var that = this;

        this.elem = null;

        var topButton;
        var bottomButton
        var head;

        that.scrollAmount;

        this.build = function () {
            this.elem = document.createElement('div');
            this.elem.className = 'scrollbar vertical-scrollbar';

            that.scrollAmount = cssVar('--number-line-height');

            head = document.createElement('div');
            head.className = 'scrollbar-head scrollbar-head-vertical';
            head.addEventListener('mousedown', function (e) {
                startInteraction('dragVerticalScrollbarHead');
            })
            this.elem.appendChild(head);

            topButton = document.createElement('div');
            topButton.className = 'scrollbar-button scrollbar-button-top';
            topButton.addEventListener('mousedown', function (e) {
                that.scroll(20)
            });
            this.elem.appendChild(topButton);

            bottomButton = document.createElement('div');
            bottomButton.className = 'scrollbar-button scrollbar-button-bottom';
            bottomButton.addEventListener('mousedown', function (e) {
                that.scroll(-20)
            });
            this.elem.appendChild(bottomButton);
        }

        this.update = function () {
            var nLayers = wickEditor.project.getCurrentObject().layers.length;

            this.elem.style.display = nLayers > 3 ? 'block' : 'none';

            head.style.height = parseInt(timeline.elem.style.height)/4 + 'px';
            head.style.marginTop = -that.scrollAmount + cssVar('--scrollbar-thickness') + cssVar('--number-line-height') + 'px';
        }

        this.scroll = function (scrollAmt) {
            if(wickEditor.project.getCurrentObject().layers.length < 4) return;

            that.scrollAmount = Math.min(that.scrollAmount + scrollAmt, cssVar('--number-line-height'));
            timeline.framesContainer.update();
            that.update();
        }
    }

    var NumberLine = function () {
        var that = this;

        this.elem = null;

        this.playRanges = null;

        this.build = function () {
            this.elem = document.createElement('div');
            this.elem.className = 'number-line';

            this.elem.addEventListener('mousedown', function (e) {
                var start = Math.round((e.clientX - timeline.framesContainer.elem.getBoundingClientRect().left - cssVar('--frame-width')/2) / cssVar('--frame-width'));
                
                var playRange = new WickPlayRange(start, start+1, "");
                wickEditor.actionHandler.doAction('addPlayRange', {playRange: playRange});
                e.stopPropagation();
            });

            this.playRanges = [];
        }

        this.update = function () {
            this.elem.style.left = timeline.horizontalScrollBar.scrollAmount+cssVar('--layers-width')+'px';

            this.playRanges.forEach(function (playRange) {
                playRange.update();
            });
        }

        this.rebuild = function () {

            this.elem.innerHTML = ''

            for(var i = 0; i < 100; i++) {
                var numberLineCell = document.createElement('div');
                numberLineCell.className = 'number-line-cell';
                numberLineCell.style.left = i*cssVar('--frame-width') +cssVar('--frames-cell-first-padding') + 'px'
                numberLineCell.innerHTML = "|"+(i+1);
                
                this.elem.appendChild(numberLineCell);
            }

            /*this.playRanges.forEach(function (playrange) {
                that.elem.removeChild(playrange.elem);
            });*/

            this.playRanges = [];

            wickEditor.project.getCurrentObject().playRanges.forEach(function (wickPlayrange) {
                var newPlayrange = new PlayRange();
                newPlayrange.wickPlayrange = wickPlayrange;
                newPlayrange.build();
                that.elem.appendChild(newPlayrange.elem);
                that.playRanges.push(newPlayrange)
            });
        }
    }

    var PlayRange = function () {
        var that = this;

        this.elem = null;
        this.handleRight = null;
        this.handleLeft = null;

        this.wickPlayrange = null;

        this.build = function () {
            this.elem = document.createElement('div');
            this.elem.className = 'playrange';
            this.elem.addEventListener('mousedown', function (e) {
                wickEditor.project.clearSelection()
                wickEditor.project.selectObject(that.wickPlayrange);

                startInteraction("dragPlayRange", e, {playrange:that});

                e.stopPropagation();
            });

            var label = document.createElement('div');
            label.className = 'playrange-label'
            label.innerHTML = this.wickPlayrange.identifier;
            this.elem.appendChild(label);

            var width = this.wickPlayrange.getLength()*cssVar('--frame-width');
            var widthOffset = -2;
            this.elem.style.width = width + widthOffset+'px'

            var left = this.wickPlayrange.getStart()*cssVar('--frame-width');
            var leftOffset = cssVar('--frames-cell-first-padding')*2+1;
            this.elem.style.left  = left + leftOffset + 'px';

            this.handleRight = document.createElement('div');
            this.handleRight.className = 'playrange-handle playrange-handle-right';
            this.handleRight.addEventListener('mousedown', function (e) {
                startInteraction("dragPlayRangeEnd", e, {playrange:that});
                e.stopPropagation()
            });
            this.elem.appendChild(this.handleRight)

            this.handleLeft = document.createElement('div');
            this.handleLeft.className = 'playrange-handle playrange-handle-left';
            this.handleLeft.addEventListener('mousedown', function (e) {
                startInteraction("dragPlayRangeStart", e, {playrange:that});
                e.stopPropagation()
            });
            this.elem.appendChild(this.handleLeft);
        }

        this.update = function () {
            this.elem.style.backgroundColor = this.wickPlayrange.color;

            if(wickEditor.project.isObjectSelected(this.wickPlayrange)) {
                this.elem.className = 'playrange playrange-selected'
            } else {
                this.elem.className = 'playrange'
            }
        }

        this.rebuild = function () {
            
        }
    }

/***********************************************************
    Interactions
***********************************************************/

    var currentInteraction;
    var interactionData;

    var interactions = {};
    interactions['dragFrame'] = {
        'start' : (function (e) {
            
        }), 
        'update' : (function (e) {
            if(e.movementX !== 0 || e.movementY !== 0) interactionData.moved = true;

            interactionData.frames.forEach(function (frame) {
                var frameX = parseInt(frame.elem.style.left);
                var frameY = parseInt(frame.elem.style.top);
                frame.elem.style.left = frameX + e.movementX + 'px';
                frame.elem.style.top = frameY + e.movementY + 'px';
                frame.elem.style.zIndex = 10;
            });
        }),
        'finish' : (function (e) {
            if(!interactionData.moved) return;

            //var frame = interactionData.frames[0];

            /*interactionData.frames.forEach(function (frame) {
                //if(!frame) return;
                var newPlayheadPosition = Math.round(parseInt(frame.elem.style.left) / cssVar('--frame-width'));
                var newLayerIndex       = Math.round(parseInt(frame.elem.style.top)  / cssVar('--layer-height'));
                var newLayer = wickEditor.project.getCurrentObject().layers[newLayerIndex];
                if(!newLayer) newLayer = wickEditor.project.getCurrentLayer();

                wickEditor.actionHandler.doAction('moveFrame', {
                    frame: frame.wickFrame, 
                    newPlayheadPosition: newPlayheadPosition,
                    newLayer: newLayer
                });
            });*/

            var framesMoveActionData = [];
            interactionData.frames.forEach(function (frame) {
                if(!frame) return;
                var newPlayheadPosition = Math.round(parseInt(frame.elem.style.left) / cssVar('--frame-width'));
                var newLayerIndex       = Math.round(parseInt(frame.elem.style.top)  / cssVar('--layer-height'));
                var newLayer = wickEditor.project.getCurrentObject().layers[newLayerIndex];
                if(!newLayer) newLayer = wickEditor.project.getCurrentLayer();

                framesMoveActionData.push({
                    frame: frame.wickFrame, 
                    newPlayheadPosition: newPlayheadPosition,
                    newLayer: newLayer
                });
            });

            wickEditor.actionHandler.doAction('moveFrames', {framesMoveActionData: framesMoveActionData});

        })
    }
    interactions['dragFrameWidth'] = {
        'start' : (function (e) {
            
        }), 
        'update' : (function (e) {
            var wickFrame = interactionData.frame.wickFrame;
            var frameDivLeft = interactionData.frame.elem.getBoundingClientRect().left;
            var mouseLeft = e.x;

            var newWidth = mouseLeft - frameDivLeft;
            //newWidth = roundToNearestN(newWidth, cssVar('--frame-width'));
            interactionData.frame.elem.style.width = + newWidth + 'px';
        }),
        'finish' : (function (e) {
            var newFrameDivLen = parseInt(interactionData.frame.elem.style.width);
            var newLength = Math.round(newFrameDivLen / cssVar('--frame-width'));

            wickEditor.actionHandler.doAction('changeFrameLength', {
                frame: interactionData.frame.wickFrame, 
                newFrameLength: newLength
            });
        })
    }
    interactions['dragPlayRange'] = {
        'start' : (function (e) {
            interactionData.origWidth = parseInt(interactionData.playrange.elem.style.width);
            interactionData.origLeft = parseInt(interactionData.playrange.elem.style.left);
            interactionData.mouseMovement = 0;
        }), 
        'update' : (function (e) {
            var wickPlayrange = interactionData.playrange.wickPlayrange;

            interactionData.mouseMovement += e.movementX;
            var newLeft = interactionData.origLeft + interactionData.mouseMovement;

            interactionData.playrange.elem.style.left = newLeft + 'px';
        }),
        'finish' : (function (e) {
            var newDivLeft = parseInt(interactionData.playrange.elem.style.left);
            var newLeft = Math.round(newDivLeft / cssVar('--frame-width'));
            var newStart = newLeft;

            var newDivLen = parseInt(interactionData.playrange.elem.style.width);
            var newLength = Math.round(newDivLen / cssVar('--frame-width'));
            var newEnd = newLength + newStart;

            wickEditor.actionHandler.doAction('modifyPlayRange', {
                playRange: interactionData.playrange.wickPlayrange,
                end: newEnd,
                start: newStart
            });
        })
    }
    interactions['dragPlayRangeStart'] = {
        'start' : (function (e) {
            interactionData.origWidth = parseInt(interactionData.playrange.elem.style.width);
            interactionData.origLeft = parseInt(interactionData.playrange.elem.style.left);
        }), 
        'update' : (function (e) {
            var wickPlayrange = interactionData.playrange.wickPlayrange;

            var mouseLeft = e.x;
            var newLeft = mouseLeft - timeline.numberLine.elem.getBoundingClientRect().left;
            var diffWidth = interactionData.origLeft - newLeft;

            interactionData.playrange.elem.style.left = newLeft + 'px';
            interactionData.playrange.elem.style.width = interactionData.origWidth + diffWidth + 'px';
        }),
        'finish' : (function (e) {
            var newDivLeft = parseInt(interactionData.playrange.elem.style.left);
            var newLeft = Math.round(newDivLeft / cssVar('--frame-width'));
            var newStart = newLeft;

            wickEditor.actionHandler.doAction('modifyPlayRange', {
                playRange: interactionData.playrange.wickPlayrange,
                start: newStart
            });
        })
    }
    interactions['dragPlayRangeEnd'] = {
        'start' : (function (e) {
            
        }), 
        'update' : (function (e) {
            var wickPlayrange = interactionData.playrange.wickPlayrange;

            var origLeft = interactionData.playrange.elem.getBoundingClientRect().left;
            var mouseLeft = e.x;

            var newWidth = mouseLeft - origLeft;
            interactionData.playrange.elem.style.width = newWidth + 'px';
        }),
        'finish' : (function (e) {
            var newDivLen = parseInt(interactionData.playrange.elem.style.width);
            var newLength = Math.round(newDivLen / cssVar('--frame-width'));
            var newEnd = newLength + interactionData.playrange.wickPlayrange.getStart();

            wickEditor.actionHandler.doAction('modifyPlayRange', {
                playRange: interactionData.playrange.wickPlayrange,
                end: newEnd
            });
        })
    }
    interactions['dragHorizontalScrollbarHead'] = {
        'start' : (function (e) {
            
        }), 
        'update' : (function (e) {
            timeline.horizontalScrollBar.scroll(-e.movementX)
            timeline.horizontalScrollBar.update();
        }),
        'finish' : (function (e) {
            
        })
    }
    interactions['dragVerticalScrollbarHead'] = {
        'start' : (function (e) {
            
        }), 
        'update' : (function (e) {
            timeline.verticalScrollBar.scroll(-e.movementY)
            timeline.verticalScrollBar.update();
        }),
        'finish' : (function (e) {
            
        })
    }
    interactions['dragSelectionBox'] = {
        'start' : (function (e) {
            var mx = e.x-timeline.framesContainer.elem.getBoundingClientRect().left;
            var my = e.y-timeline.framesContainer.elem.getBoundingClientRect().top;
            interactionData.selectionBoxOrigX = mx;
            interactionData.selectionBoxOrigY = my;
            timeline.framesContainer.selectionBox.elem.style.left = '0px';
            timeline.framesContainer.selectionBox.elem.style.top = '0px';
            timeline.framesContainer.selectionBox.elem.style.width = '0px';
            timeline.framesContainer.selectionBox.elem.style.height = '0px';
        }), 
        'update' : (function (e) {
            var mx = e.x-timeline.framesContainer.elem.getBoundingClientRect().left;
            var my = e.y-timeline.framesContainer.elem.getBoundingClientRect().top;

            var ox = interactionData.selectionBoxOrigX;
            var oy = interactionData.selectionBoxOrigY;

            if(mx-ox > 0) {
                timeline.framesContainer.selectionBox.elem.style.left = ox+'px'
                timeline.framesContainer.selectionBox.elem.style.width = mx-ox+'px';
            } else {
                timeline.framesContainer.selectionBox.elem.style.left = mx+'px';
                timeline.framesContainer.selectionBox.elem.style.width = ox-mx+'px'
            }
            if(my-oy > 0) {
                timeline.framesContainer.selectionBox.elem.style.top = oy+'px'
                timeline.framesContainer.selectionBox.elem.style.height = my-oy+'px';
            } else {
                timeline.framesContainer.selectionBox.elem.style.top = my+'px';
                timeline.framesContainer.selectionBox.elem.style.height = oy-my+'px'
            }

            timeline.framesContainer.selectionBox.elem.style.display = 'block';
        }),
        'finish' : (function (e) {
            timeline.framesContainer.selectionBox.elem.style.display = 'none';

            if(parseInt(timeline.framesContainer.selectionBox.elem.style.width)  === 0 
            && parseInt(timeline.framesContainer.selectionBox.elem.style.height) === 0) return;

            http://stackoverflow.com/questions/2752349/fast-rectangle-to-rectangle-intersection
            function intersectRect(r1, r2) {
              return !(r2.left > r1.right || 
                       r2.right < r1.left || 
                       r2.top > r1.bottom ||
                       r2.bottom < r1.top);
            }

            var frameDivs = document.getElementsByClassName('frame')
            wickEditor.project.clearSelection();
            for(var i = 0; i < frameDivs.length; i ++) {
                var frameDiv = frameDivs[i]

                var frameRect = {
                    left:   parseInt(frameDiv.style.left),
                    top:    parseInt(frameDiv.style.top),
                    right:  parseInt(frameDiv.style.width)  + parseInt(frameDiv.style.left),
                    bottom: parseInt(frameDiv.style.height) + parseInt(frameDiv.style.top)
                }

                var selectionBoxRect = {
                    left:   parseInt(timeline.framesContainer.selectionBox.elem.style.left),
                    top:    parseInt(timeline.framesContainer.selectionBox.elem.style.top),
                    right:  parseInt(timeline.framesContainer.selectionBox.elem.style.width)  + parseInt(timeline.framesContainer.selectionBox.elem.style.left),
                    bottom: parseInt(timeline.framesContainer.selectionBox.elem.style.height) + parseInt(timeline.framesContainer.selectionBox.elem.style.top)
                }

                if(intersectRect(frameRect, selectionBoxRect)) {
                    wickEditor.project.selectObject(frameDiv.wickData.wickFrame);
                } 
            }
            timeline.framesContainer.update();
            timeline.framesContainer.selectionBox.elem.style.width = '0px'
            timeline.framesContainer.selectionBox.elem.style.height = '0px'
        })
    }
    interactions['dragLayer'] = {
        'start' : (function (e) {
            interactionData.allLayerDivs = [];
            interactionData.allLayerDivs.push(interactionData.layer.elem);

            var currentLayer = wickEditor.project.getCurrentLayer();
            timeline.framesContainer.frames.forEach(function (frame) {
                if (frame.wickFrame.parentLayer === currentLayer) {
                    interactionData.allLayerDivs.push(frame.elem)
                }
            });
            timeline.framesContainer.frameStrips.forEach(function (frameStrip) {
                if (frameStrip.wickLayer === currentLayer) {
                    interactionData.allLayerDivs.push(frameStrip.elem)
                }
            });

        }), 
        'update' : (function (e) {
            interactionData.allLayerDivs.forEach(function (div) {
                div.style.top = e.y - timeline.framesContainer.elem.getBoundingClientRect().top - cssVar('--layer-height')/2 + 'px';
            });
        }),
        'finish' : (function (e) {
            var newIndex = Math.round(parseInt(interactionData.allLayerDivs[0].style.top) / cssVar('--layer-height'));
            newIndex = Math.max(newIndex, 0);
            newIndex = Math.min(newIndex, wickEditor.project.currentObject.layers.length-1);

            wickEditor.actionHandler.doAction('moveLayer', {
                layer: interactionData.layer.wickLayer, 
                newIndex: newIndex
            });
        })
    }
    
    var startInteraction = function (interactionName, e, interactiondata) {
        interactionData = interactiondata;
        currentInteraction = interactionName;

        interactions[interactionName]['start'](e);
        //updateInteraction(e);
    }
    var updateInteraction = function (e) {
        if(!currentInteraction) return;
        interactions[currentInteraction]['update'](e);
    }
    var finishInteraction = function (e) {
        if(!currentInteraction) return;
        interactions[currentInteraction]['finish'](e);
        currentInteraction = null;

        timeline.framesContainer.addFrameOverlay.elem.style.display = 'none';
    }

}
