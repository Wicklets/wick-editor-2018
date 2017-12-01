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
    
var TimelineInterface = function (wickEditor) {

    var self = this;

    var lastObject;

    var timeline;

    //var cssVars;
    //var cssVar;

    self.setup = function () {

        // Load style vars from CSS
        window.cssVars = window.getComputedStyle(document.body);
        window.cssVar = function (varName) {
            return parseInt(cssVars.getPropertyValue(varName));
        }

        // Build timeline in DOM
        timeline = new TimelineInterface.Timeline(wickEditor);
        timeline.build();
    }

    self.syncWithEditorState = function () {

        if (lastObject !== wickEditor.project.currentObject || wickEditor.project.currentObject.framesDirty) {
            wickEditor.project.currentObject.framesDirty = false;
            lastObject = wickEditor.project.currentObject;

            timeline.rebuild();
        }

        timeline.update();

    }

    self.getElem = function () {
        return timeline;
    }

    self.resetScrollbars = function () {
        timeline.horizontalScrollBar.reset();
        timeline.verticalScrollBar.reset();
    }

}

TimelineInterface.Timeline = function (wickEditor) {
    this.elem = null;

    this.layersContainer = new TimelineInterface.LayersContainer(wickEditor, this);
    this.framesContainer = new TimelineInterface.FramesContainer(wickEditor, this);
    this.horizontalScrollBar = new TimelineInterface.HorizontalScrollBar(wickEditor, this);
    this.verticalScrollBar = new TimelineInterface.VerticalScrollBar(wickEditor, this);
    this.numberLine = new TimelineInterface.NumberLine(wickEditor, this);
    this.playhead = new TimelineInterface.Playhead(wickEditor, this);

    this.interactions = new TimelineInterface.Interactions(wickEditor, this);
    this.interactions.setup();

    var onionSkinningButton;

    this.build = function () {
        this.elem = document.createElement('div');
        document.getElementById('timelineGUI').appendChild(this.elem);

        this.framesContainer.build();
        this.elem.appendChild(this.framesContainer.elem);

        this.layersContainer.build();
        this.elem.appendChild(this.layersContainer.elem);

        this.numberLine.build();
        this.elem.appendChild(this.numberLine.elem);

        this.playhead.build();
        this.elem.appendChild(this.playhead.elem);

        var hideNumberlinePiece = document.createElement('div');
        hideNumberlinePiece.className = 'hide-number-line-piece';
        this.elem.appendChild(hideNumberlinePiece);
        
        var hideLayersPiece = document.createElement('div');
        hideLayersPiece.className = 'layer-toolbar';
        this.elem.appendChild(hideLayersPiece);

        var addLayerButton = document.createElement('div');
        addLayerButton.className = 'layer-tools-button add-layer-button tooltipElem';
        addLayerButton.setAttribute('alt', "Add Layer");
        addLayerButton.addEventListener('mousedown', function (e) {
            wickEditor.guiActionHandler.doAction('addLayer');
        });
        this.elem.appendChild(addLayerButton);

        var deleteLayerButton = document.createElement('div');
        deleteLayerButton.className = 'layer-tools-button delete-layer-button tooltipElem';
        deleteLayerButton.setAttribute('alt', "Delete Layer");
        deleteLayerButton.addEventListener('mousedown', function (e) {
            wickEditor.guiActionHandler.doAction('removeLayer');
        });
        this.elem.appendChild(deleteLayerButton);

        onionSkinningButton = document.createElement('div');
        onionSkinningButton.className = 'layer-tools-button onion-skin-button tooltipElem';
        onionSkinningButton.setAttribute('alt', "Toggle Onion Skinning");
        onionSkinningButton.style.backgroundColor = wickEditor.project.onionSkinning ? 'orange' : '#F0EFEF';
        onionSkinningButton.addEventListener('mousedown', function (e) {
            wickEditor.project.onionSkinning = !wickEditor.project.onionSkinning;
            wickEditor.syncInterfaces();
        });
        this.elem.appendChild(onionSkinningButton);


        var previewPlayButton = document.createElement('div');
        previewPlayButton.className = 'layer-tools-button play-preview-button tooltipElem';
        previewPlayButton.setAttribute('alt', "Play Preview (Enter)<br/>(Shift+Click to loop)");
        previewPlayButton.addEventListener('mousedown', function (e) {
            wickEditor.guiActionHandler.doAction('previewPlay', {loop:e.shiftKey});
        });
        this.elem.appendChild(previewPlayButton);

        var previewPauseButton = document.createElement('div');
        previewPauseButton.className = 'layer-tools-button pause-preview-button tooltipElem';
        previewPauseButton.setAttribute('alt', "Pause Preview (Enter)");
        previewPauseButton.addEventListener('mousedown', function (e) {
            wickEditor.guiActionHandler.doAction('previewPause');
        });
        this.elem.appendChild(previewPauseButton);

        /*var previewStepForwardButton = document.createElement('div');
        previewStepForwardButton.className = 'layer-tools-button step-forward-preview-button tooltipElem';
        previewStepForwardButton.setAttribute('alt', "Step Forwards (.)");
        previewStepForwardButton.addEventListener('mousedown', function (e) {
            wickEditor.guiActionHandler.doAction('movePlayheadRight');
        });
        this.elem.appendChild(previewStepForwardButton);

        var previewStepBackwardButton = document.createElement('div');
        previewStepBackwardButton.className = 'layer-tools-button step-backward-preview-button tooltipElem';
        previewStepBackwardButton.setAttribute('alt', "Step Backwards (,)");
        previewStepBackwardButton.addEventListener('mousedown', function (e) {
            wickEditor.guiActionHandler.doAction('movePlayheadLeft');
        });
        this.elem.appendChild(previewStepBackwardButton);*/

        this.horizontalScrollBar.build();
        this.elem.appendChild(this.horizontalScrollBar.elem);

        /*var hideScrollbarConnectPiece  = document.createElement('div'); 
        hideScrollbarConnectPiece.className = 'hide-scrollbar-connect-piece';
        this.elem.appendChild(hideScrollbarConnectPiece); */
        var zoomBox = document.createElement('div');
        zoomBox.className = 'zoom-box';
        this.elem.appendChild(zoomBox);
        self.numberInput = new SlideyNumberInput({
            onsoftchange: function (e) {
                wickEditor.canvas.getFabricCanvas().setZoom(e/100, true);
            },
            onhardchange: function (e) {
                wickEditor.canvas.getFabricCanvas().setZoom(e/100, true);
            },
            min: 1,
            max: 500,
            moveFactor: 0.5,
            initValue: 100,
        });
        self.numberInput.className = 'timeline-number-input';
        zoomBox.appendChild(self.numberInput);
        var zoomIcon = document.createElement('div');
        zoomIcon.className = 'timeline-zoom-icon';
        zoomIcon.onclick = function () {
            wickEditor.canvas.getFabricCanvas().recenterCanvas();
            wickEditor.syncInterfaces();
        }
        zoomBox.appendChild(zoomIcon);
        var zoomPercentSign = document.createElement('div');
        zoomPercentSign.className = 'timeline-zoom-percent-sign';
        zoomPercentSign.innerHTML = '%'
        zoomBox.appendChild(zoomPercentSign);

        this.verticalScrollBar.build();
        this.elem.appendChild(this.verticalScrollBar.elem);
    }
    
    this.rebuild = function () {
        this.layersContainer.rebuild();
        this.framesContainer.rebuild();
        this.numberLine.rebuild();
    }

    this.update = function () {
        this.layersContainer.update();
        this.framesContainer.update();
        this.elem.style.height = this.calculateHeight() + "px";

        this.numberLine.update();
        this.playhead.update();

        this.horizontalScrollBar.update();
        this.verticalScrollBar.update();

        onionSkinningButton.style.backgroundColor = wickEditor.project.onionSkinning ? 'orange' : '#F0EFEF';

        this.updateZoomBox();

        resetFrameSize();
    }

    this.updateZoomBox = function () {
        self.numberInput.value = Math.floor(wickEditor.canvas.getFabricCanvas().getCanvasTransform().zoom * 100);
    }

    this.calculateHeight = function () {
        var maxTimelineHeight = cssVar("--max-timeline-height");
        var expectedTimelineHeight = this.layersContainer.layers.length * cssVar("--layer-height") + 44; 
        return Math.min(expectedTimelineHeight, maxTimelineHeight); 
    }

    var resetFrameSize = function () {
        var newFrameWidth = 20;
        var newHandleWidth = 5;
        document.body.style.setProperty('--frame-width', newFrameWidth+'px');
        document.body.style.setProperty('--frame-handle-width', newHandleWidth+'px');
    }
}
