/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 8/27/2015
 * Time: 2:20 PM
 */

goog.provide('vs.ui.plugins.canvas.ScatterPlot');

if (COMPILED) {
  goog.require('vs.ui');
}
/*
goog.require('vs.ui.canvas.CanvasVis');
goog.require('vs.models.DataRow');
goog.require('vs.models.Transformer');
*/

/**
 * @constructor
 * @extends vs.ui.canvas.CanvasVis
 */
vs.ui.plugins.canvas.ScatterPlot = function() {
  vs.ui.canvas.CanvasVis.apply(this, arguments);
};

goog.inherits(vs.ui.plugins.canvas.ScatterPlot, vs.ui.canvas.CanvasVis);

/**
 * @type {Object.<string, vs.ui.Setting>}
 */
vs.ui.plugins.canvas.ScatterPlot.Settings = u.extend({}, vs.ui.canvas.CanvasVis.Settings, {
  'vals': vs.ui.Setting.PredefinedSettings['vals'],
  'xBoundaries': vs.ui.Setting.PredefinedSettings['xBoundaries'],
  'yBoundaries': vs.ui.Setting.PredefinedSettings['yBoundaries'],
  'xScale': vs.ui.Setting.PredefinedSettings['xScale'],
  'yScale': vs.ui.Setting.PredefinedSettings['yScale'],
  'cols': vs.ui.Setting.PredefinedSettings['cols']
});

Object.defineProperties(vs.ui.plugins.canvas.ScatterPlot.prototype, {
  'settings': { get: /** @type {function (this:vs.ui.plugins.canvas.ScatterPlot)} */ (function() { return vs.ui.plugins.canvas.ScatterPlot.Settings; })}
});

vs.ui.plugins.canvas.ScatterPlot.prototype.endDraw = function() {
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
    var valsLabel = /** @type {string} */ (self.optionValue('vals'));

    var xCol = cols[0];
    var yCol = cols[1];


    var context = self.pendingCanvas[0].getContext('2d');

    var transform =
      vs.models.Transformer
        .scale(xScale, yScale)
        .translate({x: margins.left, y: margins.top});
    var items = u.array.range(data.nrows).map(function(i) {
      return new vs.models.DataRow(data, i);
    });

    // Instead of drawing all circles synchronously (and risk causing the browser to hang)...
    /*items.forEach(function(d) {
      var point = transform.calc({x: d.val(xCol, valsLabel), y: d.val(yCol, valsLabel)});
      vs.ui.canvas.CanvasVis.circle(context, point.x, point.y, 3, '#ff6520');
    });
    resolve();
    */

    // ... draw them asynchronously, which takes a bit longer, but keeps the UI responsive
    u.async.each(items, function(d) {
      return new Promise(function(drawCircleResolve, drawCircleReject) {
        setTimeout(function() {
          var point = transform.calc({x: d.val(xCol, valsLabel), y: d.val(yCol, valsLabel)});
          vs.ui.canvas.CanvasVis.circle(context, point.x, point.y, 3, '#ff6520');
          drawCircleResolve();
        }, 0);
      });
    }).then(resolve, reject);
  }).then(function() {
    return vs.ui.canvas.CanvasVis.prototype.endDraw.apply(self, args);
  });
};
