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
    Pressure
*************************/

    this.penPressure = 1; 

    Pressure.set(".paperCanvas", { 
        change: function(force, event) { 
            that.penPressure = force; 
        } 
    }, {polyfill: false});

    this.getPenPressure = function() {
        return that.penPressure; 
    }

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

    var modifierKeys = ['Shift','Control']

    /* Set up vars needed for input listening. */
    this.keys = [];

    document.body.addEventListener("keydown", function (event) {
        handleKeyEvent(event, "keydown");
    });
    document.body.addEventListener("keyup", function (event) {
        // Why is this here
        if(event.keyCode == 32 && !activeElemIsTextBox()) {
            wickEditor.useLastUsedTool();
            wickEditor.canvas.updateCursor();
            wickEditor.syncInterfaces();
        }
    });

    var handleKeyEvent = function (event) {

        if(event.key === 'Tab' && document.activeElement.nodeName !== "INPUT") event.preventDefault()

        for(actionName in wickEditor.guiActionHandler.guiActions) {
            var hotkeysMatch = true;
            var action = wickEditor.guiActionHandler.guiActions[actionName];

            if(action.hotkeys.length < 1 || action.hotkeys[0] !== event.code) hotkeysMatch=false;

            if(action.modifierKey) {
                if(!event.metaKey && !event.ctrlKey) hotkeysMatch=false;
            } else {
                if(event.metaKey || event.ctrlKey) hotkeysMatch=false;
            }

            if(action.shiftKey) {
                if(!event.shiftKey) hotkeysMatch=false;
            } else {
                if(event.shiftKey) hotkeysMatch=false;
            }

            if(hotkeysMatch) {
                var specialParamsMatch = true;

                if(activeElemIsTextBox() && !action.requiredParams.usableInTextBoxes) specialParamsMatch=false;
                if(document.activeElement.className === 'canvasTextEdit') specialParamsMatch=false;
                if(action.requiredParams.disabledInScriptingIDE && (document.activeElement.className === 'ace_text-input')) specialParamsMatch=false;

                if(specialParamsMatch) {
                    wickEditor.rightclickmenu.open = false;

                    event.preventDefault();
                    action.doAction({});
                }
            }
        }
    };

    // In order to ensure that the browser will fire clipboard events, we always need to have something selected
    var focusHiddenArea = function () {
        if($("#scriptingGUI").css('visibility') === 'hidden') {
            $("#hidden-input").val(' ');
            $("#hidden-input").focus().select();
        }
    }

    var activeElemIsTextBox = function () {
        var activeElem = document.activeElement.nodeName;
        editingTextBox = activeElem == 'TEXTAREA' || activeElem == 'INPUT';
        return editingTextBox;
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
            clipboardData.setData('Text', wickEditor.project.getCopyData(wickEditor.project.getSelectedObjects(WickObject)));
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
            //clipboardData.setData('text/wickobjectsjson', wickEditor.project.getCopyData());
            
            var copyData = wickEditor.project.getCopyData();
            var copyType;
            if(wickEditor.project.getSelectedObjects()[0] instanceof WickObject) {
                copyType = 'text/wickobjectsjson';
            } else {
                copyType = 'text/wickframesjson';
            }
            clipboardData.setData(copyType, copyData);

            if(clipboardEvent == 'cut') {
                wickEditor.guiActionHandler.doAction('deleteSelectedObjects');
            }
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
        var editingTextBox = activeElem == 'TEXTAREA' || activeElem == 'INPUT';
        return editingTextBox;
    };

    // Set clipboard event listeners on the document. 
    ['cut', 'copy', 'paste'].forEach(function(event) {
        window.addEventListener(event, function(e) {
            if (isIe) {
                ieClipboardEvent(event);
            } else {
                if(activeElemIsTextBox()) return;
                standardClipboardEvent(event, e);
                focusHiddenArea();
                e.preventDefault();
                $('#editorCanvasContainer').focus().select();
                //console.log(document.activeElement.nodeName)
            }
        });
    });

/*************************
     Tooltips
*************************/

    setTimeout(function () {
        $('.tooltipElem').on("mousemove", function(e) {
            document.getElementById('tooltipGUI').innerHTML = e.currentTarget.getAttribute('alt');
            document.getElementById('tooltipGUI').style.display = 'block';
            document.getElementById('tooltipGUI').style.opacity = 1.0;
            var mouseX = wickEditor.inputHandler.mouse.x+10;
            var mouseY = wickEditor.inputHandler.mouse.y+5;
            var tooltipX = Math.min(mouseX, window.innerWidth  - $("#tooltipGUI").width()  - 10)
            var tooltopY = Math.min(mouseY, window.innerHeight - $("#tooltipGUI").height() - 3);
            $("#tooltipGUI").css('top', tooltopY+'px');
            $("#tooltipGUI").css('left', tooltipX+'px');
        });
        $('.tooltipElem').on("mouseout", function(e) {
            document.getElementById('tooltipGUI').style.display = 'block';
            document.getElementById('tooltipGUI').style.opacity = 0.0;
        });
    }, 1500);

/*************************
     File Import
*************************/

    var loadSVG = function (svg, filename, callback) {
        var xmlString = svg
          , parser = new DOMParser()
          , doc = parser.parseFromString(xmlString, "text/xml");
        var paperObj = paper.project.importSVG(doc, {insert:false});
        
        var allPaths = [];

        function importPaperGroup (paperGroup) {
            paperGroup.children.forEach(function (child) {
                if(child instanceof paper.Group) {
                    importPaperGroup(child);
                } else {
                    importPaperPath(child);
                }
            })
        }
        function importPaperPath (paperPath) {
            var svgRaw = paperPath.exportSVG({asString:true})
            var svgString = '<svg id="svg" version="1.1" xmlns="http://www.w3.org/2000/svg">'+svgRaw+'</svg>';
            var wickPath = WickObject.createPathObject(svgString);
            wickPath.x = paperPath.position.x;
            wickPath.y = paperPath.position.y;
            wickPath.width = paperPath.bounds._width;
            wickPath.height = paperPath.bounds._height;
            allPaths.push(wickPath);
        }

        if(paperObj instanceof paper.Group) {
            importPaperGroup(paperObj);
        } else {
            importPaperPath(paperObj);
        }

        wickEditor.actionHandler.doAction('addObjects', {wickObjects:allPaths});
    }
    
    var loadAnimatedGIF = function (dataURL, filename, callback) {
        //console.log(dataURL)

        var gifSymbol = WickObject.createNewSymbol(filename);
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
                    var asset = new WickAsset(framesDataURLs[i], 'image', filename+"_frame_"+i);
                    var frameWickObj = new WickObject();
                    frameWickObj.assetUUID = wickEditor.project.library.addAsset(asset);
                    frameWickObj.width = gifWidth;
                    frameWickObj.height = gifHeight;
                    frameWickObj.isImage = true;
                    frameWickObj.name = filename+"_frame_"+i;

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

    var loadImage = function (src, filename, callback) {
        var asset = new WickAsset(src, 'image', filename);
        var wickObj = new WickObject();
        wickObj.assetUUID = wickEditor.project.library.addAsset(asset);
        wickObj.isImage = true;
        wickObj.name = filename;
        callback(wickObj);
    }

    var loadAudio = function (src, filename, callback) {
        // Firefox reads Ogg files as video/ogg which breaks howler. 
        // This forces howler to not think ogg files are videos in firefox.
        if(src.includes('video/ogg')) {
            src = src.replace('video/ogg', 'audio/ogg');
        }

        var asset = new WickAsset(src, 'audio', filename);
        var assetUUID = wickEditor.project.library.addAsset(asset);
        wickEditor.syncInterfaces();
    }

    var loadUncompressedAudio = function (src, filename, callback) {
        var asset = new WickAsset(src, 'audio', filename, true);
        var assetUUID = wickEditor.project.library.addAsset(asset);
        wickEditor.syncInterfaces();
    }

    var loadPlaintext = function (text, filename, callback) {
        loadJSON(text, filename, callback);
    }

    var loadWickFile = function (arrayBuffer, filename, callback) {
        var byteArray = new Uint8Array(arrayBuffer);
        var wickProjectJSON = LZString.decompressFromUint8Array(byteArray);
        loadJSON(wickProjectJSON, filename, callback);
    }

    var loadJSON = function (json, filename, callback) {
        var tempJsonObj = JSON.parse(json);
        if(tempJsonObj.rootObject) {
            var project = WickProject.fromJSON(json);
            var filenameParts = filename.split('-');
            var name = filenameParts[0];
            if(name.includes('.json')) {
                name = name.split('.json')[0];
            }
            if(name.includes('.wick')) {
                name = name.split('.wick')[0];
            }
            project.name = name || 'New Project';
            wickEditor.guiActionHandler.doAction('openProject', {project:project})
        } else {
            callback(WickObject.fromJSON(json));
        }
    }

    var loadHTML = function (file) {
        WickProject.fromFile(file, function(project) {
            wickEditor.guiActionHandler.doAction('openProject', {project:project})
        });
    }

    var loadZIP = function (file) {
        WickProject.fromZIP(file, function(project) {
            wickEditor.guiActionHandler.doAction('openProject', {project:project})
        });
    } 

    var loadJS = function (file) {
        var fr = new FileReader();
        fr.onloadend = function() {
            var asset = new WickAsset(fr.result, 'script', file.name, true);
            wickEditor.project.library.addAsset(asset);
            wickEditor.syncInterfaces();
        };
        fr.readAsText(file); 
    } 

    var loadFileIntoWickObject = function (e,file,fileType) {

        if(file.name.endsWith('.wick')) {
            fileType = 'wickfile'
        }

        if(fileType === 'text/html') {
            loadHTML(file)
            return;
        }

        if(fileType === 'application/zip' || fileType === 'application/x-zip-compressed') {
            loadZIP(file)
            return;
        }

        if(fileType === 'text/javascript') {
            loadJS(file);
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
            'audio/wav'        : loadUncompressedAudio,
            'audio/wave'       : loadUncompressedAudio,
            'audio/x-wav'      : loadUncompressedAudio,
            'audio/x-pn-wav'   : loadUncompressedAudio,
            'audio/ogg'        : loadAudio,
            'video/ogg'        : loadAudio,
            'application/ogg'  : loadAudio,
            'audio/flac'       : loadAudio,
            'audio/x-flac'     : loadAudio,
            "audio/x-m4a"      : loadAudio,
            'audio/mpeg'       : loadAudio,
            "application/json" : loadJSON,
            "text/plain"       : loadPlaintext,
            "wickfile"         : loadWickFile,
        }
        
        var fr = new FileReader();
        fr.onloadend = function() {
            if(!fromContstructors[fileType]) { 
                alert("Wick cannot import '" + file.name + "'\n\nWick does not support '" + fileType + "' files yet."); 
                console.error(fileType + " has no constructor!");
                return;
            }

            fromContstructors[fileType](fr.result, file.name, function (newWickObject) {
                var m
                if(e && e.originalEvent && e.originalEvent.clientX) {
                    m = wickEditor.canvas.screenToCanvasSpace(e.originalEvent.clientX, e.originalEvent.clientY);
                } else {
                    m = wickEditor.canvas.screenToCanvasSpace(window.innerWidth/2, window.innerHeight/2);
                }
                newWickObject.x = m.x;
                newWickObject.y = m.y;
                wickEditor.actionHandler.doAction('addObjects', {wickObjects:[newWickObject]});
            })
        };
        if(fileType === "application/json" || fileType === "image/svg+xml" || fileType === "text/plain") { 
            fr.readAsText(file); 
        } else if (fileType === 'wickfile') {
            fr.readAsArrayBuffer(file);
        } else {
            fr.readAsDataURL(file);
        }
    }

/*************************
     Drag-to-upload
*************************/
    
    var dropMessageDiv = document.getElementById('dropFileMessage');
    dropMessageDiv.addEventListener('mousemove', function (e) {
        dropMessageDiv.style.display = 'none';
    })
    $("#editor").on('dragover', function(e) {
        dropMessageDiv.style.display = 'block';
        return false;
    });
    $("#editor").on('dragleave', function(e) {
        //dropMessageDiv.style.display = 'none';
        return false;
    });
    $("#editor").on('drop', function(e) {

        dropMessageDiv.style.display = 'none';

        // prevent browser from opening the file
        e.stopPropagation();
        e.preventDefault();

        var files = e.originalEvent.dataTransfer.files;

        // Retrieve uploaded files data
        for (var i = 0; i < files.length; i++) {

            var file = files[i];
            var fileType = file.type;

            if(fileType === '') {
                var parts = file.name.split('.');
                ext = parts[parts.length-1];
                if(ext === 'json') fileType = 'application/json';
            }

            loadFileIntoWickObject(e,file,fileType);

        }

        return false;
    });

/*************************
     Import Files
*************************/

    function importFile (e) {
        var filePath = document.getElementById("importButton");
        if(filePath.files && filePath.files[0]) {
            var reader = new FileReader();
            var file = filePath.files[0];
            var fileType = file.type;

            loadFileIntoWickObject(null,file,fileType);
        }

        $("#importButton").replaceWith($("<input>", {id : "importButton", type: "file", "class": "hidden"}));
        document.getElementById('importButton').onchange = importFile;
    }

    document.getElementById('importButton').onchange = importFile;

/*************************
    Leave page warning
*************************/

    window.onbeforeunload = function(event) {
        if(wickEditor.actionHandler.getHistoryLength() === 0) return;
        
        var confirmationMessage = 'Warning: All unsaved changes will be lost!';
        (event || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    };

}
