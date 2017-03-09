/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var WickPixiRenderer = function (project, canvasContainer, scale, args) {

    var self = this;

    var renderer;
    var stage;

    var renderScale;

    var wickToPixiDict;

    self.canvasScale;
    self.canvasTranslate;
    self.rendererCanvas;

    self.setup = function () {

        renderScale = scale
        if(!renderScale) renderScale = 1;

        // update canvas size on window resize
        window.addEventListener('resize', resizeCanvas, false);

        var rendererOptions = {
            backgroundColor : "#DDDDDD", 
            resolution: window.devicePixelRatio,
            preserveDrawingBuffer:true,
        };
        renderer = PIXI.autoDetectRenderer(project.width*renderScale, project.height*renderScale, rendererOptions);
        renderer.clearBeforeRender = false;
        renderer.roundPixels = project.pixelPerfectRendering;
        renderer.view.setAttribute('tabindex', 0);
        $(renderer.view).click(function() { this.focus(); });


        // Add renderer canvas
        canvasContainer.appendChild(renderer.view);
        renderer.view.id = "rendererCanvas";
        self.rendererCanvas = renderer.view;

        stage = new PIXI.Container();

        self.canvasScale = 1.0;
        self.canvasTranslate = {x : 0, y : 0};

        resizeCanvas();

        wickToPixiDict = {};
        //generatePixiScene(project.rootObject);

        if(window.wickEditor) {
            if(project.borderColor) document.getElementById('builtinPlayer').style.backgroundColor = project.borderColor;
        } else {
            if(project.borderColor) document.body.style.backgroundColor = project.borderColor;
        }
        // Fix focus issues
        self.rendererCanvas.className = ''
        setTimeout(function () {
            $('#rendererCanvas').focus();
        }, 100);
        $(document).on('focus', 'input[readonly]', function () {
            this.blur();
        });

    }

    self.render = function (wickObjects) {

        if(!renderer) return;

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

    self.refresh = function (wickObject) {

        var pixiObjectExists = wickToPixiDict[wickObject.uuid] !== undefined;

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

        } else if (wickObject.imageData) {

            pixiObject = PIXI.Sprite.fromImage(wickObject.imageData);
            wickObject.generateAlphaMask(pixiObject.texture.baseTexture.imageUrl);

        } else if (wickObject.pathData) {

            var parser = new DOMParser();
            var svgDoc = parser.parseFromString('<svg id="svg" viewBox="'+(0)+' '+(0)+' '+(wickObject.width)+' '+(wickObject.height)+'" version="1.1" width="'+(wickObject.width)+'" height="'+(wickObject.height)+'" xmlns="http://www.w3.org/2000/svg">'+wickObject.pathData+'</svg>', "image/svg+xml");
            var s = new XMLSerializer().serializeToString(svgDoc)
            var base64svg = 'data:image/svg+xml;base64,' + window.btoa(s);
            
            pixiObject = PIXI.Sprite.fromImage(base64svg);
            wickObject.generateAlphaMask(pixiObject.texture.baseTexture.imageUrl);

        } else if (wickObject.fontData) {

            var style = {
                font : wickObject.fontData.fontWeight + " " + wickObject.fontData.fontStyle + " " + wickObject.fontData.fontSize + "px " + wickObject.fontData.fontFamily,
                fill : wickObject.fontData.fill,
                wordWrap : true,
                wordWrapWidth : 1440,
            };
            pixiObject = new PIXI.Text(wickObject.fontData.text, style);

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

        pixiObject.visible = true;
        pixiObject.anchor = new PIXI.Point(0.5, 0.5);
        pixiObject.position.x = Math.round(wickObject.x);
        pixiObject.position.y = Math.round(wickObject.y);
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

    self.enterFullscreen = function () {
        var elem;

        if(window.self !== window.top) {
            // Inside iframe
            elem = window.frameElement;
            console.log(elem)
        } else {
            // Not inside iframe
            elem = self.rendererCanvas;
        }

        if (screenfull.enabled) {
            screenfull.request(elem);
        }
    }

    var resizeCanvas = function () {

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
        window.removeEventListener('resize', resizeCanvas);

        // Get rid of old canvas
        var oldRendererCanvas = self.rendererCanvas
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
    }

};