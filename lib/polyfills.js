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

//http://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};

var isSafari = navigator.appVersion.search('Safari') != -1 && navigator.appVersion.search('Chrome') == -1 && navigator.appVersion.search('CrMo') == -1 && navigator.appVersion.search('CriOS') == -1;
var isIe = (navigator.userAgent.toLowerCase().indexOf("msie") != -1 || navigator.userAgent.toLowerCase().indexOf("trident") != -1);
var isChrome = /chrome/.test( navigator.userAgent.toLowerCase() );

// Accelerometer/Gyro
// http://stackoverflow.com/questions/4378435/how-to-access-accelerometer-gyroscope-data-from-javascript

var tiltX = null; 
var tiltY = null;

var getTiltX = function () { 
    if(tiltX === null) return 0;
    return tiltX; 
}
var getTiltY = function () { 
    if(tiltY === null) return 0;
    return tiltY; 
}

var tilt = function (b,g) {
    tiltX = g;
    tiltY = b;
}

if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", function () {
        tilt(event.beta, event.gamma);
    }, true);
} else if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', function () {
        tilt(event.acceleration.x * 2, event.acceleration.y * 2);
    }, true);
} else {
    window.addEventListener("MozOrientation", function () {
        tilt(orientation.x * 50, orientation.y * 50);
    }, true);
}

