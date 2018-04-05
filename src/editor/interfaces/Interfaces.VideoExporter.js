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

var VideoExporterInterface = function (wickEditor) {
    var self = this;
    var videoExportWindow = document.getElementById('videoExportGUI');
    var closeButton; 
    var sparkText; 
    var progressBar; 
    var downloadButton;

    var videoExporter;

    self.setup = function () {
        // Add title
        var title = document.createElement('div');
        title.className = "GUIBoxTitle"; 
        title.id = "videoExportGUITitle";
        title.innerHTML = "Wick Video Exporter"; 
        videoExportWindow.appendChild(title); 

        // Add Close Button
        closeButton = document.createElement('div'); 
        closeButton.className = "GUIBoxCloseButton"; 
        closeButton.id = "videoExportGUICloseButton"; 
        closeButton.addEventListener('click', self.close);
        videoExportWindow.appendChild(closeButton); 

        // Add Progress Bar
        var progressBarContainer = document.createElement('div'); 
        progressBarContainer.className = "meter animate wickGreen"; 
        progressBarContainer.id = "videoExportProgressBarContainer"; 
        progressBar = document.createElement('span');
        progressBar.id = "videoExportProgressBar";
        progressBar.style.width = "1%";
        progressBarContainer.appendChild(progressBar); 
        var extraSpan = document.createElement('span'); 
        progressBar.appendChild(extraSpan); 
        videoExportWindow.appendChild(progressBarContainer); 

        // Add Spark Text
        sparkText = document.createElement('div'); 
        sparkText.id = "videoExportSparkText"; 
        sparkText.className = "sparkText"; 
        sparkText.innerHTML = "Exporting Your Video...";
        videoExportWindow.appendChild(sparkText); 

        // Add Download Button
        downloadButton = document.createElement('div'); 
        downloadButton.id = "videoDownloadButton"; 
        downloadButton.className = "downloadButton"; 
        downloadButton.innerHTML = "Export Video"; 
        downloadButton.addEventListener('click', self.exportVideo);
        videoExportWindow.appendChild(downloadButton); 
    }
    
    self.syncWithEditorState = function () {

    }
    
    self.setProgressBarPercent = function (percent) {
        percent = percent*100

        if (typeof percent != "number") {
            console.error("Error: Input percentage is not a number."); 
            return; 
        }

        if(percent >= 100) {
            progressBar.style.width = "100%"; 
        } else if (percent <= 0) {
            progressBar.style.width = "0%";
        } else {
            progressBar.style.width = percent + "%";
        }
    }

    self.setSparkText = function (newSparkText) {
        self.setProgressBarPercent(0)
        sparkText.innerHTML = newSparkText; 
    }
    
    self.open = function () {
        self.setSparkText('')
        self.setProgressBarPercent(0)
        videoExportWindow.style.display = "block"; 
    }
    
    self.close = function () {
        videoExportWindow.style.display = "none";
    }
    
    self.exportVideo = function () {
        if(!videoExporter) {
            videoExporter = new VideoExporter();
            videoExporter.setProgressBarFn(self.setProgressBarPercent)
            videoExporter.init();
        }

        console.log('Rendering frames...')
        self.setSparkText('Rendering frames...')
        wickEditor.canvas.getCanvasRenderer().getProjectFrames(function (frames) {
            self.setSparkText('Converting frames to video...')
            renderVideoFromFrames(frames, function (videoBuffer) {
                console.log('Generating audio track...')
                self.setSparkText('Generating audio track...')
                generateAudioTrack(function (audioBuffer) {
                    console.log('Merging audio and video...')
                    self.setSparkText('Merging audio and video...')
                    mergeAudioTrackWithVideo(videoBuffer, audioBuffer, function (finalVideoBuffer) {
                        self.setSparkText('Finished! Thank you for exporting your video with Wick Editor Dot Com!')
                        var blob = new Blob([finalVideoBuffer], {type: "application/octet-stream"});
                        var fileName = 'wick-video-export.mp4';
                        saveAs(blob, fileName);
                    });
                });
            });
        });

    }

    function renderVideoFromFrames (frames, callback) {
        videoExporter.renderVideoFromFrames({
            frames: frames,
            completedCallback: function (videoArrayBuffer) {
                var videoBuffer = new Uint8Array(videoArrayBuffer);
                callback(videoBuffer);
            }
        })
    }

    function generateAudioTrack (callback) {
        var soundFrames = wickEditor.project.rootObject.getAllFramesWithSound();

        soundFrames.forEach(function (soundFrame) {
            var library = wickEditor.project.library;
            var asset = library.getAsset(soundFrame.audioAssetUUID);
            var src = asset.getData();
            videoExporter.addAudioTrack(
                convertDataURIToBinary(src),
                0,
                1000,
                1,
            )
        })

        videoExporter.mergeAudioTracks({
            callback: function (soundTrackArrayBuffer) {
                var soundBuffer = new Uint8Array(soundTrackArrayBuffer);
                callback(soundBuffer);
            }
        })
    }

    function mergeAudioTrackWithVideo (videoBuffer, audioBuffer, callback) {
        videoExporter.combineAudioAndVideo({
            videoBuffer: videoBuffer,
            soundBuffer: audioBuffer,
            framerate: 30,
            filename: 'test.mp4',
            videoLengthMs: 30000,
            percentCallback: console.log,
            completedCallback: callback,
        })
    }
}
