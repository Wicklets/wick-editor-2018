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

var ScriptingIDEReference = function (scriptingIDE, wickEditor) {

// API

    var propButtons = {};

    this.setup = function () {
        var reference = document.getElementById('scriptEditorReference');

        window.wickDocs.forEach(function (section) {
            var referenceGroup = document.createElement('div');
            referenceGroup.className = "sidebarGroup"
            reference.appendChild(referenceGroup);

            var referenceTitle = document.createElement('div');
            referenceTitle.className = 'sidebarTitle';
            referenceTitle.innerHTML = section.name;
            referenceTitle.onclick = function () {
                if(referenceGroup.style.height === 'auto') {
                    referenceGroup.style.height = '16px';
                } else {
                    referenceGroup.style.height = 'auto';
                }
            }
            referenceGroup.appendChild(referenceTitle);

            section.properties.forEach(function (prop) {
                var propertyButton = document.createElement('div');
                propButtons[stripFunctionParams(prop.name)] = propertyButton;
                propertyButton.sectionLabel = referenceTitle;

                propertyButton.className = 'sidebarGroupElement tooltipElem';
                propertyButton.innerHTML = stripFunctionParams(prop.name);
                propertyButton.setAttribute('alt', getPropertyHTML(prop));
                propertyButton.onclick = function () {
                    var cursorPos = scriptingIDE.aceEditor.getCursorPosition();
                    scriptingIDE.aceEditor.session.insert(cursorPos, formatSnippet(prop.snippet));
                    scriptingIDE.aceEditor.focus();
                }
                referenceGroup.appendChild(propertyButton);
            })
        })
    }

    this.highlightPropButton = function (name) {
        for(key in propButtons) {
            propButtons[key].style.boxShadow = '';
            propButtons[key].sectionLabel.style.boxShadow = '';
        }

        var propButton = propButtons[name];
        if(propButton) {
            var borderStyle = 'inset 0px 0px 2px #31E19C'
            propButton.style.boxShadow = borderStyle;
            propButton.sectionLabel.style.boxShadow = borderStyle;
        }
    }

// Helper functions

    var stripFunctionParams = function (name) {
        if(name.indexOf('(') === -1) {
            return name;
        } else {
            return name.split('(')[0];
        }
    }

    var getPropertyHTML = function (prop) {
        return "<strong>" + prop.name + "</strong>" + "<br />" + prop.description;
    }

    var formatSnippet = function (snippet) {
        var cursorCol = scriptingIDE.aceEditor.getCursorPosition().column;

        var shiftOverString = "";
        var i = 0;
        while(i < cursorCol) {
            shiftOverString += ' ';
            i++;
        }

        var snippetLines = snippet.split('\n');
        for(var i = 1; i < snippetLines.length; i++) {
            snippetLines[i] = shiftOverString + snippetLines[i];
        }

        var rebuiltSnippet = snippetLines.join("\n");

        return rebuiltSnippet;
    }

}