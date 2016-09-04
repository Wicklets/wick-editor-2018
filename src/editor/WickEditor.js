/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var WickEditor = function () {

/*********************************
    Initialize all editor vars
*********************************/

    console.log("WickEditor Pre-Alpha");

    this.currentTool = new WickTool();
    this.currentTool.type = "cursor";

    this.mode = "normal";

    // Check to see if we need to load a project from GitHub's Clubhouse
    var githubClubhouseProjectID = URLParameterUtils.getParameterByName("project");
    if (githubClubhouseProjectID) {
        console.log("Wick is in GitHub Clubhouse mode!");
        console.log("githubClubhouseProjectID: " + githubClubhouseProjectID);
        this.mode = "github-clubhouse";
        this.project = new WickProject(); // TODO: load project from github clubhouse server
    } else {
        this.project = WickProject.fromLocalStorage();
    }

    this.runningBuiltinPlayer = false;

    this.interfaces = {
        "builtinplayer" : new BuiltinPlayerInterface(this),
        "tooltips" : new TooltipsInterface(this),
        "rightclickmenu" : new RightClickMenuInterface(this),
        "splashscreen" : new SplashScreenInterface(this),
        "scriptingide" : new ScriptingIDEInterface(this),
        "timeline" : new TimelineInterface(this),
        "toolbar" : new ToolbarInterface(this),
        "menubar" : new MenuBarInterface(this),
        "properties" : new PropertiesInterface(this),
        "settings" : new SettingsInterface(this),
        "fabric" : new FabricInterface(this)
    };

    this.syncInterfaces();

    this.inputHandler = new InputHandler(this);
    this.actionHandler = new WickActionHandler(this);

}

WickEditor.prototype.syncInterfaces = function () {
    for (var key in this.interfaces) {
        this.interfaces[key].syncWithEditorState();
    }
}

/*********************************
    WickObjects
*********************************/

// This should be in FabricInterface, dummy!

WickEditor.prototype.getSelectedWickObject = function () {
    var ids = this.interfaces['fabric'].getSelectedObjectIDs();
    if(ids.length == 1) {
        return this.project.getObjectByID(ids[0]);
    } else {
        return null;
    }
}

WickEditor.prototype.getSelectedWickObjects = function () {
    var ids = this.interfaces['fabric'].getSelectedObjectIDs();
    var wickObjects = [];
    for(var i = 0; i < ids.length; i++) {
        wickObjects.push(this.project.getObjectByID(ids[i]));
    }
    return wickObjects;
}

WickEditor.prototype.getWickObjectByID = function (id) {
    return this.project.rootObject.getChildByID(id);
}

WickEditor.prototype.getCopyData  = function () {
    var ids = this.interfaces['fabric'].getSelectedObjectIDs();
    var objectJSONs = [];
    for(var i = 0; i < ids.length; i++) {
        objectJSONs.push(this.project.getObjectByID(ids[i]).getAsJSON());
    }
    var clipboardObject = {
        /*position: {top  : group.top  + group.height/2, 
                   left : group.left + group.width/2},*/
        groupPosition: {x : 0, 
                        y : 0},
        wickObjectArray: objectJSONs
    }
    return JSON.stringify(clipboardObject);
}

