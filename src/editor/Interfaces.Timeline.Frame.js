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

TimelineInterface.Frame = function (wickEditor, timeline) {
    var that = this;

    var selectionOverlayDiv = null;
    var thumbnailDiv = null;

    this.wickFrame = null;
    this.wickLayer = null;

    var tweens = [];
    var scriptIcon = null;

    this.build = function () {
        var wickLayers = wickEditor.project.getCurrentObject().layers;

        this.elem = document.createElement('div');
        this.elem.className = "frame";
        this.elem.style.left = (that.wickFrame.playheadPosition * cssVar('--frame-width')) - 4 + 'px';
        this.elem.style.top = (wickLayers.indexOf(that.wickLayer) * cssVar('--layer-height')) + 'px';
        this.elem.style.width = (that.wickFrame.length * cssVar('--frame-width') - cssVar('--common-padding')/2) + 'px';
        this.elem.style.height = cssVar('--layer-height')-cssVar('--common-padding')+'px'
        this.elem.wickData = {wickFrame:that.wickFrame};
        this.elem.addEventListener('mouseup', function (e) {
            /*wickEditor.actionHandler.doAction('movePlayhead', {
                obj: wickEditor.project.currentObject,
                newPlayheadPosition: that.wickFrame.playheadPosition,
                newLayer: that.wickFrame.parentLayer
            });
            wickEditor.project.clearSelection()
            wickEditor.project.selectObject(that.wickFrame)
            timeline.framesContainer.update();*/
        });
        this.elem.addEventListener('mousedown', function (e) {

            if(e.button === 2)
                wickEditor.rightclickmenu.openMenu();

            wickEditor.actionHandler.doAction('movePlayhead', {
                obj: wickEditor.project.currentObject,
                newPlayheadPosition: that.wickFrame.playheadPosition + Math.floor((e.offsetX+2) / cssVar('--frame-width')),
                newLayer: that.wickFrame.parentLayer
            });
            if(!wickEditor.project.isObjectSelected(that.wickFrame)) {
                wickEditor.project.clearSelection();
                wickEditor.project.selectObject(that.wickFrame);
                wickEditor.syncInterfaces();
            }

            timeline.interactions.start("dragFrame", e, {
                frames: timeline.framesContainer.getFrames(wickEditor.project.getSelectedObjects())
            });

            e.stopPropagation();
        });
        this.elem.addEventListener('dblclick', function (e) {
            wickEditor.guiActionHandler.doAction('copyFrameForward')
        });

        thumbnailDiv = document.createElement('img');
        thumbnailDiv.className = "frame-thumbnail";
        this.elem.appendChild(thumbnailDiv);

        selectionOverlayDiv = document.createElement('div');
        selectionOverlayDiv.className = "selection-overlay";
        this.elem.appendChild(selectionOverlayDiv);

        var extenderHandleRight = document.createElement('div');
        extenderHandleRight.className = "frame-extender-handle frame-extender-handle-right";
        extenderHandleRight.addEventListener('mousedown', function (e) {
            timeline.interactions.start("dragFrameWidth", e, {frame:that});
            e.stopPropagation();
        });
        this.elem.appendChild(extenderHandleRight);
        
//        var extenderHandleLeft = document.createElement('div');
//        extenderHandleLeft.className = "frame-extender-handle-left";
//        extenderHandleLeft.addEventListener('mousedown', function (e) {
//            timeline.interactions.start("dragFrameWidth", e, {frame:that});
//            e.stopPropagation();
//        });
//        that.elem.appendChild(extenderHandleLeft);

        tweens = [];
        this.wickFrame.tweens.forEach(function (wickTween) {
            var tween = new TimelineInterface.Tween(wickEditor, timeline);
            tween.wickTween = wickTween;
            tween.wickFrame = that.wickFrame;
            tween.build();
            that.elem.appendChild(tween.elem);
            tweens.push(tween)
        });
    }

    this.update = function () {
        var src = this.wickFrame.thumbnail;
        if(this.wickFrame.tweens.length > 0) {
            thumbnailDiv.style.display = 'none';
            this.elem.style.backgroundColor = '#e4eafb';
        } else if(!src || wickEditor.project.smallFramesMode) {
            thumbnailDiv.style.display = 'block';
            thumbnailDiv.src = '/resources/whitepage.png';
            this.elem.style.backgroundColor = wickEditor.project.backgroundColor;//'#FFF';
        } else if(src) {
            thumbnailDiv.style.display = 'block';
            thumbnailDiv.src = src;
            this.elem.style.backgroundColor = wickEditor.project.backgroundColor;//'#FFF';
        }
        
        if (wickEditor.project.isObjectSelected(this.wickFrame)) {
            selectionOverlayDiv.style.display = 'block';
            selectionOverlayDiv.className = 'selection-overlay'
        } else if (this.wickFrame.scriptError) {
            selectionOverlayDiv.style.display = 'block';
            selectionOverlayDiv.className = 'selection-overlay selection-overlay-error'
        } else {
            selectionOverlayDiv.style.display = 'none';
        }

        tweens.forEach(function (tween) {
            tween.update();
        });
    }
}