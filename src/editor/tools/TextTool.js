var TextTool = function (wickEditor) {

    var that = this;

    var canvas = wickEditor.interfaces['fabric'].canvas;

    this.getCursorImage = function () {
        return "text";
    }

    canvas.on('mouse:down', function (e) {
    	if(wickEditor.currentTool instanceof TextTool) {
	    	addText();
	    }
    });

    var addText = function () {
    	var newWickObject = WickObject.fromText('Click to edit text');
        var frameOffset = wickEditor.interfaces.fabric.getCenteredFrameOffset();
        newWickObject.x = wickEditor.inputHandler.mouse.x - frameOffset.x;
        newWickObject.y = wickEditor.inputHandler.mouse.y - frameOffset.y;
        wickEditor.actionHandler.doAction('addObjects', {wickObjects:[newWickObject]});
    }

}