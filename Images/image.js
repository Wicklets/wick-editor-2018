function loadImage(imgPath) {
  img = new Image();
  img.src = imgPath;
  return img;
}

function image(cnv, img, dx, dy, dWidth, dHeight) {
  ctx = cnv.getContext('2d');
  ctx.drawImage(img, dx, dy, dWidth, dHeight);
}
