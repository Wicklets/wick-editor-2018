/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var TimelineInterface = function (wickEditor) {

    var that = this;

    var canvas = document.getElementById("timelineCanvas");
    var ctx = canvas.getContext("2d");

    var frameWidth = 20;
    var frameHeight = 32;

    var playheadX = frameWidth / 2;

    var mouse = {x:0, y:0, down:false};

    this.syncWithEditorState = function () {

        var currentObject = wickEditor.project.getCurrentObject();

        var playheadPosition = currentObject.playheadPosition;
        var interfacePlayheadPosition = Math.floor(playheadX/frameWidth);

        if(playheadPosition != interfacePlayheadPosition) {
            playheadX = playheadPosition * frameWidth + frameWidth/2;
        }

        that.redraw();

    }

    this.resize = function () {
        var GUIWidth = parseInt($("#timelineGUI").css("width"));
        $("#timelineGUI").css('left', (window.innerWidth/2 - GUIWidth/2)+'px');

        canvas.width = GUIWidth;
        canvas.height = 75;

        that.redraw();
    }

    this.redraw = function () {

        ctx.clearRect(0,0,canvas.width,canvas.height);

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        var currentObject = wickEditor.project.getCurrentObject();

    // Draw grid

        for(var l = 0; l < currentObject.layers.length; l++) {
            //for(var f = 0; f < currentObject.getTotalTimelineLength(); f++) {
            for(var f = 0; f < currentObject.getTotalTimelineLength(); f++) {
                ctx.fillStyle = "#BBBBBB";
                ctx.fillRect(
                    f*frameWidth, l*frameHeight,
                    frameWidth, frameHeight);
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(
                    f*frameWidth + 1, l*frameHeight + 1,
                    frameWidth - 2, frameHeight - 2);
            }
        }

    // Draw frames

        var layerCount = 0;
        currentObject.layers.forEach(function (layer) {
            var frameCount = 0;
            layer.frames.forEach(function (frame) {

                ctx.fillStyle = "#000000";
                ctx.fillRect(
                    frameCount*frameWidth, layerCount*frameHeight,
                    frameWidth*frame.frameLength, frameHeight);
                
                ctx.fillStyle = "#BBBBBB";
                if (frame == currentObject.getCurrentFrame() && layerCount == currentObject.currentLayer) {
                    ctx.fillStyle = "#DDDDDD";
                }

                ctx.fillRect(
                    frameCount*frameWidth + 1, layerCount*frameHeight + 1,
                    frameWidth*frame.frameLength - 2, frameHeight - 2);

                frameCount += frame.frameLength;
            });
            layerCount++;
        });

    // Draw playhead

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

    this.updatePlayheadPosition = function (x) {
        playheadX = x;

        var currentObject = wickEditor.project.getCurrentObject();

        var oldPlayheadPosition = currentObject.playheadPosition;
        var newPlayheadPosition = Math.floor(playheadX/frameWidth);

        if(newPlayheadPosition != oldPlayheadPosition) {
            currentObject.playheadPosition = newPlayheadPosition;
            wickEditor.syncInterfaces();
        }
    }

    canvas.addEventListener('mousedown', function(e) {
        mouse.down = true;
        that.updatePlayheadPosition(e.offsetX);
        that.redraw();
    });
    canvas.addEventListener('mouseup', function(e) {
        mouse.down = false;
        that.updatePlayheadPosition(e.offsetX);
        that.redraw();
    });
    canvas.addEventListener('mousemove', function(e) {
        if(mouse.down) {
            that.updatePlayheadPosition(e.offsetX);
        }
        that.redraw();
    });

    /*$("#addNewFrameButton").on("click", function (e) {
        wickEditor.actionHandler.doAction('addNewFrame');
    });

    $("#extendFrameButton").on("click", function (e) {
        wickEditor.actionHandler.doAction('extendFrame', {nFramesToExtendBy:1});
    });

    $("#shrinkFrameButton").on("click", function (e) {
        wickEditor.actionHandler.doAction('shrinkFrame', {nFramesToShrinkBy:1});
    });*/

}
