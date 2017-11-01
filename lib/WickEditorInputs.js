var SlideyNumberInput = function (args) {
  var input = document.createElement('input');
  input.type = 'text';
  input.value = args.initValue;

  var mouseIsDown = false;
  var initXY = {};
  var oldValue;

  input.addEventListener('mousedown', function (e) {
    mouseIsDown = true;
    initXY.x = e.screenX - parseFloat(input.value)/args.moveFactor;
    initXY.y = e.screenY;
    oldValue = parseFloat(input.value);
  });

  input.addEventListener('mouseup', function (e) {
    input.select();
  });

  window.addEventListener('mousemove', function (e) {
    if(!mouseIsDown) return;
    var diffXY = {
      x:(e.screenX-initXY.x)*args.moveFactor,
      y:(e.screenY-initXY.y)*args.moveFactor,
    }
    if(diffXY.x !== 0) {
      input.value = roundToHundredths(Math.min(args.max, Math.max(args.min, diffXY.x)));
      args.onsoftchange(input.value);
    }
  });

  window.addEventListener('mouseup', function (e) {
    if(mouseIsDown) {
      if(parseFloat(input.value) !== oldValue) {
        args.onhardchange(parseFloat(input.value) || args.min);
        document.getElementById('editorCanvasContainer').focus();
      }
    }
    mouseIsDown = false;
  });

  input.addEventListener('change', function (e) {
    args.onhardchange(parseFloat(input.value) || args.min);
  });

  return input;
}