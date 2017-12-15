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
        
        if(wickEditor.currentTool instanceof Tools.FillBucket) {
            hitResult = event.item;
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
                    wickEditor.canvas.getInteractiveCanvas().pathRoutines.refreshPathData(superPathWickObject)
                    wickEditor.actionHandler.doAction('addObjects', {
                        wickObjects: [superPathWickObject],
                        sendToBack: true,
                        dontSelectObjects: true
                    });
                }*/

                GIFRenderer.getCanvasAsDataURL(function (dataURL) {
                    var img = document.createElement('img');
                    img.onload = function () {
                        var canvas = document.createElement('canvas');
                        var context = canvas.getContext("2d");
                        canvas.width = wickEditor.project.width*2;
                        canvas.height = wickEditor.project.height*2;
                        var mouseCanvasSpace = wickEditor.canvas.screenToCanvasSpace(wickEditor.inputHandler.mouse.x + wickEditor.project.width/2, wickEditor.inputHandler.mouse.y + wickEditor.project.height/2)
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

                                wickEditor.canvas.getInteractiveCanvas().pathRoutines.refreshPathData(pathWickObject);
                                
                                pathWickObject.x = tempPaperForPosition.position.x - wickEditor.project.width/2;
                                pathWickObject.y = tempPaperForPosition.position.y - wickEditor.project.height/2;

                                wickEditor.actionHandler.doAction('addObjects', {
                                    wickObjects: [pathWickObject],
                                    dontSelectObjects: true,
                                });
                                PaperHoleFinder.expandHole(pathWickObject.paper);
                                wickEditor.canvas.getInteractiveCanvas().pathRoutines.refreshSVGWickObject(pathWickObject.paper.children[0]);
                                wickEditor.actionHandler.doAction('moveObjectToZIndex', {
                                    objs:[pathWickObject],
                                    newZIndex: 0,
                                    dontAddToStack: true
                                });
                                wickEditor.syncInterfaces();

                            }, wickEditor.settings.fillColor);
                        }
                        final.src = canvas.toDataURL();
                    }
                    img.src = dataURL;
                });
            } else {
                /*if(hitResult.type === 'fill') {
                    wickEditor.canvas.getInteractiveCanvas().pathRoutines.setFillColor([event.item.wick], wickEditor.settings.fillColor);
                } else if (hitResult.type === 'stroke') {
                    wickEditor.canvas.getInteractiveCanvas().pathRoutines.setStrokeColor([event.item.wick], wickEditor.settings.strokeColor);
                }*/
            }
            
            return;
        }
    }

}
