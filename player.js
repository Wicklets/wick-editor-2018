$(document).ready(function() {

    // Global player vars
    var frames = [[]];
    var currentFrame = 1;
    var projectLoaded = false;

    // Setup canvas
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext('2d');

/*****************************
    Temporary GUI events
*****************************/
    
    var fileInput = document.getElementById('projectFile');
    fileInput.addEventListener('change', function(e) {
        var file = fileInput.files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
            frames = JSON.parse(reader.result);
            projectLoaded = true;
        }
        reader.readAsText(file);
    });

/*****************************
    Draw loop
*****************************/

    // update canvas size on window resize
    window.addEventListener('resize', resizeCanvas, false);
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();

    // start draw/update loop
    var FPS = 30;
    setInterval(function() {
        draw();
    }, 1000/FPS);

    function draw() {
        context.fillStyle = '#FFFFFF';
        context.rect(0, 0, canvas.width, canvas.height);
        context.fill();

        if(projectLoaded) {
            context.fillStyle = '#000000';
            context.textAlign = 'center';
            context.font = "12px Arial";
            for(var i = 0; i < frames[currentFrame].length; i++) {
                context.fillText("Nothing.",canvas.width/2,canvas.height/2+i*12);
            }
        }
    }

});