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
        // Save if user doesn't need to see splash screen again...
        if($('#dontShowSplashScreenAgainCheckbox').is(':checked')) {
            localStorage.dontShowSplashScreen = false;
        }

        document.getElementById("splashScreenGUI").style.display = "none";
    }

    document.getElementById("editorCanvasContainer").onclick = that.closeSplashScreen;
    document.getElementById("timelineCanvas").onclick = that.closeSplashScreen;

// 

    document.getElementById('closeSplashScreenButton').onclick = function (e) {
        that.closeSplashScreen();
    }

// Auto-close splash screen if user wants it to be hidden

    if(localStorage.dontShowSplashScreen) {
        this.closeSplashScreen();
    }

}