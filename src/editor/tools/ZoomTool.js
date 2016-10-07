/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var ZoomTool = function (wickEditor) {

    var that = this;

    this.getCursorImage = function () {
        return "zoom-in";
    }
    
    wickEditor.interfaces.fabric.canvas.on('mouse:down', function (e) {
    	if(wickEditor.currentTool instanceof ZoomTool) {
    		if (wickEditor.inputHandler.keys[18]) {
                // alt-click zooms out
    			wickEditor.interfaces.fabric.zoom(0.9);
    		} else {
    			wickEditor.interfaces.fabric.zoom(1.1);
    		}
	    }
    });

// Scroll-to-zoom

    function MouseWheelHandler(e) {
        // cross-browser wheel delta
        e.preventDefault()
        var e = window.event || e;
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        wickEditor.interfaces.fabric.zoom(1.0 + delta*.1);

        return false;
    }
    var sq = document.getElementById("editor");
    if (sq.addEventListener) {
        sq.addEventListener("mousewheel", MouseWheelHandler, false);
        sq.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
    }
    else sq.attachEvent("onmousewheel", MouseWheelHandler);


}