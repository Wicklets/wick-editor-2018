http://blog.acipo.com/blob-detection-js/

function unique(arr){
/// Returns an object with the counts of unique elements in arr
/// unique([1,2,1,1,1,2,3,4]) === { 1:4, 2:2, 3:1, 4:1 }

    var value, counts = {};
    var i, l = arr.length;
    for( i=0; i<l; i+=1) {
        value = arr[i];
        if( counts[value] ){
            counts[value] += 1;
        }else{
            counts[value] = 1;
        }
    }

    return counts;
}

function FindBlobs(src) {

  var xSize = src.width,
      ySize = src.height,
      srcPixels = src.data,
      x, y, pos;

  // This will hold the indecies of the regions we find
  var blobMap = [];
  var label = 1;

  // The labelTable remember when blobs of differen labels merge
  // so labelTabel[1] = 2; means that label 1 and 2 are the same blob
  var labelTable = [0];

  // Start by labeling every pixel as blob 0
  for(y=0; y<ySize; y++){
    blobMap.push([]);
    for(x=0; x<xSize; x++){
      blobMap[y].push(0);
    }
  }  

  // Temporary variables for neighboring pixels and other stuff
  var nn, nw, ne, ww, ee, sw, ss, se, minIndex;
  var luma = 0;
  var isVisible = 0;

  // We're going to run this algorithm twice
  // The first time identifies all of the blobs candidates the second pass
  // merges any blobs that the first pass failed to merge
  var nIter = 2;
  while( nIter-- ){

    // We leave a 1 pixel border which is ignored so we do not get array
    // out of bounds errors
    for( y=1; y<ySize-1; y++){
      for( x=1; x<xSize-1; x++){

        pos = (y*xSize+x)*4;

        // We're only looking at the alpha channel in this case but you can
        // use more complicated heuristics
        isVisible = (srcPixels[pos+3] > 0);

        if( isVisible ){

          // Find the lowest blob index nearest this pixel
          nw = blobMap[y-1][x-1] || 0;
          nn = blobMap[y-1][x-0] || 0;
          ne = blobMap[y-1][x+1] || 0;
          ww = blobMap[y-0][x-1] || 0;
          ee = blobMap[y-0][x+1] || 0;
          sw = blobMap[y+1][x-1] || 0;
          ss = blobMap[y+1][x-0] || 0;
          se = blobMap[y+1][x+1] || 0;
          minIndex = ww;
          if( 0 < ww && ww < minIndex ){ minIndex = ww; }
          if( 0 < ee && ee < minIndex ){ minIndex = ee; }
          if( 0 < nn && nn < minIndex ){ minIndex = nn; }
          if( 0 < ne && ne < minIndex ){ minIndex = ne; }
          if( 0 < nw && nw < minIndex ){ minIndex = nw; }
          if( 0 < ss && ss < minIndex ){ minIndex = ss; }
          if( 0 < se && se < minIndex ){ minIndex = se; }
          if( 0 < sw && sw < minIndex ){ minIndex = sw; }
  
          // This point starts a new blob -- increase the lable count and
          // and an entry for it in the label table
          if( minIndex === 0 ){
            blobMap[y][x] = label;
            labelTable.push(label);
            label += 1;
  
          // This point is part of an old blob -- update the labels of the
          // neighboring pixels in the label table so that we know a merge
          // should occur and mark this pixel with the label.
          }else{
            if( minIndex < labelTable[nw] ){ labelTable[nw] = minIndex; }
            if( minIndex < labelTable[nn] ){ labelTable[nn] = minIndex; }
            if( minIndex < labelTable[ne] ){ labelTable[ne] = minIndex; }
            if( minIndex < labelTable[ww] ){ labelTable[ww] = minIndex; }
            if( minIndex < labelTable[ee] ){ labelTable[ee] = minIndex; }
            if( minIndex < labelTable[sw] ){ labelTable[sw] = minIndex; }
            if( minIndex < labelTable[ss] ){ labelTable[ss] = minIndex; }
            if( minIndex < labelTable[se] ){ labelTable[se] = minIndex; }

            blobMap[y][x] = minIndex;
          }

        // This pixel isn't visible so we won't mark it as special
        }else{
          blobMap[y][x] = 0;
        }
  
      }
    }
  
    // Compress the table of labels so that every location refers to only 1
    // matching location
    var i = labelTable.length;
    while( i-- ){
      label = labelTable[i];
      while( label !== labelTable[label] ){
        label = labelTable[label];
      }
      labelTable[i] = label;
    }
  
    // Merge the blobs with multiple labels
    for(y=0; y<ySize; y++){
      for(x=0; x<xSize; x++){
        label = blobMap[y][x];
        if( label === 0 ){ continue; }
        while( label !== labelTable[label] ){
          label = labelTable[label];
        }
        blobMap[y][x] = label;
      }
    }
  }

  // The blobs may have unusual labels: [1,38,205,316,etc..]
  // Let's rename them: [1,2,3,4,etc..]

  var uniqueLabels = unique(labelTable);
  var labelCount = 0;
  for(uniqueLabel in uniqueLabels) labelCount++;

  var i = 0;
  for( label in uniqueLabels ){
    labelTable[label] = i++;
  }

  // convert the blobs to the minimized labels
  for(y=0; y<ySize; y++){
    for(x=0; x<xSize; x++){
      label = blobMap[y][x];
      blobMap[y][x] = labelTable[label];
    }
  }

  // Return the blob data:
  return {blobMap:blobMap, nBlobs:labelCount};

};


function ColorTheBlobs(dst,blobs,colors){
    var xSize = dst.width,
        ySize = dst.height,
        dstPixels = dst.data,
        x, y, pos;

    var label, color, nColors = colors.length;

    for(y=0; y<ySize; y++){
        for(x=0; x<xSize; x++){
            pos = (y*xSize+x)*4;

            label = blobs[y][x];

            if( label !== 0 ){
                color = colors[ label % nColors ];
                dstPixels[ pos+0 ] = color[0];
                dstPixels[ pos+1 ] = color[1];
                dstPixels[ pos+2 ] = color[2];
                dstPixels[ pos+3 ] = color[3];
            }else{
                dstPixels[ pos+3 ] = 0;
            }
        }
    }

}

function GetBlobMap (img, callback) {
  ImageToCanvas(img, function (canvas,context) {
    var canvas = canvas;//document.getElementById('canvas-draw');
    var contex = context;//canvas.getContext('2d');
    var imageData = contex.getImageData(0,0,canvas.width,canvas.height);

    var blobResults = FindBlobs(imageData);
    var blobLabels = blobResults.blobMap;
    var nBlobs = blobResults.nBlobs;

    var blobCanvas = document.createElement('canvas');//document.getElementById('canvas-blob');
    blobCanvas.width = canvas.width;
    blobCanvas.height = canvas.height;
    var blobContex = blobCanvas.getContext('2d');
    var blobImageData = contex.getImageData(0,0,canvas.width,canvas.height);

    // this means you can only have 255 blobs, ya dummy!
    var colors = [];
    for(var i = 0; i <= 255; i+=1) {
      colors.push([i,0,0,255]);
    }
    ColorTheBlobs(blobImageData,blobLabels,colors);
    
    blobContex.putImageData(blobImageData,0,0);

    var blobMap = new Image();
    blobMap.onload = function () {
      callback({blobMap:blobMap, nBlobs:nBlobs});
    }
    blobMap.src = blobCanvas.toDataURL();
  });
}

function GetBlobImages (blobMap, nBlobs, image, callback) {
	var imagesData = [];

	var label;
	for(label=1; label<=nBlobs; label++) {
		imagesData[label] = GetBlobImage(blobMap, image, label);
	}

	var images = [];
	var done = false;

	function processBlobImage (i) {
		var data = imagesData[i];
		if(data) {
			ctx.putImageData(data,0,0);

			var image = new Image();
			image.onload = function () {
				//callback(image);
				images.push(image);
				if(images.length >= nBlobs-1) {
					if(!done) callback(images);
					done = true;
				}
			}
			image.src = canvas.toDataURL();
		}
	}

	for(label=1; label<=nBlobs; label++) {
		if(done) return;

		var canvas = document.createElement('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		var ctx = canvas.getContext('2d');

		processBlobImage(label);
	}
}

function GetBlobImage (blobMap, originalImg, label) {

	var blobMapData = ImageToImageData(blobMap)
	var originalImgData = ImageToImageData(originalImg)

	var xSize = blobMapData.width,
        ySize = blobMapData.height,
        blobMapPixels = blobMapData.data,
        x, y, pos;

    var originalImgPixels = originalImgData.data;

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var newImgData = ctx.createImageData(originalImgData);
    var newImagePixels = newImgData.data;

    var blobExistsWithLabel = false;

    for(y=0; y<ySize; y++){
        for(x=0; x<xSize; x++){
            pos = (y*xSize+x)*4;

            if(blobMapPixels[ pos+0 ] === label) {
            	newImagePixels[ pos+0 ] = originalImgPixels[ pos+0 ];
            	newImagePixels[ pos+1 ] = originalImgPixels[ pos+1 ];
            	newImagePixels[ pos+2 ] = originalImgPixels[ pos+2 ];
            	newImagePixels[ pos+3 ] = originalImgPixels[ pos+3 ];
            	blobExistsWithLabel = true;
            } else {
            	newImagePixels[ pos+0 ] = 0;
	            newImagePixels[ pos+1 ] = 0;
	            newImagePixels[ pos+2 ] = 0;
	            newImagePixels[ pos+3 ] = 0;
            }
        }
    }

    return blobExistsWithLabel ? newImgData : null;
}

function FindBlobsAndGetBlobImages (imgData, callback) {

	GetBlobMap(imgData, function (blobResult) {
        var img = new Image();
        img.onload = function () {
            GetBlobImages(blobResult.blobMap, blobResult.nBlobs, img, function (blobImages) {
                callback(blobImages);
            });
        }
        img.src = imgData;
    });

}

// Image cropping / padding (zrispo)

var CropImage = function (src, callback, args) {
    var canvas = document.createElement('canvas');
    canvas.width = args.width;
    canvas.height = args.height;

    var context = canvas.getContext('2d');
    var imageObj = new Image();

    imageObj.onload = function() {
        // draw cropped image
        var sourceX = args.x;
        var sourceY = args.y;
        var sourceWidth = args.width;
        var sourceHeight = args.height;
        var destWidth = sourceWidth;
        var destHeight = sourceHeight;
        var destX = canvas.width / 2 - destWidth / 2;
        var destY = canvas.height / 2 - destHeight / 2;

        context.drawImage(imageObj, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);

        callback(canvas.toDataURL());
    };

    imageObj.src = src;
}

function AddPaddingToImage (img, callback) {
    var oddWidth = img.width % 2 === 1;
    var oddHeight = img.height % 2 === 1;

    if (oddWidth && oddHeight) {
        CropImage(img.src, callback, {
            x: 0,
            y: 0,
            width: img.width+1,
            height: img.height+1
        });
    } else if (oddWidth) {
        CropImage(img.src, callback, {
            x: 0,
            y: 0,
            width: img.width+1,
            height: img.height
        });
    } else if (oddHeight) {
        CropImage(img.src, callback, {
            x: 0,
            y: 0,
            width: img.width,
            height: img.height+1
        });
    } else {
        callback(img.src);
    }

}

// Canvas <-> Image conversion (zrispo)

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

// Color picking (unknown source??)

var GetColorAtCoords = function (img, x, y, format) {
  
  if(x < 0 || y < 0 || x > img.width || y > img.height) {
    console.error("GetColorAtCoords: coords out of bounds: ("+x+","+y+")")
  }

  var canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  var context = canvas.getContext('2d');
  context.drawImage(img, 0, 0);
  var data = context.getImageData(0, 0, canvas.width, canvas.height).data;

  var i = (x + y*img.width) * 4;

  var color = {};
  color.r = data[i+0];
  color.g = data[i+1];
  color.b = data[i+2];
  color.a = data[i+3];

  if (!format) {
    return color;
  }

  if (format === "rgba") {
    return color;
  } else if (format === "hex") {
    // http://jsfiddle.net/Mottie/xcqpF/1/light/
    function rgb2hex(rgb){
      rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
      return (rgb && rgb.length === 4) ? "#" +
        ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
    }
    return rgb2hex("rgb("+color.r+","+color.g+","+color.b+")").toUpperCase();
  }

}

// Blank pixel remover / cropper

// http://stackoverflow.com/questions/12175991/crop-image-white-space-automatically-using-jquery

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
        cropWidth = cropRight - cropLeft + 1,
        cropHeight = cropBottom - cropTop + 1;
    
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
    return {dataURL:dataURL, left:cropLeft, top:cropTop};
};

function getColorIndicesForCoord(x, y, width) {
  var red = y * (width * 4) + x * 4;
  return {
    r: red,
    g: red+1,
    b: red+2,
    a: red+3,
  }
  //[red, red + 1, red + 2, red + 3];
}

function getPixelAt (x,y,width,height,imageData) {
  if(x<0 || y<0 || x>=width || y>=height) return null;

  var offset = (y*width+x)*4;
  return {
    r: imageData[offset],
    g: imageData[offset+1],
    b: imageData[offset+2],
    a: imageData[offset+3]
  }
}

function setPixelAt (x,y,width,height,imageData,color) {
  var offset = (y*width+x)*4;
  imageData[offset] = color.r
  imageData[offset+1] = color.g
  imageData[offset+2] = color.b
  imageData[offset+3] = color.a
}
