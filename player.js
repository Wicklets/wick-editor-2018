var WickPlayer = (function () {

    var wickPlayer = { REVISION: "dev" };

    // Global player vars
    var frames = [[]];
    var currentFrame = 1;
    var projectLoaded = false;
    var mousePos;

    // Framerate keeper 
    // http://www.html5gamedevs.com/topic/1828-how-to-calculate-fps-in-plain-javascript/
    var fps = { 
        startTime : 0,
        frameNumber : 0,
        getFPS : function() {
            this.frameNumber++;

            var d = new Date().getTime();
            var currentTime = ( d - this.startTime ) / 1000;
            var result = Math.floor( ( this.frameNumber / currentTime ) );

            if( currentTime > 1 ) {
                this.startTime = new Date().getTime();
                this.frameNumber = 0;
            }

            return result;
        }   
    };

    // Never set manually!!
    var loadBundledJSONWickProject = false;

    // Setup canvas
    var canvas = document.getElementById("playerCanvas");
    var context = canvas.getContext('2d');

/*****************************
    Check for Mobile/Desktop
*****************************/

    // Check if we're on a mobile device or not
    mobileMode = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    desktopMode = !mobileMode;

/*****************************
    Mouse events (desktop)
*****************************/

    if(desktopMode) {

        var getMousePos = function (canvas, evt) {
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
                    if(obj.wickData.clickable && pointInsideObj(obj, mousePos)) {
                        hoveredOverObj = true;
                        obj.hoveredOver = true;
                        break;
                    } else {
                        obj.hoveredOver = false;
                    }
                }
                //...and change the cursor if we are
                if(hoveredOverObj) {
                    document.getElementById("playerCanvasContainer").style.cursor = "pointer";
                } else {
                    document.getElementById("playerCanvasContainer").style.cursor = "default";
                }
            }
        }, false);

        document.getElementById("playerCanvasContainer").addEventListener("mousedown", function() {
            // Check if we clicked a clickable object
            for(var i = 0; i < frames[currentFrame].length; i++) {
                var obj = frames[currentFrame][i];
                if(obj.wickData.clickable && pointInsideObj(obj, mousePos)) {
                    currentFrame = obj.wickData.toFrame;
                    console.log("Went to frame " + currentFrame);
                    draw();
                    break;
                }
            }
        }, false);

    }

/*****************************
    Touch events (mobile)
*****************************/

    if(mobileMode) {

        var getTouchPos = function (canvas, evt) {
            var rect = canvas.getBoundingClientRect();
            var touch = evt.targetTouches[0];
            return {
                x: touch.pageX,
                y: touch.pageY
            };
        }

        document.getElementById("playerCanvasContainer").addEventListener("touchstart", function(evt) {
            console.log("bogo");

            // Check if we touched a clickable object
            for(var i = 0; i < frames[currentFrame].length; i++) {
                var obj = frames[currentFrame][i];
                if(obj.wickData.clickable && pointInsideObj(obj, getTouchPos(canvas, evt))) {
                    currentFrame = obj.wickData.toFrame;
                    console.log("Went to frame " + currentFrame);
                    draw();
                    break;
                }
            }
        }, false);

    }

/*****************************
    Player Utils
*****************************/

    var pointInsideObj = function(obj, point) {

        var scaledObjLeft = obj.left;
        var scaledObjTop = obj.top;
        var scaledObjWidth = obj.width*obj.scaleX;
        var scaledObjHeight = obj.height*obj.scaleY;

        return point.x >= scaledObjLeft && 
               point.y >= scaledObjTop &&
               point.x <= scaledObjLeft + scaledObjWidth && 
               point.y <= scaledObjTop + scaledObjHeight;
    }

/*****************************
    Draw loop
*****************************/

    // update canvas size on window resize
    window.addEventListener('resize', resizeCanvas, false);
    var resizeCanvas = function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();

    // start draw/update loop
    var animate = function () {
        requestAnimationFrame(animate);
        if(projectLoaded) {
            update();
            draw();
        }
    }
    animate();

    var update = function () {
        
    }

    var draw = function () {
        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw current frame content
        for(var i = 0; i < frames[currentFrame].length; i++) {
            context.save();

            var obj = frames[currentFrame][i];
            context.translate(obj.left, obj.top);
            context.scale(obj.scaleX, obj.scaleY);
            context.drawImage(obj.image, 0, 0);

            context.restore();
        }

        context.fillStyle = "Black";
        context.font      = "normal 16pt Arial";
        context.fillText(fps.getFPS(), 10, 26);

    }

/*****************************
    Opening projects
*****************************/

    var loadJSONProject = function (proj) {
        // load project JSON
        frames = JSON.parse(proj);
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

        console.log(frames)
    }

/*****************************
    Load bundled project
*****************************/

    // Load from a project JSON bundled with the player.
    // This variable is set by the editor.
    // Never set manually!!
    loadJSONProject(bundledJSONProject);

    return wickPlayer;

})();