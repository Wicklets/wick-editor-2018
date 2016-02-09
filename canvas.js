// this has all the code for starting, updating, and drawing to the canvas.

$(document).ready(function() {
	var showUploadAlert = false;
	var mousePos;

	var canvas = document.getElementById('canvas'),
		ctx = canvas.getContext('2d');

/*****************************
	Mouse events
*****************************/
	function getMousePos(canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return { x: evt.clientX - rect.left, 
				 y: evt.clientY - rect.top };
	}
	canvas.addEventListener('mousemove', function(evt) {
		mousePos = getMousePos(canvas, evt);
		var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
	}, false);

/*****************************
	Drag and drop events
*****************************/
	$("#canvas").on('dragover', function(e) {
		showUploadAlert = true;
		return false;
	});
	$("#canvas").on('dragleave', function(e) {
		showUploadAlert = false;
		return false;
	});
	$("#canvas").on('drop', function(e) {
		// prevent browser from open the file when drop off
		e.stopPropagation();
		e.preventDefault();
		
		// retrieve uploaded files data
		var files = e.originalEvent.dataTransfer.files;
		var file = files[0];

		// read file as data URL
		var reader = new FileReader();
		reader.onload = (function(theFile) {
			return function(e) {
				console.log("you dragged in "+theFile.name);
				//testImage = new Image;
				//testImage.src = e.target.result;
				// TODO: place image at mouse position
				//testImageUploaded = true;
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
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

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
		ctx.fillStyle = '#DDDDDD';
		ctx.fillRect(0,0,canvas.width,canvas.height);
		
		//if(testImageUploaded) {
			ctx.save();
			//ctx.translate(testImage.width/2, testImage.height/2);
			//ctx.rotate(spinny)
			//ctx.translate(-testImage.width/2, -testImage.height/2);
			//ctx.drawImage(testImage,0,0);
			ctx.restore();
		//}
		
		if(showUploadAlert) {
			ctx.fillStyle = '#000000';
			ctx.textAlign = 'center';
			ctx.font = "30px Arial";
			ctx.fillText("are you gonna drop that in here or what",canvas.width/2,canvas.height/2);
		}
	}
})