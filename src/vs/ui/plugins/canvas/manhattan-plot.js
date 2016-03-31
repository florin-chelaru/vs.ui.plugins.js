/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/22/2015
 * Time: 12:19 PM
 */

//region goog...
goog.provide('vs.ui.plugins.canvas.ManhattanPlot');

if (COMPILED) {
  goog.require('vs.ui');
}
//endregion

// Because vs.models.DataSource is defined in another library (vis.js), there is no way for the Google Closure compiler
// to know the names of the private variables of that class. Therefore, when overriding this class, we need to declare
// private variables in a private scope (closure), using Symbols (ES6), so we don't accidentally replace existing
// private members.

/**
 * @constructor
 * @extends vs.ui.canvas.CanvasVis
 */
vs.ui.plugins.canvas.ManhattanPlot = (function() {
  var _quadTree = Symbol('_quadTree');

  /**
   * @constructor
   * @extends vs.ui.canvas.CanvasVis
   */
  var ManhattanPlot = function() {
    vs.ui.canvas.CanvasVis.apply(this, arguments);

    /**
     * @type {u.QuadTree}
     * @private
     */
    this[_quadTree] = null;
  };

  goog.inherits(ManhattanPlot, vs.ui.canvas.CanvasVis);

  //region Constants
  /**
   * @type {Object.<string, vs.ui.Setting>}
   */
  ManhattanPlot.Settings = u.extend({}, vs.ui.canvas.CanvasVis.Settings, {
    'xVal': vs.ui.Setting.PredefinedSettings['xVal'],
    'yVal': vs.ui.Setting.PredefinedSettings['yVal'],
    'xBoundaries': vs.ui.Setting.PredefinedSettings['xBoundaries'],
    'yBoundaries': vs.ui.Setting.PredefinedSettings['yBoundaries'],
    'xScale': vs.ui.Setting.PredefinedSettings['xScale'],
    'yScale': vs.ui.Setting.PredefinedSettings['yScale'],
    'cols': vs.ui.Setting.PredefinedSettings['cols'],
    'itemRatio': new vs.ui.Setting({'key':'itemRatio', 'type':vs.ui.Setting.Type.NUMBER, 'defaultValue': 0.015, 'label':'item ratio', 'template':'_number.html'}),
    'fills': vs.ui.Setting.PredefinedSettings['fills'],
    'fillOpacity': vs.ui.Setting.PredefinedSettings['fillOpacity'],
    'strokes': vs.ui.Setting.PredefinedSettings['strokes'],
    'strokeThickness': vs.ui.Setting.PredefinedSettings['strokeThickness'],
    'selectFill': vs.ui.Setting.PredefinedSettings['selectFill'],
    'selectStroke': vs.ui.Setting.PredefinedSettings['selectStroke'],
    'selectStrokeThickness': vs.ui.Setting.PredefinedSettings['selectStrokeThickness']
  });
  //endregion

  //region Properties
  Object.defineProperties(ManhattanPlot.prototype, {
    'settings': { get: /** @type {function (this:ManhattanPlot)} */ (function() { return ManhattanPlot.Settings; })}
  });
  //endregion

  //region Methods
  ManhattanPlot.prototype.beginDraw = function() {
    var self = this;
    var args = arguments;
    return new Promise(function(resolve, reject) {
      vs.ui.canvas.CanvasVis.prototype.beginDraw.apply(self, args).then(function() {
        /** @type {Array.<vs.models.DataSource>} */
        var data = self.data;

        var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));
        data = data.filter(function(d) { return cols.indexOf(d.id) >= 0; });

        // Nothing to draw
        if (!data.length || !vs.models.DataSource.allDataIsReady(data)) { resolve(); return; }

        var margins = /** @type {vs.models.Margins} */ (self.optionValue('margins'));
        var xScale = /** @type {function(number): number} */ (self.optionValue('xScale'));
        var yScale = /** @type {function(number): number} */ (self.optionValue('yScale'));

        var x = /** @type {string} */ (self.optionValue('xVal'));
        var y = /** @type {string} */ (self.optionValue('yVal'));

        var itemRatio = /** @type {number} */ (self.optionValue('itemRatio'));

        var width = /** @type {number} */ (self.optionValue('width'));
        var height = /** @type {number} */ (self.optionValue('height'));

        var itemRadius = Math.min(Math.abs(width), Math.abs(height)) * itemRatio;

        var qt = new u.QuadTree(margins.left, margins.top, width - margins.left - margins.right, height - margins.top - margins.bottom, itemRatio, 10);

        var transform =
          vs.models.Transformer
            .scale(xScale, yScale)
            .translate({'x': margins.left, 'y': margins.top});

        var items = u.fast.concat(u.fast.map(data, function(d) { return d.d; }));
        var w, h;
        w = h = itemRadius;

        for (var i = 0; i < items.length; ++i) {
          var d = items[i];
          var point = transform.calc({'x': parseFloat(d[x]), 'y': parseFloat(d[y])});

          qt.insert(point.x - w, point.y - h, w * 2, h * 2, d);
        }

        self[_quadTree] = qt;

        resolve();
      });
    });
  };

  ManhattanPlot.prototype.endDraw = function() {
    var self = this;
    var args = arguments;
    return new Promise(function(resolve, reject) {

      var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));

      /** @type {Array.<vs.models.DataSource>} */
      var data = self.data.filter(function(d) { return cols.indexOf(d.id) >= 0; });

      // Nothing to draw
      if (!data.length || !vs.models.DataSource.allDataIsReady(data)) { resolve(); return; }

      var margins = /** @type {vs.models.Margins} */ (self.optionValue('margins'));
      var xScale = /** @type {function(number): number} */ (self.optionValue('xScale'));
      var yScale = /** @type {function(number): number} */ (self.optionValue('yScale'));

      var x = /** @type {string} */ (self.optionValue('xVal'));
      var y = /** @type {string} */ (self.optionValue('yVal'));

      var itemRatio = /** @type {number} */ (self.optionValue('itemRatio'));
      var width = /** @type {number} */ (self.optionValue('width'));
      var height = /** @type {number} */ (self.optionValue('height'));
      var itemRadius = Math.min(Math.abs(width), Math.abs(height)) * itemRatio;

      var fills = /** @type {function(*):string} */ (self.optionValue('fills'));
      var fillOpacity = /** @type {number} */ (self.optionValue('fillOpacity'));
      var strokes = /** @type {function(*):string} */ (self.optionValue('strokes'));
      var strokeThickness = /** @type {number} */ (self.optionValue('strokeThickness'));

      var context = self.pendingCanvas[0].getContext('2d');

      var transform =
        vs.models.Transformer
          .scale(xScale, yScale)
          .translate({'x': margins.left, 'y': margins.top});
      var items = u.fast.concat(u.fast.map(data, function(d) { return d.d; }));

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
            var point = transform.calc({'x': parseFloat(d[x]), 'y': parseFloat(d[y])});
            vs.ui.canvas.CanvasVis.circle(context, point.x, point.y, itemRadius, u.hex2rgba(fills(d['__d__']), fillOpacity), strokes(d['__d__']), strokeThickness);
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
   * @returns {Array.<Object>}
   */
  ManhattanPlot.prototype.getItemsAt = function(x, y) {
    if (!this[_quadTree]) { return []; }
    return u.fast.map(this[_quadTree].collisions(x, y), function(v) { return v.value; });
  };

  /**
   * @param {vs.ui.BrushingEvent} e
   * @param {Array.<Object>} objects
   */
  ManhattanPlot.prototype.highlightItem = function(e, objects) {
    if (!this.brushingCanvas) { return; }
    if (!objects.length) { return; }

    var self = this;
    var margins = /** @type {vs.models.Margins} */ (self.optionValue('margins'));
    var xScale = /** @type {function(number): number} */ (self.optionValue('xScale'));
    var yScale = /** @type {function(number): number} */ (self.optionValue('yScale'));
    var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));
    var xVal = /** @type {string} */ (this.optionValue('xVal'));
    var yVal = /** @type {string} */ (this.optionValue('yVal'));
    var itemRatio = /** @type {number} */ (self.optionValue('itemRatio'));
    var width = /** @type {number} */ (self.optionValue('width'));
    var height = /** @type {number} */ (self.optionValue('height'));
    var itemRadius = Math.min(Math.abs(width), Math.abs(height)) * itemRatio;

    var selectFill = /** @type {string} */ (this.optionValue('selectFill'));
    var selectStroke = /** @type {string} */ (this.optionValue('selectStroke'));
    var selectStrokeThickness = /** @type {number} */ (this.optionValue('selectStrokeThickness'));

    var colsMap = u.mapToObject(cols, function(col) { return {'key': col, 'value': true}; });
    objects = objects.filter(function(o) { return o['__d__'] in colsMap; });

    var transform =
      vs.models.Transformer
        .scale(xScale, yScale)
        .translate({'x': margins.left, 'y': margins.top});

    var context = this.brushingCanvas[0].getContext('2d');
    this.brushingCanvas
      .attr({'width': width, 'height': height});
    for (var i = 0; i < objects.length; ++i) {
      var d = objects[i];
      var point = transform.calc({'x': parseFloat(d[xVal]), 'y': d[yVal]});
      vs.ui.canvas.CanvasVis.circle(context, point.x, point.y, itemRadius, selectFill, selectStroke, selectStrokeThickness);
    }

    this.brushingCanvas.css('display', 'block');
  };

  /**
   * @param {vs.ui.BrushingEvent} e
   * @param {Array.<Object>} objects
   */
  ManhattanPlot.prototype.unhighlightItem = function(e, objects) {
    this.brushingCanvas.css('display', 'none');
    var width = /** @type {number} */ (this.optionValue('width'));
    var height = /** @type {number} */ (this.optionValue('height'));
    this.brushingCanvas[0].getContext('2d').clearRect(0, 0, width, height);
  };

  //endregion

  return ManhattanPlot;
})();
