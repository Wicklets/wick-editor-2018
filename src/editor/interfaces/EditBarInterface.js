/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var EditbarInterface = function (wickEditor) {

    var that = this;

    this.setup = function () {
        
    }

    this.syncWithEditorState = function () {

    }

    this.resize = function () {
        /*var timelineLeft = $("#timelineGUI").css('left');
        var timelineWidth = $("#timelineGUI").css('width');
        $("#editBarGUI").css('left', (timelineLeft+timelineWidth)+'px');
        console.log($("#editBarGUI"))*/
    }
    window.addEventListener('resize', function(e) {
        that.resize();
    });

}