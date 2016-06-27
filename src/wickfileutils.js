 var WickFileUtils = (function () {

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

	wickUtils.saveProjectAsHTMLFile = function (projectJSON) {
		var fileOut = "";

		// Add the player webpage (need to download the empty player)
		fileOut += WickFileUtils.downloadFile("player.htm") + "\n";

		// Add any libs that the player needs
		fileOut += "<script>" + WickFileUtils.downloadFile("lib/pixi.min.js") + "</script>\n";
		fileOut += "<script>" + WickFileUtils.downloadFile("lib/fpscounter.js") + "</script>\n";
		fileOut += "<script>" + WickFileUtils.downloadFile("lib/verboselog.js") + "</script>\n";
		fileOut += "<script>" + WickFileUtils.downloadFile("lib/browserdetection.js") + "</script>\n";
		fileOut += "<script>" + WickFileUtils.downloadFile("lib/base64-arraybuffer.js") + "</script>\n";

		// Add the player (need to download the player code)
		fileOut += "<script>" + WickFileUtils.downloadFile("src/wicksharedutils.js") + "</script>\n";
		fileOut += "<script>" + WickFileUtils.downloadFile("src/wickplayer.js") + "</script>\n";

		// Bundle the JSON project
		fileOut += "<script>WickPlayer.runProject('" + projectJSON + "');</script>" + "\n";

		// Save whole thing as html file
		var blob = new Blob([fileOut], {type: "text/plain;charset=utf-8"});
		saveAs(blob, "project.html");
	}

	wickUtils.saveProjectAsJSONFile = function (projectJSON) {
		// Save JSON project and have user download it
		var blob = new Blob([projectJSON], {type: "text/plain;charset=utf-8"});
		saveAs(blob, "project.json");
	}

	wickUtils.readJSONFromFileChooser = function (filePath, callback) {
		if(filePath.files && filePath.files[0]) {
			var reader = new FileReader();
			reader.onload = function (e) {
				jsonString = e.target.result;
				callback(jsonString);
			};
			reader.readAsText(filePath.files[0]);
		}
	}

	return wickUtils;

})();