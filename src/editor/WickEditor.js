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

/* This is the entry point for the whole editor */

var WickEditor = function () {

    var self = this;

    // http://semver.org/
    self.version = "0.12";
    document.getElementById('wick-editor-version').innerHTML = 'Wick Editor ' + self.version;
    console.log("Wick Editor version " + self.version)
    if(localStorage.wickVersion !== self.version) {
        // Wick has either
        //   (1) never been used on this machine/browser or
        //   (2) wick updated since it was last used on this machine/browser
        // So we need to show the update message screen!
        // (We don't have an update message screen yet, so just console.log)
        localStorage.wickVersion = self.version;
        console.log("Looks like wick updated! See the update notes here: http://wickeditor.com/#updates");
    }
    window.wickVersion = self.version;

    // Friendly console message ~~~
    console.log('%cWelcome to the javascript console! ', 'color: #ff99bb; font-size: 20px; font-weight: bold; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;');
    console.log('%cYou are free to change any of the internal editor stuff from here.', 'color: #7744bb; font-size: 12px;');
    console.log('%cTry typing "wickEditor" into the console to see some stuff!.', 'color: #22bb99; font-size: 12px;');

    // Setup demo loader for website
    this.demoLoader = new WickDemoLoader(this);

    // Setup init project
    this.project = new WickProject();

    // Load settings
    this.settings = new WickEditorSettings();

    // Load all interfaces
    this.interfaces = [];
    function registerInterface (interface) {
        self.interfaces.push(interface);
        return interface;
    }
    this.builtinplayer = registerInterface(new BuiltinPlayerInterface(this));
    this.scriptingide = registerInterface(new ScriptingIDEInterface(this));
    this.timeline = registerInterface(new TimelineInterface(this));
    this.library = registerInterface(new LibraryInterface(this));
    this.toolbar = registerInterface(new ToolbarInterface(this));
    this.inspector = registerInterface(new InspectorInterface(this));
    this.rightclickmenu = registerInterface(new RightClickMenuInterface(this));
    this.canvas = registerInterface(new CanvasInterface(this));
    this.menubar = registerInterface(new MenuBarInterface(this));
    this.breadcrumbs = registerInterface(new BreadcrumbsInterface(this));
    this.alertbox = registerInterface(new AlertBoxInterface(this));
    this.cursorIcon = registerInterface(new CursorIconInterface(this));
    this.colorPicker = registerInterface(new ColorPickerInterface(this));
    this.editorSettings = registerInterface(new EditorSettings(this));
    this.textEditBox = registerInterface(new TextEditBox(this));

    // Setup editor logic handlers
    this.actionHandler = new WickActionHandler(this);
    this.guiActionHandler = new GuiActionHandler(this);

    // Load all tools
    this.tools = {};
    this.tools.selectioncursor = new Tools.SelectionCursor(this);
    this.tools.vectorcursor = new Tools.VectorCursor(this);
    this.tools.paintbrush = new Tools.Paintbrush(this);
    this.tools.pencil = new Tools.Pencil(this);
    this.tools.eraser = new Tools.Eraser(this);
    this.tools.fillbucket = new Tools.FillBucket(this);
    this.tools.rectangle = new Tools.Rectangle(this);
    this.tools.ellipse = new Tools.Ellipse(this);
    this.tools.line = new Tools.Line(this);
    this.tools.pen = new Tools.Pen(this);
    this.tools.dropper = new Tools.Dropper(this);
    this.tools.text = new Tools.Text(this);
    this.tools.zoom = new Tools.Zoom(this);
    this.tools.pan = new Tools.Pan(this);
    
    this.currentTool = this.tools.selectioncursor;
    this.lastTool = this.currentTool;

    // Setup all tools + interfaces
    this.interfaces.forEach(function (interface) {
        interface.setup();
    });
    for(tool in this.tools) {
        this.tools[tool].setup();
    };

    // Setup inputhandler
    this.inputHandler = new InputHandler(this);

    self.syncInterfaces();

    // This is put after the first sync so the page loads before the editor asks to load an autosaved project
    // (and we gotta wait a little bit before loading it ... we want to make sure the editor is ready)
    setTimeout(function () {
        if(!self.demoLoader.active) {
            WickProject.Exporter.getAutosavedProject(function (project) {
                wickEditor.guiActionHandler.doAction('openProject', {
                    project: project,
                    dontWarn: true
                })
            });
        }
    }, 100);

}

WickEditor.prototype.syncInterfaces = function () {
    var enablePerfTests = false;

    //startTiming();

    this.project.applyTweens();

    if(!this.tools) return;
    this.interfaces.forEach(function (interface) {
        if(enablePerfTests) startTiming();
        interface.syncWithEditorState();
        if(enablePerfTests) {
            stopTiming('interface:');
            console.log(interface)
            console.log(' ')
        }
    });

    //console.log(new Error())
    //stopTiming('total sync')
}

WickEditor.prototype.changeTool = function (newTool) {
    this.lastTool = this.currentTool;
    if(this.lastTool.onDeselected) this.lastTool.onDeselected();
    this.currentTool = newTool;
    if(newTool.onSelected) newTool.onSelected();

    this.syncInterfaces();

    this.guiActionHandler.doAction('previewPause');
}

WickEditor.prototype.useLastUsedTool = function () {
    this.currentTool = this.lastTool;
}
