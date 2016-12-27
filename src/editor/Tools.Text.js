/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

if(!window.Tools) Tools = {};

Tools.Text = function (wickEditor) {

    var that = this;

    var canvas = wickEditor.fabric.canvas;

    this.getCursorImage = function () {
        return "text";
    }

    canvas.on('mouse:down', function (e) {
    	if(wickEditor.fabric.currentTool instanceof Tools.Text) {
	    	addText();
            wickEditor.fabric.currentTool = wickEditor.fabric.tools.cursor;
            wickEditor.syncInterfaces();
	    }
    });

    var addText = function () {                                                     
    	var newWickObject = WickObject.fromText('Click to edit text');
        newWickObject.fontData.fill = wickEditor.fabric.tools.paintbrush.color;
        var mouseCanvasSpace = wickEditor.fabric.screenToCanvasSpace(wickEditor.inputHandler.mouse.x, wickEditor.inputHandler.mouse.y)
        newWickObject.x = mouseCanvasSpace.x;
        newWickObject.y = mouseCanvasSpace.y;
        wickEditor.actionHandler.doAction('addObjects', {wickObjects:[newWickObject]});
    }

}