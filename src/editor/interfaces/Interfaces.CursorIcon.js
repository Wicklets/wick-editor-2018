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

    var self = this;

    var cursorIconDiv = document.getElementById('cursorIcon');

    this.setup = function () {
        document.body.addEventListener('mousemove', function(e) { 

            var imgOffset = {x:5, y:15}

            if(wickEditor.currentTool instanceof Tools.FillBucket) {
                imgOffset.x = 0;
                imgOffset.y = 2;
            } else if (wickEditor.currentTool instanceof Tools.Dropper) {
                imgOffset.x = 15;
                imgOffset.y = -29;
            }

            cursorIconDiv.style.top = e.y + imgOffset.y + 'px';
            cursorIconDiv.style.left = e.x + imgOffset.x + 'px';
        });
    }

    this.syncWithEditorState = function () {

    }

    this.hide = function () {
        cursorIconDiv.style.display = 'none';
    }

    this.setImageForPaperEvent = function (event) {
        hitResult = wickEditor.canvas.getInteractiveCanvas().getItemAtPoint(event.point);

        if(hitResult && hitResult.item && hitResult.item._cursor)
            wickEditor.canvas.getCanvasContainer().style.cursor = hitResult.item._cursor;
        else
            wickEditor.canvas.updateCursor();

        if(hitResult && hitResult.item) {
            if (hitResult.item._wickInteraction) {
                self.hide()
            } else if(hitResult.item.parent && hitResult.item.parent._isPartOfGroup) {
                self.hide()
            } else if(hitResult.type === 'curve' || hitResult.type === 'stroke') {
                console.log('curve'); 
                self.setImage('resources/cursor-curve.png')

            } else if(hitResult.type === 'fill') {
                self.setImage('resources/cursor-fill.png')
                console.log('fill'); 
            } else if(hitResult.type === 'segment' ||
                      hitResult.type === 'handle-in' ||
                      hitResult.type === 'handle-out') {
                console.log('segment'); 
                self.setImage('resources/cursor-segment.png')
            } else {
                self.hide()
            }
        } else {
            self.hide()
        }
    }

    this.setImage = function (url, color) {
        if(color) {
            cursorIconDiv.style.backgroundColor = color;
        } else {
            cursorIconDiv.style.backgroundColor = 'rgba(0,0,0,0)';
        }
        cursorIconDiv.style.backgroundImage = 'url('+url+')'
        cursorIconDiv.style.display = "block";
    }

}