/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var WickEditor = function () {

/*****************************
    Settings/Consts
*****************************/
    
    this.version = 'pre-alpha';

/*********************************
    Initialize all editor vars
*********************************/

    console.log("WickEditor rev " + this.version);

    this.tryToLoadAutosavedProject();

    this.fabricInterface = new FabricInterface(this);
    this.paperInterface = new PaperInterface(this);
    this.htmlInterface = new HTMLInterface(this);

    this.actionHandler = new WickActionHandler(this);

}

/*********************************
    
*********************************/

WickEditor.prototype.getSelectedWickObject = function () {
    var ids = this.fabricInterface.getSelectedObjectIDs();
    if(ids.length == 1) {
        return this.project.getObjectByID(ids[0]);
    } else {
        return null;
    }
}

WickEditor.prototype.getSelectedWickObjects = function () {
    var ids = this.fabricInterface.getSelectedObjectIDs();
    var wickObjects = [];
    for(var i = 0; i < ids.length; i++) {
        wickObjects.push(this.project.getObjectByID(ids[0]));
    }
    return wickObjects;
}

WickEditor.prototype.getCopyData  = function () {
    var ids = this.fabricInterface.getSelectedObjectIDs();
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

/**********************************
  Interfaces
**********************************/

WickEditor.prototype.syncInterfaces = function () {
    this.paperInterface.syncWithEditorState();
    this.fabricInterface.syncWithEditorState();
    this.htmlInterface.syncWithEditorState();

    this.fabricInterface.resize();
}

/**********************************
  Project Open/Save/Import/Export
**********************************/

WickEditor.prototype.tryToLoadAutosavedProject = function () {

    if(!localStorage) {
        console.error("LocalStorage not available. Loading blank project");
        this.project = new WickProject();
        return;
    }

    VerboseLog.log("Loading project from local storage...");
    var autosavedProjectJSON = localStorage.getItem('wickProject');

    if(!autosavedProjectJSON) {
        VerboseLog.log("No autosaved project. Loading blank project.");
        this.project = new WickProject();
        return;
    }

    this.project = WickProject.fromJSON(autosavedProjectJSON);

}

WickEditor.prototype.newProject = function () {

    if(!confirm("Create a new project? All unsaved changes to the current project will be lost!")) {
        return;
    }

    this.project = new WickProject();
    this.currentObject = this.project.rootObject;

    this.fabricInterface.deselectAll();

    this.fabricInterface.resize();
    this.fabricInterface.syncWithEditorState();
    this.paperInterface.syncWithEditorState();
    this.htmlInterface.syncWithEditorState();

}

WickEditor.prototype.openProject = function (projectJSON) {

    this.project = WickProject.fromJSON(projectJSON);
    this.currentObject = this.project.rootObject;
    this.currentObject.currentFrame = 0;
    this.fabricInterface.resize();
    this.fabricInterface.syncWithEditor();
    this.htmlInterface.syncWithEditor();

}

WickEditor.prototype.exportProjectAsJSON = function () {

    this.syncEditorWithfabricInterface();
    this.project.exportAsJSONFile();

}

WickEditor.prototype.exportProjectAsWebpage = function () {

    this.syncEditorWithfabricInterface();
    this.project.exportAsHTMLFile();

}

/*************************
      Builtin player
*************************/

WickEditor.prototype.runProject = function () {
    var that = this;

    if(this.htmlInterface.projectHasErrors) {
        if(!confirm("There are syntax errors in the code of this project! Are you sure you want to run it?")) {
            return;
        }
    }

    // JSONify the project, autosave, and have the builtin player run it
    this.project.getAsJSON(function (JSONProject) {
        that.htmlInterface.showBuiltinPlayer();
        WickPlayer.runProject(JSONProject);
    });
}

