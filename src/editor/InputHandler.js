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
     Copy/Paste
*************************/

    // In order to ensure that the browser will fire clipboard events, we always need to have something selected
    var focusHiddenArea = function () {
        if($("#scriptingGUI").css('visibility') === 'hidden') {
            $("#hidden-input").val(' ');
            $("#hidden-input").focus().select();
        }
    }

    document.addEventListener("copy", function(event) {

        that.clearKeys();

        // Don't try to copy from the fabric canvas if user is editing text
        if(document.activeElement.nodeName == 'TEXTAREA' || wickEditor.interfaces['scriptingide'].scriptingIDEopen) {
            return;
        }

        event.preventDefault();
        
        // Make sure an element is focused so that copy event fires properly
        //focusHiddenArea();

        // Generate clipboard data
        var ids = wickEditor.interfaces['fabric'].getSelectedObjectIDs();
        var objectJSONs = [];
        for(var i = 0; i < ids.length; i++) {
            objectJSONs.push(wickEditor.project.getObjectByID(ids[i]).getAsJSON());
        }
        var clipboardObject = {
            /*position: {top  : group.top  + group.height/2, 
                       left : group.left + group.width/2},*/
            groupPosition: {x : 0, 
                            y : 0},
            wickObjectArray: objectJSONs
        }
        var copyData =  JSON.stringify(clipboardObject);

        // Send the clipboard data to the clipboard!
        event.clipboardData.setData('text/wickobjectsjson', copyData);
    });

    document.addEventListener("cut", function(event) {
        console.error('cut NYI');
    });

    document.addEventListener("paste", function(event) {

        that.clearKeys();

        if(document.activeElement.nodeName === 'TEXTAREA' || wickEditor.interfaces['scriptingide'].scriptingIDEopen) {
            return;
        }

        event.preventDefault();
        //focusHiddenArea();

        var clipboardData = event.clipboardData;
        var items = clipboardData.items || clipboardData.types;

        for (i=0; i<items.length; i++) {

            var fileType = items[i].type || items[i];
            var file = clipboardData.getData(fileType);

            if(fileType === 'text/wickobjectsjson') {
                var fileWickObject = WickObject.fromJSONArray(JSON.parse(file), function(objs) {
                    wickEditor.actionHandler.doAction('addObjects', {wickObjects:objs});
                });
            } else if (fileType === 'text/plain') {
                wickEditor.actionHandler.doAction('addObjects', {wickObjects:[WickObject.fromText(file)]});
            } else {
                console.error("Pasting files with type " + fileType + "NYI.")
            }

        }
    });

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
