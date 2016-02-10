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
	Temporary GUI events
*****************************/

	$("#exportButton").on("click", function(e){ 
		console.log(JSON.stringify(canvas));
	});
	$("#gotoFrameButton").on("click", function(e){ 
		alert("goin to frame " + $('textarea#frameSelector').val());
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
