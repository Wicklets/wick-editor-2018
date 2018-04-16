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

Tools.Paintbrush = function (wickEditor) {

    var self = this;

    var croquis;
    var croquisDOMElement;

    this.getCursorImage = function () {
        return 'crosshair'
    };

    this.getToolbarIcon = function () {
        return "resources/tools/Paintbrush.svg";
    }

    this.getTooltipName = function () {
        return "Brush (B)";
    }

    this.setup = function () {
        croquis = new Croquis();
        croquis.setCanvasSize(window.innerWidth, window.innerHeight);
        croquis.addLayer();
        croquis.fillLayer('rgba(0,0,0,0)');
        croquis.addLayer();
        croquis.selectLayer(1);

        var brush = new Croquis.Brush();
        brush.setSize(40);
        brush.setColor('#000');
        brush.setSpacing(0.2);

        croquis.setTool(brush);
        croquis.setToolStabilizeLevel(20);
        croquis.setToolStabilizeWeight(0.2);

        croquisDOMElement = croquis.getDOMElement();
        croquisDOMElement.style.display = 'none'
        croquisDOMElement.style.pointerEvents = 'none';
        document.getElementById('editorCanvasContainer').appendChild(croquisDOMElement);
    }

    this.onSelected = function () {
        wickEditor.inspector.openToolSettings('paintbrush');
        wickEditor.project.clearSelection();
        wickEditor.canvas.getInteractiveCanvas().needsUpdate = true;
        croquisDOMElement.style.display = 'block'
    }

    this.onDeselected = function () {
        croquisDOMElement.style.display = 'none'
    }

    this.paperTool = new paper.Tool();

    this.paperTool.onMouseDown = function (event) {
        e = event.event
        var pointerPosition = getRelativePosition(e.clientX, e.clientY);
        croquis.down(pointerPosition.x, pointerPosition.y, e.pointerType === "pen" ? e.pressure : 1);
    }

    this.paperTool.onMouseDrag = function (event) {
        e = event.event
        var pointerPosition = getRelativePosition(e.clientX, e.clientY);
        croquis.move(pointerPosition.x, pointerPosition.y, e.pointerType === "pen" ? e.pressure : 1);
    }

    this.paperTool.onMouseUp = function (event) {
        e = event.event
        var pointerPosition = getRelativePosition(e.clientX, e.clientY);
        croquis.up(pointerPosition.x, pointerPosition.y, e.pointerType === "pen" ? e.pressure : 1);
        
        setTimeout(function () {
            var i = new Image();
            i.onload = function () {
                //previewImage(i)
                potraceImage(i, function (svgString) {
                    var xmlString = svgString
                      , parser = new DOMParser()
                      , doc = parser.parseFromString(xmlString, "text/xml");
                    var tempPaperForPosition = paper.project.importSVG(doc, {insert:false});

                    var pathWickObject = WickObject.createPathObject(svgString);
                    pathWickObject.width = tempPaperForPosition.bounds.width;
                    pathWickObject.height = tempPaperForPosition.bounds.height;

                    console.log(tempPaperForPosition)
                    pathWickObject.x = tempPaperForPosition.position.x - wickEditor.canvas.getPan().x;
                    pathWickObject.y = tempPaperForPosition.position.y - wickEditor.canvas.getPan().y;

                    console.log(wickEditor.canvas)

                    //tempPaperForPosition.scale(1/smoothing);
                    pathWickObject.pathData = tempPaperForPosition.exportSVG({asString:true});

                    wickEditor.actionHandler.doAction('addObjects', {
                        wickObjects: [pathWickObject],
                        dontSelectObjects: true,
                    });

                    //croquis.clearLayer();
                });
            }
            i.src = document.getElementsByClassName('croquis-layer-canvas')[1].toDataURL();
        }, 20);
    }

    function getRelativePosition(absoluteX, absoluteY) {
        var rect = croquisDOMElement.getBoundingClientRect();
        return {x: absoluteX - rect.left, y: absoluteY - rect.top};
    }
}
