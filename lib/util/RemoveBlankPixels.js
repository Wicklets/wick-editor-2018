http://stackoverflow.com/questions/12175991/crop-image-white-space-automatically-using-jquery

var removeBlankPixels = function (img, imgWidth, imgHeight) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0)

    var imageData = context.getImageData(0, 0, imgWidth, imgHeight),
        data = imageData.data,
        getRBG = function(x, y) {
            var offset = imgWidth * y + x;
            return {
                red:     data[offset * 4],
                green:   data[offset * 4 + 1],
                blue:    data[offset * 4 + 2],
                opacity: data[offset * 4 + 3]
            };
        },
        isWhite = function (rgb) {
            // many images contain noise, as the white is not a pure #fff white
            //return rgb.red > 200 && rgb.green > 200 && rgb.blue > 200;
            return rgb.opacity === 0;
        },
        scanY = function (fromTop) {
            var offset = fromTop ? 1 : -1;
            
            // loop through each row
            for(var y = fromTop ? 0 : imgHeight - 1; fromTop ? (y < imgHeight) : (y > -1); y += offset) {
                
                // loop through each column
                for(var x = 0; x < imgWidth; x++) {
                    var rgb = getRBG(x, y);
                    if (!isWhite(rgb)) {
                        return y;                        
                    }      
                }
            }
            return null; // all image is white
        },
        scanX = function (fromLeft) {
            var offset = fromLeft? 1 : -1;
            
            // loop through each column
            for(var x = fromLeft ? 0 : imgWidth - 1; fromLeft ? (x < imgWidth) : (x > -1); x += offset) {
                
                // loop through each row
                for(var y = 0; y < imgHeight; y++) {
                    var rgb = getRBG(x, y);
                    if (!isWhite(rgb)) {
                        return x;                        
                    }      
                }
            }
            return null; // all image is white
        };
    
    var cropTop = scanY(true),
        cropBottom = scanY(false),
        cropLeft = scanX(true),
        cropRight = scanX(false),
        cropWidth = cropRight - cropLeft,
        cropHeight = cropBottom - cropTop;
    
    var croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;

    //$("<canvas>").attr({ width: cropWidth, height: cropHeight });
    
    // finally crop the guy
    croppedCanvas.getContext("2d").drawImage(
        canvas,
        cropLeft, cropTop, 
        cropWidth, cropHeight,
        0, 0, 
        cropWidth, cropHeight );
    
    /*$("body").
        append("<p>same image with white spaces cropped:</p>").
        append($croppedCanvas);*/
    //console.log(cropTop, cropBottom, cropLeft, cropRight);

    var dataURL = croppedCanvas.toDataURL();
    return dataURL;
};