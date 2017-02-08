/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

if(!window.Tools) Tools = {};

Tools.Zoom = function (wickEditor) {

    var that = this;

    this.zoomType = "in";

    this.getCursorImage = function () {
        if(this.zoomType === "in")
            return "zoom-in";
        else
            return "zoom-out";
    }

    this.getToolbarIcon = function () {
        return "resources/zoom.png";
    }

    this.getTooltipName = function () {
        return "Zoom";
    }
    
    this.setup = function () {
        wickEditor.fabric.canvas.on('mouse:down', function (e) {
            if(wickEditor.currentTool instanceof Tools.Zoom) {
                if (wickEditor.inputHandler.specialKeys["Modifier"]) {
                    wickEditor.fabric.zoom(0.9);
                } else {
                    wickEditor.fabric.zoom(1.1);
                }
            }
        });

        var sq = document.getElementById("editor");
        if (sq.addEventListener) {
            sq.addEventListener("mousewheel", MouseWheelHandler, false);
            sq.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
        }
        else sq.attachEvent("onmousewheel", MouseWheelHandler);
    }

// Scroll-to-zoom

    function MouseWheelHandler(e) {
        // cross-browser wheel delta
        e.preventDefault()
        if(wickEditor.inputHandler.specialKeys["Modifier"]) {
            var e = window.event || e;
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
            wickEditor.fabric.zoom(1.0 + delta*.1);
        }

        return false;
    }


}