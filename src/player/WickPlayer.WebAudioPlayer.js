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


// GET RIDDA THIS AND USE A PROPER LIBRARY WIT FALLBACKS TO FLASH AND SHTUFF!!!!!!!!!!!!!!!!!



var audioContext = null;
var readyToStartWebAudioContext;

var audioBuffers = {};

var WickWebAudioPlayer = function (project) {
    var that = this;

    this.loadAudio = function(wickObj) {

        if(!audioContext) return;

        if(wickObj.audioData) {
            var audioData = wickObj.audioData;
            if(wickObj.compressed) audioData = LZString.decompressFromBase64(audioData)
            var rawData = audioData.split(",")[1]; // cut off extra filetype/etc data
            var rawBuffer = Base64ArrayBuffer.decode(rawData);
            //wickObj.audioBuffer = rawBuffer;
            audioContext.decodeAudioData(rawBuffer, function (buffer) {
                if (!buffer) {
                    console.error("failed to decode:", "buffer null");
                    return;
                }
                audioBuffers[wickObj.uuid] = buffer;
                //console.log("loaded sound")
            }, function (error) {
                console.error("failed to decode:", error);
            });
        }

        if(wickObj.isSymbol) {
            wickObj.getAllChildObjects().forEach(function(subObj) {
                that.loadAudio(subObj);
            });
        }
    }

    this.setup = function() {
        
        var AudioContext = window.AudioContext // Default
                        || window.webkitAudioContext // Safari and old versions of Chrome
                        || false;

        if(!AudioContext) {
            console.log("WebAudio not supported! Sounds will not play.");
            return;
        }

        audioContext = new AudioContext();

        // Setup dummy node and discard it to get webaudio context running
        if(audioContext.createGainNode) {
            audioContext.createGainNode();
        } else {
            audioContext.createGain();
        }

        //if(!mobileMode) {
            //loadAudio(project.rootObject);
        //}

        this.loadAudio(project.rootObject)

    }

    this.update = function() {
        if(!audioContext) return
    }

    var allPlayingSounds = [];

    this.playSound = function (uuid, loop, volume) {
        var that = this;

        if(!audioContext) return;

        if(!project.muted) {
            var buff = audioBuffers[uuid];
            if(!buff) {
                //console.log("sound not loaded.")
                setTimeout(function () {
                    that.playSound(uuid,loop,volume);
                }, 100);
                return;
            }
            var gainNode = audioContext.createGain();
            var source = audioContext.createBufferSource();
            source.buffer = buff;
            source.connect(audioContext.destination);
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            gainNode.gain.value = volume;
            source.loop = loop;
            source.start(0);
            allPlayingSounds.push({source:source, uuid:uuid});
            //console.log("started...");
        }
    }

    this.stopSound = function (uuid) {
        allPlayingSounds.forEach(function (sound) {
            if(sound.uuid === uuid) {
                sound.source.stop();
            }
        });
    }

    this.stopAllSounds = function () {
        allPlayingSounds.forEach(function (sound) {
            sound.source.stop();
        });
    }

    this.cleanup = function() {
        if(!audioContext) return

        audioContext.close();
    }

    
};




