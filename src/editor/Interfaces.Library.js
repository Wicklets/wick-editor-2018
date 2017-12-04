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
    
var LibraryInterface = function (wickEditor) {

    var self = this;

    var selectedNode;
    var draggedNode;

    var draggedAssetElem;
    var isDraggingAsset = false; 

    this.setup = function () {
        //$("#tree").fancytree();
        $("#tree").mousedown(function() {
            wickEditor.project.clearSelection();
            //wickEditor.syncInterfaces();
        });
        
        $("#tree").mousedown(function() {
            wickEditor.project.clearSelection();
            //wickEditor.syncInterfaces();
        });

        $("#tree").fancytree({
            extensions: ["filter"],
            filter: { 
                counter: false, 
                mode: "hide",
            },
            //checkbox: true,
            selectMode: 1,
            //source: SOURCE,
            activate: function(event, data) {
                selectedNode = data.node;
                //console.log(data.node)
                //console.log(data.node.data)
            },
            select: function(event, data) {
                // Display list of selected nodes
                //var s = data.tree.getSelectedNodes().join(", ");
                //console.log(s);
            },
            dblclick: function(event, data) {
                //data.node.toggleSelected();
            },
            /*keydown: function(event, data) {
                if( event.which === 32 ) {
                    data.node.toggleSelected();
                    return false;
                }
            }*/
        });

        // Setup Filter
        treeFilterInput = document.getElementById('treeFilterInput'); 

        treeFilterInput.addEventListener('change', function () {
              $("#tree").fancytree("getTree").filterNodes(treeFilterInput.value); 
        });

        draggedAssetElem = document.createElement('div');
        draggedAssetElem.id = 'draggedAsset';
        document.getElementById('tree').addEventListener('mousedown', function (e) {
            draggedNode = selectedNode;
            draggedAssetElem.style.display = 'block';
            var asset = self.getSelectedAsset();
            if (!asset) return; 
            
            var assetURL;
            if(asset.type === 'image') {
                assetURL = asset.data;
            } else if(self.getSelectedAsset().type === 'audio') {
                assetURL = 'resources/icon_sound_canvas.png';
            }
            draggedAssetElem.style.backgroundImage = 'url('+assetURL+')';
            isDraggingAsset = true; 
        });
        window.addEventListener('mouseup', function (e) {
            if(!draggedNode) return;
            draggedNode = null;
            draggedAssetElem.style.display = 'none';
            if(e.target.nodeName === 'CANVAS') {
                wickEditor.guiActionHandler.doAction("createObjectFromAsset", {
                    asset: self.getSelectedAsset(),
                    x: e.x,
                    y: e.y
                });
            } 
            isDraggingAsset = false; 
        });
        window.addEventListener('mousemove', function (e) {
            if(!draggedAssetElem) return;
            draggedAssetElem.style.left = e.x + 'px';
            draggedAssetElem.style.top = e.y + 'px';
        });
        document.body.appendChild(draggedAssetElem);
    }

    this.syncWithEditorState = function () {
        this.clear();
        this.populate();
    }

    this.populate = function () {

        var newTreeChildren = [];

        var library = wickEditor.project.library;
        for (uuid in library.assets) {
            var asset = library.assets[uuid];
            var iconSrc = {
                image : 'resources/library-image.png',
                audio : 'resources/library-audio.png',
            }[asset.type]
            newTreeChildren.push({ 
                title: asset.filename,
                data: {uuid:asset.uuid},
                icon: iconSrc,
            });
        }

        $("#tree").fancytree("getRootNode").addChildren(newTreeChildren);

    }

    this.clear = function () {

        var node = $("#tree").fancytree("getRootNode");

        while( node.hasChildren() ) {
            node.getFirstChild().remove();
        }
        
    }

    this.isSelected = function () {
        return (document.activeElement.className.includes('fancytree'));
    }

    this.getSelectedAsset = function () {
        if (!selectedNode) return; 
        return wickEditor.project.library.getAsset(selectedNode.data.uuid)
    }

    this.isDraggingAsset = function () {
        return isDraggingAsset; 
    }

}