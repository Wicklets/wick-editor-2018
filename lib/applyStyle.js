// https://github.com/zz85/timeliner/blob/master/src/utils.js

function applyStyle(element, var_args) {
	for (var i = 1; i < arguments.length; ++i) {
		var styles = arguments[i];
		for (var s in styles) {
			element.style[s] = styles[s];
		}
	}
}