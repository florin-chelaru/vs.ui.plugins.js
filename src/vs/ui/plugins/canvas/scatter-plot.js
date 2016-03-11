/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 8/27/2015
 * Time: 2:20 PM
 */

//region goog...
goog.provide('vs.ui.plugins.canvas.ScatterPlot');

if (COMPILED) {
  goog.require('vs.ui');
}
//endregion

// Because vs.ui.canvas.CanvasVis is defined in another library (vis.js), there is no way for the Google Closure compiler
// to know the names of the private variables of that class. Therefore, when overriding this class, we need to declare
// private variables in a private scope (closure), using Symbols (ES6), so we don't accidentally replace existing
// private members.

/**
 * @constructor
 * @extends vs.ui.canvas.CanvasVis
 */
vs.ui.plugins.canvas.ScatterPlot = (function() {

  var _quadTree = Symbol('_quadTree');
  var _merged = Symbol('_merged');

  /**
   * @constructor
   * @extends vs.ui.canvas.CanvasVis
   */
  var ScatterPlot = function() {
    vs.ui.canvas.CanvasVis.apply(this, arguments);

    /**
     * Merged data source for the x and y axes of the scatter plot, from the two data sources corresponding to x and y respectively
     * @type {null|vs.models.DataSource}
     * @private
     */
    this[_merged] = null;

    /**
     * @type {u.QuadTree}
     * @private
     */
    this[_quadTree] = null;

    var self = this;
    // Options changed
    this.$scope.$watch(
      function(){ return { 'cols': self.options['cols'], 'xVal': self.options['xVal'], 'mergeCols': self.options['mergeCols'] }; },
      function() { self.schedulePreProcessData().then(function() { self.scheduleRedraw(); }); },
      true);
  };

  goog.inherits(ScatterPlot, vs.ui.canvas.CanvasVis);

  //region Static Methods
  /**
   * @param {Object.<string, *>} options
   * @param $attrs Angular attrs
   * @param {Array.<vs.models.DataSource>} [data]
   * @param {Object.<string, vs.ui.Setting>} [settings]
   * @returns {*}
   */
  ScatterPlot.xScale = function (options, $attrs, data, settings) {
    var dependencies = ['yBoundaries', 'width', 'margins'];
    if (!settings) { throw new vs.ui.UiException('Settings not provided for "xScale", which depends on ' + JSON.stringify(dependencies)); }
    dependencies.forEach(function(dep) {
      if (!(dep in settings)) {
        throw new vs.ui.UiException('Missing dependency for "' + dep + '" in the "xScale" defaultValue function');
      }
    });

    var yBoundaries = /** @type {vs.models.Boundaries} */ (settings['yBoundaries'].getValue(options, $attrs, data, settings));
    var width = /** @type {number} */ (settings['width'].getValue(options, $attrs, data, settings));
    var margins = /** @type {vs.models.Margins} */ (settings['margins'].getValue(options, $attrs, data, settings));
    return d3.scale.linear()
      .domain([yBoundaries['min'], yBoundaries['max']])
      .range([0, width - margins['left'] - margins['right']]);
  };
  //endregion

  //region Constants
  /**
   * @type {Object.<string, vs.ui.Setting>}
   */
  ScatterPlot.Settings = u.extend({}, vs.ui.canvas.CanvasVis.Settings, {
    'xVal': vs.ui.Setting.PredefinedSettings['xVal'],
    'yVal': vs.ui.Setting.PredefinedSettings['yVal'],
    'xBoundaries': vs.ui.Setting.PredefinedSettings['xBoundaries'],
    'yBoundaries': vs.ui.Setting.PredefinedSettings['yBoundaries'],
    'xScale': new vs.ui.Setting({'key':'xScale', 'type':vs.ui.Setting.Type['FUNCTION'], 'defaultValue':ScatterPlot.xScale, 'hidden': true}),
    'yScale': vs.ui.Setting.PredefinedSettings['yScale'],
    'cols': vs.ui.Setting.PredefinedSettings['cols'],
    'mergeCols': vs.ui.Setting.PredefinedSettings['mergeCols'],
    'vals': new vs.ui.Setting({'key':'vals', 'type':vs.ui.Setting.Type.DATA_ROW_LABEL, 'defaultValue':vs.ui.Setting.firstRowsLabel, 'label':'values', 'template':'_categorical.html'}),
    'itemRatio': new vs.ui.Setting({'key':'itemRatio', 'type':vs.ui.Setting.Type.NUMBER, 'defaultValue': 0.015, 'label':'item ratio', 'template':'_number.html'}),
    'fill': vs.ui.Setting.PredefinedSettings['fill'],
    'stroke': vs.ui.Setting.PredefinedSettings['stroke'],
    'strokeThickness': vs.ui.Setting.PredefinedSettings['strokeThickness'],
    'selectFill': vs.ui.Setting.PredefinedSettings['selectFill'],
    'selectStroke': vs.ui.Setting.PredefinedSettings['selectStroke'],
    'selectStrokeThickness': vs.ui.Setting.PredefinedSettings['selectStrokeThickness']
  });
  //endregion

  //region Properties
  Object.defineProperties(ScatterPlot.prototype, {
    'settings': { get: /** @type {function (this:ScatterPlot)} */ (function() { return ScatterPlot.Settings; })}
  });
  //endregion

  //region Methods
  ScatterPlot.prototype.beginDraw = function() {
    var self = this;
    var args = arguments;
    return new Promise(function(resolve, reject) {
      vs.ui.canvas.CanvasVis.prototype.beginDraw.apply(self, args).then(function() {
        /** @type {vs.models.DataSource} */
        var data = self[_merged];

        // Nothing to draw
        if (!data || !data.d.length) { resolve(); return; }

        var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));
        var margins = /** @type {vs.models.Margins} */ (self.optionValue('margins'));
        var yBoundaries = /** @type {vs.models.Boundaries} */ (self.optionValue('yBoundaries'));
        var xVal = /** @type {string} */ (self.optionValue('xVal'));
        var yVal = /** @type {string} */ (self.optionValue('yVal'));
        var itemRatio = /** @type {number} */ (self.optionValue('itemRatio'));
        var xScale = /** @type {function(number): number} */ (self.optionValue('xScale'));
        var yScale = /** @type {function(number): number} */ (self.optionValue('yScale'));

        var width = /** @type {number} */ (self.optionValue('width'));
        var height = /** @type {number} */ (self.optionValue('height'));

        var itemRadius = Math.min(Math.abs(width), Math.abs(height)) * itemRatio;

        var xCol = cols[0];
        var yCol = cols[1];

        var qt = new u.QuadTree(margins.left, margins.top, width - margins.left - margins.right, height - margins.top - margins.bottom, itemRatio, 10);

        var transform =
          vs.models.Transformer
            .scale(xScale, yScale)
            .translate({'x': margins.left, 'y': margins.top});
        var items = data.d;
        var w, h;
        w = h = itemRadius;

        for (var i = 0; i < items.length; ++i) {
          var d = items[i];
          var point = transform.calc({
            'x': d[xCol] != undefined ? d[xCol][yVal] : yBoundaries.min,
            'y': d[yCol] != undefined ? d[yCol][yVal] : yBoundaries.min
          });

          qt.insert(point.x - w, point.y - h, w * 2, h * 2, d);
        }

        self[_quadTree] = qt;

        resolve();
      });
    });
  };

  ScatterPlot.prototype.endDraw = function() {
    var self = this;
    var args = arguments;
    return new Promise(function(resolve, reject) {
      /** @type {vs.models.DataSource} */
      var data = self[_merged];

      // Nothing to draw
      if (!data || !data.d.length) { resolve(); return; }

      var margins = /** @type {vs.models.Margins} */ (self.optionValue('margins'));
      var xScale = /** @type {function(number): number} */ (self.optionValue('xScale'));
      var yScale = /** @type {function(number): number} */ (self.optionValue('yScale'));
      var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));
      var yBoundaries = /** @type {vs.models.Boundaries} */ (self.optionValue('yBoundaries'));

      var xVal = /** @type {string} */ (self.optionValue('xVal'));
      var yVal = /** @type {string} */ (self.optionValue('yVal'));

      var itemRatio = /** @type {number} */ (self.optionValue('itemRatio'));
      var width = /** @type {number} */ (self.optionValue('width'));
      var height = /** @type {number} */ (self.optionValue('height'));

      var itemRadius = Math.min(Math.abs(width), Math.abs(height)) * itemRatio;

      var xCol = cols[0];
      var yCol = cols[1];

      var fill = /** @type {string} */ (self.optionValue('fill'));
      var stroke = /** @type {string} */ (self.optionValue('stroke'));
      var strokeThickness = /** @type {number} */ (self.optionValue('strokeThickness'));

      var context = self.pendingCanvas[0].getContext('2d');

      var transform =
        vs.models.Transformer
          .scale(xScale, yScale)
          .translate({'x': margins.left, 'y': margins.top});
      var items = data.d;

      // Instead of drawing all circles synchronously (and risk causing the browser to hang)...
      /*items.forEach(function(d) {
       var point = transform.calc({'x': d.val(xCol, valsLabel), 'y': d.val(yCol, valsLabel)});
       vs.ui.canvas.CanvasVis.circle(context, point.x, point.y, 3, '#ff6520');
       });
       resolve();
       */

      // ... draw them asynchronously, which takes a bit longer, but keeps the UI responsive
      u.async.each(items, function(d) {
        return new Promise(function(drawCircleResolve, drawCircleReject) {
          setTimeout(function() {
            var point = transform.calc({
              'x': d[xCol] != undefined ? d[xCol][yVal] : yBoundaries.min,
              'y': d[yCol] != undefined ? d[yCol][yVal] : yBoundaries.min
            });
            var f = d[xCol] == undefined || d[yCol] == undefined ? 'rgba(170,170,170,0.5)' : fill;
            var s = d[xCol] == undefined || d[yCol] == undefined ? 'rgb(170,170,170)' : stroke;
            vs.ui.canvas.CanvasVis.circle(context, point.x, point.y, itemRadius, f, s, strokeThickness);
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
  ScatterPlot.prototype.getItemsAt = function(x, y) {
    if (!this[_quadTree]) { return []; }
    var cols = /** @type {Array.<string>} */ (this.optionValue('cols'));
    var xCol = cols[0];
    var yCol = cols[1];
    return u.fast.concat(u.fast.map(this[_quadTree].collisions(x, y), function(v) {
      var ret = [];
      if (v.value[xCol] != undefined) { ret.push(v.value[xCol]); }
      if (v.value[yCol] != undefined) { ret.push(v.value[yCol]); }
      return ret;
    }));
  };

  /**
   * @param {vs.ui.BrushingEvent} e
   * @param {Array.<Object>} objects
   */
  ScatterPlot.prototype.highlightItem = function(e, objects) {
    if (!this.brushingCanvas) { return; }
    if (!objects.length) { return; }

    /** @type {vs.models.DataSource} */
    var data = this[_merged];
    if (!data) { return; }

    var key = /** @type {string} */ (this.optionValue('xVal'));
    var map = u.mapToObject(objects, function(d) { return {'key': d[key], 'value': true}; });
    var elems = u.fast.filter(data.d, function(d) { return d[key] in map; });
    if (!elems.length) { return; }

    var margins = /** @type {vs.models.Margins} */ (this.optionValue('margins'));
    var xScale = /** @type {function(number): number} */ (this.optionValue('xScale'));
    var yScale = /** @type {function(number): number} */ (this.optionValue('yScale'));
    var cols = /** @type {Array.<string>} */ (this.optionValue('cols'));
    var yVal = /** @type {string} */ (this.optionValue('yVal'));
    var itemRatio = /** @type {number} */ (this.optionValue('itemRatio'));
    var width = /** @type {number} */ (this.optionValue('width'));
    var height = /** @type {number} */ (this.optionValue('height'));
    var yBoundaries = /** @type {vs.models.Boundaries} */ (this.optionValue('yBoundaries'));

    var selectFill = /** @type {string} */ (this.optionValue('selectFill'));
    var selectStroke = /** @type {string} */ (this.optionValue('selectStroke'));
    var selectStrokeThickness = /** @type {number} */ (this.optionValue('selectStrokeThickness'));

    var transform =
      vs.models.Transformer
        .scale(xScale, yScale)
        .translate({'x': margins.left, 'y': margins.top});

    var itemRadius = Math.min(Math.abs(width), Math.abs(height)) * itemRatio;

    var xCol = cols[0];
    var yCol = cols[1];

    var context = this.brushingCanvas[0].getContext('2d');
    this.brushingCanvas
      .attr({'width': width, 'height': height});
    u.fast.forEach(elems, function(d) {
      var point = transform.calc({
        'x': d[xCol] != undefined ? d[xCol][yVal] : yBoundaries.min,
        'y': d[yCol] != undefined ? d[yCol][yVal] : yBoundaries.min
      });
      vs.ui.canvas.CanvasVis.circle(context, point.x, point.y, itemRadius, selectFill, selectStroke, selectStrokeThickness);
    });

    this.brushingCanvas.css('display', 'block');
  };

  /**
   * @param {vs.ui.BrushingEvent} e
   * @param {Array.<Object>} objects
   */
  ScatterPlot.prototype.unhighlightItem = function(e, objects) {
    this.brushingCanvas.css('display', 'none');
    var width = /** @type {number} */ (this.optionValue('width'));
    var height = /** @type {number} */ (this.optionValue('height'));
    this.brushingCanvas[0].getContext('2d').clearRect(0, 0, width, height);
  };

  ScatterPlot.prototype.preProcessData = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      Promise.all(self.data.map(function(d) { return d.ready; })).then(function() {
        var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));
        var xVal = /** @type {string} */ (self.optionValue('xVal'));

        var data = cols.map(function(col) { return self.data[u.array.indexOf(self.data, function(d) {return d.id == col;})]; });
        if (data.length < 2) { reject('Scatter plot needs two columns of data, but only received ' + cols.length); return; }

        var mergeCols = /** @type {function(string, Array.<vs.models.DataSource>):vs.models.DataSource} */ (self.optionValue('mergeCols'));
        self[_merged] = mergeCols(xVal, data);
        resolve();
      });
    });
  };
  //endregion

  return ScatterPlot;
})();
