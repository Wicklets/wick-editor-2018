/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var TimelineInterface = function (wickEditor) {

    var that = this;

    var canvas = document.getElementById("timelineCanvas");
    var ctx = canvas.getContext("2d");

    this.syncWithEditorState = function () {

        that.redraw();

    }

    this.resize = function () {
        var GUIWidth = parseInt($("#timelineGUI").css("width")) / 2;
        $("#timelineGUI").css('left', (window.innerWidth/2 - GUIWidth)+'px');

        canvas.width = GUIWidth;
        canvas.height = 75;

        that.redraw();
    }

    this.redraw = function () {

        ctx.clearRect(0,0,canvas.width,canvas.height);

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        var currentObject = wickEditor.project.getCurrentObject();

        var frameWidth = 24;
        var frameHeight = 32;

        var layerCount = 0;
        currentObject.layers.forEach(function (layer) {
            var frameCount = 0;
            layer.frames.forEach(function (frame) {
                
                if (layerCount == currentObject.currentLayer) {
                    ctx.fillStyle = "#FF0000";
                } else {
                    ctx.fillStyle = "#FF6622";
                }

                ctx.fillRect(
                    frameCount*frameWidth, layerCount*frameHeight,
                    frameWidth, frameHeight);
                frameCount++;
            });
            layerCount++;
        });

        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(currentObject.playheadPosition*frameWidth+frameWidth/2,0);
        ctx.lineTo(currentObject.playheadPosition*frameWidth+frameWidth/2,canvas.height);
        ctx.stroke();

    }

    window.addEventListener('resize', function(e) {
        that.resize();
    });
    this.resize();

    $("#addNewFrameButton").on("click", function (e) {
        wickEditor.actionHandler.doAction('addNewFrame');
    });

    $("#extendFrameButton").on("click", function (e) {
        wickEditor.actionHandler.doAction('extendFrame', {nFramesToExtendBy:1});
    });

    $("#shrinkFrameButton").on("click", function (e) {
        wickEditor.actionHandler.doAction('shrinkFrame', {nFramesToShrinkBy:1});
    });

}
