/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var PaperInterface = function (wickEditor) {

    var paperCanvas;

    var currentFrame;
    var SVGDataDirty;

    var ready = false;

    // Create the canvas to be used with paper.js and init the paper.js instance.
    paperCanvas = document.createElement('canvas');
    paperCanvas.className = 'paperCanvas';
    paperCanvas.style.backgroundColor = "#FFDDDD";
    paperCanvas.style.width  = (wickEditor.project.resolution.x/3)+'px';
    paperCanvas.style.height = (wickEditor.project.resolution.y/3)+'px';
    paper.setup(paperCanvas);
    paper.view.viewSize.width  = wickEditor.project.resolution.x;
    paper.view.viewSize.height = wickEditor.project.resolution.y;

    // (Debug) Put the canvas somewhere we can see it
    if(localStorage.pathDebug === "1") document.body.appendChild(paperCanvas);


    this.setup = function () {
        // Set initial frame to load SVG data from
        currentFrame = wickEditor.project.currentObject.getCurrentFrame();
        SVGDataDirty = true;
        ready = true;

        this.syncWithEditorState()
    }

    this.syncWithEditorState = function () {
        if(!ready) return;
        if(!paper.project) return; // sync may get called before paper.js is ready

        var newFrame = wickEditor.project.currentObject.getCurrentFrame();
        if(newFrame !== currentFrame) {
            // Set SVGData of currentFrame to svg data from paper.js
            this.applyChangesToFrame();

            SVGDataDirty = true;
        }
        currentFrame = newFrame;

        // Only update the paper.js canvas if new SVG data exists in the WickProject
        if (!SVGDataDirty) return;

        paper.project.clear();

        // currentFrame may be null if the playhead isn't over a frame
        if (!currentFrame) return;

        addSVGGroupToCanvas(currentFrame.pathData);
        resetPathWickObjects();
        SVGDataDirty = false;
    }

    this.applyChangesToFrame = function () {
        if(currentFrame) 
            currentFrame.pathData = paper.project.activeLayer.exportSVG({ asString: true });
    }

    this.addSVG = function (svgString, offset) {
        addSVGToCanvas(svgString, offset);
    }

    this.removeSVG = function (path) {
        path.remove();
    }


    var getAllSVGs = function () {
        var allSVGs = [];

        paper.project.activeLayer.children.forEach(function (child) {
            allSVGs.push(child);
        });

        return allSVGs;
    }

    var resetPathWickObjects = function () {
        var removedWOs = [];
        currentFrame.wickObjects.forEach(function (wickObject) {
            if(!wickObject.pathData) return;
            removedWOs.push(wickObject);
        });
        removedWOs.forEach(function (wickObject) {
            wickObject.parentObject.removeChild(wickObject);
        })

        getAllSVGs().forEach(function (path) {
            addWickObjectFromPaperData(path);
        });
    }
    var addWickObjectFromPaperData = function (path) {
        WickObject.fromPathFile(path.exportSVG({asString:true}), function (wickObject) {
            wickObject.x = path.position.x;
            wickObject.y = path.position.y;
            wickEditor.project.addObject(wickObject);
        });
    }

    var addSVGGroupToCanvas = function (svgString) {
        if(!svgString) return;

        var xmlString = svgString
          , parser = new DOMParser()
          , doc = parser.parseFromString(xmlString, "text/xml");
        var paperGroup = paper.project.importSVG(doc);
        
        paperGroup.parent.insertChildren(paperGroup.index,  paperGroup.removeChildren());
        paperGroup.remove();
    }

    var addSVGToCanvas = function (svgString, offset) {
        var xmlString = svgString
          , parser = new DOMParser()
          , doc = parser.parseFromString(xmlString, "text/xml");
        var paperGroup = paper.project.importSVG(doc);

        if(offset)
            paperGroup.position = new paper.Point(offset.x, offset.y);

        addWickObjectFromPaperData(paperGroup);
    }

 }