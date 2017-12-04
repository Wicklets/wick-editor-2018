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
    
var BreadcrumbsInterface = function (wickEditor) {

    var breadcrumbsDiv = document.getElementById('breadcrumbsGUI');

    this.setup = function () {
        
    }

    this.syncWithEditorState = function () {

        breadcrumbsDiv.innerHTML = "";

        wickEditor.project.getCurrentObject().getParents().forEach(function (object) {
            createButton(object);
        })

    }

    var createButton = function (wickObject) {

        var title;
        if(wickObject.isRoot) {
            title = "Project";
        } else {
            var spacer = document.createElement('div');
            spacer.className = "breadcrumbs-spacer";
            spacer.innerHTML = "/";
            breadcrumbsDiv.appendChild(spacer);

            title = wickObject.name;
        }

        var button = document.createElement('div');
        button.className = 'breadcrumbs-button';
        button.onclick = function () {
            wickEditor.actionHandler.doAction('editObject', { objectToEdit: wickObject });
        }
        button.innerHTML = title;

        breadcrumbsDiv.appendChild(button);

    }

}