/* Wick - (c) 2017 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/*  This file is part of Wick. 
    
    Wick is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Wick is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Wick.  If not, see <http://www.gnu.org/licenses/>. */
    
var PreviewPlayer = function (wickEditor) {

	var self = this;

    var loopInterval;
    var renderer;
    var canvasContainer;

    this.setup = function () {
        this.playing = false;

        canvasContainer = document.createElement('div');
        canvasContainer.id = 'previewRenderContainer';
        canvasContainer.style.width = wickEditor.project.width+'px';
        canvasContainer.style.height = wickEditor.project.height+'px';
        document.getElementById('editorCanvasContainer').appendChild(canvasContainer);
        renderer = new WickPixiRenderer(canvasContainer);
    }

    this.syncWithEditorState = function () {

    }

    this.play = function (loop) {
        if(self.playing) return;

        self.playing = true;

        updateCanvasTransforms();

        var currObj = wickEditor.project.getCurrentObject();
        if(currObj.playheadPosition >= currObj.getTotalTimelineLength()-1) {
            currObj.playheadPosition = 0;
        }
        renderer.renderWickObjects(wickEditor.project, wickEditor.project.rootObject.getAllActiveChildObjects());

        loopInterval = setInterval(function () {
            var currObj = wickEditor.project.getCurrentObject();

            if(currObj.playheadPosition >= currObj.getTotalTimelineLength()) {
                //wickEditor.project.getCurrentObject().playheadPosition -= 2;
                if(loop) {
                    currObj.playheadPosition = 0;
                } else {
                    currObj.playheadPosition = currObj.getTotalTimelineLength()-1;
                    self.stop();
                    return;
                }
            }

            wickEditor.timeline.getElem().playhead.update();
            wickEditor.project.applyTweens();
            canvasContainer.style.display = 'block';
            document.getElementById('fabricCanvas').style.display = 'none';
            renderer.renderWickObjects(wickEditor.project, wickEditor.project.rootObject.getAllActiveChildObjects());
            //wickEditor.thumbnailRenderer.syncWithEditorState();
            //wickEditor.syncInterfaces();
            currObj.layers.forEach(function (wickLayer) {
                wickLayer.frames.forEach(function (wickFrame) {
                    if(wickFrame._soundDataForPreview && wickFrame.playheadPosition === currObj.playheadPosition) 
                        wickFrame._soundDataForPreview.howl.play()
                });
            });
            currObj.playheadPosition ++;
            
        }, 1000/wickEditor.project.framerate);
    }

    this.stop = function () {
        if(!self.playing) return;

        clearInterval(loopInterval)
        document.getElementById('fabricCanvas').style.display = 'block';
        canvasContainer.style.display = 'none'
        self.playing = false;

        //wickEditor.project.rootObject.applyTweens();
        wickEditor.project.applyTweens();
        wickEditor.syncInterfaces();
    }

    this.togglePlaying = function () {
        if(self.playing) {
            self.stop();
        } else {
            self.play();
        }
    }

    this.startFastRendering = function () {
        this.playing = true;
        document.getElementById('fabricCanvas').style.display = 'none';
        updateCanvasTransforms()
        renderer.renderWickObjects(wickEditor.project, wickEditor.project.rootObject.getAllActiveChildObjects());
    }

    this.stopFastRendering = function () {
        this.playing = false;
        canvasContainer.style.display = 'none';
        document.getElementById('fabricCanvas').style.display = 'block';
    }

    this.doFastRender = function () {
        canvasContainer.style.display = 'block';
        document.getElementById('fabricCanvas').style.display = 'none';
        updateCanvasTransforms()
        wickEditor.project.applyTweens();
        renderer.renderWickObjects(wickEditor.project, wickEditor.project.rootObject.getAllActiveChildObjects());
    }

    this.getRenderer = function () {
        return {
            renderer: renderer,
            canvasContainer: canvasContainer
        };
    }

    function updateCanvasTransforms () {
        var pan = wickEditor.fabric.getPan();
        var zoom = wickEditor.fabric.canvas.getZoom();
        //pan = {x:0,y:0}
        var tx = pan.x+wickEditor.project.width*(zoom-1)/2;
        var ty = pan.y+wickEditor.project.height*(zoom-1)/2;
        var transform = 'translate('+tx+'px,'+ty+'px) scale('+zoom+', '+zoom+')';
        canvasContainer.style.width = wickEditor.project.width+'px';
        canvasContainer.style.height = wickEditor.project.height+'px';
        canvasContainer.style.paddingLeft = '0px';//(pan.x*zoom)+'px';
        canvasContainer.style.paddingRight = '0px';
        canvasContainer.style.paddingTop = '0px';//(pan.y*zoom)+'px';
        canvasContainer.style.paddingBottom = '0px';
        canvasContainer.style["-ms-transform"] = transform;
        canvasContainer.style["-webkit-transform"] = transform;
        canvasContainer.style["transform"] = transform;
    }
	
}