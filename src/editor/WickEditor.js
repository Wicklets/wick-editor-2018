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

    self.version = "0.15";
    document.getElementById('wick-editor-version').innerHTML = 'Wick Editor ' + self.version;
    console.log("Wick Editor version " + self.version)
    window.wickVersion = self.version;

    // Friendly console message ~~~
    console.log('%cWelcome to the javascript console! ', 'color: #ff99bb; font-size: 20px; font-weight: bold; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;');
    console.log('%cYou are free to change any of the internal editor stuff from here.', 'color: #7744bb; font-size: 12px;');
    console.log('%cTry typing "wickEditor" into the console to see some stuff!.', 'color: #22bb99; font-size: 12px;');

    // Setup init project
    this.project = new WickProject();

    // Load settings
    this.settings = new WickEditorSettings();

    // Load audio player and renderer
    this.fastRenderer = new WickPixiRenderer(document.getElementById('previewRenderContainer'));
    this.audioPlayer = new WickHowlerAudioPlayer(this.project);

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
    this.canvas = registerInterface(new CanvasInterface(this));
    this.inspector = registerInterface(new InspectorInterface(this));
    this.rightclickmenu = registerInterface(new RightClickMenuInterface(this));
    this.menubar = registerInterface(new MenuBarInterface(this));
    this.breadcrumbs = registerInterface(new BreadcrumbsInterface(this));
    this.alertbox = registerInterface(new AlertBoxInterface(this));
    this.cursorIcon = registerInterface(new CursorIconInterface(this));
    this.colorPicker = registerInterface(new ColorPickerInterface(this));
    this.editorSettings = registerInterface(new EditorSettings(this));
    this.editorCredits = registerInterface(new EditorCredits(this));
    this.textEditBox = registerInterface(new TextEditBox(this));
    this.videoExporter = registerInterface(new VideoExporterInterface(this)); 

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

    // This is put after the first sync so the page loads before the editor asks to load a project
    // (and we gotta wait a little bit before loading it ... we want to make sure the editor is ready)
    setTimeout(function () {
        self.tryToLoadProject();
    }, 100);

}

WickEditor.prototype.syncInterfaces = function () {
    var enablePerfTests = false;
    if(enablePerfTests) {
        console.log('---------Begin timing sync-------')
    }

    //startTiming();

    this.project.applyTweens();

    if(!this.tools) return;
    this.interfaces.forEach(function (interface) {
        if(enablePerfTests) startTiming();
        interface.syncWithEditorState();
        if(enablePerfTests) {
            stopTiming('interface:');
            console.log(interface.__proto__.constructor)
            //console.log(' ')
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

WickEditor.prototype.tryToLoadProject = function () {
    // Load .wick from hash - for new site 
    /*if(window.location.hash) {
        var projectPath = window.location.hash.slice(1); // remove first char (the hash)

        var xhr = new XMLHttpRequest();
        xhr.open('GET', projectPath, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function(e) {
          if (this.status == 200) {
            var byteArray = new Uint8Array(this.response);
            var wickProjectJSON = LZString.decompressFromUint8Array(byteArray);
            var wickProject = WickProject.fromJSON(wickProjectJSON, true);
            wickEditor.guiActionHandler.doAction('openProject', {
                project:wickProject,
                dontWarn: true
            });
          }
        };

        xhr.send();
    } else {
        WickProject.Exporter.getAutosavedProject(function (project) {
            wickEditor.guiActionHandler.doAction('openProject', {
                project: project,
                dontWarn: true
            })
        });
    }
    window.location.hash = '';*/

    var demoName = URLParameterUtils.getParameterByName("demo");
    if(demoName) {
        console.log("Trying to load demo:");
        console.log("demoName: " + demoName);

        $.ajax({
            url: "../examples/" + demoName,
            type: 'GET',
            data: {},
            success: function(data) {
                console.log("ajax: success");
                if(data === "NEW_PROJECT") {
                    wickEditor.project = new WickProject();
                } else {
                    //wickEditor.project = WickProject.fromWebpage(data);
                    wickEditor.guiActionHandler.doAction('openProject', {
                        project:WickProject.fromJSON(JSON.stringify(data)),
                        dontWarn: true
                    })
                }
                wickEditor.syncInterfaces();
            },
            error: function () {
                console.log("ajax: error");
                wickEditor.syncInterfaces();
            },
            complete: function(response, textStatus) {
                console.log("ajax: complete")
                console.log(response)
                console.log(textStatus)
                URLParameterUtils.clearURLParam("demo")
            }
        });
    } else {
        WickProject.Exporter.getAutosavedProject(function (project) {
            wickEditor.guiActionHandler.doAction('openProject', {
                project: project,
                dontWarn: true
            })
        });
    }
}
