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

// IMPROVEMENTS
// Extend paths by CLONE_WIDTH_SHRINK
// Use paper.js bounds to ignore paths that definitely won't be part of the fill process

Tools.FillBucket = function (wickEditor) {

    var RES = 1.75;
    var FILL_TOLERANCE = 35;
    var N_RASTER_CLONE = 1;
    var CLONE_WIDTH_SHRINK = 1.0;
    var SHRINK_AMT = 0.85;
    var FILLBUCKETMOUSE_DELAY = 50; // milliseconds
    
    var PREVIEW_IMAGE = false;
    var LOG_PERFORMANCE = false;

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
        wickEditor.inspector.openToolSettings('fillbucket');
        wickEditor.project.clearSelection();
        wickEditor.canvas.getInteractiveCanvas().needsUpdate = true;
    }

    this.paperTool = new paper.Tool();

    this.paperTool.onMouseMove = function(event) {
        
    }

    this.paperTool.onMouseDown = function (event) {
        var hitResult = wickEditor.canvas.getInteractiveCanvas().getItemAtPoint(event.point, {
            fill: true,
            stroke: true,
            curves: true,
        });
        if(hitResult) {
            if(hitResult.type === 'fill') {
                changeFillColorOfItem(hitResult.item);
            } else if (hitResult.type === 'stroke') {
                changeStrokeColorOfItem(hitResult.item);
            }
        } else {
            setTimeout(function () {
                wickEditor.canvas.getCanvasContainer().style.cursor = 'wait';
            }, 0); 

            setTimeout(function () {
                fillHole(event, function () {
                    wickEditor.canvas.getCanvasContainer().style.cursor = that.getCursorImage();
                });
            }, FILLBUCKETMOUSE_DELAY);
        }
    }

    function changeFillColorOfItem (item) {
        wickEditor.guiActionHandler.doAction("changePathProperties", {
            fillColor: wickEditor.settings.fillColor,
            objs: [item.wick],
        });
    }

    function changeStrokeColorOfItem (item) {
        wickEditor.guiActionHandler.doAction("changePathProperties", {
            strokeColor: wickEditor.settings.fillColor,
            objs: [item.wick],
        });
    }

    // This is zach's secret vector fill bucket technique
    // Will document how it works later but trust me it's great

    function fillHole (event, callback) {
        var superGroup = new paper.Group({insert:false});
        wickEditor.project.getCurrentFrame().wickObjects.forEach(function (wo) {
            if(!wo.paper) return;
            if(wo.paper._class !== 'Path' && wo.paper._class !== 'CompoundPath') return;
            for(var i = 0; i < N_RASTER_CLONE; i++) {
                var clone = wo.paper.clone({insert:false});
                clone.strokeWidth *= CLONE_WIDTH_SHRINK;
                superGroup.addChild(clone);
            }
        });
        if(superGroup.children.length > 0) {
            startTiming()
            var raster = superGroup.rasterize(paper.view.resolution*RES/window.devicePixelRatio, {insert:false});
            var rasterPosition = raster.bounds.topLeft;
            var x = (event.point.x - rasterPosition.x) * RES;
            var y = (event.point.y - rasterPosition.y) * RES;
            if(x<0 || y<0) {
                callback();
                return;
            } 
            if(LOG_PERFORMANCE) stopTiming('rasterize')
            generateFloodFillImage(raster, x, y, function (floodFillImage) {
                if(LOG_PERFORMANCE) stopTiming('generateFloodFillImage')
                if(PREVIEW_IMAGE) previewImage(floodFillImage)
                imageToPath(floodFillImage, function (path) {
                    if(LOG_PERFORMANCE) stopTiming('imageToPath')
                    addFilledHoleToProject(path, rasterPosition.x, rasterPosition.y);
                });
            });
        } else {
            console.log('No paths to find holes of!');
        }
    }

    function generateFloodFillImage (raster, x, y, callback) {
        x = Math.round(x);
        y = Math.round(y);

        var rasterCanvas = raster.canvas;
        var rasterCtx = rasterCanvas.getContext('2d');
        var rasterImageData = rasterCtx.getImageData(0, 0, raster.width, raster.height);

        var floodFillCanvas = document.createElement('canvas');
        floodFillCanvas.width = rasterCanvas.width;
        floodFillCanvas.height = rasterCanvas.height;
        var floodFillCtx = floodFillCanvas.getContext('2d');
        floodFillCtx.putImageData(rasterImageData, 0, 0);
        floodFillCtx.fillStyle = "rgba(123,124,125,1)";
        floodFillCtx.fillFlood(x, y, FILL_TOLERANCE);
        var floodFillImageData = floodFillCtx.getImageData(0,0,floodFillCanvas.width,floodFillCanvas.height);
        var floodFillImageDataRaw = floodFillImageData.data;
        for(var i = 0; i < floodFillImageDataRaw.length; i += 4) {
          if(floodFillImageDataRaw[i] === 123 && floodFillImageDataRaw[i+1] === 124 && floodFillImageDataRaw[i+2] === 125) {
            floodFillImageDataRaw[i] = 0;
            floodFillImageDataRaw[i+1] = 0;
            floodFillImageDataRaw[i+2] = 0;
            floodFillImageDataRaw[i+3] = 255;
          } else if(floodFillImageDataRaw[i+3] !== 0) {
            floodFillImageDataRaw[i] = 255;
            floodFillImageDataRaw[i+1] = 0;
            floodFillImageDataRaw[i+2] = 0;
            floodFillImageDataRaw[i+3] = 255;
          } else {
            floodFillImageDataRaw[i] = 1;
            floodFillImageDataRaw[i+1] = 0;
            floodFillImageDataRaw[i+2] = 0;
            floodFillImageDataRaw[i+3] = 0;
          }
        }

        var w = floodFillCanvas.width;
        var h = floodFillCanvas.height;
        var r = 4;
        for(var this_x = 0; this_x < w; this_x++) {
            for(var this_y = 0; this_y < h; this_y++) {
                var thisPix = getPixelAt(this_x, this_y, w, h, floodFillImageDataRaw);
                if(thisPix && thisPix.r === 255) {
                    for(var offset_x = -r; offset_x <= r; offset_x++) {
                        for(var offset_y = -r; offset_y <= r; offset_y++) {
                            var other_x = this_x+offset_x;
                            var other_y = this_y+offset_y;
                            var otherPix = getPixelAt(other_x, other_y, w, h, floodFillImageDataRaw);
                            if(otherPix && otherPix.r === 0) {
                                setPixelAt(this_x, this_y, w, h, floodFillImageDataRaw, {
                                    r: 1,
                                    g: 255,
                                    b: 0,
                                    a: 255,
                                });
                            }
                        }
                    }
                }
            }
        }

        for(var i = 0; i < floodFillImageDataRaw.length; i += 4) {
          if(floodFillImageDataRaw[i] === 255) {
            floodFillImageDataRaw[i] = 0;
            floodFillImageDataRaw[i+1] = 0;
            floodFillImageDataRaw[i+2] = 0;
            floodFillImageDataRaw[i+3] = 0;
          }
        }
        floodFillCtx.putImageData(floodFillImageData, 0, 0);

        var floodFillImage = new Image();
        floodFillImage.onload = function () {
            callback(floodFillImage);
        }
        floodFillImage.src = floodFillCanvas.toDataURL();
    }

    function imageToPath (image, callback) {
        potraceImage(image, function (svgString) {
            var xmlString = svgString
              , parser = new DOMParser()
              , doc = parser.parseFromString(xmlString, "text/xml");
            callback(paper.project.importSVG(doc, {insert:true}));
        }, wickEditor.settings.fillColor);
    }

    function addFilledHoleToProject (path, x, y) {
        path.scale(1/RES, new paper.Point(0,0))
        expandHole(path, SHRINK_AMT);
        var pathWickObject = WickObject.createPathObject(path.exportSVG({asString:true}));
        pathWickObject.width = path.bounds.width;
        pathWickObject.height = path.bounds.height;
        pathWickObject.x = path.position.x+x// - wickEditor.project.width/2;
        pathWickObject.y = path.position.y+y// - wickEditor.project.height/2;
        pathWickObject.svgX = path.bounds._x;
        pathWickObject.svgY = path.bounds._y;
        wickEditor.actionHandler.doAction('addObjects', {
            wickObjects: [pathWickObject],
            dontSelectObjects: true,
            sendToBack: true,
        });
    }

    function expandHole (path, HOLE_EXPAND_AMT) {
        if(path instanceof paper.Group) {
            path = path.children[0];
        }

        var children;
        if(path instanceof paper.Path) {
            children = [path];
        } else if(path instanceof paper.CompoundPath) {
            children = path.children;
        }

        children.forEach(function (hole) {
            var normals = [];
            hole.closePath();
            hole.segments.forEach(function (segment) {
                //var n = segment.path.getNormalAt(segment.path.getOffsetOf(segment.point))
                //normals.push(n);
                var a = segment.previous.point;
                var b = segment.point;
                var c = segment.next.point;

                var ab = {x: b.x-a.x, y: b.y-a.y};
                var cb = {x: b.x-c.x, y: b.y-c.y};

                var d = {x: ab.x-cb.x, y: ab.y-cb.y};
                d.h = Math.sqrt((d.x*d.x)+(d.y*d.y));
                d.x /= d.h;
                d.y /= d.h;

                d = rotate_point(d.x, d.y, 0, 0, 90);

                normals.push({x:d.x,y:d.y});
            });

            for (var i = 0; i < hole.segments.length; i++) {
                var segment = hole.segments[i];
                var normal = normals[i];
                segment.point.x += normal.x*-HOLE_EXPAND_AMT;
                segment.point.y += normal.y*-HOLE_EXPAND_AMT;
            }

            for (var i = 0; i < hole.segments.length; i++) {
                var segment = hole.segments[i];
                
            }
        });
    }

}
