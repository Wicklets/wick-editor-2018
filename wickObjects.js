function fabricObjectToWickObject(fabObj) {
    obj = wickObject();

    obj.left     = fabObj.left;
    obj.top      = fabObj.top;
    obj.width    = fabObj.width;
    obj.height   = fabObj.height;
    obj.scaleX   = fabObj.scaleX;
    obj.scaleY   = fabObj.scaleY;
    obj.angle    = fabObj.angle;
    obj.flipX    = fabObj.flipX;
    obj.flipY    = fabObj.flipY;
    obj.opacity  = fabObj.opacity;
    obj.src      = fabObj.src;

    obj.wickData = fabObj.wickData;

    return obj;
}

function wickObject() {
    return {};
}