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
	var eventCallbacks;
	var state;
	var timelineView;
	var layerLabelsBarView;

	/* Example usage:
	 *
	 */
	function TimelineView () {
		var self = this;

		var canvas;
		var ctx;

		/* 
		 * Example usage:
		 * 
		 */
		self.setup = function (rootElem) {
			canvas = document.createElement('canvas');
			canvas.width = parseInt(rootElem.style.width)-40;
			canvas.height = parseInt(rootElem.style.height);
			canvas.style.marginLeft = 40;
			canvas.className = 'animationtimeline-canvas';
			canvas.addEventListener('mousemove', function (e) {
				self.paint();
				window.mx = e.layerX;
				window.my = e.layerY;
			})
			rootElem.appendChild(canvas);

			ctx = canvas.getContext('2d');
		}

		/* 
		 * Example usage:
		 * paint()
		 * Use this to redraw the canvas.
		 * Only call redraw() after mouse events to avoid unnecessary redraws.
		 */
		self.paint = function () {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = "blue";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

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
	}

	/* Example usage:
	 *
	 */
	function FrameView () {
		
	}

	/* Example usage:
	 *
	 */
	function TweenView () {
		
	}

	/* Example usage:
	 *
	 */
	function LayerLabelsBarView () {
		var self = this;

		var elem;

		/* 
		 * Example usage:
		 * 
		 */
		self.setup = function (rootElem) {
			elem = document.createElement('div');
			elem.className = 'animationtimeline-layer-label-bar';
			rootElem.appendChild(elem)
		}
	}

	/* Example usage:
	 *
	 */
	function LayerLabelView () {
		// DOM
	}

/* API */

	/* 
	 * Example usage:
	 * AnimationTimeline.setup( document.getElementById('mytimeline') )
	 */
	function setup (elem) {
		rootElem = elem;

		timelineView = new TimelineView();
		timelineView.setup(rootElem);

		layerLabelsBarView = new LayerLabelsBarView();
		layerLabelsBarView.setup(rootElem);

		eventCallbacks = {};

		state = new Timeline();
	}

	/* 
	 * Example usage:
	 * AnimationTimeline.load( new AnimationTimeline.Timeline() )
	 */
	function load (timeline) {
		this.state = timeline;
		console.log(this.state)
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

	/* Example usage:
	 * new AnimationTimeline.Timeline()
	 */
	function Timeline (args) {
		if(!args) args = {};

		this.layers = args.layers || [];

		/* Example usage:
		 * var timeline = new AnimationTimeline.Timeline()
		 * timeline.addLayer( new AnimationTimeline.Layer() )
		 */
		this.addLayer = function (layer) {
			this.layers.push(layer);
		}
	}

	/* Example usage:
	 * new AnimationTimeline.Layer( {name: "New Layer", frames: []} )
	 */
	function Layer (args) {
		if(!args) args = {};

		this.name = args.name;
		this.hidden = args.hidden;
		this.locked = args.locked;
		this.frames = args.frames || [];

		/* Example usage:
		 * var layer = new AnimationTimeline.Layer()
		 * layer.addFrame( new AnimationTimeline.Frame() )
		 */
		this.addFrame = function (frame) {
			this.frames.push(frame);
		}
	}

	/* Example usage:
	 * new AnimationTimeline.Frame( {name: "New Frame", start: 0, end: 1} )
	 */
	function Frame (args) {
		if(!args) args = {};

		this.name = args.name;
		this.start = args.start || 0;
		this.end = args.end || (args.start + 1);
		this.tweens = args.tweens || [];

		/* Example usage:
		 * var frame = new AnimationTimeline.Frame()
		 * frame.addTween( new AnimationTimeline.Tween() )
		 */
		this.addTween = function (tween) {
			this.tweens.push(tween);
		}
	}

	/* Example usage:
	 * new AnimationTimeline.Tween( {position: 0} )
	 */
	function Tween (args) {
		if(!args) args = {};

		this.position = args.position || 0;
	}

	self.setup = setup;
	self.on = on;
	self.load = load;
	self.Timeline = Timeline;
	self.Layer = Layer;
	self.Frame = Frame;
	self.Tween = Tween;

	return self;
})();
