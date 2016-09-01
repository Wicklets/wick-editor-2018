/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var SplashScreenInterface = function (wickEditor) {

    var that = this;

    this.syncWithEditorState = function () {
        
    }

// Center splash screen on resize

    this.resize = function () {
        var splashScreenWidth = parseInt($("#splashScreenGUI").css("width"));
        $("#splashScreenGUI").css('left', (window.innerWidth/2 - splashScreenWidth/2)+'px');

        var splashScreenHeight = parseInt($("#splashScreenGUI").css("height"));
        $("#splashScreenGUI").css('top', (window.innerHeight/2 - splashScreenHeight/2)+'px');
    }

    window.addEventListener('resize', function(e) {
        that.resize();
    });
    this.resize();

// Close splash screen if we click (almost) anywhere

    this.closeSplashScreen = function () {
        document.getElementById("splashScreenGUI").style.display = "none";
    }
    this.closeSplashScreen(); // temporary

    document.getElementById("editorCanvasContainer").onclick = that.closeSplashScreen;
    document.getElementById("timelineCanvas").onclick = that.closeSplashScreen;
    document.getElementById('splashScreenGUI').onclick = that.closeSplashScreen;

}