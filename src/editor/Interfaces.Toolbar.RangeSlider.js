ToolbarInterface.RangeSlider = function (container, alt, iconPath, min, max, valueCallback, getValueFn, isActiveFn, onChangeFn) {

    var self = this;

    var active = false;

    self.valueCallback = valueCallback;
    self.getValueFn = getValueFn;
    self.isActiveFn = isActiveFn || function () { return true; };
    self.onChangeFn = onChangeFn;

    var buttonContainer;
    var buttonValueDisplay;
    var buttonIcon;
    var sliderContainter;
    var slider;
    var clickOutDiv;

    buttonContainer = document.createElement('div');
    buttonContainer.className = 'range-slider-button-container tooltipElem';
    buttonContainer.setAttribute('alt', alt);
    buttonContainer.onclick = function () {
        active = !active;
        wickEditor.syncInterfaces();
    }
    container.appendChild(buttonContainer);

    buttonIcon = document.createElement('div');
    buttonIcon.className = 'range-slider-button-icon';
    buttonIcon.style.backgroundImage = 'url("../resources/'+iconPath+'")'
    buttonContainer.appendChild(buttonIcon);

    buttonValueDisplay = document.createElement('div');
    buttonValueDisplay.className = 'range-slider-button-value-display';
    buttonContainer.appendChild(buttonValueDisplay);

    sliderContainter = document.createElement('div');
    sliderContainter.className = 'range-slider-slider-container';
    sliderContainter.style.display = 'none';
    document.body.appendChild(sliderContainter);

    clickOutDiv = document.createElement('div');
    clickOutDiv.className = 'range-slider-click-out-div';
    clickOutDiv.style.display = 'none';
    clickOutDiv.onclick = function (e) {
        active = false;
        self.valueCallback(slider.noUiSlider.get());
    }
    document.body.appendChild(clickOutDiv);

    var slider = document.createElement('div');
    slider.className = 'noUi-target noUi-ltr noUi-horizontal'
    sliderContainter.appendChild(slider);

    noUiSlider.create(slider, {
        start: [20],
        connect: false,
        behaviour: 'snap',
        range: {
            'min': min,
            'max': max
        }
    });
    slider.noUiSlider.on('slide', function( values, handle ){
        var val = parseInt(values[0]);
        if(self.onChangeFn) self.onChangeFn(val);
        buttonValueDisplay.innerHTML = val;
    });


    self.updateViewValue = function () {

        if(self.isActiveFn()) {
            buttonContainer.style.display = 'block';

            var display =  active ? 'block' : 'none';

            clickOutDiv.style.display = display;

            sliderContainter.style.display = display;
            if(active) {
                sliderContainter.style.left = buttonContainer.getBoundingClientRect().left+40+"px";
                sliderContainter.style.top  = buttonContainer.getBoundingClientRect().top -20+"px";
            }

            slider.noUiSlider.set(self.getValueFn())
            buttonValueDisplay.innerHTML = Math.floor(slider.noUiSlider.get());
        } else {
            buttonContainer.style.display = 'none';
        }

    }

}