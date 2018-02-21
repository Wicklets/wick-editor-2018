/*
 Copyright (c) 2014-2017, Jan Bösenberg & Jürg Lehni

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

var Path = paper.Path;
var Segment = paper.Segment;
var Curve = paper.Curve;
var Line = paper.Line;
var Numerical = paper.Numerical;

var OffsetUtils =  {
    offsetPath: function(path, offset, result) {
        var outerPath = new Path({ insert: false }),
            epsilon = Numerical.GEOMETRIC_EPSILON,
            enforeArcs = true;
        for (var i = 0; i < path.curves.length; i++) {
            var curve = path.curves[i];
            if (curve.hasLength(epsilon)) {
                var segments = this.getOffsetSegments(curve, offset),
                    start = segments[0];
                if (outerPath.isEmpty()) {
                    outerPath.addSegments(segments);
                } else {
                    var lastCurve = outerPath.lastCurve;
                    if (!lastCurve.point2.isClose(start.point, epsilon)) {
                        if (enforeArcs || lastCurve.getTangentAtTime(1).dot(start.point.subtract(curve.point1)) >= 0) {
                            this.addRoundJoin(outerPath, start.point, curve.point1, Math.abs(offset));
                        } else {
                            // Connect points with a line
                            outerPath.lineTo(start.point);
                        }
                    }
                    outerPath.lastSegment.handleOut = start.handleOut;
                    outerPath.addSegments(segments.slice(1));
                }
            }
        }
        if (path.isClosed()) {
            if (!outerPath.lastSegment.point.isClose(outerPath.firstSegment.point, epsilon) && (enforeArcs ||
                    outerPath.lastCurve.getTangentAtTime(1).dot(outerPath.firstSegment.point.subtract(path.firstSegment.point)) >= 0)) {
                this.addRoundJoin(outerPath, outerPath.firstSegment.point, path.firstSegment.point, Math.abs(offset));
            }
            outerPath.closePath();
        }
        return outerPath;
    },

    joinOffsets: function (outerPath, innerPath, originPath, offset) {
        function connect(path, dest, originSegment, offset, type, miterLimit,
            addLine) {
            var geomEpsilon = 1e-8;
            var enforeArcs = true;
            function fixHandles(seg) {
                var handleIn = seg.handleIn,
                    handleOut = seg.handleOut;
                if (handleIn.length < handleOut.length) {
                    seg.handleIn = handleIn.project(handleOut);
                } else {
                    seg.handleOut = handleOut.project(handleIn);
                }
            }

            function addPoint(point) {
                if (!point.equals(path.lastSegment.point)) {
                    path.add(point);
                }
            }

            var center = originSegment.point,
                start = path.lastSegment,
                pt1 = start.point,
                pt2 = dest.point,
                connected = false;

            if (!pt1.isClose(pt2, geomEpsilon)) {
                if (enforeArcs
                        // decide if the join is inside or outside the stroke
                        // by checking on which side of the line connecting pt1 
                        // and pt2 the center lies.
                        || new Line(pt1, pt2).getSignedDistance(center)
                            * offset <= geomEpsilon) {
                    // Calculate the through point based on the vectors from center
                    // to pt1 / pt2
                    var radius = Math.abs(offset);
                    switch (type) {
                    case 'round':
                        // Try adding the vectors together to get the average vector
                        // which can be normalized to radius length to get the
                        // through point except if the two vectors have 180° between
                        // them, in which case we can rotate one of them by 90°.
                        var v1 = pt1.subtract(center),
                            v2 = pt2.subtract(center),
                            v = v1.add(v2),
                            through = v.getLength() < geomEpsilon
                                    ? v2.rotate(90).add(center)
                                    : center.add(v.normalize(radius));
                        path.arcTo(through, pt2);
                        break;
                    case 'miter':
                        Path._addBevelJoin(originSegment, 'miter', radius, 4,
                                null, null, addPoint);
                        break;
                    case 'square':
                        Path._addSquareCap(originSegment, 'square', radius,
                                null, null, addPoint);
                        break;
                    default: // 'bevel' / 'butt'
                        path.lineTo(pt2);
                    }
                    connected = true;
                } else if (addLine) {
                    path.lineTo(pt2);
                    connected = true;
                }
                if (connected) {
                    fixHandles(start);
                    var last = path.lastSegment;
                    fixHandles(last);
                    // Adjust handleOut, except for when connecting back to the
                    // beginning on closed paths.
                    if (dest !== path.firstSegment) {
                        last.handleOut = dest.handleOut;
                    }
                }
            } else {
                if (dest !== path.firstSegment) {
                    path.lastSegment.handleOut = dest.handleOut;
                }
            }
            return connected;
        }

        outerPath.closed = innerPath.closed = false;
        var path = outerPath,
            open = !originPath.closed,
            strokeCap = originPath.strokeCap;
        path.reverse();
        if (open) {
            connect(path, innerPath.firstSegment, originPath.firstSegment,
                    offset, strokeCap);
        }
        path.join(innerPath);
        if (open) {
            connect(path, path.firstSegment, originPath.lastSegment,
                    offset, strokeCap);
        }
        path.closePath();
        return path;
    },

    /**
     * Creates an offset for the specified curve and returns the segments of
     * that offset path.
     *
     * @param {Curve} curve the curve to be offset
     * @param {Number} offset the offset distance
     * @returns {Segment[]} an array of segments describing the offset path
     */
    getOffsetSegments: function(curve, offset) {
        if (curve.isStraight()) {
            var n = curve.getNormalAtTime(0.5).multiply(offset),
                p1 = curve.point1.add(n),
                p2 = curve.point2.add(n);
            return [new Segment(p1), new Segment(p2)];
        } else {
            var curves = this.splitCurveForOffseting(curve),
                segments = [];
            for (var i = 0, l = curves.length; i < l; i++) {
                var offsetCurves = this.getOffsetCurves(curves[i], offset, 0),
                    prevSegment;
                for (var j = 0, m = offsetCurves.length; j < m; j++) {
                    var curve = offsetCurves[j],
                        segment = curve.segment1;
                    if (prevSegment) {
                        prevSegment.handleOut = segment.handleOut;
                    } else {
                        segments.push(segment);
                    }
                    segments.push(prevSegment = curve.segment2);
                }
            }
            return segments;
        }
    },

    /**
     * Approach for Curve Offsetting based on:
     *   "A New Shape Control and Classification for Cubic Bézier Curves"
     *   Shi-Nine Yang and Ming-Liang Huang
     */
    offsetCurve_middle: function(curve, offset) {
        var v = curve.getValues(),
            p1 = curve.point1.add(Curve.getNormal(v, 0).multiply(offset)),
            p2 = curve.point2.add(Curve.getNormal(v, 1).multiply(offset)),
            pt = Curve.getPoint(v, 0.5).add(
                    Curve.getNormal(v, 0.5).multiply(offset)),
            t1 = Curve.getTangent(v, 0),
            t2 = Curve.getTangent(v, 1),
            div = t1.cross(t2) * 3 / 4,
            d = pt.multiply(2).subtract(p1.add(p2)),
            a = d.cross(t2) / div,
            b = d.cross(t1) / div;
        return new Curve(p1, t1.multiply(a), t2.multiply(-b), p2);
    },

    offsetCurve_average: function(curve, offset) {
        var v = curve.getValues(),
            p1 = curve.point1.add(Curve.getNormal(v, 0).multiply(offset)),
            p2 = curve.point2.add(Curve.getNormal(v, 1).multiply(offset)),
            t = this.getAverageTangentTime(v),
            u = 1 - t,
            pt = Curve.getPoint(v, t).add(
                    Curve.getNormal(v, t).multiply(offset)),
            t1 = Curve.getTangent(v, 0),
            t2 = Curve.getTangent(v, 1),
            div = t1.cross(t2) * 3 * t * u,
            v = pt.subtract(
                    p1.multiply(u * u * (1 + 2 * t)).add(
                    p2.multiply(t * t * (3 - 2 * t)))),
            a = v.cross(t2) / (div * u),
            b = v.cross(t1) / (div * t);
        return new Curve(p1, t1.multiply(a), t2.multiply(-b), p2);
    },

    /**
     * This algorithm simply scales the curve so its end points are at the
     * calculated offsets of the original end points.
     */
    offsetCurve_simple: function (crv, dist) {
        // calculate end points of offset curve
        var p1 = crv.point1.add(crv.getNormalAtTime(0).multiply(dist));
        var p4 = crv.point2.add(crv.getNormalAtTime(1).multiply(dist));
        // get scale ratio
        var pointDist = crv.point1.getDistance(crv.point2);
        // TODO: Handle cases when pointDist == 0
        var f = p1.getDistance(p4) / pointDist;
        if (crv.point2.subtract(crv.point1).dot(p4.subtract(p1)) < 0) {
            f = -f; // probably more correct than connecting with line
        }
        // Scale handles and generate offset curve
        return new Curve(p1, crv.handle1.multiply(f), crv.handle2.multiply(f), p4);
    },

    getOffsetCurves: function(curve, offset, method) {
        var errorThreshold = 0.01,
            radius = Math.abs(offset),
            offsetMethod = this['offsetCurve_' + (method || 'middle')],
            that = this;

        function offsetCurce(curve, curves, recursion) {
            var offsetCurve = offsetMethod.call(that, curve, offset),
                cv = curve.getValues(),
                ov = offsetCurve.getValues(),
                count = 16,
                error = 0;
            for (var i = 1; i < count; i++) {
                var t = i / count,
                    p = Curve.getPoint(cv, t),
                    n = Curve.getNormal(cv, t),
                    roots = Curve.getCurveLineIntersections(ov, p.x, p.y, n.x, n.y),
                    dist = 2 * radius;
                for (var j = 0, l = roots.length; j < l; j++) {
                    var d = Curve.getPoint(ov, roots[j]).getDistance(p);
                    if (d < dist)
                        dist = d;
                }
                var err = Math.abs(radius - dist);
                if (err > error)
                    error = err;
            }
            if (error > errorThreshold && recursion++ < 8) {
                if (error === radius) {
                    // console.log(cv);
                }
                var curve2 = curve.divideAtTime(that.getAverageTangentTime(cv));
                offsetCurce(curve, curves, recursion);
                offsetCurce(curve2, curves, recursion);
            } else {
                curves.push(offsetCurve);
            }
            return curves;
        }

        return offsetCurce(curve, [], 0);
    },

    /**
     * Split curve into sections that can then be treated individually by an
     * offset algorithm.
     */
    splitCurveForOffseting: function(curve) {
        var curves = [curve.clone()], // Clone so path is not modified.
            that = this;
        if (curve.isStraight())
            return curves;

        function splitAtRoots(index, roots) {
            for (var i = 0, prevT, l = roots && roots.length; i < l; i++) {
                var t = roots[i],
                    curve = curves[index].divideAtTime(
                            // Renormalize curve-time for multiple roots:
                            i ? (t - prevT) / (1 - prevT) : t);
                prevT = t;
                if (curve)
                    curves.splice(++index, 0, curve);
            }
        }

        // Recursively splits the specified curve if the angle between the two
        // handles is too large (we use 60° as a threshold).
        function splitLargeAngles(index, recursion) {
            var curve = curves[index],
                v = curve.getValues(),
                n1 = Curve.getNormal(v, 0),
                n2 = Curve.getNormal(v, 1).negate(),
                cos = n1.dot(n2);
            if (cos > -0.5 && ++recursion < 4) {
                curves.splice(index + 1, 0,
                        curve.divideAtTime(that.getAverageTangentTime(v)));
                splitLargeAngles(index + 1, recursion);
                splitLargeAngles(index, recursion);
            }
        }

        // Split curves at cusps and inflection points.
        var info = curve.classify();
        if (info.roots && info.type !== 'loop') {
            splitAtRoots(0, info.roots);
        }

        // Split sub-curves at peaks.
        for (var i = curves.length - 1; i >= 0; i--) {
            splitAtRoots(i, Curve.getPeaks(curves[i].getValues()));
        }

        // Split sub-curves with too large angle between handles.
        for (var i = curves.length - 1; i >= 0; i--) {
            //splitLargeAngles(i, 0);
        }
        return curves;
    },

    /**
     * Returns the first curve-time where the curve has its tangent in the same
     * direction as the average of the tangents at its beginning and end.
     */
    getAverageTangentTime: function(v) {
        var tan = Curve.getTangent(v, 0).add(Curve.getTangent(v, 1)),
            tx = tan.x,
            ty = tan.y,
            abs = Math.abs,
            flip = abs(ty) < abs(tx),
            s = flip ? ty / tx : tx / ty,
            ia = flip ? 1 : 0, // the abscissa index
            io = ia ^ 1,       // the ordinate index
            a0 = v[ia + 0], o0 = v[io + 0],
            a1 = v[ia + 2], o1 = v[io + 2],
            a2 = v[ia + 4], o2 = v[io + 4],
            a3 = v[ia + 6], o3 = v[io + 6],
            aA =     -a0 + 3 * a1 - 3 * a2 + a3,
            aB =  3 * a0 - 6 * a1 + 3 * a2,
            aC = -3 * a0 + 3 * a1,
            oA =     -o0 + 3 * o1 - 3 * o2 + o3,
            oB =  3 * o0 - 6 * o1 + 3 * o2,
            oC = -3 * o0 + 3 * o1,
            roots = [],
            epsilon = Numerical.CURVETIME_EPSILON,
            count = Numerical.solveQuadratic(
                    3 * (aA - s * oA),
                    2 * (aB - s * oB),
                    aC - s * oC, roots,
                    epsilon, 1 - epsilon);
        // Fall back to 0.5, so we always have a place to split...
        return count > 0 ? roots[0] : 0.5;
    },

    addRoundJoin: function(path, dest, center, radius) {
        // return path.lineTo(dest);
        var middle = path.lastSegment.point.add(dest).divide(2),
            through = center.add(middle.subtract(center).normalize(radius));
        path.arcTo(through, dest);
    },
};