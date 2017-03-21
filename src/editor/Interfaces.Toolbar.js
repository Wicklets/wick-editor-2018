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

    var brushCanvas;
    var brushCtx;

    this.setup = function () {
        brushCanvas = document.getElementById('brushSizeDisplay');
        brushCtx = brushCanvas.getContext('2d');

        for(toolName in wickEditor.tools) {
            var tool = wickEditor.tools[toolName];

            var toolDiv = document.createElement('div');
            toolDiv.id = toolName + "ToolButton";
            toolDiv.setAttribute('alt', tool.getTooltipName());

            var toolIcon = document.createElement('img');
            toolIcon.src = tool.getToolbarIcon();
            toolIcon.width = '20';
            toolDiv.appendChild(toolIcon);

            document.getElementById('tools').appendChild(toolDiv);
        }

        $(function() {
            const cssClasses = [
                'rangeslider--is-lowest-value',
                'rangeslider--is-highest-value'
            ];

            $('input[type=range]')
                .rangeslider({
                    polyfill: false
                })
                .on('input', function() {
                    /*const fraction = (this.value - this.min) / (this.max - this.min);
                    if (fraction === 0) {
                    this.nextSibling.classList.add(cssClasses[0]);
                    } else if (fraction === 1) {
                    this.nextSibling.classList.add(cssClasses[1]);
                    } else {
                    this.nextSibling.classList.remove(...cssClasses)
                    }*/
                });
        });
    }

    this.syncWithEditorState = function () {

        /* Highlight select tool, unhighlight all other tools */
        for (toolName in wickEditor.tools) {
            var buttonClassName = toolName + 'ToolButton';
            if (wickEditor.tools[toolName] === wickEditor.currentTool) {
                document.getElementById(buttonClassName).className = "button toolbarButton tooltipElem toolbarButtonActive"
            } else {
                document.getElementById(buttonClassName).className = "button toolbarButton tooltipElem"
            }
        };

        /* Update drawing tool options elems */
        lineWidthEl.value = wickEditor.tools['paintbrush'].brushSize;

        if(lineColorEl.jscolor) lineColorEl.jscolor.fromString(wickEditor.tools['paintbrush'].color);
        
        var currentTool = wickEditor.currentTool;
        document.getElementById('toolOptionsGUI').style.display = 
            (currentTool instanceof Tools.Dropper) ||
            (currentTool instanceof Tools.Ellipse) ||
            (currentTool instanceof Tools.Eraser) ||
            (currentTool instanceof Tools.FillBucket) ||
            (currentTool instanceof Tools.Paintbrush) ||
            (currentTool instanceof Tools.Rectangle) 
            ? 'block' : 'none';

        // Update canvas that shows brush size
        brushCtx.clearRect(0,0,brushCanvas.width,brushCanvas.height);

        var centerX = brushCanvas.width / 2;
        var centerY = brushCanvas.height / 2;
        var radius = wickEditor.tools.paintbrush.brushSize/2 * wickEditor.fabric.canvas.getZoom();

        brushCtx.beginPath();
        brushCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        brushCtx.fillStyle = wickEditor.tools.paintbrush.color;
        brushCtx.fill();
    }

    var lineWidthEl = document.getElementById('lineWidth');
    var lineSmoothnessEl = document.getElementById('lineSmoothness');
    var lineColorEl = document.getElementById('lineColor');

    lineWidthEl.onchange = function() {
        wickEditor.tools['paintbrush'].brushSize = parseInt(this.value, 10) || 2;
        wickEditor.syncInterfaces();
    };

    lineColorEl.onchange = function() {
        var newColor = '#' + this.value;
        wickEditor.tools['paintbrush'].color = newColor;

        wickEditor.syncInterfaces();
    };

}