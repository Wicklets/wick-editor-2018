/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var PropertiesInterface = function (wickEditor) {

    this.syncWithEditorState = function () {
        $("#projectProperties").css('display', 'none');
        $("#objectProperties").css('display', 'none');
        $("#textProperties").css('display', 'none');
        $("#soundProperties").css('display', 'none');
        $("#htmlSnippetProperties").css('display', 'none');

        var tab = 'project';

        var selectedObj = wickEditor.getSelectedWickObject();
        if(selectedObj) {
            if(selectedObj.fontData) {
                tab = 'text';
            } else if (selectedObj.audioData) {
                tab = 'sound';
            } else if (selectedObj.htmlData) {
                tab = 'htmlSnippet';
            } else {
                tab = 'symbol';
            }
        }

        switch(tab) {
            case 'project':
                document.getElementById('projectBgColor').value        = wickEditor.project.backgroundColor;
                document.getElementById('projectSizeX').value          = wickEditor.project.resolution.x;
                document.getElementById('projectSizeY').value          = wickEditor.project.resolution.y;
                document.getElementById('frameRate').value             = wickEditor.project.framerate;
                document.getElementById('fitScreenCheckbox').checked   = wickEditor.project.fitScreen;
                $("#projectProperties").css('display', 'inline');
                break;
            case 'symbol':
                updateObjectPropertiesGUI(selectedObj);
                break;
            case 'text':
                updateObjectPropertiesGUI(selectedObj);
                $("#textProperties").css('display', 'inline');
                break;
            case 'sound':
                updateObjectPropertiesGUI(selectedObj);
                $("#soundProperties").css('display', 'inline');
                break;
            case 'htmlSnippet':
                updateObjectPropertiesGUI(selectedObj);
                $("#htmlSnippetProperties").css('display', 'inline');
                break;
        }
    }

    // Lil' helper function because these properties must get updated for every type of object
    var updateObjectPropertiesGUI = function(selectedObj) {
        // Display Object properties tab
        $("#objectProperties").css('display', 'inline');

        // Set object properties GUI name 
        if(selectedObj.name) {
            document.getElementById('objectName').value = selectedObj.name;
        } else {
            document.getElementById('objectName').value = '';
        }
        
        // Set object properties GUI position
        document.getElementById('objectPositionX').value = selectedObj.x;
        document.getElementById('objectPositionY').value = selectedObj.y;
    };

// Buttons and text boxes and stuff

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
            wickEditor.currentObject.frames[wickEditor.currentObject.currentFrame].identifier = frameID;
        });

    });

    document.getElementById('fitScreenCheckbox').onclick = function (e) {
        wickEditor.project.fitScreen = this.checked;
    }

    document.getElementById('projectBgColor').onchange = function () {
        wickEditor.project.backgroundColor = this.value;
        wickEditor.syncInterfaces();
    };

    $('#objectName').on('input propertychange', function () {
        var newName = $('#objectName').val();
        if(newName === '') {
            wickEditor.fabricInterface.getActiveObject().wickObject.name = undefined;
        } else {
            wickEditor.fabricInterface.getActiveObject().wickObject.name = $('#objectName').val();
        }
    });

    $('#objectPositionX').on('input propertychange', function () {

        CheckInput.callIfNumber($('#objectPositionX').val(), function(n) {
            var id = wickEditor.interfaces['fabric'].getSelectedObjectIDs()[0];
            var modifiedState = { x : n };
            wickEditor.actionHandler.doAction('modifyObjects', { ids: [id], modifiedStates: [modifiedState] });
        });

    });

    $('#objectPositionY').on('input propertychange', function () {

        CheckInput.callIfNumber($('#objectPositionY').val(), function(n) {
            var id = wickEditor.interfaces['fabric'].getSelectedObjectIDs()[0];
            var modifiedState = { y : n };
            wickEditor.actionHandler.doAction('modifyObjects', { ids: [id], modifiedStates: [modifiedState] });
        });

    });

    document.getElementById('opacitySlider').onchange = function () {
        wickEditor.actionHandler.doAction('modifyObjects', { 
            ids: [wickEditor.interfaces['fabric'].getSelectedObjectIDs()[0]], 
            modifiedStates: [{ opacity : this.value/255 }] 
        });
    };

    document.getElementById('fontSelector').onchange = function () {
        wickEditor.actionHandler.doAction('modifyObjects', { 
            ids: [wickEditor.interfaces['fabric'].getSelectedObjectIDs()[0]], 
            modifiedStates: [{ fontFamily : document.getElementById('fontSelector').value }] 
        });
    }

    document.getElementById('fontColor').onchange = function () {
        wickEditor.actionHandler.doAction('modifyObjects', { 
            ids: [wickEditor.interfaces['fabric'].getSelectedObjectIDs()[0]], 
            modifiedStates: [{ fill : this.value }] 
        });
    };

    document.getElementById('fontSize').onchange = function () {
        wickEditor.actionHandler.doAction('modifyObjects', { 
            ids: [wickEditor.interfaces['fabric'].getSelectedObjectIDs()[0]], 
            modifiedStates: [{ fontSize : this.value }] 
        });
    };

    $('#htmlTextBox').on('input propertychange', function () {
        wickEditor.interfaces['fabric'].getActiveObject().wickObject.htmlData = $('#htmlTextBox').val();
    });

}