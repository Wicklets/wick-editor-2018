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
        var colorPickerContainer = document.createElement('div');
        colorPickerContainer.className = 'toolbar-color-picker-container';
        toolbarDiv.appendChild(colorPickerContainer);

        var strokeColorBackground = document.createElement('div');
        strokeColorBackground.className = 'toolbar-stroke-color-background';
        colorPickerContainer.appendChild(strokeColorBackground);

        var strokeColorPicker = new ColorPicker('strokeColor', 'toolbar-stroke-color');
        colorPickerDivs.push(strokeColorPicker);
        var strokeInnerRect = document.createElement('div');
        strokeInnerRect.className = 'toolbar-stroke-color-inner-rect';
        strokeColorPicker.appendChild(strokeInnerRect);
        colorPickerContainer.appendChild(strokeColorPicker);

        var fillColorBackground = document.createElement('div');
        fillColorBackground.className = 'toolbar-fill-color-background';
        colorPickerContainer.appendChild(fillColorBackground);

        var fillColorPicker = new ColorPicker('fillColor', 'toolbar-fill-color');
        colorPickerDivs.push(fillColorPicker);
        colorPickerContainer.appendChild(fillColorPicker);

        brushSizePreview = new BrushSizePreview();
        toolbarDiv.appendChild(brushSizePreview);
        brushSizePreview.onclick = function (e) {
            brushSizeSettingsWindow.toggleOpen(
                brushSizePreview.getBoundingClientRect().left,
                brushSizePreview.getBoundingClientRect().top)
        }
        brushSizePreview.refresh();

        var brushSizeSettingsWindow = new BrushSizeSettingsWindow();
        toolbarDiv.parentElement.parentElement.appendChild(brushSizeSettingsWindow);

        var numberInput = new SlideyNumberInput({
            onsoftchange: function (e) {
                brushSizePreview.refresh(parseFloat(e));
            },
            onhardchange: function (e) {
                wickEditor.settings.setValue('brushThickness', parseInt(e));
                wickEditor.syncInterfaces();
            },
            min: 1,
            max: 100,
            moveFactor: 0.2,
            initValue: wickEditor.settings.brushThickness,
        });
        numberInput.className = 'toolbar-number-input';
        toolbarDiv.appendChild(numberInput);

        strokeWidthPreview = new StrokeWidthPreview();
        toolbarDiv.appendChild(strokeWidthPreview);
        strokeWidthPreview.onclick = function () {
            if(wickEditor.settings.strokeCap === 'round') {
                wickEditor.settings.setValue('strokeCap', 'butt');
                wickEditor.settings.setValue('strokeJoin', 'miter');
            } else {
                wickEditor.settings.setValue('strokeCap', 'round');
                wickEditor.settings.setValue('strokeJoin', 'round');
            }
            strokeWidthPreview.refresh();
            wickEditor.guiActionHandler.doAction("changeStrokeCapAndJoinOfSelection", {
                strokeCap: wickEditor.settings.strokeCap,
                strokeJoin: wickEditor.settings.strokeJoin
            });
        }
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
            min: 0,
            max: 50,
            moveFactor: 0.1,
            initValue: wickEditor.settings.strokeWidth,
        });
        numberInput.className = 'toolbar-number-input';
        toolbarDiv.appendChild(numberInput);

        /*

        var numberInput = new SlideyNumberInput({
            onsoftchange: function (e) {
                
            },
            onhardchange: function (e) {
                wickEditor.settings.setValue('rectangleCornerRadius', parseInt(e));
                wickEditor.syncInterfaces();
            },
            min: 0,
            max: 100,
            moveFactor: 0.1,
            initValue: wickEditor.settings.rectangleCornerRadius,
        });
        numberInput.className = 'toolbar-number-input';
        toolbarDiv.appendChild(numberInput);*/

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
        line.setAttribute('y1', 12);
        line.setAttribute('y2', 12);
        line.setAttribute('x2', 30);
        svg.appendChild(line);

        strokeWidthPreviewContainer.refresh = function (val) {
            var bbox = strokeWidthPreviewContainer.getBoundingClientRect();
            if(!val) val = wickEditor.settings.strokeWidth;
            line.setAttribute('style', 
                'stroke:'+wickEditor.settings.strokeColor+
                '; stroke-width:'+val);
            line.setAttribute('stroke-linecap', wickEditor.settings.strokeCap);

            var makeLessBlurryOffset = (wickEditor.settings.strokeWidth%2) === 0 ? 0 : .5;
            line.setAttribute('y1', 11 + makeLessBlurryOffset);
            line.setAttribute('y2', 11 + makeLessBlurryOffset);
        }

        return strokeWidthPreviewContainer;
    }

    var BrushSizeSettingsWindow = function () {
        var brushSettingsWindowDiv = document.createElement('div');
        brushSettingsWindowDiv.className = 'toolbar-brush-settings-window';

        var open = false;

        brushSettingsWindowDiv.sync = function () {

        }

        brushSettingsWindowDiv.toggleOpen = function (x,y) {
            open = !open;
            brushSettingsWindowDiv.style.left = x+34+'px'
            brushSettingsWindowDiv.style.top = y+'px'
            brushSettingsWindowDiv.style.display = open ? 'block' : 'none';
        }

        var closeButton = document.createElement('div');
        closeButton.className = 'toolbar-brush-settings-window-close-button';
        closeButton.onclick = function () {
            brushSettingsWindowDiv.toggleOpen();
        }
        brushSettingsWindowDiv.appendChild(closeButton);

        var smoothnessLabel = document.createElement('div');
        smoothnessLabel.className = 'toolbar-brush-settings-window-smoothness-label';
        smoothnessLabel.innerHTML = 'Brush Smoothness: '
        brushSettingsWindowDiv.appendChild(smoothnessLabel);

        var numberInput = new SlideyNumberInput({
            onsoftchange: function (e) {
                
            },
            onhardchange: function (e) {
                wickEditor.settings.setValue('brushSmoothingAmount', parseInt(e));
                wickEditor.syncInterfaces();
            },
            min: 0,
            max: 100,
            moveFactor: 0.25,
            initValue: wickEditor.settings.brushSmoothingAmount,
        });
        numberInput.className = 'toolbar-number-input toolbar-brush-settings-window-number-input';
        brushSettingsWindowDiv.appendChild(numberInput);

        window.addEventListener('mousedown', function(e) { 
            if(open && !elementInsideElement(e.target, brushSettingsWindowDiv)) {
                brushSettingsWindowDiv.toggleOpen()
            }
        });

        return brushSettingsWindowDiv;
    }

}
