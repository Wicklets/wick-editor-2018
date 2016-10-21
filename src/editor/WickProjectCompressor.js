/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/*WickProject.compressionRoutine = function (string) {
    return LZString.compressToBase64(string);
}
WickProject.decompressionRoutine = function (string) {
    return LZString.decompressFromBase64(string);
}*/

/*if(rawJSONProject.startsWith('COMPRESSION:LZ-STRING')) {
    console.log("Project compressed with lz-string, decompressing...")
    var compressedJSONProject = rawJSONProject.substring('COMPRESSION:LZ-STRING'.length, rawJSONProject.length);
    JSONString = WickProject.decompressionRoutine(compressedJSONProject);
    console.log("Done!")
}*/

var WickProjectCompressor = (function () {

    var projectCompressor = { };

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
        console.log("Compressing project of size " + projectJSON.length);

        var compressionRoutine = compressionRoutines[compressionRoutineName];
        var compressedProjectJSON = compressionRoutineName+compressionRoutine.compress(projectJSON)

        console.log("Done! Result size " + compressedProjectJSON.length);
        return compressedProjectJSON;
    }

    projectCompressor.decompressProject = function (compressedProjectJSON) {
        console.log("Decompressing project...")

        var projectJSON = compressedProjectJSON;

        for (var compressionRoutineName in compressionRoutines) {
            if(compressedProjectJSON.startsWith(compressionRoutineName)) {
                console.log("Project compressed with " + compressionRoutineName)
                var compressionRoutine = compressionRoutines[compressionRoutineName];
                var rawCompressedProjectJSON = compressedProjectJSON.substring(compressionRoutineName.length, compressedProjectJSON.length);
                projectJSON = compressionRoutine.decompress(rawCompressedProjectJSON);
            }
        }

        console.log("Done!");
        return projectJSON;
    }

    return projectCompressor;

})();