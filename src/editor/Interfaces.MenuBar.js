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
    
var MenuBarInterface = function (wickEditor) {

    var editorElem;
    var menuElem;
    var projectNameElem;
    var projectSettingsElem;

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
                self.elem.style.left = (tabElem.offsetLeft-8) + 'px';
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
        editorElem = document.getElementById('editor');
        
        menuElem = document.createElement('div');
        menuElem.id = "menuBarGUI";
        menuElem.className = "GUIBox";
        editorElem.appendChild(menuElem);

        projectNameElem = document.createElement('div');
        projectNameElem.className = "menuBarProjectTitle";
        menuElem.appendChild(projectNameElem);

        projectSettingsElem = document.createElement('div');
        projectSettingsElem.className = 'tooltipElem menuBarProjectSettingsButton';
        projectSettingsElem.setAttribute('alt', "Project settings");
        projectSettingsElem.onclick = function () {
            wickEditor.guiActionHandler.doAction("toggleProjectSettings");
        }
        menuElem.appendChild(projectSettingsElem);

        tabs = [];

        wickEditor.fabric.canvas.on('mouse:down', function (e) {
            closeAllMenus();
        });

        addTab('File', [
            new TabButton('New Project', function () {
                wickEditor.guiActionHandler.doAction("newProject");
            }),
            new TabButton('Save', function () {
                wickEditor.guiActionHandler.doAction("exportProjectJSON");
                //wickEditor.guiActionHandler.doAction("saveProject");
            }),
            new TabButton('Open', function () {
                wickEditor.guiActionHandler.doAction("openFile");
            }),
            new TabSpacer(),

            new TabButton('Export animated GIF', function () {
                wickEditor.guiActionHandler.doAction("exportProjectGIF");
            }),
            /*new TabButton('Export SVG', function () {
                wickEditor.guiActionHandler.doAction("exportFrameSVG");
            }),*/
            new TabButton('Export webpage', function () {
                wickEditor.guiActionHandler.doAction("exportProjectHTML");
            }),
            new TabButton('Export ZIP', function () {
                wickEditor.guiActionHandler.doAction("exportProjectZIP");
            }),
            new TabSpacer(),
            
            new TabButton('Project settings', function () {
                wickEditor.guiActionHandler.doAction("openProjectSettings");
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
            new TabButton('Paste', function () {
                wickEditor.guiActionHandler.doAction("paste")
            }),
            new TabButton('Delete', function () {
                wickEditor.guiActionHandler.doAction("deleteSelectedObjects")
            }),
            /*new TabSpacer(),

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
            new TabButton('Convert to Clip', function () {
                wickEditor.guiActionHandler.doAction("convertToSymbol")
            }),
            new TabButton('Convert to Button', function () {
                wickEditor.guiActionHandler.doAction("convertToButton")
            }),
            new TabButton('Export Object', function () {
                wickEditor.guiActionHandler.doAction("downloadObject")
            }),
            new TabSpacer(),

            new TabButton('Edit Object', function () {
                wickEditor.guiActionHandler.doAction("editObject")
            }),
            new TabButton('Edit Scripts', function () {
                wickEditor.guiActionHandler.doAction("editScripts")
            }),*/
        ]);

        addTab('Import', [
            new TabButton('Image', function () {
                wickEditor.guiActionHandler.doAction("importFile");
            }),
            new TabButton('Sound', function () {
                wickEditor.guiActionHandler.doAction("importFile");
            }),
            new TabButton('SVG', function () {
                wickEditor.guiActionHandler.doAction("importFile");
            }),
            new TabButton('JSON', function () {
                wickEditor.guiActionHandler.doAction("importFile");
            }),
            new TabButton('Script', function () {
                wickEditor.guiActionHandler.doAction("importFile");
            }),
        ]);

        addTab('About', [
            new TabButton('Wickeditor.com', function () {
                window.open('http://www.wickeditor.com/');
            }),
            new TabButton('Source code', function () {
                window.open('https://www.github.com/zrispo/wick/');
            }),
            /*new TabSpacer(),

            new TabButton('Reset editor settings', function () {
                wickEditor.guiActionHandler.doAction('resetSettings');
            })*/
        ]);
        
        addTab('Run', [], function () { wickEditor.guiActionHandler.doAction("runProject"); });
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
        document.title = "Wick Editor: " + wickEditor.project.name

        if(projectNameElem) {
            if(wickEditor.project.unsaved) {
                projectNameElem.innerHTML = wickEditor.project.name + ' <span class="unsavedText">(unsaved)</span>';
            } else {
                projectNameElem.innerHTML = wickEditor.project.name;
            }
        }
    }

}