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

TimelineInterface.PlayRange = function (wickEditor, timeline) {
    var that = this;

    this.elem = null;

    this.handleRight = null;
    this.handleLeft = null;

    this.header = null;
    this.body = null;

    var label;
    var labelBg;
    var labelText;

    this.wickPlayrange = null;

    this.build = function () {
        this.elem = document.createElement('div');
        this.elem.addEventListener('mousedown', function (e) {
            return;

            wickEditor.project.clearSelection();
            wickEditor.project.selectObject(that.wickPlayrange);
            wickEditor.syncInterfaces();

            timeline.interactions.start("dragPlayRange", e, {playrange:that});

            e.stopPropagation();
        });
        this.elem.className = 'playrange';

        this.header = document.createElement('div');
        this.header.className = "playrange-header";
        this.elem.appendChild(this.header);

        this.body = document.createElement('div');
        this.body.className = "playrange-body";
        this.elem.appendChild(this.body);

        var width = this.wickPlayrange.getLength()*cssVar('--frame-width');
        var widthOffset = -2;
        this.elem.style.width = width + widthOffset+'px'

        var left = this.wickPlayrange.getStart()*cssVar('--frame-width');
        var leftOffset = cssVar('--frames-cell-first-padding')*2+1;
        this.elem.style.left  = left + leftOffset + 'px';

        this.handleRight = document.createElement('div');
        this.handleRight.className = 'playrange-handle playrange-handle-right';
        this.handleRight.addEventListener('mousedown', function (e) {
            timeline.interactions.start("dragPlayRangeEnd", e, {playrange:that});
            e.stopPropagation()
        });
        this.elem.appendChild(this.handleRight);

        this.handleLeft = document.createElement('div');
        this.handleLeft.className = 'playrange-handle playrange-handle-left';
        this.handleLeft.addEventListener('mousedown', function (e) {
            timeline.interactions.start("dragPlayRangeStart", e, {playrange:that});
            e.stopPropagation()
        });
        this.elem.appendChild(this.handleLeft);

        label = document.createElement('div');
        label.className = 'playrange-label'
        label.innerHTML = this.wickPlayrange.identifier;
        this.elem.appendChild(label);

        labelBg = document.createElement('div');
        labelBg.className = 'playrange-label-bg';
        label.appendChild(labelBg);

        labelText = document.createElement('div');
        labelText.className = 'playrange-label-text';
        labelText.innerHTML = this.wickPlayrange.identifier;
        label.appendChild(labelText);
    }

    this.update = function () {
        this.header.style.backgroundColor = this.wickPlayrange.color;
        this.body.style.backgroundColor = this.wickPlayrange.color;

        //label.innerHTML = this.wickPlayrange.identifier;
        labelText.innerHTML = this.wickPlayrange.identifier;

        if(wickEditor.project.isObjectSelected(this.wickPlayrange)) {
            //this.elem.className = 'playrange playrange-selected'
            this.body.style.display = "block";
            this.elem.style.height = '1000px';
            this.handleRight.style.display = "block";
            this.handleLeft.style.display = "block";
        } else {
            //this.elem.className = 'playrange'
            this.body.style.display = "none";
            this.elem.style.height = '0px';
            this.handleRight.style.display = "none";
            this.handleLeft.style.display = "none";
        }
    }

    this.rebuild = function () {
        
    }
}