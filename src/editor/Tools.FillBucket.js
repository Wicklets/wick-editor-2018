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

    this.onSelected = function () {
        wickEditor.project.clearSelection();
        wickEditor.canvas.getPaperCanvas().needsUpdate = true;
    }

    this.paperTool = new paper.Tool();

    this.paperTool.onMouseMove = function(event) {
        
    }

    this.paperTool.onMouseDown = function (event) {
        
        if(wickEditor.currentTool instanceof Tools.FillBucket) {
            var hitOptions = {
                fill: true,
                stroke: true,
                tolerance: 5 / wickEditor.canvas.getFabricCanvas().getCanvasTransform().zoom
            }
            hitResult = paper.project.hitTest(event.point, hitOptions);
            if(!hitResult) {
                //console.log(PaperHoleFinder.getHoleShapeAtPosition(paper.project, event.point));
                /*var hole = PaperHoleFinder.getHoleShapeAtPosition(paper.project, event.point);
                if(hole) {
                    PaperHoleFinder.expandHole(hole);
                    hole.fillColor = wickEditor.settings.fillColor;
                    hole.strokeColor = wickEditor.settings.fillColor;
                    hole.strokeWidth = 0;
                    (hole.children || []).forEach(function (child) {
                        child.segments.forEach(function (segment) {
                            if(isNaN(segment.point.x)) segment.point.x = 0;
                            if(isNaN(segment.point.y)) segment.point.y = 0;
                        })
                    });
                    var superPathString = hole.exportSVG({asString:true});
                    var svgString = '<svg id="svg" version="1.1" width="'+hole.bounds._width+'" height="'+hole.bounds._height+'" xmlns="http://www.w3.org/2000/svg">' +superPathString+ '</svg>'
                    var superPathWickObject = WickObject.createPathObject(svgString);
                    superPathWickObject.x = hole.position.x;
                    superPathWickObject.y = hole.position.y;
                    wickEditor.canvas.getPaperCanvas().pathRoutines.refreshPathData(superPathWickObject)
                    wickEditor.actionHandler.doAction('addObjects', {
                        wickObjects: [superPathWickObject],
                        sendToBack: true,
                        dontSelectObjects: true
                    });
                }*/

                GIFRenderer.renderProjectAsPNG(function (dataURL) {
                    var img = document.createElement('img');
                    img.onload = function () {
                        var canvas = document.createElement('canvas');
                        var context = canvas.getContext("2d");
                        canvas.width = wickEditor.project.width;
                        canvas.height = wickEditor.project.height;
                        var mouseCanvasSpace = wickEditor.canvas.getFabricCanvas().screenToCanvasSpace(wickEditor.inputHandler.mouse.x, wickEditor.inputHandler.mouse.y)
                        context.drawImage(img, 0, 0);
                        context.fillStyle = "rgba(123,123,123,1)";
                        context.fillFlood(mouseCanvasSpace.x, mouseCanvasSpace.y, 10);
                        //var win = window.open('', 'Title', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width='+wickEditor.project.width+', height='+wickEditor.project.height+', top=100, left=100');

                        //win.document.body.innerHTML = '<div><img src= '+canvas.toDataURL()+'></div>';

                        var imageData = context.getImageData(0, 0, img.width, img.height);
                        var data = imageData.data;

                        for(var i = 0; i < data.length; i += 4) {
                          if(data[i] !== 123) {
                            data[i] = 0;
                            data[i+1] = 0;
                            data[i+2] = 0;
                            data[i+3] = 0;
                          } else {
                            data[i] = 255;
                            data[i+1] = 255;
                            data[i+2] = 255;
                            data[i+3] = 255;
                          }
                        }

                        // overwrite original image
                        context.putImageData(imageData, 0, 0);

                        var final = new Image();
                        final.onload = function () {
                            //var win = window.open('', 'Title', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width='+wickEditor.project.width+', height='+wickEditor.project.height+', top=100, left=100');

                            //win.document.body.innerHTML = '<div><img src= '+final.src+'></div>';


                            potraceImage(final, function (svgString) {
                                var xmlString = svgString
                                  , parser = new DOMParser()
                                  , doc = parser.parseFromString(xmlString, "text/xml");
                                var tempPaperForPosition = paper.project.importSVG(doc, {insert:false});

                                var pathWickObject = WickObject.createPathObject(svgString);
                                pathWickObject.x = 0;
                                pathWickObject.y = 0;
                                pathWickObject.width = 1;
                                pathWickObject.height = 1;

                                wickEditor.canvas.getPaperCanvas().pathRoutines.refreshPathData(pathWickObject);
                                PaperHoleFinder.expandHole(pathWickObject.paper.children[0]);

                                pathWickObject.x = tempPaperForPosition.position.x;
                                pathWickObject.y = tempPaperForPosition.position.y;

                                wickEditor.actionHandler.doAction('addObjects', {
                                    wickObjects: [pathWickObject],
                                    dontSelectObjects: true,
                                });
                            }, wickEditor.settings.fillColor);
                        }
                        final.src = canvas.toDataURL();
                    }
                    img.src = dataURL;
                });
            } else {
                if(hitResult.type === 'fill') {
                    wickEditor.canvas.getPaperCanvas().pathRoutines.setFillColor([event.item.wick], wickEditor.settings.fillColor);
                } else if (hitResult.type === 'stroke') {
                    wickEditor.canvas.getPaperCanvas().pathRoutines.setStrokeColor([event.item.wick], wickEditor.settings.strokeColor);
                }
            }
            
            return;
        }
    }

}
