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

        container = buildDiv("drawing-tool-options-container", toolbarDiv);
        container.appendChild(document.createElement('hr'))

        toolOptionInputs = [];

        toolOptionInputs.push(new ToolbarInterface.ColorPicker(container, 'strokeColorPicker', 'tools/Line.svg', function (color) {
            wickEditor.settings.setValue('strokeColor', color);
            wickEditor.guiActionHandler.doAction("changeStrokeColorOfSelection", {
                color: color
            });
            wickEditor.syncInterfaces();
        }, function () {
            if(this.cachedColor !== wickEditor.settings.strokeColor)
                $("#strokeColorPicker").spectrum("set", wickEditor.settings.strokeColor);
            this.cachedColor = wickEditor.settings.strokeColor;
        }));

        toolOptionInputs.push(new ToolbarInterface.ColorPicker(container, 'fillColorPicker', 'tools/Bucket.svg', function (color) {
            wickEditor.settings.setValue('fillColor', color);
            wickEditor.guiActionHandler.doAction("changeFillColorOfSelection", {
                color: color
            });
            wickEditor.syncInterfaces();
        }, function () {
            if(this.cachedColor !== wickEditor.settings.fillColor)
                $("#fillColorPicker").spectrum("set", wickEditor.settings.fillColor);
            this.cachedColor = wickEditor.settings.fillColor;
        }));

        toolOptionInputs.push(new ToolbarInterface.RangeSlider(container, 'Stroke Width', 'tools/Line.svg', 0, 50, function (val) {
            wickEditor.settings.setValue('strokeWidth', val);
            wickEditor.guiActionHandler.doAction("changeStrokeWidthOfSelection", {
                strokeWidth: wickEditor.settings.strokeWidth
            });
            wickEditor.syncInterfaces();
        }, function () {
            return parseInt(wickEditor.settings.strokeWidth);
        }));

        toolOptionInputs.push(new ToolbarInterface.RangeSlider(container, 'Brush Thickness', 'tools/Paintbrush.svg', 3, 100, function (val) {
            wickEditor.settings.setValue('brushThickness', parseFloat(val));
            wickEditor.syncInterfaces();
        }, function () {
            return parseFloat(wickEditor.settings.brushThickness);
        }, function () {
            return (wickEditor.currentTool instanceof Tools.Paintbrush);
        }));

        toolOptionInputs.push(new ToolbarInterface.RangeSlider(container, 'Brush Smoothness', 'tools/Paintbrush.svg', 25, 100, function (val) {
            wickEditor.settings.setValue('brushSmoothness', parseFloat(val));
            wickEditor.syncInterfaces();
        }, function () {
            return parseFloat(wickEditor.settings.brushSmoothness);
        }, function () {
            return (wickEditor.currentTool instanceof Tools.Paintbrush);
        }));

        toolOptionInputs.push(new ToolbarInterface.RangeSlider(container, 'Rectangle Corner Roundness', 'tools/Square.svg', 0, 100, function (val) {
            wickEditor.settings.setValue('rectangleCornerRadius', val);
            wickEditor.syncInterfaces();
        }, function () {
            return parseFloat(wickEditor.settings.rectangleCornerRadius);
        }, function () {
            return (wickEditor.currentTool instanceof Tools.Rectangle);
        }));

        toolOptionInputs.push(new ToolbarInterface.RangeSlider(container, 'Zoom amount', 'tools/Zoom.svg', 25, 500, function (val) {
            wickEditor.syncInterfaces();
        }, function () {
            return wickEditor.fabric.getCanvasTransform().zoom * 100;
        }, function () {
            return true;
        }, function (val) {
            wickEditor.fabric.setZoom(val/100, true);
        }));

    }

    this.syncWithEditorState = function () {
        toolOptionInputs.forEach(function (toolOptionInput) {
            toolOptionInput.updateViewValue();
        });

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
