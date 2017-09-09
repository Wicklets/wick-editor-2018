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

var WickTwoRenderer = function (canvasContainer, settings) {

    if(!settings) settings = {};

    var self = this;

    var two = two = new Two({
        type: Two.Types.webgl,
        fullscreen: false,
        autostart: true,
        ratio: 2/window.devicePixelRatio * (settings.scale || 1.0),
        width: parseInt(canvasContainer.style.width),
        height: parseInt(canvasContainer.style.height),
    }).appendTo(canvasContainer);

    var shapes = {};
    var currentProject;

    self.setup = function () {};

    self.render = function (wickProject, wickObjects) {
        // TODO:
        // Update transforms of all wick objects
        // Update fill/stroke etc
        // Add new wickobjects that were just added
        // Update ordering
        // Show/hide wickobjects
        // Render all wickobjects (update canvas)

        if(!currentProject || currentProject.uuid !== wickProject.uuid) {
            loadProjectSVGs(wickProject);
        }

        if(!wickObjects) {
            wickObjects = [wickProject.rootObject];
        }

        currentProject.getAllObjects().forEach(function (wickObject) {
            if(!wickObject._active && shapes[wickObject.uuid])
                shapes[wickObject.uuid].visible = false;
            if(shapes[wickObject.uuid] && !window.wickPlayer) 
                shape.visible = false;
        });

        wickObjects.forEach(function (wickObject) {
            renderWickObject(wickObject);
        })
        two.forcerender();
    }

    var renderWickObject = function (wickObject) {
        var shape = shapes[wickObject.uuid];
        if(shape) {
            if(!wickObject._wasActiveLastTick && wickObject._active)
                shape.visible = true;
            if(!window.wickPlayer) 
                shape.visible = true;

            var absTransforms = wickObject.getAbsoluteTransformations();
            shape._matrix
                .identity()
                .translate(absTransforms.position.x, absTransforms.position.y)
                .rotate(absTransforms.rotation/57.2958)
                .scale(absTransforms.scale.x, absTransforms.scale.y);
            if(absTransforms.opacity === 0) absTransforms.opacity = 0.01; // probably some !0=true bug in two.js
            shape.opacity = absTransforms.opacity;
        }

        wickObject.getAllActiveChildObjects().forEach(function (child) {
            renderWickObject(child);
        });
    }

    var loadProjectSVGs = function (wickProject) {
        currentProject = wickProject;
        two.clear();

        // setup canvas
        canvasContainer.style.backgroundColor = currentProject.backgroundColor;
        canvasContainer.style.width = currentProject.width + 'px';
        canvasContainer.style.height = currentProject.height + 'px';

        // load all wickobjects into two
        currentProject.getAllObjects().forEach(function (wickObject) {
            var shape;

            if(wickObject.pathData) {
                shape = TwoShapeGenerators['svg'](
                    wickObject.pathData,
                    wickObject.svgX,
                    wickObject.svgY,
                    wickObject.width,
                    wickObject.height
                );
            } else if (wickObject.textData) {
                shape = TwoShapeGenerators['text'](
                    wickObject.textData.text,
                    {
                        family: wickObject.textData.fontFamily,
                        size: wickObject.textData.fontSize,
                        leading: 0,
                        weight: wickObject.textData.fontWeight === 'normal' ? 400 : 900,
                        fill: wickObject.textData.fill,
                    }
                );
            } else if (wickObject.asset && wickObject.asset.type === 'image') {
                shape = TwoShapeGenerators['image'](
                    wickObject.asset.getData(),
                    wickObject.width,
                    wickObject.height,
                );
            }

            if(!shape) return;

            shape._matrix.manual = true;
            shape.visible = true;
            shapes[wickObject.uuid] = shape;
        });
    }

    var TwoShapeGenerators = {
        'svg' : function (svgData, x, y, width, height) {

            var svgcontainer = document.createElement('div');
            svgcontainer.innerHTML = svgData;

            // quick hack to ignore empty svgs (they really should be deleted by the editor though...)
            if(svgcontainer.children[0].innerHTML === '<path d=""></path>') return;
            shape = two.interpret(svgcontainer.children[0]);
            shape.children.forEach(function (child) {
                child.vertices.forEach(function (v) {
                    v.x -= (x||0) + width /2;
                    v.y -= (y||0) + height/2;
                });
            })

            var svg = svgcontainer.children[0];
            shape.fill = hexToRgbA(svg.getAttribute('fill'), svg.getAttribute('fill-opacity') || 1);
            shape.stroke = hexToRgbA(svg.getAttribute('stroke'), svg.getAttribute('stroke-opacity') || 1);
            shape.linewidth = parseInt(svg.getAttribute('stroke-width'));

            return shape;

        },
        'image' : function (src, width, height) {

            shape = two.makeRectangle(0, 0, width, height);
            var texture = new Two.Texture(src)

            shape.fill = texture;
            shape.stroke = 'rgba(0,0,0,0)';
            texture.scale = 1.0;

            return shape;

        },
        'text' : function (text, style) {

            shape = two.makeText(text, 0, 0, style);
            shape.fill = style.fill;

            return shape;

        }
    }

};

