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

function WickElectronWrapper (wickEditor) {

	if(!isElectronMode) return;
	console.log("Setup WickElectronWrapper");

	var self = this;

    var currentProjectOpened;

	//var remote = require('remote'); // Load remote compnent that contains the dialog dependency
	//var dialog = remote.require('dialog'); // Load the dialogs component of the OS
	var fs = require('fs'); // Load the File System to execute our common tasks (CRUD)

	var app = require('electron').remote; 
	var dialog = app.dialog;

	function readFile(filepath) {
        fs.readFile(filepath, 'utf-8', function (err, data) {
            if(err){
                alert("An error ocurred reading the file :" + err.message);
                return;
            }
            
            var project = WickProject.fromJSON(data);
            wickEditor.project = project;
            window.wickRenderer.setProject(wickEditor.project);
            wickEditor.syncInterfaces();
        });
    }

    self.openProject = function () {

        dialog.showOpenDialog(function (fileNames) {
            if(fileNames === undefined){
                console.log("No file selected");
            }else{
                //document.getElementById("actual-file").value = fileNames[0];
                currentProjectOpened = fileNames[0];
                readFile(fileNames[0]);
            }
        }); 
    
    }

    self.saveProject = function (projectJSON, projectName) {

        if (currentProjectOpened) {

            var content = projectJSON;
                
            fs.writeFile(currentProjectOpened, content, function (err) {
                if(err){
                    alert("An error ocurred creating the file "+ err.message)
                }
                
                //alert("The file has been succesfully saved");
                wickEditor.project.unsaved =false;
                wickEditor.syncInterfaces();
            });

        } else {

            dialog.showSaveDialog({
                title: 'foo',
                defaultPath: '~/'+projectName+'.json'
            }, function (fileName) {
                if (fileName === undefined){
                    console.log("You didn't save the file");
                    return;
                }

                currentProjectOpened = fileName

                var content = projectJSON;
                
                fs.writeFile(fileName, content, function (err) {
                    if(err){
                        alert("An error ocurred creating the file "+ err.message)
                    }
                    
                    //alert("The file has been succesfully saved");
                    wickEditor.project.unsaved =false;
                    wickEditor.syncInterfaces();
                });
            }); 

        }

    }

}