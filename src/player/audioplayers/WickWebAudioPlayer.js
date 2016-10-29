/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var audioContext = null;
var readyToStartWebAudioContext;

var audioBuffers = {};

var WickWebAudioPlayer = function (project) {
    var that = this;

    this.loadAudio = function(wickObj) {

        if(!audioContext) return;

        if(wickObj.audioData) {
            var rawData = wickObj.audioData.split(",")[1]; // cut off extra filetype/etc data
            var rawBuffer = Base64ArrayBuffer.decode(rawData);
            //wickObj.audioBuffer = rawBuffer;
            audioContext.decodeAudioData(rawBuffer, function (buffer) {
                if (!buffer) {
                    console.error("failed to decode:", "buffer null");
                    return;
                }
                audioBuffers[wickObj.id] = buffer;
                console.log("loaded sound")
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

    this.playSound = function (id, loop, volume) {
        var that = this;

        if(!audioContext) return;

        if(!project.muted) {
            var buff = audioBuffers[id];
            if(!buff) {
                console.log("sound not loaded.")
                setTimeout(function () {
                    that.playSound(id,loop,volume);
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
            allPlayingSounds.push({source:source, id:id});
            console.log("started...");
        }
    }

    this.stopSound = function (id) {
        allPlayingSounds.forEach(function (sound) {
            if(sound.id === id) {
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




