/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

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
        frameInside.fill = wickEditor.project.backgroundColor;
        frameInside.width  = wickEditor.project.resolution.x;
        frameInside.height = wickEditor.project.resolution.y;
        frameInside.setCoords();
    }
    addElement(frameInside);

// Onion skinning objects

    var onionSkinPast;
    var onionSkinNext;

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
        var currentObject = wickEditor.project.getCurrentObject();
        inactiveFrame.opacity = currentObject.isRoot ? 0.0 : 0.2;
    }
    addElement(inactiveFrame);

// Crosshair that shows where (0,0) of the current object is

    fabric.Image.fromURL('resources/origin.png', function(obj) {
        var originCrosshair = obj;

        originCrosshair.identifier = "originCrosshair";

        originCrosshair.updateGUIState = function () {
            originCrosshair.left = -originCrosshair.width/2;
            originCrosshair.top  = -originCrosshair.height/2;
            
            var newOriginPos = wickEditor.project.getCurrentObject().getAbsolutePosition();
            originCrosshair.left += newOriginPos.x;
            originCrosshair.top  += newOriginPos.y;
        }
        addElement(originCrosshair);

        that.update();
    });

// Borders for symbols

    var createSymbolButton = document.getElementById('createSymbolButton');
    var editSymbolButton = document.getElementById('editSymbolButton');
    var editSymbolScriptsButton = document.getElementById('editSymbolScriptsButton');
    
    canvas.on('after:render', function() {

        createSymbolButton.style.display = "none";
        editSymbolButton.style.display = "none";
        editSymbolScriptsButton.style.display = "none";

        // Reposition buttons
        var selection = canvas.getActiveObject() || canvas.getActiveGroup();
        if(selection) {
            var bound = selection.getBoundingRect();
            var pan = fabricInterface.getPan();
            var corner = {
                x : bound.left+bound.width,
                y : bound.top 
            }

            var objIsSymbol = false;
            if(selection && selection.wickObjectID) {
                var wickObj = wickEditor.project.rootObject.getChildByID(selection.wickObjectID);
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
        }
    });

    this.update = function () {

        elements.forEach(function (elem) {
            elem.updateGUIState();
        });

        canvas.renderAll();
    }

    this.getNumGUIElements = function () {
        return 3;
    }

    this.setInactiveFramePosition = function (i) {
        fabricInterface.canvas.moveTo(inactiveFrame, i+this.getNumGUIElements()-1);
    }

    this.getInactiveFrame = function (i) {
        return inactiveFrame;
    }

}