/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var ToolbarInterface = function (wickEditor) {

    /* Define tools in toolbar */ 
    var toolbarTools = [ 'cursor',
                         'paintbrush',
                         'eraser',
                         'fillbucket',
                         'rectangle',
                         'ellipse',
                         'dropper',
                         'fillbucket',
                         'text',
                         'zoom',
                         'pan',
                         'crop',
                         'backgroundremove' ]; 

    var brushCanvas;
    var brushCtx;

    this.setup = function () {
        brushCanvas = document.getElementById('brushSizeDisplay');
        brushCtx = brushCanvas.getContext('2d');

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
        toolbarTools.forEach( function(toolName) {
            var buttonClassName = '#' + toolName + 'ToolButton';
            if (wickEditor.fabric.tools[toolName] === wickEditor.fabric.currentTool) {
                $(buttonClassName).css('border', '1px solid #ccc');
            } else {
                $(buttonClassName).css('border', '');
            }
        });

        /* Update drawing tool options elems */
        lineWidthEl.value = wickEditor.fabric.tools['paintbrush'].brushSize;

        if(lineColorEl.jscolor) lineColorEl.jscolor.fromString(wickEditor.fabric.tools['paintbrush'].color);
        
        var currentTool = wickEditor.fabric.currentTool;
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
        var radius = wickEditor.fabric.tools.paintbrush.brushSize/2 * wickEditor.fabric.canvas.getZoom();

        brushCtx.beginPath();
        brushCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        brushCtx.fillStyle = wickEditor.fabric.tools.paintbrush.color;
        brushCtx.fill();
    }

    var lineWidthEl = document.getElementById('lineWidth');
    var lineSmoothnessEl = document.getElementById('lineSmoothness');
    var lineColorEl = document.getElementById('lineColor');

    lineWidthEl.onchange = function() {
        wickEditor.fabric.tools['paintbrush'].brushSize = parseInt(this.value, 10) || 2;
        wickEditor.syncInterfaces();
    };

    lineColorEl.onchange = function() {
        var newColor = '#' + this.value;
        wickEditor.fabric.tools['paintbrush'].color = newColor;

        wickEditor.syncInterfaces();
    };

}