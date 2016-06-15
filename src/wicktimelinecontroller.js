var WickTimelineController = function (wickEditor) {

	this.updateGUI = function (currentObject) {

		var that = this;

		// Reset the timeline div
		var timeline = document.getElementById("timeline");
		timeline.innerHTML = "";
		timeline.style.width = wickEditor.currentObject.frames.length*23 + 6 + "px";

		for(var i = 0; i < wickEditor.currentObject.frames.length; i++) {

		// Create the span that holds all the stuff for each frame

			var frameContainer = document.createElement("span");
			frameContainer.className = "frameContainer";
			timeline.appendChild(frameContainer);

			var timeline = document.getElementById("timeline");

		// Create the frame element

			var frameDiv = document.createElement("span");
			frameDiv.id = "frame" + i;
			frameDiv.innerHTML = i;
			if(wickEditor.currentObject.currentFrame == i) {
				frameDiv.className = "timelineFrame active";
			} else {
				frameDiv.className = "timelineFrame";
			}
			frameContainer.appendChild(frameDiv);

			// Add mousedown event to the frame element so we can go to that frame when its clicked
			frameDiv.addEventListener("mousedown", function(index) {
				return function () {
					wickEditor.actionHandler.doAction('gotoFrame', [index]);
				};
			}(i), false);

		// Create the breakpoint toggle element

			var breakpointDiv = document.createElement("span");
			if(wickEditor.currentObject.frames[i].breakpoint) {
				breakpointDiv.className = "breakpointButton enabled";
			} else {
				breakpointDiv.className = "breakpointButton";
			}
			frameContainer.appendChild(breakpointDiv);

			// Add mousedown event to the breakpoint element so we toggle a breakpoint on that frame
			breakpointDiv.addEventListener("mousedown", function(index) {
				return function () {
					var frame = wickEditor.currentObject.frames[index];
					frame.breakpoint = !frame.breakpoint;
					that.updateGUI(wickEditor.currentObject);
				};
			}(i), false);


		}
	}

	this.updateGUI(wickEditor.currentObject);

}