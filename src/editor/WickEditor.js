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
    this.project = WickProject.fromLocalStorage();
    
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
    };

    this.tools = {
        "cursor" : new CursorTool(this),
        "paintbrush" : new PaintbrushTool(this),
        "fillbucket" : new FillBucketTool(this),
        "rectangle" : new RectangleTool(this),
        "ellipse" : new EllipseTool(this),
        "dropper" : new DropperTool(this),
        "text" : new TextTool(this),
        "zoom" : new ZoomTool(this),
        "pan" : new PanTool(this)
    }

    this.changeTool = function (newTool) {
        that.lastTool = that.currentTool;
        that.currentTool = newTool;
        that.interfaces.fabric.forceModifySelectedObjects();
        that.interfaces.fabric.deselectAll();
        that.syncInterfaces();
    }

    this.currentTool = this.tools['cursor'];
    this.lastTool = this.currentTool;

    this.syncInterfaces();

    this.inputHandler = new InputHandler(this);
    this.actionHandler = new WickActionHandler(this);
    this.guiActionHandler = new GuiActionHandler(this);

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

