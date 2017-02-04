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
            "lib/screenfull.js",
            "lib/polyfills.js",
            "lib/keyCharToCode.js",
            "lib/fpscounter.js",
            "lib/base64-arraybuffer.js",
            "lib/checkInput.js",
            "lib/canvasutils.js",
            "lib/random.js",
            "lib/socket.io-1.2.0.js",
            "lib/Tween.js",
            "lib/lerp.js",
            "lib/URLParameterUtils.js",
            "src/project/WickTween.js",
            "src/project/WickFrame.js",
            "src/project/WickLayer.js",
            "src/project/WickObject.js",
            "src/project/WickProject.js",
            "src/project/WickProject.Compressor.js",
            "src/player/WickPlayer.Preloader.js",
            "src/player/WickPlayer.PixiRenderer.js",
            "src/player/WickPlayer.WebAudioPlayer.js",
            "src/player/WickPlayer.js",
        ];

        var totalSize = 0;
        requiredLibFiles.forEach(function (filename) {
            var script = FileDownloader.downloadFile(filename);
            console.log(script.length + " used for " + filename);
            totalSize += script.length;
            fileOut += "<script>" + script + "</script>\n";
        });
        console.log(totalSize + " total");

        // Bundle the JSON project
        wickProject.getAsJSON(function (JSONProject) {
            //var compressedJSONProject = WickProject.Compressor.compressProject(JSONProject, "LZSTRING-BASE64");
            //console.log(JSONProject.length)
            //console.log(compressedJSONProject.length)

            fileOut += "<script>WickPlayer.runProject('" + JSONProject + "');</script>" + "\n";callback(fileOut);
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
        var dontJSONVars = ["currentObject","parentObject","causedAnException","fabricObjectReference"];

        if (dontJSONVars.indexOf(key) !== -1) {
            return undefined;
        } else {
            return value;
        }
    }

    return projectExporter;

})();