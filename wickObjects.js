function wickObject(x,y,rotation,name) {
  this.x = x;
  this.y = y;
  this.rot = rotation;
  this.name = name;
  return this;
}

function wickImage(imgPath, x, y, name) {
  imgOut = wickObject(0,0,0,name);
  imgOut.img = new Image();

  // Initialize image with no crop data.
  imgOut.sx = 0;
  imgOut.sy = 0;
  imgOut.sWidth = imgOut.img.width;
  imgOut.sHeight = imgOut.img.height;

  // Initialize image at original size;
  imgOut.width = imgOut.img.width;
  imgOut.height = imgOut.img.height;
  return imgOut;
}