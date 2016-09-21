/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var WickEditor = function () {

    var that = this;

/*********************************
    Initialize all editor vars
*********************************/

    console.log("WickEditor Pre-Alpha");

    this.mode = "normal";

    // Should move all the clubhouse to a backend system, this will also make it easy for other people to add their own backends.

    // Check to see if we need to load a project from GitHub's Clubhouse
    this.githubClubhouseProjectID = URLParameterUtils.getParameterByName("id");
    this.githubClubhouseProjectName = URLParameterUtils.getParameterByName("project");
    if (this.githubClubhouseProjectID) {
        console.log("Wick is in GitHub Clubhouse mode!");
        console.log("githubClubhouseProjectID: " + this.githubClubhouseProjectID);
        this.mode = "github-clubhouse";

        // Load project from github clubhouse server
        $.ajax({
            url: "/projects/1",
            type: 'GET',
            success: function(data) {
                console.log("ajax: success");
                var base64WickProject = data.split('<div id="wick_project">')[1].split('</div>')[0];
                var decodedProject = atob(base64WickProject);
                that.project = WickProject.fromWebpage(decodedProject);
                that.syncInterfaces();
            },
            error: function () {
                console.log("ajax: error")
            },
            complete: function(response, textStatus) {
                console.log("ajax: complete")
                console.log(response)
                console.log(textStatus)
            }
        });
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
        "toolOptions" : new ToolOptionsInterface(this),
        "menubar" : new MenuBarInterface(this),
        "properties" : new PropertiesInterface(this),
        "settings" : new SettingsInterface(this),
        "fabric" : new FabricInterface(this),
    };

    this.tools = {
        "cursor" : new CursorTool(this),
        "paintbrush" : new PaintbrushTool(this),
        "text" : new TextTool(this),
        "zoom" : new ZoomTool(this),
        "pan" : new PanTool(this)
    }

    this.interfaces.toolbar.loadTools();
    
    this.currentTool = this.tools['cursor'];

    this.syncInterfaces();

    this.inputHandler = new InputHandler(this);
    this.actionHandler = new WickActionHandler(this);

}

WickEditor.prototype.syncInterfaces = function () {
    for (var key in this.interfaces) {
        this.interfaces[key].syncWithEditorState();
    }
}

