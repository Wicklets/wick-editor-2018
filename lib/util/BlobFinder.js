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




