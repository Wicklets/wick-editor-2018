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
            var selectedObj = wickEditor.project.getSelectedObject();

            if(selectedObj && selectedObj.uuid === obj.wickObjectRef.uuid) {
                obj.centerpointObject.opacity = 1.0;
            } else {
                obj.centerpointObject.opacity = 0.0;
            }
            obj.centerpointObject.setCoords();
        });
    });

    this.update = function () {

        elements.forEach(function (elem) {
            elem.updateGUIState();
        });

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