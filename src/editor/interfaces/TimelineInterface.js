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
            document.getElementById('frameIdentifier').value = (currentFrame.identifier) ? currentFrame.identifier : "";
            document.getElementById('frameAutoplayCheckbox').checked = currentFrame.autoplay;
        } else {
            document.getElementById('frameProperties').style.display = "none"
        }

    }

    this.resize = function () {
        var GUIWidth = parseInt($("#timelineGUI").css("width"));
        $("#timelineGUI").css('left', (window.innerWidth/2 - GUIWidth/2)+'px');

        canvas.width = GUIWidth;

        that.redraw();
    }

    this.redraw = function () {

        ctx.clearRect(0,0,canvas.width,canvas.height);

        ctx.fillStyle = "#EEEEEE";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        var currentObject = wickEditor.project.getCurrentObject();

    // Update canvas size

        canvas.height = 12 + frameHeight*currentObject.layers.length;

    // Draw grid

        for(var l = 0; l < currentObject.layers.length; l++) {
            for(var f = 0; f < /*currentObject.getTotalTimelineLength()*/ 40; f++) {
                ctx.fillStyle = "#AAAAAA";
                ctx.font = "10px sans-serif";
                ctx.fillText(f, f*frameWidth+2, frameHeight*currentObject.layers.length+10);

                ctx.fillStyle = "#DDDDDD";
                ctx.fillRect(
                    f*frameWidth, l*frameHeight,
                    frameWidth, frameHeight);
                ctx.fillRect(
                    f*frameWidth-1, l*frameHeight,
                    2, frameHeight+10);

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

                ctx.fillStyle = "#999999";
                ctx.fillRect(
                    frameCount*frameWidth, layerCount*frameHeight,
                    frameWidth*frame.frameLength, frameHeight);
                
                ctx.fillStyle = "#CCCCCC";
                if (frame == currentObject.getCurrentFrame() && layerCount == currentObject.currentLayer) {
                    ctx.fillStyle = "#DDDDDD";
                }

                ctx.fillRect(
                    frameCount*frameWidth + 1, layerCount*frameHeight + 1,
                    frameWidth*frame.frameLength - 2, frameHeight - 2);

                /*for(var f = 1; f < frame.frameLength; f++) {
                    ctx.fillStyle = "#CCCCCC";
                    ctx.fillRect(
                        (frameCount+f)*frameWidth, layerCount*frameHeight + 1,
                        1, frameHeight - 2);
                }*/

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

    this.updatePlayheadPosition = function (x,y) {
        playheadX = x;

        var currentObject = wickEditor.project.getCurrentObject();

        var oldPlayheadPosition = currentObject.playheadPosition;
        var newPlayheadPosition = Math.floor(playheadX/frameWidth);

        var oldLayer = currentObject.currentLayer;
        var newLayer = Math.floor(y/frameHeight);
        
        if(newPlayheadPosition != oldPlayheadPosition || newLayer != oldLayer) {
            currentObject.playheadPosition = newPlayheadPosition;
            currentObject.currentLayer = newLayer;
            wickEditor.syncInterfaces();
        }
    }

    canvas.addEventListener('mousedown', function(e) {
        mouseDown = true;
        that.updatePlayheadPosition(e.offsetX,e.offsetY);
        that.redraw();
    });
    canvas.addEventListener('mouseup', function(e) {
        mouseDown = false;
        that.updatePlayheadPosition(e.offsetX,e.offsetY);
        that.redraw();
    });
    canvas.addEventListener('mousemove', function(e) {
        if(mouseDown) {
            that.updatePlayheadPosition(e.offsetX,e.offsetY);
        }
        that.redraw();
    });

    // 
    document.getElementById('frameAutoplayCheckbox').onchange = function () {
        wickEditor.project.getCurrentObject().getCurrentFrame().autoplay = this.checked;
    };

    $('#frameIdentifier').on('input propertychange', function () {
        var currentObject = wickEditor.project.getCurrentObject();
        var currentFrame = currentObject.getCurrentFrame();

        var newName = $('#frameIdentifier').val();
        if(newName === '') {
            currentFrame.identifier = undefined;
        } else {
            currentFrame.identifier = newName;
        }

        console.log(currentFrame.identifier)
    });

}
