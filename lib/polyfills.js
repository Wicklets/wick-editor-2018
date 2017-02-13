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

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEachBackwards) {

  Array.prototype.forEachBackwards = function(callback, thisArg) {

    var T, k;

    if (this === null) {
      throw new TypeError('this is null or not defined');
    }

    // 1. Let O be the result of calling toObject() passing the
    // |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get() internal
    // method of O with the argument "length".
    // 3. Let len be toUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If isCallable(callback) is false, throw a TypeError exception. 
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let
    // T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = len-1;

    // 7. Repeat, while k < len
    while (k >= 0) {

      var kValue;

      // a. Let Pk be ToString(k).
      //    This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty
      //    internal method of O with argument Pk.
      //    This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal
        // method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as
        // the this value and argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k--;
    }
    // 8. return undefined
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

// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(searchElement, fromIndex) {

      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If len is 0, return false.
      if (len === 0) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      var n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      // 7. Repeat, while k < len
      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        // c. Increase k by 1.
        // NOTE: === provides the correct "SameValueZero" comparison needed here.
        if (o[k] === searchElement) {
          return true;
        }
        k++;
      }

      // 8. Return false
      return false;
    }
  });
}

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

var roundToNearestN = function (val, n) {
  return Math.round(val/n)*n;
}
