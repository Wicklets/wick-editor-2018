/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var SplashScreenInterface = function (wickEditor) {

    var that = this;

    this.setup = function () {
        
    }

    var mode = "Main"

    var open = true;

    this.syncWithEditorState = function () { 
        document.getElementById("splashScreenMain").style.display = "none";
        document.getElementById("splashScreenCredits").style.display = "none";

        document.getElementById("splashScreen"+mode).style.display = "block";

        that.resize();
        setTimeout(function () {
            that.resize();
        }, 50);
    }

// Center splash screen on resize

    this.resize = function () {
        if(!open) return

        var splashScreenWidth = parseInt($("#splashScreenGUI").css("width"));
        $("#splashScreenGUI").css('left', (window.innerWidth/2 - splashScreenWidth/2)+'px');

        var splashScreenHeight = document.getElementById("splashScreenGUI").offsetHeight;
        $("#splashScreenGUI").css('top', (window.innerHeight/2 - splashScreenHeight/2)+'px');
    }

    window.addEventListener('resize', function(e) {
        that.resize();
    });

    this.openSplashScreen = function () {
        document.getElementById("splashScreenGUI").style.display = "inline";
        open  =true;
    }

    this.closeSplashScreen = function () {
        // Save if user doesn't need to see splash screen again...
        if($('#dontShowSplashScreenAgainCheckbox').is(':checked')) {
            localStorage.dontShowSplashScreen = false;
        }

        document.getElementById("splashScreenGUI").style.display = "none";

        open = false;
    }

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