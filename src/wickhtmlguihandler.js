var WickHTMLGUIHandler = function (wickEditor) {

/****************
    Timeline
****************/

	this.updateTimelineGUI = function (currentObject) {

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
					wickEditor.actionHandler.doAction('gotoFrame', {toFrame : index});
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
					that.updateTimelineGUI(wickEditor.currentObject);
				};
			}(i), false);

		}
	}
	
	this.updateTimelineGUI(wickEditor.currentObject);

/*********************
    Properties Box
*********************/

	var testPositiveInteger = function(n, setFunc) {
		var num = Number(n);
		if((typeof num === 'number') && (num % 1 == 0) && (num > 0)) {
			setFunc(num);
			console.log(wickEditor.project);
		}
	}

	$('#projectSizeX').on('input propertychange', function () {

		testPositiveInteger($('#projectSizeX').val(), function(n) {
			wickEditor.project.resolution.x = n;
			wickEditor.resizeCanvasAndGUI();
		});

	});

	$('#projectSizeY').on('input propertychange', function () {

		testPositiveInteger($('#projectSizeY').val(), function(n) {
			wickEditor.project.resolution.y = n;
			wickEditor.resizeCanvasAndGUI();
		});

	});

	$('#frameRate').on('input propertychange', function () {

		testPositiveInteger($('#frameRate').val(), function(n) {
			wickEditor.project.framerate = n;
		});

	});

	document.getElementById('projectBgColor').onchange = function () {
		wickEditor.project.backgroundColor = this.value;
		wickEditor.fabricCanvas.setBackgroundColor(this.value);
	};

	$('#objectName').on('input propertychange', function () {
		var newName = $('#objectName').val();
		if(newName === '') {
			wickEditor.fabricCanvas.getActiveObject().wickObject.name = undefined;
		} else {
			wickEditor.fabricCanvas.getActiveObject().wickObject.name = $('#objectName').val();
		}
	});

	document.getElementById('fontSelector').onchange = function () {
		wickEditor.fabricCanvas.getActiveObject().fontFamily = document.getElementById('fontSelector').value;
		wickEditor.fabricCanvas.getCanvas().renderAll();
	}

	document.getElementById('fontColor').onchange = function () {
		wickEditor.fabricCanvas.getActiveObject().fill = this.value;
		wickEditor.fabricCanvas.getCanvas().renderAll();
	};

	document.getElementById('fontSize').onchange = function () {
		wickEditor.fabricCanvas.getActiveObject().fontSize = this.value;
		wickEditor.fabricCanvas.getCanvas().renderAll();
	};

	$('#htmlTextBox').on('input propertychange', function () {
		wickEditor.fabricCanvas.getActiveObject().wickObject.htmlData = $('#htmlTextBox').val();
	});

/************************
    Right click menu
************************/

	this.openRightClickMenu = function () {

		// Make rightclick menu visible
		$("#rightClickMenu").css('visibility', 'visible');
		// Attach it to the mouse
		$("#rightClickMenu").css('top', wickEditor.mouse.y+'px');
		$("#rightClickMenu").css('left', wickEditor.mouse.x+'px');

		// Hide everything

		$("#insideSymbolButtons").css('display', 'none');
		$("#symbolButtons").css('display', 'none');
		$("#staticObjectButtons").css('display', 'none');
		$("#commonObjectButtons").css('display', 'none');
		$("#frameButtons").css('display', 'none');

		// Selectively show portions we need depending on editor state

		var fabCanvas = wickEditor.fabricCanvas.getCanvas();
		var selectedObject = fabCanvas.getActiveObject() || fabCanvas.getActiveGroup();

		if(!wickEditor.currentObject.isRoot) {
			$("#insideSymbolButtons").css('display', 'block');
		}
		if(selectedObject) {
			if(selectedObject.wickObject && selectedObject.wickObject.isSymbol) {
				$("#symbolButtons").css('display', 'block');
			} else {
				$("#staticObjectButtons").css('display', 'block');
			}
			$("#commonObjectButtons").css('display', 'block');
			
		} else {
			$("#frameButtons").css('display', 'block');
		}
	}

	this.closeRightClickMenu = function () {
		// Hide rightclick menu
		$("#rightClickMenu").css('visibility', 'hidden');
		$("#rightClickMenu").css('top', '0px');
		$("#rightClickMenu").css('left','0px');

		// Hide all buttons inside rightclick menu
		$("#symbolButtons").css('display', 'none');
		$("#staticObjectButtons").css('display', 'none');
		$("#commonObjectButtons").css('display', 'none');
		$("#frameButtons").css('display', 'none');
	}

	this.updatePropertiesGUI = function(tab) {

		$("#projectProperties").css('display', 'none');
		$("#objectProperties").css('display', 'none');
		$("#textProperties").css('display', 'none');
		$("#htmlSnippetProperties").css('display', 'none');

		switch(tab) {
			case 'project':
				document.getElementById('projectBgColor').value   = wickEditor.project.backgroundColor;
				document.getElementById('projectSizeX').innerHTML = wickEditor.project.resolution.x;
				document.getElementById('projectSizeY').innerHTML = wickEditor.project.resolution.y;
				document.getElementById('frameRate').innerHTML    = wickEditor.project.framerate;
				$("#projectProperties").css('display', 'inline');
				break;
			case 'symbol':
				var name = wickEditor.fabricCanvas.getActiveObject().wickObject.name;
				if(name) {
					document.getElementById('objectName').value = name;
				} else {
					document.getElementById('objectName').value = '';
				}
				$("#objectProperties").css('display', 'inline');
				break;
			case 'text':
				$("#textProperties").css('display', 'inline');
				break;
			case 'htmlSnippet':
				$("#htmlSnippetProperties").css('display', 'inline');
				break;
		}

	};

	this.updatePropertiesGUI('project');

}
