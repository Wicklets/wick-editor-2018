/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var ToolbarInterface = function (wickEditor) {

    var lineWidthEl = document.getElementById('lineWidth');
    var lineSmoothnessEl = document.getElementById('lineSmoothness');
    var lineColorEl = document.getElementById('lineColor');

    this.syncWithEditorState = function () {
        lineWidthEl.value = wickEditor.currentTool.brushSize;
        lineColorEl.value = wickEditor.currentTool.color;
        lineSmoothnessEl.value = wickEditor.currentTool.brushSmoothing;
    }

    lineWidthEl.onchange = function() {
        wickEditor.currentTool.brushSize = parseInt(this.value, 10) || 1;
        wickEditor.syncInterfaces();
    };

    lineColorEl.onchange = function() {
        wickEditor.currentTool.color = this.value;
        wickEditor.syncInterfaces();
    };

    lineSmoothnessEl.onchange = function() {
        wickEditor.currentTool.brushSmoothing = this.value;
        wickEditor.syncInterfaces();
    };

    $('#mouseToolButton').on('click', function(e) {
        document.getElementById('toolOptionsGUI').style.display = 'none';
        wickEditor.currentTool.type = "cursor";
        wickEditor.syncInterfaces();
    });

    $('#paintbrushToolButton').on('click', function(e) {
        document.getElementById('toolOptionsGUI').style.display = 'block';
        wickEditor.currentTool.type = "paintbrush";
        wickEditor.syncInterfaces();
    });

    $('#eraserToolButton').on('click', function(e) {
        document.getElementById('toolOptionsGUI').style.display = 'block';
        wickEditor.currentTool.type = "eraser";
        wickEditor.syncInterfaces();
    });

    $('#fillBucketToolButton').on('click', function(e) {
        document.getElementById('toolOptionsGUI').style.display = 'none';
        wickEditor.currentTool.type = "fillbucket";
        wickEditor.syncInterfaces();
    });

    $('#textToolButton').on('click', function(e) {
        var newWickObject = WickObject.fromText('Click to edit text');
        newWickObject.x = wickEditor.project.resolution.x/2;
        newWickObject.y = wickEditor.project.resolution.y/2;
        wickEditor.actionHandler.doAction('addObjects', {wickObjects:[newWickObject]});
    });

    $('#zoomInToolButton').on('click', function(e) {
        wickEditor.interfaces['fabric'].zoomIn();
    });

    $('#zoomOutToolButton').on('click', function(e) {
        wickEditor.interfaces['fabric'].zoomOut();
    });

    $('#panToolButton').on('click', function(e) {
        wickEditor.currentTool.type = "pan";
        wickEditor.syncInterfaces();
    });

}