/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var ToolOptionsInterface = function (wickEditor) {

	var lineWidthEl = document.getElementById('lineWidth');
    var lineSmoothnessEl = document.getElementById('lineSmoothness');
    var lineColorEl = document.getElementById('lineColor');

    this.syncWithEditorState = function () {
        lineWidthEl.value = wickEditor.tools['paintbrush'].brushSize;
        if(lineColorEl.jscolor) lineColorEl.jscolor.fromString(wickEditor.tools['paintbrush'].color);
        lineSmoothnessEl.value = wickEditor.tools['paintbrush'].brushSmoothing;

        if(wickEditor.currentTool instanceof PaintbrushTool) {
            document.getElementById('toolOptionsGUI').style.display = 'block';
        } else {
            document.getElementById('toolOptionsGUI').style.display = 'none';
        }
    }
    
    lineWidthEl.onchange = function() {
        wickEditor.tools['paintbrush'].brushSize = parseInt(this.value, 10) || 1;
        wickEditor.syncInterfaces();
    };

    lineColorEl.onFineChange = function() {
        wickEditor.tools['paintbrush'].color = '#' + this.value;
        wickEditor.syncInterfaces();
    };

    lineSmoothnessEl.onchange = function() {
        wickEditor.tools['paintbrush'].brushSmoothing = this.value;
        wickEditor.syncInterfaces();
    };

}