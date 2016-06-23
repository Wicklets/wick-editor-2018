var VerboseLog = (function () {

	var verboseLog = { };

	verboseLog.verbose = true;

	verboseLog.log = function (str) {
		if(verboseLog.verbose) {
			console.log(str);
		}
	}

	verboseLog.error = function (str) {
		if(verboseLog.verbose) {
			console.error(str);
		}
	}

	verboseLog.log("Verbose console is enabled. Turn it off in verboselog.js if you want.")

	return verboseLog;

})();