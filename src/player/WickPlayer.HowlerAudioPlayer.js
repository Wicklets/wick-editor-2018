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

var WickHowlerAudioPlayer = function (project) {

    var self = this;

    var sounds = {};

    var muted;

    self.setup = function () {

        muted = false;

        var allFrames = project.rootObject.getAllFrames();

        allFrames.forEach(function (wickFrame) {
            if(!wickFrame.audioAssetUUID) return;
            var asset = wickEditor.project.library.getAsset(wickFrame.audioAssetUUID);
            var audioData = asset.getData();

            sounds[wickFrame.uuid] = new Howl({
                src: [audioData],
                loop: false,
                volume: 1.0,
                onend: function(id) { self.onSoundEnd(id); },
                onStop: function(id) { self.onSoundStop(id); },
                onPlay: function(id) { self.onSoundPlay(id); }
            });
        });

    }

    self.playSound = function (wickFrame) {
        if(muted) return;
        if(!sounds[wickFrame.uuid]) return;
        wickFrame.currentHowlID = sounds[wickFrame.uuid].play();
    }

    // TODO : Do this only for playing sounds
    this.stopAllSounds = function () {
        for (var sound in sounds) {
            sounds[sound].stop();
        }
    }

    self.stopSound = function (wickFrame) {
        sounds[wickFrame.uuid].stop();
    }

    self.cleanup = function () {

    }

    self.onSoundEnd = function (howlid) {

    }

    self.onSoundStop = function (howlid) {

    }

    self.onSoundPlay = function (howlid) {

    }

    window.mute = function () {
        self.stopAllSounds();
        muted = true;
    }

    window.unmute = function () {
        muted = false;
    }

}