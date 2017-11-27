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

    var canvasBackdrop;
    var canvasContainer;

    self.setup = function () {
        canvasContainer = document.getElementById('editorCanvasContainer')

        canvasBackdrop = new CanvasBackdrop(wickEditor, canvasContainer);
        canvasBackdrop.setup();

        fabricCanvas = new FabricCanvas(wickEditor);
        paperCanvas = new PaperCanvas(wickEditor);
        pixiCanvas = new PixiCanvas(wickEditor);

        pixiCanvas.setup();
        fabricCanvas.setup();
        paperCanvas.setup();
    }

    self.syncWithEditorState = function () {
        paperCanvas.update();
        fabricCanvas.update();
        pixiCanvas.update();
        canvasBackdrop.update();
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

    self.getBackdrop = function () {
        return canvasBackdrop;
    }

}