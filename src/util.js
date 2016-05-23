 var WickUtils = (function () {

	var wickUtils = { };

	wickUtils.downloadFile = function (url) {
		var fileString = "";
		var rawFile = new XMLHttpRequest();
		rawFile.open("GET", url, false);
		rawFile.onreadystatechange = function () {
			if(rawFile.readyState === 4) {
				if(rawFile.status === 200 || rawFile.status == 0) {
					fileString = rawFile.responseText;
				}
			}
		}
		rawFile.send(null);
		return fileString;
	}

	return wickUtils;

})();