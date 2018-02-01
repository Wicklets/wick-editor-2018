// tiny utility function for finding holes in a paper.js project
// made by zripo for the wick drawing tools

var PaperHoleFinder = (function () {

    // Return the shape of the smallest hole in 'paperProject' 
    // that would be created by clicking the mouse at 'point'.
    function getHoleShapeAtPosition (paperProject, point) {
        var path = getProjectAsSinglePath(paperProject);
        var holeShapes = getHolesOfPathAsShapes(path);
        var filledHoleShape = getSmallestShapeContainingPoint(path, holeShapes, point);

        return filledHoleShape;
    }

    // Unites all paths in paperProject into one super path
    function getProjectAsSinglePath (paperProject) {
        var allPathsInProject = paperProject.getActiveLayer().children;

        // This fixes the bug where fill bucket would fill holes created by objects on different layers
        var projectCurrentLayer = wickEditor.project.getCurrentLayer();
        allPathsInProject = allPathsInProject.filter(function (path) {
            return path.wick.parentFrame.parentLayer === projectCurrentLayer;
        })

        var superPath = allPathsInProject[0].children[0].clone({insert:false});

        // Unite all paths together into a superpath.
        for(var i = 1; i < allPathsInProject.length; i++) {
            var path = allPathsInProject[i];
            if(superPath.closePath) superPath.closePath();
            path.children.forEach(function (child) {
                if(child.closePath) child.closePath();
            });
            superPath = superPath.unite(path);
        }

        return superPath;
    }

    // Returns shapes of all holes of a given path
    function getHolesOfPathAsShapes (path) {
        var holeShapes = [];

        // Get an inverted version of the path by subtracting it from a giant rectangle.
        var hugeRectangle = new paper.Path.Rectangle(new paper.Point(-1000,-1000), new paper.Size(2000,2000));
        var negativeSpace = hugeRectangle.subtract(path);
        hugeRectangle.remove();
        negativeSpace.remove();

        // Convert holes into paths representing the shapes of the holes.
        negativeSpace.children.forEach(function (child) {
            if(child.clockwise && child.area !== 4000000) {
                var clone = child.clone({insert:false});
                var group = new paper.Group({insert:false});
                group.addChild(clone);
                clone.clockwise = false;
                clone.fillColor = 'green';
                group.fillRule = 'evenodd';
                //paper.project.getActiveLayer().addChild(clone);
                holeShapes.push(clone);
            }
        });

        return holeShapes;
    }

    // Returns smallest shape from 'shapes' that contains 'point'
    // Needs the original path shape and the shapes of its holes.
    // Returns null if no holes contain the point.
    function getSmallestShapeContainingPoint (originalPathShape, holeShapes, point) {
        var shapesContainingPoint = getShapesContainingPoint(holeShapes, point);
        if(shapesContainingPoint.length === 0) {
            // No shapes contained the point.
            return null;
        } else {
            // >=1 shapes contain the point - process the smallest one and return it.
            var smallestShape = shapesContainingPoint[0];
            return removeSubholesFromHoleShape(smallestShape, originalPathShape, holeShapes);
        }
    }

    // Returns shapes from 'shapes' that contain 'point' in order from smallest to largest
    function getShapesContainingPoint (shapes, point) {
        var shapesContainingPoint = [];

        shapes.forEach(function (shape) {
            if(shape.contains(point)) {
                shapesContainingPoint.push(shape);
            }
        });

        shapesContainingPoint.sort(function (a,b) {
            return b.area-a.area;
        });

        return shapesContainingPoint;
    }

    function removeSubholesFromHoleShape (holeShape, originalPathShape, holeShapes) {
        //console.log('removeSubholesFromHoleShape')

        var holeShapeSubholesRemoved = holeShape;
        holeShapes.forEach(function (holeShapeToSubtract) {
            if(holeShapeToSubtract.area === holeShapeSubholesRemoved.area) return;
            if(holeShapeToSubtract.area < holeShapeSubholesRemoved.area) return;
            holeShapeSubholesRemoved = holeShapeSubholesRemoved.subtract(holeShapeToSubtract);
        });

        var holeShapeOriginalPathRemoved = holeShapeSubholesRemoved.subtract(originalPathShape);
        
        return holeShapeOriginalPathRemoved;
    }

    function expandHole (path) {
        var HOLE_EXPAND_AMT = -0.4;

        var children;
        if(path instanceof paper.Path) {
            children = [path];
        } else if(path instanceof paper.CompoundPath) {
            children = path.children;
        }

        children.forEach(function (hole) {
            var normals = [];
            hole.closePath();
            hole.segments.forEach(function (segment) {
                var a = segment.previous.point;
                var b = segment.point;
                var c = segment.next.point;

                var ab = {x: b.x-a.x, y: b.y-a.y};
                var cb = {x: b.x-c.x, y: b.y-c.y};

                var d = {x: ab.x-cb.x, y: ab.y-cb.y};
                d.h = Math.sqrt((d.x*d.x)+(d.y*d.y));
                d.x /= d.h;
                d.y /= d.h;

                d = rotate_point(d.x, d.y, 0, 0, 90);

                normals.push({x:d.x,y:d.y});
            });

            for (var i = 0; i < hole.segments.length; i++) {
                var segment = hole.segments[i];
                var normal = normals[i];
                segment.point.x += normal.x*-HOLE_EXPAND_AMT;
                segment.point.y += normal.y*-HOLE_EXPAND_AMT;
            }
        });
    }

    // http://www.felixeve.co.uk/how-to-rotate-a-point-around-an-origin-with-javascript/
    function rotate_point(pointX, pointY, originX, originY, angle) {
        angle = angle * Math.PI / 180.0;
        return {
            x: Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
            y: Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY
        };
    }

    // Export main function
    var paperHoleFinder = {};
    paperHoleFinder.getHoleShapeAtPosition = getHoleShapeAtPosition;
    paperHoleFinder.expandHole = expandHole;
    return paperHoleFinder;
})();
