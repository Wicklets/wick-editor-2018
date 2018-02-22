var AnimationTimeline = new (function ft () {
	var self = this;

	var EVENT_NAMES = [
		'onFramesAdded',
		'onFramesDeleted',
		'onFramesMoved',
		'onFramesResized',
		'onTweensAdded',
		'onTweensMoved',
		'onTweensDeleted',
		'onLayerAdded',
		'onLayerDeleted'
	];

	var rootElem;
	var canvas;
	var ctx;
	var eventCallbacks;
	var state;

	/* 
	 * Example usage:
	 * AnimationTimeline.setup( document.getElementById('mytimeline') )
	 */
	function setup (elem) {
		rootElem = elem;
		rootElem.addEventListener('mousemove', function (e) {
			paint();
			window.mx = e.layerX
			window.my = e.layerY
		})
		
		canvas = document.createElement('canvas');
		canvas.width = parseInt(elem.style.width);
		canvas.height = parseInt(elem.style.height);
		canvas.className = 'animationtimeline-canvas'
		rootElem.appendChild(canvas);

		ctx = canvas.getContext('2d');

		eventCallbacks = {};
	}

	/* 
	 * Example usage:
	 * AnimationTimeline.addLayer({
	 *   id: <string>,
	 *   name: <string>,
	 *   locked: <bool>,
	 *   hidden: <bool>,
	 *   frames: [
	 *     id: <string>,
	 *     name: <string>,
	 *     start: <number>,
	 *     end: <number>,
	 *     tweens: [
	 *       id: <string>,
	 *       position: <number>
	 *     ]
	 *   ]
	 * });
	 */
	function addLayer (layerData) {

	}

	/* 
	 * Example usage:
	 * AnimationTimeline.clearLayers();
	 */
	function clearLayers () {

	}

	/* 
	 * Example usage:
	 * AnimationTimeline.on('eventName', function () {
	 *   // Your event function code here
	 * });
	 */
	function on (eventName, callback) {
		if(EVENT_NAMES.indexOf(eventName) === -1) {
			console.error('Event ' + eventName + ' does not exist!');
		} else {
			eventCallbacks[eventName] = callback;
		}
	}

	/* 
	 * Example usage:
	 * paint()
	 * Use this to redraw the canvas.
	 * Only call redraw() after mouse events to avoid unnecessary redraws.
	 */
	function paint () {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for(var x = 0; x < 10; x += 1) {
			for(var y = 0; y < 10; y += 1) {
				ctx.beginPath();
				ctx.rect(x,y,10,10);
				ctx.stroke();
				ctx.closePath();
			}
		}
		ctx.beginPath();
		ctx.rect(window.mx-10,window.my-10,20,20);
		ctx.stroke();
		ctx.closePath();
	}

	/* Example usage:
	 *
	 */
	function FrameView () {
		// Canvas
	}

    /* Example usage:
	 *
	 */
	function TweenView () {
		// Canvas
	}

	/* Example usage:
	 *
	 */
	function LayerLabelView () {
		// DOM
	}

	// Expose API functions
	self.setup = setup;
	self.addLayer = addLayer;
	self.clearLayers = clearLayers;
	self.on = on;

	return self;
})();
