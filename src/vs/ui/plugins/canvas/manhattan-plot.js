/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/22/2015
 * Time: 12:19 PM
 */

goog.provide('vs.ui.plugins.canvas.ManhattanPlot');

goog.require('vs.ui');

/*
goog.require('vs.ui.canvas.CanvasVis');
goog.require('vs.models.DataRow');
goog.require('vs.models.Transformer');
*/

/**
 * @constructor
 * @extends vs.ui.canvas.CanvasVis
 */
vs.ui.plugins.canvas.ManhattanPlot = function() {
  vs.ui.canvas.CanvasVis.apply(this, arguments);
};

goog.inherits(vs.ui.plugins.canvas.ManhattanPlot, vs.ui.canvas.CanvasVis);

/**
 * @type {Object.<string, vs.ui.Setting>}
 */
vs.ui.plugins.canvas.ManhattanPlot.Settings = u.extend({}, vs.ui.canvas.CanvasVis.Settings, {
  'rows': vs.ui.Setting.PredefinedSettings['rows'],
  'vals': vs.ui.Setting.PredefinedSettings['vals'],
  'xBoundaries': new vs.ui.Setting({key:'xBoundaries', type:'vs.models.Boundaries', defaultValue:vs.ui.Setting.rowBoundaries, label:'x boundaries', template:'_boundaries.html'}),
  'yBoundaries': vs.ui.Setting.PredefinedSettings['yBoundaries'],
  'xScale': vs.ui.Setting.PredefinedSettings['xScale'],
  'yScale': vs.ui.Setting.PredefinedSettings['yScale'],
  'cols': vs.ui.Setting.PredefinedSettings['cols']
});

Object.defineProperties(vs.ui.plugins.canvas.ManhattanPlot.prototype, {
  'settings': { get: /** @type {function (this:vs.ui.plugins.canvas.ManhattanPlot)} */ (function() { return vs.ui.plugins.canvas.ManhattanPlot.Settings; })}
});

vs.ui.plugins.canvas.ManhattanPlot.prototype.endDraw = function() {
  var self = this;
  var args = arguments;
  return new Promise(function(resolve, reject) {
    vs.ui.canvas.CanvasVis.prototype.endDraw.apply(self, args)
      .then(function() {
        /** @type {vs.models.DataSource} */
        var data = self.data;
        if (!self.data.isReady) { return; }

        // Nothing to draw
        if (!data.nrows) { return; }

        var margins = /** @type {vs.models.Margins} */ (self.optionValue('margins'));
        var xScale = /** @type {function(number): number} */ (self.optionValue('xScale'));
        var yScale = /** @type {function(number): number} */ (self.optionValue('yScale'));
        var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));
        var row = (/** @type {Array.<string>} */ (self.optionValue('rows')))[0];
        var valsLabel = /** @type {string} */ (self.optionValue('vals'));

        var context = self.pendingCanvas[0].getContext('2d');

        var transform =
          vs.models.Transformer
            .scale(xScale, yScale)
            .translate({'x': margins.left, 'y': margins.top});
        var items = u.array.range(data.nrows).map(function(i) {
          return new vs.models.DataRow(data, i);
        });

        items.forEach(function(d) {
          var point = transform.calc({x: parseFloat(d.info(row)), y: d.val(cols[0], valsLabel)});
          vs.ui.canvas.CanvasVis.circle(context, point.x, point.y, 3, '#1e60d4');
        });

        resolve();
      }, reject);
  });
};

