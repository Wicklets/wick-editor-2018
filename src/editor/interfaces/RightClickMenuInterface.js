/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var RightClickMenuInterface = function (wickEditor) {

    var that = this;

    this.setup = function () {
        this.open = false;
        this.mode = undefined;
    }

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
            hideButtonGroup("#symbolButtons");
            hideButtonGroup("#staticObjectButtons");
            hideButtonGroup("#singleObjectButtons");
            hideButtonGroup("#commonObjectButtons");
            hideButtonGroup("#clickedFrameExists");
            hideButtonGroup("#clickedOffFrameButtons");
            hideButtonGroup("#noFramesExistButtons");
            hideButtonGroup("#breakpointExists");
            hideButtonGroup("#noBreakpointExists");
            hideButtonGroup("#commonTimelineButtons");
            hideButtonGroup("#clickedOnFrameButtons");
            hideButtonGroup("#noKeyframeExists");
            hideButtonGroup("#keyframeExists");

            // Selectively show portions we need depending on editor state
            showButtonsForMode[that.mode]();
            openRightClickMenuDiv();
        } else {
            closeRightClickMenuDiv();
        }

    }

    this.repositionMenu = function () {
        var menuElem = document.getElementById('rightClickMenu');
        var newX = wickEditor.inputHandler.mouse.x;
        var newY = wickEditor.inputHandler.mouse.y;
        if(newX+menuElem.offsetWidth > window.innerWidth) {
            newX = window.innerWidth - menuElem.offsetWidth;
        }
        if(newY+menuElem.offsetHeight > window.innerHeight) {
            newY = window.innerHeight - menuElem.offsetHeight;
        }
        menuElem.style.left = newX+'px';
        menuElem.style.top  = newY+'px';
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

            var relPlayheadPos = selectedSingleObject.parentObject.getRelativePlayheadPosition(selectedSingleObject);
            if(selectedSingleObject.hasTweenAtFrame(relPlayheadPos)) {
                showButtonGroup("#keyframeExists");
            } else {
                showButtonGroup("#noKeyframeExists");
            }
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

        var frame = wickEditor.project.getCurrentObject().getCurrentFrame();
        if(frame) {
            showButtonGroup("#clickedOnFrameButtons");
            if(frame.autoplay) {
                showButtonGroup("#noBreakpointExists");
            } else {
                showButtonGroup("#breakpointExists");
            }
        } else {
            showButtonGroup("#clickedOffFrameButtons");
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

        that.syncWithEditorState();
        that.repositionMenu();
    });

    document.getElementById("timelineCanvas").addEventListener('mousedown', function(e) { 
        if(e.button == 2) {
            that.open = true;
            that.mode = "timeline";
        } else {
            that.open = false;
        }

        that.syncWithEditorState();
        that.repositionMenu();
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

    bindActionToButton("#addFrameButton", function () {
        wickEditor.actionHandler.doAction('addNewFrame');
    });

    bindActionToButton("#cloneFrameButton", function () {
        alert("clone")
    });

    bindActionToButton("#deleteFrameButton", function () {
        var currentObject = wickEditor.project.getCurrentObject();
        var frame = currentObject.getCurrentFrame();
        var layer = currentObject.getCurrentLayer();
        wickEditor.actionHandler.doAction('deleteFrame', {
            frame: frame,
            layer: layer
        });
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

    bindActionToButton("#removeLayerButton", function () {
        wickEditor.actionHandler.doAction('removeLayer');
    });

    bindActionToButton("#addBreakpointButton", function () {
        wickEditor.actionHandler.doAction('addBreakpoint', {
            frame: wickEditor.project.getCurrentObject().getCurrentFrame()
        });
    });

    bindActionToButton("#removeBreakpointButton", function () {
        wickEditor.actionHandler.doAction('removeBreakpoint', {
            frame: wickEditor.project.getCurrentObject().getCurrentFrame()
        });
    });

    bindActionToButton("#addKeyframeButton", function () {
        var selectedObj = wickEditor.interfaces.fabric.getSelectedWickObject();
        var tween = WickTween.fromWickObjectState(selectedObj);
        tween.frame = selectedObj.parentObject.getRelativePlayheadPosition(selectedObj);
        selectedObj.tweens.push(tween);
    });

    bindActionToButton("#removeKeyframeButton", function () {
        console.error("removeKeyframeButton action NYI")
    });

}