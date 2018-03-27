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

var VideoExporter = function (wickEditor) {
    var self = this;
    var videoExportWindow = document.getElementById('videoExportGUI');
    var closeButton; 
    var sparkText; 
    var progressBar; 
    var downloadButton;

    self.setup = function () {
      self.buildWindow(); 
    }
    
    self.syncWithEditorState = function () {

    }
  
    self.buildWindow = function() {
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
      videoExportWindow.appendChild(closeButton); 
      
      // Add close button interactions
      closeButton.addEventListener('click', function(event) {
        self.close(); 
      });
      
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
      downloadButton.innerHTML = "Download Video"; 
      videoExportWindow.appendChild(downloadButton); 
      
    } 
    
    // percent: number from 1-100
    self.setProgressBarPercent = function(percent) {
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
    
    self.setGUISparkText = function (text) {
      sparkText.innerHTML = text; 
    }
    
    self.open = function () {
      videoExportWindow.style.display = "block"; 
    }
    
    self.close = function () {
      videoExportWindow.style.display = "none";
    }
    
    self.exportVideo = function () {
      // Render webm of frames
      // Render sound file
      // Combine Assets
      // Approve Download
    }
}
