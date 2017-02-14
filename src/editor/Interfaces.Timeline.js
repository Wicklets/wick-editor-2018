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
            wickEditor.actionHandler.doAction('extendFrame', {
                frame: wickEditor.project.currentObject.getCurrentFrame(), 
                nFramesToExtendBy: 0
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

            interactionData.frameDiv.style.width = mouseLeft - frameDivLeft - framesContainerLeft + cssVar('--frame-width')*2 - 12 + 'px';
        }),
        'finish' : (function (e) {
            var newFrameDivLen = parseInt(interactionData.frameDiv.style.width);
            var newLength = Math.round(newFrameDivLen / cssVar('--frame-width'));

            wickEditor.actionHandler.doAction('changeFrameLength', {
                frame: wickEditor.project.currentObject.getCurrentFrame(), 
                newFrameLength: newLength
            });
        })
    }
    interactions['dragSelectionBox'] = {
        'start' : (function (e) {
            console.log("LOL")
        }), 
        'update' : (function (e) {
            console.log(e)
            selectionBox.style.display = 'block';
            selectionBox.style.left = e.offsetX+'px'
            selectionBox.style.top = e.offsetY+'px'
            selectionBox.style.width = '100px'
            selectionBox.style.height = '100px'
        }),
        'finish' : (function (e) {
            selectionBox.style.display = 'none';
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
                frame: wickEditor.project.currentObject.getCurrentFrame(), 
                nFramesToExtendBy: 0
            });
        })
    }
    
    var startInteraction = function (interactionName, e, interactiondata) {
        interactionData = interactiondata;
        currentInteraction = interactionName;

        interactions[interactionName]['start']();
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

            var wickLayers = wickEditor.project.currentObject.layers;
            wickLayers.forEach(function (wickLayer) {
                var allLayerDivs = [];

                var newLayerDiv = document.createElement('div');
                newLayerDiv.className = "layer";
                newLayerDiv.style.top = (wickLayers.indexOf(wickLayer) * frameSpacingY) + 'px';
                newLayerDiv.innerHTML = wickLayer.identifier;
                if(wickLayer === wickEditor.project.currentObject.getCurrentLayer()) {
                    newLayerDiv.style.backgroundColor = "#F5F5F5";
                }
                layers.appendChild(newLayerDiv);
                allLayerDivs.push(newLayerDiv);

                var framesStrip = document.createElement('div');
                framesStrip.className = 'framesStrip';
                framesStrip.style.top = (wickLayers.indexOf(wickLayer) * frameSpacingY) + 'px';
                framesStrip.addEventListener('mousemove', function (e) {
                    if(currentInteraction) return;
                    addFrameOverlay.style.display = 'block';
                    addFrameOverlay.style.left = roundToNearestN(e.clientX - frames.getBoundingClientRect().left - frameSpacingX/2, frameSpacingX) + "px";
                    addFrameOverlay.style.top  = roundToNearestN(e.clientY - frames.getBoundingClientRect().top  - frameSpacingY/2, frameSpacingY) + "px";
                    console.error('check for existing frame here')
                });
                for(var i = 0; i < 10; i++) {
                    var framesStripCell = document.createElement('div');
                    framesStripCell.className = 'framesStripCell';
                    framesStrip.appendChild(framesStripCell);
                }
                frames.appendChild(framesStrip);
                allLayerDivs.push(framesStrip);

                wickLayer.frames.forEach(function(wickFrame) {
                    var newFrameDiv = document.createElement('div');
                    newFrameDiv.className = "frame";
                    newFrameDiv.style.left = (wickLayer.frames.indexOf(wickFrame) * frameSpacingX) + 'px';
                    newFrameDiv.style.top = (wickLayers.indexOf(wickLayer) * frameSpacingY) + 'px';
                    newFrameDiv.style.width = (wickFrame.frameLength * frameSpacingX - cssVar('--common-padding')/2) + 'px';
                    newFrameDiv.addEventListener('mousedown', function (e) {
                        startInteraction("dragFrame", e, {frameDiv:newFrameDiv});
                        e.stopPropagation();
                    });

                    var thumbnailDiv = document.createElement('img');
                    thumbnailDiv.className = "frame-thumbnail";
                    thumbnailDiv.wickData = {uuid:wickFrame.uuid};
                    newFrameDiv.appendChild(thumbnailDiv);

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
                    startInteraction('dragLayer', e, {allLayerDivs:allLayerDivs});
                });
            });

            frames.appendChild(playhead);
            frames.appendChild(addFrameOverlay);
            frames.appendChild(selectionBox);
        }

        playheadX = wickEditor.project.currentObject.playheadPosition * frameSpacingX + frameSpacingX/2 - cssVar('--playhead-width')/2;
        playhead.style.left = playheadX + 'px';

        var thumbnailDivs = document.getElementsByClassName("frame-thumbnail");
        for(var i = 0; i < thumbnailDivs.length; i++) {
            var thumbnailDiv = thumbnailDivs[i];
            var src = wickEditor.project.getFrameByUUID(thumbnailDiv.wickData.uuid).thumbnail;
            if(src) {
                thumbnailDivs[i].src = src;
            } else {
                thumbnailDivs[i].src = 'https://www.yireo.com/images/stories/joomla/whitepage.png';
            }
        }

    }

}
