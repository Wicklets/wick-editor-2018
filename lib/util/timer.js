var start;

var startTiming = function () {
	start = new Date().getTime();
}

var stopTiming = function () {
	console.log(new Date().getTime() - start);
}