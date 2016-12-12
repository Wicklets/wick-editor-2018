/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var ZoomTool = function (wickEditor) {

    var that = this;

    this.zoomType = "in";

    this.getCursorImage = function () {
        if(this.zoomType === "in")
            return "zoom-in";
        else
            return "zoom-out";
    }
    
    wickEditor.interfaces.fabric.canvas.on('mouse:down', function (e) {
    	if(wickEditor.interfaces.fabric.currentTool instanceof ZoomTool) {
            console.log(wickEditor.guiActionHandler.keys)
    		if (wickEditor.guiActionHandler.keys[keyCharToCode["ALT"]]) {
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
        if(wickEditor.guiActionHandler.specialKeys["Modifier"]) {
            var e = window.event || e;
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
            wickEditor.interfaces.fabric.zoom(1.0 + delta*.1);
        }

        return false;
    }
    var sq = document.getElementById("editor");
    if (sq.addEventListener) {
        sq.addEventListener("mousewheel", MouseWheelHandler, false);
        sq.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
    }
    else sq.attachEvent("onmousewheel", MouseWheelHandler);


}