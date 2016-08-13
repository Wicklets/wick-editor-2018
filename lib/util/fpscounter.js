// Framerate keeper 
// http://www.html5gamedevs.com/topic/1828-how-to-calculate-fps-in-plain-javascript/
var fps = { startTime : 0,
	frameNumber : 0,
	getFPS : function() {
		this.frameNumber++;

		var d = new Date().getTime();
		var currentTime = ( d - this.startTime ) / 1000;
		var result = Math.floor( ( this.frameNumber / currentTime ) );

		if( currentTime > 1 ) {
			this.startTime = new Date().getTime();
			this.frameNumber = 0;
		}

		return result;
	}   
};