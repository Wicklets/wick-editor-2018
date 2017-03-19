/* Wick - (c) 2017 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/*  This file is part of Wick. 
    
    Wick is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Wick is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Wick.  If not, see <http://www.gnu.org/licenses/>. */
    
var PropertiesInterface = function (wickEditor) {

    var currentTab = 'selection'

    this.setup = function () {
        document.getElementById('selectionPropertiesTabButton').onclick = function () {
            currentTab = 'selection';
            wickEditor.syncInterfaces();
        };
        document.getElementById('projectPropertiesTabButton').onclick = function () {
            currentTab = 'project';
            wickEditor.syncInterfaces();
        };
    }   

    this.syncWithEditorState = function () {
        var roundToTenth = function (number) {
            return (Math.round(number * 100) / 100);
        }

        $("#frameProperties").css('display', 'none');
        $("#playrangeProperties").css('display', 'none');
        $("#objectProperties").css('display', 'none');
        $("#projectProperties").css('display', 'none');

        document.getElementById('selectionPropertiesTabButton').className = 'propertiesTab';
        document.getElementById('projectPropertiesTabButton').className = 'propertiesTab';
        document.getElementById(currentTab + 'PropertiesTabButton').className = 'propertiesTab propertiesTabActive';

        var objectTypeIcon = document.getElementById('objectTypeIcon');
        var objectTypeName = document.getElementById('objectTypeName');

        if(currentTab === 'selection') {
            var selectedObj = wickEditor.project.getSelectedObject();

            if(selectedObj) {
                document.getElementById('objectType').style.display = 'block';

                // Display Object properties tab
                $("#objectProperties").css('display', 'none');
                $("#textProperties").css('display', 'none');
                $("#soundProperties").css('display', 'none');
                $("#symbolProperties").css('display', 'none');
                $("#tweenProperties").css('display', 'none');

                // Set object properties GUI name 
                if(selectedObj.name) {
                    document.getElementById('objectName').value = selectedObj.name;
                } else {
                    document.getElementById('objectName').value = '';
                }
                
                // Set object properties GUI position/rotation
                document.getElementById('objectPositionX').value = roundToTenth(selectedObj.x)
                document.getElementById('objectPositionY').value = roundToTenth(selectedObj.y)
                document.getElementById('objectWidth')    .value = roundToTenth(selectedObj.width * selectedObj.scaleX)
                document.getElementById('objectHeight')   .value = roundToTenth(selectedObj.height * selectedObj.scaleY)
                document.getElementById('objectRotation') .value = roundToTenth(selectedObj.rotation)
                document.getElementById('opacitySlider')  .value = roundToTenth(selectedObj.opacity*255)

                if(selectedObj instanceof WickObject) {
                    $("#objectProperties").css('display', 'block');

                    if(selectedObj.isSymbol) {

                        $("#symbolProperties").css('display', 'block');

                        objectTypeIcon.src = 'resources/gearbox.png';
                        objectTypeName.innerHTML = 'Symbol';
                    
                    } else if(selectedObj.fontData) {
                    
                        $("#textProperties").css('display', 'block');

                        document.getElementById('boldCheckbox').checked = selectedObj.fontData.fontWeight === "bold";
                        document.getElementById('italicCheckbox').checked = selectedObj.fontData.fontStyle === "italic";
                        document.getElementById('fontSize').value = Math.floor(selectedObj.fontData.fontSize);
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
                    
                    } else if (selectedObj.pathData) {
                    
                        objectTypeIcon.src = 'resources/path.png';
                        objectTypeName.innerHTML = 'Path';
                    
                    }

                    var tween =selectedObj.getFromTween()
                    if(tween) {
                        $("#tweenProperties").css('display', 'block');
                        $("#tweenType").val(tween.tweenType);
                        $("#tweenDir").val(tween.tweenDir);
                    }

                } else if (selectedObj instanceof WickFrame) {

                    objectTypeIcon.src = 'resources/gearbox.png';
                    objectTypeName.innerHTML = 'Frame';

                    $("#frameProperties").css('display', 'block');
                    document.getElementById('frameIdentifier').value = (selectedObj.identifier) ? selectedObj.identifier : "";
                    $('#frameIdentifier').prop('disabled', false);

                    document.getElementById('frameSaveStateCheckbox').checked = selectedObj.alwaysSaveState;

                } else if (selectedObj instanceof WickPlayRange) {

                    objectTypeIcon.src = 'resources/gearbox.png';
                    objectTypeName.innerHTML = 'PlayRange';

                    $("#playrangeProperties").css('display', 'block');
                    document.getElementById('playrangeIdentifier').value = (selectedObj.identifier) ? selectedObj.identifier : "";
                    $('#playrangeIdentifier').prop('disabled', false);

                }

            } else {
                
                document.getElementById('objectType').style.display = 'none';

            }

        } else if(currentTab === 'project') {

            document.getElementById('objectType').style.display = 'block';
            objectTypeIcon.src = 'resources/gearbox.png';
            objectTypeName.innerHTML = 'Project';

            $("#projectProperties").css('display', 'block');

            var projectBgColorElem = document.getElementById('projectBgColor');
            var projectBorderColorElem = document.getElementById('projectBorderColor');
            if(projectBgColorElem.jscolor) projectBgColorElem.jscolor.fromString(wickEditor.project.backgroundColor);
            if(projectBorderColorElem.jscolor) projectBorderColorElem.jscolor.fromString(wickEditor.project.borderColor);

            document.getElementById('transparentCheckbox').checked = wickEditor.project.transparent;
            document.getElementById('pixelPerfectRenderingCheckbox').checked = wickEditor.project.pixelPerfectRendering;

            document.getElementById('projectSizeX').value          = wickEditor.project.width;
            document.getElementById('projectSizeY').value          = wickEditor.project.height;
            document.getElementById('framerate').value             = wickEditor.project.framerate;
            document.getElementById('projectName').value           = wickEditor.project.name;

            document.getElementById("onionSkinningCheckbox").checked = wickEditor.project.onionSkinning;

        }
    }

    this.setTab = function (newTab) {
        currentTab = newTab;
    }

// Buttons and text boxes and stuff

    $('#objectName').on('blur', function () {
        var newName = $('#objectName').val();
        if(newName === '') {
            wickEditor.fabric.getSelectedObject(WickObject).name = undefined;
        } else {
            wickEditor.fabric.getSelectedObject(WickObject).name = newName;
        }
    });

    $('#objectPositionX').on('blur', function () {

        var newVal = parseFloat($('#objectPositionX').val())

        if(!isNaN(newVal)) {
            var obj = wickEditor.fabric.getSelectedObject();
            wickEditor.actionHandler.doAction('modifyObjects', { 
                objs: [obj], 
                modifiedStates: [{ 
                    x : newVal
                }] 
            });
        }

    });

    $('#objectPositionY').on('blur', function () {

        var newVal = parseFloat($('#objectPositionY').val())
        
        if(!isNaN(newVal)) {
            var obj = wickEditor.fabric.getSelectedObject();
            wickEditor.actionHandler.doAction('modifyObjects', { 
                objs: [obj], 
                modifiedStates: [{ 
                    y : newVal
                }] 
            });
        }

    });

    $('#objectWidth').on('blur', function () {

        var obj = wickEditor.fabric.getSelectedObject();
        var newVal = parseFloat($('#objectWidth').val() / obj.width)

        if(!isNaN(newVal)) {
            var modifiedState = { 
                scaleX : newVal
            };
            wickEditor.actionHandler.doAction('modifyObjects', { 
                objs: [obj], 
                modifiedStates: [modifiedState] 
            });
        }

    });

    $('#objectHeight').on('blur', function () {

        var obj = wickEditor.fabric.getSelectedObject();
        var newVal = parseFloat($('#objectHeight').val() / obj.height)

        if(!isNaN(newVal)) {
            var obj = wickEditor.fabric.getSelectedObject();
            var modifiedState = { 
                scaleY : newVal
            };
            wickEditor.actionHandler.doAction('modifyObjects', { 
                objs: [obj], 
                modifiedStates: [modifiedState] 
            });
        }

    });

    $('#objectRotation').on('blur', function () {

        var newVal = parseFloat($('#objectRotation').val())

        if(!isNaN(newVal)) {
            var obj = wickEditor.fabric.getSelectedObject();
            var modifiedState = { 
                rotation : newVal
            };
            wickEditor.actionHandler.doAction('modifyObjects', { 
                objs: [obj], 
                modifiedStates: [modifiedState] 
            });
        }

    });

    document.getElementById('opacitySlider').onchange = function () {
        wickEditor.actionHandler.doAction('modifyObjects', { 
            objs: [wickEditor.fabric.getSelectedObject()], 
            modifiedStates: [{ opacity : this.value/255 }] 
        });
    };

    document.getElementById('fontSelector').onchange = function () {
        wickEditor.fabric.forceModifySelectedObjects();
        wickEditor.actionHandler.doAction('modifyObjects', { 
            objs: [wickEditor.fabric.getSelectedObject()], 
            modifiedStates: [{ fontFamily : document.getElementById('fontSelector').value }] 
        });
    }

    document.getElementById('fontColor').onchange = function () {
        wickEditor.fabric.forceModifySelectedObjects();
        wickEditor.actionHandler.doAction('modifyObjects', { 
            objs: [wickEditor.fabric.getSelectedObject()], 
            modifiedStates: [{ fill : "#"+this.value }] 
        });
    };

    $('#fontSize').on('blur', function () {

        if(CheckInput.isNumber($('#fontSize').val())) {
            var obj = wickEditor.fabric.getSelectedObject();
            var modifiedState = { 
                fontSize : parseInt($('#fontSize').val()) 
            };
            wickEditor.fabric.forceModifySelectedObjects();
            wickEditor.actionHandler.doAction('modifyObjects', { 
                objs: [obj], 
                modifiedStates: [modifiedState] 
            });
        }

    });
    document.getElementById('boldCheckbox').onchange = function () {
        var newWeight = this.checked ? "bold" : "normal";
        wickEditor.fabric.forceModifySelectedObjects();
        wickEditor.actionHandler.doAction('modifyObjects', { 
            objs: [wickEditor.fabric.getSelectedObject()], 
            modifiedStates: [{ fontWeight : newWeight }] 
        });
    };
    document.getElementById('italicCheckbox').onchange = function () {
        var newStyle = this.checked ? "italic" : "normal";
        wickEditor.fabric.forceModifySelectedObjects();
        wickEditor.actionHandler.doAction('modifyObjects', { 
            objs: [wickEditor.fabric.getSelectedObject()], 
            modifiedStates: [{ fontStyle : newStyle }] 
        });
    };

    $('#tweenType').change(function () {
        wickEditor.fabric.getSelectedObject().getFromTween().tweenType = this.value;
    });
    $('#tweenDir').change(function () {
        wickEditor.fabric.getSelectedObject().getFromTween().tweenDir = this.value;
    });

    // Loop Checkbox: Toggle sound loop
    document.getElementById('loopCheckbox').onchange = function () {
        wickEditor.fabric.getSelectedObject().loopSound = this.checked;
    };

    // Autoplay Checkbox: Toggle sound autoplay
    document.getElementById('autoplayCheckbox').onchange = function () {
        wickEditor.fabric.getSelectedObject().autoplaySound = this.checked;
    };

    $('#frameIdentifier').on('blur', function () {
        var selectedObj = wickEditor.project.getSelectedObject();

        var newName = $('#frameIdentifier').val();
        if(newName === '') {
            selectedObj.identifier = undefined;
        } else {
            selectedObj.identifier = newName;
        }

        wickEditor.project.currentObject.framesDirty = true;
        wickEditor.syncInterfaces();
    });

    $('#playrangeIdentifier').on('blur', function () {
        var selectedObj = wickEditor.project.getSelectedObject();

        var newName = $('#playrangeIdentifier').val();
        if(newName === '') {
            selectedObj.identifier = undefined;
        } else {
            selectedObj.identifier = newName;
        }

        wickEditor.project.currentObject.framesDirty = true;
        wickEditor.syncInterfaces();
    });

    $('#projectName').on('blur', function () {
        var newName = $('#projectName').val();
        if(newName === '') {
            wickEditor.project.name = undefined;
        } else {
            wickEditor.project.name = newName;
        }
    });

    $('#projectSizeX').on('blur', function () {

        if(CheckInput.isPositiveInteger($('#projectSizeX').val())) {
            wickEditor.project.width = parseInt($('#projectSizeX').val());
            wickEditor.syncInterfaces();
        };

    });

    $('#projectSizeY').on('blur', function () {

        if(CheckInput.isPositiveInteger($('#projectSizeY').val())) {
            wickEditor.project.height = parseInt($('#projectSizeY').val());
            wickEditor.syncInterfaces();
        }

    });

    $('#framerate').on('blur', function () {

        if(CheckInput.isPositiveInteger($('#framerate').val())) {
            wickEditor.project.framerate = parseInt($('#framerate').val());
        }

    });

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
    
    document.getElementById('playRangeColor').onchange = function () {
        var obj = wickEditor.project.getSelectedObject();
        if (obj && obj instanceof WickPlayRange) {
            obj.color = "#" + this.value;
            wickEditor.syncInterfaces();
        }
    }

    document.getElementById('transparentCheckbox').onchange = function () {
        wickEditor.project.transparent = this.checked;
    };
    document.getElementById('pixelPerfectRenderingCheckbox').onchange = function () {
        wickEditor.project.pixelPerfectRendering = this.checked;
    };

    /*document.getElementById('frameAutoplayCheckbox').onclick = function (e) {
        wickEditor.project.getCurrentFrame().autoplay = !this.checked;
        wickEditor.syncInterfaces();
    }*/
    document.getElementById('frameSaveStateCheckbox').onclick = function (e) {
        wickEditor.project.getCurrentFrame().alwaysSaveState = this.checked;
        wickEditor.syncInterfaces();
    }

}