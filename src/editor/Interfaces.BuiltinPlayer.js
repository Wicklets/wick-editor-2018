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

var BuiltinPlayerInterface = function (wickEditor) {

    var that = this;

    this.setup = function () {
        this.running = false;
    }

    this.syncWithEditorState = function () {
        if(this.running) {
            showBuiltinPlayer();
        } else {
            hideBuiltinPlayer();
        }
    }

    this.runProject = function (JSONProject) {
        if(wickEditor.project.hasSyntaxErrors()) {
            if(!confirm("There are syntax errors in the code of this project! Are you sure you want to run it?")) {
                return;
            }
        }

        that.running = true;
        wickPlayer.runProject(JSONProject);
        wickEditor.syncInterfaces();
    }

    this.stopRunningProject = function () {
        hideBuiltinPlayer();
        that.running = false;
        wickPlayer.stopRunningProject();
    }

// Internal utils

    var showBuiltinPlayer = function () {
        document.getElementById("editor").style.display = "none";
        document.getElementById("builtinPlayer").style.display = "block";
    }

    var hideBuiltinPlayer = function () {
        document.getElementById("builtinPlayer").style.display = "none";
        document.getElementById("editor").style.display = "block";
    }

// Button events

    $("#closeBuiltinPlayerButton").on("click", function (e) {
        that.stopRunningProject();
    });

}