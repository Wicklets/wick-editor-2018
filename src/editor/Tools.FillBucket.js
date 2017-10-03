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

    this.getCanvasMode = function () {
        return 'paper';
    }

    this.paperTool = new paper.Tool();

    this.paperTool.onMouseMove = function(event) {
        
    }

    this.paperTool.onMouseDown = function (event) {

        if(wickEditor.currentTool instanceof Tools.FillBucket) {
            var hitOptions = {
                fill: true,
                stroke: true,
                tolerance: 5 / wickEditor.fabric.getCanvasTransform().zoom
            }
            hitResult = paper.project.hitTest(event.point, hitOptions);
            if(!hitResult) {
                //console.log(PaperHoleFinder.getHoleShapeAtPosition(paper.project, event.point));
                var hole = PaperHoleFinder.getHoleShapeAtPosition(paper.project, event.point);
                PaperHoleFinder.expandHole(hole);
                if(hole) {
                    hole.fillColor = wickEditor.settings.fillColor;
                    hole.strokeColor = wickEditor.settings.fillColor;
                    hole.strokeWidth = 0;
                    var superPathString = hole.exportSVG({asString:true});
                    var svgString = '<svg id="svg" version="1.1" width="'+hole.bounds._width+'" height="'+hole.bounds._height+'" xmlns="http://www.w3.org/2000/svg">' +superPathString+ '</svg>'
                    var superPathWickObject = WickObject.createPathObject(svgString);
                    superPathWickObject.x = hole.position.x;
                    superPathWickObject.y = hole.position.y;
                    wickEditor.paper.pathRoutines.refreshPathData(superPathWickObject)
                    wickEditor.actionHandler.doAction('addObjects', {
                        wickObjects: [superPathWickObject],
                        sendToBack: true,
                        dontSelectObjects: true
                    });
                }
            } else {
                if(hitResult.type === 'fill') {
                    wickEditor.paper.pathRoutines.setFillColor([event.item.wick], wickEditor.settings.fillColor);
                } else if (hitResult.type === 'stroke') {
                    wickEditor.paper.pathRoutines.setStrokeColor([event.item.wick], wickEditor.settings.strokeColor);
                }
            }
            
            return;
        }
        
    }

}