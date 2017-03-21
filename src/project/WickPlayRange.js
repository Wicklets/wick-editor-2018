/* Wick - (c) 2017 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/*  This file is part of Wick. 
    
    Wick is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Wick is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Wick.  If not, see <http://www.gnu.org/licenses/>. */
    
var WickPlayRange = function (start, end, identifier, color) { 

	this.start = start;  
	this.end = end; 
	this.identifier = identifier;	
	this.color = color || '#7E4FFF';
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