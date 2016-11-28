/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var MenuBarInterface = function (wickEditor) {

    var editorElem = document.getElementById('editor');
    var menuElem = document.getElementById('menuBarGUI');

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
                console.log("mouseover")
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
            this.elem.onclick = func;
        }
    }

    this.setup = function () {
        this.tabs = [];

        this.addTab('File', [
            new TabButton('Open', function () {
                alert("Open clicked!");
            }),
            new TabButton('Export', function () {
                alert("Export clicked!");
            }),
        ]);

        this.addTab('Edit', [
            new TabButton('Open2', function () {
                alert("Open clicked!");
            }),
        ]);
    }

    this.addTab = function (name, buttons) {
        var tab = new Tab(name, buttons);
        tab.generateElem();
        this.tabs.push(tab);
    }

    this.syncWithEditorState = function () {
        
    }

}