
var CAPTURE_DELAY = 150;

var cropboxX;
var cropboxY;

var cropboxWidth;
var cropboxHeight;

var mouseDown;

function onMessage(request, sender, callback) {

    if (!document.getElementById("cropbox")) {
        updateCropbox();
    } else if (request.msg === 'scrollPage') {
        document.getElementById('dranimateImageCropperContainer').style.display = "none";
        getPositions(callback);
    } else if (request.msg == 'logMessage') {
        console.log('[POPUP LOG]', request.data);
    } else {
        console.error('Unknown message received from background: ' + request.msg);
    }
}

if (!window.hasScreenCapturePage) {
    window.hasScreenCapturePage = true;
    chrome.extension.onRequest.addListener(onMessage);
}

function max(nums) {
    return Math.max.apply(Math, nums.filter(function(x) { return x; }));
}

function updateCropbox() {
    var dranimateImageCropperContainer = document.createElement('span');
    dranimateImageCropperContainer.style.width = '100%';
    dranimateImageCropperContainer.style.height = '100%';
    dranimateImageCropperContainer.id = 'dranimateImageCropperContainer';
    document.getElementsByTagName('body')[0].style.width = '100%';
    document.getElementsByTagName('body')[0].style.height = '100%';
    document.getElementsByTagName('body')[0].appendChild(dranimateImageCropperContainer);

    /* Add a div that takes up the whole screen so user knows we're cropping */

    var transparentCover = document.createElement('span');
    transparentCover.id = 'transparentCover';
    transparentCover.style.position = 'fixed';
    transparentCover.style.width = '100%';
    transparentCover.style.height = '100%';
    transparentCover.style.top = '0';
    transparentCover.style.left = '0';
    transparentCover.style.opacity = '0.5';
    transparentCover.style.backgroundColor = 'white';
    transparentCover.style.zIndex = '10000';
    document.getElementById('dranimateImageCropperContainer').appendChild(transparentCover);

    /* Make the cropbox */

    var cropbox = document.createElement('span');
    cropbox.id = 'cropbox';
    cropbox.style.position = 'fixed';
    cropbox.style.width = '0px';
    cropbox.style.height = '0px';
    cropbox.style.opacity = '1.0';
    cropbox.style.backgroundColor = "white";
    cropbox.style.border = "2px dashed #000000";
    cropbox.style.zIndex = '10000';
    document.getElementById('transparentCover').appendChild(cropbox);

    /* Add mouse events to control cropbox */

    document.addEventListener( 'mousedown', function ( event ) {

        mouseDown = true;

        var mouseX = event.clientX;
        var mouseY = event.clientY;

        cropboxX = mouseX;
        cropboxY = mouseY;

        var cropbox = document.getElementById('cropbox');
        cropbox.style.left = cropboxX + 'px';
        cropbox.style.top = cropboxY + 'px';

        // Reset cropbox size if user wants to start over

        cropboxWidth = 1;
        cropboxHeight = 1;

        cropbox.style.width = cropboxWidth + 'px';
        cropbox.style.height = cropboxHeight + 'px';

    }, false );

    document.addEventListener( 'mouseup', function ( event ) {

        mouseDown = false;

    }, false );

    document.addEventListener( 'mousemove', function ( event ) {

        if(mouseDown) {
            var mouseX = event.clientX;
            var mouseY = event.clientY;

            cropboxWidth = (mouseX - cropboxX);
            cropboxHeight = (mouseY - cropboxY);

            var cropbox = document.getElementById('cropbox');
            cropbox.style.width = cropboxWidth + 'px';
            cropbox.style.height = cropboxHeight + 'px';
        }

    }, false );
}

function getPositions(callback) {
    var body = document.body,
        widths = [
            document.documentElement.clientWidth,
            document.body.scrollWidth,
            document.documentElement.scrollWidth,
            document.body.offsetWidth,
            document.documentElement.offsetWidth
        ],
        heights = [
            document.documentElement.clientHeight,
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight
        ],
        fullWidth = max(widths),
        fullHeight = max(heights),
        windowWidth = window.innerWidth,
        windowHeight = window.innerHeight,
        originalX = window.scrollX,
        originalY = window.scrollY,
        originalOverflowStyle = document.documentElement.style.overflow,
        arrangements = [],
        // pad the vertical scrolling to try to deal with
        // sticky headers, 250 is an arbitrary size
        scrollPad = 200,
        yDelta = windowHeight - (windowHeight > scrollPad ? scrollPad : 0),
        xDelta = windowWidth,
        yPos = fullHeight - windowHeight,
        xPos,
        numArrangements;

    // During zooming, there can be weird off-by-1 types of things...
    if (fullWidth <= xDelta + 1) {
        fullWidth = xDelta;
    }

    // Disable all scrollbars. We'll restore the scrollbar state when we're done
    // taking the screenshots.
    document.documentElement.style.overflow = 'hidden';

    while (yPos > -yDelta) {
        xPos = 0;
        while (xPos < fullWidth) {
            arrangements.push([xPos, yPos]);
            xPos += xDelta;
        }
        yPos -= yDelta;
    }

    /** * /
    console.log('fullHeight', fullHeight, 'fullWidth', fullWidth);
    console.log('windowWidth', windowWidth, 'windowHeight', windowHeight);
    console.log('xDelta', xDelta, 'yDelta', yDelta);
    var arText = [];
    arrangements.forEach(function(x) { arText.push('['+x.join(',')+']'); });
    console.log('arrangements', arText.join(', '));
    /**/

    numArrangements = arrangements.length;

    function cleanUp() {
        document.documentElement.style.overflow = originalOverflowStyle;
        //window.scrollTo(originalX, originalY);
    }

    (function processArrangements() {
        if (!arrangements.length) {
            cleanUp();
            if (callback) {
                callback();
            }
            return;
        }

        var next = arrangements.shift(),
            x = next[0], y = next[1];

        //window.scrollTo(x, y);

        var data = {
            msg: 'capturePage',
            x: cropboxX,
            y: cropboxY,
            complete: (numArrangements-arrangements.length)/numArrangements,
            totalWidth: window.innerWidth,
            totalHeight: window.innerHeight,
            width: cropboxWidth,
            height: cropboxHeight,
            devicePixelRatio: window.devicePixelRatio
        };

        // Need to wait for things to settle
        window.setTimeout(function() {
            // In case the below callback never returns, cleanup
            var cleanUpTimeout = window.setTimeout(cleanUp, 1250);

            chrome.extension.sendRequest(data, function(captured) {
                window.clearTimeout(cleanUpTimeout);
                cleanUp();
                if (callback) {
                    callback();
                }
                return;
            });

        }, CAPTURE_DELAY);
    })();
}
