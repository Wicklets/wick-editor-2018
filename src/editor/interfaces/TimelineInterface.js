/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var TimelineInterface = function (wickEditor) {

    var that = this;

    var canvas = document.getElementById("timelineCanvas");
    var ctx = canvas.getContext("2d");

    var frameWidth = 24;
    var frameHeight = 32;

    var playheadX = frameWidth / 2;

    var mouse = {x:0,y:0,down:false};

    this.syncWithEditorState = function () {

        var currentObject = wickEditor.project.getCurrentObject();

        var oldPlayheadPosition = currentObject.playheadPosition;
        var newPlayheadPosition = Math.floor(playheadX/frameWidth);

        if(newPlayheadPosition != oldPlayheadPosition) {
            currentObject.playheadPosition = newPlayheadPosition;
            wickEditor.syncInterfaces();
        }

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

        var layerCount = 0;
        currentObject.layers.forEach(function (layer) {
            var frameCount = 0;
            layer.frames.forEach(function (frame) {
                
                ctx.fillStyle = "#BBBBBB";
                if (frameCount == currentObject.playheadPosition && layerCount == currentObject.currentLayer) {
                    ctx.fillStyle = "#DDDDDD";
                }

                ctx.fillRect(
                    frameCount*frameWidth, layerCount*frameHeight,
                    frameWidth*frame.frameLength, frameHeight);

                frameCount += frame.frameLength;
            });
            layerCount++;
        });

        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(playheadX,0);
        ctx.lineTo(playheadX,canvas.height);
        ctx.stroke();

    }

    window.addEventListener('resize', function(e) {
        that.resize();
    });
    this.resize();

    canvas.addEventListener('mousedown', function(e) {
        mouse.down = true;
        playheadX = e.offsetX;
        that.syncWithEditorState();
        that.redraw();
    });
    canvas.addEventListener('mouseup', function(e) {
        mouse.down = false;
        that.redraw();
    });
    canvas.addEventListener('mousemove', function(e) {
        if(mouse.down) {
            playheadX = e.offsetX;
        }
        that.syncWithEditorState();
        that.redraw();
    });

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
