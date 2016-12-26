/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

if(!window.Tools) Tools = {};

Tools.BackgroundRemove = function (wickEditor) {

    var that = this;
    var fabricInterface = wickEditor.fabric;
    var canvas = fabricInterface.canvas;

    this.getCursorImage = function () {
        return "crosshair";
    }

    canvas.on('mouse:down', function(e) {
        if(!(wickEditor.fabric.currentTool instanceof Tools.BackgroundRemove)) return;

        var position = {x:e.e.offsetX, y:e.e.offsetY};
        
        var objs = canvas.getObjects();
        var topmost = new Object();

        jQuery.each(objs,function(index,val){
            if( val.containsPoint(position) && !(canvas.isTargetTransparent(val, position.x, position.y))){
                topmost = val;
            }
        });
        if(topmost != undefined && topmost.wickObjectID) {
            var wickObj = topmost.wickObjReference;

            var mouseScreenSpace = wickEditor.fabric.screenToCanvasSpace(e.e.offsetX, e.e.offsetY);
            var mousePoint = new paper.Point(mouseScreenSpace.x, mouseScreenSpace.y);
            var insideSymbolOffset = wickEditor.project.getCurrentObject().getAbsolutePosition();
            mousePoint.x -= insideSymbolOffset.x;
            mousePoint.y -= insideSymbolOffset.y;
            mousePoint.x -= wickObj.x;
            mousePoint.y -= wickObj.y;
            mousePoint.x += wickObj.width/2;
            mousePoint.y += wickObj.height/2;
            
            /* YA GOTTA PUT THIS IN ACTIONHANDLER SO IT CAN BE UNDONE! */
            ImageToCanvas(wickObj.imageData, function (canvas,ctx) {
                ctx.fillStyle = "rgba(0,0,0,0)";
                ctx.fillFlood(mousePoint.x, mousePoint.y, 0);
                wickObj.imageData = canvas.toDataURL();
                wickObj.imageDirty = true;
                wickEditor.syncInterfaces();
            });
        }

    });
}