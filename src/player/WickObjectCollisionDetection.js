var WickObjectCollisionDetection = (function () {

    var that = { };

    /* Determine if two wick objects collide using rectangular hit detection on their
       farthest border */ 
    that["rectangles"] = function (objA, objB) {
        var objAAbsPos = objA.getAbsolutePosition();
        var objBAbsPos = objB.getAbsolutePosition();

        var objAWidth = objA.width * objA.scaleX;
        var objAHeight = objAHeight * objA.scaleY; 

        var objBWidth = objB.width * objB.scaleX; 
        var objBHeight = objB.height * objB.scaleY; 

        var left = objAAbsPos.x < (objBAbsPos.x + objBWidth); 
        var right = (objAAbsPos.x + objAWidth) > objBAbsPos.x; 
        var top = objAAbsPos.y < (objBAbsPos.y + objBHeight); 
        var bottom = (objAAbsPos.y + objA.height) > objBAbsPos.y; 

        return left && right && top && bottom;
    }

    /* Determine if two wickObjects Collide using circular hit detection from their
       centroid using their full width and height. */ 
    that["circles"] = function (objA, objB) {
        var objAAbsPos = objA.getAbsolutePosition();
        var objBAbsPos = objB.getAbsolutePosition();

        var dx = objAAbsPos.x - objBAbsPos.x; 
        var dy = objAAbsPos.y - objBAbsPos.y;

        var objAWidth = objA.width * objA.scaleX;
        var objAHeight = objAHeight * objA.scaleY; 

        var distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ((objAWidth/2) + (objBWidth/2))) {
            return true;
        }

        return false; 
    }

    return that;

})();
