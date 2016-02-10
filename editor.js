// this has all the code for starting, updating, and drawing in the editor.

$(document).ready(function() {
	var showUploadAlert = false;
	var mousePos;

	var canvas = new fabric.Canvas('canvas');
	canvas.selectionColor = 'rgba(0,0,5,0.1)';
	canvas.selectionBorderColor = 'grey';
	canvas.selectionLineWidth = 2;

	var ctx = canvas.getContext('2d');

/*****************************
	Mouse events
*****************************/

	// Save mouse coordinates within the canvas.
	// NOTE: This only works properly when the window is in focus.
	canvas.on('mouse:move', function(event) {
		var pointer = canvas.getPointer(event.e);
		canvas.px = pointer.x;
		canvas.py = pointer.y;
	});

	/*function getMousePos(canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return { x: evt.clientX - rect.left,
				 y: evt.clientY - rect.top };
	}
	canvas.addEventListener('mousemove', function(evt) {
		mousePos = getMousePos(canvas, evt);
	}, false);*/

	/*****************************
		Key Events
	*****************************/

	var keys = [];
	var action = false;

	document.body.addEventListener("keydown", function (e) {
	  keys[e.keyCode] = true;
		action = true;
		checkKeys();
	});

	document.body.addEventListener("keyup", function (e) {
	  keys[e.keyCode] = false;
		action = false;
	});

	function checkKeys() {
		if (keys[16]) { // SHIFT
			if (keys[39]) { // RIGHT ARROW
				incrementFrame();
			} else if (keys[37]) { // LEFT ARROW
				decrementFrame();
			}
		}
	}

/*****************************
	Drag and drop events
*****************************/
	$("#canvasContainer").on('dragover', function(e) {
		showUploadAlert = true;
		return false;
	});
	$("#canvasContainer").on('dragleave', function(e) {
		showUploadAlert = false;
		return false;
	});
	$("#canvasContainer").on('drop', function(e) {
		// prevent browser from open the file when drop off
		e.stopPropagation();
		e.preventDefault();

		// retrieve uploaded files data
		// TODO: multiple files at once
		var files = e.originalEvent.dataTransfer.files;
		var file = files[0];

		// read file as data URL
		var reader = new FileReader();
		reader.onload = (function(theFile) {
			return function(e) {
				console.log("you dragged in " + theFile.name);
				// TODO: place image at mouse position

				fabric.Image.fromURL(e.target.result, function(oImg) {
					// Snap to center of window on drag.
					oImg.left = (canvas.width/2) - (oImg.width/2);
					oImg.top = (canvas.height/2) - (oImg.height/2);
					canvas.add(oImg);
				});

				console.log(canvas._objects);
			};
		})(file);
		reader.readAsDataURL(file);

		showUploadAlert = false;

		return false;
	});

/*****************************
	Frame Data
*****************************/

	var _frames = [];
	var currentFrame = parseInt($('textarea#frameSelector').val());

	// Store a frame as a JSON String.
	function storeFrame(frame) {
		_frames[frame] = JSON.stringify(canvas);
	}

	// Clear current canvas.
	function clearFrame() {
		canvas.clear();
	}

	// Loads the frame passed in as an int, if possible.
	function loadFrame(frame) {

		if (_frames[frame] === undefined) {
			// We're in a frame that doesn't exist. Just draw a blank canvas.
			canvas.clear();
		} else {
			// Load the JSON string and immediately use canvas.renderAll as a callback
			canvas.loadFromJSON(_frames[frame], canvas.renderAll.bind(canvas));
		}
	}

	// Goes to the frame passed in as an int.
	function goToFrame(frame) {
		if (nextFrame == NaN) {
			alert("Invalid Frame! Frame must be an integer!");
		} else if (nextFrame < 1) {
			alert("Invalid Frame! Frame must be greater than 0!");
		} else {
			storeFrame(currentFrame);
			loadFrame(nextFrame);
			currentFrame = nextFrame;
			document.getElementById("frameSelector").value = currentFrame;
		}
	}

	// Go to the next frame.
	function incrementFrame() {
		nextFrame = currentFrame + 1;
		goToFrame(nextFrame);
	}

	// Go to the previous frame.
	function decrementFrame() {
		nextFrame = currentFrame - 1;
		if (nextFrame > 0) {
			goToFrame(nextFrame);
		}
	}

/*****************************
	Temporary GUI events
*****************************/

	$("#exportButton").on("click", function(e){
		console.log(JSON.stringify(canvas));
	});


	$("#gotoFrameButton").on("click", function(e){
		nextFrame = parseInt($('textarea#frameSelector').val());
		goToFrame(nextFrame);
	});

/*****************************
	Resize window events
*****************************/
	window.addEventListener('resize', resizeCanvas, false);
	function resizeCanvas() {
		// for raw html5 canvas
		//canvas.width = window.innerWidth;
		//canvas.height = window.innerHeight;

		// for fabric.js canvas
		canvas.setWidth( window.innerWidth );
		canvas.setHeight( window.innerHeight );

		canvas.calcOffset();

		draw();
	}
	resizeCanvas();

/*****************************
	Draw/Update loop
*****************************/
	// start draw/update loop
	var FPS = 30;
	setInterval(function() {
		update();
		draw();
	}, 1000/FPS);

	function update() {
		//spinny+=0.5;
	}

	function draw() {
		if(showUploadAlert) {
			ctx.fillStyle = '#000000';
			ctx.textAlign = 'center';
			ctx.font = "30px Arial";
			ctx.fillText("Drop image to add to scene...",
			              canvas.width/2,canvas.height/2);
		}
	}
})

/*****************************
	utilities
*****************************/

// http://stackoverflow.com/questions/14636536/
// how-to-check-if-a-variable-is-an-integer-in-javascript
function isInt(data) {
	if (data === parseInt(data, 10))
	    return true;
	else
	    return false;
}
