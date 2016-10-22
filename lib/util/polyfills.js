
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}

var ImageToCanvas = function (src, callback, args) {

	var image = new Image();
    image.onload = function () {
    	var w = image.width;
        var h = image.height;

        if(args && args.width)  w = args.width;
        if(args && args.height) h = args.height;

        var canvas = document.createElement('canvas');
        canvas.height = h;
        canvas.width = w;
        
        var ctx = canvas.getContext('2d');
        ctx.drawImage( image, 0, 0, w, h );
        callback(canvas,ctx);
    };
    image.src = src;

}