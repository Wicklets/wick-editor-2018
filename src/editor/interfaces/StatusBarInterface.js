/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var StatusBarInterface = function (wickEditor) {

    var that = this;

    var states = ['none','saving','done','exporting']
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

        if(state === 'none') {
            statusBarElem.style.display = 'none';
        } else {
            statusBarElem.style.display = 'block';
        }

        if(state === 'done') {
            setTimeout(function () {
                that.setState('none');
            }, 4000);
        }

        states.forEach(function (s) {
            document.getElementById('statusBarGUI' + s).style.display = 'none';
        });
        document.getElementById('statusBarGUI' + state).style.display = 'block';
    }

}