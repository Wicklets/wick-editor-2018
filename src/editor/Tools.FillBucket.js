/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

if(!window.Tools) Tools = {};

Tools.FillBucket = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        return 'url("resources/fillbucket-cursor.png") 64 64,default';
    };

    this.getToolbarIcon = function () {
        return "resources/fill-bucket.png";
    }

    this.getTooltipName = function () {
        return "Fill Bucket";
    }

    this.setup = function () {
        var canvas = wickEditor.fabric.canvas;

        canvas.on('mouse:down', function (e) {
            if(e.e.button != 0) return;
            if(!(wickEditor.currentTool instanceof Tools.FillBucket)) return;

            var mouseScreenSpace = wickEditor.fabric.screenToCanvasSpace(e.e.offsetX, e.e.offsetY);
            var mousePointX = mouseScreenSpace.x;
            var mousePointY = mouseScreenSpace.y;
            var insideSymbolOffset = wickEditor.project.currentObject.getAbsolutePosition();
            mousePointX -= insideSymbolOffset.x;
            mousePointY -= insideSymbolOffset.y;

            wickEditor.actionHandler.doAction('fillHole', {
                x: mousePointX,
                y: mousePointY,
                color: wickEditor.tools.paintbrush.color
            });
        });
    }

}