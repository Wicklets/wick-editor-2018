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
    
var InteractiveCanvas = function (wickEditor) {

    var self = this;

    var paperCanvas;

    self.setup = function () {
        self.needsUpdate = true;

        // Create the canvas to be used with paper.js and init the paper.js instance.
        paperCanvas = document.createElement('canvas');
        paperCanvas.className = 'paperCanvas';
        paperCanvas.style.backgroundColor = "rgb(0,0,0,0)";
        paperCanvas.style.position = 'absolute';
        paperCanvas.style.top = "0px";
        paperCanvas.style.left = "0px";
        paperCanvas.style.width  = window.innerWidth+'px';
        paperCanvas.style.height = window.innerHeight+'px';
        paper.setup(paperCanvas);
        
        paper.view.viewSize.width  = window.innerWidth;
        paper.view.viewSize.height = window.innerHeight;
        window.addEventListener('resize', function () {
            paperCanvas.style.width  = window.innerWidth+'px';
            paperCanvas.style.height = window.innerHeight+'px';
            paper.view.viewSize.width  = window.innerWidth;
            paper.view.viewSize.height = window.innerHeight;
        }, false);
        paper.view.viewSize.width  = window.innerWidth;
        paper.view.viewSize.height = window.innerHeight;
        document.getElementById('editorCanvasContainer').appendChild(paperCanvas);

        paper._mainLayer = new paper.Layer();
        paper._guiLayer = new paper.Layer();
        paper._guiLayer.locked = true;
        paper._mainLayer.activate();

        //paper.install(window)

    }

    self.show = function () {
        paperCanvas.style.display = 'block'
    }

    self.hide = function () {
        paperCanvas.style.display = 'none'
    }

    self.update = function () {

        self.updateViewTransforms();

        if(wickEditor.currentTool.paperTool) wickEditor.currentTool.paperTool.activate();
        self.show();

        if(self.needsUpdate) {
            function createPathForWickobject (wickObject) {
                function proceed () {
                    wickObject.paper.position.x = wickObject.x;
                    wickObject.paper.position.y = wickObject.y;
                    if(wickObject.isPath) {
                        wickObject.paper.applyMatrix = true;
                    } else {
                        wickObject.paper.applyMatrix = false;
                    }
                    wickObject.paper.rotation = wickObject.rotation;
                    wickObject.paper.scaling.x = wickObject.scaleX;
                    wickObject.paper.scaling.y = wickObject.scaleY;

                    wickObject.paper.opacity = wickObject.opacity;
                    wickObject.svgStrokeWidth = wickObject.paper.strokeWidth;
                    
                    wickObject.paper.wick = wickObject;
                    return wickObject.paper;
                }

                if(wickObject.isPath) {
                    var xmlString = wickObject.pathData
                      , parser = new DOMParser()
                      , doc = parser.parseFromString(xmlString, "text/xml");
                    wickObject.paper = paper.project.importSVG(doc, {insert:false});
                    if(wickObject.paper._class === 'Group') {
                        wickObject.paper = wickObject.paper.children[0]
                    }
                    return proceed();
                } else if (wickObject.isImage) {
                    var raster = new paper.Raster(wickObject.asset.data);
                    wickObject.paper = raster;
                    /*wickObject.paper = new paper.Group();
                    wickObject.paper.addChild(raster);
                    wickObject.width = wickObject.paper.bounds._width;
                    wickObject.height = wickObject.paper.bounds._height;*/
                    wickObject.width = wickObject.paper.bounds._width;
                    wickObject.height = wickObject.paper.bounds._height;
                    return proceed();
                } else if (wickObject.isText) {
                    wickObject.paper = new paper.PointText({
                        point: paper.view.center,
                        justification: wickObject.textData.textAlign,
                        fontSize: wickObject.textData.fontSize,
                        fillColor: wickObject.textData.fill,
                        fontFamily: wickObject.textData.fontFamily,
                        content: wickObject.textData.text,
                        fontWeight: wickObject.textData.fontWeight + ' ' + wickObject.textData.fontStyle,
                    });
                    wickObject.width = wickObject.paper.bounds.width;
                    wickObject.height = wickObject.paper.bounds.height;
                    return proceed();
                } else if (wickObject.isSymbol) {
                    wickObject.paper = new paper.Group();
                    wickObject.getAllActiveChildObjects().forEach(function (child) {
                        createPathForWickobject(child)
                        wickObject.paper.addChild(child.paper);
                        child.paper._isPartOfGroup = true;
                    });
                    wickObject.paper._inLockedLayer = wickObject.parentFrame.parentLayer.locked;
                    wickObject.paper.pivot = new paper.Point(0,0);
                    return proceed();
                }
            }

            paper.project.activeLayer.removeChildren();

            var currentObj = wickEditor.project.getCurrentObject();
            if(!currentObj.isRoot) {
                var fullscreenRect = new paper.Path.Rectangle(
                    new paper.Point(-10000,-10000),
                    new paper.Point(10000,10000))
                fullscreenRect.fillColor = 'rgba(0,0,0,0.2)';
                fullscreenRect._isGUI = 'gui';

                var originPos = currentObj.getAbsolutePosition();
                var path = new paper.Path([100, 100], [100, 200]);
                var path2 = new paper.Path([50, 150], [150, 150]);
                var group = new paper.Group([path, path2]);
                group.strokeColor = '#777777';
                group._isGUI = 'gui';
                path._isGUI = 'gui';
                path2._isGUI = 'gui';

                group.position.x = originPos.x;
                group.position.y = originPos.y;
            }

            var activeObjects = currentObj.getAllActiveChildObjects();
            activeObjects.forEach(function (wickObject) {
                var layer = wickObject.parentFrame.parentLayer;
                if(layer.hidden) return;

                if(createPathForWickobject(wickObject)) {
                    var originPos = wickEditor.project.getCurrentObject().getAbsolutePosition();
                    wickObject.paper.position.x += originPos.x
                    wickObject.paper.position.y += originPos.y
                    wickObject.paper._inLockedLayer = layer.locked;
                    paper.project.activeLayer.addChild(wickObject.paper);
                    wickObject.paper._isPartOfGroup = false;
                }
            });
        }

        if(wickEditor.currentTool.forceUpdateSelection) {
            wickEditor.currentTool.forceUpdateSelection()
        }
        
        self.needsUpdate = false;
    }

    self.updateViewTransforms = function () {
        var zoom = wickEditor.canvas.getZoom();
        var pan = wickEditor.canvas.getPan();
        paper.view.matrix = new paper.Matrix();
        paper.view.matrix.translate(new paper.Point(pan.x,pan.y))
        paper.view.matrix.scale(zoom)
    }

    self.getColorAtPoint = function (point) {
        var hitResult = paper.project.hitTest(point, {
            segments: false,
            fill: true,
            curves: true,
            handles: false,
            stroke: true,
        });
        if(hitResult) {
            var item = hitResult.item;
            if(hitResult.type === 'stroke' && item.strokeColor) {
                return { type: 'stroke', color:item.strokeColor.toCSS() };
            } else if(hitResult.type === 'fill' && item.fillColor) {
                return { type: 'fill', color:item.fillColor.toCSS() };
            }
        }
    }

    self.getItemAtPoint = function (point, hitOptions) {
        if(!hitOptions) hitOptions = {};

        options = JSON.parse(JSON.stringify(hitOptions));
        if(!options.tolerance) options.tolerance = paper.settings.hitTolerance;
        options.tolerance /= wickEditor.canvas.getZoom();
        var hitResult = paper.project.hitTest(point, options);

        if(hitResult && (hitResult.item._isPartOfGroup || hitResult.item.parent._isPartOfGroup)) {
            if(hitOptions.allowGroups) {
                function getRootParent (item) {
                    if(item.parent._class === 'Layer') {
                        return item;
                    } else {
                        return getRootParent(item.parent)
                    }
                }
                hitResult.item = getRootParent(hitResult.item);
            } else {
                hitResult = null;
            }
        }

        if(hitResult && hitResult.item && hitResult.item._isGUI) {
            hitResult = null;
        }

        if(hitResult && hitResult.item && (hitResult.item._inLockedLayer || hitResult.item.parent._inLockedLayer)) {
            hitResult = null;
        }

        return hitResult;
    }

 }
