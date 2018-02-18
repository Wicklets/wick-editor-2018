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

var ToolbarInterface = function (wickEditor) {

    var toolbarDiv;

    var container;
    var toolOptionInputs;

    var colorPickerDivs = [];

    var brushSizePreview;
    var cornerRadiusPreview;

    this.setup = function () {
        toolbarDiv = document.getElementById('tools');

        // Build tool button elements
        for(toolName in wickEditor.tools) {
            var toolButton = new ToolButton(toolName)
            toolbarDiv.appendChild(toolButton);
        }

        toolbarDiv.appendChild(document.createElement('hr'));

        // Build color pickers
        var colorPickerContainer = document.createElement('div');
        colorPickerContainer.className = 'toolbar-color-picker-container';
        toolbarDiv.appendChild(colorPickerContainer);

        var strokeColorBackground = document.createElement('div');
        strokeColorBackground.className = 'toolbar-stroke-color-background';
        colorPickerContainer.appendChild(strokeColorBackground);

        var strokeColorPicker = new ColorPicker('strokeColor', 'toolbar-stroke-color', 'strokeColor');
        colorPickerDivs.push(strokeColorPicker);
        var strokeInnerRect = document.createElement('div');
        strokeInnerRect.className = 'toolbar-stroke-color-inner-rect';
        strokeColorPicker.appendChild(strokeInnerRect);
        colorPickerContainer.appendChild(strokeColorPicker);

        var fillColorBackground = document.createElement('div');
        fillColorBackground.className = 'toolbar-fill-color-background';
        colorPickerContainer.appendChild(fillColorBackground);

        var fillColorPicker = new ColorPicker('fillColor', 'toolbar-fill-color', 'fillColor');
        colorPickerDivs.push(fillColorPicker);
        colorPickerContainer.appendChild(fillColorPicker);
    }

    this.syncWithEditorState = function () {

        // Highlight select tool, unhighlight all other tools
        for (toolName in wickEditor.tools) {
            var buttonClassName = toolName + 'ToolButton';
            if (wickEditor.tools[toolName] === wickEditor.currentTool) {
                document.getElementById(buttonClassName).className = "toolButton tooltipElem toolButtonActive"
            } else {
                document.getElementById(buttonClassName).className = "toolButton tooltipElem"
            }
        };

        // Update color picker preview colors
        colorPickerDivs.forEach(function (colorPicker) {
            colorPicker.style.backgroundColor = wickEditor.settings[colorPicker.wickSettingsVal];
        });

    }

    var ToolButton = function (toolName) {
        var tool = wickEditor.tools[toolName];

        var toolDiv = document.createElement('div');
        toolDiv.id = toolName + "ToolButton";
        toolDiv.setAttribute('alt', tool.getTooltipName());

        // nasty closure thing
        var useToolFn = function (toolName) {
            return function () { wickEditor.guiActionHandler.doAction('useTools.'+toolName); };
        }
        toolDiv.onclick = useToolFn(toolName);

        var toolIcon = document.createElement('img');
        toolIcon.src = tool.getToolbarIcon();
        toolIcon.width = '28';
        toolDiv.appendChild(toolIcon);

        return toolDiv;
    }

    var ColorPicker = function (settingsVal, className, previewType) {
        var colorPickerContainer = document.createElement('div');
        colorPickerContainer.className = 'toolbar-color ' + className;
        colorPickerContainer.wickSettingsVal = settingsVal;

        colorPickerContainer.onclick = function () {
            wickEditor.colorPicker.open(function (color) {
                wickEditor.settings.setValue(settingsVal, color);
                if(settingsVal === 'fillColor') {
                    wickEditor.guiActionHandler.doAction("changePathProperties", {
                        fillColor: color
                    });
                } else if (settingsVal === 'strokeColor') {
                    wickEditor.guiActionHandler.doAction("changePathProperties", {
                        strokeColor: color
                    });
                }
                wickEditor.syncInterfaces();
            }, 
                wickEditor.settings[settingsVal],
                colorPickerContainer.getBoundingClientRect().left,
                colorPickerContainer.getBoundingClientRect().top,
                previewType)
        }

        return colorPickerContainer;
    }

}
