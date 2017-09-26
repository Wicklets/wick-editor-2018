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

    this.setup = function () {
        toolbarDiv = document.getElementById('tools');

        // Build tool button elements
        for(toolName in wickEditor.tools) {
            var toolButton = new ToolButton(toolName)
            toolbarDiv.appendChild(toolButton);
        }

        toolbarDiv.appendChild(document.createElement('hr'));

        // Build color pickers
        var fillColorPicker = new ColorPicker('fillColor', 'toolbar-fill-color');
        colorPickerDivs.push(fillColorPicker);
        toolbarDiv.appendChild(fillColorPicker);

        var strokeColorPicker = new ColorPicker('strokeColor', 'toolbar-stroke-color');
        colorPickerDivs.push(strokeColorPicker);
        toolbarDiv.appendChild(strokeColorPicker);

        brushSizePreview = new BrushSizePreview();
        toolbarDiv.appendChild(brushSizePreview);
        brushSizePreview.refresh();

        var numberInput = new SlideyNumberInput({
            onsoftchange: function (e) {
                brushSizePreview.refresh(parseFloat(e));
            },
            onhardchange: function (e) {
                wickEditor.settings.setValue('brushThickness', parseInt(e));
                wickEditor.syncInterfaces();
            },
            min: 1,
            max: 30,
            moveFactor: 0.2,
            initValue: wickEditor.settings.brushThickness,
        });
        numberInput.className = 'toolbar-number-input';
        toolbarDiv.appendChild(numberInput);

        strokeWidthPreview = new StrokeWidthPreview();
        toolbarDiv.appendChild(strokeWidthPreview);
        strokeWidthPreview.refresh();

        var numberInput = new SlideyNumberInput({
            onsoftchange: function (e) {
                strokeWidthPreview.refresh(parseInt(e));
            },
            onhardchange: function (e) {
                wickEditor.settings.setValue('strokeWidth', parseInt(e));
                wickEditor.guiActionHandler.doAction("changeStrokeWidthOfSelection", {
                    strokeWidth: wickEditor.settings.strokeWidth
                });
                wickEditor.syncInterfaces();
            },
            min: 1,
            max: 10,
            moveFactor: 0.1,
            initValue: wickEditor.settings.strokeWidth,
        });
        numberInput.className = 'toolbar-number-input';
        toolbarDiv.appendChild(numberInput);

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

        // Update brush/stroke thickness previews
        brushSizePreview.refresh();
        strokeWidthPreview.refresh();

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

    var ColorPicker = function (settingsVal, className) {
        var colorPickerContainer = document.createElement('div');
        colorPickerContainer.className = 'toolbar-color ' + className;
        colorPickerContainer.wickSettingsVal = settingsVal;

        colorPickerContainer.onclick = function () {
            wickEditor.colorPicker.open(function (color) {
                wickEditor.settings.setValue(settingsVal, color);
                if(settingsVal === 'fillColor') {
                    wickEditor.guiActionHandler.doAction("changeFillColorOfSelection", {color: color});
                } else if (settingsVal === 'strokeColor') {
                    wickEditor.guiActionHandler.doAction("changeStrokeColorOfSelection", {color: color});
                }
                wickEditor.syncInterfaces();
            }, 
            wickEditor.settings[settingsVal],
            colorPickerContainer.getBoundingClientRect().left,
            colorPickerContainer.getBoundingClientRect().top)
        }

        return colorPickerContainer;
    }

    var BrushSizePreview = function () {
        var brushSizePreviewContainer = document.createElement('div');
        brushSizePreviewContainer.className = 'toolbar-brush-size-preview-container';

        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        brushSizePreviewContainer.appendChild(svg);

        var ellipse = document.createElementNS(svg.namespaceURI,'ellipse');
        svg.appendChild(ellipse);
        brushSizePreviewContainer.refresh = function (val) {
            var bbox = brushSizePreviewContainer.getBoundingClientRect();
            if(!val) val = wickEditor.settings.brushThickness;
            ellipse.setAttribute('cx', bbox.width/2);
            ellipse.setAttribute('cy', bbox.height/2);
            ellipse.setAttribute('rx', val/2);
            ellipse.setAttribute('ry', val/2);
            ellipse.setAttribute('fill', wickEditor.settings.fillColor);
        }

        return brushSizePreviewContainer;
    }

    var StrokeWidthPreview = function () {
        var strokeWidthPreviewContainer = document.createElement('div');
        strokeWidthPreviewContainer.className = 'toolbar-stroke-width-preview-container';

        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        strokeWidthPreviewContainer.appendChild(svg);

        var line = document.createElementNS(svg.namespaceURI,'line');
        line.setAttribute('x1', 5);
        line.setAttribute('y1', 7);
        line.setAttribute('y2', 7);
        line.setAttribute('x2', 30);
        line.setAttribute('stroke-linecap', 'round');
        svg.appendChild(line);

        strokeWidthPreviewContainer.refresh = function (val) {
            var bbox = strokeWidthPreviewContainer.getBoundingClientRect();
            if(!val) val = wickEditor.settings.strokeWidth;
            line.setAttribute('style', 'stroke:'+wickEditor.settings.strokeColor+'; stroke-width:'+val);
        }

        return strokeWidthPreviewContainer;
    }

}
