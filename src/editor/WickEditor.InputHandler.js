/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var InputHandler = function (wickEditor) {

    this.mouse = {};

    var that = this;

/*************************
     Mouse
*************************/

    // Disable images in the GUI from being dragged around
    $('img').on('dragstart', function(event) { event.preventDefault(); });

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

/*************************
     Keyboard
*************************/

    /* Set up vars needed for input listening. */
    this.keys = [];
    this.specialKeys = [];
    var editingTextBox = false;

    /* Define special keys */
    var modifierKeys = ["WINDOWS","COMMAND","FIREFOXCOMMAND","CTRL"];
    var shiftKeys = ["SHIFT"];

    var activeElemIsTextBox = function () {
        var activeElem = document.activeElement.nodeName;
        editingTextBox = activeElem == 'TEXTAREA' || activeElem == 'INPUT';
        return editingTextBox;
    }

    // Fixes hotkey breaking bug
    $(window).focus(function() {
        that.keys = [];
        that.specialKeys = [];
    });
    $(window).blur(function() {
        that.keys = [];
        that.specialKeys = [];
    });

    document.body.addEventListener("keydown", function (event) {
        handleKeyEvent(event, "keydown");
    });
    document.body.addEventListener("keyup", function (event) {
        handleKeyEvent(event, "keyup");
    });

    var handleKeyEvent = function (event, eventType) {

        var keyChar = codeToKeyChar[event.keyCode];
        var keyDownEvent = eventType === 'keydown';
        if (modifierKeys.indexOf(keyChar) !== -1) {
            that.specialKeys["Modifier"] = keyDownEvent;
            that.keys = [];
        } else if (shiftKeys.indexOf(keyChar) !== -1) {
            that.specialKeys["SHIFT"] = keyDownEvent;
            that.keys = [];
        } else {
            that.keys[event.keyCode] = keyDownEvent;
        }

        // get this outta here
        if(event.keyCode == 32 && eventType === 'keyup' && !activeElemIsTextBox()) {
            wickEditor.useLastUsedTool();
            wickEditor.syncInterfaces();
        }

        for(actionName in wickEditor.guiActionHandler.guiActions) { (function () {
            var guiAction = wickEditor.guiActionHandler.guiActions[actionName];

            if (wickEditor.builtinplayer.running && !guiAction.requiredParams.builtinplayerRunning) return;

            var stringkeys = [];
            for (var numkey in that.keys) {
                if (that.keys.hasOwnProperty(numkey) && that.keys[numkey]) {
                    stringkeys.push(codeToKeyChar[numkey]);
                }
            }
            var stringspecialkeys = [];
            for (var numkey in that.specialKeys) {
                if (that.specialKeys.hasOwnProperty(numkey) && that.specialKeys[numkey]) {
                    stringspecialkeys.push(numkey);
                }
            }

            var cmpArrays = function (a,b) {
                return a.sort().join(',') === b.sort().join(',');
            }

            var hotkeysMatch = cmpArrays(guiAction.hotkeys, stringkeys)
            var specialKeysMatch = cmpArrays(guiAction.specialKeys, stringspecialkeys);

            if(!hotkeysMatch || !specialKeysMatch) return;
            if(guiAction.hotkeys.length === 0) return;
            if(activeElemIsTextBox() && !guiAction.requiredParams.usableInTextBoxes) return;

            wickEditor.rightclickmenu.open = false;
            event.preventDefault();
            guiAction.doAction({});
            that.keys = [];
        })()};
    };

    // In order to ensure that the browser will fire clipboard events, we always need to have something selected
    var focusHiddenArea = function () {
        if($("#scriptingGUI").css('visibility') === 'hidden') {
            $("#hidden-input").val(' ');
            $("#hidden-input").focus().select();
        }
    }

/*************************
    Copy/paste
*************************/

    // clipboard
    //https://www.lucidchart.com/techblog/2014/12/02/definitive-guide-copying-pasting-javascript/
    //http://jsfiddle.net/vtjnr6ea/
    //var textToCopy = 'Lucidchart: Diagrams Done Right';
    //var htmlToCopy = '<div hiddenContent="This is a great place to put whatever you want">Lucidchart: Diagrams Done Right</div>';

    var ieClipboardDiv = $('#ie-clipboard-contenteditable');
    var hiddenInput = $("#hidden-input");

    var userInput = "";
    var hiddenInputListener = function(text) {};

    var focusHiddenArea = function() {
        // In order to ensure that the browser will fire clipboard events, we always need to have something selected
        //hiddenInput.val(' ');
        //hiddenInput.focus().select();
    };

    // Focuses an element to be ready for copy/paste (used exclusively for IE)
    var focusIeClipboardDiv = function() {
        ieClipboardDiv.focus();
        var range = document.createRange();
        range.selectNodeContents((ieClipboardDiv.get(0)));
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    };

    // For IE, we can get/set Text or URL just as we normally would, but to get HTML, we need to let the browser perform the copy or paste
    // in a contenteditable div.
    var ieClipboardEvent = function(clipboardEvent) {
        var clipboardData = window.clipboardData;
        if (clipboardEvent == 'cut' || clipboardEvent == 'copy') {
            clipboardData.setData('Text', wickEditor.project.getCopyData(wickEditor.fabric.getSelectedObjects(WickObject)));
            ieClipboardDiv.html(htmlToCopy);
            focusIeClipboardDiv();
            setTimeout(function() {
                focusHiddenArea();
                ieClipboardDiv.empty();
            }, 0);
        }
        if (clipboardEvent == 'paste') {
            var clipboardText = clipboardData.getData('Text');
            ieClipboardDiv.empty();
            setTimeout(function() {
                //console.log('Clipboard Plain Text: ' + clipboardText);
                //console.log('Clipboard HTML: ' + ieClipboardDiv.html());
                ieClipboardDiv.empty();
                focusHiddenArea();
            }, 0);
        }
    };

    // For every broswer except IE, we can easily get and set data on the clipboard
    var standardClipboardEvent = function(clipboardEvent, event) {
        wickEditor.guiActionHandler.keys = [];
        wickEditor.guiActionHandler.specialKeys = [];
        
        var clipboardData = event.clipboardData;
        if (clipboardEvent == 'cut' || clipboardEvent == 'copy') {
            clipboardData.setData('text/wickobjectsjson', wickEditor.project.getCopyData(wickEditor.fabric.getSelectedObjects(WickObject)));
            //clipboardData.setData('text/html', htmlToCopy);
        }
        if (clipboardEvent == 'paste') {
            //console.log('Clipboard Plain Text: ' + clipboardData.getData('text/plain'));
            //console.log('Clipboard HTML: ' + clipboardData.getData('text/html'));
            wickEditor.guiActionHandler.doAction('paste', {clipboardData:clipboardData});
        }
    };

    // For IE, the broswer will only paste HTML if a contenteditable div is selected before paste. Luckily, the browser fires 
    // a before paste event which lets us switch the focuse to the appropraite element
    if (isIe) {
        document.addEventListener('beforepaste', function() {
            if (hiddenInput.is(':focus')) {
                focusIeClipboardDiv();
            }
        }, true);
    }

    // We need the hidden input to constantly be selected in case there is a copy or paste event. It also recieves and dispatches input events
    hiddenInput.on('input', function(e) {
        var value = hiddenInput.val();
        userInput += value;
        hiddenInputListener(userInput);

        // There is a bug (sometimes) with Safari and the input area can't be updated during
        // the input event, so we update the input area after the event is done being processed
        if (isSafari) {
            hiddenInput.focus();
            setTimeout(focusHiddenArea, 0);
        } else {
            focusHiddenArea();
        }
    });

    var activeElemIsTextBox = function () {
        var activeElem = document.activeElement.nodeName;
        editingTextBox = activeElem == 'TEXTAREA' || activeElem == 'INPUT';
        return editingTextBox;
    };

    // Set clipboard event listeners on the document. 
    ['cut', 'copy', 'paste'].forEach(function(event) {
        document.addEventListener(event, function(e) {
            //console.log(event);
            if (isIe) {
                ieClipboardEvent(event);
            } else {
                if(activeElemIsTextBox()) return;
                standardClipboardEvent(event, e);
                focusHiddenArea();
                e.preventDefault();
                $('#fabricCanvas').focus().select();
                //console.log(document.activeElement.nodeName)
            }
        });
    });

    // Keep the hidden text area selected
    //$(document).mouseup(focusHiddenArea);

/*************************
     Tooltips
*************************/

    $('.tooltipElem').on("mouseover", function(e) {
        $("#tooltipGUI").css('display', 'block');
        $("#tooltipGUI").css('top', wickEditor.inputHandler.mouse.y+5+'px');
        $("#tooltipGUI").css('left', wickEditor.inputHandler.mouse.x+5+'px');
        document.getElementById('tooltipGUI').innerHTML = e.currentTarget.attributes.alt.value;
    });
    $('.tooltipElem').on("mouseout", function(e) {
        $("#tooltipGUI").css('display', 'none');
    });

/*************************
     File Import
*************************/

    var loadSVG = function (svg, callback) {
        wickEditor.paper.addPath(svg);
        wickEditor.paper.refresh();
        wickEditor.syncInterfaces();
    }
    
    var loadAnimatedGIF = function (dataURL, callback) {
        var gifSymbol = WickObject.createNewSymbol();
        gifSymbol.x = window.innerWidth /2;
        gifSymbol.y  = window.innerHeight/2;

        //var gif = document.getElementById("gifImportDummyElem");
        var newGifEl = document.createElement("img");
        newGifEl.id = "gifImportDummyElem";
        document.body.appendChild(newGifEl);
        var gif = document.getElementById('gifImportDummyElem')
        gif.setAttribute('src', dataURL);
        gif.setAttribute('height', '467px');
        gif.setAttribute('width', '375px');

        var superGif = new SuperGif({ gif: gif } );
        superGif.load(function () {

            var framesDataURLs = superGif.getFrameDataURLs();
            for(var i = 0; i < framesDataURLs.length; i++) {

                WickObject.fromImage(
                    framesDataURLs[i],
                    (function(frameIndex) { return function(o) {
                        gifSymbol.layers[0].frames[frameIndex].wickObjects.push(o);
                        
                        if(frameIndex == framesDataURLs.length-1) {
                            gifSymbol.width  = gifSymbol.layers[0].frames[0].wickObjects[0].width;
                            gifSymbol.height = gifSymbol.layers[0].frames[0].wickObjects[0].height;
                            callback(gifSymbol);
                        } else {
                            gifSymbol.layers[0].addFrame(new WickFrame);
                        }
                    }; }) (i)
                );
            }
        });
    }

    var loadFileIntoWickObject = function (e,file,fileType) {
        
        if (fileType === 'text/html') {
            WickProject.fromFile(file, function(project) {
                wickEditor.project = project;
                wickEditor.syncInterfaces();
            });
        } else {

            var fromContstructors = {
                'image/png'        : WickObject.fromImage,
                'image/jpeg'       : WickObject.fromImage,
                'application/jpg'  : WickObject.fromImage,
                'image/bmp'        : WickObject.fromImage,
                'image/svg+xml'    : loadSVG,
                'image/gif'        : loadAnimatedGIF,
                'audio/mp3'        : WickObject.fromAudioFile,
                'audio/wav'        : WickObject.fromWavFile,
                'audio/wave'       : WickObject.fromWavFile,
                'audio/x-wav'      : WickObject.fromWavFile,
                'audio/x-pn-wav'   : WickObject.fromWavFile,
                'audio/ogg'        : WickObject.fromAudioFile,
                'audio/flac'       : WickObject.fromAudioFile,
                'audio/x-flac'     : WickObject.fromAudioFile,
                "audio/x-m4a"      : WickObject.fromAudioFile,
                "application/json" : WickObject.fromJSONFile
            }
            
            var fr = new FileReader();
            fr.onloadend = function() {
                if(!fromContstructors[fileType]) { 
                    console.error(fileType + " has no constructor!");
                    return;
                }

                fromContstructors[fileType](fr.result, function (newWickObject) {
                    var m
                    if(e && e.originalEvent && e.originalEvent.clientX) {
                        m = wickEditor.fabric.screenToCanvasSpace(e.originalEvent.clientX, e.originalEvent.clientY);
                    } else {
                        m = wickEditor.fabric.screenToCanvasSpace(window.innerWidth/2, window.innerHeight/2);
                    }
                    newWickObject.x = m.x;
                    newWickObject.y = m.y;
                    wickEditor.actionHandler.doAction('addObjects', {wickObjects:[newWickObject]});
                })
            };
            if(fileType === "application/json" || fileType === "image/svg+xml") 
                fr.readAsText(file); 
            else 
                fr.readAsDataURL(file);
        }
    }

/*************************
     Drag-to-upload
*************************/
    
    $("#editor").on('dragover', function(e) {
        return false;
    });
    $("#editor").on('dragleave', function(e) {
        return false;
    });
    $("#editor").on('drop', function(e) {

        // prevent browser from opening the file
        e.stopPropagation();
        e.preventDefault();

        var files = e.originalEvent.dataTransfer.files;

        // Retrieve uploaded files data
        for (var i = 0; i < files.length; i++) {

            var file = files[i];
            var fileType = file.type;

            loadFileIntoWickObject(e,file,fileType);

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
            var fileType = file.type;

            loadFileIntoWickObject(null,file,fileType);
        }

        var importButton = $("importButton");
        importButton.replaceWith( importButton = importButton.clone( true ) );
    }

/*************************
    Leave page warning
*************************/

    window.addEventListener("beforeunload", function (event) {
        if(wickEditor.actionHandler.undoStack.length === 0) return;
        var confirmationMessage = 'Warning: All unsaved changes will be lost!';
        (event || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    });

}
