/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var MenuBarInterface = function (wickEditor) {

    this.syncWithEditorState = function () {
        
    }

// Common buttons

    document.getElementById('settingsButton').onclick = function (e) {
        wickEditor.interfaces["settings"].open = true;
        wickEditor.syncInterfaces();
    }

    // This button can be replaced by backend plugins, so make sure it exists
    if(document.getElementById('openProjectButton')) {
        document.getElementById('openProjectButton').onclick = function (e) {
            $('#importButton').click(); // This just opens the file dialog, file import is handled in InputHandler.js
        }
    }

    // This button can be replaced by backend plugins, so make sure it exists
    if(document.getElementById('exportHTMLButton')) {
        document.getElementById('exportHTMLButton').onclick = function (e) {
            WickProjectExporter.exportProject(wickEditor.project);
        }
    }

    document.getElementById('runButton').onclick = function (e) {
        wickEditor.interfaces["builtinplayer"].runProject();
    }

}