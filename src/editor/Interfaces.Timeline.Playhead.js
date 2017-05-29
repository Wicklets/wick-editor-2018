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
    this.elem = null;
    this.ghostElem = null;

    this.x = null;
    this.ghostX = null;

    this.build = function () {
        this.elem = document.createElement('div');
        this.elem.className = 'playhead';

        this.ghostElem = document.createElement('div');
        this.ghostElem.className = 'playhead playhead-ghost';
        this.ghostElem.style.display = 'none'
    }

    this.update = function () {
        this.x = wickEditor.project.currentObject.playheadPosition * cssVar('--frame-width') + cssVar('--frame-width')/2 - cssVar('--playhead-width')/2 + 9;
        this.elem.style.left = this.x + 'px';

        //this.ghostX = 0 * cssVar('--frame-width') + cssVar('--frame-width')/2 - cssVar('--playhead-width')/2 + 9;
        //this.ghostElem.style.left = this.ghostX + 'px';
    }

    this.setGhostPosition = function (e) {
        var x = e.clientX - timeline.framesContainer.elem.getBoundingClientRect().left - 9
        //x -= cssVar('--frame-width')
        var roundedX = Math.floor(x/cssVar('--frame-width'))*cssVar('--frame-width');
        roundedX += 9;
        roundedX += cssVar('--frame-width')/2;
        this.ghostElem.style.left = roundedX+'px';
    }
}