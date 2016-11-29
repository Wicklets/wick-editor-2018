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
                         'pan',
                         'crop',
                         'backgroundremove' ]; 

    this.setup = function () {
        
    }

    this.syncWithEditorState = function () {

        /* Highlight select tool, unhighlight all other tools */
        toolbarTools.forEach( function(toolName) {
            var buttonClassName = '#' + toolName + 'ToolButton';
            if (wickEditor.interfaces.fabric.tools[toolName] === wickEditor.interfaces.fabric.currentTool) {
                $(buttonClassName).css('border', '1px solid #ccc');
            } else {
                $(buttonClassName).css('border', '');
            }
        });
        
    }

}