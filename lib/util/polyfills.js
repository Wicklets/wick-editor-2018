if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}

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

var CropImage = function (src, callback, args) {
    var canvas = document.createElement('canvas');
    canvas.width = Math.round(args.width);
    canvas.height = Math.round(args.height);

    var context = canvas.getContext('2d');
    var imageObj = new Image();

    imageObj.onload = function() {
        // draw cropped image
        var sourceX = Math.round(args.x);
        var sourceY = Math.round(args.y);
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