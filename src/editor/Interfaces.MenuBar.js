/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var MenuBarInterface = function (wickEditor) {

    var editorElem = document.getElementById('editor');
    var menuElem = document.getElementById('menuBarGUI');

    var tabs;

	var Tab = function (name, buttons, func) {
        this.buttons = buttons;
        this.name = name;

        this.generateElem = function () {
            var self = this;

            var tabElem = document.createElement('div');
            tabElem.className = "menubarTab";
            tabElem.id = 'menubarMenu' + this.name;
            tabElem.innerHTML = this.name;
            tabElem.onclick = function () {
                if(func) {
                    func();
                    return;
                }
                var visible = self.elem.style.display === "block";
                closeAllMenus();
                if(visible) {
                    self.elem.style.display = "none";
                } else {
                    self.elem.style.display = "block";
                }
                self.elem.style.left = (tabElem.offsetLeft-5) + 'px';
            }
            menuElem.appendChild(tabElem);

            this.elem = document.createElement('div');
            this.elem.className ='GUIBox menubarMenu';
            this.elem.id = 'menubarMenuDropdown' + this.name;
            this.elem.style.display = 'none';

            this.buttons.forEach(function (button) {
                button.generateElem();
                self.elem.appendChild(button.elem);
            });
            editorElem.appendChild(this.elem);
        }
    }

    var TabButton = function (name, func) {
        this.name = name;
        this.func = func;

        this.generateElem = function () {
            this.elem = document.createElement('div');
            this.elem.className ='menubarButton';
            this.elem.id = 'menubarMenu' + this.name;
            this.elem.innerHTML = this.name;
            this.elem.onclick = function () {
                closeAllMenus();
                func();
            }
        }
    }

    var TabSpacer = function () {
        this.generateElem = function () {
            this.elem = document.createElement('hr');
        }
    }

    this.setup = function () {
        tabs = [];

        wickEditor.fabric.canvas.on('mouse:down', function (e) {
            closeAllMenus();
        })

        addTab('File', [
            new TabButton('New Project', function () {
                wickEditor.guiActionHandler.doAction("newProject");
            }),
            new TabButton('Save', function () {
                wickEditor.guiActionHandler.doAction("exportProject");
            }),
            new TabButton('Open', function () {
                wickEditor.guiActionHandler.doAction("openFile");
            }),
            new TabSpacer(),
            /*new TabButton('Export as webpage', function () {
                wickEditor.guiActionHandler.doAction("exportProject");
            }),*/
            new TabButton('Export as zip', function () {
                wickEditor.guiActionHandler.doAction("exportProjectZIP");
            }),
            new TabButton('Export as gif', function () {
                wickEditor.guiActionHandler.doAction("exportProjectGIF");
            }),
            new TabButton('Export as WebM', function () {
                wickEditor.guiActionHandler.doAction("exportProjectWebM");
            }),
        ]);

        addTab('Edit', [
            new TabButton('Undo', function () {
                wickEditor.guiActionHandler.doAction("undo")
            }),
            new TabButton('Redo', function () {
                wickEditor.guiActionHandler.doAction("redo")
            }),
            new TabSpacer(),
            new TabButton('Copy', function () {
                wickEditor.guiActionHandler.doAction("copy")
            }),
            new TabButton('Cut', function () {
                wickEditor.guiActionHandler.doAction("cut")
            }),
            new TabButton('Paste', function () {
                wickEditor.guiActionHandler.doAction("paste")
            }),
            new TabButton('Delete', function () {
                wickEditor.guiActionHandler.doAction("deleteSelectedObjects")
            }),
        ]);

        addTab('Selection', [
            new TabButton('Flip horizontally', function () {
                wickEditor.guiActionHandler.doAction("flipHorizontally")
            }),
            new TabButton('Flip vertically', function () {
                wickEditor.guiActionHandler.doAction("flipVertically")
            }),
            new TabButton('Bring to Front', function () {
                wickEditor.guiActionHandler.doAction("bringToFront")
            }),
            new TabButton('Send to Back', function () {
                wickEditor.guiActionHandler.doAction("sendToBack")
            }),
            new TabSpacer(),
            new TabButton('Convert to Symbol', function () {
                wickEditor.guiActionHandler.doAction("convertToSymbol")
            }),
            new TabButton('Break apart', function () {
                wickEditor.guiActionHandler.doAction("breakApart")
            }),
            new TabSpacer(),
            new TabButton('Edit Scripts', function () {
                wickEditor.guiActionHandler.doAction("editScripts")
            }),
            new TabSpacer(),
            new TabButton('Export', function () {
                wickEditor.guiActionHandler.doAction("downloadObject")
            }),
        ]);

        addTab('Add', [
            new TabButton('Text', function () {
                wickEditor.tools.text.addText();
            }),
            new TabButton('File', function () {
                wickEditor.guiActionHandler.doAction("openFile");
            }),
        ]);

        addTab('Run', [], function () {
            wickEditor.guiActionHandler.doAction("runProject");
        });

        addTab('About', [
            new TabButton('Wickeditor.com', function () {
                window.open('http://www.wickeditor.com/');
            }),
            new TabButton('Source code', function () {
                window.open('https://www.github.com/zrispo/wick/');
            }),
        ]);
    }

    var addTab = function (name, buttons, func) {
        var tab = new Tab(name, buttons, func);
        tab.generateElem();
        tabs.push(tab);
    }

    var closeAllMenus = function () {
        tabs.forEach(function (tab) {
            tab.elem.style.display = "none";
        })
    }

    this.syncWithEditorState = function () {
        
    }

}