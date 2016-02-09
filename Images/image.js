function loadImage(imgPath) {
  img = new Image();
  img.src = imgPath;
  return img;
}

// Always assume 9 arguments are passed in. Including cropping and size information.
function image(cnv, img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
  ctx = cnv.getContext('2d');
  ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
}
