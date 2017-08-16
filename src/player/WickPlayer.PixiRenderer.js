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

var WickPixiRenderer = function () {

    var self = this;

    var renderer;
    var stage;

    var renderScale;

    var wickToPixiDict;

    var project;

    var canvasContainer;

    var dirty;

    self.canvasScale;
    self.canvasTranslate;
    self.rendererView;

    self.setProject = function (wickProject) {
        dirty = true;

        project = wickProject;

        if(renderer) {
            self.refresh(project.rootObject);
            resizeCanvas();
        }

        dirty = false;
    }

    self.setup = function () {

        renderScale = 1;

        canvasContainer = window.rendererCanvas;

        // update canvas size on window resize
        window.addEventListener('resize', resizeCanvas, false);

        var rendererOptions = {
            backgroundColor : "#DDDDDD", 
            resolution: window.devicePixelRatio,
            preserveDrawingBuffer: true,
            antialias: true,
        };
        renderer = PIXI.autoDetectRenderer(project.width*renderScale, project.height*renderScale, rendererOptions);
        renderer.clearBeforeRender = false;
        renderer.roundPixels = false;//project.pixelPerfectRendering;
        renderer.view.setAttribute('tabindex', 0);
        /*$(renderer.view).click(function() { this.focus(); });*/



        // Add renderer canvas
        canvasContainer.appendChild(renderer.view);
        renderer.view.id = "rendererCanvas";
        self.rendererView = renderer.view;
        renderer.view.focus()

        stage = new PIXI.Container();

        self.canvasScale = 1.0;
        self.canvasTranslate = {x : 0, y : 0};

        resizeCanvas();

        wickToPixiDict = {};
        //generatePixiScene(project.rootObject);

        // Fix focus issues
        /*self.rendererView.className = ''
        setTimeout(function () {
            $('#rendererCanvas').focus();
        }, 100);
        $(document).on('focus', 'input[readonly]', function () {
            this.blur();
        });*/

    }

    self.render = function (wickObjects) {

        if(!renderer) return;

        if(renderer.width !== project.width || renderer.height !== project.height)
            renderer.resize(project.width, project.height);
        renderer.view.style.width  = project.width * self.canvasScale + "px";
        renderer.view.style.height = project.height * self.canvasScale + "px";

        if(window.wickEditor
        || document.activeElement === document.getElementById('rendererCanvas')
        || document.activeElement === document.getElementById('playerCanvasContainer')) {
            // Dimming the player when it's not focused is disabled for now
            //rendererCanvas.style.filter = 'none';
        } else {
            //rendererCanvas.style.filter = 'brightness(.85)';
        }
        rendererCanvas.style.filter = 'none';

        var graphics = new PIXI.Graphics();
        graphics.beginFill(parseInt(project.backgroundColor.replace("#","0x")));
        graphics.drawRect(0, 0, project.width, project.height);
        graphics.endFill();
        renderer.render(graphics);

        for(uuid in wickToPixiDict) {
            wickToPixiDict[uuid].visible = false;
        }

        /*wickObjects.forEach(function (wickObject) {
            wickObject.getAllChildObjectsRecursive().forEach(function (child) {
                resetTransforms(child);
            });
        });*/

        var resetParent = function (parent) {
            resetTransforms(parent);
            if(parent.parentObject) resetParent(parent.parentObject);
        }

        var resetObject = function (object) {
            resetTransforms(object);
            if(object.isSymbol) {
                object.getAllActiveChildObjects().forEach(function (child) {
                    resetObject(child);
                });
            }
        }

        wickObjects.forEach(function (wickObject) {
            resetObject(wickObject);
            if(wickObject.parentObject) resetParent(wickObject.parentObject)
        });
    
        renderer.render(wickToPixiDict[project.rootObject.uuid]);
    }

    self.clear = function () {
        
    }

    self.refresh = function (wickObject) {

        if (dirty || wickObject._renderDirty) {
            pixiObjectExists = false;
            wickObject._renderDirty = false;
            
            var eraseThisObj = wickToPixiDict[wickObject.uuid];
            if(eraseThisObj && eraseThisObj.parent) {
                eraseThisObj.parent.removeChild(eraseThisObj);
            }
        } else {
            pixiObjectExists = wickToPixiDict[wickObject.uuid] !== undefined;
        }

        if(pixiObjectExists) {
            if(wickObject.isSymbol) {
                wickObject.getAllChildObjects().forEach(function (child) {
                    self.refresh(child);
                });
            }
            return;
        }

        var pixiObject;

        if (wickObject.isSymbol) {

            pixiObject = new PIXI.Container();

        } else if (wickObject.asset && wickObject.asset.type === 'image') {

            pixiObject = PIXI.Sprite.fromImage(wickObject.asset.getData());
            //wickObject.generateAlphaMask(pixiObject.texture.baseTexture.imageUrl);

        } else if (wickObject.pathData) {
            //wickObject.x = Math.floor(wickObject.x);
            //wickObject.y = Math.floor(wickObject.y);

            var parser = new DOMParser();
            var x = (wickObject.svgX || 0);
            var y = (wickObject.svgY || 0);
            if(!wickObject.svgStrokeWidth) wickObject.svgStrokeWidth = 0;
            x -= wickObject.svgStrokeWidth/2;
            y -= wickObject.svgStrokeWidth/2;
            var w = (wickObject.width  + wickObject.svgStrokeWidth*1);
            var h = (wickObject.height + wickObject.svgStrokeWidth*1);
            var svgDoc = parser.parseFromString('<svg id="svg" viewBox="'+x+' '+y+' '+w+' '+h+'" version="1.1" width="'+w+'" height="'+h+'" xmlns="http://www.w3.org/2000/svg">'+wickObject.pathData+'</svg>', "image/svg+xml");
            var s = new XMLSerializer().serializeToString(svgDoc);
            var base64svg = 'data:image/svg+xml;base64,' + window.btoa(s);
            
            pixiObject = PIXI.Sprite.fromImage(base64svg);
            wickObject.generateAlphaMask(pixiObject.texture.baseTexture.imageUrl);

        } else if (wickObject.textData) {

            var style = {
                font : wickObject.textData.fontWeight + " " + wickObject.textData.fontStyle + " " + wickObject.textData.fontSize + "px " + wickObject.textData.fontFamily,
                fill : wickObject.textData.fill,
                wordWrap : true,
                wordWrapWidth : 1440,
                align: wickObject.textData.textAlign
            };
            pixiObject = new PIXI.Text(wickObject.textData.text, style);

        }

        if(!pixiObject) return;
        wickToPixiDict[wickObject.uuid] = pixiObject;

        if(wickObject.parentObject) {
            var parentObject = wickToPixiDict[wickObject.parentObject.uuid];
            if(!parentObject) {
                self.refresh(wickObject.parentObject);
            }
            wickToPixiDict[wickObject.parentObject.uuid].addChild(pixiObject)
        }

        if(wickObject.isSymbol) {
            wickObject.getAllChildObjects().forEach(function (child) {
                self.refresh(child);
            });
        }

    }

    var resetTransforms = function (wickObject) {

        //console.log('R ' + wickObject.uuid.substring(0,2));

        var pixiObject = wickToPixiDict[wickObject.uuid];
        if(!pixiObject) return;

        if(!wickObject.alphaMask && wickObject.asset && (wickObject.asset.type === 'image' || wickObject.asset.type === 'path')) wickObject.generateAlphaMask(pixiObject.texture.baseTexture.imageUrl);

        pixiObject.visible = true;
        pixiObject.anchor = new PIXI.Point(0.5, 0.5);
        pixiObject.position.x = wickObject.x//Math.round(wickObject.x);
        pixiObject.position.y = wickObject.y//Math.round(wickObject.y);
        pixiObject.rotation = wickObject.rotation/360*2*3.14159;
        pixiObject.scale.x = wickObject.scaleX;
        pixiObject.scale.y = wickObject.scaleY;
        if(wickObject.isRoot) {
            pixiObject.scale.x *= renderScale;
            pixiObject.scale.y *= renderScale;
        }
        pixiObject.alpha = wickObject.opacity;
        if(wickObject.flipX) pixiObject.scale.x *= -1;
        if(wickObject.flipY) pixiObject.scale.y *= -1;

    }

    self.setText = function (wickObject, newText) {
        var pixiObject = wickToPixiDict[wickObject.uuid];
        if(!pixiObject) return;
        pixiObject.text = ""+newText
        pixiObject.calculateBounds(); 
        wickObject.width = pixiObject.width; 
        wickObject.height = pixiObject.height;
    }

    self.requestFullscreen = function () {
        wickPlayer.fullscreenRequested = true;
    }

    self.enterFullscreen = function () {
        var elem;

        if(window.self !== window.top) {
            // Inside iframe
            elem = window.frameElement;
            console.log(elem)
        } else {
            // Not inside iframe
            elem = self.rendererView;
        }

        if (screenfull.enabled) {
            screenfull.request(elem);
        }
    }

    var resizeCanvas = function () {

        if(window.wickEditor) return;

        if(project && project.fitScreen) {
            // Calculate how much the project would have to scale to fit either dimension
            widthRatio  = window.innerWidth  / project.width;
            heightRatio = window.innerHeight / project.height;

            // Fit only so much that stuff doesn't get cut off
            if(widthRatio > heightRatio) {
                self.canvasScale = heightRatio;
            } else {
                self.canvasScale = widthRatio;
            }

            renderer.view.style.width  = project.width * self.canvasScale + "px";
            renderer.view.style.height = project.height * self.canvasScale + "px";

            if(widthRatio > heightRatio) {
                var offset = (window.innerWidth - project.width * self.canvasScale) / 2;
                canvasContainer.style.paddingLeft = offset + "px";
                canvasContainer.style.paddingTop  = "0px";
            } else {
                var offset = (window.innerHeight - project.height * self.canvasScale) / 2;
                canvasContainer.style.paddingLeft = "0px";
                canvasContainer.style.paddingTop  = offset + "px";
            }
        } else {
            renderer.view.style.width  = project.width + "px";
            renderer.view.style.height = project.height + "px";

            var offsetX = (window.innerWidth  - project.width) / 2;
            var offsetY = (window.innerHeight - project.height) / 2;

            canvasContainer.style.paddingLeft   = offsetX + "px";
            canvasContainer.style.paddingRight  = offsetX + "px";
            canvasContainer.style.paddingTop    = offsetY + "px";
            canvasContainer.style.paddingBottom = offsetY + "px";
        }

    }

    this.cleanup = function() {
        /*
        window.removeEventListener('resize', resizeCanvas);

        // Get rid of old canvas
        var oldRendererCanvas = self.rendererView
        if(oldRendererCanvas) {
            canvasContainer.removeChild(canvasContainer.childNodes[0]);
        }

        //https://gist.github.com/anonymous/b910bbb0cfea82bcf880
        renderer.plugins.interaction.destroy();
        renderer = null;
        stage.destroy(true);
        stage = null;
        //document.body.removeChild(view);
        view = null;

        for (var textureId in PIXI.utils.TextureCache) {
            //console.log(textureId)
            PIXI.utils.BaseTextureCache[textureId].destroy(true);
        }
        */
    }

};