var TimelineInterface = function (wickEditor) {

    var self = this;

    var timeline;
    var layers;
    var frames;
    var playhead;
    var addFrameOverlay;

    var cssVars;
    var cssVar;

    var lastObject;
    var playheadX;

    var currentInteraction;
    var interactionData;
    
    var startInteraction = function (interactionName, e) {
        currentInteraction = interactionName;
        updateInteraction(e);
    }
    var updateInteraction = function (e) {
        if(currentInteraction === "dragPlayhead") {
            playheadX = e.x - frames.getBoundingClientRect().left;
            playhead.style.left = playheadX + 'px';
        } else if (currentInteraction === 'dragFrame') {
            console.error('dragFrame')
            interactionData.frameDiv.style.left = e.x - frames.getBoundingClientRect().left - cssVar('--frame-width')/2 + 'px';
            interactionData.frameDiv.style.top = e.y - frames.getBoundingClientRect().top - cssVar('--vertical-spacing')/2 + 'px';
        } else if (currentInteraction === 'dragFrameWidth') {
            interactionData.frameDiv.style.width = e.x - frames.getBoundingClientRect().left + 'px';
        } else if (currentInteraction === 'dragSelectionBox') {
            console.error('dragSelectionBox')
        } else if (currentInteraction === 'dragSelectionBox') {
            console.error('dragSelectionBox')
        } else if (currentInteraction === 'dragLayer') {
            console.error('dragLayer')
        }
    }
    var finishInteraction = function (e) {
        if(currentInteraction === "dragPlayhead") {
            
        } else if (currentInteraction === 'dragFrame') {

        } else if (currentInteraction === 'dragFrameWidth') {
            
        } else if (currentInteraction === 'dragSelectionBox') {

        } else if (currentInteraction === 'dragSelectionBox') {
            
        } else if (currentInteraction === 'dragLayer') {
            
        }

        addFrameOverlay.style.display = 'none';

        currentInteraction = null;
    }

    self.setup = function () {
        cssVars = window.getComputedStyle(document.body);
        cssVar = function (varName) {
            return parseInt(cssVars.getPropertyValue(varName));
        }

        timeline = document.createElement('div');
        timeline.className = 'timeline';
        document.getElementById('timelineGUI').appendChild(timeline);

        currentInteraction = null;
        timeline.addEventListener('mousemove', function (e) {
            updateInteraction(e);
        });
        timeline.addEventListener('mouseup', function (e) {
            finishInteraction(e);
        });

        layers = document.createElement('div');
        layers.className = 'layers';
        timeline.appendChild(layers);

        frames = document.createElement('div');
        frames.className = 'frames';
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
                var newLayerDiv = document.createElement('div');
                newLayerDiv.className = "layer";
                newLayerDiv.style.top = (wickLayers.indexOf(wickLayer) * frameSpacingY) + 'px';
                newLayerDiv.innerHTML = wickLayer.identifier;
                if(wickLayer === wickEditor.project.currentObject.getCurrentLayer()) {
                    newLayerDiv.style.backgroundColor = "#F5F5F5";
                }
                layers.appendChild(newLayerDiv);

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
                frames.appendChild(framesStrip);

                wickLayer.frames.forEach(function(wickFrame) {
                    var newFrameDiv = document.createElement('div');
                    newFrameDiv.className = "frame";
                    newFrameDiv.style.left = (wickLayer.frames.indexOf(wickFrame) * frameSpacingX) + 'px';
                    newFrameDiv.style.top = (wickLayers.indexOf(wickLayer) * frameSpacingY) + 'px';
                    newFrameDiv.style.width = (wickFrame.frameLength * frameSpacingX - cssVar('--common-padding')/2) + 'px';
                    newFrameDiv.addEventListener('mousedown', function (e) {
                        interactionData = {frameDiv:newFrameDiv}
                        startInteraction("dragFrame", e);
                        e.stopPropagation();
                    });

                    var thumbnailDiv = document.createElement('img');
                    thumbnailDiv.className = "frame-thumbnail";
                    thumbnailDiv.wickData = {uuid:wickFrame.uuid};
                    newFrameDiv.appendChild(thumbnailDiv);

                    var extenderHandleRight = document.createElement('div');
                    extenderHandleRight.className = "frame-extender-handle frame-extender-handle-right";
                    extenderHandleRight.addEventListener('mousedown', function (e) {
                        interactionData = {frameDiv:newFrameDiv}
                        startInteraction("dragFrameWidth", e);
                        e.stopPropagation();
                    });
                    newFrameDiv.appendChild(extenderHandleRight);

                    var extenderHandleLeft = document.createElement('div');
                    extenderHandleLeft.className = "frame-extender-handle frame-extender-handle-left";
                    extenderHandleLeft.addEventListener('mousedown', function (e) {
                        interactionData = {frameDiv:newFrameDiv}
                        startInteraction("dragFrameWidth", e);
                        e.stopPropagation();
                    });
                    newFrameDiv.appendChild(extenderHandleLeft);

                    frames.appendChild(newFrameDiv);
                });
            });

            frames.appendChild(playhead);
            frames.appendChild(addFrameOverlay);
        }

        playheadX = wickEditor.project.currentObject.playheadPosition * frameSpacingX + frameSpacingX/2 - cssVar('--playhead-width')/2;
        playhead.style.left = playheadX + 'px';

        var thumbnailDivs = document.getElementsByClassName("frame-thumbnail");
        for(var i = 0; i < thumbnailDivs.length; i++) {
            var thumbnailDiv = thumbnailDivs[i];
            var src = wickEditor.project.getFrameByUUID(thumbnailDiv.wickData.uuid).thumbnail;
            if(src) thumbnailDivs[i].src = src;
        }

    }

}
