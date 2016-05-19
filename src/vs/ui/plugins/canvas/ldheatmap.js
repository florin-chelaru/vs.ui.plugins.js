/**
 * Created by Siahpoosh on 5/5/16.
 */

goog.provide('vs.ui.plugins.canvas.LDHeatmap');

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
vs.ui.plugins.canvas.LDHeatmap = (function() {
    var _quadTree = Symbol('_quadTree');

    /**
     * @constructor
     * @extends vs.ui.canvas.CanvasVis
     */
    var LDHeatmap = function() {
        vs.ui.canvas.CanvasVis.apply(this, arguments);

        /**
         * @type {u.QuadTree}
         * @private
         */
        this[_quadTree] = null;
    };

    goog.inherits(LDHeatmap, vs.ui.canvas.CanvasVis);

    /**
     * @type {Object.<string, vs.ui.Setting>}
     */
    LDHeatmap.Settings = u.extend({}, vs.ui.canvas.CanvasVis.Settings, {
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
        'selectStrokeThickness': vs.ui.Setting.PredefinedSettings['selectStrokeThickness']
    });

    Object.defineProperties(LDHeatmap.prototype, {
        'settings': { get: /** @type {function (this:ManhattanPlot)} */ (function() { return ManhattanPlot.Settings; })}
    });

    LDHeatmap.prototype.beginDraw = function() {
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

    LDHeatmap.prototype.endDraw = function() {
        var self = this;
        var args = arguments;
        return new Promise(function(resolve, reject) {
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

            var fill = /** @type {string} */ (self.optionValue('fill'));
            var stroke = /** @type {string} */ (self.optionValue('stroke'));
            var strokeThickness = /** @type {number} */ (self.optionValue('strokeThickness'));

            var context = self.pendingCanvas[0].getContext('2d');

            var transform =
                vs.models.Transformer
                    .scale(xScale, yScale)
                    .translate({'x': margins.left, 'y': margins.top});
            var items = data.asDataRowArray();

            // Instead of drawing all circles synchronously (and risk causing the browser to hang)...
            /*items.forEach(function(d) {
             var point = transform.calc({x: parseFloat(d.info(row)), y: d.val(cols[0], valsLabel)});
             vs.ui.canvas.CanvasVis.circle(context, point.x, point.y, 3, '#1e60d4');
             });
             resolve();
             */

            // ... draw them asynchronously, which takes a bit longer, but keeps the UI responsive
            u.async.each(items, function(d) {
                return new Promise(function(drawCircleResolve, drawCircleReject) {
                    setTimeout(function() {
                        var point = transform.calc({x: parseFloat(d.info(row)), y: d.val(cols[0], valsLabel)});
                        vs.ui.canvas.CanvasVis.circle(context, point.x, point.y, itemRadius, fill, stroke, strokeThickness);
                        drawCircleResolve();
                    }, 0);
                });
            }).then(resolve, reject);
        }).then(function() {
            return vs.ui.canvas.CanvasVis.prototype.endDraw.apply(self, args);
        });
    };

    /**
     * @param {number} x
     * @param {number} y
     * @returns {Array.<vs.models.DataRow>}
     */
    LDHeatmap.prototype.getItemsAt = function(x, y) {
        if (!this[_quadTree]) { return []; }
        return this[_quadTree].collisions(x, y).map(function(v) { return v.value; });
    };

    /**
     * @param {HTMLElement} canvas
     * @param {vs.models.DataRow} d
     */
    LDHeatmap.prototype.highlightItem = function(canvas, d) {
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
        vs.ui.canvas.CanvasVis.circle(context, point.x, point.y, itemRadius, selectFill, selectStroke, selectStrokeThickness);
    };

    return LDHeatmap;
})();
