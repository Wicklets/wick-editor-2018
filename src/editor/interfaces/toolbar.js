/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var ToolbarInterface = function (wickEditor) {

    this.syncWithEditorState = function () {
        
    }

    $('#mouseToolButton').on('click', function(e) {
        document.getElementById('toolOptionsGUI').style.display = 'none';
        wickEditor.currentTool = "cursor";
        wickEditor.syncInterfaces();
    });

    $('#paintbrushToolButton').on('click', function(e) {
        document.getElementById('toolOptionsGUI').style.display = 'block';
        wickEditor.currentTool = "paintbrush";
        wickEditor.syncInterfaces();
    });

    $('#eraserToolButton').on('click', function(e) {
        document.getElementById('toolOptionsGUI').style.display = 'block';
        wickEditor.currentTool = "eraser";
        wickEditor.syncInterfaces();
    });

    $('#fillBucketToolButton').on('click', function(e) {
        document.getElementById('toolOptionsGUI').style.display = 'block';
        wickEditor.currentTool = "fillBucket";
        wickEditor.syncInterfaces();
    });

    $('#textToolButton').on('click', function(e) {
        var newWickObject = WickObject.fromText('Click to edit text');
        newWickObject.x = wickEditor.project.resolution.x/2;
        newWickObject.y = wickEditor.project.resolution.y/2;
        wickEditor.actionHandler.doAction('addObjects', {wickObjects:[newWickObject]});
        wickEditor.syncInterfaces();
    });

    $('#htmlSnippetToolButton').on('click', function(e) {
        
    });

    $('#zoomInToolButton').on('click', function(e) {
        wickEditor.interfaces['fabric'].zoomIn();
        wickEditor.syncInterfaces();
    });

    $('#zoomOutToolButton').on('click', function(e) {
        wickEditor.interfaces['fabric'].zoomOut();
        wickEditor.syncInterfaces();
    });

    $('#panToolButton').on('click', function(e) {
        wickEditor.currentTool = "pan";
        wickEditor.syncInterfaces();
    });

}