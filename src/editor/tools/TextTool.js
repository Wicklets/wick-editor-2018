/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var TextTool = function (wickEditor) {

    var that = this;

    var canvas = wickEditor.interfaces['fabric'].canvas;

    this.getCursorImage = function () {
        return "text";
    }

    canvas.on('mouse:down', function (e) {
    	if(wickEditor.interfaces.fabric.currentTool instanceof TextTool) {
	    	addText();
            wickEditor.interfaces.fabric.currentTool = wickEditor.interfaces.fabric.tools.cursor;
            wickEditor.syncInterfaces();
	    }
    });

    var addText = function () {
    	var newWickObject = WickObject.fromText('Click to edit text');
        newWickObject.fontData.fill = wickEditor.interfaces.fabric.tools.paintbrush.color;
        var mouseCanvasSpace = wickEditor.interfaces.fabric.screenToCanvasSpace(wickEditor.inputHandler.mouse.x, wickEditor.inputHandler.mouse.y)
        newWickObject.x = mouseCanvasSpace.x;
        newWickObject.y = mouseCanvasSpace.y;
        wickEditor.actionHandler.doAction('addObjects', {wickObjects:[newWickObject]});
    }

}