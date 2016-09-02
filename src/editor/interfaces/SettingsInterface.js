/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var SettingsInterface = function (wickEditor) {

    var that = this;

    this.open = false;

    this.syncWithEditorState = function () {
        if(this.open) {
            document.getElementById("settingsGUI").style.display = "block";

            document.getElementById('projectBgColor').value        = wickEditor.project.backgroundColor;
            document.getElementById('projectSizeX').value          = wickEditor.project.resolution.x;
            document.getElementById('projectSizeY').value          = wickEditor.project.resolution.y;
            document.getElementById('frameRate').value             = wickEditor.project.framerate;
            document.getElementById('fitScreenCheckbox').checked   = wickEditor.project.fitScreen;
        } else {
            document.getElementById("settingsGUI").style.display = "none";
        }
    }

// Center settings window on resize

    this.resize = function () {
        var settingsWidth = parseInt($("#settingsGUI").css("width"));
        $("#settingsGUI").css('left', (window.innerWidth/2 - settingsWidth/2)+'px');

        var settingsHeight = parseInt($("#settingsGUI").css("height"));
        $("#settingsGUI").css('top', (window.innerHeight/2 - settingsHeight/2)+'px');
    }

    window.addEventListener('resize', function(e) {
        that.resize();
    });
    this.resize();

// Bind GUI elements to vars in project

    $('#projectSizeX').on('input propertychange', function () {

        CheckInput.callIfPositiveInteger($('#projectSizeX').val(), function(n) {
            wickEditor.project.resolution.x = n;
            wickEditor.syncInterfaces();
        });

    });

    $('#projectSizeY').on('input propertychange', function () {

        CheckInput.callIfPositiveInteger($('#projectSizeY').val(), function(n) {
            wickEditor.project.resolution.y = n;
            wickEditor.syncInterfaces();
        });

    });

    $('#frameRate').on('input propertychange', function () {

        CheckInput.callIfPositiveInteger($('#frameRate').val(), function(n) {
            wickEditor.project.framerate = n;
        });

    });

    $('#frameIdentifier').on('input propertychange', function () {

        CheckInput.callIfString($('#frameIdentifier').val(), function(frameID) {
            wickEditor.project.getCurrentObject().getCurrentFrame().identifier = frameID;
        });

    });

    document.getElementById('fitScreenCheckbox').onclick = function (e) {
        wickEditor.project.fitScreen = this.checked;
    }

    document.getElementById('projectBgColor').onchange = function () {
        wickEditor.project.backgroundColor = this.value;
        wickEditor.syncInterfaces();
    };

// Advanced options buttons

    document.getElementById('exportProjectAsJSONButton').onclick = function (e) {
        WickProjectExporter.exportProject(wickEditor.project);
    }

    document.getElementById('saveProjectToLocalStorageButton').onclick = function (e) {
        wickEditor.project.saveInLocalStorage();
    }

// Close button

    document.getElementById('closeSettingsWindowButton').onclick = function (e) {
        that.open = false;
        that.syncWithEditorState();
    }

}