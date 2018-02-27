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
	var canvas;
	var ctx;

	/* 
	 * Example usage:
	 * 
	 */
	function repaint () {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = "blue";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.beginPath();
		ctx.rect(window.mx-10,window.my-10,20,20);
		ctx.stroke();
		ctx.closePath();

		console.log(state)
		state.layers.forEach(function (layer) {
			layer.frames.forEach(function (frame) {
				console.log("??")
				frame.repaint(ctx);
			});
		});
	}

/* API */

	/* 
	 * Example usage:
	 * AnimationTimeline.setup( document.getElementById('mytimeline') )
	 */
	function setup (elem) {
		rootElem = elem;

		canvas = document.createElement('canvas');
		canvas.width = parseInt(rootElem.style.width)-40;
		canvas.height = parseInt(rootElem.style.height);
		canvas.style.marginLeft = 40;
		canvas.className = 'animationtimeline-canvas';
		canvas.addEventListener('mousemove', function (e) {
			repaint();
			window.mx = e.layerX;
			window.my = e.layerY;
		});
		rootElem.appendChild(canvas);

		ctx = canvas.getContext('2d');

		eventCallbacks = {};

		state = new Timeline();
	}

	/* 
	 * Example usage:
	 * AnimationTimeline.load( new AnimationTimeline.Timeline() )
	 */
	function load (timeline) {
		state = timeline;
		console.log(state)
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
	 * new AnimationTimeline.Timeline()
	 */
	function Timeline (args) {
		if(!args) args = {};

		this.layers = args.layers || [];

		/*
		 * Example usage:
		 * var timeline = new AnimationTimeline.Timeline()
		 * timeline.addLayer( new AnimationTimeline.Layer() )
		 */
		this.addLayer = function (layer) {
			this.layers.push(layer);
			layer.index = this.layers.indexOf(layer);
			console.log(this)
		}
	}

	/* 
	 * Example usage:
	 * new AnimationTimeline.Layer( {name: "New Layer", frames: []} )
	 */
	function Layer (args) {
		if(!args) args = {};

		this.name = args.name;
		this.hidden = args.hidden;
		this.locked = args.locked;
		this.frames = args.frames || [];

		/* 
		 * Example usage:
		 * var layer = new AnimationTimeline.Layer()
		 * layer.addFrame( new AnimationTimeline.Frame() )
		 */
		this.addFrame = function (frame) {
			this.frames.push(frame);
			frame.layer = this;
		}
	}

	/* 
	 * Example usage:
	 * new AnimationTimeline.Frame( {name: "New Frame", start: 0, end: 1} )
	 */
	function Frame (args) {
		if(!args) args = {};

		this.name = args.name;
		this.start = args.start || 0;
		this.end = args.end || (args.start + 1);
		this.tweens = args.tweens || [];

		/* 
		 * Example usage:
		 * var frame = new AnimationTimeline.Frame()
		 * frame.addTween( new AnimationTimeline.Tween() )
		 */
		this.addTween = function (tween) {
			this.tweens.push(tween);
		}

		/* 
		 * Example usage:
		 * 
		 */
		this.repaint = function (ctx) {
			var x = this.start * 10;
			var y = this.layer.index * 10;
			ctx.beginPath();
			ctx.rect(x,y,10,10);
			ctx.stroke();
			ctx.closePath();
		}
	}

	/* 
	 * Example usage:
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
