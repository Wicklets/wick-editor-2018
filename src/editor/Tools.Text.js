/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

if(!window.Tools) Tools = {};

Tools.Text = function (wickEditor) {

    var self = this;

    this.getCursorImage = function () {
        return "text";
    }

    this.getToolbarIcon = function () {
        return "resources/text.png";
    }

    this.getTooltipName = function () {
        return "Text";
    }

    this.setup = function () {
        var canvas = wickEditor.fabric.canvas;
        canvas.on('mouse:down', function (e) {
            if(wickEditor.currentTool instanceof Tools.Text) {
                var mouseCanvasSpace = wickEditor.fabric.screenToCanvasSpace(wickEditor.inputHandler.mouse.x, wickEditor.inputHandler.mouse.y)
                self.addText(mouseCanvasSpace.x, mouseCanvasSpace.y);
                wickEditor.currentTool = wickEditor.tools.cursor;
                wickEditor.syncInterfaces();
            }
        });
    }

    self.addText = function (x,y) {                                                     
    	var newWickObject = WickObject.fromText('Click to edit text');
        if(x && y) {
            newWickObject.x = x;
            newWickObject.y = y;
        } else {
            newWickObject.x = wickEditor.project.width/2;
            newWickObject.y = wickEditor.project.height/2;
        }
        newWickObject.fontData.fill = wickEditor.tools.paintbrush.color;
        wickEditor.actionHandler.doAction('addObjects', {wickObjects:[newWickObject]});
    }

}