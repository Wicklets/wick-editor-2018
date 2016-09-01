/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var MenuBarInterface = function (wickEditor) {

    this.syncWithEditorState = function () {
        document.getElementById("backToClubhouseButton").style.display = "none";
        document.getElementById("githubClubhouseButton").style.display = "none";
        document.getElementById("openProjectButton").style.display = "none";
        document.getElementById("exportHTMLButton").style.display = "none";

        if(wickEditor.mode === "normal") {
            document.getElementById("openProjectButton").style.display = "block";
            document.getElementById("exportHTMLButton").style.display = "block";
        } else if (wickEditor.mode === "github-clubhouse") {
            document.getElementById("backToClubhouseButton").style.display = "block";
            document.getElementById("githubClubhouseButton").style.display = "block";
        }
    }

    /*document.getElementById('newProjectButton').onclick = function (e) {
        if(!confirm("Create a new project? All unsaved changes to the current project will be lost!")) {
            return;
        }

        wickEditor.project = new WickProject();
        wickEditor.syncInterfaces();
    }*/

    /*document.getElementById('exportJSONButton').onclick = function (e) {
        wickEditor.project.getAsJSON(function(JSONProject) {
            var blob = new Blob([JSONProject], {type: "text/plain;charset=utf-8"});
            saveAs(blob, "project.json");
        });
    }*/

    document.getElementById('settingsButton').onclick = function (e) {
        wickEditor.interfaces["settings"].open = true;
        wickEditor.syncInterfaces();
    }

    document.getElementById('backToClubhouseButton').onclick = function (e) {
        alert("NYI")
    }

    document.getElementById('openProjectButton').onclick = function (e) {
        $('#importButton').click(); // This just opens the file dialog, file import is handled in InputHandler.js
    }

    document.getElementById('exportHTMLButton').onclick = function (e) {
        WickProjectExporter.exportProject(wickEditor.project);
    }

    document.getElementById('runButton').onclick = function (e) {
        wickEditor.interfaces["builtinplayer"].runProject();
    }

}