$(document).ready(function() {

    var frame = document.getElementById("viewer-frame");

    var page = window.location.hash.replace("#", '');
    if(page !== '') {
        frame.src = "site/pages/" + page + ".html";
    }

    $( ".logo" ).click(function() {
        frame.src = "site/pages/home.html"
        window.location.hash = ""
    });

    $( ".tutorials-button" ).click(function() {
        frame.src = "site/pages/nothing.html"
        window.location.hash = "tutorials"
    });

    $( ".demos-button" ).click(function() {
        frame.src = "site/pages/nothing.html"
        window.location.hash = "demos"
    });

    $( ".reference-button" ).click(function() {
        frame.src = "site/pages/reference.html"
        window.location.hash = "reference"
    });

    $( ".about-button" ).click(function() {
        frame.src = "site/pages/about.html"
        window.location.hash = "about"
    });

    $( ".community-button" ).click(function() {
        frame.src = "site/pages/community.html"
        window.location.hash = "community"
    });

    $( ".logotop-bar-item" ).click(function() {
        frame.src = "site/pages/home.html"
        window.location.hash = ""
    });

});
