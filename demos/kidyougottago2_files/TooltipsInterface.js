/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var TooltipsInterface = function (wickEditor) {

    this.syncWithEditorState = function () {
        
    }

    $('.tooltipElem').on("mouseover", function(e) {
        $("#tooltipGUI").css('display', 'block');
        $("#tooltipGUI").css('top', wickEditor.inputHandler.mouse.y+5+'px');
        $("#tooltipGUI").css('left', wickEditor.inputHandler.mouse.x+5+'px');
        document.getElementById('tooltipGUI').innerHTML = e.currentTarget.attributes.alt.value;
    });

    $('.tooltipElem').on("mouseout", function(e) {
        $("#tooltipGUI").css('display', 'none');
    });

}