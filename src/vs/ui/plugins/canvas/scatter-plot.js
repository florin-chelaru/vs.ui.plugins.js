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
      function(){ return { 'xyFields': self.options['xyFields'], 'mergeField': self.options['mergeField'], 'mergeCols': self.options['mergeCols'] }; },
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
    u.fast.forEach(dependencies, function(dep) {
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
    'mergeField': new vs.ui.Setting({'key':'mergeField', 'type':vs.ui.Setting.Type['DATA_ROW_LABEL'], 'defaultValue':vs.ui.Setting.firstRowsLabel, 'label':'merge field', 'template':'_categorical.html'}),
    'valueField': vs.ui.Setting.PredefinedSettings['yField'].copy({'key': 'valueField', 'label': 'value field'}),
    'xBoundaries': vs.ui.Setting.PredefinedSettings['xBoundaries'].copy({'dependencies': {'xField': 'valueField'}}),
    'yBoundaries': vs.ui.Setting.PredefinedSettings['yBoundaries'].copy({'dependencies': {'yField': 'valueField'}}),
    'xScale': vs.ui.Setting.PredefinedSettings['xScale'],
    'yScale': vs.ui.Setting.PredefinedSettings['yScale'],
    'xyFields': vs.ui.Setting.PredefinedSettings['cols'].copy({'key': 'xyFields', 'label': 'x/y fields', 'defaultValue':function(setting, options, $attrs, data) { return u.fast.map(data.slice(0, 2), function(d) { return d['id']; }); }}),
    'xLabel': new vs.ui.Setting({'key': 'xLabel', 'type': vs.ui.Setting.Type['STRING'], 'defaultValue': ScatterPlot.xLabelDefault, 'label': 'x label', 'dependencies': {'xyFields':'xyFields'}, 'template': '_string.html'}),
    'yLabel': new vs.ui.Setting({'key': 'yLabel', 'type': vs.ui.Setting.Type['STRING'], 'defaultValue': ScatterPlot.yLabelDefault, 'label': 'y label', 'dependencies': {'xyFields':'xyFields'}, 'template': '_string.html'}),
    'mergeFields': vs.ui.Setting.PredefinedSettings['mergeCols'].copy({'key':'mergeFields', 'dependencies': {'xCol': 'mergeField'}}),
    'itemRatio': new vs.ui.Setting({'key':'itemRatio', 'type':vs.ui.Setting.Type.NUMBER, 'defaultValue': 0.015, 'label':'item ratio', 'template':'_slider.html', 'possibleValues': {'min': 0.001, 'max': 0.1, 'step': 0.001}}),
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

        var xyFields = /** @type {Array.<string>} */ (self.optionValue('xyFields'));
        var margins = /** @type {vs.models.Margins} */ (self.optionValue('margins'));
        var yBoundaries = /** @type {vs.models.Boundaries} */ (self.optionValue('yBoundaries'));
        var mergeField = /** @type {string} */ (self.optionValue('mergeField'));
        var valueField = /** @type {string} */ (self.optionValue('valueField'));
        var itemRatio = /** @type {number} */ (self.optionValue('itemRatio'));
        var xScale = /** @type {function(number): number} */ (self.optionValue('xScale'));
        var yScale = /** @type {function(number): number} */ (self.optionValue('yScale'));

        var width = /** @type {number} */ (self.optionValue('width'));
        var height = /** @type {number} */ (self.optionValue('height'));

        var itemRadius = Math.min(Math.abs(width), Math.abs(height)) * itemRatio;

        var xCol = xyFields[0];
        var yCol = xyFields[1];

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
            'x': d[xCol] != undefined ? d[xCol][valueField] : yBoundaries.min,
            'y': d[yCol] != undefined ? d[yCol][valueField] : yBoundaries.min
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
      var xyFields = /** @type {Array.<string>} */ (self.optionValue('xyFields'));
      var yBoundaries = /** @type {vs.models.Boundaries} */ (self.optionValue('yBoundaries'));

      var mergeField = /** @type {string} */ (self.optionValue('mergeField'));
      var valueField = /** @type {string} */ (self.optionValue('valueField'));

      var itemRatio = /** @type {number} */ (self.optionValue('itemRatio'));
      var width = /** @type {number} */ (self.optionValue('width'));
      var height = /** @type {number} */ (self.optionValue('height'));

      var itemRadius = Math.min(Math.abs(width), Math.abs(height)) * itemRatio;

      var xCol = xyFields[0];
      var yCol = xyFields[1];

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
              'x': d[xCol] != undefined ? d[xCol][valueField] : yBoundaries.min,
              'y': d[yCol] != undefined ? d[yCol][valueField] : yBoundaries.min
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
    console.log(x, y);
    if (!this[_quadTree]) { return []; }
    var xyFields = /** @type {Array.<string>} */ (this.optionValue('xyFields'));
    var xCol = xyFields[0];
    var yCol = xyFields[1];
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

    var key = /** @type {string} */ (this.optionValue('mergeField'));
    var map = u.mapToObject(objects, function(d) { return {'key': d[key], 'value': true}; });
    var elems = u.fast.filter(data.d, function(d) { return d[key] in map; });
    if (!elems.length) { return; }

    var margins = /** @type {vs.models.Margins} */ (this.optionValue('margins'));
    var xScale = /** @type {function(number): number} */ (this.optionValue('xScale'));
    var yScale = /** @type {function(number): number} */ (this.optionValue('yScale'));
    var xyFields = /** @type {Array.<string>} */ (this.optionValue('xyFields'));
    var valueField = /** @type {string} */ (this.optionValue('valueField'));
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

    var xCol = xyFields[0];
    var yCol = xyFields[1];

    var context = this.brushingCanvas[0].getContext('2d');
    this.brushingCanvas
      .attr({'width': width, 'height': height});
    u.fast.forEach(elems, function(d) {
      var point = transform.calc({
        'x': d[xCol] != undefined ? d[xCol][valueField] : yBoundaries.min,
        'y': d[yCol] != undefined ? d[yCol][valueField] : yBoundaries.min
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
      Promise.all(u.fast.map(self.data, function(d) { return d.ready; })).then(function() {
        var xyFields = /** @type {Array.<string>} */ (self.optionValue('xyFields'));
        var mergeField = /** @type {string} */ (self.optionValue('mergeField'));

        var data = u.fast.map(xyFields, function(col) { return self.data[u.array.indexOf(self.data, function(d) {return d.id == col;})]; });
        if (data.length < 2) { reject('Scatter plot needs two columns of data, but only received ' + xyFields.length); return; }

        var mergeFields = /** @type {function(string, Array.<vs.models.DataSource>):vs.models.DataSource} */ (self.optionValue('mergeFields'));
        self[_merged] = mergeFields(mergeField, data);
        resolve();
      });
    });
  };
  //endregion

  return ScatterPlot;
})();
