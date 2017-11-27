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

var CanvasInterface = function (wickEditor) {

    var self = this;

    var fabricCanvas;
    var paperCanvas;
    var pixiCanvas;

    var canvasContainer;

    self.setup = function () {
        canvasContainer = document.getElementById('editorCanvasContainer')

        fabricCanvas = new FabricCanvas(wickEditor);
        paperCanvas = new PaperCanvas(wickEditor);
        pixiCanvas = new PixiCanvas(wickEditor);

        fabricCanvas.setup();
        paperCanvas.setup();
        pixiCanvas.setup();
    }

    self.syncWithEditorState = function () {
        fabricCanvas.syncWithEditorState();
        paperCanvas.syncWithEditorState();
        pixiCanvas.syncWithEditorState();
    }

    self.getCanvasContainer = function () {
        return canvasContainer;
    }

    self.getFabricCanvas = function () {
        return fabricCanvas;
    }

    self.getPaperCanvas = function () {
        return paperCanvas;
    }

    self.getPixiCanvas = function () {
        return pixiCanvas;
    }

}