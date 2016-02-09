// Install some useful jQuery extensions that we use a lot

$.extend($.fn, {
	orNull: function() {
		return this.length > 0 ? this : null;
	},

	findAndSelf: function(selector) {
		return this.find(selector).add(this.filter(selector));
	}
});

// Little Helpers

function smoothScrollTo(el, callback) {
	$('html, body').animate({
		scrollTop: el.offset().top
	}, 250, callback);
}

// Behaviors

var behaviors = {};

behaviors.contentEnd = function() {
	// Expand height of .content-end so that the last anchor aligns
	// perfectly with the top of the browser window.
	var end = $('.content-end');
	var lastAnchor = $('a[name]:last');

	function resize() {
		var bottom = $(document).height() - lastAnchor.offset().top - $(window).height();
		end.height(end.height() - bottom);
	}

	if (end.length && lastAnchor.length) {
		$(window).on({
			load: resize,
			resize: resize
		});
		resize();
	}
};

behaviors.hash = function() {
	var hash = unescape(window.location.hash);
	if (hash) {
		// First see if there's a class member to open
		var target = $(hash);
		if (target.length) {
			if (target.hasClass('member'))
				toggleMember(target);
			smoothScrollTo(target);
		}
	}
};

behaviors.code = function() {
	$('.code:visible').each(function() {
		createCode($(this));
	});
};

behaviors.paperscript = function() {
	// Ignore all paperscripts in the automatic load event, and load them
	// separately in createPaperScript() when needed.
	$('script[type="text/paperscript"]').attr('ignore', 'true');
	$('.paperscript:visible').each(function() {
		createPaperScript($(this));
	});
};

function createCodeMirror(place, options, source) {
	return new CodeMirror(place, $.extend({}, {
		mode: 'javascript',
		lineNumbers: true,
		matchBrackets: true,
		tabSize: 4,
		indentUnit: 4,
		indentWithTabs: true,
		tabMode: 'shift',
		value: source.text().match(
			// Remove first & last empty line
			/^\s*?[\n\r]?([\u0000-\uffff]*?)[\n\r]?\s*?$/)[1]
	}, options));
}

function createCode(element) {
	if (element.data('initialized'))
		return;
	var start = element.attr('start');
	var highlight = element.attr('highlight');
	var editor = createCodeMirror(function(el) {
		element.replaceWith(el);
	}, {
		lineNumbers: !element.parent('.resource-text').length,
		firstLineNumber: parseInt(start || 1, 10),
		mode: element.attr('mode') || 'javascript',
		readOnly: true
	}, element);
	if (highlight) {
		var highlights = highlight.split(',');
		for (var i = 0, l = highlights.length; i < l; i++) {
			var highlight = highlights[i].split('-');
			var hlStart = parseInt(highlight[0], 10) - 1;
			var hlEnd = highlight.length == 2
					? parseInt(highlight[1], 10) - 1 : hlStart;
			if (start) {
				hlStart -= start - 1;
				hlEnd -= start - 1;
			}
			for (var j = hlStart; j <= hlEnd; j++) {
				editor.setLineClass(j, 'highlight');
			}
		}
	}
	element.data('initialized', true);
}

function createPaperScript(element) {
	if (element.data('initialized'))
		return;

	var script = $('script', element).orNull(),
		runButton = $('.button.run', element).orNull();
	if (!script || !runButton)
		return;

	// Now load / parse / execute the script
	script.removeAttr('ignore');
	var scope = paper.PaperScript.load(script[0]);

	var canvas = $('canvas', element),
		hasResize = canvas.attr('resize'),
		showSplit = element.hasClass('split'),
		sourceFirst = element.hasClass('source'),
		width, height,
		editor = null,
		hasBorders = true,
		edited = false,
		animateExplain,
		explain = $('.explain', element).orNull(),
		source = $('<div class="source hidden"/>').insertBefore(script);

	if (explain) {
		explain.addClass('hidden');
		var text = explain.html().replace(/http:\/\/([\w.]+)/g, function(url, domain) {
			return '<a href="' + url + '">' + domain + '</a>';
		}).trim();
		// Add explanation bubbles to tickle the visitor's fancy
		var explanations = [{
			index: 0,
			list: [
				[4, ''],
				[4, '<b>Note:</b> You can view and even edit<br>the source right here in the browser'],
				[1, ''],
				[3, 'To do so, simply press the <b>Source</b> button &rarr;']
			]
		}, {
			index: 0,
			indexIfEdited: 3, // Skip first sentence if user has already edited code
			list: [
				[4, ''],
				[3, 'Why don\'t you try editing the code?'],
				[1, ''],
				[4, 'To run it again, simply press press <b>Run</b> &rarr;']
			]
		}];
		var timer,
			mode;
		animateExplain = function(clearPrevious) {
			if (timer)
				timer = clearTimeout(timer);
			// Set previous mode's index to the end?
			if (mode && clearPrevious)
				mode.index = mode.list.length;
			mode = explanations[source.hasClass('hidden') ? 0 : 1];
			if (edited && mode.index < mode.indexIfEdited)
				mode.index = mode.indexIfEdited;
			var entry = mode.list[mode.index];
			if (entry) {
				explain.removeClass('hidden');
				explain.html(entry[1]);
				timer = setTimeout(function() {
					// Only increase once we're stepping, not in animate()
					// itself, as entering & leaving would continuosly step
					mode.index++;
					animateExplain();
				}, entry[0] * 1000);
			}
			if (!entry || !entry[1])
				explain.addClass('hidden');
		};
		element
			.mouseover(function() {
				if (!timer)
					animateExplain();
			})
			.mouseout(function() {
				// Check the effect of :hover on button to see if we need
				// to turn off...
				// TODO: make mouseenter / mouseleave events work again
				if (timer && runButton.css('display') == 'none') {
					timer = clearTimeout(timer);
					explain.addClass('hidden');
				}
			});
	}

	function showSource(show) {
		source.toggleClass('hidden', !show);
		runButton.text(show ? 'Run' : 'Source');
		if (explain)
			animateExplain(true);
		if (show && !editor) {
			editor = createCodeMirror(source[0], {
				onKeyEvent: function(editor, event) {
					edited = true;
				}
			}, script);
		}
	}

	function runScript() {
		// Update script to edited version
		var code = editor.getValue();
		script.text(code);
		// Keep a reference to the used canvas, since we're going to
		// fully clear the scope and initialize again with this canvas.
		// Support both old and new versions of paper.js for now:
		var element = scope.view.element;
		// Clear scope first, then evaluate a new script.
		scope.clear();
		scope.initialize(script[0]);
		scope.setup(element);
		scope.evaluate(code);
	}

	function resize() {
		if (!canvas.hasClass('hidden')) {
			width = canvas.width();
			height = canvas.height();
		} else if (hasResize) {
			// Can't get correct dimensions from hidden canvas,
			// so calculate again.
			var offset = source.offset();
			width = $(window).width() - offset.left;
			height = $(window).height() - offset.top;
		}
		// Resize the main element as well, so that the float:right button
		// is always positioned correctly.
		element
			.width(width)
			.height(height);
		source
			.width(width - (hasBorders ? 2 : 1))
			.height(height - (hasBorders ? 2 : 0));
	}

	function toggleView() {
		var show = source.hasClass('hidden');
		resize();
		canvas.toggleClass('hidden', show);
		showSource(show);
		if (!show)
			runScript();
		// Add extra margin if there is scrolling
		runButton.css('margin-right',
			$('.CodeMirror .CodeMirror-scroll', source).height() > height ? 23 : 8);
	}

	if (hasResize) {
		paper.view.on('resize', resize);
		hasBorders = false;
		source.css('border-width', '0 0 0 1px');
	}

	if (showSplit) {
		showSource(true);
	} else if (sourceFirst) {
		toggleView();
	}

	runButton
		.click(function() {
			if (showSplit) {
				runScript();
			} else {
				toggleView();
			}
			return false;
		})
		.mousedown(function() {
			return false;
		});

	element.data('initialized', true);
}

// Reference (before behaviors)

var lastMember = null;
function toggleMember(member, dontScroll, offsetElement) {
	var link = $('.member-link:first', member);
	if (!link.length)
		return true;
	var desc = $('.member-description', member);
	var visible = !link.hasClass('hidden');
	// Retrieve y-offset before any changes, so we can correct scrolling after
	var offset = (offsetElement || member).offset().top;
	if (lastMember && !lastMember.is(member)) {
		var prev = lastMember;
		lastMember = null;
		toggleMember(prev, true);
	}
	lastMember = visible && member;
	link.toggleClass('hidden', visible);
	desc.toggleClass('hidden', !visible);
	if (!dontScroll) {
		var scrollTop = $(document).scrollTop();
		// Only change hash if we're not in frames, since there are redrawing
		// issues with that on Chrome.
		if (parent === self)
			window.location.hash = visible ? member.attr('id') : '';
		// Correct scrolling relatively to where we are, by checking the amount
		// the element has shifted due to the above toggleMember call, and
		// correcting by 11px offset, caused by 1px border and 10px padding.
		// Update hash before scrolling
		$(document).scrollTop(scrollTop + member.offset().top - offset
				+ 11 * (visible ? 1 : -1));
	}
	if (!member.data('initialized') && visible) {
		behaviors.code();
		behaviors.paperscript();
		member.data('initialized', true);
	}
	return false;
}

$(function() {
	$('.reference .member').each(function() {
		var member = $(this);
		var link = $('.member-link', member);
		// Add header to description, with link and closing button
		var header = $('<div class="member-header"/>').prependTo($('.member-description', member));
		// Clone link, but remove name, id and change href
		link.clone().removeAttr('name').removeAttr('id').attr('href', '#').appendTo(header);
		// Add closing button.
		header.append('<div class="member-close"><input type="button" value="Close"></div>');
	});

	// Give open / close buttons behavior
	$('.reference')
		.on('click', '.member-link, .member-close', function() {
			return toggleMember($(this).parents('.member'));
		})
		.on('click', '.member-text a', function() {
			if (this.href.match(/^(.*?)\/?#|$/)[1] === document.location.href.match(/^(.*?)\/?(?:#|$)/)[1]) {
				toggleMember($(this.href.match(/(#.*)$/)[1]), false, $(this));
				return false;
			}
		});
});

// DOM-Ready

$(function() {
	for (var i in behaviors)
		behaviors[i]();
});
