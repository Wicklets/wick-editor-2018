var ImageToCanvas = function (src, callback, args) {

	var image = new Image();
    image.onload = function () {
    	var w = image.width;
        var h = image.height;

        if(args && args.width)  w = args.width;
        if(args && args.height) h = args.height;

        var canvas = document.createElement('canvas');
        canvas.height = h;
        canvas.width = w;
        
        var ctx = canvas.getContext('2d');
        ctx.drawImage( image, 0, 0, w, h );
        callback(canvas,ctx);
    };
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = src;

}

function ImageToImageData (img) {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0)
    return ctx.getImageData(0,0,canvas.width,canvas.height);
}

function PixelsToImageData (pixelData) {

}