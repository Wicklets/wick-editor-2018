/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/***********************
 *    ERROR! ERROR!    *
 ***********************/
var WickError = (function () {

	var wickError = {};

	wickError.error = function(errorText) {
		console.error(errorText); 
		throw (new Error()); 
	}

	return wickError;
})();