/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */





/* VERY IMRPOTANT */
/* This needs to be changed so that it works like AudioPlayer i.e. so that
   the WickObjects don't need to store a reference to their pixi objects,
   there's just a dictionary mapping IDs to Pixi objects */




var rendererContainerEl;
var renderer;
var stage;

var projectFitScreenScale;
var projectFitScreenTranslate;

// http://stackoverflow.com/questions/17410809/how-to-calculate-rotation-in-2d-in-javascript
function rotate(centerPoint, pointToRotate, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (pointToRotate.x - centerPoint.x)) + (sin * (pointToRotate.y - centerPoint.y)) + centerPoint.x,
        ny = (cos * (pointToRotate.y - centerPoint.y)) - (sin * (pointToRotate.x - centerPoint.x)) + centerPoint.y;
    return {x:nx, y:ny};
}

var WickPixiRenderer = function (project) {

	this.setup = function() {

		// update canvas size on window resize
        window.addEventListener('resize', resizeCanvas, false);

	    rendererContainerEl = document.getElementById("playerCanvasContainer");
	    var rendererOptions = {
	        backgroundColor : "#DDDDDD", 
	        resolution: window.devicePixelRatio,
	    };
	    renderer = PIXI.autoDetectRenderer(project.resolution.x, project.resolution.y, rendererOptions);
	    renderer.clearBeforeRender = false;
	    renderer.roundPixels = true;
	    renderer.view.setAttribute('tabindex', 0);
	    $(renderer.view).click(function() { this.focus(); });

	    // Get rid of old canvas (if it exists)
	    var oldRendererCanvas = document.getElementById("rendererCanvas");
	    if(oldRendererCanvas) {
	        rendererContainerEl.removeChild(rendererContainerEl.childNodes[0]);
	    }

	    // Add renderer canvas
	    rendererContainerEl.appendChild(renderer.view);
	    renderer.view.id = "rendererCanvas";

	    stage = new PIXI.Container();

	    projectFitScreenScale = 1.0;
	    projectFitScreenTranslate = {x : 0, y : 0};

	    resizeCanvas();

	    generatePixiScene(project.rootObject);

	}

	this.render = function() {

		if(!renderer) return;

	    var graphics = new PIXI.Graphics();
	    graphics.beginFill(parseInt(project.backgroundColor.replace("#","0x")));
	    graphics.drawRect(0, 0, project.resolution.x, project.resolution.y);
	    graphics.endFill();
	    renderer.render(graphics);

	    resetAllPixiObjects(project.rootObject);
	    updatePixiObjectTransforms(project.rootObject);
	    renderer.render(project.rootObject.pixiContainer);
	}

	this.getRendererElem = function () {
		return renderer.view;
	}

	this.refreshPixiSceneForObject = function (wickObj) {
		//generatePixiScene(wickObj);
		if (wickObj.isSymbol) {
			generatePixiScene(wickObj);
            wickObj.parentObject.pixiContainer.addChild(wickObj.pixiContainer);
		} else if (wickObj.imageData) {
            wickObj.pixiSprite = PIXI.Sprite.fromImage(wickObj.imageData);
            wickObj.parentObject.pixiContainer.addChild(wickObj.pixiSprite);
        } else if (wickObj.pathData) {
        	var parser = new DOMParser();
			var svgDoc = parser.parseFromString('<svg id="svg" x="0" y="0" version="1.1" width="'+project.resolution.x+'" height="'+project.resolution.x+'" xmlns="http://www.w3.org/2000/svg">'+wickObj.pathData+'</svg>', "image/svg+xml");

			var s = new XMLSerializer().serializeToString(svgDoc)
			var base64svg = 'data:image/svg+xml;base64,' + window.btoa(s);
			
			wickObj.pixiSprite = PIXI.Sprite.fromImage(base64svg);
            wickObj.pixiContainer.addChild(wickObj.pixiSprite);
        } else if (wickObj.fontData) {
        	var style = {
                font : subObj.fontData.fontWeight + " " + subObj.fontData.fontStyle + " " + subObj.fontData.fontSize + "px " + subObj.fontData.fontFamily,
                fill : subObj.fontData.fill,
                wordWrap : true,
                wordWrapWidth : 1440,
            };
            wickObj.pixiText = new PIXI.Text(wickObj.fontData.text, style);
            wickObj.parentObject.pixiContainer.addChild(wickObj.pixiText);
        }
	}

	/* Recursively load images of wickObj */
    var generatePixiScene = function (wickObj) {

        wickObj.pixiContainer = new PIXI.Container();

        wickObj.getAllChildObjects().forEach(function(subObj) {
            if (subObj.isSymbol) {
                generatePixiScene(subObj);
                wickObj.pixiContainer.addChild(subObj.pixiContainer);
            } else if (subObj.imageData) {
                subObj.pixiSprite = PIXI.Sprite.fromImage(subObj.imageData);
                wickObj.pixiContainer.addChild(subObj.pixiSprite);
	        } else if (subObj.pathData) {
	        	var parser = new DOMParser();
				var svgDoc = parser.parseFromString('<svg id="svg" x="0" y="0" version="1.1" width="'+project.resolution.x+'" height="'+project.resolution.y+'" xmlns="http://www.w3.org/2000/svg">'+subObj.pathData+'</svg>', "image/svg+xml");

				//console.log(svgDoc)

				var s = new XMLSerializer().serializeToString(svgDoc)
				var base64svg = 'data:image/svg+xml;base64,' + window.btoa(s);

				//console.log(base64svg)
				
				subObj.pixiSprite = PIXI.Sprite.fromImage(base64svg);
	            wickObj.pixiContainer.addChild(subObj.pixiSprite);
            } else if (subObj.fontData) {
            	var fontString = subObj.fontData.fontSize + "px " + subObj.fontData.fontFamily;
            	if(subObj.fontData.fontWeight !== 'normal') fontString = subObj.fontData.fontWeight+" " + fontString;
            	if(subObj.fontData.fontStyle !== 'normal') fontString = subObj.fontData.fontStyle+" " + fontString;
                var style = {
                    font : fontString,
                    fill : subObj.fontData.fill,
                    wordWrap : true,
                    wordWrapWidth : 1440,
                };
                subObj.pixiText = new PIXI.Text(subObj.fontData.text, style);
                wickObj.pixiContainer.addChild(subObj.pixiText);
            }
        });

		/*wickObj.layers.forEach(function (layer) {
			layer.frames.forEach(function (frame) {
				if (frame.pathData === "") return;

				var parser = new DOMParser();
				var svgDoc = parser.parseFromString('<svg id="svg" x="0" y="0" version="1.1" width="'+project.resolution.x+'" height="'+project.resolution.y+'" xmlns="http://www.w3.org/2000/svg">'+frame.pathData+'</svg>', "image/svg+xml");

				var s = new XMLSerializer().serializeToString(svgDoc)
				var base64svg = 'data:image/svg+xml;base64,' + window.btoa(s);
				
				frame.pixiSprite = PIXI.Sprite.fromImage(base64svg);

                wickObj.pixiContainer.addChild(frame.pixiSprite);
			});
		});*/
    }

    var resizeCanvas = function () {

	    if(project && project.fitScreen) {
	        // Calculate how much the project would have to scale to fit either dimension
	        widthRatio  = window.innerWidth  / project.resolution.x;
	        heightRatio = window.innerHeight / project.resolution.y;

	        // Fit only so much that stuff doesn't get cut off
	        if(widthRatio > heightRatio) {
	            projectFitScreenScale = heightRatio;
	        } else {
	            projectFitScreenScale = widthRatio;
	        }

	        renderer.view.style.width  = project.resolution.x * projectFitScreenScale + "px";
	        renderer.view.style.height = project.resolution.y * projectFitScreenScale + "px";

	        if(widthRatio > heightRatio) {
	            var offset = (window.innerWidth - project.resolution.x * projectFitScreenScale) / 2;
	            rendererContainerEl.style.paddingLeft = offset + "px";
	            rendererContainerEl.style.paddingTop  = "0px";
	        } else {
	            var offset = (window.innerHeight - project.resolution.y * projectFitScreenScale) / 2;
	            rendererContainerEl.style.paddingLeft = "0px";
	            rendererContainerEl.style.paddingTop  = offset + "px";
	        }
	    } else {
	        renderer.view.style.width  = project.resolution.x + "px";
	        renderer.view.style.height = project.resolution.y + "px";

	        var offsetX = (window.innerWidth  - project.resolution.x) / 2;
	        var offsetY = (window.innerHeight - project.resolution.y) / 2;

	        rendererContainerEl.style.paddingLeft   = offsetX + "px";
	        rendererContainerEl.style.paddingRight  = offsetX + "px";
	        rendererContainerEl.style.paddingTop    = offsetY + "px";
	        rendererContainerEl.style.paddingBottom = offsetY + "px";
	    }

	}

	this.deleteObject = function (wickObj) {
		var pixiObj = wickObj.pixiContainer || wickObj.pixiText || wickObj.pixiSprite;
		//wickObj.parentObject.pixiContainer.removeChild(pixiObj);
		// No easy way to bring it back so just hide it for now
		pixiObj.visible = false;
	}

	var resetAllPixiObjects = function (wickObj) {

		/*wickObj.layers.forEach(function (layer) {
			layer.frames.forEach(function (frame) {
				if(frame.pixiSprite) frame.pixiSprite.visible = false;
			});
		});*/

	    wickObj.getAllChildObjects().forEach(function(subObj) {
	        if(subObj.pixiSprite) {
	            subObj.pixiSprite.visible = false;
	        }
	        if(subObj.pixiText) {
	            subObj.pixiText.visible = false;
	        }
	        if(subObj.pixiContainer) {
	            subObj.pixiContainer.visible = false;
	        }

	        if(subObj.isSymbol) {
	            resetAllPixiObjects(subObj);
	        }
	    });

	}

	var updatePixiObjectTransforms = function (wickObj) {

	    if(wickObj.isSymbol) {
	    	/*var frame = wickObj.getCurrentFrame();
	    	if(frame.pixiSprite) frame.pixiSprite.visible = true;*/

	        wickObj.pixiContainer.visible = true;
	        //if(!wickObj.isRoot) {
	            wickObj.pixiContainer.anchor = new PIXI.Point(0.5, 0.5);
	            wickObj.pixiContainer.position.x = wickObj.x//Math.round(wickObj.x);
	            wickObj.pixiContainer.position.y = wickObj.y//Math.round(wickObj.y);
	            wickObj.pixiContainer.rotation = wickObj.angle/360*2*3.14159;
	            wickObj.pixiContainer.scale.x = wickObj.scaleX;
	            wickObj.pixiContainer.scale.y = wickObj.scaleY;
	            wickObj.pixiContainer.alpha = wickObj.opacity;
	            
	            if(wickObj.flipX) { 
	            	wickObj.pixiContainer.scale.x *= -1;
	            	/*var m = {x:wickObj.width*wickObj.scaleX, y:0};
	            	var r = rotate({x:0,y:0},m,-wickObj.angle);
	            	wickObj.pixiContainer.position.x += r.x;
	            	wickObj.pixiContainer.position.y += r.y;*/
	            }
	            if(wickObj.flipY) {
	            	wickObj.pixiContainer.scale.y *= -1;
	            	/*var m = {x:0, y:wickObj.height*wickObj.scaleY};
	            	var r = rotate({x:0,y:0},m,-wickObj.angle);
	            	wickObj.pixiContainer.position.x += r.x;
	            	wickObj.pixiContainer.position.y += r.y;*/
	            }
	        //}
	        wickObj.getAllActiveChildObjects().forEach(function(subObj) {
	            updatePixiObjectTransforms(subObj);
	        });
	    } else {
	        if(wickObj.pixiSprite) {
	            wickObj.pixiSprite.visible = true;
	            if(!wickObj.pathData) {
		            wickObj.pixiSprite.anchor = new PIXI.Point(0.5, 0.5);
		            wickObj.pixiSprite.position.x = wickObj.x;
		            wickObj.pixiSprite.position.y = wickObj.y;
		            wickObj.pixiSprite.rotation = wickObj.angle/360*2*3.14159;
		            wickObj.pixiSprite.scale.x = wickObj.scaleX;
		            wickObj.pixiSprite.scale.y = wickObj.scaleY;
		        } else {
		        	wickObj.pixiSprite.position.x = 0;
		        	wickObj.pixiSprite.position.y = 0;
		        	wickObj.pixiSprite.anchor = new PIXI.Point(0, 0);
		        }
	            wickObj.pixiSprite.alpha = wickObj.opacity;

	            if(wickObj.flipX) { 
	            	wickObj.pixiSprite.scale.x *= -1;
	            	/*var m = {x:wickObj.width*wickObj.scaleX, y:0};
	            	var r = rotate({x:0,y:0},m,-wickObj.angle);
	            	wickObj.pixiSprite.position.x += r.x;
	            	wickObj.pixiSprite.position.y += r.y;*/
	            }
	            if(wickObj.flipY) { 
	            	wickObj.pixiSprite.scale.y *= -1;
	            	/*var m = {x:0, y:wickObj.height*wickObj.scaleY};
	            	var r = rotate({x:0,y:0},m,-wickObj.angle);
	            	wickObj.pixiSprite.position.x += r.x;
	            	wickObj.pixiSprite.position.y += r.y;*/
	            }
	        } else if(wickObj.pixiText) {
	            wickObj.pixiText.visible = true;
	            wickObj.pixiText.anchor = new PIXI.Point(0.5, 0.5);
	            wickObj.pixiText.x        = Math.round(wickObj.x);
	            wickObj.pixiText.y        = Math.round(wickObj.y);
	            wickObj.pixiText.rotation = wickObj.angle/360*2*3.14159;
	            wickObj.pixiText.scale.x  = wickObj.scaleX;
	            wickObj.pixiText.scale.y  = wickObj.scaleY;
	            if(wickObj.flipX) wickObj.pixiText.scale.x *= -1;
	            if(wickObj.flipY) wickObj.pixiText.scale.y *= -1;
	            wickObj.pixiText.alpha    = wickObj.opacity;
	        }
	    }

	}

	this.cleanup = function() {
		window.removeEventListener('resize', resizeCanvas);

		//https://gist.github.com/anonymous/b910bbb0cfea82bcf880
		renderer.plugins.interaction.destroy();
		renderer = null;
		stage.destroy(true);
		stage = null;
		//document.body.removeChild(view);
		view = null;

		for (var textureId in PIXI.utils.TextureCache) {
			PIXI.utils.BaseTextureCache[textureId].destroy(true);
		}
	}
};