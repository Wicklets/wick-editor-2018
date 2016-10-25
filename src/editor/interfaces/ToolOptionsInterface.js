/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var ToolOptionsInterface = function (wickEditor) {

	var lineWidthEl = document.getElementById('lineWidth');
    var lineSmoothnessEl = document.getElementById('lineSmoothness');
    var lineColorEl = document.getElementById('lineColor');

    this.syncWithEditorState = function () {
        lineWidthEl.value = wickEditor.tools['paintbrush'].brushSize;

        if(lineColorEl.jscolor) lineColorEl.jscolor.fromString(wickEditor.tools['paintbrush'].color);

        /*if(wickEditor.currentTool instanceof PaintbrushTool) {
            document.getElementById('toolOptionsGUI').style.display = 'block';
        } else {
            document.getElementById('toolOptionsGUI').style.display = 'none';
        }*/
        document.getElementById('toolOptionsGUI').style.display = 'block';
    }
    
    lineWidthEl.onchange = function() {
        wickEditor.tools['paintbrush'].brushSize = parseInt(this.value, 10) || 2;
        wickEditor.syncInterfaces();
    };

    lineColorEl.onchange = function() {
        var newColor = '#' + this.value;
        wickEditor.tools['paintbrush'].color = newColor;

        var selectedObjects = wickEditor.interfaces.fabric.getSelectedWickObjects();
        if(selectedObjects) {
            selectedObjects.forEach(function (child) {
                if(!child.svgData) return;
                wickEditor.actionHandler.doAction('modifyObjects', { 
                    ids: [child.id], 
                    modifiedStates: [{ svgFillColor : newColor }] 
                });
            });
        }

        wickEditor.syncInterfaces();
    };

}