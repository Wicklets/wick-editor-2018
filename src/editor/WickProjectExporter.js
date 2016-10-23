/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/* WickProjectExporter */
/* Bundles WickProjects with the WickPlayer in a single HTML file. */

var WickProjectExporter = (function () {

    var projectExporter = { };

    var emptyPlayerPath = "src/player/emptyplayer.htm";

    // All libs needed by the player. 
    var requiredLibFiles = [
        "lib/pixi/pixi.min.js",
        "lib/lz-string/lz-string.min.js",
        "lib/util/polyfills.js",
        "lib/util/keyCharToCode.js",
        "lib/util/fpscounter.js",
        "lib/util/verboselog.js",
        "lib/util/browserdetection.js",
        "lib/util/base64-arraybuffer.js",
        "lib/util/checkInput.js",
    ];

    // Player code. 
    var requiredPlayerFiles =[
        "src/project/WickFrame.js",
        "src/project/WickLayer.js",
        "src/project/WickObject.js",
        "src/project/WickProject.js",
        "src/editor/WickProjectCompressor.js",
        "src/player/renderers/WickPixiRenderer.js",
        "src/player/audioplayers/WickWebAudioPlayer.js",
        "src/player/WickPlayer.js",
    ];

    projectExporter.bundleProjectToHTML = function (wickProject, callback) {

        var fileOut = "";

        // Add the player webpage (need to download the empty player)
        fileOut += FileDownloader.downloadFile(emptyPlayerPath) + "\n";

        for (var libIndex = 0; libIndex < requiredLibFiles.length; libIndex++) {
            file = requiredLibFiles[libIndex];
            fileOut += "<script>" + FileDownloader.downloadFile(file) + "</script>\n";
        }

        for (var srcIndex = 0; srcIndex < requiredPlayerFiles.length; srcIndex++) {
            file = requiredPlayerFiles[srcIndex];
            fileOut += "<script>" + FileDownloader.downloadFile(file) + "</script>\n";
        }

        // Bundle the JSON project
        wickProject.getAsJSON(function (JSONProject) {
            var compressedJSONProject = WickProjectCompressor.compressProject(JSONProject, "LZSTRING-BASE64");

            fileOut += "<script>WickPlayer.runProject('" + compressedJSONProject + "');</script>" + "\n";
            callback(fileOut);
        });

    }

    projectExporter.exportProject = function (wickProject) {

        wickEditor.interfaces.statusbar.setState('exporting');

        projectExporter.bundleProjectToHTML(wickProject, function(fileOut) {
            var blob = new Blob([fileOut], {type: "text/plain;charset=utf-8"});
            saveAs(blob, "project.html");
            wickEditor.interfaces.statusbar.setState('done');
        });

    }

    projectExporter.JSONReplacer = function(key, value) {
        var dontJSONVars = ["parentObject","causedAnException","paperData","cachedFabricObject"];

        if (dontJSONVars.indexOf(key) !== -1) {
            return undefined;
        } else {
            return value;
        }
    }

    return projectExporter;

})();