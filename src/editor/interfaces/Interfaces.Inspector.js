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

var InspectorInterface = function (wickEditor) {

    var inputs;

    var selectionIcon;
    var selectionTitle;
    var inspectorTitle;

    var specialMode;

    this.selectionInfo = {
        objects: [],
        object: null,
        numObjects: 0,
        type: null,
        dataType: null,
        special: {},
    }
    var selectionInfo = this.selectionInfo;

    this.setup = function () {
        selectionTitleBar = document.getElementById('inspector-title-bar');
        selectionIcon = document.getElementsByClassName('inspector-selection-icon')[0];
        selectionTitle = document.getElementsByClassName('inspector-selection-title')[0];
        inspectorTitle = document.getElementById('inspector-title');

        allItemsContainer = document.getElementsByClassName('inspector-allitems-container')[0];
        propertiesContainer = document.getElementsByClassName('inspector-properties-container')[0];
        buttonsContainer = document.getElementsByClassName('inspector-buttons-container')[0];

        specialMode = 'project';

        inputs = InspectorInterface.getProperties(wickEditor, this);
        inputs.forEach(function (input) {
            if(input.getPropertyDiv) {
                propertiesContainer.appendChild(input.getPropertyDiv());
            }
            if(input.getButtonDiv) {
                buttonsContainer.appendChild(input.getButtonDiv());
            }
        });
    }

    this.syncWithEditorState = function () {

        inputs.forEach(function (input) {
            if(input.isFocused && input.isFocused()) {
                $('.inspector-input').blur()
                input.updateModelValue();
            }
        });

        // Recalc selection vars
        selectionInfo.numObjects = wickEditor.project.getNumSelectedObjects();
        selectionInfo.objects = wickEditor.project.getSelectedObjects();
        selectionInfo.object = wickEditor.project.getSelectedObject();
        selectionInfo.uuids = wickEditor.project.getSelectedObjectsUUIDs();
        selectionInfo.dataType = null;
        selectionInfo.special = {};

        // Show current frame if nothing is selected
        if(selectionInfo.numObjects === 0) {
            selectionInfo.object = wickEditor.project.getCurrentFrame();
            if(!selectionInfo.object) {
                selectionInfo.numObjects = 0;
            } else {
                selectionInfo.numObjects = 1;
            }
        }

        if(specialMode) {
            selectionInfo.type = specialMode;
            selectionInfo.dataType = null;
        } else if(selectionInfo.object) {
            if(selectionInfo.object.isImage) {
                selectionInfo.type = 'wickobject';
                selectionInfo.dataType = 'image';
            } else if (selectionInfo.object.isPath) {
                selectionInfo.type = 'wickobject';
                selectionInfo.dataType = 'path';
            } else if (selectionInfo.object.isText) {
                selectionInfo.type = 'wickobject';
                selectionInfo.dataType = 'text';
            } else if (selectionInfo.object.isSymbol) {
                selectionInfo.type = 'wickobject';
                selectionInfo.dataType = 'symbol';
            } else if (selectionInfo.object instanceof WickFrame) {
                selectionInfo.type = 'frame';
                selectionInfo.dataType = 'frame';
            }
        } else {
            if(selectionInfo.numObjects === 0) {
                selectionInfo.type = 'none';
                selectionInfo.dataType = null;
            } else {
                if(selectionInfo.objects[0] instanceof WickObject) {
                    selectionInfo.type = 'wickobject'
                } else if(selectionInfo.objects[0] instanceof WickFrame) {
                    selectionInfo.type = 'frame'
                    selectionInfo.dataType = 'frame';
                }

                // Check for special selection cases
                selectionInfo.special.allPaths = true;
                selectionInfo.objects.forEach(function (object) {
                    if(!object.isPath) {
                        selectionInfo.special.allPaths = false;
                    }
                })
            }
        }

        updateSelectonTypeTitle();

        // Update values in view
        inputs.forEach(function (input) {
            input.updateViewValue();
        });
    }

    this.clearSpecialMode = function () {
        specialMode = undefined;
    }

    this.toggleProjectSettings = function () {
        if(specialMode === 'project') {
            specialMode = null;
        } else {
            specialMode = 'project';
        }
    }

    this.openProjectSettings = function () {
        specialMode = 'project';
    }

    this.openToolSettings = function (tool) {
        specialMode = tool;
    }

    this.getButtons = function () {
        var buttons = [];
        inputs.forEach(function (input) {
            if(input instanceof InspectorInterface.InspectorButton) {
                buttons.push(input);
            }
        });
        return buttons;
    }

    var updateSelectonTypeTitle = function () {

        var noSelectionTitle = "Inspector";
        var title; 
        var image;

        if(selectionInfo.type === 'project') {

            title = "Project Settings"
            image = "./resources/settings.png";

        } else if(selectionInfo.type === 'paintbrush') {

            title = "Brush Options"
            image = "./resources/tools/Paintbrush.svg";

        } else if(selectionInfo.type === 'pencil') {

            title = "Pencil Options"
            image = "./resources/tools/Pencil.svg";

        } else if(selectionInfo.type === 'fillbucket') {

            title = "Fill Options"
            image = "./resources/tools/Bucket.svg";

        } else if(selectionInfo.type === 'eraser') {

            title = "Eraser Options"
            image = "./resources/tools/Erase.svg";

        } else if(selectionInfo.type === 'rectangle') {

            title = "<p style='font-size:18px;'>Rectangle Options</p>"
            image = "./resources/tools/Square.svg";

        } else if(selectionInfo.type === 'ellipse') {

            title = "Ellipse Options"
            image = "./resources/tools/Circle.svg";

        } else if(selectionInfo.type === 'pen') {

            title = "Pen Options"
            image = "./resources/tools/Path.svg";

        } else if(selectionInfo.type === 'line') {

            title = "Line Options"
            image = "./resources/tools/Line.svg";

        } else if(selectionInfo.type === 'none') {

            noSelectionTitle = "Inspector (No Selection)"
            title = ""
            image = null;

        } else if(selectionInfo.numObjects > 1) {

            if(selectionInfo.type === 'wickobject') {
                title = "<p style='font-size:18px;'>Multiple Objects</p>"
                image = './resources/inspector-icons/multipleobjects.svg';
            } else if (selectionInfo.type === 'frame') {
                title = "Multiple Frames"
                image = "./resources/inspector-edit-timeline.svg"
            }

        } else if(selectionInfo.type === 'wickobject') {

            if(selectionInfo.dataType === 'symbol' && selectionInfo.object.isButton) {
                title = "Button"; 
                image = "./resources/inspector-button.svg"
            } else if(selectionInfo.dataType === 'symbol' && selectionInfo.object.isGroup) {
                title = "Group"; 
                image = "./resources/group.svg"
            } else if(selectionInfo.dataType === 'symbol' && !selectionInfo.object.isButton) {
                title = "Clip"; 
                image = "./resources/inspector-edit-timeline.svg"
            } else if (selectionInfo.dataType === 'path') {
                title = "Path";
                image = "./resources/tools/Path.svg"
            } else if (selectionInfo.dataType === 'image') {
                title = "Image"; 
                image = "./resources/image.png"
            } else if (selectionInfo.dataType === 'text') {
                title = "Text"; 
                image = "./resources/text.png"
            } else if (selectionInfo.dataType === 'sound') {
                title = "Sound";
                image = "./resources/icon_sound_white.png"; 
            }

        } else if (selectionInfo.type === 'frame') {
            title = "Frame";  
            image = "./resources/inspector-edit-timeline.svg"
        }

        selectionTitle.innerHTML = title;
        inspectorTitle.innerHTML = noSelectionTitle;
        if(image)
            selectionIcon.style.backgroundImage = 'url('+image+')';
        else
            selectionIcon.style.backgroundImage = 'none';

    }

}