/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var WickEditor = function () {

    var that = this;

/*********************************
    Initialize all editor vars
*********************************/
    
    // Friendly console message ~~~
    console.log('%cWelcome to the javascript console! ', 'color: #ff99bb; font-size: 20px; font-weight: bold; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;');
    console.log('%cYou are free to change any of the internal editor stuff from here. Try typing "wickEditor" into the console and have a look around!', 'color: #bb4477; font-size: 12px;');

    this.backend = new WickHostBackend(this);
    if(!this.backend.active) {
        this.project = WickProject.fromLocalStorage();
    } else { 
        this.project = new WickProject();
    }
    
    this.interfaces = {
        "builtinplayer" : new BuiltinPlayerInterface(this),
        "rightclickmenu" : new RightClickMenuInterface(this),
        "splashscreen" : new SplashScreenInterface(this),
        "scriptingide" : new ScriptingIDEInterface(this),
        "timeline" : new TimelineInterface(this),
        "toolbar" : new ToolbarInterface(this),
        "toolOptions" : new ToolOptionsInterface(this),
        "statusbar" : new StatusBarInterface(this),
        "properties" : new PropertiesInterface(this),
        "settings" : new SettingsInterface(this),
        "fabric" : new FabricInterface(this),
        "paper" : new PaperInterface(this),
    };
    for (var key in this.interfaces) {
        this.interfaces[key].setup();
    }

    this.inputHandler = new InputHandler(this);
    this.actionHandler = new WickActionHandler(this);
    this.guiActionHandler = new GuiActionHandler(this);

    this.syncInterfaces();

}

WickEditor.prototype.syncInterfaces = function (interfacesToSync) {
    var that = this;

    if(interfacesToSync) {
        interfacesToSync.forEach(function (interfaceName) {
            that.interfaces[interfaceName].syncWithEditorState();
        });
    } else {
        for (var key in this.interfaces) {
            this.interfaces[key].syncWithEditorState();
        }
    }
}

// Setup leave page warning
window.addEventListener("beforeunload", function (event) {
    var confirmationMessage = 'Warning: All unsaved changes will be lost!';
    (event || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
});

