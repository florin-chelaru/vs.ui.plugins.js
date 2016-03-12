/*
* John La
* LinePlot on Canvas
*/

goog.provide('vs.ui.plugins.canvas.Line');

if (COMPILED) {
    goog.require('vs.ui');
}

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
        'xBoundaries': new vs.ui.Setting({
            key: 'xBoundaries',
            type: 'vs.models.Boundaries',
            defaultValue: vs.ui.Setting.rowBoundaries,
            label: 'x boundaries',
            template: '_boundaries.html'
        }),
        'yBoundaries': vs.ui.Setting.PredefinedSettings['yBoundaries'],
        'xScale': vs.ui.Setting.PredefinedSettings['xScale'],
        'yScale': vs.ui.Setting.PredefinedSettings['yScale'],
        'cols': vs.ui.Setting.PredefinedSettings['cols'],
        'itemRatio': new vs.ui.Setting({
            'key': 'itemRatio',
            'type': vs.ui.Setting.Type.NUMBER,
            'defaultValue': 0.015,
            'label': 'item ratio',
            'template': '_number.html'
        }),
        'fill': vs.ui.Setting.PredefinedSettings['fill'],
        'stroke': vs.ui.Setting.PredefinedSettings['stroke'],
        'strokeThickness': vs.ui.Setting.PredefinedSettings['strokeThickness'],
        'selectFill': vs.ui.Setting.PredefinedSettings['selectFill'],
        'selectStroke': vs.ui.Setting.PredefinedSettings['selectStroke'],
        'selectStrokeThickness': vs.ui.Setting.PredefinedSettings['selectStrokeThickness']
    });

    Object.defineProperties(Line.prototype, {
        'settings': {
            get: /** @type {function (this:Line)} */ (function () {
                return Line.Settings;
            })
        }
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

    Line.prototype.endDraw = function () {
        var self = this;
        var args = arguments;
        return new Promise(function(resolve, reject) {
            /** @type {vs.models.DataSource} */
            var data = self.data;
            var colorOption = ["blue", "red"];

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

            var fill = /** @type {string} */ (self.optionValue('fill'));
            var stroke = /** @type {string} */ (self.optionValue('stroke'));
            var strokeThickness = /** @type {number} */ (self.optionValue('strokeThickness'));

            var context = self.pendingCanvas[0].getContext('2d');

            var transform =
                vs.models.Transformer
                    .scale(xScale, yScale)
                    .translate({'x': margins.left, 'y': margins.top});

            var items = data.asDataRowArray();

            u.async.each(items, function(d) {
                return new Promise(function(drawResolve, drawReject) {
                    setTimeout(function () {

                        drawResolve();
                    }, 0);
                });
            }).then(resolve, reject);
        }).then(function() {
            return vs.ui.canvas.CanvasVis.prototype.endDraw.apply(self, args);
        });
    };
})();

