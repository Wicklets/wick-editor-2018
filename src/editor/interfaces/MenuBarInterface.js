/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var MenuBarInterface = function (wickEditor) {

    var editorElem = document.getElementById('editor');
    var menuElem = document.getElementById('menuBarGUI');

    var tabs;

	var Tab = function (name, buttons) {
        this.buttons = buttons;
        this.name = name;

        this.generateElem = function () {
            var self = this;

            var tabElem = document.createElement('div');
            tabElem.className = "menubarTab";
            tabElem.id = 'menubarMenu' + this.name;
            tabElem.innerHTML = this.name;
            tabElem.onclick = function () {
                closeAllMenus();
                self.elem.style.display = "block";
                self.elem.style.left = (tabElem.offsetLeft-15) + 'px';
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

    this.setup = function () {
        tabs = [];

        addTab('File', [
            new TabButton('New Project', function () {
                wickEditor.guiActionHandler.doAction("newProject");
            }),
            new TabButton('Save', function () {
                wickEditor.guiActionHandler.doAction("saveProject");
            }),
            new TabButton('Open', function () {
                wickEditor.guiActionHandler.doAction("openFile");
            }),
            new TabButton('Export', function () {
                wickEditor.guiActionHandler.doAction("exportProject");
            }),
        ]);

        addTab('Edit', [
            new TabButton('Undo', function () {
                wickEditor.guiActionHandler.doAction("undo")
            }),
            new TabButton('Redo', function () {
                wickEditor.guiActionHandler.doAction("redo")
            }),
            new TabButton('Delete', function () {
                wickEditor.guiActionHandler.doAction("deleteSelectedObjects")
            }),
            new TabButton('Clear History', function () {
                wickEditor.guiActionHandler.doAction("clearHistory")
            }),
        ]);

        addTab('Import', [
            new TabButton('File', function () {
                wickEditor.guiActionHandler.doAction("openFile");
            }),
        ]);

        addTab('Run', [
            new TabButton('Run project', function () {
                wickEditor.guiActionHandler.doAction("runProject");
            }),
        ]);

        addTab('About', [
            new TabButton('Wickeditor.com', function () {
                window.open('http://www.wickeditor.com/');
            }),
            new TabButton('Source code', function () {
                window.open('https://www.github.com/zrispo/wick/');
            }),
        ]);
    }

    var addTab = function (name, buttons) {
        var tab = new Tab(name, buttons);
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