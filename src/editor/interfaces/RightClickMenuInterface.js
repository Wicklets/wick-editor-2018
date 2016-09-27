/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var RightClickMenuInterface = function (wickEditor) {

    var that = this;

    this.open = false;
    this.mode = undefined;

/***********************************
    State sync with model
***********************************/

    var openRightClickMenuDiv = function () {
        // Make rightclick menu visible
        $("#rightClickMenu").css('display', 'block');
    }

    var closeRightClickMenuDiv = function () {
        // Hide rightclick menu
        $("#rightClickMenu").css('display', 'none');
        $("#rightClickMenu").css('top', '0px');
        $("#rightClickMenu").css('left','0px');
    }

    this.syncWithEditorState = function () {

        if(this.open) {
            // Hide everything
            hideButtonGroup("#fabricButtons");
            hideButtonGroup("#insideSymbolButtons");
            hideButtonGroup("#symbolButtons");;
            hideButtonGroup("#staticObjectButtons");
            hideButtonGroup("#singleObjectButtons");
            hideButtonGroup("#commonObjectButtons");
            hideButtonGroup("#clickedFrameExists");
            hideButtonGroup("#clickedOffFrameButtons");
            hideButtonGroup("#clickedOffFrameButtons");
            hideButtonGroup("#noFramesExistButtons");
            hideButtonGroup("#clickedOnFrameButtons");
            hideButtonGroup("#commonTimelineButtons");

            // Selectively show portions we need depending on editor state
            showButtonsForMode[that.mode]();
            openRightClickMenuDiv();
        } else {
            closeRightClickMenuDiv();
        }

    }

/***********************************
    Show/hide relevant buttons
***********************************/

    var showButtonGroup = function (buttonsDivID) {
        $(buttonsDivID).css('display', 'block');
    }
    var hideButtonGroup = function (buttonsDivID) {
        $(buttonsDivID).css('display', 'none');
    }

    var showButtonsForMode = {};

    showButtonsForMode["fabric"] = function () {
        showButtonGroup("#fabricButtons");

        var selectedSingleObject = wickEditor.interfaces['fabric'].getSelectedWickObject();
        var currentObject = wickEditor.project.getCurrentObject();

        var multiObjectSelection = wickEditor.interfaces['fabric'].getSelectedObjectIDs().length > 1;

        if(!currentObject.isRoot) {
            showButtonGroup("#insideSymbolButtons");
        }

        if(selectedSingleObject) {
            showButtonGroup("#singleObjectButtons");

            if(selectedSingleObject.isSymbol) {
                showButtonGroup("#symbolButtons");
            } else {
                showButtonGroup("#staticObjectButtons");
            }
            showButtonGroup("#commonObjectButtons");
        } else {
            showButtonGroup("#frameButtons");
        }

        if(multiObjectSelection) {
            showButtonGroup("#staticObjectButtons");
        }
    }

    showButtonsForMode["timeline"] = function () {
        showButtonGroup("#timelineButtons");

        showButtonGroup("#commonTimelineButtons");

        if(wickEditor.project.getCurrentObject().getCurrentFrame()) {
            showButtonGroup("#clickedOnFrameButtons");
        } else {
            showButtonGroup("#clickedOffFrameButtons");
        }

        if(wickEditor.project.getCurrentObject().getCurrentLayer().frames.length > 0) {
            showButtonGroup("#clickedFrameExists");
        }
    }

/***********************************
    Bind Mouse events to open menu
***********************************/

    document.getElementById("editorCanvasContainer").addEventListener('mousedown', function(e) { 
        if(e.button == 2) {
            that.open = true;
            that.mode = "fabric";
        } else {
            that.open = false;
        }

        $("#rightClickMenu").css('top', wickEditor.inputHandler.mouse.y+'px');
        $("#rightClickMenu").css('left', wickEditor.inputHandler.mouse.x+'px');

        that.syncWithEditorState();
    });

    document.getElementById("timelineCanvas").addEventListener('mousedown', function(e) { 
        if(e.button == 2) {
            that.open = true;
            that.mode = "timeline";
        } else {
            that.open = false;
        }

        $("#rightClickMenu").css('top', wickEditor.inputHandler.mouse.y+'px');
        $("#rightClickMenu").css('left', wickEditor.inputHandler.mouse.x+'px');

        that.syncWithEditorState();
    });

/*************************
    Button Actions
*************************/

    var bindActionToButton = function (buttonDivID, buttonAction) {
        $(buttonDivID).on("click", function (e) {
            that.open = false;
            buttonAction();
            wickEditor.syncInterfaces();
        });
    }
    
    bindActionToButton("#editScriptsButton", function () {
        wickEditor.interfaces['scriptingide'].open = true;
        wickEditor.syncInterfaces();
    });

    bindActionToButton("#bringToFrontButton", function () {
        wickEditor.actionHandler.doAction('moveObjectToZIndex', { 
            ids: wickEditor.interfaces["fabric"].getSelectedObjectIDs(),
            newZIndex: wickEditor.getCurrentObject().getCurrentFrame().wickObjects.length
        });
        wickEditor.interfaces['fabric'].deselectAll();
    });

    bindActionToButton("#sendToBackButton", function () {
        wickEditor.actionHandler.doAction('moveObjectToZIndex', { 
            ids: wickEditor.interfaces["fabric"].getSelectedObjectIDs(),
            newZIndex: 0
        });
        wickEditor.interfaces['fabric'].deselectAll();
    });

    bindActionToButton("#deleteButton", function () {
        wickEditor.actionHandler.doAction('deleteObjects', { ids:wickEditor.interfaces['fabric'].getSelectedObjectIDs() });
    });

    bindActionToButton("#editObjectButton", function () {
        var selectedObject = wickEditor.interfaces['fabric'].getSelectedWickObject();
        wickEditor.actionHandler.doAction('editObject', {objectToEdit:selectedObject});
    });

    bindActionToButton("#convertToSymbolButton", function () {
        var fabCanvas = wickEditor.interfaces['fabric'].canvas;
        wickEditor.actionHandler.doAction('convertSelectionToSymbol', 
            {selection:fabCanvas.getActiveObject() || fabCanvas.getActiveGroup()}
        );
    });

    bindActionToButton("#finishEditingObjectButton", function () {
        wickEditor.actionHandler.doAction('finishEditingCurrentObject', {});
    });

    bindActionToButton("#downloadButton", function () {
        var fileData = wickEditor.interfaces['fabric'].getSelectedWickObject().exportAsFile();
        var blob = new Blob([fileData], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "wickobject.json");
    });

    bindActionToButton("#addFrameButton", function () {
        wickEditor.actionHandler.doAction('addNewFrame');
    });

    bindActionToButton("#deleteFrameButton", function () {
        wickEditor.actionHandler.doAction('deleteCurrentFrame');
    });

    bindActionToButton("#extendFrameButton", function () {
  
        var frame = wickEditor.project.getCurrentObject().getCurrentFrame();
        if(!frame) {
            var frames = wickEditor.project.getCurrentObject().getCurrentLayer().frames;
            frame = frames[frames.length - 1];
        }

        var frameEndingIndex = wickEditor.project.getCurrentObject().getPlayheadPositionAtFrame(
            frame
        ) + frame.frameLength - 1;

        var framesToExtend = wickEditor.project.getCurrentObject().playheadPosition - frameEndingIndex;

        wickEditor.actionHandler.doAction('extendFrame', 
            {
                nFramesToExtendBy: Math.max(1, framesToExtend),
                frame: frame
            });
    });

    bindActionToButton("#shrinkFrameButton", function () {

        var frame = wickEditor.project.getCurrentObject().getCurrentFrame();

        var frameEndingIndex = wickEditor.project.getCurrentObject().getPlayheadPositionAtFrame(
            frame
        ) + frame.frameLength - 1;

        var framesToShrink = frameEndingIndex - wickEditor.project.getCurrentObject().playheadPosition;

        wickEditor.actionHandler.doAction('shrinkFrame', 
            {   
                nFramesToShrinkBy: Math.max(1, framesToShrink), 
                frame: frame
            });
    });

    bindActionToButton("#addLayerButton", function () {
        wickEditor.actionHandler.doAction('addNewLayer');
    });

}