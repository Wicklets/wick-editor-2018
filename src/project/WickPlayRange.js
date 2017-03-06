var WickPlayRange = function (identifier, start, end, color) { 
	// Name of playRange
	this.identifier = identifier;

	this.start = start;  

	this.end = end; 

	this.color = color || 'green'; 
}

// val : number - Index to start playrange. Must be less then end and at least 1. 
WickPlayRange.prototype.changeStart = function (index) {
	if (index >= this.end) {
		this.start = this.end; 
	} else if (index < 1) {
		this.start = 1; 
	} else {
		this.start = index; 
	}
}

// val : number - Index to end playrange. Must be greater than or equal to start. 
WickPlayRange.prototype.changeEnd = function (index) {
	if (index <= this.start) {
		this.end = this.start; 
	} else {
		this.end = index; 
	}
}
 
