/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var FabricCanvas = function (wickEditor) {

    var that = this;

    // When a fabric object is created from a wick object (and vice versa), 
    // these properties must be set on the new object
    this.sharedFabricWickObjectProperties = [
        "left",
        "top",
        "width",
        "height",
        "scaleX",
        "scaleY",
        "angle",
        "flipX",
        "flipY",
        "opacity"
    ];

// Setup fabric canvas

    this.canvas = new fabric.CanvasEx('editorCanvas');
    this.canvas.selectionColor = 'rgba(0,0,5,0.1)';
    this.canvas.selectionBorderColor = 'grey';
    this.canvas.selectionLineWidth = 2;
    this.canvas.backgroundColor = "#EEE";
    this.canvas.setWidth ( window.innerWidth  );
    this.canvas.setHeight( window.innerHeight );

    this.context = this.canvas.getContext('2d');

    this.canvasPanPosition = {x:0,y:0};

    this.currentTool = "cursor";

    this.syncWithEditor = function () {
        this.setBackgroundColor(wickEditor.project.backgroundColor);
        this.storeObjectsIntoCanvas( 
            wickEditor.currentObject.getCurrentFrame().wickObjects, 
            wickEditor.project.resolution 
        );
        this.resize();
    }

// White box that shows resolution/objects that will be on screen when project is exported

    this.frameInside = new fabric.Rect({
        fill: '#FFF',
    });

    this.frameInside.hasControls = false;
    this.frameInside.selectable = false;
    this.frameInside.evented = false;

    this.canvas.add(this.frameInside)

// Crosshair that shows where (0,0) of the current object is

    fabric.Image.fromURL('resources/origin.png', function(obj) {
        that.originCrosshair = obj;

        that.originCrosshair.left = (window.innerWidth -wickEditor.project.resolution.x)/2- that.originCrosshair.width/2;
        that.originCrosshair.top  = (window.innerHeight-wickEditor.project.resolution.y)/2- that.originCrosshair.height/2;

        that.originCrosshair.hasControls = false;
        that.originCrosshair.selectable = false;
        that.originCrosshair.evented = false;

        that.canvas.add(that.originCrosshair);
    });

// Text and fade that alerts the user to drop files into editor
// Shows up when a file is dragged over the editor

    // Fade
    this.dragToImportFileFade = new fabric.Rect({
        fill: '#000',
        opacity: 0
    });

    this.dragToImportFileFade.hasControls = false;
    this.dragToImportFileFade.selectable = false;
    this.dragToImportFileFade.evented = false;

    this.canvas.add(this.dragToImportFileFade);

    // Text
    this.dragToImportFileText = new fabric.Text('Drop file to import', {
        fill: '#000',
        fontFamily: 'arial',
        opacity: 0
    });

    this.dragToImportFileText.hasControls = false;
    this.dragToImportFileText.selectable = false;
    this.dragToImportFileText.evented = false;

    this.canvas.add(this.dragToImportFileText);

    var showDragToImportFileAlert = function() {
        that.canvas.bringToFront(this.dragToImportFileFade);
        that.canvas.bringToFront(this.dragToImportFileText);
        that.dragToImportFileFade.opacity = 0.3;
        that.dragToImportFileText.opacity = 1.0;
        that.canvas.renderAll();
    }
    var hideDragToImportFileAlert = function() {
        that.dragToImportFileFade.opacity = 0;
        that.dragToImportFileText.opacity = 0;
        that.canvas.renderAll();
    }
    $("#editorCanvasContainer").on('dragover', function(e) {
        showDragToImportFileAlert();
        return false;
    });
    $("#editorCanvasContainer").on('dragleave', function(e) {
        hideDragToImportFileAlert();
        return false;
    });
    $("#editorCanvasContainer").on('drop', function(e) {
        hideDragToImportFileAlert();
        return false;
    });

// Paper.js canvas

    this.paperCanvas = new PaperCanvas(wickEditor);
    this.paperCanvasFabricObject = null;

// Events

    var that = this;
    var canvas = this.canvas;

    // Listen for objects being changed so we can undo them in the action handler.
    canvas.on('object:modified', function(e) {

        var originalState = {
            left   : e.target.originalState.left,
            top    : e.target.originalState.top,
            scaleX : e.target.originalState.scaleX,
            scaleY : e.target.originalState.scaleY,
            angle  : e.target.originalState.angle,
            text   : e.target.originalState.text
        }
        var id = that.canvas.getObjects().indexOf(e.target);

        // Automatically delete text boxes with no text in 'em.
        if (e.target.text === '') {
            // Make sure the original text comes back on undo
            e.target.text = e.target.originalState.text;
            wickEditor.actionHandler.doAction('delete', { obj:e.target, group:null });
            return;
        }

        wickEditor.actionHandler.doAction('transformFabricCanvasObject', 
            {id: id,
             originalState: originalState}
        );
    });

    // Fabric doesn't select things with right clicks.
    // We have to do that manually
    canvas.on('mouse:down', function(e) {

        if(e.e.button == 2) {
            
            if (e.target && e.target.wickObject) {
                // Set active object of fabric canvas
                var id = canvas.getObjects().indexOf(e.target);
                canvas.setActiveObject(canvas.item(id));
            }

            if(!e.target) {
                // Didn't right click an object, deselect everything
                canvas.deactivateAll().renderAll();
            }
            wickEditor.htmlGUIHandler.openRightClickMenu();

        } else {
            wickEditor.htmlGUIHandler.closeRightClickMenu();
        }
    });

    // Make sure the paper.js canvas is getting the same mouse events as the fabric canvas.
    canvas.on('mouse:down', function(e) {
        e.e.tool = that.currentTool;
        that.paperCanvas.mouseDown(e.e);
    });
    canvas.on('mouse:move', function(e) {
        e.e.tool = that.currentTool;
        that.paperCanvas.mouseMove(e.e);
    });

    // Paths are handled internally by fabric so we have to 
    // intercept the paths and convert them to wickobjects
    canvas.on('object:added', function(e) {
        if(e.target.type === "path") {
            // Old straight-to-rasterized brush
            /*var path = e.target;
            WickObject.fromFabricPath(path, wickEditor.currentObject, function(wickObj) {
                wickEditor.actionHandler.doAction('addWickObjectToFabricCanvas', {wickObject:wickObj});
            });
            canvas.remove(path);*/

            // New send-to-paper.js brush
            var path = e.target;

            path.cloneAsImage(function(clone) {
                var imgSrc = clone._element.currentSrc || clone._element.src;

                Potrace.loadImageFromDataURL(imgSrc);
                Potrace.process(function(){
                    var svg = Potrace.getSVG(1);
                    var svgfile = new File([svg], "filename");
                    that.paperCanvas.addPathSVG(svgfile, path.left, path.top);
                });
            });

            canvas.remove(e.target);
        }
    });

    canvas.on('object:selected', function (e) {
        wickEditor.htmlGUIHandler.reloadScriptingGUI();
        wickEditor.htmlGUIHandler.updatePropertiesGUI();
    });

    canvas.on('selection:cleared', function (e) {
        wickEditor.htmlGUIHandler.closeScriptingGUI();
        wickEditor.htmlGUIHandler.updatePropertiesGUI('project');
    });

    this.resize = function () {
        //this.paperCanvas.resize();
        this.updateCanvasResolution();
        this.repositionOriginCrosshair();
    }

    this.updateCanvasResolution = function () {

        var projectWidth = wickEditor.project.resolution.x;
        var projectHeight = wickEditor.project.resolution.y;

        var that = this;

        // Reposition all fabric objects to use new wick canvas origin and pan position

        var oldWidth = this.canvas.getWidth();
        var oldHeight = this.canvas.getHeight();

        this.canvas.setWidth ( window.innerWidth  );
        this.canvas.setHeight( window.innerHeight );
        this.canvas.calcOffset();

        var diffWidth = this.canvas.getWidth() - oldWidth;
        var diffHeight = this.canvas.getHeight() - oldHeight;

        this.canvas.forEachObject(function(fabricObj) {
            fabricObj.left += diffWidth /2;
            fabricObj.top  += diffHeight/2;
            fabricObj.setCoords();
        });

        // Re-center the import file alert text and fade

        this.dragToImportFileFade.width = window.innerWidth;
        this.dragToImportFileFade.height = window.innerWidth;
        this.dragToImportFileFade.left = 0;
        this.dragToImportFileFade.top  = 0;
        this.dragToImportFileFade.setCoords();

        this.dragToImportFileText.left = window.innerWidth /2-this.dragToImportFileText.width /2+this.canvasPanPosition.x;
        this.dragToImportFileText.top  = window.innerHeight/2-this.dragToImportFileText.height/2+this.canvasPanPosition.y;
        this.dragToImportFileText.setCoords();

        if(wickEditor.currentObject.isRoot) {
            // In root object, frame box gets centered
            this.frameInside.width  = projectWidth;
            this.frameInside.height = projectHeight;
            this.frameInside.left = (window.innerWidth -projectWidth) /2 + this.canvasPanPosition.x;
            this.frameInside.top  = (window.innerHeight-projectHeight)/2 + this.canvasPanPosition.y;
            this.frameInside.setCoords();
        } else {
            // Not in root, frame box takes up whole screen
            this.frameInside.width  = window.innerWidth;
            this.frameInside.height = window.innerHeight;
            this.frameInside.left = 0;
            this.frameInside.top  = 0;
            this.frameInside.setCoords();
        }

        this.canvas.renderAll();

    }

    this.reloadPaperCanvas = function() {

        console.log("reloadPaperCanvas")

        var that = this;

        // Get rid of the old paper canvas object if it exists

        if(that.paperCanvasFabricObject) {
            console.log("that.canvas.remove(that.paperCanvasFabricObject);")
            that.canvas.remove(that.paperCanvasFabricObject);
        }

        // Add a new paper canvas

        var paperCanvasDataURL = this.paperCanvas.canvas.toDataURL();

        fabric.Image.fromURL(paperCanvasDataURL, function(oImg) {
            oImg.hasControls = false;
            oImg.selectable = false;
            oImg.evented = false;

            that.paperCanvasFabricObject = oImg;
            that.canvas.add(that.paperCanvasFabricObject);
        });

    }

    this.convertPaperSVGsToFabricObjects = function () {
        var paperSVGs = this.paperCanvas.getAllSVGs();

        for(var i = 0; i < paperSVGs.length; i++) {
            var svgData = paperSVGs[i];

            var svgWickObj = WickObject.fromSVG(svgData, wickEditor.currentObject);
            wickEditor.actionHandler.doAction('addWickObjectToFabricCanvas', {wickObject:svgWickObj});

            //var path = fabric.loadSVGFromString(svgStr,function(objects, options) {
                /*var obj = fabric.util.groupSVGElements(objects, options);
                obj.scaleToHeight(canvas.height-10)
                   .set({ left: canvas.width/2, top: canvas.height/2 })
                   .setCoords();

                   console.log(obj);

                that.canvas.add(obj).renderAll();*/

                /*var svgGroup = fabric.util.groupSVGElements(objects, options);
                WickObject.fromSVG(svgGroup, wickEditor.currentObject, function(wickObj) {
                    wickEditor.actionHandler.doAction('addWickObjectToFabricCanvas', {wickObject:wickObj});
                });*/

            //});
        }
    }

    this.panTo = function (x,y) {

        var that = this;

        var oldPanPosition = {
            x:this.canvasPanPosition.x,
            y:this.canvasPanPosition.y
        }

        this.canvasPanPosition = {x:x,y:y};

        var canvasPanDiff = {
            x: this.canvasPanPosition.x - oldPanPosition.x,
            y: this.canvasPanPosition.y - oldPanPosition.y
        }

        this.canvas.forEachObject(function(fabricObj) {
            // Make sure to only move the frame if we're editing the root object
            // (While editing objects, the frame takes up the whole window.)
            if(fabricObj !== that.frameInside || wickEditor.currentObject.isRoot) {
                fabricObj.left += canvasPanDiff.x;
                fabricObj.top  += canvasPanDiff.y;
                fabricObj.setCoords();
            }
        });

        this.canvas.renderAll();

    }

    this.repositionOriginCrosshair = function () {
        var projectWidth  = wickEditor.project.resolution.x;
        var projectHeight = wickEditor.project.resolution.y;
        var currentObjectLeft = wickEditor.currentObject.left;
        var currentObjectTop  = wickEditor.currentObject.top;

        // Move the origin crosshair to the current origin
        if(this.originCrosshair) { // window resize can happen before originCrosshair's image is loaded
            this.originCrosshair.left = (window.innerWidth -projectWidth) /2 - this.originCrosshair.width/2;
            this.originCrosshair.top  = (window.innerHeight-projectHeight)/2 - this.originCrosshair.height/2;
            
            this.originCrosshair.left += currentObjectLeft;
            this.originCrosshair.top += currentObjectTop;
            
            this.originCrosshair.left += this.canvasPanPosition.x;
            this.originCrosshair.top  += this.canvasPanPosition.y;

            this.canvas.renderAll();
        }
    }

    this.selectAll = function () {

        var objs = [];
        this.canvas.getObjects().map(function(o) {
            if(o.wickObject) {
                o.set('active', true);
                return objs.push(o);
            }
        });

        var group = new fabric.Group(objs, {
            originX: 'left', 
            originY: 'top'
        });

        this.canvas._activeObject = null;

        this.canvas.setActiveGroup(group.setCoords()).renderAll();

    }

    this.deselectAll = function () {

        wickEditor.htmlGUIHandler.updatePropertiesGUI('project');

        var activeGroup = this.canvas.getActiveGroup();
        if(activeGroup) {
            activeGroup.removeWithUpdate(activeGroup);
            this.canvas.renderAll();
        }

        this.canvas.deactivateAll().renderAll();

    }

}

FabricCanvas.prototype.clearCanvas = function () {

    var canvas = this.canvas;

    // Clear canvas except for wick GUI elements
    this.canvas.forEachObject(function(fabricObj) {
        if(fabricObj.wickObject) {
            canvas.remove(fabricObj);
        } 
    });

}

FabricCanvas.prototype.removeLastObject = function () {
    var canvas_objects = this.canvas._objects;
    if(canvas_objects.length !== 0){
        var last = canvas_objects[canvas_objects.length -1]; //Get last object   
        this.canvas.remove(last);
        this.canvas.renderAll();
    } 
}

FabricCanvas.prototype.setBackgroundColor = function (color) {
    this.frameInside.fill = color;
    this.canvas.renderAll();
}

FabricCanvas.prototype.getCanvas = function() {
    return this.canvas;
}

FabricCanvas.prototype.getActiveObject = function () {
    return this.canvas.getActiveObject();
}

FabricCanvas.prototype.sendSelectedObjectToBack = function () {
    console.error("Don't forget to handle muliple objects here!");

    this.getActiveObject().sendToBack();
    this.frameInside.sendToBack();
}

FabricCanvas.prototype.bringSelectedObjectToFront = function () {
    console.error("Don't forget to handle muliple objects here!");
    
    this.getActiveObject().bringToFront();
}

/*******************************************
    Wick Objects -> Fabric Canvas
********************************************/

FabricCanvas.prototype.makeFabricObjectFromWickObject = function (wickObject, callback) {

    var that = this;

    if(wickObject.isSymbol) {
        
        var makeGroupOutOfFabricObjects = function (fabricObjects) {
            // Create a group out of all objects on the first frame of this dynamic object
            var group = new fabric.Group();

            for(var i = 0; i < fabricObjects.length; i++) {
                group.addWithUpdate(fabricObjects[i]);
            }

            // Add that group to the fabric canvas
            group.wickObject = wickObject;
            group.scaleX = group.wickObject.scaleX;
            group.scaleY = group.wickObject.scaleY;
            group.flipX = group.wickObject.flipX;
            group.flipY = group.wickObject.flipY;
            group.angle = group.wickObject.angle;

            group.isGroup = true;
            return group;
        }

        // Create a list of every object in the first frame of the symbol
        var firstFrameObjects = wickObject.frames[0].wickObjects;
        var firstFrameFabricObjects = [];

        for(var i = 0; i < firstFrameObjects.length; i++) {

            this.makeFabricObjectFromWickObject(firstFrameObjects[i], function(fabricObject) {
                //firstFrameFabricObjects[i] = fabricObject; //scope issue, need to use a closure here
                firstFrameFabricObjects.push(fabricObject);

                // List fully populated
                if(firstFrameFabricObjects.length == firstFrameObjects.length) {
                    var group = makeGroupOutOfFabricObjects(firstFrameFabricObjects);
                    group.opacity = wickObject.opacity;
                    callback(group);
                }
            })

        }

    } else {

        var setWickObjectPropertiesOnFabricObject = function(fabricObj, wickObj) {
            // Set shared wick/fabric positioning properties
            for(var i = 0; i < sharedFabricWickObjectProperties.length; i++) {
                var prop = sharedFabricWickObjectProperties[i];
                fabricObj[prop] = wickObj[prop];
            }

            // Position the fabric object relative to it's parents.
            //var relativePosition = that.getRelativePosition(wickObject);
            var relativePosition = wickObj.getRelativePosition();
            fabricObj.top = relativePosition.top;
            fabricObj.left = relativePosition.left;

            // Set the fabric.js option to only select if the pixel you're over isn't transparent
            fabricObj.perPixelTargetFind = true;
            fabricObj.targetFindTolerance = 4;

            // Store a reference to the wick object inside the fabric object
            // to use when we put this object back into the project.
            fabricObj.wickObject = wickObj;
        }

        var sharedFabricWickObjectProperties = this.sharedFabricWickObjectProperties;

        if(wickObject.imageData) {

            fabric.Image.fromURL(wickObject.imageData, function(newFabricImage) {
                setWickObjectPropertiesOnFabricObject(newFabricImage, wickObject);

                callback(newFabricImage);
            });

        } else if(wickObject.fontData) {

            // Set font properties
            var newFabricText = new fabric.IText(wickObject.fontData.text, { 
                fontFamily: wickObject.fontData.fontFamily,
                fontSize: wickObject.fontData.fontSize,
                fill: wickObject.fontData.fill,
                text: wickObject.fontData.text
            });

            setWickObjectPropertiesOnFabricObject(newFabricText, wickObject);

            callback(newFabricText);

        } else if(wickObject.htmlData) {

            fabric.Image.fromURL('resources/htmlsnippet.png', function(snippetFabricObject) {

                wickObject.width = snippetFabricObject.width / window.devicePixelRatio;
                wickObject.height = snippetFabricObject.height / window.devicePixelRatio;

                setWickObjectPropertiesOnFabricObject(snippetFabricObject, wickObject);

                callback(snippetFabricObject);
            });

        } else if(wickObject.audioData) {

            fabric.Image.fromURL('resources/audio.png', function(audioFabricObject) {

                wickObject.width = audioFabricObject.width / window.devicePixelRatio;
                wickObject.height = audioFabricObject.height / window.devicePixelRatio;

                setWickObjectPropertiesOnFabricObject(audioFabricObject, wickObject);

                callback(audioFabricObject);
            });

        } else if(wickObject.svgData) {

            console.log("yup");

            fabric.loadSVGFromString(wickObject.svgData, function(objects, options) {
                var svgFabricObject = fabric.util.groupSVGElements(objects, options);
                console.log(svgFabricObject)

                setWickObjectPropertiesOnFabricObject(svgFabricObject, wickObject);

                callback(svgFabricObject);
            });

        }

    }

}

FabricCanvas.prototype.storeObjectsIntoCanvas = function (wickObjects, projectResolution) {

    var canvas = this.canvas;

    this.clearCanvas();

    // Add the requested wick objects the canvas
    for(var i = 0; i < wickObjects.length; i++) {
        // Reposition the wickobject so that 0,0 is fabrics origin, not the wick frames origin
        wickObjects[i].left += (window.innerWidth - projectResolution.x) / 2;
        wickObjects[i].top += (window.innerHeight - projectResolution.y) / 2;

        // Add panning position
        wickObjects[i].left += this.canvasPanPosition.x;
        wickObjects[i].top += this.canvasPanPosition.y;

        this.makeFabricObjectFromWickObject(wickObjects[i], function(fabricObject) {
            canvas.add(fabricObject).renderAll();
            fabricObject.setCoords();
        });
    }

}

/*******************************************
    Fabric Canvas -> Wick Objects
********************************************/

FabricCanvas.prototype.getWickObjectsInCanvas = function (projectResolution) {

    var that = this;

    var sharedFabricWickObjectProperties = this.sharedFabricWickObjectProperties;

    var wickObjects = [];

    this.canvas.forEachObject(function(fabricObj) {

        // Take wick object out of fabric object
        var wickObject = fabricObj.wickObject;

        // Don't create a wick object if the fabric object isn't holding one
        // (i.e. if it's the white frame or another gui element inside the fabric canvas)
        if(wickObject) {
            // Set fabric properties on wick object
            for(var i = 0; i < sharedFabricWickObjectProperties.length; i++) {
                var prop = sharedFabricWickObjectProperties[i];
                wickObject[prop] = fabricObj[prop];
            }

            if(wickObject.fontData) {
                wickObject.fontData.text = fabricObj.text;
                wickObject.fontData.fill = fabricObj.fill;
                wickObject.fontData.fontSize = fabricObj.fontSize;
                wickObject.fontData.fontFamily = fabricObj.fontFamily;
            }

            if(wickObject.parentObject) {
                var parentsPositionTotal = wickObject.parentObject.getRelativePosition();
                wickObject.left -= parentsPositionTotal.left;
                wickObject.top -= parentsPositionTotal.top;

                if(wickObject.isSymbol) {
                    var trueSymbolOffset = wickObject.getSymbolTrueOffset();
                    wickObject.left -= trueSymbolOffset.left;
                    wickObject.top -= trueSymbolOffset.top;
                }
            }

            // Reposition the wickobject so that 0,0 is the canvases origin, not fabric's origin.
            wickObject.left -= (window.innerWidth - projectResolution.x) / 2;
            wickObject.top -= (window.innerHeight - projectResolution.y) / 2;

            // Get rid of panning position
            wickObject.left -= that.canvasPanPosition.x;
            wickObject.top -= that.canvasPanPosition.y;

            wickObjects.unshift(wickObject);
        }

    });

    return wickObjects;

}
