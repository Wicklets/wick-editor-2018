/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var ToolbarInterface = function (wickEditor) {

    this.syncWithEditorState = function () {
        
    }

    $('#mouseToolButton').on('click', function(e) {
        document.getElementById('toolOptionsGUI').style.display = 'none';
        wickEditor.currentTool = "cursor";
    });

    $('#paintbrushToolButton').on('click', function(e) {
        document.getElementById('toolOptionsGUI').style.display = 'block';
        wickEditor.currentTool = "paintbrush";
    });

    $('#eraserToolButton').on('click', function(e) {
        document.getElementById('toolOptionsGUI').style.display = 'block';
        wickEditor.currentTool = "eraser";
    });

    $('#fillBucketToolButton').on('click', function(e) {
        document.getElementById('toolOptionsGUI').style.display = 'none';
        wickEditor.currentTool = "fillbucket";
    });

    $('#textToolButton').on('click', function(e) {
        var newWickObject = WickObject.fromText('Click to edit text');
        newWickObject.x = wickEditor.project.resolution.x/2 - newWickObject.width /2;
        newWickObject.y = wickEditor.project.resolution.y/2 - newWickObject.height/2;
        wickEditor.actionHandler.doAction('addObjects', {wickObjects:[newWickObject]});
    });

    $('#htmlSnippetToolButton').on('click', function(e) {
        
    });

    var lineWidthEl = document.getElementById('lineWidth');
    var lineColorEl = document.getElementById('lineColor');

    lineWidthEl.onchange = function() {
    };

    lineColorEl.onchange = function() {
    };

    $('#panToolButton').on('click', function(e) {
        wickEditor.currentTool = "pan";
        wickEditor.syncInterfaces();
    });

}