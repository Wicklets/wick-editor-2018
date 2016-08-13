/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/* WickObjectUtils */
/* Try not to keep too much stuff in here unless you really have to (like the case of the prototype issue...) */

var WickObjectUtils = (function () {

    var utils = { };

    // This is supposedly a nasty thing to do - think about possible alternatives for IE and stuff
    utils.putWickObjectPrototypeBackOnObject = function (obj) {

        // Put the prototype back on this object
        obj.__proto__ = WickObject.prototype;

        // Recursively put the prototypes back on the children objects
        if(obj.isSymbol) {
            obj.forEachChildObject(function(currObj) {
                utils.putWickObjectPrototypeBackOnObject(currObj);
            });
        }
    }

    // Use to avoid JSON.stringify()ing circular objects
    utils.JSONReplacer = function(key, value) {
      if (key=="parentObject") {
          return undefined;
      } else {
        return value;
        }
    }

    return utils;

})();