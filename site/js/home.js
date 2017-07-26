$(document).ready(function() {

    $( ".launch-editor-button" ).click(function() {
        window.top.location.href = "/editor.html"
    });

    $( '.fork-me-on-github ').click(function() {
        window.top.location.href = "https://www.github.com/zrispo/wick/"
    });

    $.ajax({
        url: "demos/Homepage.json",
        type: 'GET',
        data: {},
        success: function(data) {
        	var playerContainer = document.getElementById('player-container');
            playerContainer.innerHTML = "";
            var iframe = document.createElement('iframe');
            iframe.className = 'player';
            iframe.onload = function () {
                iframe.contentWindow.runProject(JSON.stringify(data));
            }
            iframe.src = "../../player.html";
            playerContainer.appendChild(iframe);
        },
        error: function () {
            console.log("ajax: error")
        },
        complete: function(response, textStatus) {

        }
    });

});
