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
        if(keyChar === 'TAB') event.preventDefault()
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
            if(guiAction.requiredParams.disabledInScriptingIDE && (document.activeElement.className === 'ace_text-input')) return;

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
            clipboardData.setData('text/wickobjectsjson', wickEditor.project.getCopyData());
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

    $('.tooltipElem').on("mousemove", function(e) {
        $("#tooltipGUI").css('display', 'block');
        $("#tooltipGUI").css('top', wickEditor.inputHandler.mouse.y+5+'px');
        $("#tooltipGUI").css('left', wickEditor.inputHandler.mouse.x+10+'px');
        document.getElementById('tooltipGUI').innerHTML = e.currentTarget.getAttribute('alt');
    });
    $('.tooltipElem').on("mouseout", function(e) {
        $("#tooltipGUI").css('display', 'none');
    });

/*************************
     File Import
*************************/

    var loadSVG = function (svg, callback) {
        console.error('loadSVG NYI!');
    }
    
    var loadAnimatedGIF = function (dataURL, callback) {
        //console.log(dataURL)

        var gifSymbol = WickObject.createNewSymbol();
        gifSymbol.layers[0].frames = [];

        var newGifEl = document.createElement("img");

        newGifEl.onload = function () {
            document.body.appendChild(newGifEl)
            
            var framesDataURLs;
            var gifWidth;
            var gifHeight;
            var superGif = new SuperGif({ gif: newGifEl } );
            superGif.load(function () {

                gifWidth = superGif.get_canvas().width;
                gifHeight = superGif.get_canvas().height;
                framesDataURLs = superGif.getFrameDataURLs();
                proceed();

            });

            var proceed = function () {

                for(var i = 0; i < framesDataURLs.length; i++) {
                    var frameWickObj = WickObject.fromImage(framesDataURLs[i]);
                    frameWickObj.width = gifWidth;
                    frameWickObj.height = gifHeight;

                    gifSymbol.layers[0].addFrame(new WickFrame());
                    gifSymbol.layers[0].frames[i].playheadPosition = i;
                    gifSymbol.layers[0].frames[i].wickObjects.push(frameWickObj);
                }

                gifSymbol.width = gifWidth;
                gifSymbol.height = gifHeight;

                callback(gifSymbol);
            }
        }

        newGifEl.src = dataURL;
    }

    var loadImage = function (src, callback) {
        callback(WickObject.fromImage(src));
    }

    var loadAudio = function (src, callback) {
        callback(WickObject.fromAudioFile(src));
    }

    var loadJSON = function (json, callback) {
        var tempJsonObj = JSON.parse(json);
        if(tempJsonObj.rootObject) {
            
            wickEditor.project = WickProject.fromJSON(json);
            window.wickRenderer.setProject(wickEditor.project);
            wickEditor.syncInterfaces();

        } else {

            callback(WickObject.fromJSON(json));

        }
    }

    var loadWAV = function (dataURL, callback) {
        var audioData = dataURL;
        var audioWickObject = WickObject.fromAudioFile(audioData);

        console.log("big audio file size: " + audioWickObject.audioData.length);
        audioWickObject.audioData = LZString.compressToBase64(audioWickObject.audioData);
        console.log("compressed big audio file size: " + audioWickObject.audioData.length);
        console.log("Look how much space we saved wow!");
        
        audioWickObject.compressed = true;
        callback(audioWickObject);
    }

    var loadHTML = function (file) {
        WickProject.fromFile(file, function(project) {
            wickEditor.project = project;
            window.wickRenderer.setProject(wickEditor.project);
            wickEditor.syncInterfaces();
        });
    }

    var loadFileIntoWickObject = function (e,file,fileType) {

        if(fileType === 'text/html') {
            loadHTML(file)
            return;
        }

        var fromContstructors = {
            'image/png'        : loadImage,
            'image/jpeg'       : loadImage,
            'application/jpg'  : loadImage,
            'image/bmp'        : loadImage,
            'image/svg+xml'    : loadSVG,
            'image/gif'        : loadAnimatedGIF,
            'audio/mp3'        : loadAudio,
            'audio/wav'        : loadWAV,
            'audio/wave'       : loadWAV,
            'audio/x-wav'      : loadWAV,
            'audio/x-pn-wav'   : loadWAV,
            'audio/ogg'        : loadAudio,
            'audio/flac'       : loadAudio,
            'audio/x-flac'     : loadAudio,
            "audio/x-m4a"      : loadAudio,
            "application/json" : loadJSON
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

                // Generate thumbnails for gif frames inside new symbol
                if(fileType === 'image/gif') {
                    var oldCurr = wickEditor.project.currentObject;
                    wickEditor.project.currentObject = newWickObject
                    newWickObject.getAllFrames().forEach(function (frame) {
                        console.log(frame)
                        wickEditor.project.currentObject.playheadPosition = frame.playheadPosition
                        wickEditor.thumbnailRenderer.renderThumbnailForFrame(frame)
                    });
                    wickEditor.project.currentObject = oldCurr;
                    newWickObject.playheadPosition = 0;
                }
            })
        };
        if(fileType === "application/json" || fileType === "image/svg+xml") 
            fr.readAsText(file); 
        else 
            fr.readAsDataURL(file);
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
        if(wickEditor.actionHandler.getHistoryLength() === 0) return;
        var confirmationMessage = 'Warning: All unsaved changes will be lost!';
        (event || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    });

}
