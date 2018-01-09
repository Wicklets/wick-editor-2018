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
        var radius = wickEditor.settings.brushThickness/2;

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

    }

    this.onSelected = function () {
        wickEditor.project.clearSelection();
        wickEditor.canvas.getInteractiveCanvas().needsUpdate = true;
    }

    this.onDeselected = function () {
        if(path) path.remove();
    }

    this.paperTool = new paper.Tool();
    var path;
    var totalDelta;
    var lastEvent;

    this.paperTool.onMouseDown = function (event) {
        if (!path) {
            path = new paper.Path({
                //fillColor: wickEditor.settings.fillColor,
                strokeColor: wickEditor.settings.fillColor,
                strokeCap: 'round',
                strokeWidth: wickEditor.settings.brushThickness/wickEditor.canvas.getZoom(),
            });
            //path.add(event.lastPoint);
        }

        path.add(event.point);
    }

    this.paperTool.onMouseDrag = function (event) {

        if(!totalDelta) {
            totalDelta = event.delta;
        } else {
            totalDelta.x += event.delta.x;
            totalDelta.y += event.delta.y;
        }

        if (totalDelta.length > 2/wickEditor.canvas.getZoom()) {

            totalDelta.x = 0;
            totalDelta.y = 0;

            path.add(event.point)
            path.smooth();
            lastEvent = event;

        }
    }

    this.paperTool.onMouseUp = function (event) {
        if (path) {

            path.add(event.point)
            
            /*if(path.segments.length > 2) {
                path.smooth();

                if(wickEditor.settings.brushSmoothingAmount > 0) {
                    var t = wickEditor.settings.strokeWidth;
                    var s = wickEditor.settings.brushSmoothingAmount/100*10;
                    var z = wickEditor.canvas.getZoom();
                    path.simplify(t / z * s);
                }

                path.join(path, 10/wickEditor.canvas.getZoom())
            }*/

            

            var raster = path.rasterize();
            var rasterDataURL = raster.toDataURL()

            var final = new Image();
            final.onload = function () {
                //var win = window.open('', 'Title', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width='+wickEditor.project.width+', height='+wickEditor.project.height+', top=100, left=100');

                //win.document.body.innerHTML = '<div><img src= '+final.src+'></div>';

                potraceImage(final, function (svgString) {
                    var xmlString = svgString
                      , parser = new DOMParser()
                      , doc = parser.parseFromString(xmlString, "text/xml");
                    var tempPaperForPosition = paper.project.importSVG(doc, {insert:false});
                    tempPaperForPosition.closed = true;
                    tempPaperForPosition.children.forEach(function (c) {
                        c.closed = true;
                    })

                    var pathWickObject = WickObject.createPathObject(svgString);
                    pathWickObject.width = tempPaperForPosition.bounds.width;
                    pathWickObject.height = tempPaperForPosition.bounds.height;

                    pathWickObject.x = path.position.x// - wickEditor.project.width/2;
                    pathWickObject.y = path.position.y// - wickEditor.project.height/2;

                    wickEditor.actionHandler.doAction('addObjects', {
                        wickObjects: [pathWickObject],
                        dontSelectObjects: true,
                    });
                    pathWickObject.pathData = tempPaperForPosition.exportSVG({asString:true});
                    
                    path.remove();
                    path = null
                    wickEditor.syncInterfaces();

                }, wickEditor.settings.fillColor);
            }
            final.src = rasterDataURL;

        }
    }

}