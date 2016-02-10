// this has all the code for starting, updating, and drawing in the editor.

$(document).ready(function() {
	var showUploadAlert = false;
	var drawDebugInfo = true;
	var mousePos;

	var objects = [];
	
	var canvas = new fabric.Canvas('canvas');
	canvas.add(new fabric.Circle({ radius: 30, fill: '#f55', top: 100, left: 100 }));

	canvas.selectionColor = 'rgba(0,255,0,0.3)';
	canvas.selectionBorderColor = 'red';
	canvas.selectionLineWidth = 5;

	var ctx = canvas.getContext('2d');

/*****************************
	Mouse events
*****************************/
	function getMousePos(canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return { x: evt.clientX - rect.left,
				 y: evt.clientY - rect.top };
	}
	/*canvas.addEventListener('mousemove', function(evt) {
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

				fabric.Image.fromURL(theFile.name, function(oImg) {
					canvas.add(oImg);
				});

				// var newImg = wickImage(e.target.result, canvas.width/2, canvas.height/2, theFile.name);
				// objects.push(newImg);
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
		for(var i = 0; i < objects.length; i++) {
			var obj = objects[i];
			//ctx.save();
			//ctx.translate(objects[i].img.width/2, objects[i].img.height/2);
			//ctx.rotate(objects[i].rotation)
			//ctx.translate(-objects[i].img.width/2, -objects[i].img.height/2);
			obj.draw(ctx);
			//ctx.drawImage(obj.img, obj.x-obj.width/2, obj.y-obj.height/2);
			//ctx.restore();
		}

		if(showUploadAlert) {
			ctx.fillStyle = '#000000';
			ctx.textAlign = 'center';
			ctx.font = "30px Arial";
			ctx.fillText("Drop image to add to scene...",canvas.width/2,canvas.height/2);
		}

		if(drawDebugInfo) {
			var lineHeight = 14;

			ctx.fillStyle = '#000000';
			ctx.textAlign = 'left';
			ctx.font = lineHeight+"px Arial";

			ctx.fillText("objects in scene:",5,lineHeight);
			for(var i = 0; i < objects.length; i++) {
				var obj = objects[i];
				var objDebugData = obj.name + ": (" + obj.x + ", " + obj.y + ")";
				ctx.fillText(objDebugData,5,lineHeight*(i+2));
			}
		}
	}
})

