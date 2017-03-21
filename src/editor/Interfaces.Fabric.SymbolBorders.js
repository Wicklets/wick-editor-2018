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
    
var FabricSymbolBorders = function (wickEditor, fabricInterface) {

    var that = this;
    var canvas = fabricInterface.canvas;

    var boxAnimationTimer = 0;
    var boxAnimationActive = false;
    var boxAnimationObj = null;

    var animationFramerate = 60;
    var boxSpeed = 0.06;

    canvas.on('after:render', function() {

        if(canvas._currentTransform) return;

        // Render bounding boxes for symbols
        var selectedObjs = fabricInterface.getSelectedObjects(WickObject);
        canvas.forEachObject(function(obj) {
            var wickObj = obj.wickObjectRef;
            var activeLayerObjects = wickEditor.project.currentObject.getAllActiveLayerChildObjects();

            if(!wickObj || activeLayerObjects.indexOf(wickObj) === -1) return;
            if(selectedObjs.indexOf(wickObj) === -1 && !wickObj.isSymbol) return
            if(boxAnimationActive && boxAnimationObj !== wickObj) return;

            // Color the border differently depending if the object has errors
            if(!wickObj.isSymbol) {
                canvas.contextContainer.lineWidth = 1.0;
                canvas.contextContainer.globalAlpha = 1.0;
                canvas.contextContainer.strokeStyle = '#92B7FF';
            /*} else if(wickObj.scriptsAllEmpty()) {
                canvas.contextContainer.lineWidth = 4;
                canvas.contextContainer.globalAlpha = 0.5;
                canvas.contextContainer.strokeStyle = '#92B7FF';*/
            } else if(!wickObj.hasSyntaxErrors && !wickObj.causedAnException) {
                canvas.contextContainer.lineWidth = 4;
                canvas.contextContainer.globalAlpha = 0.5;
                canvas.contextContainer.strokeStyle = '#0B0';
            } else {
                canvas.contextContainer.lineWidth = 4;
                canvas.contextContainer.globalAlpha = 0.5;
                canvas.contextContainer.strokeStyle = '#F00';
            }

            // We need to calculate an offset because of this bug: https://github.com/kangax/fabric.js/issues/1941
            var groupOffset = {x:0,y:0};
            if(selectedObjs.length > 1 && selectedObjs.indexOf(wickObj) !== -1) {
                var activeGroup = canvas.getActiveGroup();
                groupOffset.x = (activeGroup.left + activeGroup.width/2)*canvas.getZoom();
                groupOffset.y = (activeGroup.top + activeGroup.height/2)*canvas.getZoom();
            }

            var boundStart = obj.getBoundingRect();
            boundStart.left += groupOffset.x;
            boundStart.top += groupOffset.y;
            var boundEnd = {
                left: 0,
                top: 0,
                width: window.innerWidth,
                height: window.innerHeight
            };
            var t = boxAnimationTimer;
            var ti = 1-boxAnimationTimer;
            var bound = {
                left:   boundStart.left  *ti + boundEnd.left  *t,
                top:    boundStart.top   *ti + boundEnd.top   *t,
                width:  boundStart.width *ti + boundEnd.width *t,
                height: boundStart.height*ti + boundEnd.height*t,
            }

            var boxGrowOffset = boxAnimationTimer;
            canvas.contextContainer.strokeRect(bound.left, bound.top, bound.width, bound.height);
            canvas.contextContainer.globalAlpha = 1.0;
            
        });
    });

    this.startEditObjectAnimation = function (obj) {
        boxAnimationObj = obj;
        boxAnimationActive = true;
        var f = setInterval(function () {
            that.updateEditObjectAnimation(obj, f);
        }, 1000/animationFramerate);
    }

    this.updateEditObjectAnimation = function (obj, f) {
        if(boxAnimationTimer > 1) {
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
        boxAnimationObj = obj;
        boxAnimationTimer = 1;
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