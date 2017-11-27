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
    
var PixiCanvas = function (wickEditor) {

	var self = this;

    var pixiRenderer;
    var canvasContainer;

    var intervalID;

    this.setup = function () {
        this.playing = false;

        canvasContainer = document.createElement('div');
        canvasContainer.id = 'previewRenderContainer';
        canvasContainer.style.width = wickEditor.project.width+'px';
        canvasContainer.style.height = wickEditor.project.height+'px';
        document.getElementById('editorCanvasContainer').appendChild(canvasContainer);
        pixiRenderer = new WickPixiRenderer(canvasContainer);
    }

    this.update = function () {
        updateCanvasTransforms();
        canvasContainer.style.display = 'block';
        // TODO render onion skin + sibling objects here
        pixiRenderer.renderWickObjects(wickEditor.project, wickEditor.project.rootObject.getAllActiveChildObjects(), 2, false);
    }

    this.startFastRendering = function () {
        wickEditor.canvas.getFabricCanvas().hide();
        wickEditor.canvas.getPaperCanvas().hide();

        function proceed () {
            pixiRenderer.renderWickObjects(wickEditor.project, wickEditor.project.rootObject.getAllActiveChildObjects(), 2, true);
        }

        proceed();
        loopInterval = setInterval(proceed, 1000/60);
    }

    this.stopFastRendering = function () {
        wickEditor.canvas.getFabricCanvas().show();
        wickEditor.canvas.getPaperCanvas().show();

        clearInterval(intervalID);
    }

    this.getRenderer = function () {
        return {
            renderer: pixiRenderer,
            canvasContainer: canvasContainer
        };
    }

    this.updateViewTransforms = function () {
        updateCanvasTransforms();
    }

    function updateCanvasTransforms () {
        var pan = wickEditor.canvas.getFabricCanvas().getPan();
        var zoom = wickEditor.canvas.getFabricCanvas().canvas.getZoom();

        var width = wickEditor.project.width;
        var height = wickEditor.project.height;

        //pan = {x:0,y:0}
        var tx = (pan.x)+width *2*(zoom-1)/2;
        var ty = (pan.y)+height*2*(zoom-1)/2;
        tx -= width /2*(zoom);
        ty -= height/2*(zoom);
        var transform = 'translate('+tx+'px,'+ty+'px) scale('+zoom+', '+zoom+')';
        canvasContainer.style.width = (width*2)+'px';
        canvasContainer.style.height = (height*2)+'px';
        canvasContainer.style.paddingLeft = '0px';//(pan.x*zoom)+'px';
        canvasContainer.style.paddingRight = '0px';
        canvasContainer.style.paddingTop = '0px';//(pan.y*zoom)+'px';
        canvasContainer.style.paddingBottom = '0px';
        canvasContainer.style["-ms-transform"] = transform;
        canvasContainer.style["-webkit-transform"] = transform;
        canvasContainer.style["transform"] = transform;
    }
	
}