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
        var hitResult = wickEditor.canvas.getInteractiveCanvas().getItemAtPoint(event.point);

        if(hitResult) {
            if(hitResult.type === 'fill') {
                changeFillColorOfItem(hitResult.item)
            } else if (hitResult.type === 'stroke') {
                changeStrokeColorOfItem(hitResult.item)
            }
        } else {
            fillHole(event);
        }
    }

    function changeFillColorOfItem (item) {
        wickEditor.project.selectObject(item.wick)
        wickEditor.guiActionHandler.doAction("changePathProperties", {
            fillColor: wickEditor.settings.fillColor
        });
        wickEditor.project.clearSelection();
        wickEditor.syncInterfaces();
    }

    function changeStrokeColorOfItem (item) {
        wickEditor.project.selectObject(item.wick)
        wickEditor.guiActionHandler.doAction("changePathProperties", {
            strokeColor: wickEditor.settings.strokeColor
        });
        wickEditor.project.clearSelection();
        wickEditor.syncInterfaces();
    }

    function fillHole (event) {
        var children = [];
        paper.project._activeLayer.children.forEach(function (child) {
            // TODO: Only include paths whos bounding boxes include the cursor position.
            // TODO: Only include paths who are on the active layer.
            if(child._isGUI) return;
            if(!child.wick || child.wick.parentFrame.parentLayer !== wickEditor.project.getCurrentLayer()) return;
            if(!child.closed) return;

            var nextPath;
            if(!child.closed) {
                nextPath = offsetStroke(child, child.strokeWidth);
            } else {
                nextPath = child;
            }
            nextPath.resolveCrossings()

            children.push(nextPath)
        });

        var superPath = null;
        children.forEach(function (child) {
            if(!superPath) superPath = child.clone({insert:false});
            superPath = superPath.unite(child);
        });

        if(!superPath) {
            console.log('No paths found to make hole.')
            return;
        }

        var invertPath = new paper.Path.Rectangle(superPath.bounds);
        invertPath.fillColor = 'black';
        invertPath = invertPath.subtract(superPath);

        if(!invertPath || !invertPath.children || invertPath.children.length < 1) {
            return;
        }

        var pathsContainingCursor = [];
        invertPath.children.forEach(function (c) {
            c = c.clone({insert:false})
            c.clockwise = false;
            c.fillColor = wickEditor.settings.fillColor
            if(c.contains(event.point)) {
                pathsContainingCursor.push(c);
            }
        });

        pathsContainingCursor.sort(function (a,b) {
            return a.area < b.area;
        });
        var holePath = pathsContainingCursor[0];

        if(!holePath) {
            console.log('No fillable holes found.')
            return;
        }

        invertPath.children.forEach(function (c) {
            c.clockwise = false;
            holePath.clockwise = false;

            if(holePath.area < c.area && Math.abs(c.area) > 1) {
                holePath = holePath.subtract(c)
            }
        });

        console.log(holePath)

        // TODO: Ignore resulting paths of leaky holes being filled.

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
