/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var PropertiesInterface = function (wickEditor) {

    this.syncWithEditorState = function () {
        $("#projectProperties").css('display', 'none');
        $("#objectProperties").css('display', 'none');
        $("#textProperties").css('display', 'none');
        $("#soundProperties").css('display', 'none');
        $("#htmlSnippetProperties").css('display', 'none');

        var selectedObj = wickEditor.interfaces['fabric'].getSelectedWickObject();
        if(selectedObj) {
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

            if(selectedObj.fontData) {
                $("#textProperties").css('display', 'inline');
            } else if (selectedObj.audioData) {
                document.getElementById('loopCheckbox').checked = wickEditor.interfaces['fabric'].getSelectedWickObject().loopSound;
                document.getElementById('autoplayCheckbox').checked = wickEditor.interfaces['fabric'].getSelectedWickObject().autoplaySound;
                $("#soundProperties").css('display', 'inline');
            } else if (selectedObj.htmlData) {
                $("#htmlSnippetProperties").css('display', 'inline');
            } else {
                
            }
        } else {
            //Nothing selected, show project properties
            $("#projectProperties").css('display', 'inline');
        }
    }

// Buttons and text boxes and stuff

    $('#objectName').on('input propertychange', function () {
        var newName = $('#objectName').val();
        if(newName === '') {
            wickEditor.interfaces['fabric'].getSelectedWickObject().name = undefined;
        } else {
            wickEditor.interfaces['fabric'].getSelectedWickObject().name = newName;
        }
    });

    $('#objectPositionX').on('input propertychange', function () {

        if(CheckInput.isNumber($('#objectPositionX').val())) {
            var id = wickEditor.interfaces['fabric'].getSelectedObjectIDs()[0];
            var modifiedState = { x : n };
            wickEditor.actionHandler.doAction('modifyObjects', { ids: [id], modifiedStates: [modifiedState] });
        }

    });

    $('#objectPositionY').on('input propertychange', function () {

        if(CheckInput.isNumber($('#objectPositionY').val())) {
            var id = wickEditor.interfaces['fabric'].getSelectedObjectIDs()[0];
            var modifiedState = { y : n };
            wickEditor.actionHandler.doAction('modifyObjects', { ids: [id], modifiedStates: [modifiedState] });
        }

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

    // Loop Checkbox: Toggle sound loop
    document.getElementById('loopCheckbox').onchange = function () {
        wickEditor.interfaces['fabric'].getSelectedWickObject().loopSound = this.checked;
    };

    // Autoplay Checkbox: Toggle sound autoplay
    document.getElementById('autoplayCheckbox').onchange = function () {
        wickEditor.interfaces['fabric'].getSelectedWickObject().autoplaySound = this.checked;
    };

    $('#htmlTextBox').on('input propertychange', function () {
        wickEditor.interfaces['fabric'].getActiveObject().wickObject.htmlData = $('#htmlTextBox').val();
    });

}