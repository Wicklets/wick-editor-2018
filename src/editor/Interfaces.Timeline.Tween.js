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

TimelineInterface.Tween = function (wickEditor, timeline) {
    var self = this;

    self.wickTween = null;
    self.wickFrame = null;
    self.wickObject = null;

    this.build = function () {
        /*console.log(self.wickTween)
        console.log(self.wickFrame)*/

        self.elem = document.createElement('div');
        self.elem.className = 'tween';

        self.elem.addEventListener('mousedown', function (e) {
            //console.log(e)
            e.stopPropagation();

            wickEditor.actionHandler.doAction('movePlayhead', {
                obj: wickEditor.project.currentObject,
                newPlayheadPosition: self.wickFrame.playheadPosition + self.wickTween.playheadPosition,
                newLayer: wickEditor.project.getCurrentLayer()
            });

            /*wickEditor.project.deselectObjectType(WickTween);
            wickEditor.project.selectObject(self.wickTween);
            wickEditor.project.selectObject(self.wickObject);*/
            wickEditor.project.selectObject(self.wickFrame);
            wickEditor.syncInterfaces();

            timeline.interactions.start("dragTweens", e, {
                tweens: [self]
            });
        }); 
    }

    this.update = function () {
        //if(!wickEditor.project.isObjectSelected(self.wickObject)) {
            //self.elem.style.display = 'none';
            //return;
        //}

        /*if(wickEditor.project.isObjectSelected(self.wickTween)) {
            //self.elem.style.backgroundColor = 'green';
            self.elem.style.opacity = 1.0;
        } else {
            //self.elem.style.backgroundColor = 'rgba(0,0,0,0)';
            self.elem.style.opacity = 0.3;
        }*/
        self.elem.style.opacity = 1.0;

        //self.elem.style.display = 'block';

        var baseX = self.wickTween.playheadPosition*cssVar('--frame-width');
        var paddingX = cssVar('--frame-width')/2 - 10;
        //if(!timeline.interactions.getCurrent())
        self.elem.style.left = (baseX+paddingX)+"px";

        var baseY = 0;
        var paddingY = cssVar('--layer-height')/2 - 10 - 2;
        self.elem.style.top = baseY+paddingY+"px";

        //self.elem.style.width = cssVar('--frame-width')+"px";
        //self.elem.style.height = cssVar('--layer-height')+'px';
    }
}