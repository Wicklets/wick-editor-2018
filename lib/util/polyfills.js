if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}

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