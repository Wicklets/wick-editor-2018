/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var StatusBarInterface = function (wickEditor) {

    var that = this;

    var messages = {
        none : "Wick Editor Open Beta",
        saving : "Saving...",
        done : "Save successful!",
        exporting : "Exporting...", 
        uploading : "Uploading...", 
        error : "Save error"
    }
    var state = 'none';

    var statusBarElem = document.getElementById("statusBarGUI");

    this.setState = function (newState) {
        state = newState;
        this.syncWithEditorState();
    }

    this.setup = function () {
        
    }

    this.syncWithEditorState = function () {
        var that = this;

        if(state === 'done') {
            setTimeout(function () {
                that.setState('none');
            }, 4000);
        }

        if(state === 'error') {
            setTimeout(function () {
                that.setState('none');
            }, 4000);
        }

        statusBarElem.innerHTML = messages[state];

    }

}