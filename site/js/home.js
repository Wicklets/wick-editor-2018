$(document).ready(function() {

    $( ".launch-editor-button" ).click(function() {
        window.top.location.href = "/editor.html"
    });

    $( '.fork-me-on-github ').click(function() {
        window.top.location.href = "https://www.github.com/zrispo/wick/"
    });

});