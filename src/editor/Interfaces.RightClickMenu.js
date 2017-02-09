/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var RightClickMenuInterface = function (wickEditor) {


    

// Old...

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
            hideButtonGroup("#timelineButtons");
            hideButtonGroup("#commonTimelineButtons");
            hideButtonGroup("#clickedOnFrameButtons");
            hideButtonGroup("#isImage");
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

        var selectedSingleObject = wickEditor.fabric.getSelectedObject(WickObject);
        var currentObject = wickEditor.project.currentObject;

        var multiObjectSelection = wickEditor.fabric.getSelectedObjects(WickObject).length > 1;

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

            if(selectedSingleObject.imageData) {
                showButtonGroup("#isImage");
            }

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

        var frame = wickEditor.project.currentObject.getCurrentFrame();
        if(frame) {
            showButtonGroup("#clickedOnFrameButtons");
            /*if(frame.autoplay) {
                showButtonGroup("#noBreakpointExists");
            } else {
                showButtonGroup("#breakpointExists");
            }*/
        } else {
            showButtonGroup("#clickedOffFrameButtons");
        }
    }

/***********************************
    Bind Mouse events to open menu
***********************************/

    document.addEventListener('contextmenu', function (event) { 
        event.preventDefault();
    }, false);

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

    document.getElementById("timelineGUI").addEventListener('mousedown', function(e) { 
        if(e.button == 2) {
            that.open = true;
            that.mode = "timeline";
        } else {
            that.open = false;
        }

        that.syncWithEditorState();
        that.repositionMenu();
    });

}