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

        if(CheckInput.isPositiveInteger($('#projectSizeX').val())) {
            wickEditor.project.resolution.x = parseInt($('#projectSizeX').val());
            wickEditor.syncInterfaces();
        };

    });

    $('#projectSizeY').on('input propertychange', function () {

        if(CheckInput.isPositiveInteger($('#projectSizeY').val())) {
            wickEditor.project.resolution.y = parseInt($('#projectSizeY').val());
            wickEditor.syncInterfaces();
        }

    });

    $('#frameRate').on('input propertychange', function () {

        if(CheckInput.isPositiveInteger($('#frameRate').val())) {
            wickEditor.project.framerate = parseInt($('#frameRate').val());
        }

    });

    $('#frameIdentifier').on('input propertychange', function () {

        if(CheckInput.isString($('#frameIdentifier').val())) {
            wickEditor.project.getCurrentObject().getCurrentFrame().identifier = parseInt($('#frameIdentifier').val());
        };

    });

    document.getElementById('fitScreenCheckbox').onclick = function (e) {
        wickEditor.project.fitScreen = this.checked;
    }

    document.getElementById('projectBgColor').onchange = function () {
        wickEditor.project.backgroundColor = this.value;
        wickEditor.syncInterfaces();
    };

// New project button

    document.getElementById('newProjectButton').onclick = function (e) {
        if(!confirm("Create a new project? All unsaved changes to the current project will be lost!")) {
            return;
        }
        wickEditor.project = new WickProject();
        wickEditor.syncInterfaces();
    }

// Advanced options buttons

    document.getElementById('exportProjectAsJSONButton').onclick = function (e) {
        wickEditor.project.getAsJSON(function(JSONProject) {
            var blob = new Blob([JSONProject], {type: "text/plain;charset=utf-8"});
            saveAs(blob, "project.json");
        });
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