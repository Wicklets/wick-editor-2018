/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

// TIMELINE BACKEND TODO
// - Playhead
// - Selection box
// - Frame extender handles
// - Thumbnail autoupdate
// - Drag to move selected frames

var TimelineInterface = function (wickEditor) {

    var self = this;

    var timeline;
    var layers;
    var frames;

    self.setup = function () {
        timeline = document.createElement('div');
        timeline.className = 'timeline';
        document.getElementById('timelineGUI').appendChild(timeline);

        layers = document.createElement('div');
        layers.className = 'layers';
        timeline.appendChild(layers);

        frames = document.createElement('div');
        frames.className = 'frames';
        timeline.appendChild(frames);
    }

    self.syncWithEditorState = function () {
        layers.innerHTML = "";
        frames.innerHTML = "";

        var wickLayers = wickEditor.project.currentObject.layers;
        wickLayers.forEach(function (wickLayer) {
            var newLayerDiv = document.createElement('div');
            newLayerDiv.className = "layer";
            newLayerDiv.innerHTML = wickLayer.identifier;
            layers.appendChild(newLayerDiv);

            var framesStrip = document.createElement('div');
            framesStrip.className = 'framesStrip';
            framesStrip.style.top = (wickLayers.indexOf(wickLayer) * 35) + 'px';
            frames.appendChild(framesStrip);

            wickLayer.frames.forEach(function(wickFrame) {
                var newFrameDiv = document.createElement('div');
                newFrameDiv.className = "frame";
                newFrameDiv.style.left = (wickLayer.frames.indexOf(wickFrame) * 45) + 'px';
                newFrameDiv.style.top = (wickLayers.indexOf(wickLayer) * 35) + 'px';

                if(wickFrame.thumbnail) {
                    var thumbnailDiv = document.createElement('img');
                    thumbnailDiv.className = "frame-thumbnail";
                    thumbnailDiv.src = wickFrame.thumbnail;
                    newFrameDiv.appendChild(thumbnailDiv)
                }

                frames.appendChild(newFrameDiv);
            });
        });
    } 

/*
    var self = this;

// DOM Utils

    var newDiv = function (args, events) {
        var div = document.createElement('div')

        for(argName in args) {
            div[argName] = args[argName];
        }

        return div;
    }

// Settings

    var frameWidth = 18;

// Generate view from model

    var createTimelineDiv = function (wickObject, parent) {

        var timelineDiv = newDiv({className: 'timeline'});

        wickObject.layers.forEach(function (wickLayer) {
            timelineDiv.appendChild(createLayerDiv(wickLayer));
        });

        return timelineDiv;
    }

    var createLayerDiv = function (wickLayer, parent) {

        var layerDiv = newDiv({className: 'layer'});
        layerDiv.addEventListener('mousedown', function () {
            console.log('layer');
        });
        
        layerDiv.appendChild(newDiv({className: 'layerOptions'}));
        wickLayer.frames.forEach(function (wickFrame) {
            layerDiv.appendChild(createFrameDiv(wickFrame));
        });

        return layerDiv;

    } 

    var createFrameDiv = function (wickFrame, parent) {

        var frameDiv = newDiv({className: 'frame' + (!wickEditor.project.isObjectSelected(wickFrame)?' selectedFrame':'')});
        frameDiv.addEventListener('mousedown', function (e) {
            console.log('frame')
            e.stopPropagation();
        });

        frameDiv.style.width = (frameWidth * wickFrame.frameLength) + 'px';

        var leftFrameHandle = newDiv({className: 'frameHandle leftFrameHandle'});
        var rightFrameHandle = newDiv({className: 'frameHandle rightFrameHandle'});
        leftFrameHandle.addEventListener('mousedown', function (e) {
            console.log('leftframehandle');
            e.stopPropagation();
        });
        rightFrameHandle.addEventListener('mousedown', function (e) {
            console.log('rightFrameHandle');
            e.stopPropagation();
        });
        frameDiv.appendChild(leftFrameHandle);
        frameDiv.appendChild(rightFrameHandle);

        return frameDiv;

    }

// API

    self.setup = function () {
        
    }

    self.syncWithEditorState = function () {
        // Clear timeline GUI DOM elem
        var timelineGUI = document.getElementById('timelineGUI');
        timelineGUI.innerHTML = "";

        // Regenerate timeline GUI DOM elem
        timelineGUI.appendChild(createTimelineDiv(wickEditor.project.currentObject));
    }
*/
}
