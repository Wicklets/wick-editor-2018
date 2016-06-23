var VerboseLog = (function () {

	var verboseLog = { };

	var verbose = true;
	var alwaysLogErrors = true;

	verboseLog.log = function (str) {
		if(verbose) {
			console.log(str);
		}
	}

	verboseLog.error = function (str) {
		if(verbose || alwaysLogErrors) {
			console.error(str);
		}
	}

	verboseLog.log("Verbose console is enabled. Turn it off in verboselog.js if you want.")

	return verboseLog;

})();