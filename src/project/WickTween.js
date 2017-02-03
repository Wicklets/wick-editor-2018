/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var tweenValueNames = ["x","y","z","scaleX","scaleY","rotation","opacity"];

var WickTween = function() {
    this.x = 0;
    this.y = 0; 
    this.z = 0; 
    this.scaleX = 1;
    this.scaleY = 1;
    this.rotation = 0;
    this.opacity = 1;

    this.frame = 0;

    this.tweenType = 'Linear';
    this.tweenDir = 'None';
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

WickTween.interpolateTweens = function (tweenA, tweenB, t) {
	var interpTween = new WickTween();

	var tweenFunc = (tweenA.tweenType === "Linear") ? (TWEEN.Easing.Linear.None) : (TWEEN.Easing[tweenA.tweenType][tweenA.tweenDir]);
	tweenValueNames.forEach(function (name) {
		var tt = tweenFunc(t);
		interpTween[name] = lerp(tweenA[name], tweenB[name], tt);
	});

	return interpTween;
}