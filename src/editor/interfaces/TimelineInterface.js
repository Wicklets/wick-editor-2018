/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var TimelineInterface = function (wickEditor) {

    var that = this;

    var canvas = document.getElementById("timelineCanvas");
    var ctx = canvas.getContext("2d");

    var frameWidth = 18;
    var frameHeight = 32;

    var playheadX = frameWidth / 2;

    var mouseDown = false;

    var scrollbarX = 0;

    document.getElementById("timelineScrollbar").onscroll = function () {that.syncWithEditorState()};

    document.getElementById("enableOnionSkinningButton").onclick = function () {
        wickEditor.project.onionSkinning = true;
        wickEditor.syncInterfaces();
    }
    document.getElementById("disableOnionSkinningButton").onclick = function () {
        wickEditor.project.onionSkinning = false;
        wickEditor.syncInterfaces();
    }

    this.setup = function () {
        
    }

    this.syncWithEditorState = function () {

        var currentObject = wickEditor.project.getCurrentObject();
        var currentFrame = currentObject.getCurrentFrame();

        var playheadPosition = currentObject.playheadPosition;
        var interfacePlayheadPosition = Math.floor(playheadX/frameWidth);

        if(playheadPosition != interfacePlayheadPosition) {
            playheadX = playheadPosition * frameWidth + frameWidth/2;
        }

        scrollbarX = document.getElementById("timelineScrollbar").scrollLeft/5;

        that.redraw();

        if(currentFrame) {
            document.getElementById('frameProperties').style.display = "block";
            document.getElementById('frameIdentifier').value = (currentFrame.identifier) ? currentFrame.identifier : "";
            $('#frameIdentifier').prop('disabled', false);
        } else {
            document.getElementById('frameProperties').style.display = "block";
            document.getElementById('frameIdentifier').value = "";
            $('#frameIdentifier').prop('disabled', true);
        }

        if(wickEditor.project.onionSkinning) {
            document.getElementById("enableOnionSkinningButton").style.display = "none";
            document.getElementById("disableOnionSkinningButton").style.display = "inline";
        } else {
            document.getElementById("enableOnionSkinningButton").style.display = "inline";
            document.getElementById("disableOnionSkinningButton").style.display = "none";
        }

    }

    this.resize = function () {
        var GUIWidth = (window.innerWidth-310);

        //document.getElementById('timelineGUI').style.width = GUIWidth + 'px';
        //$("#timelineGUI").css('left', (window.innerWidth/2 - GUIWidth/2)+'px');
        //$("#timelineGUI").css('left', 200+'px');
        canvas.width = GUIWidth;

        that.redraw();
    }

    this.redraw = function () {

        ctx.clearRect(0,0,canvas.width,canvas.height);

        ctx.fillStyle = "#EEEEEE";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        var currentObject = wickEditor.project.getCurrentObject();

    // Update canvas size

        canvas.height = 15 + frameHeight*currentObject.layers.length;

    // Translate whole canvas content for scrollbar

        ctx.save();
        ctx.translate(-scrollbarX*5, 0);

    // Draw grid

        for(var l = 0; l < currentObject.layers.length; l++) {
            for(var f = 0; f < /*currentObject.getTotalTimelineLength()*/ 500; f++) {
                ctx.fillStyle = "#AAAAAA";
                ctx.font = "10px sans-serif";
                ctx.fillText(f+1, f*frameWidth+2, frameHeight*currentObject.layers.length+10);

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

                if (!frame.autoplay) {
                    ctx.fillStyle = "#FF6666";
                    ctx.fillRect(
                        frameCount*frameWidth + 1, layerCount*frameHeight + 1,
                        frameWidth/2, frameHeight - 2);
                }

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
        ctx.lineTo(playheadX,canvas.height-12);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(playheadX-5,canvas.height-12);
        ctx.lineTo(playheadX+5,canvas.height-12);
        ctx.lineTo(playheadX,  canvas.height-17);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(playheadX-5,0);
        ctx.lineTo(playheadX+5,0);
        ctx.lineTo(playheadX,  5);
        ctx.fill();

        ctx.restore();

    }

    window.addEventListener('resize', function(e) {
        that.resize();
    });
    this.resize();

    this.updatePlayheadPosition = function (x,y) {
        var currentObject = wickEditor.project.getCurrentObject();

        playheadX = x + scrollbarX*5;

        var oldPlayheadPosition = currentObject.playheadPosition;
        var newPlayheadPosition = Math.floor(playheadX/frameWidth);

        var oldLayer = currentObject.currentLayer;
        var newLayer = Math.floor(y/frameHeight);
        newLayer = Math.min(currentObject.layers.length-1, newLayer);

        if(newPlayheadPosition != oldPlayheadPosition) {
            wickEditor.interfaces.fabric.onionSkinsDirty = true;
            if(!currentObject.isRoot && currentObject.playheadPosition === 0) currentObject.regenBoundingBox();
            wickEditor.interfaces.fabric.getObjectsImage(function (imgData) {
                var currentFrame = currentObject.getCurrentFrame();
                if(imgData && currentFrame) currentFrame.cachedImageData = imgData;

                currentObject.playheadPosition = newPlayheadPosition;
                currentObject.currentLayer = newLayer;
                wickEditor.syncInterfaces();
            });
        }

        if(newLayer != oldLayer) {
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
    canvas.addEventListener('mouseout', function(e) {
        mouseDown = false;
    });

    $('#frameIdentifier').on('input propertychange', function () {
        var currentObject = wickEditor.project.getCurrentObject();
        var currentFrame = currentObject.getCurrentFrame();

        var newName = $('#frameIdentifier').val();
        if(newName === '') {
            currentFrame.identifier = undefined;
        } else {
            currentFrame.identifier = newName;
        }
    });

}
