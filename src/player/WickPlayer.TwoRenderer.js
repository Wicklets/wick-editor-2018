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

    self.setup = function () {
        var two = new Two({
            type: Two.Types.webgl,
            fullscreen: true,
            autostart: true
        }).appendTo(canvasContainer);

        var ball = two.makeCircle(two.width / 2, two.height / 2, 50);
        ball.noStroke().fill = 'white';

        wickProject.getAllObjects().forEach(function (wickObject) {
            if(!wickObject.pathData) return;

            var svgcontainer = document.createElement('div');
            svgcontainer.innerHTML = wickObject.pathData;
            var shape = two.interpret(svgcontainer.children[0]).center();

            shape.fill = 'white';
            shape.visible = true;
            //shape.noStroke();
            shape.stroke = 'orangered'; // Accepts all valid css color
            shape.linewidth = 1;
            shape.translation.set(wickObject.x, wickObject.y);
        });
    }

    self.render = function () {
        // Update transforms of all wick objects
        // Render all wickobjects (update canvas)
    }

};