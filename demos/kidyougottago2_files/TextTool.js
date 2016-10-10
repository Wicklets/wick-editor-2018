/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var TextTool = function (wickEditor) {

    var that = this;

    var canvas = wickEditor.interfaces['fabric'].canvas;

    this.getCursorImage = function () {
        return "text";
    }

    canvas.on('mouse:down', function (e) {
    	if(wickEditor.currentTool instanceof TextTool) {
	    	addText();
            wickEditor.currentTool = wickEditor.tools.cursor;
            wickEditor.syncInterfaces();
	    }
    });

    var addText = function () {
    	var newWickObject = WickObject.fromText('Click to edit text');
        newWickObject.x = wickEditor.inputHandler.mouse.x;
        newWickObject.y = wickEditor.inputHandler.mouse.y;
        wickEditor.actionHandler.doAction('addObjects', {wickObjects:[newWickObject]});
    }

}