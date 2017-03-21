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

Tools.Ellipse = function (wickEditor) {

    var that = this;
    var fabricInterface = wickEditor.fabric;

    this.getCursorImage = function () {
        return "crosshair"
    };

    this.getToolbarIcon = function () {
        return "resources/ellipse.png";
    }

    this.getTooltipName = function () {
        return "Ellipse";
    }

    this.setup = function () {
        fabricInterface.canvas.on('mouse:down', function (e) {
            if(!(wickEditor.currentTool instanceof Tools.Ellipse)) return;

            fabricInterface.shapeDrawer.startDrawingShape('ellipse', e.e.offsetX, e.e.offsetY, that.createWickObjectFromShape);
        });
    }

    this.createWickObjectFromShape = function (drawingShape) {
        var origX = drawingShape.left;
        var origY = drawingShape.top;
        drawingShape.left = 0;
        drawingShape.top = 0;
        drawingShape.setCoords();
        //var svg = '<ellipse fill="'+drawingShape.fill+'" cx="'+drawingShape.rx+'" cy="'+drawingShape.ry+'" rx="'+drawingShape.width+'" ry="'+drawingShape.height+'"/>'
        var svg = '<ellipse cx="'+drawingShape.width/2+'" cy="'+drawingShape.height/2+'" fill="'+drawingShape.fill+'" rx="'+drawingShape.rx+'" ry="'+drawingShape.ry+'"/>'
        var svgString = '<svg id="svg" version="1.1" xmlns="http://www.w3.org/2000/svg">'+svg+'</svg>';

        drawingShape.remove()
        
        var pathWickObject = WickObject.fromPathFile(svgString);
        pathWickObject.x = origX;
        pathWickObject.y = origY;
        pathWickObject.width = drawingShape.width;
        pathWickObject.height = drawingShape.height;

        wickEditor.actionHandler.doAction('addObjects', {
            wickObjects: [pathWickObject],
            dontSelectObjects: true
        });
    }

}