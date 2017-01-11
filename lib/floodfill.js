https://github.com/binarymax/floodfill.js/blob/master/floodfill.js

var floodfill = (function() {

	//Copyright(c) Max Irwin - 2011, 2015, 2016
	//MIT License

	function floodfill(data,x,y,fillcolor,tolerance,width,height) {

		var length = data.length;
		var Q = [];
		var i = (x+y*width)*4;
		var e = i, w = i, me, mw, w2 = width*4;

		var targetcolor = [data[i],data[i+1],data[i+2],data[i+3]];

		if(!pixelCompare(i,targetcolor,fillcolor,data,length,tolerance)) { return false; }
		Q.push(i);
		while(Q.length) {
			i = Q.pop();
			if(pixelCompareAndSet(i,targetcolor,fillcolor,data,length,tolerance)) {
				e = i;
				w = i;
				mw = parseInt(i/w2)*w2; //left bound
				me = mw+w2;             //right bound
				while(mw<w && mw<(w-=4) && pixelCompareAndSet(w,targetcolor,fillcolor,data,length,tolerance)); //go left until edge hit
				while(me>e && me>(e+=4) && pixelCompareAndSet(e,targetcolor,fillcolor,data,length,tolerance)); //go right until edge hit
				for(var j=w;j<e;j+=4) {
					if(j-w2>=0     && pixelCompare(j-w2,targetcolor,fillcolor,data,length,tolerance)) Q.push(j-w2); //queue y-1
					if(j+w2<length && pixelCompare(j+w2,targetcolor,fillcolor,data,length,tolerance)) Q.push(j+w2); //queue y+1
				}
			}
		}
		return data;
	};

	function pixelCompare(i,targetcolor,fillcolor,data,length,tolerance) {
		if (i<0||i>=length) return false; //out of bounds
		if (data[i+3]===0 && fillcolor.a>0) return true;  //surface is invisible and fill is visible

		if (
			Math.abs(targetcolor[3] - fillcolor.a)<=tolerance &&
			Math.abs(targetcolor[0] - fillcolor.r)<=tolerance &&
			Math.abs(targetcolor[1] - fillcolor.g)<=tolerance &&
			Math.abs(targetcolor[2] - fillcolor.b)<=tolerance
		) return false; //target is same as fill

		if (
			(targetcolor[3] === data[i+3]) &&
			(targetcolor[0] === data[i]  ) &&
			(targetcolor[1] === data[i+1]) &&
			(targetcolor[2] === data[i+2])
		) return true; //target matches surface

		if (
			Math.abs(targetcolor[3] - data[i+3])<=(255-tolerance) &&
			Math.abs(targetcolor[0] - data[i]  )<=tolerance &&
			Math.abs(targetcolor[1] - data[i+1])<=tolerance &&
			Math.abs(targetcolor[2] - data[i+2])<=tolerance
		) return true; //target to surface within tolerance

		return false; //no match
	};

	function pixelCompareAndSet(i,targetcolor,fillcolor,data,length,tolerance) {
		if(pixelCompare(i,targetcolor,fillcolor,data,length,tolerance)) {
			//fill the color
			data[i]   = fillcolor.r;
			data[i+1] = fillcolor.g;
			data[i+2] = fillcolor.b;
			data[i+3] = fillcolor.a;
			return true;
		}
		return false;
	};

	function fillUint8ClampedArray(data,x,y,color,tolerance,width,height) {
		if (!data instanceof Uint8ClampedArray) throw new Error("data must be an instance of Uint8ClampedArray");
		if (isNaN(width)  || width<1)  throw new Error("argument 'width' must be a positive integer");
		if (isNaN(height) || height<1) throw new Error("argument 'height' must be a positive integer");
		if (isNaN(x) || x<0) throw new Error("argument 'x' must be a positive integer");
		if (isNaN(y) || y<0) throw new Error("argument 'y' must be a positive integer");
		if (width*height*4!==data.length) throw new Error("width and height do not fit Uint8ClampedArray dimensions");

		var xi = Math.floor(x);
		var yi = Math.floor(y);

		if (xi!==x) console.warn("x truncated from",x,"to",xi);
		if (yi!==y) console.warn("y truncated from",y,"to",yi);

		//Maximum tolerance of 254, Default to 0
		tolerance = (!isNaN(tolerance)) ? Math.min(Math.abs(Math.round(tolerance)),254) : 0;

		return floodfill(data,xi,yi,color,tolerance,width,height);
	};

	var getComputedColor = function(c) {
		var temp = document.createElement("div");
		var color = {r:0,g:0,b:0,a:0};
		temp.style.color = c;
		temp.style.display = "none";
		document.body.appendChild(temp);
		//Use native window.getComputedStyle to parse any CSS color pattern
		var style = window.getComputedStyle(temp,null).color;
		document.body.removeChild(temp);

		var recol = /([\.\d]+)/g;
		var vals  = style.match(recol);
		if (vals && vals.length>2) {
			//Coerce the string value into an rgba object
			color.r = parseInt(vals[0])||0;
			color.g = parseInt(vals[1])||0;
			color.b = parseInt(vals[2])||0;
			color.a = Math.round((parseFloat(vals[3]))*255);
		}
		return color;
	};

	function fillContext(x,y,tolerance,left,top,right,bottom) {
		var ctx  = this;
		
		//Gets the rgba color from the context fillStyle
		var color = getComputedColor(this.fillStyle);

		//Defaults and type checks for image boundaries
		left     = (isNaN(left)) ? 0 : left;
		top      = (isNaN(top)) ? 0 : top;
		right    = (!isNaN(right)&&right) ? Math.min(Math.abs(right),ctx.canvas.width) : ctx.canvas.width;
		bottom   = (!isNaN(bottom)&&bottom) ? Math.min(Math.abs(bottom),ctx.canvas.height) : ctx.canvas.height;

		var image = ctx.getImageData(left,top,right,bottom);
		
		var data = image.data;
		var width = image.width;
		var height = image.height;
		
		if(width>0 && height>0) {
			fillUint8ClampedArray(data,x,y,color,tolerance,width,height);
			ctx.putImageData(image,left,top);
		}
	};

	if (typeof CanvasRenderingContext2D === 'function') {
		CanvasRenderingContext2D.prototype.fillFlood = fillContext;
	};

	return fillUint8ClampedArray;

})();