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
    
var CursorIconInterface = function (wickEditor) {

    var cursorIconDiv = document.getElementById('cursorIcon');

    this.setup = function () {
        document.body.addEventListener('mousemove', function(e) { 

            var imgOffset = {x:5, y:15}

            if(wickEditor.currentTool instanceof Tools.FillBucket) {
                imgOffset.x = 0;
                imgOffset.y = 2;
            }

            cursorIconDiv.style.top = e.y + imgOffset.y + 'px';
            cursorIconDiv.style.left = e.x + imgOffset.x + 'px';
            //console.log(e)
            //console.log(cursorIconDiv)
            //console.log(e)
        });
    }

    this.syncWithEditorState = function () {

    }

    this.hide = function () {
        cursorIconDiv.style.display = 'none';
    }

    this.setImage = function (url) {
        cursorIconDiv.style.backgroundImage = 'url('+url+')'
        cursorIconDiv.style.display = "block";
    }

}