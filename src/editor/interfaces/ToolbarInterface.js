/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var ToolbarInterface = function (wickEditor) {

    var lineWidthEl = document.getElementById('lineWidth');
    var lineSmoothnessEl = document.getElementById('lineSmoothness');
    var lineColorEl = document.getElementById('lineColor');

    this.syncWithEditorState = function () {
        lineWidthEl.value = wickEditor.tools['paintbrush'].brushSize;
        lineColorEl.value = wickEditor.tools['paintbrush'].color;
        lineSmoothnessEl.value = wickEditor.tools['paintbrush'].brushSmoothing;
    }

// Tool options window

    var showToolOptionsWindow = function () {
        document.getElementById('toolOptionsGUI').style.display = 'block';
    }

    var hideToolOptionsWindow = function () {
        document.getElementById('toolOptionsGUI').style.display = 'none';
    }

    lineWidthEl.onchange = function() {
        wickEditor.tools['paintbrush'].brushSize = parseInt(this.value, 10) || 1;
        wickEditor.syncInterfaces();
    };

    lineColorEl.onchange = function() {
        wickEditor.tools['paintbrush'].color = this.value;
        wickEditor.syncInterfaces();
    };

    lineSmoothnessEl.onchange = function() {
        wickEditor.tools['paintbrush'].brushSmoothing = this.value;
        wickEditor.syncInterfaces();
    };

// Buttons

    $('#mouseToolButton').on('click', function(e) {
        hideToolOptionsWindow();
        wickEditor.currentTool = wickEditor.tools['cursor']
        wickEditor.syncInterfaces();
    });

    $('#paintbrushToolButton').on('click', function(e) {
        showToolOptionsWindow();
        wickEditor.currentTool = wickEditor.tools['paintbrush']
        wickEditor.syncInterfaces();
    });

    // Disabled for now...
    /*$('#eraserToolButton').on('click', function(e) {
        document.getElementById('toolOptionsGUI').style.display = 'block';
        wickEditor.currentTool.type = "eraser";
        wickEditor.syncInterfaces();
    });*/

    // Disabled for now...
    /*$('#fillBucketToolButton').on('click', function(e) {
        document.getElementById('toolOptionsGUI').style.display = 'block';
        wickEditor.currentTool.type = "fillbucket";
        wickEditor.syncInterfaces();
    });*/

    $('#textToolButton').on('click', function(e) {
        hideToolOptionsWindow();
        wickEditor.currentTool = wickEditor.tools['text'];
        wickEditor.syncInterfaces();
    });

    $('#zoomInToolButton').on('click', function(e) {
        hideToolOptionsWindow();
        wickEditor.currentTool = wickEditor.tools['zoom'];
        wickEditor.tools['zoom'].zoomMode = "zoomIn";
        wickEditor.syncInterfaces();
    });

    $('#zoomOutToolButton').on('click', function(e) {
        hideToolOptionsWindow();
        wickEditor.currentTool = wickEditor.tools['zoom'];
        wickEditor.tools['zoom'].zoomMode = "zoomOut";
        wickEditor.syncInterfaces();
    });

    $('#panToolButton').on('click', function(e) {
        hideToolOptionsWindow();
        wickEditor.currentTool = wickEditor.tools['pan'];
        wickEditor.syncInterfaces();
    });

}