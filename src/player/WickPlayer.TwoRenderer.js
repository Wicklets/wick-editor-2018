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

var WickTwoRenderer = function (canvasContainer, wickProject) {

    var self = this;

    var shapes = {};

    self.setup = function () {
        // setup two
        var two = new Two({
            type: Two.Types.svg,
            fullscreen: true,
            autostart: true
        }).appendTo(canvasContainer);

        // setup canvas
        canvasContainer.style.backgroundColor = wickProject.backgroundColor;
        canvasContainer.style.width = wickProject.width + 'px';
        canvasContainer.style.height = wickProject.height + 'px';

        // load all wickobjects into two
        wickProject.getAllObjects().forEach(function (wickObject) {
            if(!wickObject.pathData) return;

            var svgcontainer = document.createElement('div');
            svgcontainer.innerHTML = wickObject.pathData;

            // quick hack to ignore empty svgs
            if(svgcontainer.children[0].innerHTML === '<path d=""></path>') return;
            var shape = two.interpret(svgcontainer.children[0]).center();
            
            var absTransforms = wickObject.getAbsoluteTransformations();
            shape._matrix.manual = true;
            shape._matrix
                .identity()
                .translate(absTransforms.position.x, absTransforms.position.y)
                .rotate(absTransforms.rotation)
                .scale(absTransforms.scale.x, absTransforms.scale.y);

            var svg = svgcontainer.children[0];
            shape.visible = false;
            shape.fill = hexToRgbA(svg.getAttribute('fill'), svg.getAttribute('fill-opacity') || 1);
            shape.stroke = hexToRgbA(svg.getAttribute('stroke'), svg.getAttribute('stroke-opacity') || 1);
            shape.linewidth = parseInt(svg.getAttribute('stroke-width'));
            shape.opacity = absTransforms.opacity;

            shapes[wickObject.uuid] = shape;
        });
    }

    self.render = function (wickObjects) {
        // Update transforms of all wick objects
        // Update fill/stroke etc
        // Add new wickobjects that were just added
        // Update ordering
        // Show/hide wickobjects
        // Render all wickobjects (update canvas)

        if(!wickObjects) {
            wickObjects = [wickProject.rootObject];
        }

        for(uuid in shapes) {
            shapes[uuid].visible = false;
        }

        wickObjects.forEach(function (wickObject) {
            renderWickObject(wickObject);
        })
    }

    var renderWickObject = function (wickObject) {
        var shape = shapes[wickObject.uuid];
        if(shape) {
            shape.visible = true;
            /*shape.children.forEach(function (child) {
                child.vertices.forEach(function (v) {
                    v.x += Math.random()-.5
                    v.y += Math.random()-.5
                });
            })*/
        }

        wickObject.getAllActiveChildObjects().forEach(function (child) {
            renderWickObject(child);
        });
    }

};