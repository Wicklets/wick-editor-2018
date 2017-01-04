/**
 * fabric.canvasex.js
 * @author Jim Ma (https://github.com/mazong1123)
 * Contact: mazong1123@gmail.com
 * License: MIT
 */
(function () {
    'use strict';

    var addListener = fabric.util.addListener;
    var removeListener = fabric.util.removeListener;

    fabric.CanvasEx = fabric.util.createClass(fabric.Canvas, /** @lends fabric.Canvas */ {
        tapholdThreshold: 2000,

        _bindEvents: function () {
            var self = this;

            self.callSuper('_bindEvents');

            self._onDoubleClick = self._onDoubleClick.bind(self);
            self._onTapHold = self._onTapHold.bind(self);
        },

        _onDoubleClick: function (e) {
            var self = this;

            var target = self.findRealTarget(e);
            self.fire('mouse:dblclick', {
                target: target,
                e: e
            });

            if (target && !self.isDrawingMode) {
                // To unify the behavior, the object's double click event does not fire on drawing mode.
                target.fire('object:dblclick', {
                    e: e
                });
            }
        },

        _onTapHold: function (e) {
            var self = this;

            var target = self.findRealTarget(e);
            self.fire('touch:taphold', {
                target: target,
                e: e
            });

            if (target && !self.isDrawingMode) {
                // To unify the behavior, the object's tap hold event does not fire on drawing mode.
                target.fire('taphold', {
                    e: e
                });
            }

            if (e.type === 'touchend' && self.touchStartTimer != null) {
                clearTimeout(self.touchStartTimer);
            }
        },

        _onMouseDown: function (e) {
            var self = this;

            self.callSuper('_onMouseDown', e);

            if (e.type === 'touchstart') {
                var touchStartTimer = setTimeout(function () {
                    self._onTapHold(e);
                    self.isLongTap = true;
                }, self.tapholdThreshold);

                self.touchStartTimer = touchStartTimer;

                return;
            }

            var isTargetGroup = false;
            var target = self.findTarget(e);
            if (target !== undefined && target._objects !== undefined) {
                isTargetGroup = true;
            }

            // Add right click support and group object click support.
            if (e.which === 3 || (isTargetGroup && self.fireEventForObjectInsideGroup)) {
                // Skip group to find the real object.
                var target = self.findRealTarget(e);

                // select the target
                self._activeObject = target;
                self.renderAll()

                self.fire('mouse:down', { target: target, e: e });

                if (!isTargetGroup || !self.fireEventForObjectInsideGroup) {
                    // Canvas event only for right click. For group object, the super method already fired a canvas event.
                    self.fire('mouse:down', { target: target, e: e });
                }
                
                /*if (target && !self.isDrawingMode) {
                    // To unify the behavior, the object's mouse down event does not fire on drawing mode.
                    target.fire('mousedown', {
                        e: e
                    });
                }*/
            }
        },

        _onMouseUp: function (e) {
            var self = this;

            self.callSuper('_onMouseUp', e);

            if (e.type === 'touchend') {
                // Process tap hold.
                if (self.touchStartTimer != null) {
                    clearTimeout(self.touchStartTimer);
                }

                // Process long tap.
                if (self.isLongTap) {
                    self._onLongTapEnd(e);
                    self.isLongTap = false;
                }

                // Process double click
                var now = new Date().getTime();
                var lastTouch = self.lastTouch || now + 1;
                var delta = now - lastTouch;
                if (delta < 300 && delta > 0) {
                    // After we detct a doubletap, start over
                    self.lastTouch = null;

                    self._onDoubleTap(e);
                } else {
                    self.lastTouch = now;
                }

                return;
            }
        },

        _onDoubleTap: function (e) {
            var self = this;

            var target = self.findRealTarget(e);
            self.fire('touch:doubletap', {
                target: target,
                e: e
            });

            if (target && !self.isDrawingMode) {
                // To unify the behavior, the object's double tap event does not fire on drawing mode.
                target.fire('object:doubletap', {
                    e: e
                });
            }
        },

        _onLongTapEnd: function (e) {
            var self = this;

            var target = self.findRealTarget(e);
            self.fire('touch:longtapend', {
                target: target,
                e: e
            });

            if (target && !self.isDrawingMode) {
                // To unify the behavior, the object's long tap end event does not fire on drawing mode.
                target.fire('object:longtapend', {
                    e: e
                });
            }
        },

        _initEventListeners: function () {
            var self = this;
            self.callSuper('_initEventListeners');

            addListener(self.upperCanvasEl, 'dblclick', self._onDoubleClick);
        },

        _checkTargetForGroupObject: function (obj, pointer) {
            if (obj &&
                obj.visible &&
                obj.evented &&
                this._containsPointForGroupObject(pointer, obj)) {
                if ((this.perPixelTargetFind || obj.perPixelTargetFind) && !obj.isEditing) {
                    var isTransparent = this.isTargetTransparent(obj, pointer.x, pointer.y);
                    if (!isTransparent) {
                        return true;
                    }
                }
                else {
                    return true;
                }
            }
        },

        _containsPointForGroupObject: function (pointer, target) {
            var xy = this._normalizePointer(target, pointer);

            // http://www.geog.ubc.ca/courses/klink/gis.notes/ncgia/u32.html
            // http://idav.ucdavis.edu/~okreylos/TAship/Spring2000/PointInPolygon.html
            return (target.containsPoint(xy) || target._findTargetCorner(pointer));
        },

        _adjustPointerAccordingToGroupObjects: function (originalPointer, group) {
            var groupObjects = group._objects;
            var objectLength = groupObjects.length;
            if (objectLength <= 0) {
                return originalPointer;
            }

            var minLeft = 99999;
            var minTop = 99999;

            var i;
            for (i = 0; i < objectLength; i++) {
                var obj = groupObjects[i];
                if (minLeft > obj.left) {
                    minLeft = obj.left;
                }

                if (minTop > obj.top) {
                    minTop = obj.top;
                }
            }

            originalPointer.x += minLeft - group.left;
            originalPointer.y += minTop - group.top;

            return originalPointer;
        },

        findRealTarget: function (e) {
            var self = this;
            var target;
            if (!self.fireEventForObjectInsideGroup) {
                target = self.findTarget(e);
            }
            else {
                // Skip group to find the real object.
                var target = self.findTarget(e, true);
                if (target !== undefined && target._objects !== undefined) {
                    var pointer = self.getPointer(e, true);
                    var objects = target._objects;
                    pointer = self._adjustPointerAccordingToGroupObjects(pointer, target);
                    var i = objects.length;
                    while (i--) {
                        if (self._checkTargetForGroupObject(objects[i], pointer)) {
                            target = objects[i];

                            break;
                        }
                    }
                }
            }

            return target;
        },

        removeListeners: function () {
            var self = this;
            self.callSuper('removeListeners');

            removeListener(self.upperCanvasEl, 'dblclick', self._onDoubleClick);
        },

        fireEventForObjectInsideGroup: false
    });
})();