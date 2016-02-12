$(document).ready(function() {

    // Global player vars
    var frames = [[]];
    var currentFrame = 1;
    var projectLoaded = false;
    var mousePos;

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
            // load project JSON
            frames = JSON.parse(reader.result);
            projectLoaded = true;

            // make canvas images out of src
            for(var f = 0; f < frames.length; f++) {
                var frame = frames[f];
                for(var i = 0; i < frame.length; i++) {
                    var obj = frame[i];
                    obj.image = new Image();
                    obj.image.src = obj.src;
                }
            }
        }
        reader.readAsText(file);
    });

/*****************************
    Mouse events
*****************************/

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    canvas.addEventListener('mousemove', function(evt) {
        mousePos = getMousePos(canvas, evt);
    }, false);

    document.getElementById("canvasContainer").addEventListener("mousedown", function(event) {
        // TODO: Check for clickable wickObjects in current frame
    }, false);

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
        update();
        draw();
    }, 1000/FPS);

    function update() {
        
    }

    function draw() {
        // Clear canvas
        context.fillStyle = '#FFFFFF';
        context.rect(0, 0, canvas.width, canvas.height);
        context.fill();

        // Draw current frame content
        if(projectLoaded) {
            for(var i = 0; i < frames[currentFrame].length; i++) {
                var obj = frames[currentFrame][i];
                context.drawImage(obj.image, obj.left, obj.top);
            }
        }
    }

});