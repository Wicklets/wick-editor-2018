var CursorTool = function (wickEditor) {

    var that = this;

    var canvas = wickEditor.interfaces['fabric'].canvas;

    // Select objects on right click (fabric.js doesn't do this by default >.>)
    canvas.on('mouse:down', function(e) {
        if(e.e.button == 2) {
            if (e.target && e.target.wickObjectID) {
                // Set active object of fabric canvas
                var id = canvas.getObjects().indexOf(e.target);
                canvas.setActiveObject(canvas.item(id)).renderAll();
            }

            if(!e.target) {
                // Didn't right click an object, deselect everything
                canvas.deactivateAll().renderAll();
            }
        }
    });

    // Double click functionality to edit symbols
    var lastDoubleClickTime = null;
    canvas.on('mouse:down', function(e) {
        if(e.e.button == 0) {
            var currentTime = new Date().getTime();
            if(lastDoubleClickTime !== null && currentTime-lastDoubleClickTime < 350) {
                var selectedObject = wickEditor.interfaces['fabric'].getSelectedWickObject();
                if(selectedObject) {
                    if(selectedObject.isSymbol) {
                        wickEditor.actionHandler.doAction('editObject', {objectToEdit:selectedObject});
                    }
                } else {
                    if(!wickEditor.project.getCurrentObject().isRoot) {
                        wickEditor.actionHandler.doAction('finishEditingCurrentObject', {});
                    }
                }
            }
            lastDoubleClickTime = currentTime;
        }
    });

}