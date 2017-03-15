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

    $( "#gallery-button" ).click(function() {
        frame.src = "site/pages/gallery.html"
        window.location.hash = "gallery"
    });

    $( "#tutorials-button" ).click(function() {
        frame.src = "site/pages/tutorials.html"
        window.location.hash = "tutorials"
    });

    $( "#reference-button" ).click(function() {
        frame.src = "site/pages/reference.html"
        window.location.hash = "reference"
    });

    $( "#about-button" ).click(function() {
        frame.src = "site/pages/about.html"
        window.location.hash = "about"
    });

});