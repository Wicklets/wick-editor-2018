/* Wick - (c) 2017 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/*  This file is part of Wick. 
    
    Wick is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Wick is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Wick.  If not, see <http://www.gnu.org/licenses/>. */

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