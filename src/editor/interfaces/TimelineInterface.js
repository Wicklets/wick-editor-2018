/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var TimelineInterface = function (wickEditor) {

    var that = this;

    var canvas = document.getElementById("timelineCanvas");
    var ctx = canvas.getContext("2d");

    var frameWidth = 20;
    var frameHeight = 32;

    var playheadX = frameWidth / 2;

    var mouseDown = false;

    this.syncWithEditorState = function () {

        var currentObject = wickEditor.project.getCurrentObject();
        var currentFrame = currentObject.getCurrentFrame();

        var playheadPosition = currentObject.playheadPosition;
        var interfacePlayheadPosition = Math.floor(playheadX/frameWidth);

        if(playheadPosition != interfacePlayheadPosition) {
            playheadX = playheadPosition * frameWidth + frameWidth/2;
        }

        that.redraw();

        if(currentFrame) {
            document.getElementById('frameProperties').style.display = "block";
            document.getElementById('frameIdentifier').value = currentFrame.identifier;
            document.getElementById('frameAutoplayCheckbox').checked = currentFrame.autoplay;
        } else {
            document.getElementById('frameProperties').style.display = "none"
        }

    }

    this.resize = function () {
        var GUIWidth = parseInt($("#timelineGUI").css("width"));
        $("#timelineGUI").css('left', (window.innerWidth/2 - GUIWidth/2)+'px');

        canvas.width = GUIWidth;
        canvas.height = 38;

        that.redraw();
    }

    this.redraw = function () {

        ctx.clearRect(0,0,canvas.width,canvas.height);

        ctx.fillStyle = "#EEEEEE";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        var currentObject = wickEditor.project.getCurrentObject();

    // Draw grid

        for(var l = 0; l < currentObject.layers.length; l++) {
            for(var f = 0; f < currentObject.getTotalTimelineLength(); f++) {
                ctx.fillStyle = "#EEEEEE";
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

        ctx.beginPath();
        ctx.moveTo(playheadX-5,canvas.height);
        ctx.lineTo(playheadX+5,canvas.height);
        ctx.lineTo(playheadX,  canvas.height-5);
        ctx.fill();

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
        mouseDown = true;
        that.updatePlayheadPosition(e.offsetX);
        that.redraw();
    });
    canvas.addEventListener('mouseup', function(e) {
        mouseDown = false;
        that.updatePlayheadPosition(e.offsetX);
        that.redraw();
    });
    canvas.addEventListener('mousemove', function(e) {
        if(mouseDown) {
            that.updatePlayheadPosition(e.offsetX);
        }
        that.redraw();
    });

    // 
    document.getElementById('frameAutoplayCheckbox').onchange = function () {
        wickEditor.project.getCurrentObject().getCurrentFrame().autoplay = this.checked;
    };

}
