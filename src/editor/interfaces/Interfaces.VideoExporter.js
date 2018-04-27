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

    var qualityOptions = {
        "Ultra" : 1, 
        "High" : 5, 
        "Medium" : 15, 
        "Low" : 31,
    }; 
    var defaultQuality = "High"; 
    var chosenQuality = defaultQuality; 
    var qualityDropdown; 

    self.setup = function () {
        // Add title
        /*var title = document.createElement('div');
        title.className = "GUIBoxTitle"; 
        title.id = "videoExportGUITitle";
        title.innerHTML = "Wick Video Exporter"; 
        videoExportWindow.appendChild(title); */

        // Add Close Button
        closeButton = document.createElement('div'); 
        closeButton.className = "GUIBoxCloseButton"; 
        closeButton.id = "videoExportGUICloseButton"; 
        closeButton.addEventListener('click', self.close);
        videoExportWindow.appendChild(closeButton);

        // Add Spark Text
        sparkText = document.createElement('div'); 
        sparkText.id = "videoExportSparkText"; 
        sparkText.className = "sparkText"; 
        sparkText.innerHTML = "Exporting Your Video...";
        videoExportWindow.appendChild(sparkText); 

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

        // Add Settings Menu
        var settingsContainer = document.createElement('div');
        settingsContainer.id = "videoExportSettingsContainer";
        videoExportWindow.appendChild(settingsContainer); 

        var qualityContainer = document.createElement('div');
        qualityContainer.className = "quality-container"; 
        settingsContainer.appendChild(qualityContainer);

        var qualitySettingTitle = document.createElement('div'); 
        qualitySettingTitle.innerText = "Quality: ";  
        qualitySettingTitle.id = "qualitySettingTitle"; 
        qualityContainer.appendChild(qualitySettingTitle); 

        qualityDropdown = document.createElement('div'); 
        qualityDropdown.id="videoExportQualityDropdown";
        qualityDropdown.className="dropbtn"; 
        qualityDropdown.onclick = function () {
            dropdownContainer.classList.toggle("show")
        };
        qualityContainer.appendChild(qualityDropdown); 

        var dropdownTitleDiv = document.createElement('div'); 
        dropdownTitleDiv.id = "videoExportQualityTitleDiv"; 
        dropdownTitleDiv.innerText=chosenQuality;
        dropdownTitleDiv.class="title-div";
        qualityDropdown.appendChild(dropdownTitleDiv); 

        var dropdownContainer = document.createElement('div'); 
        dropdownContainer.className = "dropdown-content"; 

        for(quality in qualityOptions) {
            var elem = document.createElement('div'); 
            elem.innerHTML = quality; 
            elem.className = "dropdown-item";
            (function (q) {
                elem.onclick = function () {
                    self.setVideoQuality(q); 
                };
            })(quality); 
            dropdownContainer.appendChild(elem); 
        }
        qualityDropdown.appendChild(dropdownContainer); 

        // Add Download Button
        downloadButton = document.createElement('div'); 
        downloadButton.className = "videoDownloadButton"; 
        downloadButton.innerHTML = "Export Video"; 
        downloadButton.addEventListener('click', self.exportVideo);
        settingsContainer.appendChild(downloadButton); 
    }
    
    self.setVideoQuality = function (qualitySetting) {
        var titleDiv = qualityDropdown.querySelector("#videoExportQualityTitleDiv"); 

        if (qualityOptions[qualitySetting]) {
            chosenQuality = qualitySetting; 
            titleDiv.textContent = chosenQuality; 
        } else {
            chosenQuality = defaultQuality; 
            titleDiv.textContent = chosenQuality;
            console.error(qualitySetting + " is not a valid video quality setting! Defaulting to High Quality."); 
        }
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
        self.setSparkText('Ready to export video.');
        self.setProgressBarPercent(0);
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

        wickEditor.canvas.getCanvasRenderer().getProjectFrames(function (frames) {
            renderVideoFromFrames(frames, function (videoBuffer) {
                generateAudioTrack(function (audioBuffer) {
                    if(!audioBuffer) {
                        downloadVideo(videoBuffer);
                    } else {
                        mergeAudioTrackWithVideo(videoBuffer, audioBuffer, function (finalVideoBuffer) {
                            downloadVideo(finalVideoBuffer);
                        });
                    }
                });
            });
        });

    }

    function renderVideoFromFrames (frames, callback) {
        self.setSparkText('Converting frames to video...')

        videoExporter.renderVideoFromFrames({
            quality: qualityOptions[chosenQuality],
            frames: frames,
            framerate: wickEditor.project.framerate,
            completedCallback: function (videoArrayBuffer) {
                var videoBuffer = new Uint8Array(videoArrayBuffer);
                callback(videoBuffer);
            }
        })
    }

    function generateAudioTrack (callback) {
        self.setSparkText('Generating audio track...')

        var soundFrames = wickEditor.project.rootObject.getAllFramesWithSound();
        if(soundFrames.length === 0) {
            console.log('Video has no sound. Skipping audio export.')
            callback(null);
            return;
        }

        soundFrames.forEach(function (soundFrame) {
            var library = wickEditor.project.library;
            var asset = library.getAsset(soundFrame.audioAssetUUID);
            var src = asset.getData();
            videoExporter.addAudioTrack(
                convertDataURIToBinary(src),
                0,
                soundFrame.length / wickEditor.project.framerate,
                1 + (soundFrame.playheadPosition / wickEditor.project.framerate * 1000)
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
        self.setSparkText('Merging audio and video...')

        videoExporter.combineAudioAndVideo({
            videoBuffer: videoBuffer,
            soundBuffer: audioBuffer,
            framerate: wickEditor.project.framerate,
            filename: 'test.mp4',
            percentCallback: console.log,
            completedCallback: callback,
        })
    }

    function downloadVideo (videoBuffer) {
        self.setSparkText('Finished exporting!')
        self.setProgressBarPercent(1);
        var blob = new Blob([videoBuffer], {type: "application/octet-stream"});
        var fileName = wickEditor.project.name + '.mp4';
        saveAs(blob, fileName);
    }
}
