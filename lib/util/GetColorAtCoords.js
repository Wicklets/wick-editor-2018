var GetColorAtCoords = function (img, x, y, format) {

	if(x < 0 || y < 0 || x > img.width || y > img.height) {
		console.error("GetColorAtCoords: coords out of bounds: ("+x+","+y+")")
	}

	var canvas = document.createElement('canvas');
	canvas.width = img.width;
	canvas.height = img.height;
	var context = canvas.getContext('2d');
	context.drawImage(img, 0, 0);
	var data = context.getImageData(0, 0, canvas.width, canvas.height).data;

	var i = (x + y*img.width) * 4;

	var color = {};
	color.r = data[i+0];
	color.g = data[i+1];
	color.b = data[i+2];
	color.a = data[i+3];

	if (!format) {
		return color;
	}

	if (format === "rgba") {
		return color;
	} else if (format === "hex") {
		// http://jsfiddle.net/Mottie/xcqpF/1/light/
		function rgb2hex(rgb){
			rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
			return (rgb && rgb.length === 4) ? "#" +
				("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
				("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
				("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
		}
		return rgb2hex("rgb("+color.r+","+color.g+","+color.b+")").toUpperCase();
	}

}