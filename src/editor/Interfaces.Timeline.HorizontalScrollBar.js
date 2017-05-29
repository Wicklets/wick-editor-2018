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

TimelineInterface.HorizontalScrollBar = function (wickEditor, timeline) {
    var that = this;

    this.elem = null;

    var leftButton;
    var rightButton;
    var head;

    var scrollbar;

    var heldDownInterval;

    this.build = function () {
        this.elem = document.createElement('div');
        this.elem.className = 'scrollbar horizontal-scrollbar';

        head = document.createElement('div');
        head.className = 'scrollbar-head scrollbar-head-horizontal';
        head.addEventListener('mousedown', function (e) {
            timeline.interactions.start('dragHorizontalScrollbarHead')
        })
        this.elem.appendChild(head);

        leftButton = document.createElement('div');
        leftButton.className = 'scrollbar-button scrollbar-button-left';
        leftButton.addEventListener('mousedown', function (e) {
            //that.scroll(-10);
            clearInterval(heldDownInterval);
            heldDownInterval = setInterval(function () {
                that.scroll(-3);
            }, 1000/30)
        });
        leftButton.addEventListener('mouseup', function (e) {
            clearInterval(heldDownInterval);
        });
        this.elem.appendChild(leftButton);

        rightButton = document.createElement('div');
        rightButton.className = 'scrollbar-button scrollbar-button-right';
        rightButton.addEventListener('mousedown', function (e) {
            //that.scroll(10);
            clearInterval(heldDownInterval);
            heldDownInterval = setInterval(function () {
                that.scroll(3);
            }, 1000/30)
        });
        rightButton.addEventListener('mouseup', function (e) {
            clearInterval(heldDownInterval);
        });
        this.elem.appendChild(rightButton);

        scrollbar = new Scrollbar(10, 20, 30);
        setTimeout(function () {
            scrollbar.setScrollbarContainerSize(that.elem.offsetWidth-30);
            scrollbar.setViewboxSize(that.elem.offsetWidth);
        }, 100);

        $(window).resize(function() {
            scrollbar.setScrollbarContainerSize(that.elem.offsetWidth-30);
            scrollbar.setViewboxSize(that.elem.offsetWidth);
            that.update()
        });
    }

    this.update = function () {
        var frameCount = wickEditor.project.getCurrentObject().getTotalTimelineLength();
        var buffer = 1000 + window.innerWidth;
        var contentSize = frameCount * cssVar('--frame-width') + buffer;
        scrollbar.setContentSize(contentSize)
        head.style.marginLeft = scrollbar.barPosition + cssVar('--scrollbar-thickness') + 'px';
        head.style.width = scrollbar.barSize + 'px';
    }

    this.scroll = function (scrollAmt) {
        scrollbar.setBarPosition(scrollbar.barPosition + scrollAmt);
        timeline.framesContainer.update();
        timeline.numberLine.update();
        that.update();
    }

    this.getScrollPosition = function () {
        return scrollbar.viewboxPosition;
    }
}