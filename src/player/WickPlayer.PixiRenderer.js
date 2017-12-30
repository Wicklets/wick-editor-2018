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

var WickPixiRenderer = function (canvasContainer) {

    var self = this;

    var SVG_SCALE = 1.4;

    var renderer = PIXI.autoDetectRenderer(100, 100, {
        backgroundColor : "#FFFFFF", 
        resolution: window.devicePixelRatio,
        preserveDrawingBuffer: true,
        antialias: true,
        transparent: true,
    });
    renderer.clearBeforeRender = true;
    renderer.roundPixels = false;
    renderer.view.setAttribute('tabindex', 0);

    canvasContainer.appendChild(renderer.view);
    renderer.view.focus();

    var currentProjectUUID = null;
    var container = new PIXI.Container();
    var pixiSprites = {};
    var pixiTextures = {};

    var wickProject;

    var graphics = new PIXI.Graphics();
    
    container.addChild(graphics);

    self.renderWickObjects = function (project, wickObjects, renderExtraSpace, fitToScreen) {
        window._lastRender = {
            project: project,
            wickObjects: wickObjects, 
            renderExtraSpace: renderExtraSpace
        }
        if(!renderExtraSpace) renderExtraSpace = 1;

        graphics.clear();
        graphics.beginFill(parseInt(project.backgroundColor.replace("#","0x")));
        graphics.moveTo(0, 0);
        graphics.lineTo(project.width, 0);
        graphics.lineTo(project.width, project.height);
        graphics.lineTo(0, project.height);
        graphics.endFill();

        wickProject = project;

        if(currentProjectUUID !== project.uuid) {
            currentProjectUUID = project.uuid;
            preloadAllAssets(project);
        }

        if(fitToScreen) {
            var w = window.innerWidth;
            var h = window.innerHeight;
            canvasContainer.style.width  = w + 'px';
            canvasContainer.style.height = h + 'px';
            renderer.resize(w, h);
            renderer.view.style.width  = w + "px";
            renderer.view.style.height = h + "px";
            container.scale.x = w / project.width;
            container.scale.y = h / project.height;
        } else {
            container.position.x = 0;
            container.position.y = 0;
            renderer.resize(project.width*renderExtraSpace, project.height*renderExtraSpace);
            renderer.view.style.width  = project.width*renderExtraSpace  + "px";
            renderer.view.style.height = project.height*renderExtraSpace + "px";
            if(renderer.width !== project.width || renderer.height !== project.height) {
                renderer.resize(project.width*renderExtraSpace, project.height*renderExtraSpace);
                renderer.view.style.width  = project.width*renderExtraSpace  + "px";
                renderer.view.style.height = project.height*renderExtraSpace + "px";

                if(renderExtraSpace !== 1) {
                    container.position.x = project.width/renderExtraSpace;
                    container.position.y = project.height/renderExtraSpace;
                }
            }
        }

        for (uuid in pixiSprites) {
            pixiSprites[uuid].visible = false;
        }

        wickObjects.forEach(function (wickObject) {
            renderWickObject(wickObject);
        });
        renderer.render(container);
    }

    function renderWickObject (wickObject) {
        var sprite = pixiSprites[wickObject.uuid];
        if(!sprite && !wickObject.isSymbol) {
            createPixiSprite(wickObject);
        }
        if(sprite && wickObject._renderDirty && wickObject.isPath) {
            regenPixiPath(wickObject, sprite);
            wickObject._renderDirty = false;
        }
        if(sprite && wickObject._renderDirty && wickObject.isText) {
            sprite = regenPixiText(wickObject, sprite);
            wickObject._renderDirty = false;
        }
        if(sprite) {
            sprite.visible = true;
            sprite.anchor = new PIXI.Point(0.5, 0.5);
            var textureScale = (wickObject.pathData || wickObject.isText ? SVG_SCALE : 1);

            var absTransforms = wickObject.getAbsoluteTransformations();
            var textOffset = wickObject.isText ? 
                rotate_point(sprite.textboxOffset, 0, 0, 0, absTransforms.rotation) :
                {x:0,y:0};
            sprite.position.x = absTransforms.position.x - textOffset.x;
            sprite.position.y = absTransforms.position.y - textOffset.y;
            sprite.rotation = absTransforms.rotation/360*2*3.14159;
            sprite.scale.x = absTransforms.scale.x/textureScale;
            sprite.scale.y = absTransforms.scale.y/textureScale;
            sprite.alpha = absTransforms.opacity;
            sprite.scale.x *= (absTransforms.flip.x ? -1 : 1);
            sprite.scale.y *= (absTransforms.flip.y ? -1 : 1);
            if(wickObject._renderAsBGObject) sprite.tint = 0xCCCCCC;
            //sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
        }

        wickObject.getAllActiveChildObjects().forEach(function (child) {
            renderWickObject(child);
        });
    }

    function preloadAllAssets (project) {
        project.getAllObjects().forEach(function (wickObject) {
            createPixiSprite(wickObject);
        })
    }

    function createPixiSprite (wickObject) {
        if(wickObject.sourceUUID) {
            var pixiTexture = pixiTextures[wickObject.sourceUUID];
            if(pixiTexture) {
                var pixiSprite = new PIXI.Sprite(pixiTexture);
                wickObject.alphaMask = wickProject.getObjectByUUID(wickObject.sourceUUID).alphaMask
                container.addChild(pixiSprite);
                pixiSprites[wickObject.uuid] = pixiSprite;
                pixiSprites[wickObject.uuid].visible = false;
                return;
            }
        }

        var type;

        if (wickObject.asset && wickObject.asset.type === 'image') {
            type = 'image';
        } else if (wickObject.isPath && wickObject.pathData) {
            type = 'svg';
        } else if (wickObject.isText) {
            type = 'text';
        }

        if(type) {
            var newPixiSprite = WickToPixiSprite[type](wickObject);
            container.addChild(newPixiSprite);
            pixiSprites[wickObject.uuid] = newPixiSprite;

            var textureSrc = newPixiSprite.texture.baseTexture.imageUrl;
            if(textureSrc)
                wickObject.generateAlphaMask(textureSrc);
        }
    }

    function regenPixiPath (wickObject, pixiSprite) {
        var base64svg = getBase64SVG(wickObject);
        var texture = PIXI.Texture.fromImage(base64svg, undefined, undefined, SVG_SCALE);
        pixiSprite.setTexture(texture);
    }

    function regenPixiText (wickObject, pixiSprite) {
        container.removeChild(pixiSprite);
        var newPixiText = WickToPixiSprite['text'](wickObject);
        container.addChild(newPixiText);
        pixiSprites[wickObject.uuid] = newPixiText;
        return newPixiText;
    }

    var WickToPixiSprite = {
        'image': function (wickObject) {
            var pixiTexture = PIXI.Texture.fromImage(wickObject.asset.getData());
            var pixiSprite = new PIXI.Sprite(pixiTexture);
            pixiTextures[wickObject.uuid] = pixiTexture;
            return pixiSprite;
        },
        'svg': function (wickObject) {
            var base64svg = getBase64SVG(wickObject);
            var pixiTexture = PIXI.Texture.fromImage(base64svg, undefined, undefined, SVG_SCALE);
            var newSprite = new PIXI.Sprite(pixiTexture);
            newSprite.texture.baseTexture.on('loaded', function(){
                self.renderWickObjects(
                    window._lastRender.project, 
                    window._lastRender.wickObjects, 
                    window._lastRender.renderExtraSpace)
            });
            pixiTextures[wickObject.uuid] = pixiTexture;
            return newSprite;
        },
        'text': function (wickObject) {
            var textData = wickObject.textData;
            var style = {
                font : textData.fontWeight + " " + textData.fontStyle + " " + (textData.fontSize*SVG_SCALE) + "px " + textData.fontFamily,
                fill : textData.fill,
                wordWrap : true,
                wordWrapWidth : wickObject.width*SVG_SCALE,
                align: textData.textAlign,
            };
            var pixiText = new PIXI.Text(textData.text, style);
            var textWidth = pixiText.width/SVG_SCALE;
            var textboxWidth = wickObject.width;
            if(textData.textAlign === 'left') {
                pixiText.textboxOffset = (textboxWidth-textWidth)/2;
            } else if (textData.textAlign === 'center') {
                pixiText.textboxOffset = 0;
            } else if (textData.textAlign === 'right') {
                pixiText.textboxOffset = -(textboxWidth-textWidth)/2;
            }
            return pixiText;
        }
    }

    function getBase64SVG (wickObject) {
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
        return base64svg;
    }

};

