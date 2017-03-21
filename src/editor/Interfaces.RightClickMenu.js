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

var RightClickMenuInterface = function (wickEditor) {

    var self = this;

    var menu;

    var enabled = true;

// menu object definitions

    var RightClickMenu = function (buttonGroups) {
        var self = this;

        this.open = false;

        this.buttonGroups = buttonGroups;

        this.elem = null;

        this.generateElem = function () {

            this.elem = document.createElement('div');
            this.elem.id = 'rightClickMenu';
            this.elem.className = "GUIBox";
            document.getElementById('editor').appendChild(this.elem);

            this.buttonGroups.forEach(function (buttonGroup) {
                buttonGroup.generateElem();
                self.elem.appendChild(buttonGroup.elem);
            });

            var mouseEventHandler = function (e) {
                if(!enabled) return;

                if(e.button == 2) {
                    self.open = true;
                } else {
                    self.open = false;
                }

                self.updateElem();
            }

            window.addEventListener('mousedown', function(e) { 
                mouseEventHandler(e, "fabric");
            });

        }

        this.updateElem = function () {

            if(this.open) {

                this.elem.style.display = 'block';

                var newX = wickEditor.inputHandler.mouse.x;
                var newY = wickEditor.inputHandler.mouse.y;
                if(newX+this.elem.offsetWidth > window.innerWidth) {
                    newX = window.innerWidth - this.elem.offsetWidth;
                }
                if(newY+this.elem.offsetHeight > window.innerHeight) {
                    newY = window.innerHeight - this.elem.offsetHeight;
                }
                this.elem.style.left = newX+'px';
                this.elem.style.top  = newY+'px';

                self.buttonGroups.forEach(function (buttonGroup) {
                    buttonGroup.updateElem();
                });
            
            } else {

                this.elem.style.display = 'none';
                this.elem.style.top = '0px';
                this.elem.style.left = '0px';

            }

        }

    }

    var RightClickMenuButtonGroup = function (buttons, isActiveFn) {
        var self = this;

        this.buttons = buttons;
        this.isActiveFn = isActiveFn;
        this.elem = null;

        this.generateElem = function () {
            this.elem = document.createElement('div');

            this.buttons.forEach(function (button) {
                button.generateElem();
                self.elem.appendChild(button.elem);
            });
            this.elem.appendChild(document.createElement('hr'));
        }

        this.updateElem = function () {
            if(this.isActiveFn()) {
                this.elem.style.display = 'block';
            } else {
                this.elem.style.display = 'none';
            }
        }

    }

    var RightClickMenuButton = function (title, action) {
        var self = this;

        this.title = title;
        this.action = action;
        this.elem = null;

        this.generateElem = function () {
            this.elem = document.createElement('div');
            this.elem.className = 'button';
            this.elem.innerHTML = title;

            this.elem.addEventListener('mousedown', function (e) {
                menu.open = false;
                self.action();
            });
        }

        this.updateElem = function () {

        }

    }

// Interface API

    self.setup = function () {
        // Block browser default right click menu
        document.addEventListener('contextmenu', function (event) { 
            if(enabled) event.preventDefault();
        }, false);

        // Build menu object
        menu = new RightClickMenu([
            // Objects selected options
            new RightClickMenuButtonGroup([
                new RightClickMenuButton('Flip horizontally', function () {
                    wickEditor.guiActionHandler.doAction("flipHorizontally")
                }),
                new RightClickMenuButton('Flip vertically', function () {
                    wickEditor.guiActionHandler.doAction("flipVertically")
                }),
                new RightClickMenuButton('Bring to front', function () {
                    wickEditor.guiActionHandler.doAction("bringToFront")
                }),
                new RightClickMenuButton('Send to back', function () {
                    wickEditor.guiActionHandler.doAction("sendToBack")
                }),
                new RightClickMenuButton('Convert to MovieClip', function () {
                    wickEditor.guiActionHandler.doAction("convertToSymbol")
                }),
                new RightClickMenuButton('Convert to Button', function () {
                    wickEditor.guiActionHandler.doAction("convertToButton")
                }),
                new RightClickMenuButton('Export', function () {
                    wickEditor.guiActionHandler.doAction("downloadObject")
                }),
                new RightClickMenuButton('Delete', function () {
                    wickEditor.guiActionHandler.doAction('deleteSelectedObjects');
                }),
            ], function () {
                return wickEditor.project.getNumSelectedObjects() >= 1 && wickEditor.project.getSelectedObjects()[0] instanceof WickObject;
            }),

            // Single symbol selected options
            new RightClickMenuButtonGroup([
                new RightClickMenuButton('Edit object', function () {
                    wickEditor.guiActionHandler.doAction('editObject');
                }),
                new RightClickMenuButton('Edit scripts', function () {
                    wickEditor.guiActionHandler.doAction("editScripts")
                }),
                new RightClickMenuButton('Break apart', function () {
                    wickEditor.guiActionHandler.doAction("breakApart")
                })
            ], function () {
                return wickEditor.project.getNumSelectedObjects() === 1 && wickEditor.project.getSelectedObjects()[0].isSymbol;
            }),

            // Frames selection
            new RightClickMenuButtonGroup([
                /*new RightClickMenuButton('Create symbol from frames', function () {
                    wickEditor.guiActionHandler.doAction("convertFramesToSymbol")
                }),*/
                new RightClickMenuButton('Copy', function () {
                    alert("NYI")
                }),
                new RightClickMenuButton('Paste', function () {
                    alert("NYI")
                }),
                new RightClickMenuButton('Delete', function () {
                    wickEditor.guiActionHandler.doAction('deleteSelectedObjects');
                }),
                new RightClickMenuButton('Edit Scripts', function () {
                    wickEditor.guiActionHandler.doAction('editFrameScripts');
                }),
            ], function () {
                return wickEditor.project.getNumSelectedObjects() >= 1 && wickEditor.project.getSelectedObjects()[0] instanceof WickFrame;
            })
        ]);

        menu.generateElem();
    }

    self.syncWithEditorState = function () {
        menu.updateElem();
    }

    self.openMenu = function () {
        menu.open = true;
        self.syncWithEditorState();
    }

    self.closeMenu = function () {
        menu.open = false;
        self.syncWithEditorState();
    }

}