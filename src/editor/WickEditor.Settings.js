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
    
var WickEditorSettings = function () {

    if(localStorage.wickEditorSettings) {

        this.load();

    } else {

        this.setDefaults();
        this.save();

    }

}

WickEditorSettings.prototype.getDefaults = function () {
    return {
        brushThickness : 5,
        brushSmoothing : 0,
        pencilSmoothing : 1,
        strokeWidth : 5,
        strokeColor : "#000000",
        fillColor : "#9999FF",
        rectangleCornerRadius : 0,
        strokeCap : 'round',
        strokeJoin : 'round',
        scriptingIDEHeight: 300,
    }
}

WickEditorSettings.prototype.setDefaults = function () {

    var defaults = this.getDefaults();
    for(key in defaults) {
        this[key] = defaults[key];
    }

    this.save();

}

WickEditorSettings.prototype.setValue = function (key, val) {

    this[key] = val;
    this.save();

}

WickEditorSettings.prototype.save = function () {

    localStorage.wickEditorSettings = JSON.stringify(this);

};

WickEditorSettings.prototype.load = function () {

    var savedSettings = JSON.parse(localStorage.wickEditorSettings);

    for (key in savedSettings) {
        this[key] = savedSettings[key];
    }

    var defaults = this.getDefaults();
    for(key in defaults) {
        if(this[key] === undefined) {
            this[key] = defaults[key];
        }
    }

}

