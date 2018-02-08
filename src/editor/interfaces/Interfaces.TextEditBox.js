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

var TextEditBox = function (wickEditor) {

    var self = this;

    var box;

    this.setup = function () {
        box = document.createElement('textarea');
        box.className = 'canvasTextEdit';
        box.oninput = function () {
            var selectedObj = wickEditor.project.getSelectedObject();
            if(selectedObj) {
                selectedObj.textData.text = box.value;
                selectedObj._renderDirty = true;
                wickEditor.canvas.getInteractiveCanvas().needsUpdate = true;
                wickEditor.syncInterfaces();
            }
        }
        document.getElementById('editorCanvasContainer').appendChild(box);
    }

    this.syncWithEditorState = function () {
        var selectedObj = wickEditor.project.getSelectedObject();

        var textToolSelected = wickEditor.currentTool === wickEditor.tools.text;
        var selectedObjIsText = selectedObj && selectedObj.isText;

        if(selectedObjIsText && textToolSelected) {
            var objAbsPos = selectedObj.getAbsolutePosition();
            var screenSpacePos = wickEditor.canvas.canvasToScreenSpace(objAbsPos.x, objAbsPos.y);

            var x = screenSpacePos.x;
            var y = screenSpacePos.y;
            var w = selectedObj.width;
            var h = selectedObj.height;
            var zoom = wickEditor.canvas.getZoom();
            var TOP_OFFSET = -2;

            box.style.left   = x-(w*zoom/2) + 'px';
            box.style.top    = y-(h*zoom/2)+TOP_OFFSET + 'px';
            box.style.width  = w*zoom+1 + 'px'; // Slightly increase text box size to avoid text box resizing issues.
            box.style.height = h*zoom + 'px';

            box.value = selectedObj.textData.text;

            box.style.fontFamily = selectedObj.textData.fontFamily;
            box.style.fontSize = (selectedObj.textData.fontSize*wickEditor.canvas.getZoom())+'px';
            box.style.textAlign = selectedObj.textData.textAlign;
            box.style.fontWeight = selectedObj.textData.fontWeight;
            box.style.fontStyle = selectedObj.textData.fontStyle;
            box.style.lineHeight = '1.2';
            box.style.display = 'block';
        } else {
            box.style.display = 'none';
        }
    }
}
