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
        var roundToTenth = function (number) {
            return (Math.round(number * 100) / 100);
        }

        $("#frameProperties").css('display', 'none');
        $("#objectProperties").css('display', 'none');
        $("#projectProperties").css('display', 'none');

        document.getElementById('objectPropertiesTabButton').className = 'propertiesTab';
        document.getElementById('framePropertiesTabButton').className = 'propertiesTab';
        document.getElementById('projectPropertiesTabButton').className = 'propertiesTab';
        document.getElementById(currentTab + 'PropertiesTabButton').className = 'propertiesTab propertiesTabActive';

        if(currentTab === 'object') {
            var selectedObj = wickEditor.fabric.getSelectedObject(WickObject);
            if(selectedObj) {
                // Display Object properties tab
                $("#objectProperties").css('display', 'block');
                $("#textProperties").css('display', 'none');
                $("#soundProperties").css('display', 'none');
                $("#symbolProperties").css('display', 'none');

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

                var objectTypeIcon = document.getElementById('objectTypeIcon');
                var objectTypeName = document.getElementById('objectTypeName');

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

            } else {
                
                
            }
        } else if(currentTab === 'frame') {

            var currentObject = wickEditor.project.currentObject;
            var currentFrame = currentObject.getCurrentFrame();
            if(!currentFrame) {
                $("#frameProperties").css('display', 'none');
                return;
            }

            $("#frameProperties").css('display', 'block');
            document.getElementById('frameIdentifier').value = (currentFrame.identifier) ? currentFrame.identifier : "";
            $('#frameIdentifier').prop('disabled', false);

            document.getElementById('frameAutoplayCheckbox').checked = !currentFrame.autoplay;
            document.getElementById('frameSaveStateCheckbox').checked = currentFrame.alwaysSaveState;

        } else if(currentTab === 'project') {

            $("#projectProperties").css('display', 'block');

            var projectBgColorElem = document.getElementById('projectBgColor');
            var projectBorderColorElem = document.getElementById('projectBorderColor');
            if(projectBgColorElem.jscolor) projectBgColorElem.jscolor.fromString(wickEditor.project.backgroundColor);
            if(projectBorderColorElem.jscolor) projectBorderColorElem.jscolor.fromString(wickEditor.project.borderColor);

            document.getElementById('projectSizeX').value          = wickEditor.project.width;
            document.getElementById('projectSizeY').value          = wickEditor.project.height;
            document.getElementById('frameRate').value             = wickEditor.project.framerate;
            document.getElementById('projectName').value           = wickEditor.project.name;

            document.getElementById("onionSkinningCheckbox").checked = wickEditor.project.onionSkinning;

        }
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
        console.log(newVal)

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

    // Loop Checkbox: Toggle sound loop
    document.getElementById('loopCheckbox').onchange = function () {
        wickEditor.fabric.getSelectedObject().loopSound = this.checked;
    };

    // Autoplay Checkbox: Toggle sound autoplay
    document.getElementById('autoplayCheckbox').onchange = function () {
        wickEditor.fabric.getSelectedObject().autoplaySound = this.checked;
    };

    $('#frameIdentifier').on('blur', function () {
        var currentObject = wickEditor.project.currentObject;
        var currentFrame = currentObject.getCurrentFrame();

        var newName = $('#frameIdentifier').val();
        if(newName === '') {
            currentFrame.identifier = undefined;
        } else {
            currentFrame.identifier = newName;
        }
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

    $('#frameRate').on('blur', function () {

        if(CheckInput.isPositiveInteger($('#frameRate').val())) {
            wickEditor.project.framerate = parseInt($('#frameRate').val());
        }

    });

    var experimentalTools = [/*'text',*/ 'backgroundremove', 'dropper', /*'paintbrush',*/ 'eraser', 'fillbucket', 'rectangle', 'ellipse'];
    experimentalTools.forEach(function (toolName) {
        document.getElementById(toolName+'ToolButton').style.display = localStorage.pathDebug === "1" ? 'block' : 'none';
    });
    document.getElementById('experimentalToolsCheckbox').onclick = function (e) {
        var self = this;
        experimentalTools.forEach(function (toolName) {
            document.getElementById(toolName+'ToolButton').style.display = self.checked ? 'block' : 'none';
        });
        document.getElementById('experimentalWarning').style.display = self.checked ? 'block' : 'none';
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

    document.getElementById('frameAutoplayCheckbox').onclick = function (e) {
        wickEditor.project.currentObject.getCurrentFrame().autoplay = !this.checked;
        wickEditor.syncInterfaces();
    }
    document.getElementById('frameSaveStateCheckbox').onclick = function (e) {
        wickEditor.project.currentObject.getCurrentFrame().alwaysSaveState = this.checked;
        wickEditor.syncInterfaces();
    }

}