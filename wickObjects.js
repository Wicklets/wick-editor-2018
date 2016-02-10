function wickObject(x, y, rotation, name) {
  var objOut = {};

  objOut.x = x;
  objOut.y = y;
  objOut.rotation = rotation;
  objOut.name = name;

  return objOut;
}

function wickImage(src, x, y, name) {
  var imgOut = wickObject(x,y,0,name);

  imgOut.img = new Image;
  imgOut.img.src = src;

  // Initialize image with no crop data.
  imgOut.sx = 0;
  imgOut.sy = 0;
  imgOut.sWidth = imgOut.img.width;
  imgOut.sHeight = imgOut.img.height;

  // Initialize image at original size;
  imgOut.width = imgOut.img.width;
  imgOut.height = imgOut.img.height;


  imgOut.draw = function(ctx) {
    ctx.drawImage(imgOut.img, imgOut.sx, imgOut.sy, imgOut.sWidth, imgOut.sHeight,
                              imgOut.x, imgOut.y, imgOut.width, imgOut.height);
  }

  // Returns true if the given mouse position is within the image,
  // else false.
  imgOut.hover = function(mx, my) {
    var l = imgOut.x;
    var r = imgOut.x + imgOut.sWidth;
    var t = imgOut.y;
    var b = imgOut.y + imgOut.sHeight;
    return (((mx >= l) && (mx <= r)) &&
            ((my >= t) && (my <= b)));
  }

  return imgOut;
}
