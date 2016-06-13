var WickTimelineController = function () {

	this.updateGUI = function (currentObject) {

		// Reset the timeline div

		var timeline = document.getElementById("timeline");
		timeline.innerHTML = "";
		timeline.style.width = currentObject.frames.length*23 + 6 + "px";

		for(var i = 0; i < currentObject.frames.length; i++) {

			// Create the frame element
			var frameDiv = document.createElement("span");
			frameDiv.id = "frame" + i;
			frameDiv.innerHTML = i;
			if(currentObject.currentFrame == i) {
				frameDiv.className = "timelineFrame active";
			} else {
				frameDiv.className = "timelineFrame";
			}
			timeline.appendChild(frameDiv);

			// Add mousedown event to the frame element so we can go to that frame when its clicked
			document.getElementById("frame" + i).addEventListener("mousedown", function(index) {
				return function () {
					WickEditor.gotoFrame(index);
				};
			}(i), false);
		}

	}

}
