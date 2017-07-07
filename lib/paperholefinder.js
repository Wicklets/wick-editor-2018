// tiny utility function for finding holes in a paper.js project
// made by zripo for the wick drawing tools

var PaperHoleFinder = (function () {

    // Return the smallest hole in paperProject that contains a given position
    function getHoleAtPosition (paperProject, position, args) {
        var holesInProject = getHolesInProject(paperProject);
        var holesContainingPoint = getHolesContainingPoint(holesInProject, position);

        if(holesContainingPoint.length === 0) {
            return null;
        } else {
            return holesContainingPoint[0];
        }
    }

    // Return all "holes" created by paths in paperProject
    function getHolesInProject (paperProject) {
        var superPath = getProjectAsSinglePath(paperProject);
        var holes = getAllHolesInPath(superPath);

        return holes;
    }

    // Unites all paths in paperProject into one super path
    function getProjectAsSinglePath (paperProject) {

    }

    // Returns all holes created by a given path's children
    function getAllHolesInPath (path) {

    }

    // Returns holes that contain the given point in order of size, smallest first
    function getHolesContainingPoint (point) {

    }

    // Export main function
    var paperHoleFinder = {};
    paperHoleFinder.getHoleAtPosition = getHoleAtPosition;
    return paperHoleFinder;
})();
