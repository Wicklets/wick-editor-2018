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

    var spectrumContainer;

    var colorPickerContainer;
    var currentColor;
    var currentDoneFn;

    var isOpen;

    self.setup = function () {
        isOpen = false;

        colorPickerContainer = document.getElementById('colorPickerGUI');
        colorPickerContainer.style.display = 'none';

        var closeButton = document.createElement('div');
        closeButton.className = 'color-picker-close-button';
        closeButton.onclick = function () {
            self.close();
        }
        colorPickerContainer.appendChild(closeButton);

        colorPicker = document.createElement('input');
        colorPicker.type = 'text';
        colorPicker.id = random.uuid4();
        colorPickerContainer.appendChild(colorPicker);

        spectrumContainer = $("#"+colorPicker.id);
        spectrumContainer.spectrum({
            flat: true,
            //color: "rgba(0,0,0,1.0)",
            showInput: true,
            showButtons: false,
            className: "full-spectrum",
            showInitial: true,
            showPalette: true,
            showSelectionPalette: true,
            maxSelectionSize: 10,
            preferredFormat: "hex",
            localStorageKey: "spectrum.demo",
            showAlpha: true,
            maxSelectionSize: 6,
            move: function (color) {
                currentColor = color.toString();
            },
            show: function () {

            },
            beforeShow: function () {},
            hide: function (color) {},
            change: function(color) { 
                currentColor = color.toString();
            },
            palette: [
                ["rgba(0,0,0,1)",   
                 "rgba(67,67,67,1)",  
                 "rgba(102,102,102,1)", 
                 "rgba(204,204,204,1)", 
                 "rgba(217,217,217,1)", 
                 "rgba(255,255,255,1)"],
                ["rgba(255,0,0,1,1)", 
                 "rgba(255,153,0,1,1)", 
                 "rgba(255,255,0,1,1)",    
                 "rgba(0,255,0,1,1)",      
                 "rgba(0,181,255,1,1)",    
                 "rgba(181,0,255,1)"], 
                ["rgba(0,0,0,0)"], 
            ]
        });

        var dropperButton = document.createElement('div');
        dropperButton.className = 'color-picker-dropper-button';
        dropperButton.onclick = function () {
            wickEditor.changeTool(wickEditor.tools.dropper);
        }
        colorPickerContainer.appendChild(dropperButton);

        window.addEventListener('mousedown', function(e) { 
            if(!isOpen) return;

            var t = e.target;
            if (t.className === 'upper-canvas ' && wickEditor.currentTool === wickEditor.tools.dropper) {
                wickEditor.tools.dropper.getColorAtCursor(function (color) {
                    wickEditor.useLastUsedTool();
                    currentColor = color;
                    self.close();
                });
            } else if(!elementInsideElement(t, colorPickerContainer)) {
                self.close();
            }
        });

        window.addEventListener('mouseup', function(e) { 
            if(!isOpen) return;

            var t = e.target;
            if (t.className === 'sp-thumb-inner') {
                setTimeout(function () {
                    self.close();
                }, 10);
            }
        });
    }

    self.open = function (doneFn,color,x,y) {
        if(!x) x = wickEditor.inputHandler.mouse.x;
        if(!y) y = wickEditor.inputHandler.mouse.y;

        wickEditor.syncInterfaces();

        isOpen = true;

        currentDoneFn = doneFn;

        spectrumContainer.spectrum("set", color);

        colorPickerContainer.style.display = 'block';
        var buffer = 10;
        var bbox = colorPickerContainer.getBoundingClientRect();
        var boundX = Math.min(x, window.innerWidth - bbox.width - buffer);
        var boundY = Math.min(y, window.innerHeight - bbox.height - buffer);
        colorPickerContainer.style.left = boundX+"px";
        colorPickerContainer.style.top = boundY+"px";
    }

    self.close = function () {
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
