/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var BuiltinPlayerInterface = function (wickEditor) {

    var that = this;

    this.running = false;

    this.syncWithEditorState = function () {
        if(this.running) {
            showBuiltinPlayer();
        } else {
            hideBuiltinPlayer();
        }
    }

    this.runProject = function () {
        if(wickEditor.interfaces['scriptingide'].projectHasErrors) {
            if(!confirm("There are syntax errors in the code of this project! Are you sure you want to run it?")) {
                return;
            }
        }

        // Autosave the project
        wickEditor.project.saveInLocalStorage();

        // JSONify the project, autosave, and have the builtin player run it
        wickEditor.project.getAsJSON(function (JSONProject) {
            that.running = true;
            WickPlayer.runProject(JSONProject);
            wickEditor.syncInterfaces();
        });
    }

    this.stopRunningProject = function () {
        hideBuiltinPlayer();
        that.running = false;
        WickPlayer.stopRunningCurrentProject();
    }

// Internal utils

    var showBuiltinPlayer = function () {
        document.getElementById("editor").style.display = "none";
        document.getElementById("builtinPlayer").style.display = "block";
    }

    var hideBuiltinPlayer = function () {
        document.getElementById("builtinPlayer").style.display = "none";
        document.getElementById("editor").style.display = "block";
    }

// Button events

    $("#closeBuiltinPlayerButton").on("click", function (e) {
        that.stopRunningProject();
    });

}