/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var FabricSymbolBorders = function (wickEditor, fabricInterface) {

	var that = this;
	var canvas = fabricInterface.canvas;

	var boxAnimationTimer = 0;
    var boxAnimationActive = false;
    var boxAnimationID = null;

    var animationFramerate = 60;
    var boxSpeed = 40;
    var boxMax = 500;

    canvas.on('after:render', function() {

        // Render bounding boxes for symbols
        var selectedIDs = fabricInterface.getSelectedObjectIDs();
        canvas.forEachObject(function(obj) {
            var wickObj = wickEditor.project.rootObject.getChildByID(obj.wickObjectID);
            var activeLayerObjects = wickEditor.project.getCurrentObject().getAllActiveLayerChildObjects();

            if(!wickObj || !wickObj.isSymbol || activeLayerObjects.indexOf(wickObj) === -1) return;
            if(boxAnimationActive && boxAnimationID !== wickObj.id) {return;}

            // Color the border differently depending if the object has errors
            if(!wickObj.hasSyntaxErrors && !wickObj.causedAnException) {
                canvas.contextContainer.strokeStyle = '#0B0';
            } else {
                canvas.contextContainer.strokeStyle = '#F00';
            }

            // We need to calculate an offset because of this bug: https://github.com/kangax/fabric.js/issues/1941
            var groupOffset = {x:0,y:0};
            if(selectedIDs.length > 1 && selectedIDs.indexOf(wickObj.id) !== -1) {
                var activeGroup = canvas.getActiveGroup();
                groupOffset.x = (activeGroup.left + activeGroup.width/2)*canvas.getZoom();
                groupOffset.y = (activeGroup.top + activeGroup.height/2)*canvas.getZoom();
            }

            var bound = obj.getBoundingRect();
            var boxGrowOffset = boxAnimationTimer;
            canvas.contextContainer.lineWidth = 4;
            canvas.contextContainer.globalAlpha = 0.5;
            canvas.contextContainer.strokeRect(
                bound.left + 0.5 + groupOffset.x - boxGrowOffset/2,
                bound.top + 0.5 + groupOffset.y - boxGrowOffset/2,
                bound.width + boxGrowOffset,
                bound.height + boxGrowOffset
            );
            canvas.contextContainer.globalAlpha = 1.0;
            
        });
    });

    this.startEditObjectAnimation = function (obj) {
        boxAnimationID = obj.id;
        boxAnimationActive = true;
        var f = setInterval(function () {
            that.updateEditObjectAnimation(obj, f);
        }, 1000/animationFramerate);
    }

    this.updateEditObjectAnimation = function (obj, f) {
        if(boxAnimationTimer > boxMax) {
            boxAnimationTimer = 0;
            wickEditor.actionHandler.doAction('editObject', { objectToEdit: obj });
            clearTimeout(f);
            boxAnimationActive = false;
            canvas.renderAll();
        } else {
            boxAnimationTimer += boxSpeed;
            canvas.renderAll();
        }
    }

    this.startLeaveObjectAnimation = function (obj) {
        boxAnimationActive = true;
        boxAnimationID = obj.id;
        boxAnimationTimer = boxMax;
        wickEditor.actionHandler.doAction('finishEditingCurrentObject', {});
        var f = setInterval(function () {
            that.updateLeaveObjectAnimation(obj, f);
        }, 1000/animationFramerate);
    }

    this.updateLeaveObjectAnimation = function (obj, f) {
        if(boxAnimationTimer <= 0) {
            boxAnimationTimer = 0;
            clearTimeout(f);
            boxAnimationActive = false;
            canvas.renderAll();
        } else {
            boxAnimationTimer -= boxSpeed;
            canvas.renderAll();
        }
    }

}