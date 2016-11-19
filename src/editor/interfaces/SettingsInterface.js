/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var SettingsInterface = function (wickEditor) {

    var that = this;

    this.setup = function () {
        this.open = false;
    }
    

    this.syncWithEditorState = function () {
        if(this.open) {
            this.resize();

            document.getElementById("settingsGUI").style.display = "block";
            
            var projectBgColorElem = document.getElementById('projectBgColor');
            var projectBorderColorElem = document.getElementById('projectBorderColor');
            if(projectBgColorElem.jscolor) projectBgColorElem.jscolor.fromString(wickEditor.project.backgroundColor);
            if(projectBorderColorElem.jscolor) projectBorderColorElem.jscolor.fromString(wickEditor.project.borderColor);

            document.getElementById('projectSizeX').value          = wickEditor.project.resolution.x;
            document.getElementById('projectSizeY').value          = wickEditor.project.resolution.y;
            document.getElementById('frameRate').value             = wickEditor.project.framerate;
            document.getElementById('fitScreenCheckbox').checked   = wickEditor.project.fitScreen;
            document.getElementById('projectName').value           = wickEditor.project.name;
        } else {
            document.getElementById("settingsGUI").style.display = "none";
        }
    }

// Center settings window on resize

    this.resize = function () {
        if(!this.open) return;

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

    $('#projectName').on('input propertychange', function () {
        var newName = $('#projectName').val();
        if(newName === '') {
            wickEditor.project.name = undefined;
        } else {
            wickEditor.project.name = newName;
        }
    });

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

    document.getElementById('fitScreenCheckbox').onclick = function (e) {
        wickEditor.project.fitScreen = this.checked;
    }

    document.getElementById('projectBgColor').onchange = function () {
        wickEditor.project.backgroundColor = "#" + this.value;
        wickEditor.syncInterfaces();
    };

    document.getElementById('projectBorderColor').onchange = function () {
        wickEditor.project.borderColor = "#" + this.value;
        wickEditor.syncInterfaces();
    };

// Close button

    document.getElementById('closeSettingsWindowButton').onclick = function (e) {
        that.open = false;
        that.syncWithEditorState();
    }

}