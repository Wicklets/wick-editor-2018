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

    var updateOnionSkinObject = function () {
        var that = this;
        
        if(!wickEditor.project.onionSkinning) {
            that.opacity = 0.0;
            return;
        }

        if(!fabricInterface.onionSkinsDirty) return;

        var frame = that.getFrameFunc();
        if(!frame) {
            that.opacity = 0.0;
            return;
        }

        var data = frame.cachedImageData;
        if(!data) {
            that.opacity = 0.0;
            return;
        }

        that.opacity = 0.3;
        that.left = data.x;
        that.top = data.y;
        that.setCoords();

        var img = new Image();
        img.onload=function(){
            that.setElement(img);
            fabricInterface.canvas.renderAll();
        }
        img.src = data.src;
    };

    var onionSkinPast = new fabric.Image();
    onionSkinPast.identifier = "onionSkinPast";
    onionSkinPast.getFrameFunc = function () { return wickEditor.project.getCurrentObject().getPrevFrame() };
    onionSkinPast.updateGUIState = updateOnionSkinObject;
    addElement(onionSkinPast);

    /*var onionSkinNext = new fabric.Image();
    onionSkinNext.identifier = "onionSkinNext";
    onionSkinNext.getFrameFunc = function () { wickEditor.project.getCurrentObject().getNextFrame() };
    onionSkinNext.updateGUIState = updateOnionSkinObject;
    addElement(onionSkinNext);*/

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
            var currentObject = wickEditor.project.getCurrentObject();
            originCrosshair.opacity = currentObject.isRoot ? 0.0 : 1.0;

            originCrosshair.left = -originCrosshair.width/2;
            originCrosshair.top  = -originCrosshair.height/2;
            
            var newOriginPos = wickEditor.project.getCurrentObject().getAbsolutePosition();
            originCrosshair.left += newOriginPos.x;
            originCrosshair.top  += newOriginPos.y;
        }
        addElement(originCrosshair);

        that.update();
    });


    var createSymbolButton = document.getElementById('createSymbolButton');
    var editSymbolButton = document.getElementById('editSymbolButton');
    var editSymbolScriptsButton = document.getElementById('editSymbolScriptsButton');
    var finishEditingObjectFabricButton = document.getElementById('finishEditingObjectFabricButton');
    
    canvas.on('after:render', function() {

        createSymbolButton.style.display = "none";
        editSymbolButton.style.display = "none";
        editSymbolScriptsButton.style.display = "none";
        finishEditingObjectFabricButton.style.display = "none";

        // Reposition buttons

        if(!wickEditor.project.getCurrentObject().isRoot) {
            finishEditingObjectFabricButton.style.display = "block";
            finishEditingObjectFabricButton.style.left = 40 + 'px';
            finishEditingObjectFabricButton.style.top = 120 + 'px';
        }

        var selection = canvas.getActiveObject() || canvas.getActiveGroup();
        if(!selection) return;

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
    });

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