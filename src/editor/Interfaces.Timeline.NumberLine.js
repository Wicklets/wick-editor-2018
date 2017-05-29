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

TimelineInterface.NumberLine = function (wickEditor, timeline) {
    var that = this;

    this.elem = null;

    this.playRanges = null;

    var numberlineContainer;
    var numbers = [];

    this.build = function () {
        this.elem = document.createElement('div');
        this.elem.className = 'number-line';

        numberlineContainer = document.createElement('span');
        numberlineContainer.className = 'numberline-container';
        this.elem.appendChild(numberlineContainer);
        

        this.elem.addEventListener('mousedown', function (e) {
            var start = Math.round((e.clientX - timeline.framesContainer.elem.getBoundingClientRect().left - cssVar('--frame-width')/2) / cssVar('--frame-width'));
            
            var playRange = new WickPlayRange(start, start+1);
            wickEditor.actionHandler.doAction('addPlayRange', {playRange: playRange});
            wickEditor.project.clearSelection();
            wickEditor.project.selectObject(playRange);

            e.stopPropagation();
        });

        this.playRanges = [];
    }

    this.update = function () {
        var shift = -timeline.horizontalScrollBar.getScrollPosition();

        this.elem.style.left = shift+cssVar('--layers-width')+'px';

        numberlineContainer.style.left = -shift+(shift%cssVar('--frame-width'))+'px';

        this.playRanges.forEach(function (playRange) {
            playRange.update();
        });

        for(var i = 0; i < numbers.length; i++) {
            numbers[i].innerHTML = i+1+Math.floor(-shift/cssVar('--frame-width'));
        }
    }

    this.rebuild = function () {

        this.elem.innerHTML = ''
        this.elem.appendChild(numberlineContainer)
        numberlineContainer.innerHTML = ""

        numbers = []
        for(var i = 0; i < 50; i++) {
            var numberLineCell = document.createElement('div');
            numberLineCell.className = 'number-line-cell';
            numberLineCell.style.left = i*cssVar('--frame-width') +cssVar('--frames-cell-first-padding') + 'px'
            
            var bar = document.createElement('div');
            bar.className = 'number-line-cell-bar';
            numberLineCell.appendChild(bar);

            var number = document.createElement('div');
            number.className = 'number-line-cell-number';
            numberLineCell.appendChild(number);
            numbers.push(number);
            
            numberlineContainer.appendChild(numberLineCell);
        }

        /*this.playRanges.forEach(function (playrange) {
            that.elem.removeChild(playrange.elem);
        });*/

        this.playRanges = [];

        wickEditor.project.getCurrentObject().playRanges.forEach(function (wickPlayrange) {
            var newPlayrange = new TimelineInterface.PlayRange(wickEditor, timeline);
            newPlayrange.wickPlayrange = wickPlayrange;
            newPlayrange.build();
            that.elem.appendChild(newPlayrange.elem);
            that.playRanges.push(newPlayrange)
        });
    }
}