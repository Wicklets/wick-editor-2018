// Object that stores the entire
function wickObject(fabricObject) {
  var objOut = {};
  objOut.fabricObject;
  objOut.timeline = [];
  return objOut;

  function saveFrame(frame) {
    if (frame > 0) {
      this.timeline[frame] = wickFrame(this.fabricObject);
    }
  }

  function loadFrame(frame) {
    if (frame > 0) {
      wickFrame = this.timeline[frame];
      if (!(wickFrame == undefined)) {
        wickFrame["src"] = this.fabricObject["src"];
        return wickFrame;
      }
    }
    return undefined;
    }
    
}

// A wickFrame contains everything that a fabric js object does except the
// source as it is meant to just contain reference positions.
function wickFrame(obj) {
  wf = {};
  for (var key in obj.keys()) {
    if (key == "src") {
      continue;
    }
    wf[key] = obj[key];
  }
  return wf;
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
