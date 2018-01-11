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

var EditorSettings = function (wickEditor) {

    var self = this;
    var settingsWindow = document.getElementById('editorSettingsGUI');
    var closeButton = document.getElementsByClassName('editorSettingsGUICloseButton')[0];
    var hotkeysContainer = document.getElementsByClassName('editorSettingsGUIHotkeys')[0];

    self.setup = function () {
        closeButton.onclick = function () {
            self.close();
        }

        var guiActions = wickEditor.guiActionHandler.guiActions;
        for(key in guiActions) {
            var action = guiActions[key];
            if(action.hotkeys.length === 0 || !action.title) continue;
            var hotkeysString = action.hotkeys.map(function (k) {
                // Remove extra words from key string
                var splitByKey = k.split('Key')
                k = splitByKey[splitByKey.length-1]
                var splitByArrow = k.split('Arrow')
                k = splitByArrow[splitByArrow.length-1]
                var splitByDigit = k.split('Digit')
                k = splitByDigit[splitByDigit.length-1]
                return k;
            }).join(' + ');
            if(action.shiftKey) hotkeysString = 'Shift + ' + hotkeysString;
            if(action.modifierKey) hotkeysString = 'Control + ' + hotkeysString;

            var hotkeyDiv = document.createElement('div');
            hotkeyDiv.className = 'hotkey';

            var hotkeyTitle = document.createElement('div');
            hotkeyTitle.className = 'hotkey-title';
            hotkeyTitle.innerHTML = action.title;
            hotkeyDiv.appendChild(hotkeyTitle);

            var hotkeyDesc = document.createElement('div');
            hotkeyDesc.className = 'hotkey-description';
            hotkeyDesc.innerHTML = hotkeysString;
            hotkeyDiv.appendChild(hotkeyDesc);

            hotkeysContainer.appendChild(hotkeyDiv);

            var hr = document.createElement('hr');
            hr.className = 'hotkeyhr';
            hotkeysContainer.appendChild(hr);
        };
    }

    self.syncWithEditorState = function () {

    }

    self.open = function () {
        settingsWindow.style.display = 'block';
    }

    self.close = function () {
        settingsWindow.style.display = 'none';
    }

}