var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require("fs");

/*************************
    Config
*************************/

var port = 3000;
var project = "Networking.html";

/*************************
    Server state
*************************/

var currentPID = 0;
var getNextPID = function () {
    currentPID++;
    return currentPID;
}

/*************************
    New connections
*************************/

app.get('/', function(req, res){
    fs.readFile(project, "utf-8", function(err, data) {
        var projectString = data;
        projectString += "<script>WickPlayer.setupNetworking("+getNextPID()+")</script>"
        res.status(200).send(projectString);
        res.end();
    });
});

io.on('connection', function (socket) {
    var clientIP = socket.request.connection.remoteAddress;

    var pid;
    socket.on('joinServer', function (PID) {
        pid = PID;
        console.log("User " +clientIP+ " joined with pid " + pid);
    });
    socket.on('propUpdate', function (update) {
        var uuid = update.uuid;
        var prop = update.prop;
        var val = update.val;
        console.log('propUpdate for pid ' + pid + ": " + uuid + " " + prop + " " + val);
        io.emit('propUpdateBroadcast', {
            pid: pid,
            uuid: uuid,
            prop: prop,
            val: val
        });
    });
});

/*************************
    Start server
*************************/

// Start running project here

http.listen(port, function () {
    console.log('Server started on port ' + port);
});
