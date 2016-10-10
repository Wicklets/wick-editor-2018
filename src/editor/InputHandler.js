/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var InputHandler = function (wickEditor) {

    this.mouse = {};
    this.keys = [];

    var editingTextBox = false;

    var oldTool = null;

    var that = this;

/*************************
     Mouse
*************************/

    document.addEventListener('mousemove', function(e) { 
        that.mouse.x = e.clientX;
        that.mouse.y = e.clientY;
    }, false );

    document.addEventListener('mousedown', function(e) { 
        that.mouse.down = true;
    }, false );

    document.addEventListener('mouseup', function(e) { 
        that.mouse.down = false;
    }, false );

    document.addEventListener('contextmenu', function (event) { 
        event.preventDefault();
    }, false);

/*************************
     Drag-to-upload
*************************/

    $("#editor").on('dragover', function(e) {
        document.getElementById('dropToUploadFileAlert').style.display = 'block';
        return false;
    });
    $("#editor").on('dragleave', function(e) {
        document.getElementById('dropToUploadFileAlert').style.display = 'none';
        return false;
    });
    $("#editor").on('drop', function(e) {
        document.getElementById('dropToUploadFileAlert').style.display = 'none';

        // prevent browser from opening the file
        e.stopPropagation();
        e.preventDefault();

        var files = e.originalEvent.dataTransfer.files;

        // Retrieve uploaded files data
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var fileType = file.type;

            if (fileType === 'application/json' || fileType === 'text/html') {
                WickProject.fromFile(file, function(project) {
                    wickEditor.project = project;
                    wickEditor.syncInterfaces();
                });
            } else {

                var fromContstructors = {
                    'image/png'  : WickObject.fromImage,
                    'image/jpeg' : WickObject.fromImage,
                    'image/bmp'  : WickObject.fromImage,
                    'image/gif'  : WickObject.fromAnimatedGIF,
                    'audio/mp3'  : WickObject.fromAudioFile,
                    'audio/wav'  : WickObject.fromAudioFile,
                    'audio/ogg'  : WickObject.fromAudioFile
                }
                
                var fr = new FileReader;
                fr.onloadend = function() {
                    fromContstructors[fileType](fr.result, function (newWickObject) {
                        wickEditor.actionHandler.doAction('addObjects', {wickObjects:[newWickObject]});
                    })
                };
                fr.readAsDataURL(file);

            }
        }

        return false;
    });

/*************************
     Import Files
*************************/

    document.getElementById('importButton').onchange = function (e) {
        var filePath = document.getElementById("importButton");
        if(filePath.files && filePath.files[0]) {
            var reader = new FileReader();
            var file = filePath.files[0];

            WickProject.fromFile(file, function(project) {
                wickEditor.project = project;
                wickEditor.syncInterfaces();
            });
        }

        var importButton = $("importButton");
        importButton.replaceWith( importButton = importButton.clone( true ) );
    }

}
