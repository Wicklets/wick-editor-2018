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

        window.addEventListener('resize', resize, false);
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

        var duplicateName = wickEditor.project.getDuplicateName();
        if(duplicateName) {
            if(!confirm('Warning: Duplicate objects named "'+duplicateName+'". Are you sure you want to run it?')) {
                return;
            }
        }

        that.running = true;
        //wickPlayer.runProject(JSONProject);
        wickEditor.syncInterfaces();

        wickEditor.project.saveInLocalStorage();
        WickProject.Exporter.bundleProjectToHTML(wickEditor.project, function (result) {
            /*var myWindow = window.open(
                "", 
                wickEditor.project.name, 
                "width=" + wickEditor.project.width + ",height=" + wickEditor.project.height
            );
            myWindow.document.write(result);*/
            //<iframe id="builtinPlayerViewer"></iframe>
            var oldIframe = document.getElementById('builtinPlayerViewer');
            if(oldIframe) {
                oldIframe.remove();
            }

            var iframe = document.createElement('iframe');
            iframe.id = 'builtinPlayerViewer';
            document.getElementById('builtinPlayer').appendChild(iframe);
            iframe.contentWindow.document.write(result);

            resize();
        });

        //$("#rendererCanvas").focus();
    }

    this.stopRunningProject = function () {
        document.getElementById('builtinPlayerViewer').remove();
        hideBuiltinPlayer();
        that.running = false;
        //wickPlayer.stopRunningProject();
    }

// Internal utils

    var showBuiltinPlayer = function () {
        //document.getElementById("editor").style.display = "none";
        document.getElementById("builtinPlayer").style.display = "block";

        //resize();
    }

    var hideBuiltinPlayer = function () {
        //document.getElementById("editor").style.display = "block";
        document.getElementById("builtinPlayer").style.display = "none";
    }

    var resize = function () {
        var title = document.getElementById('builtinPlayerProjectInfo');
        title.innerHTML = wickEditor.project.name;
        title.style.width = (wickEditor.project.width-16)+'px';
        title.style.height = 16+'px';
        title.style.left = ((window.innerWidth -wickEditor.project.width) /2)+'px';
        title.style.top  = ((window.innerHeight-wickEditor.project.height)/2-16-6)+'px';

        var closeButton = document.getElementById('closeBuiltinPlayerButton')
        closeButton.style.left = ((window.innerWidth -wickEditor.project.width) /2+wickEditor.project.width-16)+'px';
        closeButton.style.top  = ((window.innerHeight-wickEditor.project.height)/2-16-4)+'px';

        var viewer = document.getElementById('builtinPlayerViewer');
        if(viewer) {
            viewer.style.left = ((window.innerWidth -wickEditor.project.width) /2)+'px';
            viewer.style.top  = ((window.innerHeight-wickEditor.project.height)/2)+'px';
            viewer.style.width  = (wickEditor.project.width)+'px';
            viewer.style.height = (wickEditor.project.height)+'px';
        }
    }

// Button events

    $("#closeBuiltinPlayerButton").on("click", function (e) {
        that.stopRunningProject();
        
    });

}