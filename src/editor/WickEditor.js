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

    var that = this;

    // Friendly console message ~~~
    console.log('%cWelcome to the javascript console! ', 'color: #ff99bb; font-size: 20px; font-weight: bold; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;');
    console.log('%cYou are free to change any of the internal editor stuff from here.', 'color: #7744bb; font-size: 12px;');

    // Setup connection to backend 
    this.backend = new WickDemoLoader(this);
    if(!this.backend.active) {
        this.project = WickProject.fromLocalStorage();
    } else { 
        this.project = new WickProject();
    }

    // Load all interfaces
    this.interfaces = [];
    function registerInterface (interface) {
        that.interfaces.push(interface);
        return interface;
    }

    this.thumbnailRenderer = registerInterface(new ThumbnailRendererInterface(this));
    this.gifRenderer = registerInterface(new GIFRendererInterface(this));
    this.builtinplayer = registerInterface(new BuiltinPlayerInterface(this));
    this.rightclickmenu = registerInterface(new RightClickMenuInterface(this));
    this.scriptingide = registerInterface(new ScriptingIDEInterface(this));
    this.timeline = registerInterface(new TimelineInterface(this));
    this.toolbar = registerInterface(new ToolbarInterface(this));
    this.properties = registerInterface(new PropertiesInterface(this));
    this.paper = registerInterface(new PaperInterface(this));
    this.fabric = registerInterface(new FabricInterface(this));
    this.menubar = registerInterface(new MenuBarInterface(this));

    // Load all tools
    this.tools = {
        "cursor"           : new Tools.Cursor(this),
        "paintbrush"       : new Tools.Paintbrush(this),
        //"eraser"           : new Tools.Eraser(this),
        //"fillbucket"       : new Tools.FillBucket(this),
        "rectangle"        : new Tools.Rectangle(this),
        "ellipse"          : new Tools.Ellipse(this),
        "dropper"          : new Tools.Dropper(this),
        "text"             : new Tools.Text(this),
        "zoom"             : new Tools.Zoom(this),
        "pan"              : new Tools.Pan(this),
    }
    this.currentTool = this.tools.cursor;
    this.lastTool = this.currentTool;

    // Setup all tools + interfaces
    this.interfaces.forEach(function (interface) {
        interface.setup();
    });
    for(tool in this.tools) {
        this.tools[tool].setup();
    };

    // Setup editor logic handlers
    this.actionHandler = new WickActionHandler(this);
    this.guiActionHandler = new GuiActionHandler(this);

    // Setup inputhandler
    this.inputHandler = new InputHandler(this);

    // Setup renderer
    window.rendererCanvas = document.getElementById('playerCanvasContainer');
    if(!window.wickRenderer) {
        window.wickRenderer = new WickPixiRenderer();
        window.wickRenderer.setProject(that.project);
        window.wickRenderer.setup();
    }

    this.syncInterfaces();

}

WickEditor.prototype.syncInterfaces = function () {
    if(!this.tools) return;
    this.interfaces.forEach(function (interface) {
        interface.syncWithEditorState();
    });
}

WickEditor.prototype.changeTool = function (newTool) {
    this.lastTool = this.currentTool;
    this.currentTool = newTool;
    this.fabric.forceModifySelectedObjects();
    this.fabric.deselectAll();
    this.syncInterfaces();

    if((this.lastTool instanceof Tools.Paintbrush) || 
       (this.lastTool instanceof Tools.Eraser) || 
       (this.lastTool instanceof Tools.Ellipse) || 
       (this.lastTool instanceof Tools.Rectangle)) {
        //console.error("Cleanup paths call goes here!");
    }
}

WickEditor.prototype.useLastUsedTool = function () {
    this.currentTool = this.lastTool;
}