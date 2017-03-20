/* Wick - (c) 2017 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/*  This file is part of Wick. 
    
    Wick is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Wick is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Wick.  If not, see <http://www.gnu.org/licenses/>. */
    
/* WickProject Exporter */
/* Bundles WickProjects with the WickPlayer in a single HTML file. */

WickProject.Exporter = (function () {

    var projectExporter = { };

    projectExporter.generatePlayer = function () {
        
        var fileOut = "";

        // Add the player webpage (need to download the empty player)
        var emptyPlayerPath = "src/player/emptyplayer.htm";
        fileOut += FileDownloader.downloadFile(emptyPlayerPath) + "\n";

        // All libs needed by the player. 
        var requiredLibFiles = [
            "lib/jquery.min.js",
            "lib/pixi.4.2.2.min.js",
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
            "lib/bowser.js",
            "lib/URLParameterUtils.js",
            "src/project/WickTween.js",
            "src/project/WickFrame.js",
            "src/project/WickLayer.js",
            "src/project/WickObject.js",
            "src/project/WickPlayRange.js",
            "src/project/WickProject.js",
            "src/project/WickProject.Compressor.js",
            "src/player/WickPlayer.Preloader.js",
            "src/player/WickPlayer.PixiRenderer.js",
            "src/player/WickPlayer.WebAudioPlayer.js",
            "src/player/WickPlayer.InputHandler.js",
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

        return fileOut;

    }

    projectExporter.exportPlayer = function () {
        var emptyplayerString = projectExporter.generatePlayer();
        var blob = new Blob([emptyplayerString], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "player.html")
    }

    projectExporter.bundleProjectToHTML = function (wickProject, callback) {

        var fileOut = projectExporter.generatePlayer();

        // Bundle the JSON project
        wickProject.getAsJSON(function (JSONProject) {
            //var compressedJSONProject = WickProject.Compressor.compressProject(JSONProject, "LZSTRING-BASE64");
            //console.log(JSONProject.length)
            //console.log(compressedJSONProject.length)

            fileOut += "<script>var wickPlayer = new WickPlayer(); wickPlayer.runProject('" + JSONProject + "', document.getElementById('playerCanvasContainer'));</script>" + "\n";
            callback(fileOut);
        });

    }

    projectExporter.exportProjectInZip = function (wickProject) {

        projectExporter.bundleProjectToHTML(wickProject, function(fileOut) {
            var blob = new Blob([fileOut], {type: "text/plain;charset=utf-8"});
            var filename = wickProject.name || "project";
            saveAs(blob, filename+".html");
        });

    }

    projectExporter.exportProject = function (wickProject, args) {

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
        });

    }

    projectExporter.JSONReplacer = function(key, value) {
        var dontJSONVars = [
            "currentObject",
            "parentObject",
            "causedAnException",
            "fabricObjectReference",
            "parentLayer",
            "parentWickObject",
            "parentFrame",
            "alphaMask"
        ];

        if (dontJSONVars.indexOf(key) !== -1) {
            return undefined;
        } else {
            return value;
        }
    }

    return projectExporter;

})();
