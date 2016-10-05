/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var FillBucketTool = function (wickEditor) {

	var that = this;

    var canvas = wickEditor.interfaces['fabric'].canvas;

    this.getCursorImage = function () {
        return 'url(resources/fillbucket-cursor.png) 64 64,default';
    }

    canvas.on('mouse:down', function(e) {
        if(e.e.button != 0) return;
        if(!(wickEditor.currentTool instanceof FillBucketTool)) return;

        
    });
    
}