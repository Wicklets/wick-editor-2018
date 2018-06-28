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

TimelineInterface.Interactions = function (wickEditor, timeline) {

    var self = this;

    var currentInteraction;
    var interactionData;

    var interactions = {};

    this.setup = function () {
        currentInteraction = null;
        window.addEventListener('mousemove', function (e) {
            self.update(e);
        });
        window.addEventListener('mouseup', function (e) {
            self.finish(e);
        });
    }

    this.start = function (interactionName, e, interactiondata) {
        interactionData = interactiondata;
        currentInteraction = interactionName;

        interactions[interactionName]['start'](e);
        //updateInteraction(e);
    }
    this.update = function (e) {
        if(!currentInteraction) return;
        interactions[currentInteraction]['update'](e);
    }
    this.finish = function (e) {
        if(!currentInteraction) return;
        interactions[currentInteraction]['finish'](e);
        currentInteraction = null;

        timeline.framesContainer.addFrameOverlay.elem.style.display = 'none';
    }

    this.getCurrent = function () {
        return currentInteraction;
    }

    interactions['dragFrame'] = {
        'start' : (function (e) {
            interactionData.movedDistance = {x:0, y:0};

            interactionData.frames.forEach(function (frame) {
                frame.origX = parseInt(frame.elem.style.left);
                frame.origY = parseInt(frame.elem.style.top);
                frame.currentX = 0;
                frame.currentY = 0;
            });
        }), 
        'update' : (function (e) {
            if(e.movementX !== 0 || e.movementY !== 0) interactionData.moved = true;

            interactionData.movedDistance.x += e.movementX;
            interactionData.movedDistance.y += e.movementY;

            if(Math.abs(interactionData.movedDistance.x) < 0 &&
               Math.abs(interactionData.movedDistance.y) < 0) {
                return;
            }

            var frameWidth = cssVar('--frame-width');
            var layerHeight = cssVar('--layer-height');
            interactionData.frames.forEach(function (frame) {
                frame.currentX += e.movementX;
                frame.currentY += e.movementY;
                //frame.elem.style.left = frame.origX + roundToNearestN(frame.currentX,frameWidth) + 'px';
                //frame.elem.style.top  = frame.origY + roundToNearestN(frame.currentY,layerHeight) + 'px';
                frame.elem.style.left = frame.origX + frame.currentX + 'px';
                frame.elem.style.top  = frame.origY + frame.currentY + 'px';
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

            wickEditor.actionHandler.doAction('moveFrames', {
                framesMoveActionData: framesMoveActionData
            });

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
            newWidth = roundToNearestN(newWidth, cssVar('--frame-width'));
            newWidth = Math.max(newWidth, cssVar('--frame-width'));
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
            timeline.horizontalScrollBar.scroll(e.movementX);
        }),
        'finish' : (function (e) {
            
        })
    }
    interactions['dragVerticalScrollbarHead'] = {
        'start' : (function (e) {
            
        }), 
        'update' : (function (e) {
            timeline.verticalScrollBar.scroll(e.movementY);
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

            var frameDivs = document.getElementsByClassName('frame')
            wickEditor.project.clearSelection();
            for(var i = 0; i < frameDivs.length; i ++) {
                var frameDiv = frameDivs[i]

                var frameRect = {
                    left:   parseInt(frameDiv.style.left) + 15,
                    top:    parseInt(frameDiv.style.top),
                    right:  parseInt(frameDiv.style.width)  + parseInt(frameDiv.style.left) + 15,
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
            
            wickEditor.syncInterfaces();
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

    interactions['dragTweens'] = {
        'start' : (function (e) {
            interactionData.tweenElemOrigX = parseInt(interactionData.tweens[0].elem.style.left);
            interactionData.startX = e.x;
            interactionData.moveX = 0;
            interactionData.tweens[0].elem.style.pointerEvents = 'none';
        }), 
        'update' : (function (e) {
            interactionData.moveX = e.x - interactionData.startX;

            var tween = interactionData.tweens[0];
            var newPos = interactionData.moveX//roundToNearestN(interactionData.moveX, cssVar('--frame-width'));
            newPos = parseInt(newPos);
            tween.elem.style.left = interactionData.tweenElemOrigX+newPos + 'px';
            tween.elem.style.opacity = 0.5;
        }),
        'finish' : (function (e) {
            var tween = interactionData.tweens[0];
            tween.elem.style.opacity = 1.0;
            interactionData.tweens[0].elem.style.pointerEvents = 'auto';
            
            var newPlayheadPosition = Math.round((parseInt(tween.elem.style.left)) / cssVar('--frame-width'));
            wickEditor.actionHandler.doAction('moveMotionTween', {
                frame: interactionData.frame,
                tween: tween.wickTween,
                newPlayheadPosition: newPlayheadPosition
            });

        })
    }

    var timelineOffset = 186;
    interactions['dragPlayhead'] = {
        'start' : (function (e) {
            wickEditor.canvas.getFastCanvas().stopPreviewPlaying();
            var shift = -timeline.horizontalScrollBar.getScrollPosition();
            timeline.playhead.setPosition(e.pageX-timelineOffset-shift);
            wickEditor.project.getCurrentObject().playheadPosition = timeline.playhead.getFramePosition();
            wickEditor.canvas.getFastCanvas().startFastRendering();
        }), 
        'update' : (function (e) {
            var shift = -timeline.horizontalScrollBar.getScrollPosition();
            timeline.playhead.setPosition(Math.max(0, e.pageX-timelineOffset-shift));
            timeline.playhead.snap();
            if(timeline.playhead.frameDidChange()) {
                wickEditor.project.getCurrentObject().playheadPosition = timeline.playhead.getFramePosition();
            }
        }),
        'finish' : (function (e) {
            timeline.playhead.snap();
            wickEditor.canvas.getFastCanvas().stopFastRendering();
            wickEditor.actionHandler.doAction('movePlayhead', {
                obj: wickEditor.project.getCurrentObject(),
                newPlayheadPosition: timeline.playhead.getFramePosition(),
                newLayer: wickEditor.project.getCurrentLayer()
            });
        })
    }

}