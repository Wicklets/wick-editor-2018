/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var TimelineInterface = function (wickEditor) {

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
            console.log(/*wickFrame.identifier*/'frame')
            e.stopPropagation();
        });

        frameDiv.style.width = (frameWidth * wickFrame.frameLength) + 'px';

        var leftFrameHandle = newDiv({className: 'frameHandle leftFrameHandle'});
        var rightFrameHandle = newDiv({className: 'frameHandle rightFrameHandle'});
        leftFrameHandle.addEventListener('mousedown', function (e) {
            console.log(/*wickFrame.identifier*/'leftframehandle');
            e.stopPropagation();
        });
        rightFrameHandle.addEventListener('mousedown', function (e) {
            console.log(/*wickFrame.identifier*/'rightFrameHandle');
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

}
