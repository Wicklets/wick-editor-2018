/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var RightClickMenuInterface = function (wickEditor) {

    var that = this;

    this.open = false;

    this.syncWithEditorState = function () {

        if(this.open) {
            // Hide everything
            $("#insideSymbolButtons").css('display', 'none');
            $("#symbolButtons").css('display', 'none');
            $("#staticObjectButtons").css('display', 'none');
            $("#singleObjectButtons").css('display', 'none');
            $("#commonObjectButtons").css('display', 'none');
            $("#frameButtons").css('display', 'none');

            // Selectively show portions we need depending on editor state

            var selectedSingleObject = wickEditor.getSelectedWickObject();
            var currentObject = wickEditor.project.getCurrentObject();

            var multiObjectSelection = wickEditor.interfaces['fabric'].getSelectedObjectIDs().length > 1;

            if(!currentObject.isRoot) {
                $("#insideSymbolButtons").css('display', 'block');
            }

            if(selectedSingleObject) {
                $("#singleObjectButtons").css('display', 'block');

                if(selectedSingleObject.isSymbol) {
                    $("#symbolButtons").css('display', 'block');
                } else {
                    $("#staticObjectButtons").css('display', 'block');
                }
                $("#commonObjectButtons").css('display', 'block');
            } else {
                $("#frameButtons").css('display', 'block');
            }

            if(multiObjectSelection) {
                $("#staticObjectButtons").css('display', 'block');
            }
            openRightClickMenuDiv();
        } else {
            closeRightClickMenuDiv();
        }

    }

    var openRightClickMenuDiv = function () {
        // Make rightclick menu visible
        $("#rightClickMenu").css('display', 'block');
        // Attach it to the mouse
        $("#rightClickMenu").css('top', wickEditor.inputHandler.mouse.y+'px');
        $("#rightClickMenu").css('left', wickEditor.inputHandler.mouse.x+'px');
    }

    var closeRightClickMenuDiv = function () {
        // Hide rightclick menu
        $("#rightClickMenu").css('display', 'none');
        $("#rightClickMenu").css('top', '0px');
        $("#rightClickMenu").css('left','0px');
    }

    document.getElementById("editorCanvasContainer").addEventListener('mousedown', function(e) { 
        if(e.button == 2) {
            that.open = true;
        } else {
            that.open = false;
        }
        wickEditor.syncInterfaces();
    });

    $("#editScriptsButton").on("click", function (e) {
        that.open = false;
        wickEditor.interfaces['scriptingide'].open = true;
        wickEditor.syncInterfaces();
    });

    $("#bringToFrontButton").on("click", function (e) {
        that.open = false;
        wickEditor.actionHandler.doAction('moveObjectToZIndex', { 
            ids: wickEditor.getSelectedObjectIDs(),
            newZIndex: wickEditor.getCurrentObject().getCurrentFrame().wickObjects.length
        });
        wickEditor.syncInterfaces();
    });

    $("#sendToBackButton").on("click", function (e) {
        that.open = false;
        wickEditor.actionHandler.doAction('moveObjectToZIndex', { 
            ids: wickEditor.getSelectedObjectIDs(),
            newZIndex: 0
        });
        wickEditor.syncInterfaces();
    });

    $("#deleteButton").on("click", function (e) {
        console.error("whoops forgot to update this")

        wickEditor.syncInterfaces();
    });

    $("#editObjectButton").on("click", function (e) {
        that.open = false;

        var selectedObject = wickEditor.getSelectedWickObject();
        wickEditor.actionHandler.doAction('editObject', {objectToEdit:selectedObject});

        wickEditor.syncInterfaces();
    });

    $("#convertToSymbolButton").on("click", function (e) {
        that.open = false;

        var fabCanvas = wickEditor.interfaces['fabric'].canvas;
        wickEditor.actionHandler.doAction('convertSelectionToSymbol', 
            {selection:fabCanvas.getActiveObject() || fabCanvas.getActiveGroup()}
        );

        wickEditor.syncInterfaces();
    });

    $("#finishEditingObjectButton").on("click", function (e) {
        that.open = false;
        
        wickEditor.actionHandler.doAction('finishEditingCurrentObject', {});

        wickEditor.syncInterfaces();
    });

    $("#downloadButton").on("click", function (e) {
        that.open = false;

        wickEditor.getSelectedWickObject().exportAsFile();

        wickEditor.syncInterfaces();
    });

}