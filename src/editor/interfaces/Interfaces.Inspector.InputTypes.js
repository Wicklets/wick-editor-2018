InspectorInterface.StringInput = function (args) {

    var self = this;
    self.getValueFn = args.getValueFn;
    self.onChangeFn = args.onChangeFn;
    self.isActiveFn = args.isActiveFn;

    self.updateViewValue = function () {
        if(self.isActiveFn()) {
            self.propertyDiv.style.display = 'block';
            self.valueDiv.value = self.getValueFn();
        } else {
            self.propertyDiv.style.display = 'none';
        }
    }
    self.updateModelValue = function () {
        try {
            self.onChangeFn(self.valueDiv.value);
        } catch (e) {
            console.log(e)
            self.updateViewValue();
        }
    }

    self.isFocused = function () {
        return document.activeElement === self.valueDiv;
    }

    self.propertyDiv;
    self.valueDiv;
    self.getPropertyDiv = function () {
        var title = document.createElement('span');
        title.className = "inspector-input-title";
        title.innerHTML = args.title;

        self.valueDiv = document.createElement('input');
        self.valueDiv.className = 'inspector-input inspector-input-string ' + args.className;
        self.valueDiv.onchange = function (e) {
            self.updateModelValue();
        }

        self.propertyDiv = document.createElement('div');
        self.propertyDiv.className = 'inspector-property';
        self.propertyDiv.appendChild(title);
        self.propertyDiv.appendChild(self.valueDiv);

        if(args.type === 'right-input') {
            self.propertyDiv.className += ' inspector-property-right';
            title.className += ' inspector-input-title-right'
        } else if (args.type === 'left-input') {
            self.propertyDiv.className += ' inspector-property-left';
            title.className += ' inspector-input-title-left'
        }

        return self.propertyDiv;
    }

}

InspectorInterface.TwoStringInput = function (args) {

    var self = this;
    self.getValueFn = args.getValueFn;
    self.onChangeFn = args.onChangeFn;
    self.isActiveFn = args.isActiveFn;

    self.updateViewValue = function () {
        if(self.isActiveFn()) {
            self.propertyDiv.style.display = 'block';
            self.leftValueDiv.value = self.getValueFn().left;
            self.rightValueDiv.value = self.getValueFn().right;
        } else {
            self.propertyDiv.style.display = 'none';
        }
    }
    self.updateModelValue = function () {
        try {
            self.onChangeFn({
                left: self.leftValueDiv.value,
                right: self.rightValueDiv.value
            });
        } catch (e) {
            console.log(e)
            self.updateViewValue();
        }
    }

    self.isFocused = function () {
        return document.activeElement === self.leftValueDiv
            || document.activeElement === self.rightValueDiv;
    }

    self.propertyDiv;
    self.leftValueDiv;
    self.rightValueDiv;
    self.getPropertyDiv = function () {
        var title = document.createElement('span');
        title.className = "inspector-input-title";
        title.innerHTML = args.title;

        self.leftValueDiv = document.createElement('input');
        self.leftValueDiv.className = 'inspector-input inspector-input-string inspector-input-string-small ' + args.className;
        self.leftValueDiv.onchange = function (e) {
            self.updateModelValue();
        }

        var otherTitle = document.createElement('span');
        otherTitle.className = "inspector-input-title inspector-input-title-small";
        otherTitle.innerHTML = args.otherTitle;

        self.rightValueDiv = document.createElement('input');
        self.rightValueDiv.className = 'inspector-input inspector-input-string inspector-input-string-small ' + args.className;
        self.rightValueDiv.onchange = function (e) {
            self.updateModelValue();
        }

        self.propertyDiv = document.createElement('div');
        self.propertyDiv.className = 'inspector-property';
        self.propertyDiv.appendChild(title);
        self.propertyDiv.appendChild(self.leftValueDiv);
        self.propertyDiv.appendChild(otherTitle);
        self.propertyDiv.appendChild(self.rightValueDiv);

        return self.propertyDiv;
    }

}

InspectorInterface.ColorPickerInput = function (args) {

    var self = this;
    self.getValueFn = args.getValueFn;
    self.onChangeFn = args.onChangeFn;
    self.isActiveFn = args.isActiveFn;
    self.previewType = args.previewType;

    self.updateViewValue = function () {
        if(self.isActiveFn()) {
            self.propertyDiv.style.display = 'block';
            self.valueDiv.style.backgroundColor = self.getValueFn();
        } else {
            self.propertyDiv.style.display = 'none';
        }
    }
    self.updateModelValue = function () {
        try {
            self.onChangeFn(self.valueDiv.value);
        } catch (e) {
            console.log(e)
            self.updateViewValue();
        }
    }

    self.propertyDiv;
    self.valueDiv;
    self.getPropertyDiv = function () {
        var title = document.createElement('span');
        title.className = "inspector-input-title";
        title.innerHTML = args.title;

        self.valueDiv = document.createElement('div');
        self.valueDiv.className = 'inspector-input inspector-color-picker';
        self.valueDiv.onclick = function () {
            wickEditor.colorPicker.open(function (color) {
                self.onChangeFn(color)
                wickEditor.syncInterfaces();
            }, 
            self.getValueFn(),
            self.valueDiv.getBoundingClientRect().left,
            self.valueDiv.getBoundingClientRect().top,
            self.previewType)
        }

        self.propertyDiv = document.createElement('div');
        self.propertyDiv.className = 'inspector-property';
        self.propertyDiv.appendChild(title);
        self.propertyDiv.appendChild(self.valueDiv);

        return self.propertyDiv;
    }

}

InspectorInterface.SelectInput = function (args) {

    var self = this;
    self.getValueFn = args.getValueFn;
    self.onChangeFn = args.onChangeFn;
    self.isActiveFn = args.isActiveFn;
    self.options    = args.options;

    self.updateViewValue = function () {
        if(self.isActiveFn()) {
            self.propertyDiv.style.display = 'block';
            self.valueDiv.value = self.getValueFn();
        } else {
            self.propertyDiv.style.display = 'none';
        }
    }
    self.updateModelValue = function () {
        try {
            self.onChangeFn(self.valueDiv.value);
        } catch (e) {
            console.log(e)
            self.updateViewValue();
        }
    }

    self.propertyDiv;
    self.valueDiv;
    self.getPropertyDiv = function () {
        var title = document.createElement('span');
        title.className = "inspector-input-title";
        title.innerHTML = args.title;

        self.valueDiv = document.createElement('SELECT');
        self.valueDiv.className = 'inspector-input inspector-input-select ' + args.className;
        self.options.forEach(function (optionText) {
            var option = document.createElement("option");
            option.text = optionText;
            self.valueDiv.add(option);
        })
        self.valueDiv.onchange = function (e) {
            self.updateModelValue();
        }

        self.propertyDiv = document.createElement('div');
        self.propertyDiv.className = 'inspector-property';
        self.propertyDiv.appendChild(title);
        self.propertyDiv.appendChild(self.valueDiv);
        return self.propertyDiv;
    }

}

InspectorInterface.CheckboxInput = function (args) {

    var self = this;
    self.getValueFn = args.getValueFn;
    self.onChangeFn = args.onChangeFn;
    self.isActiveFn = args.isActiveFn;

    self.updateViewValue = function () {
        if(self.isActiveFn()) {
            self.propertyDiv.style.display = 'block';
            self.valueDiv.checked = self.getValueFn();
        } else {
            self.propertyDiv.style.display = 'none';
        }
    }
    self.updateModelValue = function () {
        try {
            self.onChangeFn(self.valueDiv.checked);
        } catch (e) {
            console.log(e)
            self.updateViewValue();
        }
    }

    self.propertyDiv;
    self.valueDiv;
    self.getPropertyDiv = function () {
        var title = document.createElement('span');
        title.className = "inspector-input-title";
        title.innerHTML = args.title;

        self.valueDiv = document.createElement('input');
        self.valueDiv.type = 'checkBox';
        self.valueDiv.className = 'inspector-input inspector-input-checkbox ' + args.className;
        self.valueDiv.onchange = function (e) {
            self.updateModelValue();
        }

        self.propertyDiv = document.createElement('div');
        self.propertyDiv.className = 'inspector-property';
        self.propertyDiv.appendChild(title);
        self.propertyDiv.appendChild(self.valueDiv);
        return self.propertyDiv;
    }
}

InspectorInterface.MultiCheckboxInput = function (args) {

    var self = this;
    self.getValueFn = args.getValueFn;
    self.onChangeFn = args.onChangeFn;
    self.isActiveFn = args.isActiveFn;

    self.updateViewValue = function () {
        if(self.isActiveFn()) {
            self.propertyDiv.style.display = 'block';
            var vals = self.getValueFn();
            for(var i = 0; i < self.valueDivs.length; i++) {
                var activated = vals[i];
                var valueDiv = self.valueDivs[i];
                valueDiv.activated = activated;
                valueDiv.className = activated ? 
                    'inspector-input inspector-input-togglebutton inspector-input-togglebutton-activated' : 
                    'inspector-input inspector-input-togglebutton ' ;
            }
        } else {
            self.propertyDiv.style.display = 'none';
        }
    }
    self.updateModelValue = function () {
        try {
            var vals = [];
            self.valueDivs.forEach(function (valueDiv) {
                vals.push(valueDiv.activated);
            });
            self.onChangeFn(vals);
        } catch (e) {
            console.log(e);
            self.updateViewValue();
        }
    }

    self.propertyDiv;
    self.valueDivs;
    self.getPropertyDiv = function () {
        var title = document.createElement('span');
        title.className = "inspector-input-title";
        title.innerHTML = args.title;

        self.valueDivs = [];
        args.icons.forEach(function (icon) {
            var valueDiv = document.createElement('div');
            valueDiv.className = 'inspector-input inspector-input-togglebutton ';
            valueDiv.style.backgroundImage = 'url('+icon+')';
            valueDiv.onmousedown = function (e) {
                valueDiv.activated = !valueDiv.activated;
                self.updateModelValue();
            }
            self.valueDivs.push(valueDiv);
        })

        self.propertyDiv = document.createElement('div');
        self.propertyDiv.className = 'inspector-property';
        self.propertyDiv.appendChild(title);
        self.valueDivs.forEach(function (valueDiv) {
            self.propertyDiv.appendChild(valueDiv);
        });
        return self.propertyDiv;
    }
}

InspectorInterface.InspectorButton = function (args) {

    var self = this;
    self.isActiveFn = args.isActiveFn;
    self.buttonAction = args.buttonAction;

    self.name = args.tooltipTitle;
    self.icon = "url("+args.icon+")";

    self.updateViewValue = function () {
        if(self.isActiveFn()) {
            self.buttonDiv.style.display = 'block';
        } else {
            self.buttonDiv.style.display = 'none';
        }
    }

    self.buttonDiv;
    self.getButtonDiv = function () {
        self.buttonDiv = document.createElement('div');
        self.buttonDiv.className = 'inspector-button tooltipElem inspector-button-' + args.colorClass;
        self.buttonDiv.style.backgroundImage = self.icon;
        self.buttonDiv.onclick = function () {
            self.buttonAction();
        }
        self.buttonDiv.setAttribute('alt', args.tooltipTitle);
        return self.buttonDiv;
    }

}

InspectorInterface.Divider = function (args) {

    var self = this;
    self.isActiveFn = function () { return true; };
    self.buttonAction = function () { return true; };

    self.name = '';
    self.icon = '';

    self.updateViewValue = function () { return true; };

    var elem = document.createElement('div');
    elem.className = 'inspector-divider';

    self.buttonDiv;
    self.getButtonDiv = function () {
        self.buttonDiv = document.createElement('div');
        self.buttonDiv.className = 'inspector-divider';
        return self.buttonDiv;
    }

}
