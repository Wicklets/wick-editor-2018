/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var BuiltinPlayerInterface = function (wickEditor) {

    this.syncWithEditorState = function () {
        if(wickEditor.runningProject) {
            showBuiltinPlayer();
        } else {
            hideBuiltinPlayer();
        }
    }

    $("#closeBuiltinPlayerButton").on("click", function (e) {
        hideBuiltinPlayer();
        wickEditor.runningProject = false;
        WickPlayer.stopRunningCurrentProject();
    });

    var showBuiltinPlayer = function () {
        document.getElementById("editor").style.display = "none";
        document.getElementById("builtinPlayer").style.display = "block";
    }

    var hideBuiltinPlayer = function () {
        document.getElementById("builtinPlayer").style.display = "none";
        document.getElementById("editor").style.display = "block";
    }

}