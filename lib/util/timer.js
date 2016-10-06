var start;

var startTiming = function () {
	start = new Date().getTime();
}

var stopTiming = function (name) {
	console.log(new Date().getTime() - start + "ms: " + name);
	start = new Date().getTime();
}