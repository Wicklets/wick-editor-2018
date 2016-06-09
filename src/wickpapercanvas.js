var PaperCanvas = function () {

	// Get a reference to the canvas object
	this.paperCanvas = document.createElement('canvas'); //document.getElementById('paperCanvas');
	this.paperCanvas.width = window.innerWidth;
	this.paperCanvas.height = window.innerHeight;
	// Add canvas to page
	/*this.paperCanvas.style.position = 'fixed';
	this.paperCanvas.style.top = '0px';
	this.paperCanvas.style.left = '0px';
	document.body.appendChild(this.paperCanvas)*/
	// Create an empty project and a view for the canvas:
	paper.setup(this.paperCanvas);
	// Create a Paper.js Path to draw a line into it:
	/*var path = new paper.Path();
	// Give the stroke a color
	path.strokeColor = 'black';
	var start = new paper.Point(0, 0);
	// Move to start and draw a line from there
	path.moveTo(start);
	// Note that the plus operator on Point objects does not work
	// in JavaScript. Instead, we need to call the add() function:
	path.lineTo(start.add([ 200, 200 ]));
	// Draw the view now:
	paper.view.draw();*/

}

PaperCanvas.prototype.getCanvas = function() {
	return this.paperCanvas;
};