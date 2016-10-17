/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var PropertiesInterface = function (wickEditor) {

    this.syncWithEditorState = function () {
        $("#projectProperties").css('display', 'none');
        $("#objectProperties").css('display', 'none');
        $("#textProperties").css('display', 'none');
        $("#soundProperties").css('display', 'none');

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
            
            // Set object properties GUI position/rotation
            document.getElementById('objectPositionX').value = Math.round(selectedObj.x);
            document.getElementById('objectPositionY').value = Math.round(selectedObj.y);
            document.getElementById('objectWidth')    .value = Math.round(selectedObj.width * selectedObj.scaleX);
            document.getElementById('objectHeight')   .value = Math.round(selectedObj.height * selectedObj.scaleY);
            document.getElementById('objectRotation') .value = Math.round(selectedObj.angle);

            if(selectedObj.fontData) {
                $("#textProperties").css('display', 'inline');
            } else if (selectedObj.audioData) {
                $("#soundProperties").css('display', 'inline');
                document.getElementById('loopCheckbox').checked = wickEditor.interfaces['fabric'].getSelectedWickObject().loopSound;
                document.getElementById('autoplayCheckbox').checked = wickEditor.interfaces['fabric'].getSelectedWickObject().autoplaySound;
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
            var modifiedState = { x : parseInt($('#objectPositionX').val()) };
            wickEditor.actionHandler.doAction('modifyObjects', { ids: [id], modifiedStates: [modifiedState] });
        }

    });

    $('#objectPositionY').on('input propertychange', function () {

        if(CheckInput.isNumber($('#objectPositionY').val())) {
            var id = wickEditor.interfaces['fabric'].getSelectedObjectIDs()[0];
            var modifiedState = { y : parseInt($('#objectPositionY').val()) };
            wickEditor.actionHandler.doAction('modifyObjects', { ids: [id], modifiedStates: [modifiedState] });
        }

    });

    $('#objectWidth').on('input propertychange', function () {

        if(CheckInput.isNumber($('#objectWidth').val())) {
            var id = wickEditor.interfaces['fabric'].getSelectedObjectIDs()[0];
            var obj = wickEditor.project.rootObject.getChildByID(id);
            var modifiedState = { scaleX : parseInt($('#objectWidth').val()) / obj.width };
            wickEditor.actionHandler.doAction('modifyObjects', { ids: [id], modifiedStates: [modifiedState] });
        }

    });

    $('#objectHeight').on('input propertychange', function () {

        if(CheckInput.isNumber($('#objectHeight').val())) {
            var id = wickEditor.interfaces['fabric'].getSelectedObjectIDs()[0];
            var obj = wickEditor.project.rootObject.getChildByID(id);
            var modifiedState = { scaleY : parseInt($('#objectHeight').val()) / obj.height };
            wickEditor.actionHandler.doAction('modifyObjects', { ids: [id], modifiedStates: [modifiedState] });
        }

    });

    $('#objectRotation').on('input propertychange', function () {

        if(CheckInput.isNumber($('#objectRotation').val())) {
            var id = wickEditor.interfaces['fabric'].getSelectedObjectIDs()[0];
            var modifiedState = { angle : parseInt($('#objectRotation').val()) };
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

}