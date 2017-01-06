if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}

if (!Object.keys) {
    Object.keys = function (obj) {
        var keys = [],
            k;
        for (k in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) {
                keys.push(k);
            }
        }
        return keys;
    };
}

//http://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

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

//if(!BrowserDetectionUtils.isChrome || !BrowserDetectionUtils.isFirefox) {
    window.polyfillClipboardData = (function () {
        var pcd = {};

        var data = {};
        
        pcd.types = [];

        pcd.setData = function (type,newdata) {
            data[type] = {type:type,data:newdata};
            if(pcd.types.indexOf(type) === -1) pcd.types.push(type);
        }

        pcd.getData = function (type) {
            return data[type].data;
        }

        return pcd;
    })();
//}

var BrowserDetectionUtils = (function () {

    var browserDetectionUtils = { };

    browserDetectionUtils.isFirefox = 
        navigator.userAgent.search("Firefox");

    browserDetectionUtils.isSafari = 
        navigator.appVersion.search('Safari') != -1 
     && navigator.appVersion.search('Chrome') == -1 
     && navigator.appVersion.search('CrMo') == -1 
     && navigator.appVersion.search('CriOS') == -1;

    browserDetectionUtils.isIe = (
        navigator.userAgent.toLowerCase().indexOf("msie") != -1 
     || navigator.userAgent.toLowerCase().indexOf("trident") != -1 );

    browserDetectionUtils.isChrome = 
        /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

    browserDetectionUtils.inMobileMode =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    return browserDetectionUtils;
    
})();
