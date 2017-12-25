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

var AlertBoxInterface = function (wickEditor) {

    var self = this;

    var alertBoxDiv;
    var alertBoxText;
    var alertBoxIcon;

    var fadeTimeout;

    self.setup = function () {
        alertBoxDiv = document.getElementById('alert-box');
        alertBoxText = document.getElementsByClassName('alert-box-text')[0];
        alertBoxIcon = document.getElementsByClassName('alert-box-icon')[0];

        alertBoxDiv.style.pointerEvents = 'none'

        alertBoxDiv.onclick = function () {
            self.hide();
        }
    }

    self.syncWithEditorState = function () {
        if(!alertBoxDiv) return;
    }

    self.showMessage = function (message) {
        alertBoxText.innerHTML = message;
        self.show();

        clearTimeout(fadeTimeout);
        fadeTimeout = setTimeout(function () {
            self.hide();
        }, 3000);
    }

    self.showProjectSavedMessage = function () {
        self.showMessage("Project autosaved!");
    }

    self.hide = function () {
        alertBoxDiv.style.opacity = 0.0;
        setTimeout(function () {
            alertBoxDiv.style.pointerEvents = 'none'
        }, 500);
    }

    self.show = function () {
        alertBoxDiv.style.pointerEvents = 'all'
        alertBoxDiv.style.opacity = 1.0;
    }

}