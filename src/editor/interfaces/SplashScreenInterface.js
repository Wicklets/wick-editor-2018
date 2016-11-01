/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var SplashScreenInterface = function (wickEditor) {

    var that = this;

    var mode = "Main"

    this.syncWithEditorState = function () {
        document.getElementById("splashScreenMain").style.display = "none";
        document.getElementById("splashScreenCredits").style.display = "none";

        document.getElementById("splashScreen"+mode).style.display = "block";

        setTimeout(function () {
            that.resize();
        }, 50)
    }

// Center splash screen on resize

    this.resize = function () {
        var splashScreenWidth = parseInt($("#splashScreenGUI").css("width"));
        $("#splashScreenGUI").css('left', (window.innerWidth/2 - splashScreenWidth/2)+'px');

        var splashScreenHeight = document.getElementById("splashScreenGUI").offsetHeight;
        $("#splashScreenGUI").css('top', (window.innerHeight/2 - splashScreenHeight/2)+'px');
    }

    window.addEventListener('resize', function(e) {
        that.resize();
    });

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
    document.getElementById("settingsGUI").onclick = that.closeSplashScreen;
    document.getElementById("menuBarGUI").onclick = that.closeSplashScreen;
    document.getElementById("timelineGUI").onclick = that.closeSplashScreen;
    document.getElementById("toolbarGUI").onclick = that.closeSplashScreen;
    document.getElementById("settingsGUI").onclick = that.closeSplashScreen;

// Buttons

    document.getElementById('closeSplashScreenButton').onclick = function (e) {
        that.closeSplashScreen();
    }

    document.getElementById('splashScreenCreditsButton').onclick = function (e) {
        mode = "Credits";
        that.syncWithEditorState();
    }

    document.getElementById('splashScreenBackButton').onclick = function (e) {
        mode = "Main";
        that.syncWithEditorState();
    }

// Auto-close splash screen if user wants it to be hidden

    if(localStorage.dontShowSplashScreen) {
        this.closeSplashScreen();
    }

}