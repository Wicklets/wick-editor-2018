/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var BuiltinPlayerInterface = function (wickEditor) {

    this.syncWithEditorState = function () {
        if(wickEditor.runningBuiltinPlayer) {
            showBuiltinPlayer();
        } else {
            hideBuiltinPlayer();
        }
    }

    $("#closeBuiltinPlayerButton").on("click", function (e) {
        hideBuiltinPlayer();
        wickEditor.runningBuiltinPlayer = false;
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

    this.runProject = function () {
        if(wickEditor.interfaces['scriptingide'].projectHasErrors) {
            if(!confirm("There are syntax errors in the code of this project! Are you sure you want to run it?")) {
                return;
            }
        }

        // JSONify the project, autosave, and have the builtin player run it
        wickEditor.project.getAsJSON(function (JSONProject) {
            wickEditor.runningProject = true;
            WickPlayer.runningBuiltinPlayer(JSONProject);
            wickEditor.syncInterfaces();
        });
    }

}