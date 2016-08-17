/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var TimelineInterface = function (wickEditor) {

    var that = this;

    this.syncWithEditorState = function () {

        that.resize();

        // Reset the timeline div
        var timeline = document.getElementById("timeline");
        timeline.innerHTML = "";
        timeline.style.width = 3000+'px';//wickEditor.currentObject.frames.length*100 + 6 + "px";

        var currentObject = wickEditor.project.getCurrentObject();
        for(var i = 0; i < currentObject.frames.length; i++) {

            var frame = currentObject.frames[i];

        // Create the span that holds all the stuff for each frame

            var frameContainer = document.createElement("span");
            frameContainer.className = "frameContainer";
            frameContainer.style.width = 20 * frame.frameLength + 'px';
            timeline.appendChild(frameContainer);

        // Create the frame element

            var frameDiv = document.createElement("span");
            frameDiv.id = "frame" + i;
            frameDiv.innerHTML = i;
            if(currentObject.currentFrame == i) {
                frameDiv.className = "timelineFrame active";
            } else {
                frameDiv.className = "timelineFrame";
            }
            frameDiv.style.width = 20 * frame.frameLength + 'px';
            frameContainer.appendChild(frameDiv);

            // Add mousedown event to the frame element so we can go to that frame when its clicked
            frameDiv.addEventListener("mousedown", function(index) {
                return function () {
                    wickEditor.actionHandler.doAction('gotoFrame', {toFrame : index});
                };
            }(i), false);

        // Create the breakpoint toggle element

            var breakpointDiv = document.createElement("span");
            if(currentObject.frames[i].breakpoint) {
                breakpointDiv.className = "breakpointButton enabled";
            } else {
                breakpointDiv.className = "breakpointButton";
            }
            frameContainer.appendChild(breakpointDiv);

            // Add mousedown event to the breakpoint element so we toggle a breakpoint on that frame
            breakpointDiv.addEventListener("mousedown", function(index) {
                return function () {
                    var frame = currentObject.frames[index];
                    frame.breakpoint = !frame.breakpoint;
                    that.updateTimelineGUI(currentObject);
                };
            }(i), false);

        }
    }

    this.resize = function () {
        var GUIWidth = parseInt($("#timelineGUI").css("width")) / 2;
        $("#timelineGUI").css('left', (window.innerWidth/2 - GUIWidth)+'px');
    }

    window.addEventListener('resize', function(e) {
        that.resize();
    });

    $("#addEmptyFrameButton").on("click", function (e) {
        wickEditor.actionHandler.doAction('addEmptyFrame', []);
    });

    $("#extendFrameButton").on("click", function (e) {
        wickEditor.actionHandler.doAction('extendFrame', {nFramesToExtendBy:1});
    });

    $("#shrinkFrameButton").on("click", function (e) {
        wickEditor.actionHandler.doAction('shrinkFrame', {nFramesToShrinkBy:1});
    });

}
