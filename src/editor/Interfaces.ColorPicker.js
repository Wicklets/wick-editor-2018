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
            color: "#ECC",
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
                ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)",
                "rgb(204, 204, 204)", "rgb(217, 217, 217)","rgb(255, 255, 255)"],
                ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
                "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"], 
                /*["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)", 
                "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)", 
                "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)", 
                "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)", 
                "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)", 
                "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)",
                "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
                "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)",
                "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)", 
                "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]*/
            ]
        });

        window.addEventListener('mouseup', function(e) { 
            if(!isOpen) return;

            var t = e.target;
            if (t.className === 'sp-thumb-inner') {
                self.close();
            } else if(elementInsideElement(t, colorPickerContainer)) {
                // nothin
            } else if (t.className === 'upper-canvas ') {
                wickEditor.tools.dropper.getColorAtCursor(function (color) {
                    currentColor = color;
                    self.close();
                });
            } else {
                self.close();
            }
        });
    }

    self.open = function (doneFn,color,x,y) {
        if(!x) x = wickEditor.inputHandler.mouse.x;
        if(!y) y = wickEditor.inputHandler.mouse.y;

        wickEditor.changeTool(wickEditor.tools.dropper);
        wickEditor.syncInterfaces();

        isOpen = true;

        currentDoneFn = doneFn;

        spectrumContainer.spectrum("set", color);

        colorPickerContainer.style.display = 'block';
        colorPickerContainer.style.left = x+"px";
        colorPickerContainer.style.top = y+"px";
    }

    self.close = function () {
        setTimeout(function () {
            wickEditor.useLastUsedTool();
            isOpen = false;
            currentDoneFn(currentColor);
            colorPickerContainer.style.display = 'none';
        },20)
    }

    self.syncWithEditorState = function () {

    }

    self.isOpen = function () {
        return isOpen;
    }

}
