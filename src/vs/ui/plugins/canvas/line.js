/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/22/2015
 * Time: 12:19 PM
 */

goog.provide('vs.ui.plugins.canvas.Line');

if (COMPILED) {
    goog.require('vs.ui');
}

// Because vs.models.DataSource is defined in another library (vis.js), there is no way for the Google Closure compiler
// to know the names of the private variables of that class. Therefore, when overriding this class, we need to declare
// private variables in a private scope (closure), using Symbols (ES6), so we don't accidentally replace existing
// private members.

/**
 * @constructor
 * @extends vs.ui.canvas.CanvasVis
 */
vs.ui.plugins.canvas.Line = (function() {
   var _quadTree = Symbol('_quadTree');

    /**
     * @constructor
     * @extends vs.ui.canvas.CanvasVis
     */
    var Line = function() {
        vs.ui.canvas.CanvasVis.apply(this, arguments);

        /**
         * @type {u.QuadTree}
         * @private
         */
        this[_quadTree] = null;
    };

    goog.inherits(Line, vs.ui.canvas.CanvasVis);

    /**
     * @type {Object.<string, vs.ui.Setting>}
     */
    Line.Settings = u.extend({}, vs.ui.canvas.CanvasVis.Settings, {
        'rows': vs.ui.Setting.PredefinedSettings['rows'],
        'vals': vs.ui.Setting.PredefinedSettings['vals'],
        'xBoundaries': new vs.ui.Setting({key:'xBoundaries', type:'vs.models.Boundaries', defaultValue:vs.ui.Setting.rowBoundaries, label:'x boundaries', template:'_boundaries.html'}),
        'yBoundaries': vs.ui.Setting.PredefinedSettings['yBoundaries'],
        'xScale': vs.ui.Setting.PredefinedSettings['xScale'],
        'yScale': vs.ui.Setting.PredefinedSettings['yScale'],
        'cols': vs.ui.Setting.PredefinedSettings['cols'],
        'itemRatio': new vs.ui.Setting({'key':'itemRatio', 'type':vs.ui.Setting.Type.NUMBER, 'defaultValue': 0.015, 'label':'item ratio', 'template':'_number.html'}),
        'fill': vs.ui.Setting.PredefinedSettings['fill'],
        'stroke': vs.ui.Setting.PredefinedSettings['stroke'],
        'strokeThickness': vs.ui.Setting.PredefinedSettings['strokeThickness'],
        'selectFill': vs.ui.Setting.PredefinedSettings['selectFill'],
        'selectStroke': vs.ui.Setting.PredefinedSettings['selectStroke'],
        'selectStrokeThickness': vs.ui.Setting.PredefinedSettings['selectStrokeThickness'],
        // Settings to be added:
        // ColorOptions
        'colorOptions': new vs.ui.Setting({'key': 'colorOptions', 'type':vs.ui.Setting.Type.ARRAY, 'defaultValue': ['blue', 'red']} ),
    });

    Object.defineProperties(Line.prototype, {
        'settings': { get: /** @type {function (this:Line)} */ (function() { return Line.Settings; })}
    });

    Line.prototype.beginDraw = function() {
        var self = this;
        var args = arguments;
        return new Promise(function(resolve, reject) {
            vs.ui.canvas.CanvasVis.prototype.beginDraw.apply(self, args).then(function() {
                /** @type {vs.models.DataSource} */
                var data = self.data;
                if (!self.data.isReady) { resolve(); return; }

                // Nothing to draw
                if (!data.nrows) { resolve(); return; }

                var margins = /** @type {vs.models.Margins} */ (self.optionValue('margins'));
                var xScale = /** @type {function(number): number} */ (self.optionValue('xScale'));
                var yScale = /** @type {function(number): number} */ (self.optionValue('yScale'));
                var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));
                var row = (/** @type {Array.<string>} */ (self.optionValue('rows')))[0];
                var valsLabel = /** @type {string} */ (self.optionValue('vals'));
                var itemRatio = /** @type {number} */ (self.optionValue('itemRatio'));

                var width = /** @type {number} */ (self.optionValue('width'));
                var height = /** @type {number} */ (self.optionValue('height'));

                var itemRadius = Math.min(Math.abs(width), Math.abs(height)) * itemRatio;

                var qt = new u.QuadTree(margins.left, margins.top, width - margins.left - margins.right, height - margins.top - margins.bottom, itemRatio, 10);

                var transform =
                    vs.models.Transformer
                        .scale(xScale, yScale)
                        .translate({'x': margins.left, 'y': margins.top});
                var items = data.asDataRowArray();
                var w, h;
                w = h = itemRadius;

                items.forEach(function(d) {
                    var initialPoint = {x: parseFloat(d.info(row)), y: d.val(cols[0], valsLabel)};
                    var point = transform.calc(initialPoint);

                    qt.insert(point.x - w, point.y - h, w * 2, h * 2, d);
                });

                self[_quadTree] = qt;

                resolve();
            });
        });
    };

    Line.prototype.endDraw = function() {
        var self = this;
        var args = arguments;
        return new Promise(function (resolve, reject) {
            /** @type {vs.models.DataSource} */
            var data = self.data;
            if (!self.data.isReady) {
                resolve();
                return;
            }

            // Nothing to draw
            if (!data.nrows) {
                resolve();
                return;
            }
            var colorOptions = (self.optionValue('colorOptions'));
            var margins = /** @type {vs.models.Margins} */ (self.optionValue('margins'));
            var xScale = /** @type {function(number): number} */ (self.optionValue('xScale'));
            var yScale = /** @type {function(number): number} */ (self.optionValue('yScale'));
            var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));
            var row = (/** @type {Array.<string>} */ (self.optionValue('rows')))[0];
            var valsLabel = /** @type {string} */ (self.optionValue('vals'));
            var itemRatio = /** @type {number} */ (self.optionValue('itemRatio'));
            var width = /** @type {number} */ (self.optionValue('width'));
            var height = /** @type {number} */ (self.optionValue('height'));
            var itemRadius = Math.min(Math.abs(width), Math.abs(height)) * itemRatio;

            var fill = /** @type {string} */ (self.optionValue('fill'));
            var stroke = /** @type {string} */ (self.optionValue('stroke'));
            var strokeThickness = /** @type {number} */ (self.optionValue('strokeThickness'));

            var context = self.pendingCanvas[0].getContext('2d');

            var transform =
                vs.models.Transformer
                    .scale(xScale, yScale)
                    .translate({'x': margins.left, 'y': margins.top});
            var items = data.asDataRowArray();


            // For loop to draw out each path in the dataRows
            for (var j = 0; j < colorOptions.length; j++) {
                var startPoint = transform.calc({
                    x: parseFloat(items[0].info(row)),
                    y: items[0].val(cols[j], valsLabel)
                });
                context.lineWidth = strokeThickness;
                context.strokeStyle = colorOptions[j];
                context.beginPath();
                context.moveTo(startPoint.x, startPoint.y);

                for (var i = 0; i < items.length; i++) {
                    var point = transform.calc({
                        x: parseFloat(items[i].info(row)),
                        y: items[i].val(cols[j], valsLabel)
                    });
                    context.lineTo(point.x, point.y);
                    context.stroke();
                    context.closePath();
                    context.beginPath();
                    context.moveTo(point.x, point.y);
                }

                context.closePath();
            }
            resolve();
        }).then(function () {
            return vs.ui.canvas.CanvasVis.prototype.endDraw.apply(self, args);
        });
    };
        /**
         * @param {number} x
         * @param {number} y
         * @returns {Array.<vs.models.DataRow>}
         */
        Line.prototype.getItemsAt = function(x, y) {

            if (!this[_quadTree]) { return []; }
            return this[_quadTree].collisions(x, y).map(function(v) { return v.value; });

        };


        /**
         * @param {HTMLElement} canvas
         * @param {vs.models.DataRow} d
         */
        Line.prototype.highlightItem = function(canvas, d) {
            var self = this;
            var margins = /** @type {vs.models.Margins} */ (self.optionValue('margins'));
            var xScale = /** @type {function(number): number} */ (self.optionValue('xScale'));
            var yScale = /** @type {function(number): number} */ (self.optionValue('yScale'));
            var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));
            var row = (/** @type {Array.<string>} */ (self.optionValue('rows')))[0];
            var valsLabel = /** @type {string} */ (self.optionValue('vals'));
            var itemRatio = /** @type {number} */ (self.optionValue('itemRatio'));
            var width = /** @type {number} */ (self.optionValue('width'));
            var height = /** @type {number} */ (self.optionValue('height'));
            var itemRadius = Math.min(Math.abs(width), Math.abs(height)) * itemRatio;

            var selectFill = /** @type {string} */ (this.optionValue('selectFill'));
            var selectStroke = /** @type {string} */ (this.optionValue('selectStroke'));
            var selectStrokeThickness = /** @type {number} */ (this.optionValue('selectStrokeThickness'));

            var transform =
                vs.models.Transformer
                    .scale(xScale, yScale)
                    .translate({'x': margins.left, 'y': margins.top});

            var point = transform.calc({x: parseFloat(d.info(row)), y: d.val(cols[0], valsLabel)});

            var context = canvas.getContext('2d');
            context.font = "15px Arial";
            context.fillText(d.info(row) + ", " + d.val(cols[0], valsLabel), 30, 15);
            vs.ui.canvas.CanvasVis.circle(context, point.x, point.y, itemRadius, selectFill, selectStroke, selectStrokeThickness);
        };

    return Line;
})();
