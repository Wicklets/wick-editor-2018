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
    
var TimelineInterface = function (wickEditor) {

    var self = this;

    var GRID_CELL_WIDTH = 25;
    var GRID_CELL_HEIGHT = 30;

    var container;
    var canvas;
    var ctx;

    var layers;
    var frames;
    var highlight;

    self.setup = function () {
        highlight = {
            active: true,
            row: 0,
            col: 0,
            w: 1,
            h: 1,
            length: 1
        }
        container = document.getElementById('timelineGUI');
        canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        canvas.onmousemove = function (e) {
            var rc = xyToRowCol(e.offsetX, e.offsetY);
            highlight.active = true;
            if(e.buttons === 1) {
                highlight.w = rc.col - highlight.col;
                if(highlight.w < 1) highlight.w = 1
            } else {
                highlight.row = rc.row;
                highlight.col = rc.col;
            }
            paint();
        }
        canvas.onmouseout = function (e) {
            highlight.active = false;
            paint();
        }
        canvas.onmousedown = function (e) {
            paint();
        }
        canvas.onmouseup = function (e) {
            paint();
        }
        ctx = canvas.getContext('2d');
        container.appendChild(canvas);
    }

    self.syncWithEditorState = function () {
        var obj = wickEditor.project.getCurrentObject();
        layers = obj.getAllLayers();
        frames = obj.getAllFrames();
        paint();
    }

// Painting

    function paint () {
        paintBG();
        paintGrid();
        paintLayers();
        paintFrames();
        paintHighlight();
    }

    function paintBG () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function paintGrid () {
        ctx.strokeStyle = "black";

        for(var i = 0; i < canvas.height/GRID_CELL_HEIGHT; i++) {
            var y = i*GRID_CELL_HEIGHT;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
            ctx.closePath();
        }

        for(var i = 0; i < canvas.width/GRID_CELL_WIDTH; i++) {
            var x = i*GRID_CELL_WIDTH;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
            ctx.closePath();
        }
    }

    function paintLayers () {

    }

    function paintFrames() {
        frames.forEach(function (frame) {
            var xy = rowColToXY(frame.getLayerIndex(), frame.playheadPosition);
            ctx.fillStyle = "red";
            ctx.fillRect(xy.x, xy.y, GRID_CELL_WIDTH*frame.length, GRID_CELL_HEIGHT);
        });
    }

    function paintHighlight () {
        if(highlight.active) {
            var xy = rowColToXY(highlight.row, highlight.col);
            ctx.fillStyle = "rgba(0,0,255,0.5)";
            ctx.fillRect(xy.x, xy.y, GRID_CELL_WIDTH*highlight.w, GRID_CELL_HEIGHT*highlight.h);
        }
    }

// Grid Utils

    function xyToRowCol (x,y) {
        return {
            col: Math.floor(x/GRID_CELL_WIDTH),
            row: Math.floor(y/GRID_CELL_HEIGHT),
        }
    }

    function rowColToXY(row,col) {
        return {
            x: col * GRID_CELL_WIDTH,
            y: row * GRID_CELL_HEIGHT
        }
    }

}
