/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var InputHandler = function (wickEditor) {

    this.mouse = {};
    this.keys = [];

    this.editingTextBox = false;

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
     Keys
*************************/

    this.clearKeys = function () {
        that.keys = [];
    }

    document.body.addEventListener("keydown", function (event) {
        that.keys[event.keyCode] = true;

        var controlKeyDown = that.keys[91];
        var shiftKeyDown = that.keys[16];

        this.editingTextBox = document.activeElement.nodeName == 'TEXTAREA'
                           || document.activeElement.nodeName == 'INPUT';

        if(!this.editingTextBox) {
            // Control-shift-z: redo
            if (event.keyCode == 90 && controlKeyDown && shiftKeyDown) {
                event.preventDefault();
                wickEditor.actionHandler.redoAction();    
            }
            // Control-z: undo
            else if (event.keyCode == 90 && controlKeyDown) {
                event.preventDefault();
                wickEditor.actionHandler.undoAction();
            }
        }

        // Enter: run
        if(event.keyCode == 13 && !this.editingTextBox) {
            that.clearKeys();
            wickEditor.interfaces["builtinplayer"].runProject();
        }

        // Control-s: save
        if (event.keyCode == 83 && controlKeyDown) {
            event.preventDefault();
            that.clearKeys();
            wickEditor.project.saveInLocalStorage();
        }
        // Control-o: open
        else if (event.keyCode == 79 && controlKeyDown) {
            event.preventDefault();
            that.clearKeys();
            $('#importButton').click();
        }

        // Control-a: Select all
        if (event.keyCode == 65 && controlKeyDown) {
            event.preventDefault();
            wickEditor.interfaces['fabric'].deselectAll();
            wickEditor.interfaces['fabric'].selectAll();
        }

        // Left arrow key: Move playhead left
        if(event.keyCode == 37) {
            wickEditor.project.getCurrentObject().playheadPosition -= (wickEditor.project.getCurrentObject().playheadPosition > 0 ? 1 : 0);
            wickEditor.syncInterfaces();
        }

        // Right arrow key: Move playhead right
        if(event.keyCode == 39) {
            wickEditor.project.getCurrentObject().playheadPosition ++;
            wickEditor.syncInterfaces();
        }

        // Backspace: delete selected objects
        if (event.keyCode == 8 && !this.editingTextBox) {
            event.preventDefault();
            wickEditor.actionHandler.doAction('deleteObjects', { ids:wickEditor.interfaces['fabric'].getSelectedObjectIDs() });
        }
    });

    document.body.addEventListener("keyup", function (event) {
        that.keys[event.keyCode] = false;
    });

/*************************
    Leave page warning
*************************/

    // Setup leave page warning
    window.addEventListener("beforeunload", function (event) {
        var confirmationMessage = 'Warning: All unsaved changes will be lost!';
        (event || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    });

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

        // Make sure an element is focused so that copy event fires properly
        event.preventDefault();
        //focusHiddenArea();

        event.clipboardData.setData('text/wickobjectsjson', wickEditor.getCopyData());
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
        var items = clipboardData.items;

        for (i=0; i<items.length; i++) {

            var fileType = items[i].type;
            var file = clipboardData.getData(items[i].type);

            if(fileType === 'text/wickobjectsjson') {
                var fileWickObject = WickObject.fromJSONArray(JSON.parse(file), function(objs) {
                    wickEditor.actionHandler.doAction('addObjects', {wickObjects:objs});
                });
            } else {
                var fileWickObject = WickObject.fromFile(file, fileType, function(obj) {
                    wickEditor.actionHandler.doAction('addObjects', {wickObjects:[obj]});
                });
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

            // if filetype is json:
            //     check to see if it's a wickproject. if it is, load it up! (and make sure to return!!)
            // if filetype is html:
            //     if its a project, load it up!
            // all other filetypes/json+html files that aren't projects get handled by WickObject:

            var fileWickObject = WickObject.fromFile(file, fileType, function(obj) {
                wickEditor.actionHandler.doAction('addObjects', {wickObjects:[obj]});
            });
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
            var filetype = filePath.files[0].type;
            reader.onload = function (e) {
                if (filetype === "text/html") {
                    wickEditor.project = WickProject.fromWebpage(e.target.result);
                } else if (filetype === "application/json") {
                    wickEditor.project = WickProject.fromJSON(e.target.result);
                } else {
                    console.error("Unsupported filetype for opening projects: " + filetype);
                }
                wickEditor.syncInterfaces();
            };
            reader.readAsText(filePath.files[0]);
        }

        var importButton = $("importButton");
        importButton.replaceWith( importButton = importButton.clone( true ) );
    }

}
