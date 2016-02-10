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
				console.log("you dragged in "+theFile.name);
				// TODO: place image at mouse position

				fabric.Image.fromURL(e.target.result, function(oImg) {
					canvas.add(oImg);
				});
			};
		})(file);
		reader.readAsDataURL(file);

		showUploadAlert = false;

		return false;
	});

/*****************************
	Resize window events
*****************************/
	window.addEventListener('resize', resizeCanvas, false);
	function resizeCanvas() {
		//canvas.width = window.innerWidth;
		//canvas.height = window.innerHeight;
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
			ctx.fillText("Drop image to add to scene...",canvas.width/2,canvas.height/2);
		}
	}
})
