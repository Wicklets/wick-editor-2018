InspectorInterface.StringInput = function (args) {

    var self = this;
    self.getValueFn = args.getValueFn;
    self.onChangeFn = args.onChangeFn;
    self.isActiveFn = args.isActiveFn;

    self.updateViewValue = function () {
        if(self.isActiveFn()) {
            title.style.display = 'block';
            elem.style.display = 'block';
            elem.value = self.getValueFn();
        } else {
            title.style.display = 'none';
            elem.style.display = 'none';
        }
    }
    self.updateModelValue = function () {
        try {
            self.onChangeFn(elem.value);
        } catch (e) {
            self.updateViewValue();
        }
    }

    self.isFocused = function () {
        return document.activeElement === elem
    }

    var title = document.createElement('span');
    title.className = "inspector-input-title";
    title.innerHTML = args.title;
    propertiesContainer.appendChild(title);

    var elem = document.createElement('input');
    elem.className = 'inspector-input inspector-input-string ' + args.className;
    elem.onchange = function (e) {
        self.updateModelValue();
    }
    propertiesContainer.appendChild(elem);

}

InspectorInterface.SelectInput = function (args) {

    var self = this;
    self.getValueFn = args.getValueFn;
    self.onChangeFn = args.onChangeFn;
    self.isActiveFn = args.isActiveFn;
    self.options    = args.options;

    self.updateViewValue = function () {
        if(self.isActiveFn()) {
            title.style.display = 'block';
            elem.style.display = 'block';
            elem.value = self.getValueFn();
        } else {
            title.style.display = 'none';
            elem.style.display = 'none';
        }
    }
    self.updateModelValue = function () {
        try {
            self.onChangeFn(elem.value);
        } catch (e) {
            self.updateViewValue();
        }
    }

    var title = document.createElement('span');
    title.className = "inspector-input-title";
    title.innerHTML = args.title;
    propertiesContainer.appendChild(title);

    var elem = document.createElement('SELECT');
    elem.className = 'inspector-input inspector-input-select ' + args.className;
    self.options.forEach(function (optionText) {
        var option = document.createElement("option");
        option.text = optionText;
        elem.add(option);
    })
    elem.onchange = function (e) {
        self.updateModelValue();
    }
    propertiesContainer.appendChild(elem);

}

InspectorInterface.ColorInput = function (args) {

    var self = this;
    self.getValueFn = args.getValueFn;
    self.onChangeFn = args.onChangeFn;
    self.isActiveFn = args.isActiveFn;

    self.uuid = random.uuid4();

    self.updateViewValue = function () {
        if(self.isActiveFn()) {
            elem.style.display = 'block';
            title.style.display = 'block';
            setTimeout(function () {
                $("#"+self.uuid).spectrum("set", self.getValueFn());
            }, 300)
            //$("#"+self.uuid).spectrum("set", self.getValueFn());
        } else {
            elem.style.display = 'none';
            title.style.display = 'none';
        }
    }
    self.updateModelValue = function (val) {
        if(!val) return;
        try {
            self.onChangeFn(val);
        } catch (e) {
            self.updateViewValue();
        }
    }

    var title = document.createElement('span');
    title.className = "inspector-input-title";
    title.innerHTML = args.title;
    propertiesContainer.appendChild(title);

    var elem = document.createElement('div');
    elem.className = 'inspector-input inspector-input-color';
    propertiesContainer.appendChild(elem);

    var picker = document.createElement('input');
    picker.type = 'text';
    picker.id = self.uuid;
    picker.style.display = 'none';
    elem.appendChild(picker);
    setupColorPicker(self.uuid, function (color) {
        self.updateModelValue(color.toString());
    });

}

InspectorInterface.CheckboxInput = function (args) {

    var self = this;
    self.getValueFn = args.getValueFn;
    self.onChangeFn = args.onChangeFn;
    self.isActiveFn = args.isActiveFn;

    self.updateViewValue = function () {
        if(self.isActiveFn()) {
            title.style.display = 'block';
            elem.style.display = 'block';
            elem.checked = self.getValueFn();
        } else {
            title.style.display = 'none';
            elem.style.display = 'none';
        }
    }
    self.updateModelValue = function () {
        try {
            self.onChangeFn(elem.checked);
        } catch (e) {
            self.updateViewValue();
        }
    }

    var title = document.createElement('span');
    title.className = "inspector-input-title";
    title.innerHTML = args.title;
    propertiesContainer.appendChild(title);

    var elem = document.createElement('input');
    elem.type = 'checkBox';
    elem.className = 'inspector-input inspector-input-checkbox ' + args.className;
    elem.onchange = function (e) {
        self.updateModelValue();
    }
    propertiesContainer.appendChild(elem);

    //propertiesContainer.appendChild(document.createElement('br'))

}

InspectorInterface.InspectorButton = function (args) {

    var self = this;
    self.isActiveFn = args.isActiveFn;
    self.buttonAction = args.buttonAction;

    self.name = args.tooltipTitle;
    self.icon = "url("+args.icon+")";

    self.updateViewValue = function () {
        if(self.isActiveFn()) {
            elem.style.display = 'block';
        } else {
            elem.style.display = 'none';
        }
    }

    var elem = document.createElement('div');
    elem.className = 'inspector-button tooltipElem inspector-button-' + args.colorClass;
    elem.style.backgroundImage = self.icon;
    elem.onclick = function () {
        self.buttonAction();
    }
    elem.setAttribute('alt', args.tooltipTitle);
    buttonsContainer.appendChild(elem);

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
    buttonsContainer.appendChild(elem);

}
