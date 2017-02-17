// implementation todo:
// - move multiple frames
// - scrollbars/panning
// - zooming
// - move layers

var TimelineInterface = function (wickEditor) {

    var self = this;

// Private vars

    var timeline;
    var layers;
    var frames;
    var playhead;
    var addFrameOverlay;
    var selectionBox;

    var cssVars;
    var cssVar;

    var lastObject;
    var playheadX;

// Interactions

    var currentInteraction;
    var interactionData;

    var interactions = {};
    interactions['dragPlayhead'] = {
        'start' : (function (e) {
            
        }), 
        'update' : (function (e) {
            playheadX = e.x - frames.getBoundingClientRect().left;
            playhead.style.left = playheadX + 'px';
        }),
        'finish' : (function (e) {

        })
    }
    interactions['dragFrame'] = {
        'start' : (function (e) {
            
        }), 
        'update' : (function (e) {
            interactionData.frameDiv.style.left = e.x - frames.getBoundingClientRect().left - cssVar('--frame-width')/2 + 'px';
            interactionData.frameDiv.style.top = e.y - frames.getBoundingClientRect().top - cssVar('--vertical-spacing')/2 + 'px';
            interactionData.frameDiv.style.zIndex = 10;
        }),
        'finish' : (function (e) {
            var newPlayheadPosition = Math.round(parseInt(interactionData.frameDiv.style.left) / cssVar('--frame-width'));
            wickEditor.actionHandler.doAction('moveFrame', {
                frame: interactionData.wickFrame, 
                newPlayheadPosition: newPlayheadPosition
            });
        })
    }
    interactions['dragFrameWidth'] = {
        'start' : (function (e) {
            
        }), 
        'update' : (function (e) {
            var wickFrame = interactionData.wickFrame;
            var frameDivLeft = interactionData.frameDiv.getBoundingClientRect().left;
            var framesContainerLeft = frames.getBoundingClientRect().left;
            var mouseLeft = e.x;

            var newWidth = mouseLeft - frameDivLeft - framesContainerLeft + cssVar('--frame-width')*2 + 6;
            newWidth = roundToNearestN(newWidth, cssVar('--frame-width'));
            interactionData.frameDiv.style.width = + newWidth + 'px';
        }),
        'finish' : (function (e) {
            var newFrameDivLen = parseInt(interactionData.frameDiv.style.width);
            var newLength = Math.round(newFrameDivLen / cssVar('--frame-width'));

            wickEditor.actionHandler.doAction('changeFrameLength', {
                frame: interactionData.wickFrame, 
                newFrameLength: newLength
            });
        })
    }
    interactions['dragSelectionBox'] = {
        'start' : (function (e) {
            var mx = e.x-frames.getBoundingClientRect().left;
            var my = e.y-frames.getBoundingClientRect().top;
            interactionData.selectionBoxOrigX = mx;
            interactionData.selectionBoxOrigY = my;
            selectionBox.style.left = '0px';
            selectionBox.style.top = '0px';
            selectionBox.style.width = '0px';
            selectionBox.style.height = '0px';
        }), 
        'update' : (function (e) {
            var mx = e.x-frames.getBoundingClientRect().left;
            var my = e.y-frames.getBoundingClientRect().top;

            var ox = interactionData.selectionBoxOrigX;
            var oy = interactionData.selectionBoxOrigY;

            if(mx-ox > 0) {
                selectionBox.style.left = ox+'px'
                selectionBox.style.width = mx-ox+'px';
            } else {
                selectionBox.style.left = mx+'px';
                selectionBox.style.width = ox-mx+'px'
            }
            if(my-oy > 0) {
                selectionBox.style.top = oy+'px'
                selectionBox.style.height = my-oy+'px';
            } else {
                selectionBox.style.top = my+'px';
                selectionBox.style.height = oy-my+'px'
            }

            selectionBox.style.display = 'block';
        }),
        'finish' : (function (e) {
            selectionBox.style.display = 'none';

            if(parseInt(selectionBox.style.width) === 0 && parseInt(selectionBox.style.height) ===0) return;

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
                    left: parseInt(frameDiv.style.left),
                    top: parseInt(frameDiv.style.top),
                    right: parseInt(frameDiv.style.width) + parseInt(frameDiv.style.left),
                    bottom: parseInt(frameDiv.style.height) + parseInt(frameDiv.style.top)
                }

                var selectionBoxRect = {
                    left: parseInt(selectionBox.style.left),
                    top: parseInt(selectionBox.style.top),
                    right: parseInt(selectionBox.style.width) + parseInt(selectionBox.style.left),
                    bottom: parseInt(selectionBox.style.height) + parseInt(selectionBox.style.top)
                }

                if(intersectRect(frameRect, selectionBoxRect)) {
                    wickEditor.project.selectObject(frameDiv.wickData.wickFrame);
                } 
            }
            updateFrameDivs();
            selectionBox.style.width = '0px'
            selectionBox.style.height = '0px'
        })
    }
    interactions['dragLayer'] = {
        'start' : (function (e) {
            
        }), 
        'update' : (function (e) {
            interactionData.allLayerDivs.forEach(function (div) {
                div.style.top = e.y - frames.getBoundingClientRect().top - cssVar('--vertical-spacing')/2 + 'px';
            });
        }),
        'finish' : (function (e) {
            wickEditor.actionHandler.doAction('extendFrame', {
                frame: wickEditor.project.getCurrentFrame(), 
                nFramesToExtendBy: 0
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

        addFrameOverlay.style.display = 'none';
    }

// Div building helper functions

    var updateFrameDivs = function () {
        var frameDivs = document.getElementsByClassName("frame");
        for(var i = 0; i < frameDivs.length; i++) {
            var selectionOverlayDiv = frameDivs[i].getElementsByClassName('selection-overlay')[0];
            var thumbnailDiv = frameDivs[i].getElementsByClassName('frame-thumbnail')[0];

            var wickFrame = frameDivs[i].wickData.wickFrame;

            var src = wickFrame.thumbnail;
            if(src) {
                thumbnailDiv.src = src;
            } else {
                thumbnailDiv.src = 'https://www.yireo.com/images/stories/joomla/whitepage.png';
            }

            if (wickEditor.project.isObjectSelected(wickFrame)) {
                selectionOverlayDiv.style.display = 'block';
            } else {
                selectionOverlayDiv.style.display = 'none';
            }
        }

        var layerDivs = document.getElementsByClassName("layer");
        for(var i = 0; i < layerDivs.length; i++) {
            var layerDiv = layerDivs[i];
            var layerIsSelected = wickEditor.project.currentObject.currentLayer === wickEditor.project.currentObject.layers.indexOf(layerDiv.wickData.wickLayer);
            
            var selectionOverlayDiv = layerDiv.getElementsByClassName('selection-overlay')[0];
            selectionOverlayDiv.style.display = layerIsSelected ? 'block' : 'none';
        }
    }

// Interface API

    self.setup = function () {

        // Load style vars from CSS

        cssVars = window.getComputedStyle(document.body);
        cssVar = function (varName) {
            return parseInt(cssVars.getPropertyValue(varName));
        }

        // Generate divs that stay onscreen always

        timeline = document.createElement('div');
        timeline.className = 'timeline';
        document.getElementById('timelineGUI').appendChild(timeline);

        layers = document.createElement('div');
        layers.className = 'layers';
        timeline.appendChild(layers);

        frames = document.createElement('div');
        frames.className = 'frames';
        frames.addEventListener('mousedown', function (e) {
            startInteraction('dragSelectionBox', e, {});
        });
        timeline.appendChild(frames);

        playhead = document.createElement('div');
        playhead.className = 'playhead';

        addFrameOverlay = document.createElement('img');
        addFrameOverlay.className = 'addFrameOverlay';
        addFrameOverlay.style.display = 'none';
        addFrameOverlay.src = 'http://iconshow.me/media/images/Mixed/Free-Flat-UI-Icons/png/512/plus-24-512.png';
        addFrameOverlay.addEventListener('mousedown', function (e) {
            wickEditor.actionHandler.doAction('addNewFrame', {});
            addFrameOverlay.style.display = 'none';
        });
        addFrameOverlay.addEventListener('mouseout', function (e) {
            addFrameOverlay.style.display = 'none';
        });
        frames.appendChild(addFrameOverlay);

        selectionBox = document.createElement('div');
        selectionBox.className = "selectionBox";
        selectionBox.style.display = 'none';

        // Add mouse event listeners for interactions

        currentInteraction = null;
        timeline.addEventListener('mousemove', function (e) {
            updateInteraction(e);
        });
        timeline.addEventListener('mouseup', function (e) {
            finishInteraction(e);
        });
    }

    self.syncWithEditorState = function () {

        var frameSpacingX = cssVar('--frame-width');
        var frameSpacingY = cssVar('--vertical-spacing');

        if (lastObject !== wickEditor.project.currentObject || wickEditor.project.currentObject.framesDirty) {

            wickEditor.project.currentObject.framesDirty = false;
            lastObject = wickEditor.project.currentObject;

            frames.innerHTML = "";
            layers.innerHTML = "";

            frames.addEventListener('mousedown', function (e) {
                wickEditor.project.clearSelection();
                updateFrameDivs()
            });

            var wickLayers = wickEditor.project.currentObject.layers;
            wickLayers.forEach(function (wickLayer) {
                var allLayerDivs = [];

                var newLayerDiv = document.createElement('div');
                newLayerDiv.className = "layer";
                newLayerDiv.style.top = (wickLayers.indexOf(wickLayer) * frameSpacingY) + 'px';
                newLayerDiv.innerHTML = wickLayer.identifier;
                newLayerDiv.wickData = {wickLayer:wickLayer};
                layers.appendChild(newLayerDiv);
                allLayerDivs.push(newLayerDiv);

                var layerSelectionOverlayDiv = document.createElement('div');
                layerSelectionOverlayDiv.className = 'selection-overlay';
                newLayerDiv.appendChild(layerSelectionOverlayDiv);

                var framesStrip = document.createElement('div');
                framesStrip.className = 'framesStrip';
                framesStrip.style.top = (wickLayers.indexOf(wickLayer) * frameSpacingY) + 'px';
                framesStrip.addEventListener('mousemove', function (e) {
                    if(currentInteraction) return;
                    /*addFrameOverlay.style.display = 'block';
                    addFrameOverlay.style.left = roundToNearestN(e.clientX - frames.getBoundingClientRect().left - frameSpacingX/2, frameSpacingX) + "px";
                    addFrameOverlay.style.top  = roundToNearestN(e.clientY - frames.getBoundingClientRect().top  - frameSpacingY/2, frameSpacingY) + "px";
                    console.error('check for existing frame here')*/
                });
                framesStrip.addEventListener('mousedown', function (e) {
                    wickEditor.actionHandler.doAction('movePlayhead', {
                        obj: wickEditor.project.currentObject,
                        newPlayheadPosition: Math.round((e.clientX - frames.getBoundingClientRect().left - frameSpacingX/2) / frameSpacingX),
                        /*newLayer: wickFrame.parentLayer*/
                    });
                });
                for(var i = 0; i < 100; i++) {
                    var framesStripCell = document.createElement('div');
                    framesStripCell.className = 'framesStripCell';
                    framesStrip.appendChild(framesStripCell);
                }
                frames.appendChild(framesStrip);
                allLayerDivs.push(framesStrip);

                wickLayer.frames.forEach(function(wickFrame) {
                    var newFrameDiv = document.createElement('div');
                    newFrameDiv.className = "frame";
                    newFrameDiv.style.left = (wickFrame.playheadPosition * frameSpacingX) + 'px';
                    newFrameDiv.style.top = (wickLayers.indexOf(wickLayer) * frameSpacingY) + 'px';
                    newFrameDiv.style.width = (wickFrame.length * frameSpacingX - cssVar('--common-padding')/2) + 'px';
                    newFrameDiv.style.height = cssVar('--vertical-spacing')-cssVar('--common-padding')+'px'
                    newFrameDiv.wickData = {wickFrame:wickFrame};
                    newFrameDiv.addEventListener('mousedown', function (e) {
                        wickEditor.actionHandler.doAction('movePlayhead', {
                            obj: wickEditor.project.currentObject,
                            newPlayheadPosition: wickFrame.playheadPosition,
                            newLayer: wickFrame.parentLayer
                        });
                        startInteraction("dragFrame", e, {frameDiv:newFrameDiv, wickFrame:wickFrame});
                        wickEditor.project.clearSelection();
                        wickEditor.project.selectObject(wickFrame)
                        updateFrameDivs()
                        e.stopPropagation();
                    });

                    var thumbnailDiv = document.createElement('img');
                    thumbnailDiv.className = "frame-thumbnail";
                    newFrameDiv.appendChild(thumbnailDiv);

                    var selectionOverlayDiv = document.createElement('div');
                    selectionOverlayDiv.className = "selection-overlay";
                    newFrameDiv.appendChild(selectionOverlayDiv);

                    var extenderHandleRight = document.createElement('div');
                    extenderHandleRight.className = "frame-extender-handle frame-extender-handle-right";
                    extenderHandleRight.addEventListener('mousedown', function (e) {
                        startInteraction("dragFrameWidth", e, {frameDiv:newFrameDiv, wickFrame:wickFrame});
                        e.stopPropagation();
                    });
                    newFrameDiv.appendChild(extenderHandleRight);
                    
                    var extenderHandleLeft = document.createElement('div');
                    extenderHandleLeft.className = "frame-extender-handle frame-extender-handle-left";
                    extenderHandleLeft.addEventListener('mousedown', function (e) {
                        startInteraction("dragFrameWidth", e, {frameDiv:newFrameDiv, wickFrame:wickFrame});
                        e.stopPropagation();
                    });
                    newFrameDiv.appendChild(extenderHandleLeft);

                    frames.appendChild(newFrameDiv);
                    allLayerDivs.push(newFrameDiv);
                });
                
                newLayerDiv.addEventListener('mousedown', function (e) {
                    wickEditor.actionHandler.doAction('movePlayhead', {
                        obj: wickEditor.project.currentObject,
                        newLayer: wickLayer
                    });
                    startInteraction('dragLayer', e, {allLayerDivs:allLayerDivs});
                });
            });

            frames.appendChild(playhead);
            frames.appendChild(addFrameOverlay);
            frames.appendChild(selectionBox);
        }

        playheadX = wickEditor.project.currentObject.playheadPosition * frameSpacingX + frameSpacingX/2 - cssVar('--playhead-width')/2;
        playhead.style.left = playheadX + 'px';

        updateFrameDivs();

    }

}
