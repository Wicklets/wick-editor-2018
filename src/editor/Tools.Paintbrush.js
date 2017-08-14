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

    this.getCursorImage = function () {
        var canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        var context = canvas.getContext('2d');
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var radius = wickEditor.settings.brushThickness/2;// * wickEditor.fabric.canvas.getZoom();

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
        context.fillStyle = invertColor(wickEditor.settings.fillColor);
        context.fill();

        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = wickEditor.settings.fillColor;
        context.fill();

        return 'url(' + canvas.toDataURL() + ') 64 64,default';
    };

    this.getToolbarIcon = function () {
        return "resources/tools/Paintbrush.svg";
    }

    this.getTooltipName = function () {
        return "Brush (B)";
    }

    this.setup = function () {

        window.secretPathListenerForWick = function (fabricPath) {
            fabricPath.stroke = "#000000";
            potraceFabricPath(fabricPath, function(SVGData) {
                if(wickEditor.currentTool instanceof Tools.Eraser) {
                    wickEditor.paper.pathRoutines.eraseWithPath({
                        pathData: SVGData,
                        pathX: fabricPath.left,
                        pathY: fabricPath.top
                    });
                } else {
                    //var symbolOffset = wickEditor.project.currentObject.getAbsolutePosition();
                    var x = fabricPath.left// - symbolOffset.x;
                    var y = fabricPath.top// - symbolOffset.y;

                    var pathWickObject = WickObject.createPathObject(SVGData);
                    pathWickObject.x = x;
                    pathWickObject.y = y;

                    var smoothing = getBrushSmoothing();
                    var zoom = wickEditor.fabric.canvas.getZoom();
                    pathWickObject.scaleX = 1/smoothing/zoom;
                    pathWickObject.scaleY = 1/smoothing/zoom;
                    
                    wickEditor.paper.pathRoutines.refreshPathData(pathWickObject);

                    wickEditor.actionHandler.doAction('addObjects', {
                        wickObjects: [pathWickObject],
                        dontSelectObjects: true
                    });
                }

            });
        }

    }

    this.onSelected = function () {
        wickEditor.project.clearSelection();
    }

    var potraceFabricPath = function (pathFabricObject, callback) {
        // I think there's a bug in cloneAsImage when zoom != 1, this is a hack
        //var oldZoom = wickEditor.fabric.canvas.getZoom();
        //wickEditor.fabric.canvas.setZoom(1);

        var smoothing = getBrushSmoothing();
        var zoom = wickEditor.fabric.canvas.getZoom();
        pathFabricObject.scaleX = smoothing*zoom;
        pathFabricObject.scaleY = smoothing*zoom;
        pathFabricObject.setCoords();

        pathFabricObject.cloneAsImage(function(clone) {
            var img = new Image();
            img.onload = function () {
                potraceImage(img, callback, wickEditor.settings.fillColor);
            };
            img.src = clone._element.currentSrc || clone._element.src;
        });

        // Put zoom back to where it was before
        //wickEditor.fabric.canvas.setZoom(oldZoom);
    };

    var getBrushSmoothing = function () {
        if(!(wickEditor.currentTool instanceof Tools.Paintbrush)) {
            return 1;
        } else {
            return parseFloat(wickEditor.settings.brushSmoothness)/100;
        }
    }

}