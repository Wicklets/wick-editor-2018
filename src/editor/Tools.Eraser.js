/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

if(!window.Tools) Tools = {};

Tools.Eraser = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        var canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        var context = canvas.getContext('2d');
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var radius = wickEditor.fabric.tools.paintbrush.brushSize/2 * wickEditor.fabric.canvas.getZoom();

        context.beginPath();
        context.arc(centerX, centerY, radius+1, 0, 2 * Math.PI, false);
        context.fillStyle = "#000000"
        context.fill();

        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = "#FFFFFF";
        context.fill();

        return 'url(' + canvas.toDataURL() + ') 64 64,default';
    };
    
    this.brushSize = 5;
    this.color = "#000000";

// Path vectorization

    wickEditor.fabric.canvas.on('object:added', function(e) {
        if(!(wickEditor.fabric.currentTool instanceof Tools.Eraser)) return;

        var fabricPath = e.target;

        // Make sure the new object is actually a path created by fabric's drawing tool
        if(fabricPath.type !== "path" || fabricPath.wickObjectRef) {
            return;
        }

        wickEditor.paper.onEraserPathAdded(fabricPath.toSVG());

        fabricPath.remove();
        
    });

}