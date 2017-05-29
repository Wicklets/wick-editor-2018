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
    
var FabricGUIElements = function (wickEditor, fabricInterface) {

	var that = this;
	var canvas = fabricInterface.canvas;

    var elements = [];

    var addElement = function (obj) {
        obj.hasControls = false;
        obj.selectable = false;
        obj.evented = false;
        obj.left = 0;
        obj.top = 0;
        obj.isWickGUIElement = true;
        elements.push(obj);
        canvas.add(obj);
    }

// White box that shows resolution & objects that will be on screen when project is exported

    var frameInside = new fabric.Rect({
        fill: '#FFF',
    });

    frameInside.identifier = "frameInside";
    frameInside.updateGUIState = function () {
        frameInside.setColor(wickEditor.project.backgroundColor)
        frameInside.width  = wickEditor.project.width;
        frameInside.height = wickEditor.project.height;
        frameInside.setCoords();
    }
    addElement(frameInside);

// Fade that grays out inactive objects (the objects in the parent objects frame)

    var inactiveFrame = new fabric.Rect({
        fill: '#000',
    });

    inactiveFrame.identifier = "inactiveFrame";
    inactiveFrame.width  = window.innerWidth;
    inactiveFrame.height = window.innerHeight;
    inactiveFrame.updateGUIState = function () {
        var pan = fabricInterface.getPan();
        var zoom = canvas.getZoom();
        inactiveFrame.width  = window.innerWidth  / zoom;
        inactiveFrame.height = window.innerHeight / zoom;
        inactiveFrame.left = -pan.x / zoom;
        inactiveFrame.top  = -pan.y / zoom;
        var currentObject = wickEditor.project.currentObject;
        inactiveFrame.opacity = currentObject.isRoot ? 0.0 : 0.2;
    }
    addElement(inactiveFrame);

// Crosshair that shows where (0,0) of the current object is

    fabric.Image.fromURL('resources/origin.png', function(obj) {
        var originCrosshair = obj;

        originCrosshair.identifier = "originCrosshair";

        originCrosshair.updateGUIState = function () {
            var currentObject = wickEditor.project.currentObject;
            originCrosshair.opacity = currentObject.isRoot ? 0.0 : 1.0;

            originCrosshair.left = -originCrosshair.width/2;
            originCrosshair.top  = -originCrosshair.height/2;
            
            var newOriginPos = wickEditor.project.currentObject.getAbsolutePosition();
            originCrosshair.left += newOriginPos.x;
            originCrosshair.top  += newOriginPos.y;
        }
        addElement(originCrosshair);
        fabricInterface.canvas.moveTo(originCrosshair, 1)

        that.update();
    });

    canvas.on('before:render', function () {
        canvas._objects.forEach(function (obj) {
            if(!obj.centerpointObject) return;
            var selectedObj = wickEditor.fabric.getSelectedObject();

            if(selectedObj && selectedObj.uuid === obj.wickObjectRef.uuid) {
                obj.centerpointObject.opacity = 1.0;
            } else {
                obj.centerpointObject.opacity = 0.0;
            }
            obj.centerpointObject.setCoords();
        });
    });

    /*var createSymbolButton = document.getElementById('createSymbolButton');
    var editSymbolButton = document.getElementById('editSymbolButton');
    var editSymbolScriptsButton = document.getElementById('editSymbolScriptsButton');
    var finishEditingObjectFabricButton = document.getElementById('finishEditingObjectFabricButton');

    canvas.on('after:render', function() {

        createSymbolButton.style.display = "none";
        editSymbolButton.style.display = "none";
        editSymbolScriptsButton.style.display = "none";
        finishEditingObjectFabricButton.style.display = "none";

        var layersHeight = document.getElementById("timelineGUI").offsetHeight;
        var topOfScreen = 33 + layersHeight;
        var leftOfScreen = 40;
        var rightOfScreen = window.innerWidth-252;
        var bottomOfScreen = window.innerHeight-10;

        // Reposition buttons

        if(!wickEditor.project.currentObject.isRoot) {
            finishEditingObjectFabricButton.style.display = "block";
            finishEditingObjectFabricButton.style.left = 40 + 'px';
            finishEditingObjectFabricButton.style.top = topOfScreen + 'px';
        }

        var selection = canvas.getActiveObject() || canvas.getActiveGroup();
        if(!selection) return;
        if(selection._objects && selection._objects.length === 0) return;

        var bound = selection.getBoundingRect();
        var pan = fabricInterface.getPan();
        var corner = {
            x : bound.left+bound.width,
            y : bound.top 
        }
        corner.x = Math.max(corner.x, leftOfScreen);
        corner.x = Math.min(corner.x, rightOfScreen-40);
        corner.y = Math.max(corner.y, topOfScreen);
        corner.y = Math.min(corner.y, bottomOfScreen-65);

        var objIsSymbol = false;
        if(selection && selection.wickObjectRef) {
            var wickObj = selection.wickObjectRef;
            if(wickObj && wickObj.isSymbol) {
                objIsSymbol = true;
            }
        }

        if(objIsSymbol) {
            editSymbolButton.style.left = corner.x + 'px';
            editSymbolButton.style.top = corner.y + 35 + 'px';
            editSymbolButton.style.display = "block";

            editSymbolScriptsButton.style.left = corner.x + 'px';
            editSymbolScriptsButton.style.top = corner.y + 'px';
            editSymbolScriptsButton.style.display = "block";
        } else {
            createSymbolButton.style.left = corner.x + 'px';
            createSymbolButton.style.top = corner.y + 'px';
            createSymbolButton.style.display = "block";
        }
    });*/

    this.update = function () {

        elements.forEach(function (elem) {
            elem.updateGUIState();
        });

        fabricInterface.onionSkinsDirty = false;

        canvas.renderAll();
    }

    this.getNumGUIElements = function () {
        return elements.length;
    }

    this.setInactiveFramePosition = function (i) {
        fabricInterface.canvas.moveTo(inactiveFrame, i+this.getNumGUIElements()-1);
    }

    this.getInactiveFrame = function (i) {
        return inactiveFrame;
    }

}