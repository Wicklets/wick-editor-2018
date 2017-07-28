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

var WickHTMLElemInjector = function (project) {

    var self = this;

    var htmlElems;

    self.setup = function () {
        htmlElems = [];
        project.getAllObjects().forEach(function (wickObject) {
            if(!wickObject.htmlElemData) return;

            var elem = document.createElement(wickObject.htmlElemData.tagName);
            elem.style.position = 'absolute';
            elem.style.top = '0px';
            elem.style.left = '0px';
            elem.width = wickObject.width;
            elem.height = wickObject.height;
            elem.style.width = (wickObject.width+5)+'px';
            elem.style.height = wickObject.height+'px';
            if(wickObject.textData) {
                elem.type = 'text';
                elem.value = wickObject.textData.text;
                elem.style.fontSize = wickObject.textData.fontSize;
                elem.style.fontFamily = wickObject.textData.fontFamily;
                elem.fontStyle = wickObject.textData.fontStyle;
                elem.fontWeight = wickObject.textData.fontWeight;
                elem.fontColor = wickObject.textData.fill;
                elem.style.display = 'none';
            }
            document.body.appendChild(elem);
            htmlElems[wickObject.uuid] = elem;
        });
    }

    self.update = function () {
        for( uuid in htmlElems ) {
            var elem = htmlElems[uuid];
            var wickObject = project.getObjectByUUID(uuid);
            if(!wickObject) return;
            if(wickObject.isActive()) {
                if(wickObject.textData) {
                    wickObject.inputValue = elem.value;
                }
                var transform = buildCSSTransformValueFromWickObject(wickObject);
                elem.style.transform = transform;
                elem.style.display = 'block';
            } else {
                elem.style.display = 'none';
            }
        };
    }

    // util

    var buildCSSTransformValueFromWickObject = function (wickObject) {
        var absPos = wickObject.getAbsolutePositionTransformed();
        var absScale = wickObject.getAbsoluteScale();
        var absRotate = wickObject.getAbsoluteRotation();
        absPos.x -= wickObject.width/2;
        absPos.y -= wickObject.height/2;
        return buildCSSTransformValue(absPos.x, absPos.y, absScale.x, absScale.y, absRotate)
    }

    var buildCSSTransformValue = function (x, y, scaleX, scaleY, rotate) {
        var transform = "";
        transform += "translateX("+x+"px) "
        transform += "translateY("+y+"px) "
        transform += "scaleX("+scaleX+") "
        transform += "scaleY("+scaleY+") "
        transform += "rotate("+rotate+"deg) "
        return transform;
    }

};