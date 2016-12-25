/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var ToolOptionsInterface = function (wickEditor) {

	var lineWidthEl = document.getElementById('lineWidth');
    var lineSmoothnessEl = document.getElementById('lineSmoothness');
    var lineColorEl = document.getElementById('lineColor');

    this.setup = function () {
        
    }

    this.syncWithEditorState = function () {
        lineWidthEl.value = wickEditor.fabric.tools['paintbrush'].brushSize;

        if(lineColorEl.jscolor) lineColorEl.jscolor.fromString(wickEditor.fabric.tools['paintbrush'].color);
        
        //document.getElementById('toolOptionsGUI').style.display = 'block';
        document.getElementById('toolOptionsGUI').style.display = 'none';
    }
    
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