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