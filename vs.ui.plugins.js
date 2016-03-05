/**
* @license vs.ui.plugins.js
* Copyright (c) 2015 Florin Chelaru
* License: MIT
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
* documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
* rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
* Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
* WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
* COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
* OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


/**
 * @fileoverview
 * @suppress {globalThis}
 */

if (COMPILED) {
  goog.provide('vs.ui');
}

// Extend the namespaces defined here with the ones in the base vis.js package
(function() {
  u.extend(vs, this['vs']);
  u.extend(vs.ui, this['vs']['ui']);
}).call(this);



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

        items.forEach(function(d) {
          var point = transform.calc({
            'x': d[xCol] != undefined ? d[xCol][yVal] : yBoundaries.min,
            'y': d[yCol] != undefined ? d[yCol][yVal] : yBoundaries.min
          });

          qt.insert(point.x - w, point.y - h, w * 2, h * 2, d);
        });

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
    /*if (!this[_quadTree]) { return []; }
    return this[_quadTree].collisions(x, y).map(function(v) { return v.value; });*/
    return [];
  };

  /**
   * @param {vs.ui.BrushingEvent} e
   * @param {Array.<Object>} objects
   */
  ScatterPlot.prototype.highlightItem = function(e, objects) {
    /*var margins = /!** @type {vs.models.Margins} *!/ (this.optionValue('margins'));
    var xScale = /!** @type {function(number): number} *!/ (this.optionValue('xScale'));
    var yScale = /!** @type {function(number): number} *!/ (this.optionValue('yScale'));
    var cols = /!** @type {Array.<string>} *!/ (this.optionValue('cols'));
    var valsLabel = /!** @type {string} *!/ (this.optionValue('vals'));
    var itemRatio = /!** @type {number} *!/ (this.optionValue('itemRatio'));
    var width = /!** @type {number} *!/ (this.optionValue('width'));
    var height = /!** @type {number} *!/ (this.optionValue('height'));

    var selectFill = /!** @type {string} *!/ (this.optionValue('selectFill'));
    var selectStroke = /!** @type {string} *!/ (this.optionValue('selectStroke'));
    var selectStrokeThickness = /!** @type {number} *!/ (this.optionValue('selectStrokeThickness'));

    var transform =
      vs.models.Transformer
        .scale(xScale, yScale)
        .translate({'x': margins.left, 'y': margins.top});

    var itemRadius = Math.min(Math.abs(width), Math.abs(height)) * itemRatio;

    var xCol = cols[0];
    var yCol = cols[1];
    var point = transform.calc({'x': d.val(xCol, valsLabel), 'y': d.val(yCol, valsLabel)});

    var context = canvas.getContext('2d');
    vs.ui.canvas.CanvasVis.circle(context, point.x, point.y, itemRadius, selectFill, selectStroke, selectStrokeThickness);*/
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

        items.forEach(function(d) {
          var initialPoint = {x: parseFloat(d[x]), y: parseFloat(d[y])};
          var point = transform.calc(initialPoint);

          qt.insert(point.x - w, point.y - h, w * 2, h * 2, d);
        });

        self[_quadTree] = qt;

        resolve();
      });
    });
  };

  ManhattanPlot.prototype.endDraw = function() {
    var self = this;
    var args = arguments;
    return new Promise(function(resolve, reject) {
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
            var point = transform.calc({x: parseFloat(d[x]), y: parseFloat(d[y])});
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
    /*if (!this[_quadTree]) { return []; }
    return this[_quadTree].collisions(x, y).map(function(v) { return v.value; });*/
    return [];
  };

  /**
   * @param {vs.ui.BrushingEvent} e
   * @param {Array.<Object>} objects
   */
  ManhattanPlot.prototype.highlightItem = function(e, objects) {
    /*var self = this;
    var margins = /!** @type {vs.models.Margins} *!/ (self.optionValue('margins'));
    var xScale = /!** @type {function(number): number} *!/ (self.optionValue('xScale'));
    var yScale = /!** @type {function(number): number} *!/ (self.optionValue('yScale'));
    var cols = /!** @type {Array.<string>} *!/ (self.optionValue('cols'));
    var row = (/!** @type {Array.<string>} *!/ (self.optionValue('rows')))[0];
    var valsLabel = /!** @type {string} *!/ (self.optionValue('vals'));
    var itemRatio = /!** @type {number} *!/ (self.optionValue('itemRatio'));
    var width = /!** @type {number} *!/ (self.optionValue('width'));
    var height = /!** @type {number} *!/ (self.optionValue('height'));
    var itemRadius = Math.min(Math.abs(width), Math.abs(height)) * itemRatio;

    var selectFill = /!** @type {string} *!/ (this.optionValue('selectFill'));
    var selectStroke = /!** @type {string} *!/ (this.optionValue('selectStroke'));
    var selectStrokeThickness = /!** @type {number} *!/ (this.optionValue('selectStrokeThickness'));

    var transform =
      vs.models.Transformer
        .scale(xScale, yScale)
        .translate({'x': margins.left, 'y': margins.top});

    var point = transform.calc({x: parseFloat(d.info(row)), y: d.val(cols[0], valsLabel)});

    var context = canvas.getContext('2d');
    vs.ui.canvas.CanvasVis.circle(context, point.x, point.y, itemRadius, selectFill, selectStroke, selectStrokeThickness);*/
  };
  //endregion

  return ManhattanPlot;
})();


//region goog...
goog.provide('vs.ui.plugins.svg.ScatterPlot');

if (COMPILED) {
  goog.require('vs.ui');
}
//endregion

// Because vs.ui.svg.SvgVis is defined in another library (vis.js), there is no way for the Google Closure compiler
// to know the names of the private variables of that class. Therefore, when overriding this class, we need to declare
// private variables in a private scope (closure), using Symbols (ES6), so we don't accidentally replace existing
// private members.

/**
 * @constructor
 * @extends vs.ui.svg.SvgVis
 */
vs.ui.plugins.svg.ScatterPlot = (function() {

  var _merged = Symbol('_merged');

  /**
   * @constructor
   * @extends vs.ui.svg.SvgVis
   */
  var ScatterPlot = function() {
    vs.ui.svg.SvgVis.apply(this, arguments);

    /**
     * Merged data source for the x and y axes of the scatter plot, from the two data sources corresponding to x and y respectively
     * @type {null|vs.models.DataSource}
     * @private
     */
    this[_merged] = null;

    var self = this;
    // Options changed
    this.$scope.$watch(
      function(){ return { 'cols': self.options['cols'], 'xVal': self.options['xVal'], 'mergeCols': self.options['mergeCols'] }; },
      function() { self.schedulePreProcessData().then(function() { self.scheduleRedraw(); }); },
      true);
  };

  goog.inherits(ScatterPlot, vs.ui.svg.SvgVis);

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
  ScatterPlot.Settings = u.extend({}, vs.ui.VisHandler.Settings, {
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
  /**
   * @override
   */
  ScatterPlot.prototype.endDraw = function() {
    var self = this;
    var args = arguments;
    return new Promise(function(resolve, reject) {
      /** @type {vs.models.DataSource} */
      var data = self[_merged];

      // Nothing to draw
      if (!data || !data.d.length) { resolve(); return; }

      var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));
      var xCol = cols[0];
      var yCol = cols[1];

      var margins = /** @type {vs.models.Margins} */ (self.optionValue('margins'));
      var yBoundaries = /** @type {vs.models.Boundaries} */ (self.optionValue('yBoundaries'));
      var xScale = /** @type {function(number): number} */ (self.optionValue('xScale'));
      var yScale = /** @type {function(number): number} */ (self.optionValue('yScale'));

      var key = /** @type {string} */ (self.optionValue('xVal'));
      var yVal = /** @type {string} */ (self.optionValue('yVal'));

      var itemRatio = /** @type {number} */ (self.optionValue('itemRatio'));
      var width = /** @type {number} */ (self.optionValue('width'));
      var height = /** @type {number} */ (self.optionValue('height'));
      var fill = /** @type {string} */ (self.optionValue('fill'));
      var stroke = /** @type {string} */ (self.optionValue('stroke'));
      var strokeThickness = /** @type {number} */ (self.optionValue('strokeThickness'));

      var itemRadius = Math.min(Math.abs(width), Math.abs(height)) * itemRatio;

      var svg = d3.select(self.$element[0]).select('svg');

      var viewport = svg.select('.viewport');
      if (viewport.empty()) {
        viewport = svg.append('g')
          .attr('class', 'viewport');
      }
      viewport
        .attr('transform', 'translate(' + margins.left + ', ' + margins.top + ')');

      var items = data.d;
      var selection = viewport.selectAll('circle').data(items, function(d) { return d[key]; });

      /** @type {Object.<string, vs.models.DataSource>} */
      var dataMap = u.mapToObject(self['data'], function(d) { return {'key': d['id'], 'value': d}});
      selection.enter()
        .append('circle')
        .attr('class', 'vs-item')
        .on('mouseover', function (d) {
          if (d[xCol]) { self['brushing'].fire(new vs.ui.BrushingEvent(dataMap[xCol], vs.ui.BrushingEvent.Action['MOUSEOVER'], d[xCol])); }
          if (d[yCol]) { self['brushing'].fire(new vs.ui.BrushingEvent(dataMap[yCol], vs.ui.BrushingEvent.Action['MOUSEOVER'], d[yCol])); }
        })
        .on('mouseout', function (d) {
          if (d[xCol]) { self['brushing'].fire(new vs.ui.BrushingEvent(dataMap[xCol], vs.ui.BrushingEvent.Action['MOUSEOUT'], d[xCol])); }
          if (d[yCol]) { self['brushing'].fire(new vs.ui.BrushingEvent(dataMap[yCol], vs.ui.BrushingEvent.Action['MOUSEOUT'], d[yCol])); }
        })
        .on('click', function (d) {
          d3.event.stopPropagation();
        });
      selection
        .attr('r', itemRadius)
        .attr('cx', function(d) { return xScale(d[xCol] != undefined ? d[xCol][yVal] : yBoundaries.min); })
        .attr('cy', function(d) { return yScale(d[yCol] != undefined ? d[yCol][yVal] : yBoundaries.min); })
        .style('fill', function(d) { return d[xCol] == undefined || d[yCol] == undefined ? 'rgba(170,170,170,0.5)' : fill; })
        .style('stroke', function(d) { return d[xCol] == undefined || d[yCol] == undefined ? 'rgb(170,170,170)' : stroke; })
        .style('stroke-width', strokeThickness);

      selection.exit()
        .remove();

      resolve();
    }).then(function() {
      return vs.ui.svg.SvgVis.prototype.endDraw.apply(self, args);
    });
  };

  /**
   * @param {vs.ui.BrushingEvent} e
   * @param {Array.<Object>} objects
   */
  ScatterPlot.prototype.highlightItem = function(e, objects) {
    var viewport = d3.select(this.$element[0]).select('svg').select('.viewport');
    if (viewport.empty()) { return; }

    var key = /** @type {string} */ (this.optionValue('xVal'));
    var map = u.mapToObject(objects, function(d) { return {'key': d[key], 'value': true}; });
    var elems = viewport.selectAll('.vs-item').filter(function(d) { return d[key] in map; });
    if (elems.empty()) { return; }

    var selectFill = /** @type {string} */ (this.optionValue('selectFill'));
    var selectStroke = /** @type {string} */ (this.optionValue('selectStroke'));
    var selectStrokeThickness = /** @type {number} */ (this.optionValue('selectStrokeThickness'));

    elems
      .style('fill', selectFill)
      .style('stroke', selectStroke)
      .style('stroke-width', selectStrokeThickness);

    $(elems[0]).appendTo($(viewport));
  };

  /**
   * @param {vs.ui.BrushingEvent} e
   * @param {Array.<Object>} objects
   */
  ScatterPlot.prototype.unhighlightItem = function(e, objects) {
    var viewport = d3.select(this.$element[0]).select('svg').select('.viewport');
    if (viewport.empty()) { return; }

    var key = /** @type {string} */ (this.optionValue('xVal'));
    var map = u.mapToObject(objects, function(d) { return {'key': d[key], 'value': true}; });
    var elems = viewport.selectAll('.vs-item').filter(function(d) { return d[key] in map; });
    if (elems.empty()) { return; }

    var fill = /** @type {string} */ (this.optionValue('fill'));
    var stroke = /** @type {string} */ (this.optionValue('stroke'));
    var strokeThickness = /** @type {number} */ (this.optionValue('strokeThickness'));

    var cols = /** @type {Array.<string>} */ (this.optionValue('cols'));
    var xCol = cols[0];
    var yCol = cols[1];

    elems
     .style('stroke-width', strokeThickness)
     .style('fill', function(d) { return d[xCol] == undefined || d[yCol] == undefined ? 'rgba(170,170,170,0.5)' : fill; })
     .style('stroke', function(d) { return d[xCol] == undefined || d[yCol] == undefined ? 'rgb(170,170,170)' : stroke; });
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


//region goog...
goog.provide('vs.ui.plugins.svg.ManhattanPlot');

if (COMPILED) {
  goog.require('vs.ui');
}
//endregion

/**
 * @constructor
 * @extends vs.ui.svg.SvgVis
 */
vs.ui.plugins.svg.ManhattanPlot = function() {
  vs.ui.svg.SvgVis.apply(this, arguments);
};

goog.inherits(vs.ui.plugins.svg.ManhattanPlot, vs.ui.svg.SvgVis);

//region Constants
/**
 * @type {Object.<string, vs.ui.Setting>}
 */
vs.ui.plugins.svg.ManhattanPlot.Settings = u.extend({}, vs.ui.VisHandler.Settings, {
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
Object.defineProperties(vs.ui.plugins.svg.ManhattanPlot.prototype, {
  'settings': { get: /** @type {function (this:vs.ui.plugins.svg.ManhattanPlot)} */ (function() { return vs.ui.plugins.svg.ManhattanPlot.Settings; })}
});
//endregion

//region Methods
/**
 * @override
 */
vs.ui.plugins.svg.ManhattanPlot.prototype.endDraw = function() {
  var self = this;
  var args = arguments;
  return new Promise(function(resolve, reject) {
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

    var fills = /** @type {function(*):string} */ (self.optionValue('fills'));
    var fillOpacity = /** @type {number} */ (self.optionValue('fillOpacity'));
    var strokes = /** @type {function(*):string} */ (self.optionValue('strokes'));
    var strokeThickness = /** @type {number} */ (self.optionValue('strokeThickness'));
    var itemRatio = /** @type {number} */ (self.optionValue('itemRatio'));
    var width = /** @type {number} */ (self.optionValue('width'));
    var height = /** @type {number} */ (self.optionValue('height'));
    var itemRadius = Math.min(Math.abs(width), Math.abs(height)) * itemRatio;

    var svg = d3.select(self.$element[0]).select('svg');
    var viewport = svg.select('.viewport');
    if (viewport.empty()) {
      viewport = svg.append('g')
        .attr('class', 'viewport');
    }
    viewport
      .attr('transform', 'translate(' + margins.left + ', ' + margins.top + ')');

    var items = u.fast.concat(u.fast.map(data, function(d) { return d.d; }));
    var selection = viewport.selectAll('circle').data(items, self._key());

    /** @type {Object.<string, vs.models.DataSource>} */
    var dataMap = u.mapToObject(self['data'], function(d) { return {'key': d['id'], 'value': d}});
    selection.enter()
      .append('circle')
      .attr('class', 'vs-item')
      .on('mouseover', function (d) {
        if (d) { self['brushing'].fire(new vs.ui.BrushingEvent(dataMap[d['__d__']], vs.ui.BrushingEvent.Action['MOUSEOVER'], d)); }
      })
      .on('mouseout', function (d) {
        if (d) { self['brushing'].fire(new vs.ui.BrushingEvent(dataMap[d['__d__']], vs.ui.BrushingEvent.Action['MOUSEOUT'], d)); }
      })
      .on('click', function (d) {
        d3.event.stopPropagation();
      });

    selection
      .attr('r', itemRadius)
      .attr('cx', function(d) { return xScale(parseFloat(d[x])); })
      .attr('cy', function(d) { return yScale(parseFloat(d[y])); })
      .style('fill', function(d) { return u.hex2rgba(fills(d['__d__']), fillOpacity); })
      .style('stroke', function(d) { return strokes([d['__d__']]); })
      .style('stroke-width', strokeThickness);

    selection.exit()
      .remove();

    resolve();
  }).then(function() {
    return vs.ui.svg.SvgVis.prototype.endDraw.apply(self, args);
  });
};

/**
 * @param {vs.ui.BrushingEvent} e
 * @param {Array.<Object>} objects
 */
vs.ui.plugins.svg.ManhattanPlot.prototype.highlightItem = function(e, objects) {
  var viewport = d3.select(this.$element[0]).select('svg').select('.viewport');
  if (viewport.empty()) { return; }

  var key = this._key();
  var map = u.mapToObject(objects, function(d) { return {'key': key(d), 'value': true}; });
  var elems = viewport.selectAll('.vs-item').filter(function(d) { return key(d) in map; });
  if (elems.empty()) { return; }

  var selectFill = /** @type {string} */ (this.optionValue('selectFill'));
  var selectStroke = /** @type {string} */ (this.optionValue('selectStroke'));
  var selectStrokeThickness = /** @type {number} */ (this.optionValue('selectStrokeThickness'));

  elems
    .style('stroke', selectStroke)
    .style('stroke-width', selectStrokeThickness)
    .style('fill', selectFill);
  $(elems[0]).appendTo($(viewport[0]));
};

/**
 * @param {vs.ui.BrushingEvent} e
 * @param {Array.<Object>} objects
 */
vs.ui.plugins.svg.ManhattanPlot.prototype.unhighlightItem = function(e, objects) {
  var viewport = d3.select(this.$element[0]).select('svg').select('.viewport');
  if (viewport.empty()) { return; }

  var key = this._key();
  var map = u.mapToObject(objects, function(d) { return {'key': key(d), 'value': true}; });
  var elems = viewport.selectAll('.vs-item').filter(function(d) { return key(d) in map; });
  if (elems.empty()) { return; }

  var fills = /** @type {function(*):string} */ (this.optionValue('fills'));
  var strokes = /** @type {function(*):string} */ (this.optionValue('strokes'));
  var fillOpacity = /** @type {number} */ (this.optionValue('fillOpacity'));
  var strokeThickness = /** @type {number} */ (this.optionValue('strokeThickness'));

  elems
    .style('fill', function(d) { return u.hex2rgba(fills(d['__d__']), fillOpacity); })
    .style('stroke', function(d) { return strokes([d['__d__']]); })
    .style('stroke-width', strokeThickness);
};

vs.ui.plugins.svg.ManhattanPlot.prototype._key = function() {
  var x = /** @type {string} */ (this.optionValue('xVal'));
  return function(d) { return d['__d__'] + '-' + d[x]; };
};
//endregion


//region goog...
goog.provide('vs.ui.plugins.svg.Heatmap');

if (COMPILED) {
  goog.require('vs.ui');
}
//endregion

// Because vs.ui.svg.SvgVis is defined in another library (vis.js), there is no way for the Google Closure compiler
// to know the names of the private variables of that class. Therefore, when overriding this class, we need to declare
// private variables in a private scope (closure), using Symbols (ES6), so we don't accidentally replace existing
// private members.

/**
 * @constructor
 * @extends vs.ui.svg.SvgVis
 */
vs.ui.plugins.svg.Heatmap = (function() {

  var _merged = Symbol('_merged');
  var _key = Symbol('_key');

  /**
   * @constructor
   * @extends vs.ui.svg.SvgVis
   */
  var Heatmap = function() {
    vs.ui.svg.SvgVis.apply(this, arguments);

    /**
     * Merged data source for the rows of the heatmap, from the data sources corresponding to each row respectively
     * @type {null|vs.models.DataSource}
     * @private
     */
    this[_merged] = null;

    var self = this;
    // Options changed
    this.$scope.$watch(
      function(){ return { 'cols': self.options['cols'], 'xVal': self.options['xVal'], 'mergeCols': self.options['mergeCols'] }; },
      function() { self.schedulePreProcessData().then(function() { self.scheduleRedraw(); }); },
      true);
  };

  goog.inherits(Heatmap, vs.ui.svg.SvgVis);


  //region Constants
  /**
   * @type {Object.<string, vs.ui.Setting>}
   */
  Heatmap.Settings = u.extend({}, vs.ui.VisHandler.Settings, {
    'xVal': vs.ui.Setting.PredefinedSettings['xVal'],
    'yVal': vs.ui.Setting.PredefinedSettings['yVal'],
    'mergeCols': vs.ui.Setting.PredefinedSettings['mergeCols'],
    'xBoundaries': vs.ui.Setting.PredefinedSettings['xBoundaries'],
    'yBoundaries': vs.ui.Setting.PredefinedSettings['yBoundaries'],
    'cols': vs.ui.Setting.PredefinedSettings['cols'],
    'fill': vs.ui.Setting.PredefinedSettings['fill'],
    'stroke': vs.ui.Setting.PredefinedSettings['stroke'],
    'strokeThickness': vs.ui.Setting.PredefinedSettings['strokeThickness'],
    'selectFill': vs.ui.Setting.PredefinedSettings['selectFill'],
    'selectStroke': vs.ui.Setting.PredefinedSettings['selectStroke'],
    'selectStrokeThickness': vs.ui.Setting.PredefinedSettings['selectStrokeThickness']
  });
  //endregion

  //region Properties
  Object.defineProperties(Heatmap.prototype, {
    'settings': { get: /** @type {function (this:Heatmap)} */ (function() { return Heatmap.Settings; })}
  });
  //endregion


  //region Methods
  /**
   * @override
   */
  Heatmap.prototype.endDraw = function() {
    var self = this;
    var args = arguments;
    return new Promise(function(resolve, reject) {
      /** @type {vs.models.DataSource} */
      var data = self[_merged];

      // Nothing to draw
      if (!data || !data.d.length) { resolve(); return; }

      var margins = /** @type {vs.models.Margins} */ (self.optionValue('margins'));
      var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));
      var yVal = /** @type {string} */ (self.optionValue('yVal'));
      var width = /** @type {number} */ (self.optionValue('width'));
      var height = /** @type {number} */ (self.optionValue('height'));
      var yBoundaries = /** @type {vs.models.Boundaries} */ (self.optionValue('yBoundaries'));
      var fill = /** @type {string} */ (self.optionValue('fill'));

      var xScale = d3.scale.linear()
        .domain([0, data.d.length])
        .range([0, width - margins.left - margins.right]);

      var yScale = d3.scale.linear()
        .domain([0, cols.length])
        .range([0, height - margins.top - margins.bottom]);

      var colorScale = d3.scale.linear()
        .domain([yBoundaries.min, yBoundaries.max])
        .range(['#ffffff', fill]);

      var svg = d3.select(self.$element[0]).select('svg');

      var viewport = svg.select('.viewport');
      if (viewport.empty()) {
        viewport = svg.append('g')
          .attr('class', 'viewport');
      }
      viewport
        .attr('transform', 'translate(' + margins.left + ', ' + margins.top + ')');

      var items = u.fast.concat(u.fast.map(data.d, function(m) {
        return cols.map(function(col) { return m[col]; });
      }));

      /** @type {Object.<string, vs.models.DataSource>} */
      var dataMap = u.mapToObject(self['data'], function(d) { return {'key': d['id'], 'value': d}});
      var cellWidth = xScale(1), cellHeight = yScale(1);
      var selection = viewport.selectAll('rect').data(items, self[_key]());
      selection.enter()
        .append('rect')
        .attr('class', 'vs-item')
        .on('mouseover', function (d) {
          if (d) { self['brushing'].fire(new vs.ui.BrushingEvent(dataMap[d['__d__']], vs.ui.BrushingEvent.Action['MOUSEOVER'], d)); }
        })
        .on('mouseout', function (d) {
          if (d) { self['brushing'].fire(new vs.ui.BrushingEvent(dataMap[d['__d__']], vs.ui.BrushingEvent.Action['MOUSEOUT'], d)); }
        })
        .on('click', function (d) {
          d3.event.stopPropagation();
        });
      selection
        .attr('x', function(d, i) { return xScale(Math.floor(i / cols.length)); })
        .attr('y', function(d, i) { return yScale(i % cols.length); })
        .attr('width', cellWidth)
        .attr('height', cellHeight)
        .attr('fill', function(d) { return d ? colorScale(d[yVal]) : '#aaaaaa'; });

      selection.exit()
        .remove();

      resolve();
    }).then(function() {
      return vs.ui.svg.SvgVis.prototype.endDraw.apply(self, args);
    });
  };

  /**
   * @param {vs.ui.BrushingEvent} e
   * @param {Array.<Object>} objects
   */
  Heatmap.prototype.highlightItem = function(e, objects) {
    var viewport = d3.select(this.$element[0]).select('svg').select('.viewport');
    if (viewport.empty()) { return; }

    var key = this[_key]();
    var map = u.mapToObject(objects, function(d) { return {'key': key(d), 'value': true}; });
    var elems = viewport.selectAll('.vs-item').filter(function(d) { return key(d) in map; });
    if (elems.empty()) { return; }

    var selectFill = /** @type {string} */ (this.optionValue('selectFill'));
    var selectStroke = /** @type {string} */ (this.optionValue('selectStroke'));
    var selectStrokeThickness = /** @type {number} */ (this.optionValue('selectStrokeThickness'));
    var yBoundaries = /** @type {vs.models.Boundaries} */ (this.optionValue('yBoundaries'));
    var yVal = /** @type {string} */ (this.optionValue('yVal'));

    var colorScale = d3.scale.linear()
      .domain([yBoundaries.min, yBoundaries.max])
      .range(['#ffffff', selectFill]);

    elems.attr('fill', function(d) { return colorScale(d[yVal]); });

    // Bring to front:
    // $(elems[0]).appendTo($(viewport[0]));
  };

  /**
   * @param {vs.ui.BrushingEvent} e
   * @param {Array.<Object>} objects
   */
  Heatmap.prototype.unhighlightItem = function(e, objects) {
    var viewport = d3.select(this.$element[0]).select('svg').select('.viewport');
    if (viewport.empty()) { return; }

    var key = this[_key]();
    var map = u.mapToObject(objects, function(d) { return {'key': key(d), 'value': true}; });
    var elems = viewport.selectAll('.vs-item').filter(function(d) { return key(d) in map; });
    if (elems.empty()) { return; }

    var fill = /** @type {string} */ (this.optionValue('fill'));
    var yBoundaries = /** @type {vs.models.Boundaries} */ (this.optionValue('yBoundaries'));
    var yVal = /** @type {string} */ (this.optionValue('yVal'));

    var colorScale = d3.scale.linear()
      .domain([yBoundaries.min, yBoundaries.max])
      .range(['#ffffff', fill]);

    elems.attr('fill', function(d) { return colorScale(d[yVal]); });
  };

  Heatmap.prototype.preProcessData = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      Promise.all(self.data.map(function(d) { return d.ready; })).then(function() {
        var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));
        var xVal = /** @type {string} */ (self.optionValue('xVal'));

        var data = cols.map(function(col) { return self.data[u.array.indexOf(self.data, function(d) {return d.id == col;})]; });
        if (data.length < 1) {
          self[_merged] = null;
          resolve();
        }
        if (data.length == 1) {
          self[_merged] = data[0];
          resolve();
        }

        var mergeCols = /** @type {function(string, Array.<vs.models.DataSource>):vs.models.DataSource} */ (self.optionValue('mergeCols'));

        self[_merged] = mergeCols(xVal, data);
        resolve();
      });
    });
  };
  //endregion

  /**
   * @private
   */
  Heatmap.prototype[_key] = function() {
    var key = /** @type {string} */ (this.optionValue('xVal'));
    return function(d, i) {
      return d == undefined ? i : (d['__d__'] + '-' + d[key]);
    }
  };

  return Heatmap;
})();


goog.provide('vs.ui.plugins');

goog.require('vs.ui.plugins.canvas.ManhattanPlot');
goog.require('vs.ui.plugins.canvas.ScatterPlot');
goog.require('vs.ui.plugins.svg.ManhattanPlot');
goog.require('vs.ui.plugins.svg.ScatterPlot');
goog.require('vs.ui.plugins.svg.Heatmap');
