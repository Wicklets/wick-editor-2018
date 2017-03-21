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

if(!window.Tools) Tools = {};

Tools.Paintbrush = function (wickEditor) {

    var that = this;

    this.brushSize = 5;
    this.color = "#000000";

    this.getCursorImage = function () {
        var canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        var context = canvas.getContext('2d');
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var radius = that.brushSize/2 * wickEditor.fabric.canvas.getZoom();

        function invertColor(hexTripletColor) {
            var color = hexTripletColor;
            color = color.substring(1); // remove #
            color = parseInt(color, 16); // convert to integer
            color = 0xFFFFFF ^ color; // invert three bytes
            color = color.toString(16); // convert to hex
            color = ("000000" + color).slice(-6); // pad with leading zeros
            color = "#" + color; // prepend #
            return color;
        }

        context.beginPath();
        context.arc(centerX, centerY, radius+1, 0, 2 * Math.PI, false);
        context.fillStyle = invertColor(that.color);
        context.fill();

        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = that.color;
        context.fill();

        return 'url(' + canvas.toDataURL() + ') 64 64,default';
    };

    this.getToolbarIcon = function () {
        return "resources/paintbrush.png";
    }

    this.getTooltipName = function () {
        return "Paintbrush";
    }

    this.getPenPressure = function () {
        return 1;
    }

    this.onPenPressurePathCreated = function (path) {
        
    }

    this.setup = function () {
        // Listen for new paths drawn by fabric, vectorize them, and add them to the WickProject as WickObjects
        /*wickEditor.fabric.canvas.on('object:added', function(e) {
            if(!(wickEditor.currentTool instanceof Tools.Paintbrush)) return;

            var fabricPath = e.target;

            // Make sure the new object is actually a path created by fabric's drawing tool
            if(fabricPath.type !== "path" || fabricPath.wickObjectRef) {
                return;
            }

            potraceFabricPath(fabricPath, function(SVGData) {
                var symbolOffset = wickEditor.project.currentObject.getAbsolutePosition();
                var x = fabricPath.left - symbolOffset.x;
                var y = fabricPath.top - symbolOffset.y;

                //fabricPath.remove();
                wickEditor.fabric.drawingPath = fabricPath;
                
                wickEditor.actionHandler.doAction('addObjects', {
                    paths: [{svg:SVGData, x:x, y:y}]
                });
            });
            
        });*/

        window.secretPathListenerForWick = function (fabricPath) {
            potraceFabricPath(fabricPath, function(SVGData) {
                //var symbolOffset = wickEditor.project.currentObject.getAbsolutePosition();
                var x = fabricPath.left// - symbolOffset.x;
                var y = fabricPath.top// - symbolOffset.y;

                var pathWickObject = WickObject.fromPathFile(SVGData);
                pathWickObject.x = x;
                pathWickObject.y = y;

                wickEditor.actionHandler.doAction('addObjects', {
                    wickObjects: [pathWickObject],
                    dontSelectObjects: true
                });
            });
        }

    }

    var potraceFabricPath = function (pathFabricObject, callback) {
        // I think there's a bug in cloneAsImage when zoom != 1, this is a hack
        var oldZoom = wickEditor.fabric.canvas.getZoom();
        wickEditor.fabric.canvas.setZoom(1);

        pathFabricObject.cloneAsImage(function(clone) {
            var img = new Image();
            img.onload = function () {
                potraceImage(img, callback, that.color);
            };
            img.src = clone._element.currentSrc || clone._element.src;
        });

        // Put zoom back to where it was before
        wickEditor.fabric.canvas.setZoom(oldZoom);
    };

}