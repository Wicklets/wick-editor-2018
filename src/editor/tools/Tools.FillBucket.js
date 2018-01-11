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

Tools.FillBucket = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        return 'url("resources/fillbucket-cursor.png") 64 64,default';
    };

    this.getToolbarIcon = function () {
        return "resources/tools/Bucket.svg";
    }

    this.getTooltipName = function () {
        return "Fill Bucket (G)";
    }

    this.setup = function () {

    }

    this.onSelected = function () {
        wickEditor.project.clearSelection();
        wickEditor.canvas.getInteractiveCanvas().needsUpdate = true;
    }

    this.paperTool = new paper.Tool();

    this.paperTool.onMouseMove = function(event) {
        
    }

    this.paperTool.onMouseDown = function (event) {
        var superPath = null;
        paper.project._activeLayer.children.forEach(function (child) {
            // TODO: Only include paths whos bounding boxes include the cursor position.
            // TODO: Only include paths who are on the active layer.
            if(child._isGUI) return;
            if(!child.closed) return;
            if(!superPath) superPath = child.clone({insert:false});
            superPath = superPath.unite(child);
        });

        var invertPath = new paper.Path.Rectangle(superPath.bounds);
        invertPath.fillColor = 'black';
        invertPath = invertPath.subtract(superPath);

        var pathsContainingCursor = [];
        invertPath.children.forEach(function (c) {
            c = c.clone({insert:false})
            c.clockwise = false;
            c.fillColor = wickEditor.settings.fillColor
            if(c.contains(event.point)) {
                pathsContainingCursor.push(c);
            }
            /*var clone = c.clone({insert:false})
            clone.clockwise = false;
            clone.fillColor = wickEditor.settings.fillColor;
            if(clone.contains(event.point)) {
                invertPath.children.forEach(function (co) {
                    if(c.area !== co.area) {
                        clone.clockwise = false;
                        clone = clone.subtract(co)
                    }
                });

                PaperHoleFinder.expandHole(clone);
                var svgString = clone.exportSVG({asString:true});
                var pathWickObject = WickObject.createPathObject(svgString);
                pathWickObject.x = clone.position.x;
                pathWickObject.y = clone.position.y;
                pathWickObject.width = clone.bounds._width;
                pathWickObject.height = clone.bounds._height;
                pathWickObject.svgX = clone.bounds._x;
                pathWickObject.svgY = clone.bounds._y;

                wickEditor.actionHandler.doAction('addObjects', {
                    wickObjects: [pathWickObject],
                    dontSelectObjects: true,
                });
            }*/
        });

        pathsContainingCursor.sort(function (a,b) {
            return a.area < b.area;
        });
        var holePath = pathsContainingCursor[0];

        invertPath.children.forEach(function (c) {
            c.clockwise = false;
            holePath.clockwise = false;

            if(holePath.area < c.area && Math.abs(c.area) > 1) {
                holePath = holePath.subtract(c)
            }
        });

        holePath.clockwise = false;
        PaperHoleFinder.expandHole(holePath);
        var pathWickObject = WickObject.createPathObject(holePath.exportSVG({asString:true}));
        pathWickObject.x = holePath.position.x;
        pathWickObject.y = holePath.position.y;
        pathWickObject.width = holePath.bounds._width;
        pathWickObject.height = holePath.bounds._height;
        pathWickObject.svgX = holePath.bounds._x;
        pathWickObject.svgY = holePath.bounds._y;

        wickEditor.actionHandler.doAction('addObjects', {
            wickObjects: [pathWickObject],
            dontSelectObjects: true,
        });
    }

}
