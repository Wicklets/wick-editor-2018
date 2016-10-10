/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var InputHandler = function (wickEditor) {

    this.mouse = {};
    this.keys = [];

    var editingTextBox = false;

    var oldTool = null;

    var that = this;

/*************************
     Mouse
*************************/

    document.addEventListener('mousemove', function(e) { 
        that.mouse.x = e.clientX;
        that.mouse.y = e.clientY;
    }, false );

    document.addEventListener('mousedown', function(e) { 
        that.mouse.down = true;
    }, false );

    document.addEventListener('mouseup', function(e) { 
        that.mouse.down = false;
    }, false );

    document.addEventListener('contextmenu', function (event) { 
        event.preventDefault();
    }, false);

}
