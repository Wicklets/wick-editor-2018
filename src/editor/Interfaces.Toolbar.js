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

    this.setup = function () {
        toolbarDiv = document.getElementById('tools');

        // Build tool button elements

        for(toolName in wickEditor.tools) {
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

            toolbarDiv.appendChild(toolDiv);
        }

        toolbarDiv.appendChild(document.createElement('hr'));

        var fillColor = document.createElement('div');
        fillColor.className = 'toolbar-color toolbar-fill-color';
        toolbarDiv.appendChild(fillColor);
        fillColor.onclick = function () {
            wickEditor.colorPicker.open(function (color) {
                fillColor.style.backgroundColor = color;
                wickEditor.settings.setValue('fillColor', color);
                wickEditor.syncInterfaces();
            }, wickEditor.settings.fillColor)
        }

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

    }

}
