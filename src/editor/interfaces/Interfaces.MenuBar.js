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
    var tabContainer;
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
            tabContainer.appendChild(tabElem);

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

        tabContainer = document.createElement('div');
        tabContainer.className = "tab-container";
        menuElem.appendChild(tabContainer);

        projectNameElem = document.createElement('div');
        projectNameElem.className = "menuBarProjectTitle";
        projectNameElem.onclick = function () {
            wickEditor.guiActionHandler.doAction('saveProject')
        }

        projectSettingsElem = document.createElement('div');
        projectSettingsElem.className = 'tooltipElem menuBarProjectSettingsButton';
        projectSettingsElem.setAttribute('alt', "Project settings");
        projectSettingsElem.onclick = function () {
            wickEditor.guiActionHandler.doAction("toggleProjectSettings");
        }

        var menuBarProjectControls = document.createElement('div');
        menuBarProjectControls.className = "menuBarProjectControls";
        menuBarProjectControls.appendChild(projectNameElem);
        menuBarProjectControls.appendChild(projectSettingsElem);
        menuElem.appendChild(menuBarProjectControls);

        tabs = [];

        wickEditor.canvas.getCanvasContainer().addEventListener('mousedown', function (e) {
            closeAllMenus();
        });

        addTab('File', [
            new TabButton('New Project', function () {
                wickEditor.guiActionHandler.doAction("newProject");
            }),
            new TabButton('Open Project', function () {
                wickEditor.guiActionHandler.doAction("openFile");
            }),
            new TabButton('Save Project', function () {
                wickEditor.guiActionHandler.doAction("exportProjectWick");
            }),
            new TabSpacer(),

            /*new TabButton('Export SVG', function () {
                wickEditor.guiActionHandler.doAction("exportFrameSVG");
            }),
            new TabButton('Export PNG', function () {
                wickEditor.guiActionHandler.doAction("exportProjectPNG");
            }),*/
            new TabButton('Export HTML', function () {
                wickEditor.guiActionHandler.doAction("exportProjectHTML");
            }),
            new TabButton('Export ZIP', function () {
                wickEditor.guiActionHandler.doAction("exportProjectZIP");
            }),
            /*new TabButton('Export Project as JSON', function () {
                wickEditor.guiActionHandler.doAction("exportProjectJSON");
            }),*/
            new TabButton('Export Animated GIF', function () {
                wickEditor.guiActionHandler.doAction("exportProjectGIF");
            }),
            new TabButton('Export Video', function () {
                wickEditor.guiActionHandler.doAction("openProjectExportWindow");
            }),
            new TabSpacer(),

            new TabButton('Run project', function () {
                wickEditor.guiActionHandler.doAction("runProject");
            }),
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

            new TabButton('Cut', function () {
                wickEditor.guiActionHandler.doAction("cut")
            }),
            new TabButton('Copy', function () {
                wickEditor.guiActionHandler.doAction("copy")
            }),
            new TabButton('Paste', function () {
                wickEditor.guiActionHandler.doAction("paste")
            }),
            new TabButton('Delete', function () {
                wickEditor.guiActionHandler.doAction("deleteSelectedObjects")
            }),
            new TabSpacer(),

            new TabButton('Select All', function () {
                wickEditor.guiActionHandler.doAction("selectAll")
            }),
            new TabButton('Deselect All', function () {
                wickEditor.guiActionHandler.doAction("deselectAll")
            }),
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
            /*new TabButton('JSON', function () {
                wickEditor.guiActionHandler.doAction("importFile");
            }),
            new TabButton('Script', function () {
                wickEditor.guiActionHandler.doAction("importFile");
            }),*/
        ]);

        addTab('Help', [
            new TabButton('Hotkeys', function () {
                wickEditor.guiActionHandler.doAction("openEditorSettings");
            }),
            new TabButton('Examples', function () {
                window.open('http://www.wickeditor.com/#examples')
            }),
            new TabButton('Tutorials', function () {
                window.open('http://www.wickeditor.com/#tutorials')
            }),
            new TabButton('Forums', function () {
                window.open('http://forum.wickeditor.com/')
            }),
            new TabButton('Browser Info', function () {
                wickEditor.guiActionHandler.doAction('printBrowserInfo');
            }),
        ]);

        addTab('About', [
            new TabButton('Source code', function () {
                window.open('https://www.github.com/zrispo/wick/');
            }),
            new TabButton('Credits', function () {
                window.open('http://www.wickeditor.com/#about');
            }),
        ]);

        addTab('Run', [], function () {
                wickEditor.guiActionHandler.doAction("runProject");
            });
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
