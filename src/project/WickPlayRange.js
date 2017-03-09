var WickPlayRange = function (start, end, identifier, color) { 

	this.start = start;  
	this.end = end; 
	this.identifier = identifier;	
	this.color = color || 'green';
	this.uuid = random.uuid4();

}

// index : number - Index to start playrange. Must be less then end and at least 1. 
WickPlayRange.prototype.changeStart = function (index) {

	if (index >= this.end-1) {
		this.start = this.end-1; 
	} else if (index < 0) {
		this.start = 0; 
	} else {
		this.start = index; 
	}

}

// index : number - Index to end playrange. Must be greater than or equal to start. 
WickPlayRange.prototype.changeEnd = function (index) {

	if (index <= this.start+1) {
		this.end = this.start+1; 
	} else {
		this.end = index; 
	}

}
 
WickPlayRange.prototype.changeStartAndEnd = function (newStart, newEnd) {

	newStart = Math.max(newStart, 0);

	if (newStart < newEnd) {
		this.start = newStart;
		this.end = newEnd;
	}

}

WickPlayRange.prototype.getStart = function () {

	return this.start;

}

WickPlayRange.prototype.getEnd = function () {

	return this.end;

}

WickPlayRange.prototype.getLength = function () {

	return this.end - this.start;

}