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

TimelineInterface.AddFrameOverlay = function (wickEditor, timeline) {
    this.elem = null;

    var that = this;

    this.build = function () {
        this.elem = document.createElement('div');
        this.elem.className = 'add-frame-overlay';
        this.elem.style.display = 'none';

        var addFrameOverlayImg = document.createElement('img');
        addFrameOverlayImg.className = 'add-frame-overlay-img';
        addFrameOverlayImg.src = 'resources/plus-24-512.png';
        this.elem.appendChild(addFrameOverlayImg);
    }

    this.update = function () {
        
    }
}