/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var PropertiesInterface = function (wickEditor) {

    var currentTab = 'object'

    this.setup = function () {
        document.getElementById('objectPropertiesTabButton').onclick = function () {
            currentTab = 'object';
            wickEditor.syncInterfaces();
        };
        document.getElementById('framePropertiesTabButton').onclick = function () {
            currentTab = 'frame';
            wickEditor.syncInterfaces();
        };
        document.getElementById('projectPropertiesTabButton').onclick = function () {
            currentTab = 'project';
            wickEditor.syncInterfaces();
        };
    }   

    this.syncWithEditorState = function () {
        $("#frameProperties").css('display', 'none');
        $("#objectProperties").css('display', 'none');
        $("#projectProperties").css('display', 'none');

        document.getElementById('objectPropertiesTabButton').className = 'propertiesTab';
        document.getElementById('framePropertiesTabButton').className = 'propertiesTab';
        document.getElementById('projectPropertiesTabButton').className = 'propertiesTab';
        document.getElementById(currentTab + 'PropertiesTabButton').className = 'propertiesTab propertiesTabActive';

        if(currentTab === 'object') {
            var selectedObj = wickEditor.interfaces['fabric'].getSelectedWickObject();
            if(selectedObj) {
                // Display Object properties tab
                $("#objectProperties").css('display', 'block');
                $("#textProperties").css('display', 'none');
                $("#soundProperties").css('display', 'none');

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
                document.getElementById('opacitySlider')  .value = selectedObj.opacity*255

                var objectTypeIcon = document.getElementById('objectTypeIcon');
                var objectTypeName = document.getElementById('objectTypeName');

                if(selectedObj.isSymbol) {

                    objectTypeIcon.src = 'resources/gearbox.png';
                    objectTypeName.innerHTML = 'Symbol';
                
                } else if(selectedObj.fontData) {
                
                    $("#textProperties").css('display', 'block');
                    document.getElementById('boldCheckbox').checked = selectedObj.fontData.fontWeight === "bold";
                    document.getElementById('italicCheckbox').checked = selectedObj.fontData.fontStyle === "italic";
                    document.getElementById('fontSize').value = selectedObj.fontData.fontSize;
                    //document.getElementById('underlinedCheckbox').checked = selectedObj.fontData.textDecoration === "underline";
                
                    objectTypeIcon.src = 'resources/text.png';
                    objectTypeName.innerHTML = 'Text';
                
                } else if (selectedObj.audioData) {
                
                    $("#soundProperties").css('display', 'block');
                    document.getElementById('loopCheckbox').checked = selectedObj.loopSound;
                    document.getElementById('autoplayCheckbox').checked = selectedObj.autoplaySound;
                
                    objectTypeIcon.src = 'resources/audioicon.png';
                    objectTypeName.innerHTML = 'Sound';
                
                } else if (selectedObj.imageData) {
                
                    objectTypeIcon.src = 'resources/image.png';
                    objectTypeName.innerHTML = 'Image';
                
                }
            } else {
                
                
            }
        } else if(currentTab === 'frame') {
            var currentObject = wickEditor.project.getCurrentObject();
            var currentFrame = currentObject.getCurrentFrame();
            if(!currentFrame) {
                $("#frameProperties").css('display', 'none');
                return;
            }

            $("#frameProperties").css('display', 'block');
            document.getElementById('frameIdentifier').value = (currentFrame.identifier) ? currentFrame.identifier : "";
            $('#frameIdentifier').prop('disabled', false);
        } else if(currentTab === 'project') {
            $("#projectProperties").css('display', 'block');

            var projectBgColorElem = document.getElementById('projectBgColor');
            var projectBorderColorElem = document.getElementById('projectBorderColor');
            if(projectBgColorElem.jscolor) projectBgColorElem.jscolor.fromString(wickEditor.project.backgroundColor);
            if(projectBorderColorElem.jscolor) projectBorderColorElem.jscolor.fromString(wickEditor.project.borderColor);

            document.getElementById('projectSizeX').value          = wickEditor.project.resolution.x;
            document.getElementById('projectSizeY').value          = wickEditor.project.resolution.y;
            document.getElementById('frameRate').value             = wickEditor.project.framerate;
            document.getElementById('projectName').value           = wickEditor.project.name;

            document.getElementById("onionSkinningCheckbox").checked = wickEditor.project.onionSkinning;
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
            modifiedStates: [{ fill : "#"+this.value }] 
        });
    };

    /*document.getElementById('fontSize').onchange = function () {
        wickEditor.actionHandler.doAction('modifyObjects', { 
            ids: [wickEditor.interfaces['fabric'].getSelectedObjectIDs()[0]], 
            modifiedStates: [{ fontSize : this.value }] 
        });
    };*/
    $('#fontSize').on('input propertychange', function () {

        if(CheckInput.isNumber($('#fontSize').val())) {
            var id = wickEditor.interfaces['fabric'].getSelectedObjectIDs()[0];
            var obj = wickEditor.project.rootObject.getChildByID(id);
            var modifiedState = { 
                fontSize : parseInt($('#fontSize').val()) 
            };
            wickEditor.actionHandler.doAction('modifyObjects', { 
                ids: [id], 
                modifiedStates: [modifiedState] 
            });
        }

    });

    // Loop Checkbox: Toggle sound loop
    document.getElementById('loopCheckbox').onchange = function () {
        wickEditor.interfaces['fabric'].getSelectedWickObject().loopSound = this.checked;
    };

    // Autoplay Checkbox: Toggle sound autoplay
    document.getElementById('autoplayCheckbox').onchange = function () {
        wickEditor.interfaces['fabric'].getSelectedWickObject().autoplaySound = this.checked;
    };

    document.getElementById('boldCheckbox').onchange = function () {
        wickEditor.actionHandler.doAction('modifyObjects', { 
            ids: [wickEditor.interfaces['fabric'].getSelectedObjectIDs()[0]], 
            modifiedStates: [{ fontWeight : (this.checked ? "bold" : "normal") }] 
        });
    };
    document.getElementById('italicCheckbox').onchange = function () {
        wickEditor.actionHandler.doAction('modifyObjects', { 
            ids: [wickEditor.interfaces['fabric'].getSelectedObjectIDs()[0]], 
            modifiedStates: [{ fontStyle : (this.checked ? "italic" : "normal") }] 
        });
    };
    /*document.getElementById('underlinedCheckbox').onchange = function () {
        wickEditor.actionHandler.doAction('modifyObjects', { 
            ids: [wickEditor.interfaces['fabric'].getSelectedObjectIDs()[0]], 
            modifiedStates: [{ textDecoration : (this.checked ? "underline" : "none") }] 
        });
    };*/

    $('#frameIdentifier').on('input propertychange', function () {
        var currentObject = wickEditor.project.getCurrentObject();
        var currentFrame = currentObject.getCurrentFrame();

        var newName = $('#frameIdentifier').val();
        if(newName === '') {
            currentFrame.identifier = undefined;
        } else {
            currentFrame.identifier = newName;
        }
    });

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

    document.getElementById('experimentalToolsCheckbox').onclick = function (e) {
        var self = this;
        ['paintbrush', 'fillbucket', 'rectangle', 'ellipse', 'dropper'].forEach(function (toolName) {
            document.getElementById(toolName+'ToolButton').style.display = self.checked ? 'block' : 'none';
        });
    }

    document.getElementById('onionSkinningCheckbox').onclick = function (e) {
        wickEditor.project.onionSkinning = this.checked;
        wickEditor.syncInterfaces();
    }

    document.getElementById('projectBgColor').onchange = function () {
        wickEditor.project.backgroundColor = "#" + this.value;
        wickEditor.syncInterfaces();
    };

    document.getElementById('projectBorderColor').onchange = function () {
        wickEditor.project.borderColor = "#" + this.value;
        wickEditor.syncInterfaces();
    };

}