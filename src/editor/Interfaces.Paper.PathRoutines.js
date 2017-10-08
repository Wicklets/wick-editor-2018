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
    
var PathRoutines = function (paperInterface, wickEditor) {

    var self = this;

    self.getBooleanOpResult = function (boolFnName, objs) {
        var touchingPaths = objs;

        if(boolFnName === 'intersect') {
            touchingPaths = touchingPaths.reverse();
            //console.log(touchingPaths);
        }

        //startTiming()

        touchingPaths.forEach(function (path) {
            self.regenPaperJSState(path);
        });

        var superPath = touchingPaths[0].paper.children[0].clone({insert:false});
        touchingPaths.forEach(function (path) {
            if(path === touchingPaths[0]) return;
            if(superPath.closePath) superPath.closePath();
            superPath = superPath[boolFnName](path.paper.children[0]);
        });

        var superGroup = new paper.Group({insert:false});
        superGroup.addChild(superPath);

        var superPathString = superPath.exportSVG({asString:true});
        var svgString = '<svg id="svg" version="1.1" width="'+superPath.bounds._width+'" height="'+superPath.bounds._height+'" xmlns="http://www.w3.org/2000/svg">' +superPathString+ '</svg>'
        var superPathWickObject = WickObject.createPathObject(svgString);
        superPathWickObject.x = superPath.position.x;
        superPathWickObject.y = superPath.position.y;

        //stopTiming("boolean op done")

        self.refreshPathData(superPathWickObject)

        return superPathWickObject;
    }

    self.eraseWithPath = function (args) {
        var paths = [];
        wickEditor.project.getCurrentFrame().wickObjects.forEach(function (wickObject) {
            if(wickObject.pathData) {
                paths.push(wickObject);
                self.regenPaperJSState(wickObject);
            }
        });

        var xmlString = args.pathData
          , parser = new DOMParser()
          , doc = parser.parseFromString(xmlString, "text/xml");

        var subtractWithPath = paper.project.importSVG(doc, {insert:false});
        if(subtractWithPath.closePath) subtractWithPath.closePath();

        subtractWithPath.position.x = args.pathX;
        subtractWithPath.position.y = args.pathY;
        console.log(args)
        //subtractWithPath.scaling.x /= wickEditor.fabric.canvas.getZoom();
        //subtractWithPath.scaling.y /= wickEditor.fabric.canvas.getZoom();

        var modifiedStates = [];
        var modifiedObjects = [];
        paths.forEach(function (path) {
            var subtractedPath = path.paper.children[0].clone({insert:false});
            if(subtractedPath.closePath) subtractedPath.closePath();
            subtractedPath = subtractedPath.subtract(subtractWithPath.children[0]);

            path.svgX = subtractedPath.bounds._x;
            path.svgY = subtractedPath.bounds._y;

            var abs = wickEditor.project.currentObject.getAbsolutePosition();
            modifiedStates.push({
                x: subtractedPath.bounds._x + subtractedPath.bounds._width/2 - abs.x,
                y: subtractedPath.bounds._y + subtractedPath.bounds._height/2 - abs.y,
                pathData : '<svg id="svg" version="1.1" width="'+subtractedPath.bounds._width+'" height="'+subtractedPath.bounds._height+'" xmlns="http://www.w3.org/2000/svg">' +subtractedPath.exportSVG({asString:true})+ '</svg>'
            });
            modifiedObjects.push(path);
        });

        wickEditor.actionHandler.doAction('modifyObjects', {
            objs: modifiedObjects,
            modifiedStates: modifiedStates
        });
    }

    self.setFillColor = function (wickObjects, newColor) {

        var modifiedStates = [];
        var modifiedObjects = [];

        wickObjects.forEach(function (wickObject) {
            if(!wickObject.isPath) return;
            self.regenPaperJSState(wickObject);

            wickObject.paper.fillColor = newColor;

            modifiedStates.push({
                pathData : wickObject.paper.exportSVG({asString:true})
            });
            modifiedObjects.push(wickObject);
        });

        wickObjects.forEach(function (wickObject) {
            if(!wickObject.isText) return;

            modifiedStates.push({
                fill : newColor
            });
            modifiedObjects.push(wickObject);
        });

        wickEditor.actionHandler.doAction('modifyObjects', {
            objs: modifiedObjects,
            modifiedStates: modifiedStates
        });

    }

    self.setStrokeColor = function (wickObjects, newColor) {

        var modifiedStates = [];
        var modifiedObjects = [];

        wickObjects.forEach(function (wickObject) {
            if(!wickObject.isPath) return;
            self.regenPaperJSState(wickObject);

            wickObject.paper.strokeColor = newColor;

            modifiedStates.push({
                pathData : wickObject.paper.exportSVG({asString:true})
            });
            modifiedObjects.push(wickObject);
        });

        wickEditor.actionHandler.doAction('modifyObjects', {
            objs: modifiedObjects,
            modifiedStates: modifiedStates
        });

    }

    self.setStrokeWidth = function (wickObjects, newStrokeWidth) {

        var modifiedStates = [];
        var modifiedObjects = [];

        wickObjects.forEach(function (wickObject) {
            if(!wickObject.isPath) return;
            self.regenPaperJSState(wickObject);

            wickObject.paper.strokeWidth = newStrokeWidth;

            modifiedStates.push({
                pathData : wickObject.paper.exportSVG({asString:true})
            });
            modifiedObjects.push(wickObject);
        });

        wickEditor.actionHandler.doAction('modifyObjects', {
            objs: modifiedObjects,
            modifiedStates: modifiedStates
        });

    }

    self.regenPaperJSState = function (wickObject) {
        if(!wickObject.isPath/* && !wickObject.isImage*/) return;

        var xmlString = wickObject.pathData
          , parser = new DOMParser()
          , doc = parser.parseFromString(xmlString, "text/xml");

        //console.log(xmlString)

        wickObject.paper = paper.project.importSVG(doc, {insert:false});

        //console.log(wickObject.paper)
        if(wickObject.paper.children) {
            wickObject.paper.children.forEach(function (child) {
                // Convert all paper.Shapes into paper.Paths (Paths have boolean ops, Shapes do not)
                if(!(child instanceof paper.Path) && !(child instanceof paper.CompoundPath)) {
                    child.remove();
                    var newChild = child.toPath({insert:false});
                    newChild.clockwise = false;
                    wickObject.paper.addChild(newChild);
                }
            });
        }
        if(wickObject.paper.closePath) wickObject.paper.closePath();

        var absPos = wickObject.getAbsolutePosition() || {x:wickObject.x,y:wickObject.y};
        wickObject.paper.position.x = absPos.x;
        wickObject.paper.position.y = absPos.y;
    }

    self.refreshPathData = function (wickObject) {
        if(!wickObject.isPath/* && !wickObject.isImage*/) return;
        
        self.regenPaperJSState(wickObject);

        wickObject.paper.applyMatrix = true;
        wickObject.paper.rotate(wickObject.rotation);
        wickObject.paper.scaling.x = wickObject.scaleX;
        wickObject.paper.scaling.y = wickObject.scaleY;
        if(wickObject.flipX) {
            wickObject.paper.scale(-1, 1)
        }
        if(wickObject.flipY) {
            wickObject.paper.scale(1, -1)
        }

        wickObject.rotation = 0;
        wickObject.scaleX = 1;
        wickObject.scaleY = 1;
        wickObject.width = wickObject.paper.bounds._width;
        wickObject.height = wickObject.paper.bounds._height;
        wickObject.flipX = false;
        wickObject.flipY = false;

        wickObject.pathData = wickObject.paper.exportSVG({asString:true});

        wickObject.svgX = wickObject.paper.bounds._x;
        wickObject.svgY = wickObject.paper.bounds._y;

        var parentAbsPos;
        if(wickObject.parentObject)
            parentAbsPos = wickObject.parentObject.getAbsolutePosition();
        else 
            parentAbsPos = {x:0,y:0};

        //console.log(parentAbsPos)
        wickObject.x = wickObject.paper.position.x - parentAbsPos.x;
        wickObject.y = wickObject.paper.position.y - parentAbsPos.y;
    }

    self.refreshSVGWickObject = function (obj) {
        var path = obj;

        var parent = path.parent;
        var grandparent = parent.parent;

        var pathToModify;
        if(parent instanceof paper.Group) {
            pathToModify = parent;
        } else if (grandparent instanceof paper.Group) {
            pathToModify = grandparent;
        }

        var wickObject = pathToModify.wick;
        var parentAbsPos = wickObject.parentObject ? wickObject.parentObject.getAbsolutePosition() : {x:0,y:0};

        var modifiedStates = [{
            x: pathToModify.bounds._x + pathToModify.bounds._width /2 - parentAbsPos.x,
            y: pathToModify.bounds._y + pathToModify.bounds._height/2 - parentAbsPos.y,
            //pathData: '<svg id="svg" version="1.1" width="'+pathToModify.bounds._width+'" height="'+pathToModify.bounds._height+'" xmlns="http://www.w3.org/2000/svg">' +pathToModify.exportSVG({asString:true})+ '</svg>'
            pathData: pathToModify.exportSVG({asString:true})
        }];
        var modifiedObjects = [
            pathToModify.wick
        ];
        wickEditor.actionHandler.doAction('modifyObjects', {
            objs: modifiedObjects,
            modifiedStates: modifiedStates
        });
    }

    self.getProjectAsSVG = function () {
        paper.view.viewSize.width  = wickEditor.project.width;
        paper.view.viewSize.height = wickEditor.project.height;
        paper.view.matrix = new paper.Matrix();
        var url = "data:image/svg+xml;utf8," + encodeURIComponent(paper.project.exportSVG({asString:true}));
        var link = document.createElement("a");
        link.download = wickEditor.project.name + '.svg';
        link.href = url;
        link.click();

        paper.view.viewSize.width  = window.innerWidth;
        paper.view.viewSize.height = window.innerHeight;
    }

}
