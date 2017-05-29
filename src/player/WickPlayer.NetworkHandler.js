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
    
// old code from old player

    // Networking mode enabled flag
    var networkingEnabled = false;

    // Network PID assigned by server
    var pid;

    wickPlayer.setupNetworking = function (PID) {
        networkingEnabled = true;

        pid = PID;
        console.log("Connecting to server with PID " + pid);

        var socket = io();
        socket.emit('joinServer', pid);

        var validator = {
            set: function(obj, prop, value) {
                var allowed = ['x', 'y', 'rotation'];
                if(allowed.includes(prop)) {
                    //console.log(obj.uuid + ": " + prop + " set to " + value)
                    socket.emit('propUpdate', {
                        uuid: obj.uuid,
                        prop: prop,
                        val: value,
                    });
                }
                obj[prop] = value;
                return true;
            }
        };

        var allObjectsInProject = project.rootObject.getAllChildObjectsRecursive();
        allObjectsInProject.push(project.rootObject);
        allObjectsInProject.forEach(function (wickObj) {
            if(wickObj.pid !== pid) return;
            wickObj.setValidator(validator);
        });

        socket.on('propUpdateBroadcast', function(update){
            if (update.pid === pid) return;
            project.getObjectByUUID(update.uuid)[update.prop] = update.val;
        });
    }