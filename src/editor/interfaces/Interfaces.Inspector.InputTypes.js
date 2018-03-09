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
        if(args.tooltip) {
            title.className += ' tooltipElem';
            title.setAttribute('alt', args.tooltip);
        }
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

InspectorInterface.SliderInput = function (args) {

    var self = this;
    self.getValueFn = args.getValueFn;
    self.onChangeFn = args.onChangeFn;
    self.isActiveFn = args.isActiveFn;

    self.updateViewValue = function () {
        if(self.isActiveFn()) {
            self.propertyDiv.style.display = 'block';
            self.valueDiv.value = self.getValueFn();
            self.sliderDiv.value = self.getValueFn();
        } else {
            self.propertyDiv.style.display = 'none';
        }
    }
    self.updateModelValue = function () {
        try {
            self.valueDiv.value = Math.min(self.valueDiv.value, args.max)
            self.valueDiv.value = Math.max(self.valueDiv.value, args.min)
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
        title.className = "inspector-input-title tooltipElem";
        title.setAttribute('alt', args.tooltip);
        title.innerHTML = args.title;

        self.valueDiv = document.createElement('input');
        self.valueDiv.className = 'inspector-input inspector-input-string inspector-input-string-tiny ' + args.className;
        self.valueDiv.onchange = function (e) {
            self.updateModelValue();
        }

        self.sliderDiv = document.createElement('input');
        self.sliderDiv.type = 'range';
        self.sliderDiv.min = args.min;
        self.sliderDiv.max = args.max;
        if(args.step) self.sliderDiv.step = args.step;
        self.sliderDiv.onchange = function (e) {
            self.updateModelValue(self.valueDiv.value);
            $('.inspector-input').blur()
        }
        self.sliderDiv.oninput = function (e) {
            self.valueDiv.value = self.sliderDiv.value;
            if(args.liveUpdateType) {
                wickEditor.project.getSelectedObjects().forEach(function (o) {
                    if(!o.paper || o.isSymbol) return;
                    o.paper[args.liveUpdateType] = self.valueDiv.value;
                });
            }
        }
        self.sliderDiv.className = 'inspector-input inspector-input-slider';

        self.propertyDiv = document.createElement('div');
        self.propertyDiv.className = 'inspector-property';
        self.propertyDiv.appendChild(title);
        self.propertyDiv.appendChild(self.valueDiv);
        self.propertyDiv.appendChild(self.sliderDiv);

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
        if(args.tooltip) {
            title.className += ' tooltipElem';
            title.setAttribute('alt', args.tooltip);
        }
        title.innerHTML = args.title;

        self.leftValueDiv = document.createElement('input');
        self.leftValueDiv.className = 'inspector-input inspector-input-string inspector-input-string-small ' + args.className;
        self.leftValueDiv.onchange = function (e) {
            self.updateModelValue();
        }

        var otherTitle = document.createElement('span');
        otherTitle.className = "inspector-input-title inspector-input-title-small";
        if(args.otherTooltip) {
            otherTitle.className += ' tooltipElem';
            otherTitle.setAttribute('alt', args.otherTooltip);
        }
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
        title.className = "inspector-input-title tooltipElem";
        title.setAttribute('alt', args.tooltip);
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

InspectorInterface.TwoColorPickerInput = function (args) {

    var self = this;
    self.getValueFn = args.getValueFn;
    self.onChangeFn = args.onChangeFn;
    self.isActiveFn = args.isActiveFn;
    self.previewTypeLeft = args.previewTypeLeft;
    self.previewTypeRight = args.previewTypeRight;

    self.updateViewValue = function () {
        if(self.isActiveFn()) {
            self.propertyDiv.style.display = 'block';
            self.leftValueDiv.style.backgroundColor = self.getValueFn().left;
            self.rightValueDiv.style.backgroundColor = self.getValueFn().right;
        } else {
            self.propertyDiv.style.display = 'none';
        }
    }
    self.updateModelValue = function () {
        try {
            self.onChangeFn({
                left : self.leftValueDiv.value, 
                right : self.rightValueDiv.value
            });
        } catch (e) {
            console.log(e)
            self.updateViewValue();
        }
    }

    self.propertyDiv;
    self.leftValueDiv;
    self.rightValueDiv;
    self.getPropertyDiv = function () {
        var titleLeft = document.createElement('span');
        titleLeft.className = "inspector-input-title inspector-input-title tooltipElem";
        titleLeft.setAttribute('alt', args.rightTooltip);
        titleLeft.innerHTML = args.titleLeft;

        var titleRight = document.createElement('span');
        titleRight.className = "inspector-input-title inspector-input-title-small tooltipElem";
        titleRight.setAttribute('alt', args.leftTooltip);
        titleRight.innerHTML = args.titleRight;

        self.leftValueDiv = document.createElement('div');
        self.leftValueDiv.className = 'inspector-input inspector-color-picker inspector-color-picker-small';
        self.leftValueDiv.onclick = function () {
            wickEditor.colorPicker.open(function (color) {
                self.onChangeFn({left:color})
                wickEditor.syncInterfaces();
            }, 
            self.getValueFn().left,
            self.leftValueDiv.getBoundingClientRect().left,
            self.leftValueDiv.getBoundingClientRect().top,
            self.previewTypeLeft)
        }

        self.rightValueDiv = document.createElement('div');
        self.rightValueDiv.className = 'inspector-input inspector-color-picker inspector-color-picker-small';
        self.rightValueDiv.onclick = function () {
            wickEditor.colorPicker.open(function (color) {
                self.onChangeFn({right:color})
                wickEditor.syncInterfaces();
            }, 
            self.getValueFn().right,
            self.rightValueDiv.getBoundingClientRect().left,
            self.rightValueDiv.getBoundingClientRect().top,
            self.previewTypeRight)
        }

        self.propertyDiv = document.createElement('div');
        self.propertyDiv.className = 'inspector-property';
        self.propertyDiv.appendChild(titleLeft);
        self.propertyDiv.appendChild(self.leftValueDiv);
        self.propertyDiv.appendChild(titleRight);
        self.propertyDiv.appendChild(self.rightValueDiv);

        return self.propertyDiv;
    }

}

InspectorInterface.SelectInput = function (args) {

    var self = this;
    self.getValueFn = args.getValueFn;
    self.onChangeFn = args.onChangeFn;
    self.isActiveFn = args.isActiveFn;
    self.options    = args.options;
    self.optionsFn  = args.optionsFn;

    self.updateViewValue = function () {
        self.valueDiv.innerHTML = '';
        (self.options || self.optionsFn()).forEach(function (optionText) {
            var option = document.createElement("option");
            option.text = optionText;
            self.valueDiv.add(option);
        });
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
        title.className = "inspector-input-title tooltipElem";
        title.setAttribute('alt', args.tooltip);
        title.innerHTML = args.title;

        self.valueDiv = document.createElement('SELECT');
        self.valueDiv.className = 'inspector-input inspector-input-select ' + args.className;
        (self.options || self.optionsFn()).forEach(function (optionText) {
            var option = document.createElement("option");
            option.text = optionText;
            self.valueDiv.add(option);
        });
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
        title.className = "inspector-input-title tooltipElem";
        title.setAttribute('alt', args.tooltip);
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
        title.className = "inspector-input-title tooltipElem";
        title.setAttribute('alt', args.tooltip);
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
