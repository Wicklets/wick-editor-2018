/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/* WickProject Exporter */
/* Bundles WickProjects with the WickPlayer in a single HTML file. */

WickProject.Exporter = (function () {

    var projectExporter = { };

    projectExporter.bundleProjectToHTML = function (wickProject, callback) {

        var fileOut = "";

        // Add the player webpage (need to download the empty player)
        var emptyPlayerPath = "src/player/emptyplayer.htm";
        fileOut += FileDownloader.downloadFile(emptyPlayerPath) + "\n";

        // All libs needed by the player. 
        var requiredLibFiles = [
            "lib/jquery.min.js",
            "lib/pixi.min.js",
            "lib/lz-string.min.js",
            "lib/util/polyfills.js",
            "lib/util/keyCharToCode.js",
            "lib/util/fpscounter.js",
            "lib/util/browserdetection.js",
            "lib/util/base64-arraybuffer.js",
            "lib/util/checkInput.js",
            "lib/util/canvasconvert.js",
            "lib/screenfull.js"
        ];

        // Player code. 
        var requiredPlayerFiles =[
            "src/project/WickFrame.js",
            "src/project/WickLayer.js",
            "src/project/WickObject.js",
            "src/project/WickProject.js",
            "src/project/WickProject.Compressor.js",
            "src/player/WickPlayer.PixiRenderer.js",
            "src/player/WickPlayer.WebAudioPlayer.js",
            "src/player/WickPlayer.js",
        ];

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
            //var compressedJSONProject = WickProject.Compressor.compressProject(JSONProject, "LZSTRING-BASE64");
            //console.log(JSONProject.length)
            //console.log(compressedJSONProject.length)

            fileOut += "<script>WickPlayer.runProject('" + JSONProject + "');</script>" + "\n";
            callback(fileOut);
        });

    }

    projectExporter.exportProjectInZip = function (wickProject) {

        wickEditor.statusbar.setState('exporting');

        projectExporter.bundleProjectToHTML(wickProject, function(fileOut) {
            var blob = new Blob([fileOut], {type: "text/plain;charset=utf-8"});
            var filename = wickProject.name || "project";
            saveAs(blob, filename+".html");
            wickEditor.statusbar.setState('done');
        });

    }

    projectExporter.exportProject = function (wickProject, args) {

        wickEditor.statusbar.setState('exporting');

        projectExporter.bundleProjectToHTML(wickProject, function(fileOut) {
            var filename = wickProject.name || "project";
            if(args && args.zipped) {
                var zip = new JSZip();
                zip.file("index.html", fileOut);
                zip.generateAsync({type:"blob"}).then(function(content) {
                    saveAs(content, filename+".zip");
                });
            } else {
                var blob = new Blob([fileOut], {type: "text/plain;charset=utf-8"});
                saveAs(blob, filename+".html");
            }
            wickEditor.statusbar.setState('done');
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