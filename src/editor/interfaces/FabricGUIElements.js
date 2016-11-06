/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var FabricGUIElements = function (wickEditor, fabricInterface) {

	var that = this;
	var canvas = fabricInterface.canvas;

	var frameInside;
    var inactiveFrame
    var originCrosshair;

    // White box that shows resolution & objects that will be on screen when project is exported

    frameInside = new fabric.Rect({
        fill: '#FFF',
    });

    frameInside.hasControls = false;
    frameInside.selectable = false;
    frameInside.evented = false;
    frameInside.identifier = "frameInside";
    frameInside.left = 0;
    frameInside.top = 0;

    canvas.add(frameInside)

// Fade that grays out inactive objects (the objects in the parent objects frame)

    inactiveFrame = new fabric.Rect({
        fill: '#000',
    });

    inactiveFrame.hasControls = false;
    inactiveFrame.selectable = false;
    inactiveFrame.evented = false;
    inactiveFrame.identifier = "inactiveFrame";
    inactiveFrame.width  = window.innerWidth;
    inactiveFrame.height = window.innerHeight;
    inactiveFrame.left = 0;
    inactiveFrame.top = 0;

    canvas.add(inactiveFrame)

// Crosshair that shows where (0,0) of the current object is

    fabric.Image.fromURL('resources/origin.png', function(obj) {
        originCrosshair = obj;

        originCrosshair.hasControls = false;
        originCrosshair.selectable = false;
        originCrosshair.evented = false;
        originCrosshair.identifier = "originCrosshair";

        canvas.add(originCrosshair);

        that.update();
    });

    this.getNumGUIElements = function () {
        return 3;
    }

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
        frameInside.fill = wickEditor.project.backgroundColor;
        frameInside.width  = wickEditor.project.resolution.x;
        frameInside.height = wickEditor.project.resolution.y;
        frameInside.setCoords();

        if(originCrosshair) {
            originCrosshair.left = -originCrosshair.width/2;
            originCrosshair.top  = -originCrosshair.height/2;
            
            var newOriginPos = wickEditor.project.getCurrentObject().getAbsolutePosition();
            originCrosshair.left += newOriginPos.x;
            originCrosshair.top  += newOriginPos.y;
        }

        var pan = fabricInterface.getPan();
        var zoom = canvas.getZoom();
        inactiveFrame.width  = window.innerWidth  / zoom;
        inactiveFrame.height = window.innerHeight / zoom;
        inactiveFrame.left = -pan.x / zoom;
        inactiveFrame.top  = -pan.y / zoom;
        var currentObject = wickEditor.project.getCurrentObject();
        inactiveFrame.opacity = currentObject.isRoot ? 0.0 : 0.2;

        canvas.renderAll();
    }

    this.setInactiveFramePosition = function (i) {
        fabricInterface.canvas.moveTo(inactiveFrame, i);
    }

}