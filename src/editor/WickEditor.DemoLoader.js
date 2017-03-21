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

var WickDemoLoader = function (wickEditor) {

    var demoName = URLParameterUtils.getParameterByName("demo");

    if (!demoName) {
        return;
    }

    this.active = true;

    console.log("Trying to load demo:");
    console.log("demoName: " + demoName);

    $.ajax({
        url: "../demos/" + demoName,
        type: 'GET',
        data: {},
        success: function(data) {
            console.log("ajax: success");
            if(data === "NEW_PROJECT") {
                wickEditor.project = new WickProject();
            } else {
                wickEditor.project = WickProject.fromWebpage(data);
            }
            wickEditor.syncInterfaces();
        },
        error: function () {
            console.log("ajax: error")
            console.log("loading project from localstorage instead of backend.")
            wickEditor.project = WickProject.fromLocalStorage();
            wickEditor.syncInterfaces();
        },
        complete: function(response, textStatus) {
            console.log("ajax: complete")
            console.log(response)
            console.log(textStatus)
            URLParameterUtils.clearURLParam("demo")
        }
    });

}