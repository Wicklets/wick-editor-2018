/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var PaperInterface = function (wickEditor) {

    var self = this;

    // Paper.js canvas view
    var paperCanvas;

    // Lookup table used when ActionHandler wants to modify/delete paths
    var wickToPaperMappings = {};

    // Reference to current frame in Wick project
    var currentFrame;

/******************************
    Util
******************************/

    // Generate a list of all groups in the paper.js canvas
    var getAllGroupsInCanvas = function () {
        var allGroups = [];

        paper.project.activeLayer.children.forEach(function (child) {
            allGroups.push(child);
        });

        return allGroups;
    }

    // SVG -> paper.js importer
    var importSVG = function (svgString) {
        var xmlString = svgString
          , parser = new DOMParser()
          , doc = parser.parseFromString(xmlString, "text/xml");

        return paper.project.importSVG(doc);
    }

    // Save the paper.js canvas state in the current frame
    var saveFrameSVG = function () {
        if(currentFrame) 
            currentFrame.pathData = paper.project.activeLayer.exportSVG({ asString: true });
    }

    // Remove all existing path wick objects from frame
    var clearPathWickObjects = function () {
        if(currentFrame) {
            var pathWickObjects = [];

            currentFrame.wickObjects.forEach(function (wickObject) {
                if(wickObject.pathData) {
                    pathWickObjects.push(wickObject);
                }
            });

            pathWickObjects.forEach(function (pathWickObject) {
                pathWickObject.parentObject.removeChild(pathWickObject);
            }); 
        }
    }

    // Sync the state of the paper.js canvas with the Wick project
    var regenWickObjects = function () {
        var groups = getAllGroupsInCanvas();

        // Remove all existing path wick objects from frame
        clearPathWickObjects();
        wickToPaperMappings = {};

        // Create new wick objects for all current paths
        groups.forEach(function (group) {
            var oldPosition = {x:group.position.x, y:group.position.y};
            group.position = new paper.Point(0,0);
            WickObject.fromPathFile(group.exportSVG({asString:true}), function (wickObject) {
                wickObject.x = oldPosition.x;
                wickObject.y = oldPosition.y;
                wickEditor.project.addObject(wickObject, null, true);
                wickToPaperMappings[wickObject.uuid] = group;
            });
            group.position = new paper.Point(oldPosition.x, oldPosition.y);
        });
    }

/******************************
    API
******************************/

    self.setup = function () {
        // Create the canvas to be used with paper.js and init the paper.js instance.
        paperCanvas = document.createElement('canvas');
        paperCanvas.className = 'paperCanvas';
        paperCanvas.style.backgroundColor = "#FFDDDD";
        paperCanvas.style.width  = (wickEditor.project.width/2)+'px';
        paperCanvas.style.height = (wickEditor.project.height/2)+'px';
        paper.setup(paperCanvas);
        paper.view.viewSize.width  = wickEditor.project.width;
        paper.view.viewSize.height = wickEditor.project.height;

        // If we're debugging, make the paper.js canvas visible
        if(localStorage.pathDebug === "1") {
            document.body.appendChild(paperCanvas);
        }
    }
    
    self.syncWithEditorState = function () {

        // Check for frame change
        var oldFrame = currentFrame;
        currentFrame = wickEditor.project.currentObject.getCurrentFrame();

        if(oldFrame !== currentFrame) {
            // Clear all groups from paper canvas
            paper.project.clear();

            // This happens when paths are added to a frame that hasn't been
            // touched by paper.js yet. So add all those paths to the path SVG
            if(currentFrame && currentFrame.pathDataToAdd) {
                currentFrame.pathDataToAdd.forEach(function (pathData) {
                    self.addPath(pathData.svg, {x:pathData.x, y:pathData.y});
                });
                currentFrame.pathDataToAdd = null;
                saveFrameSVG();
            }

            // Regen wick objects on the current frame using paper canvas
            clearPathWickObjects();
            wickToPaperMappings = {};

            // Load SVG from currentFrame
            if(currentFrame && currentFrame.pathData) {
                var paperGroup = importSVG(currentFrame.pathData);
                paperGroup.parent.insertChildren(paperGroup.index, paperGroup.removeChildren());
                paperGroup.remove();
            }

            // Regen wick objects for currentFrame
            regenWickObjects();
        }

    }

    self.addPath = function (svgString, offset) {
        var paperGroup = importSVG(svgString);

        if(offset)
            paperGroup.position = new paper.Point(offset.x, offset.y);
    }

    self.modifyPath = function (uuid, modifiedState) {
        var group = wickToPaperMappings[uuid];

        group.position = new paper.Point(modifiedState.x, modifiedState.y);
        group.scale(modifiedState.scaleX, modifiedState.scaleY);
        group.rotate(modifiedState.rotation);
    }

    self.removePath = function (uuid) {
        var group = wickToPaperMappings[uuid];

        group.remove();
    }

    self.refresh = function () {
        saveFrameSVG();
        regenWickObjects();
    }

    self.getPathDataOfWickObject = function (uuid) {
        var group = wickToPaperMappings[uuid];
        return {
            svg: group.exportSVG({asString:true}),
            x: group.position.x,
            y: group.position.y
        }
    }

 }