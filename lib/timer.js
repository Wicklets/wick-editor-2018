/*
var t0 = performance.now();
doSomething();
var t1 = performance.now();
console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")

*/


var start;

var startTiming = function () {
	start = performance.now();
}

var stopTiming = function (name) {
	var t = performance.now();
	var roundedT = (Math.round((t - start) * 100) / 100).toFixed(2);
	console.log(roundedT + "ms: " + name);
	start = t
}