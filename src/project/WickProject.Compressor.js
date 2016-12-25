/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

WickProject.Compressor = (function () {

    var projectCompressor = { };

    var printFilesize = false;

    var compressionRoutines = {
        'LZSTRING-BASE64': {
            compress:LZString.compressToBase64, 
            decompress:LZString.decompressFromBase64
        },
        'LZSTRING-UTF16': {
            compress:LZString.compressToUTF16, 
            decompress:LZString.decompressFromUTF16
        }
    }

    projectCompressor.compressProject = function (projectJSON, compressionRoutineName) {
        if(printFilesize) console.log("Compressing project of size " + projectJSON.length);

        var compressionRoutine = compressionRoutines[compressionRoutineName];
        var compressedProjectJSON = compressionRoutineName+compressionRoutine.compress(projectJSON)

        if(printFilesize) console.log("Done! Result size " + compressedProjectJSON.length);
        return compressedProjectJSON;
    }

    projectCompressor.decompressProject = function (compressedProjectJSON) {
        if(printFilesize) console.log("Decompressing project...")

        var projectJSON = compressedProjectJSON;

        for (var compressionRoutineName in compressionRoutines) {
            if(compressedProjectJSON.startsWith(compressionRoutineName)) {
                console.log("Project compressed with " + compressionRoutineName)
                var compressionRoutine = compressionRoutines[compressionRoutineName];
                var rawCompressedProjectJSON = compressedProjectJSON.substring(compressionRoutineName.length, compressedProjectJSON.length);
                projectJSON = compressionRoutine.decompress(rawCompressedProjectJSON);
            }
        }

        if(printFilesize) console.log("Done!");
        return projectJSON;
    }

    return projectCompressor;

})();