var TextTool = function (wickEditor) {

    var that = this;

    var canvas = wickEditor.interfaces['fabric'].canvas;

    canvas.on('mouse:down', function (e) {
    	if(wickEditor.currentTool instanceof TextTool) {
	    	addText();
	    }
    });

    var addText = function () {
    	var newWickObject = WickObject.fromText('Click to edit text');
        newWickObject.x = wickEditor.project.resolution.x/2;
        newWickObject.y = wickEditor.project.resolution.y/2;
        wickEditor.actionHandler.doAction('addObjects', {wickObjects:[newWickObject]});
    }

}