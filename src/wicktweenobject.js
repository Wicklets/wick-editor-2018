/*****************************
	   Tween Objects
*****************************/

/*
 * Defines a tween object class which stores all possible
 * manipulations that can be done on a series of wickObjects. 
 * Tween objects can also recieve wickObjects and apply these 
 * transformations to the objects themselves. */ 

var WickTween = function() {
	this.x = 0; 
	this.y = 0; 
	this.z = 0; 

	this.scale = 1; 
	this.theta = 0; 

	this.opacity = 1; //  0 to 1 

	// Default to linear interpolation. 
	this.interpolationStyle = "LINEAR"; 
}

