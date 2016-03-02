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



goog.provide('vs.ui.plugins.svg.ManhattanPlot');

if (COMPILED) {
  goog.require('vs.ui');
}
/*
goog.require('vs.models.DataRow');
goog.require('vs.ui.svg.SvgVis');
*/

/**
 * @constructor
 * @extends vs.ui.svg.SvgVis
 */
vs.ui.plugins.svg.ManhattanPlot = function() {
  vs.ui.svg.SvgVis.apply(this, arguments);
};

goog.inherits(vs.ui.plugins.svg.ManhattanPlot, vs.ui.svg.SvgVis);

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

Object.defineProperties(vs.ui.plugins.svg.ManhattanPlot.prototype, {
  'settings': { get: /** @type {function (this:vs.ui.plugins.svg.ManhattanPlot)} */ (function() { return vs.ui.plugins.svg.ManhattanPlot.Settings; })}
});

/**
 * @override
 */
vs.ui.plugins.svg.ManhattanPlot.prototype.endDraw = function() {
  var self = this;
  var args = arguments;
  return new Promise(function(resolve, reject) {
    /** @type {Array.<vs.models.DataSource>} */
    var data = self.data;

    // Nothing to draw
    if (!data.length) { resolve(); return; }

    var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));
    data = data.filter(function(d) { return cols.indexOf(d.id) >= 0; });

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

    var items = data.map(function(d) { return d.d; }).reduce(function(arr1, arr2) { return arr1.concat(arr2); });
    var selection = viewport.selectAll('circle').data(items, JSON.stringify);

    selection.enter()
      .append('circle')
      .attr('class', 'vs-item');

    selection
      .attr('r', itemRadius)
      .attr('cx', function(d) { return xScale(parseFloat(d[x])); })
      .attr('cy', function(d) { return yScale(parseFloat(d[y])); })
      .attr('fill', function(d) { return fills(d['__d__']); })
      .attr('fill-opacity', '.3')
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
 * @param {HTMLElement} viewport Can be canvas, svg, etc.
 * @param {Object} d
 */
vs.ui.plugins.svg.ManhattanPlot.prototype.highlightItem = function(viewport, d) {
  /*var v = d3.select(viewport);
  var selectFill = /!** @type {string} *!/ (this.optionValue('selectFill'));
  var selectStroke = /!** @type {string} *!/ (this.optionValue('selectStroke'));
  var selectStrokeThickness = /!** @type {number} *!/ (this.optionValue('selectStrokeThickness'));
  var items = v.selectAll('.vs-item').data([d], vs.models.DataSource.key);
  items
    .style('stroke', selectStroke)
    .style('stroke-width', selectStrokeThickness)
    .style('fill', selectFill);
  $(items[0]).appendTo($(viewport));*/
};

/**
 * @param {HTMLElement} viewport Can be canvas, svg, etc.
 * @param {Object} d
 */
vs.ui.plugins.svg.ManhattanPlot.prototype.unhighlightItem = function(viewport, d) {
  /*var v = d3.select(viewport);
  var fill = /!** @type {string} *!/ (this.optionValue('fill'));
  var stroke = /!** @type {string} *!/ (this.optionValue('stroke'));
  var strokeThickness = /!** @type {number} *!/ (this.optionValue('strokeThickness'));
  v.selectAll('.vs-item').data([d], vs.models.DataSource.key)
    .style('stroke', stroke)
    .style('stroke-width', strokeThickness)
    .style('fill', fill);*/
};


goog.provide('vs.ui.plugins.svg.ScatterPlot');

if (COMPILED) {
  goog.require('vs.ui');
}

/**
 * @constructor
 * @extends vs.ui.svg.SvgVis
 */
vs.ui.plugins.svg.ScatterPlot = function() {
  vs.ui.svg.SvgVis.apply(this, arguments);

  /**
   * Merged data source for the x and y axes of the scatter plot, from the two data sources corresponding to x and y respectively
   * @type {null|vs.models.DataSource}
   * @private
   */
  this._merged = null;

  var self = this;
  this.data.forEach(function(d) {
    d.changed.addListener(function (data) {
      self.scheduleReMerge().then(function() { self.scheduleRedraw(); });
    });
  });

  // Data ready for the first time
  Promise.all(this.data.map(function(d) { return d.ready; })).then(function() { self.scheduleReMerge().then(function() { self.scheduleRedraw(); }); });

  // Options changed
  this.$scope.$watch(
    function(){ return self.options; },
    function() { self.scheduleReMerge().then(function() { self.scheduleRedraw(); }); },
    true);

  /**
   * @type {boolean}
   * @private
   */
  this._reMergeScheduled = false;

  /**
   * @type {Promise}
   * @private
   */
  this._lastMerge = Promise.resolve();

  /**
   * @type {Promise}
   * @private
   */
  this._reMergePromise = Promise.resolve();

  /**
   * @type {boolean}
   * @private
   */
  this._lastMergeFired = true;
};

goog.inherits(vs.ui.plugins.svg.ScatterPlot, vs.ui.svg.SvgVis);

/**
 * @returns {Promise}
 */
vs.ui.plugins.svg.ScatterPlot.prototype.scheduleReMerge = function() {
  // This will trigger an asynchronous angular digest
  if (!this._reMergeScheduled) {
    this._reMergeScheduled = true;
    var lastMerge = this._lastMerge || Promise.resolve();
    var self = this;

    this._reMergePromise = new Promise(function(resolve, reject) {
      lastMerge.then(function() { self.$timeout.call(null, function() {
        self._reMergeScheduled = false;
        self.merge().then(resolve, reject);
      }, 0); });
    });
  }
  return this._reMergePromise;
};

vs.ui.plugins.svg.ScatterPlot.prototype.merge = function() {
  var self = this;
  var lastMerge = this._lastMerge;

  u.log.info('trying merge...');
  if (!this._lastMergeFired) { u.log.info('merge already in progress; returning.'); return lastMerge; }

  this._lastMergeFired = false;
  var promise = new Promise(function(resolve, reject) {
    Promise.all(self.data.map(function(d) { return d.ready; })).then(function() {
      var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));

      var data = cols.map(function(col) { return self.data[u.array.indexOf(self.data, function(d) {return d.id == col;})]; });
      if (data.length < 2) { reject('Scatter plot needs two columns of data, but only received ' + cols.length); return; }

      var mergeCols = /** @type {function(vs.models.DataSource, vs.models.DataSource):vs.models.DataSource} */ (self.optionValue('mergeCols'));
      self._merged = mergeCols(data[0], data[1]);
      resolve();
    });
  });
  this._lastMerge = promise;
  return promise;
};

/**
 * @param {Object.<string, *>} options
 * @param $attrs Angular attrs
 * @param {Array.<vs.models.DataSource>} [data]
 * @param {Object.<string, vs.ui.Setting>} [settings]
 * @returns {*}
 */
vs.ui.plugins.svg.ScatterPlot.mergeColsDefault = function (options, $attrs, data, settings) {
  if (!settings || !('xVal' in settings)) { throw new vs.ui.UiException('Missing dependency for "xVal" in the "mergeCols" defaultValue function'); }

  var xVal = /** @type {string} */ (settings['xVal'].getValue(options, $attrs, data, settings));

  return function(d1, d2) { return vs.ui.plugins.svg.ScatterPlot.mergeCols(d1, d2, xVal); }
};

/**
 * @param {vs.models.DataSource} d1
 * @param {vs.models.DataSource} d2
 * @param {string} xVal
 * @returns {vs.models.DataSource}
 */
vs.ui.plugins.svg.ScatterPlot.mergeCols = function(d1, d2, xVal) {
  var map = {};
  var ret = {
    'id': d1.id + d2.id,
    'label': d1.label + ' vs ' + d2.label,
    'rowMetadata': u.array.unique(d1.rowMetadata.concat(d2.rowMetadata)),
    'query': [],
    'metadata': {}
  };
  d1.d.forEach(function(item) {
    map[item[xVal]] = item;
  });

  var d = [];
  d2.d.forEach(function(item) {
    if (item[xVal] in map) {
      var item0 = map[item[xVal]];
      var merged = {};
      merged[xVal] = item[xVal];

      merged[item0['__d__']] = item0;
      merged[item['__d__']] = item;
      merged['__d__'] = ret['id'];
      d.push(merged);
    }
  });
  ret['d'] = d;
  return u.reflection.wrap(ret, vs.models.DataSource);
};

/**
 * @param {Object.<string, *>} options
 * @param $attrs Angular attrs
 * @param {Array.<vs.models.DataSource>} [data]
 * @param {Object.<string, vs.ui.Setting>} [settings]
 * @returns {*}
 */
vs.ui.plugins.svg.ScatterPlot.xScale = function (options, $attrs, data, settings) {
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

/**
 * @type {Object.<string, vs.ui.Setting>}
 */
vs.ui.plugins.svg.ScatterPlot.Settings = u.extend({}, vs.ui.VisHandler.Settings, {
  'xVal': vs.ui.Setting.PredefinedSettings['xVal'],
  'yVal': vs.ui.Setting.PredefinedSettings['yVal'],
  'xBoundaries': vs.ui.Setting.PredefinedSettings['xBoundaries'],
  'yBoundaries': vs.ui.Setting.PredefinedSettings['yBoundaries'],
  'xScale': new vs.ui.Setting({'key':'xScale', 'type':vs.ui.Setting.Type['FUNCTION'], 'defaultValue':vs.ui.plugins.svg.ScatterPlot.xScale, 'hidden': true}),
  'yScale': vs.ui.Setting.PredefinedSettings['yScale'],
  'cols': vs.ui.Setting.PredefinedSettings['cols'],
  'mergeCols': new vs.ui.Setting({'key': 'mergeCols', 'type': vs.ui.Setting.Type.FUNCTION, 'defaultValue': vs.ui.plugins.svg.ScatterPlot.mergeColsDefault, 'hidden': true}),
  'vals': new vs.ui.Setting({'key':'vals', 'type':vs.ui.Setting.Type.DATA_ROW_LABEL, 'defaultValue':vs.ui.Setting.firstRowsLabel, 'label':'values', 'template':'_categorical.html'}),
  'itemRatio': new vs.ui.Setting({'key':'itemRatio', 'type':vs.ui.Setting.Type.NUMBER, 'defaultValue': 0.015, 'label':'item ratio', 'template':'_number.html'}),
  'fill': vs.ui.Setting.PredefinedSettings['fill'],
  'stroke': vs.ui.Setting.PredefinedSettings['stroke'],
  'strokeThickness': vs.ui.Setting.PredefinedSettings['strokeThickness'],
  'selectFill': vs.ui.Setting.PredefinedSettings['selectFill'],
  'selectStroke': vs.ui.Setting.PredefinedSettings['selectStroke'],
  'selectStrokeThickness': vs.ui.Setting.PredefinedSettings['selectStrokeThickness']
});

Object.defineProperties(vs.ui.plugins.svg.ScatterPlot.prototype, {
  'settings': { get: /** @type {function (this:vs.ui.plugins.svg.ScatterPlot)} */ (function() { return vs.ui.plugins.svg.ScatterPlot.Settings; })}
});

/**
 * @override
 */
vs.ui.plugins.svg.ScatterPlot.prototype.endDraw = function() {
  var self = this;
  var args = arguments;
  return new Promise(function(resolve, reject) {
    /** @type {vs.models.DataSource} */
    var data = self._merged;

    // Nothing to draw
    if (!data || !data.d.length) { resolve(); return; }

    var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));

    var margins = /** @type {vs.models.Margins} */ (self.optionValue('margins'));
    var xScale = /** @type {function(number): number} */ (self.optionValue('xScale'));
    var yScale = /** @type {function(number): number} */ (self.optionValue('yScale'));

    var xVal = /** @type {string} */ (self.optionValue('xVal'));
    var yVal = /** @type {string} */ (self.optionValue('yVal'));

    var itemRatio = /** @type {number} */ (self.optionValue('itemRatio'));
    var width = /** @type {number} */ (self.optionValue('width'));
    var height = /** @type {number} */ (self.optionValue('height'));
    var fill = /** @type {string} */ (self.optionValue('fill'));
    var stroke = /** @type {string} */ (self.optionValue('stroke'));
    var strokeThickness = /** @type {number} */ (self.optionValue('strokeThickness'));

    var itemRadius = Math.min(Math.abs(width), Math.abs(height)) * itemRatio;

    var xCol = cols[0];
    var yCol = cols[1];

    var svg = d3.select(self.$element[0]).select('svg');

    var viewport = svg.select('.viewport');
    if (viewport.empty()) {
      viewport = svg.append('g')
        .attr('class', 'viewport');
    }
    viewport
      .attr('transform', 'translate(' + margins.left + ', ' + margins.top + ')');

    var items = data.d;
    var selection = viewport.selectAll('circle').data(items, JSON.stringify);

    selection.enter()
      .append('circle')
      .attr('class', 'vs-item');

    selection
      .attr('r', itemRadius)
      .attr('cx', function(d) { return xScale(d[xCol][yVal]); })
      .attr('cy', function(d) { return yScale(d[yCol][yVal]); })
      .attr('fill', fill)
      .style('stroke', stroke)
      .style('stroke-width', strokeThickness);

    selection.exit()
      .remove();

    resolve();
  }).then(function() {
    return vs.ui.svg.SvgVis.prototype.endDraw.apply(self, args);
  });
};

/**
 * @param {HTMLElement} viewport Can be canvas, svg, etc.
 * @param {Object} d
 */
vs.ui.plugins.svg.ScatterPlot.prototype.highlightItem = function(viewport, d) {
  /*var v = d3.select(viewport);
  var selectFill = /!** @type {string} *!/ (this.optionValue('selectFill'));
  var selectStroke = /!** @type {string} *!/ (this.optionValue('selectStroke'));
  var selectStrokeThickness = /!** @type {number} *!/ (this.optionValue('selectStrokeThickness'));
  var items = v.selectAll('.vs-item').data([d], vs.models.DataSource.key);
  items
    .style('stroke', selectStroke)
    .style('stroke-width', selectStrokeThickness)
    .style('fill', selectFill);
  $(items[0]).appendTo($(viewport));*/
};

/**
 * @param {HTMLElement} viewport Can be canvas, svg, etc.
 * @param {Object} d
 */
vs.ui.plugins.svg.ScatterPlot.prototype.unhighlightItem = function(viewport, d) {
  /*var v = d3.select(viewport);
  var fill = /!** @type {string} *!/ (this.optionValue('fill'));
  var stroke = /!** @type {string} *!/ (this.optionValue('stroke'));
  var strokeThickness = /!** @type {number} *!/ (this.optionValue('strokeThickness'));
  v.selectAll('.vs-item').data([d], vs.models.DataSource.key)
    .style('stroke', stroke)
    .style('stroke-width', strokeThickness)
    .style('fill', fill);*/
};


goog.provide('vs.ui.plugins');

//goog.require('vs.ui.plugins.canvas.ManhattanPlot');
//goog.require('vs.ui.plugins.canvas.ScatterPlot');
goog.require('vs.ui.plugins.svg.ManhattanPlot');
goog.require('vs.ui.plugins.svg.ScatterPlot');
//goog.require('vs.ui.plugins.svg.Heatmap');
