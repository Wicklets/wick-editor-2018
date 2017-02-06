/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var TimelineInterface = function (wickEditor) {

    var self = this;

// DOM Utils

    var createDiv = function (args, events) {
        var div = document.createElement('div')

        for(argName in args) {
            div[argName] = args[argName];
        }

        return div;
    }

// Settings

    var frameWidth = 18;

// Generate view from model

    var generateDiv = function (obj, parent) {
        if(obj instanceof WickObject) {

            var timelineDiv = createDiv({className: 'timeline'});
            registerEvents(timelineDiv, obj)

            obj.layers.forEach(function (wickLayer) {
                generateDiv(wickLayer, timelineDiv);
            });

            parent.appendChild(timelineDiv);

        } else if(obj instanceof WickLayer) {

            var layerDiv = createDiv({className: 'layer'});
            registerEvents(layerDiv, obj)
            
            layerDiv.appendChild(createDiv({className: 'layerOptions'}));
            obj.frames.forEach(function (wickFrame) {
                generateDiv(wickFrame, layerDiv);
            });

            parent.appendChild(layerDiv);

        } else if (obj instanceof WickFrame) {

            var frameDiv = createDiv({className: 'frame'});
            registerEvents(frameDiv, obj)

            frameDiv.style.width = (frameWidth * obj.frameLength) + 'px';

            var leftFrameHandle = createDiv({className: 'leftFrameHandle'});
            var rightFrameHandle = createDiv({className: 'rightFrameHandle'});
            frameDiv.appendChild(leftFrameHandle);
            frameDiv.appendChild(rightFrameHandle);

            parent.appendChild(frameDiv);

        }
    }

// Event handlers

    var registerEvents = function (div, obj) {
        if(obj instanceof WickObject) {


        } else if(obj instanceof WickLayer) {


        } else if(obj instanceof WickFrame) {

            div.addEventListener('mousedown', function () {
                console.log(obj.identifier)
            });

        }
    }

// API

    self.setup = function () {
        
    }

    self.syncWithEditorState = function () {
        // Clear timeline GUI DOM elem
        var timelineGUI = document.getElementById('timelineGUI');
        timelineGUI.innerHTML = "";

        // Regenerate timeline GUI DOM elem
        generateDiv(wickEditor.project.currentObject, timelineGUI);
    }

}
