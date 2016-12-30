/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/* This is the entry point for the whole editor */

var WickEditor = function () {

    var that = this;

    // Init random.js
    window.random = new Random();

    // Friendly console message ~~~
    console.log('%cWelcome to the javascript console! ', 'color: #ff99bb; font-size: 20px; font-weight: bold; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;');
    console.log('%cYou are free to change any of the internal editor stuff from here. Type "wickEditor" into the console and have a look around!', 'color: #bb4477; font-size: 12px;');

    // Setup connection to backend 
    this.backend = new WickDemoLoader(this);
    if(!this.backend.active) {
        this.project = WickProject.fromLocalStorage();
    } else { 
        this.project = new WickProject();
    }

    // Setup all interfaces
    this.syncInterfaces = function () {
        interfaces.forEach(function (interface) {
            interface.syncWithEditorState();
        });
    }

    var interfaces = [];
    function registerInterface (interface) {
        interfaces.push(interface);
        return interface;
    }

    this.builtinplayer = registerInterface(new BuiltinPlayerInterface(this));
    this.rightclickmenu = registerInterface(new RightClickMenuInterface(this));
    this.splashscreen = registerInterface(new SplashScreenInterface(this));
    this.scriptingide = registerInterface(new ScriptingIDEInterface(this));
    this.timeline = registerInterface(new TimelineInterface(this));
    this.toolbar = registerInterface(new ToolbarInterface(this));
    this.toolOptions = registerInterface(new ToolOptionsInterface(this));
    this.statusbar = registerInterface(new StatusBarInterface(this));
    this.properties = registerInterface(new PropertiesInterface(this));
    this.paper = registerInterface(new PaperInterface(this));
    this.fabric = registerInterface(new FabricInterface(this));
    this.menubar = registerInterface(new MenuBarInterface(this));

    interfaces.forEach(function (interface) {
        interface.setup();
    });

    this.inputHandler = new InputHandler(this);

    // Setup editor logic handlers
    this.actionHandler = new WickActionHandler(this);
    this.guiActionHandler = new GuiActionHandler(this);

    this.syncInterfaces();

}

