/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var ToolbarInterface = function (wickEditor) {

    var toolbarTools = [ 'cursor',
                         'paintbrush',
                         'text',
                         'zoom',
                         'pan' ]; 

    this.syncWithEditorState = function () {
        
    }

    this.loadTools = function () {
        
        toolbarTools.forEach( function(toolName) {
            var tool = wickEditor.tools[toolName];
            var buttonClassName = '#' + toolName + 'ToolButton';

            $(buttonClassName).on('click', function(e) {
                wickEditor.currentTool = tool;
                wickEditor.syncInterfaces();
            });
        });
    }

}