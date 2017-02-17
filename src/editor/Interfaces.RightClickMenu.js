/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var RightClickMenuInterface = function (wickEditor) {

    var self = this;

    var menu;

    var enabled = true;

// menu object definitions

    var RightClickMenu = function (buttonGroups) {
        var self = this;

        this.open = false
        this.mode = null;

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

            var mouseEventHandler = function (e, newMode) {
                if(!enabled) return;

                if(e.button == 2) {
                    self.open = true;
                    self.mode = newMode;
                } else {
                    self.open = false;
                }

                self.updateElem();
            }

            document.getElementById("editorCanvasContainer").addEventListener('mousedown', function(e) { 
                mouseEventHandler(e, "fabric");
            });

            document.getElementById("timelineGUI").addEventListener('mousedown', function(e) { 
                mouseEventHandler(e, "timeline");
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

        /*
        Non symbol
            Flip x
            Flip y
            Bring to front
            Send to back
            Convert to symbol
            Export
            Delete

        Symbol
            Break apart
            Edit scripts
            Edit object

        Not available yet
            Copy
            Cut
            Paste

            Add tween
            Remove tween 
        */

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
                new RightClickMenuButton('Convert to symbol', function () {
                    wickEditor.guiActionHandler.doAction("convertToSymbol")
                }),
                new RightClickMenuButton('Export', function () {
                    wickEditor.guiActionHandler.doAction("downloadObject")
                }),
                new RightClickMenuButton('Delete', function () {
                    wickEditor.guiActionHandler.doAction('deleteSelectedObjects');
                }),
            ], function () {
                return wickEditor.project.selection.length >= 1;
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
                return wickEditor.project.selection.length === 1 && wickEditor.project.getSelectedObjects()[0].isSymbol;
            })
        ]);

        menu.generateElem();
    }

    self.syncWithEditorState = function () {
        menu.updateElem();
    }

}