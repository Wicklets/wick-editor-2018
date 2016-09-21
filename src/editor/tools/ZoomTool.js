var ZoomTool = function (wickEditor) {

    var that = this;

    var canvas = wickEditor.interfaces['fabric'].canvas;

    this.zoomMode = "zoomIn";

    canvas.on('mouse:down', function (e) {
    	if(wickEditor.currentTool instanceof ZoomTool) {
    		if (wickEditor.inputHandler.keys[18]) {
                // alt-click zooms out
    			zoom(0.9);
    		} else {
    			zoom(1.1);
    		}
	    }
    });

    var zoom = function (zoomAmount) {
        // Calculate new zoom amount
        var oldZoom = canvas.getZoom();
        var newZoom = canvas.getZoom() * zoomAmount;
        if(newZoom < 1) newZoom = 1;

        // Make sure we zoom into the center of the screen, not the corner...
        var oldWidth = window.innerWidth / oldZoom;
        var oldHeight = window.innerHeight / oldZoom;

        var newWidth = window.innerWidth / newZoom;
        var newHeight = window.innerHeight / newZoom;

        var panAdjustX = (newWidth - oldWidth) / 2;
        var panAdjustY = (newHeight - oldHeight) / 2;

        // Do da zoom!
        canvas.setZoom(newZoom);
        canvas.relativePan(new fabric.Point(panAdjustX,panAdjustY));
        canvas.renderAll();
    }

// Scroll-to-zoom

    function MouseWheelHandler(e) {
        // cross-browser wheel delta
        e.preventDefault()
        var e = window.event || e;
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        zoom(1.0 + delta*.1);

        return false;
    }
    var sq = document.getElementById("editor");
    if (sq.addEventListener) {
        sq.addEventListener("mousewheel", MouseWheelHandler, false);
        sq.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
    }
    else sq.attachEvent("onmousewheel", MouseWheelHandler);

}