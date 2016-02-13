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
                console.log("Loading frame "+f+"...");
                var frame = frames[f];
                for(var i = 0; i < frame.length; i++) {
                    var obj = frame[i];
                    obj.image = new Image();
                    obj.image.src = obj.src;
                    console.log("Loaded object " + obj.wickData.name);
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
        if(projectLoaded) {
            mousePos = getMousePos(canvas, evt);

            // Check if we're hovered over a clickable object...
            var hoveredOverObj = false;
            for(var i = 0; i < frames[currentFrame].length; i++) {
                var obj = frames[currentFrame][i];
                if(obj.wickData.clickable && mouseInsideObj(obj)) {
                    hoveredOverObj = true;
                    break;
                }
            }
            //...and change the cursor if we are
            if(hoveredOverObj) {
                $('html,body').css('cursor','pointer');
            } else {
                $('html,body').css('cursor','default');
            }
        }
    }, false);

    document.getElementById("canvasContainer").addEventListener("mousedown", function(event) {
        // Check if we clicked a clickable object
        for(var i = 0; i < frames[currentFrame].length; i++) {
            var obj = frames[currentFrame][i];
            if(obj.wickData.clickable && mouseInsideObj(obj)) {
                currentFrame = obj.wickData.toFrame;
                console.log("Went to frame " + currentFrame);
                break;
            }
        }
    }, false);

/*****************************
    Player Utils
*****************************/

function mouseInsideObj(obj) {
    return mousePos.x >= obj.left && 
           mousePos.y >= obj.top &&
           mousePos.x <= obj.left + obj.width && 
           mousePos.y <= obj.top + obj.height;
}

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
        if(projectLoaded) {
            update();
            draw();
        }
    }, 1000/FPS);

    function update() {
        
    }

    function draw() {
        // Clear canvas
        context.fillStyle = '#FFFFFF';
        context.rect(0, 0, canvas.width, canvas.height);
        context.fill();

        // Draw current frame content
        for(var i = 0; i < frames[currentFrame].length; i++) {
            var obj = frames[currentFrame][i];
            context.drawImage(obj.image, obj.left, obj.top);
        }
    }

});