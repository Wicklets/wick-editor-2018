/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var ToolbarInterface = function (wickEditor) {

    /* Define tools in toolbar */ 
    var toolbarTools = [ 'cursor',
                         'paintbrush',
                         'fillbucket',
                         'rectangle',
                         'ellipse',
                         'dropper',
                         'fillbucket',
                         'text',
                         'zoom',
                         'pan' ]; 

    this.syncWithEditorState = function () {

        /* Highlight select tool, unhighlight all other tools */
        toolbarTools.forEach( function(toolName) {
            var buttonClassName = '#' + toolName + 'ToolButton';
            if (wickEditor.tools[toolName] === wickEditor.currentTool) {
                $(buttonClassName).css('background-color', '#ccc');
            } else {
                $(buttonClassName).css('background-color', '');
            }
        });
        
    }

}