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

  /**
   * @type {u.QuadTree}
   * @private
   */
  this._quadTree = null;

  this.data.changed.addListener(this._updateQuadTree, this);
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
  'cols': vs.ui.Setting.PredefinedSettings['cols'],
  'itemRatio': new vs.ui.Setting({'key':'itemRatio', 'type':vs.ui.Setting.Type.NUMBER, 'defaultValue': 0.02, 'label':'item ratio', 'template':'_number.html'})
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
    var itemRatio = /** @type {number} */ (self.optionValue('itemRatio'));
    var width = /** @type {number} */ (self.optionValue('width'));
    var height = /** @type {number} */ (self.optionValue('height'));

    var itemRadius = Math.min(Math.abs(width), Math.abs(height)) * itemRatio;

    var xCol = cols[0];
    var yCol = cols[1];


    var context = self.pendingCanvas[0].getContext('2d');

    var transform =
      vs.models.Transformer
        .scale(xScale, yScale)
        .translate({x: margins.left, y: margins.top});
    var items = data.asDataRowArray();

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
          vs.ui.canvas.CanvasVis.circle(context, point.x, point.y, itemRadius, '#ff6520');
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
vs.ui.plugins.canvas.ScatterPlot.prototype.getItemsAt = function(x, y) {
  var margins = /** @type {vs.models.Margins} */ (this.optionValue('margins'));
  var xScale = /** @type {function(number): number} */ (this.optionValue('xScale'));
  var yScale = /** @type {function(number): number} */ (this.optionValue('yScale'));
  var cols = /** @type {Array.<string>} */ (this.optionValue('cols'));
  var valsLabel = /** @type {string} */ (this.optionValue('vals'));
  var itemRatio = /** @type {number} */ (this.optionValue('itemRatio'));
  var width = /** @type {number} */ (this.optionValue('width'));
  var height = /** @type {number} */ (this.optionValue('height'));
  var xBoundaries = /** @type {vs.models.Boundaries} */ (this.optionValue('xBoundaries'));
  var yBoundaries = /** @type {vs.models.Boundaries} */ (this.optionValue('yBoundaries'));
  var xCol = cols[0];
  var yCol = cols[1];


  if (!this._quadTree) { return []; }
  var xval = (x - margins.left) * (xBoundaries.max - xBoundaries.min) / (width - margins.left - margins.right);
  var yval = (height - y - margins.bottom) * (yBoundaries.max - yBoundaries.min) / (height - margins.top - margins.bottom);

  console.log(x, y, xval, yval);

  var ret = this._quadTree.collisions(xval, yval).map(function(v) { return v.value; });
  console.log(JSON.stringify(ret.map(function(d) { return {x: d.val(xCol, valsLabel), y: d.val(yCol, valsLabel)}; })));

  return ret;
};

vs.ui.plugins.canvas.ScatterPlot.prototype._updateQuadTree = function() {
  var cols = /** @type {Array.<string>} */ (this.optionValue('cols'));
  var valsLabel = /** @type {string} */ (this.optionValue('vals'));
  var xBoundaries = /** @type {vs.models.Boundaries} */ (this.optionValue('xBoundaries'));
  var yBoundaries = /** @type {vs.models.Boundaries} */ (this.optionValue('yBoundaries'));
  var itemRatio = /** @type {number} */ (this.optionValue('itemRatio'));

  var xCol = cols[0];
  var yCol = cols[1];

  var qt = new u.QuadTree(xBoundaries.min, yBoundaries.min, xBoundaries.max - xBoundaries.min, yBoundaries.max - yBoundaries.min, itemRatio, 10);

  var items = this.data.asDataRowArray();
  var w = 2 * itemRatio * (xBoundaries.max - xBoundaries.min);
  var h = 2 * itemRatio * (yBoundaries.max - yBoundaries.min);
  items.forEach(function(d) {
    qt.insert(d.val(xCol, valsLabel) - w, d.val(yCol, valsLabel) - h, w, h, d);
  });

  this._quadTree = qt;

  // TODO: Aici. De fapt, ar trebui sa cream un arbore de fiecare data cand facem redraw, si sa folosim width and height of visualization
};

