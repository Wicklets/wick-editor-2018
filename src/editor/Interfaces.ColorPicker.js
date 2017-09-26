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

var ColorPickerInterface = function (wickEditor) {

    var self = this;

    var colorPickerContainer;
    var currentColor;
    var currentDoneFn;

    var isOpen;

    self.setup = function () {
        isOpen = false;

        colorPickerContainer = document.getElementById('colorPickerGUI');
        colorPickerContainer.style.display = 'none';

        window.addEventListener('mousedown', function(e) { 
            if(isOpen && e.target.id !== 'colorPickerGUI') {
                wickEditor.tools.dropper.getColorAtCursor(function (color) {
                    currentColor = color;
                    self.close();
                });
            }
        });
    }

    self.open = function (doneFn,x,y) {
        if(!x) x = wickEditor.inputHandler.mouse.x;
        if(!y) y = wickEditor.inputHandler.mouse.y;

        wickEditor.changeTool(wickEditor.tools.dropper);
        wickEditor.syncInterfaces();

        isOpen = true;

        currentDoneFn = doneFn;

        colorPickerContainer.style.display = 'block';
        colorPickerContainer.style.left = x+"px";
        colorPickerContainer.style.top = y+"px";
    }

    self.close = function () {
        wickEditor.useLastUsedTool();
        isOpen = false;
        currentDoneFn(currentColor);
        colorPickerContainer.style.display = 'none';
    }

    self.syncWithEditorState = function () {

    }

    self.isOpen = function () {
        return isOpen;
    }

}
