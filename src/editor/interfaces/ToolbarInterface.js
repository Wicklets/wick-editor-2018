/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var ToolbarInterface = function (wickEditor) {

    this.syncWithEditorState = function () {
        
    }

    $('#mouseToolButton').on('click', function(e) {
        wickEditor.interfaces['toolOptions'].hide();
        wickEditor.currentTool = wickEditor.tools['cursor']
        wickEditor.syncInterfaces();
    });

    $('#paintbrushToolButton').on('click', function(e) {
        wickEditor.interfaces['toolOptions'].show();
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
        wickEditor.interfaces['toolOptions'].hide();
        wickEditor.currentTool = wickEditor.tools['text'];
        wickEditor.syncInterfaces();
    });

    $('#zoomInToolButton').on('click', function(e) {
        wickEditor.interfaces['toolOptions'].hide();
        wickEditor.currentTool = wickEditor.tools['zoom'];
        wickEditor.tools['zoom'].zoomMode = "zoomIn";
        wickEditor.syncInterfaces();
    });

    $('#zoomOutToolButton').on('click', function(e) {
        wickEditor.interfaces['toolOptions'].hide();
        wickEditor.currentTool = wickEditor.tools['zoom'];
        wickEditor.tools['zoom'].zoomMode = "zoomOut";
        wickEditor.syncInterfaces();
    });

    $('#panToolButton').on('click', function(e) {
        wickEditor.interfaces['toolOptions'].hide();
        wickEditor.currentTool = wickEditor.tools['pan'];
        wickEditor.syncInterfaces();
    });

}