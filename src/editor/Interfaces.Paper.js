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
    
var PaperInterface = function (wickEditor) {

    var self = this;

    // Reference to the WickFrame that paper.js currently holds path data for.
    var currentFrame;

    // Path routines (These can be swapped out for more optimized routines someday~)
    var pathRoutines = new PathRoutines(this);

/******************************
    Wick Interface methods
******************************/

    self.setup = function () {
        // Create the canvas to be used with paper.js and init the paper.js instance.
        paperCanvas = document.createElement('canvas');
        paperCanvas.className = 'paperCanvas';
        paperCanvas.style.backgroundColor = "#FFDDDD";
        paperCanvas.style.width  = (wickEditor.project.width /2)+'px';
        paperCanvas.style.height = (wickEditor.project.height/2)+'px';
        paper.setup(paperCanvas);
        paper.view.viewSize.width  = wickEditor.project.width;
        paper.view.viewSize.height = wickEditor.project.height;

        // If we're debugging, make the paper.js canvas visible
        if(localStorage.pathDebug === "1") {
            document.body.appendChild(paperCanvas);
        }
    }
    
    self.syncWithEditorState = function () {

        // Check if the playhead has moved to a different frame
        var newFrame = wickEditor.project.getCurrentFrame();
        if(newFrame !== currentFrame) {
            paper.project.clear();
        }

        // Sync paper canvas with SVGs in the current frame of the wick project
        // For each paper group in project:
            // If the wick object with the uuid of the group is no longer in the project, delete the group.
            // If the wick object with the uuid of the group is still here, sync the wick object and the paper group. 
                //(Only if the WickObject has pathDirty flag though.)
                //(Also you'll probably need to reset the rotation,scaleX,and scaleY of the wickobject and have fabric regen those.)

        // For each path in the wick frame:
            // If the path doesn't exist in the paper project, import it

    }

/******************************
    API
******************************/
    
    self.cleanupPaths = function () {
        pathRoutines.cleanupPaths();
        applyPathChangesToProject();
    }

    self.eraseWithPath = function (eraserPath) {
        pathRoutines.eraseWithPath(eraserPath)
        applyPathChangesToProject();
    }

    self.fillAt = function (x,y,color) {
        pathRoutines.fillAt(x,y,color);
        applyPathChangesToProject();
    }

/******************************
    Util
******************************/

    var importSVG = function () {

    }

    var applyPathChangesToProject = function () {
        // Determine which paper groups were removed and trigger a WickAction to delete the corresponding WickObjects.
        // Determine which paper groups were created and trigger a WickAction to create new WickObjects for the new groups.
    }

 }

