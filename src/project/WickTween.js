/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var tweenValueNames = ["x","y","z","scale","angle","opacity"];

//https://github.com/mattdesl/lerp/blob/master/index.js
var lerp = "function (v0, v1, t) { return v0*(1-t)+v1*t; }"

var WickTween = function() {
    this.x = 0;
    this.y = 0; 
    this.z = 0; 
    this.scale = 1;
    this.angle = 0;
    this.opacity = 1;

    this.frame = 0;
    this.interpFunc = lerp;
}

WickTween.fromWickObjectState = function (wickObject) {
	var tween = new WickTween();

	tweenValueNames.forEach(function (name) {
		tween[name] = wickObject[name];
	});

	return tween;
}

WickTween.prototype.applyTweenToWickObject = function(wickObject) {
	var that = this;

	tweenValueNames.forEach(function (name) {
		wickObject[name] = that[name];
	});
};

WickTween.interpolateTweens = function (tweenA, tweenB, t, interpFunc) {
	var interpTween = new WickTween();

	tweenValueNames.forEach(function (name) {
		interpTween[name] = interpFunc(tweenA[name], tweenB[name], t);
	});

	return interpTween;
}