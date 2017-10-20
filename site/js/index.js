$(document).ready(function() {

    var frame = document.getElementById("viewer-frame");

    function loadNewPage () {
        var page = window.location.hash.replace("#", '');
        if(page !== '') {
            frame.src = "site/pages/" + page + ".html";
        }
    }
    loadNewPage();

    window.addEventListener("hashchange", loadNewPage, false);

    $( ".logo" ).click(function() {
        frame.src = "site/pages/home.html"
        window.location.hash = ""
    });

    $( ".tutorials-button" ).click(function() {
        frame.src = "site/pages/tutorials.html"
        window.location.hash = "tutorials"
    });

    $( ".examples-button" ).click(function() {
        frame.src = "site/pages/examples.html"
        window.location.hash = "examples"
    });

    $( ".reference-button" ).click(function() {
        frame.src = "site/pages/reference.html"
        window.location.hash = "reference"
    });

    $( ".about-button" ).click(function() {
        frame.src = "site/pages/about.html"
        window.location.hash = "about"
    });

    $( ".updates-button" ).click(function() {
        frame.src = "site/pages/updates.html"
        window.location.hash = "updates"
    });

    $( ".community-button" ).click(function() {
        window.open('http://forum.wickeditor.com/');
    });

    $( ".logotop-bar-item" ).click(function() {
        frame.src = "site/pages/home.html"
        window.location.hash = ""
    });

});
