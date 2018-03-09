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
    var timelineMode = false;

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

            var textboxSelected = function (e) {
                return e.target.tagName === 'INPUT' || e.target.className === 'ace_content' || e.target.tagName === 'TEXTAREA';
            } 

            var mouseEventHandler = function (e) {
                if(!enabled) return;

                if(e.button == 2) {
                    if(textboxSelected(e)) {
                        self.open = false;
                        return;
                    }
                    self.open = true;
                    timelineMode = e.target.className.includes('frame');
                } else {
                    self.open = false;
                }

                self.updateElem(e);
            }

            window.addEventListener('mousedown', function(e) { 
                mouseEventHandler(e);
            });
            document.addEventListener('contextmenu', function (e) { 
                if(enabled && !textboxSelected(e)) e.preventDefault();
            }, false);

        }

        this.updateElem = function (e) {

            if(this.open) {

                self.buttonGroups.forEach(function (buttonGroup) {
                    buttonGroup.updateElem();
                });

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
            
            } else {

                this.elem.style.display = 'none';
                this.elem.style.top = '0px';
                this.elem.style.left = '0px';

            }

        }

    }

    var RightClickMenuButtonGroup = function (buttons, isActiveFn, isLibraryGroup) {
        var self = this;

        this.buttons = buttons;
        this.isActiveFn = isActiveFn;
        this.elem = null;
        this.isLibraryGroup = isLibraryGroup;

        this.generateElem = function () {
            this.elem = document.createElement('div');

            this.buttons.forEach(function (button) {
                button.generateElem();
                self.elem.appendChild(button.elem);
            });
            //this.elem.appendChild(document.createElement('hr'));
        }

        this.updateElem = function () {
            if(wickEditor.library.isSelected() && !this.isLibraryGroup) {
                this.elem.style.display = 'none';
            } else if(this.isActiveFn()) {
                this.elem.style.display = 'block';
            } else {
                this.elem.style.display = 'none';
            }
        }

    }

    var RightClickMenuButton = function (title, icon, action) {
        var self = this;

        this.title = title;
        this.action = action;
        this.elem = null;

        this.generateElem = function () {
            this.elem = document.createElement('div');
            this.elem.className = 'rightClickMenuButton';
            this.elem.innerHTML = title;

            var iconElem = document.createElement('div');
            iconElem.className = 'rightClickMenuButtonIcon';
            iconElem.style.backgroundImage = icon;
            this.elem.appendChild(iconElem)

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
        var buttons = []

        buttons.push(new RightClickMenuButtonGroup([
            new RightClickMenuButton(
                "Add Frame", 
                'url(./resources/inspector-duplicate.svg)', 
                function () { wickEditor.actionHandler.doAction('addNewFrame'); }),
            ], function () {return wickEditor.project.getSelectedObjects().length < 1 && timelineMode && !wickEditor.library.isSelected()}, false ));

        wickEditor.inspector.getButtons().forEach(function (button) {
            var group = new RightClickMenuButtonGroup([
                new RightClickMenuButton(button.name, button.icon, button.buttonAction),
            ], button.isActiveFn, false);
            buttons.push(group);
        });

        buttons.push(new RightClickMenuButtonGroup([
            new RightClickMenuButton(
                "Copy", 
                'url(./resources/copy.svg)', 
                function () { wickEditor.guiActionHandler.doAction("copy") }),
            ], function () {return !wickEditor.library.isSelected()}, false ));

        buttons.push(new RightClickMenuButtonGroup([
            new RightClickMenuButton(
                "Cut", 
                'url(./resources/cut.svg)', 
                function () { wickEditor.guiActionHandler.doAction("cut") }),
            ], function () {return !wickEditor.library.isSelected()}, false ));

        buttons.push(new RightClickMenuButtonGroup([
            new RightClickMenuButton(
                "Paste", 
                'url(./resources/paste.svg)', 
                function () { wickEditor.guiActionHandler.doAction("paste") }),
            ], function () {return !wickEditor.library.isSelected()}, false ));

        /*buttons.push(new RightClickMenuButtonGroup([
            new RightClickMenuButton(
                "Create Object from Asset", 
                'url(./resources/inspector-duplicate.svg)', 
                function () { wickEditor.guiActionHandler.doAction("createObjectFromAsset") }),
            ], function () {return wickEditor.library.isSelected()}, true ));*/

        buttons.push(new RightClickMenuButtonGroup([
            new RightClickMenuButton(
                "Delete Asset", 
                'url(./resources/delete-layer.svg)', 
                function () { wickEditor.guiActionHandler.doAction("deleteAsset") }),
            ], function () {return wickEditor.library.isSelected()}, true ));

        buttons.push(new RightClickMenuButtonGroup([
            new RightClickMenuButton(
                "Rename Asset", 
                'url(./resources/pen.png)', 
                function () { wickEditor.guiActionHandler.doAction("renameAsset") }),
            ], function () {return wickEditor.library.isSelected()}, true ));

        menu = new RightClickMenu(buttons);

        menu.generateElem();
    }

    self.syncWithEditorState = function () {
        menu.updateElem();
    }

    self.openMenu = function (specialMode, _timelineMode) {
        if(!enabled) return;
        timelineMode = _timelineMode;
        menu.open = true;
        self.syncWithEditorState();
    }

    self.closeMenu = function () {
        if(!enabled) return;
        menu.open = false;
        self.syncWithEditorState();
    }

    window.disableWickRightClickMenu = function () { enabled = false; };

}