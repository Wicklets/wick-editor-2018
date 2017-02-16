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
            new RightClickMenuButtonGroup([
                new RightClickMenuButton('test1', function () {
                    alert('test1');
                }),
                new RightClickMenuButton('test2', function () {
                    alert('test2');
                })
            ], function () {
                return true;
            }),
            new RightClickMenuButtonGroup([
                new RightClickMenuButton('test3', function () {
                    alert('test3');
                })
            ], function () {
                return true;
            })
        ]);

        menu.generateElem();
    }

    self.syncWithEditorState = function () {
        menu.updateElem();
    }

}