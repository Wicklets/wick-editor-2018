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

TimelineInterface.Playhead = function (wickEditor, timeline) {
    var self = this;

    self.elem = null;
    self.pos = null;

    var framePosCached = 0;

    self.build = function () {
        self.elem = document.createElement('div');
        self.elem.className = 'playhead';

        var playheadNub = document.createElement('div');
        playheadNub.className = 'playhead-nub';
        self.elem.addEventListener('mousedown', function (e) {
            timeline.interactions.start("dragPlayhead", e, {});
        });
        self.elem.appendChild(playheadNub);

        var playheadBody = document.createElement('div');
        playheadBody.className = 'playhead-body';
        self.elem.appendChild(playheadBody);
    }

    self.update = function () {
        self.setPosition(wickEditor.project.currentObject.playheadPosition * cssVar('--frame-width'));
        snapPosition()
        updateView();
    }

    self.setPosition = function (pos) {
        self.pos = pos;
        updateView();
    }

    self.snap = function () {
        snapPosition();
        updateView();
    }

    self.getFramePosition = function () {
        var framePos = Math.floor(self.pos/cssVar('--frame-width'));
        return framePos;
    }

    self.frameDidChange = function () {
        if(!framePosCached) {
            framePosCached = self.getFramePosition();
            return true;
        } else {
            var newFramePos = self.getFramePosition();
            var frameChanged = newFramePos !== framePosCached;
            framePosCached = newFramePos;
            return frameChanged;
        }
    }

    function updateView () {
        var shift = -timeline.horizontalScrollBar.getScrollPosition();
        self.elem.style.left = (self.pos+132+shift)+'px';
    }

    function snapPosition () {
        self.pos = Math.floor(self.pos/cssVar('--frame-width'))*cssVar('--frame-width')
        self.pos += cssVar('--frame-width')/2;
    }
}
