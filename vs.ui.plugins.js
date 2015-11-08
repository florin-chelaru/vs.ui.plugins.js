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

goog.provide('vs.ui');

// Extend the namespaces defined here with the ones in the base vis.js package
(function() {
  u.extend(vs, this['vs']);
  u.extend(vs.ui, this['vs']['ui']);
}).call(this);



goog.provide('vs.ui.plugins.svg.ManhattanPlot');

goog.require('vs.ui');

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
  'rows': vs.ui.Setting.PredefinedSettings['rows'],
  'vals': vs.ui.Setting.PredefinedSettings['vals'],
  'xBoundaries': new vs.ui.Setting({key:'xBoundaries', type:'vs.models.Boundaries', defaultValue:vs.ui.Setting.rowBoundaries, label:'x boundaries', template:'_boundaries.html'}),
  'yBoundaries': vs.ui.Setting.PredefinedSettings['yBoundaries'],
  'xScale': vs.ui.Setting.PredefinedSettings['xScale'],
  'yScale': vs.ui.Setting.PredefinedSettings['yScale'],
  'cols': vs.ui.Setting.PredefinedSettings['cols']
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
    vs.ui.svg.SvgVis.prototype.draw.apply(self, args)
      .then(function() {
        /** @type {vs.models.DataSource} */
        var data = self.data;

        // Nothing to draw
        if (!data.nrows) { return; }

        var margins = self.optionValue('margins');
        var xScale = self.optionValue('xScale');
        var yScale = self.optionValue('yScale');
        var cols = self.optionValue('cols');
        var row = self.optionValue('rows')[0];
        var valsLabel = self.optionValue('vals');

        var svg = d3.select(self.$element[0]).select('svg');

        var viewport = svg.select('.viewport');
        if (viewport.empty()) {
          viewport = svg.append('g')
            .attr('class', 'viewport');
        }
        viewport
          .attr('transform', 'translate(' + margins.left + ', ' + margins.top + ')');

        var items = u.array.range(data.nrows).map(function(i) {
          return new vs.models.DataRow(data, i);
        });
        var selection = viewport.selectAll('circle').data(items);

        selection.enter()
          .append('circle');

        selection
          .attr('r', 3)
          .attr('cx', function(d) { return xScale(parseFloat(d.info(row))); })
          .attr('cy', function(d) { return yScale(d.val(cols[0], valsLabel)); })
          .attr('fill', '#1e60d4');

        selection.exit()
          .remove();

        resolve();
      }, reject);
  });
};


goog.provide('vs.ui.plugins.canvas.ScatterPlot');

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
    vs.ui.canvas.CanvasVis.prototype.endDraw.apply(self, args)
      .then(function() {
        var data = self.data;
        if (!self.data.isReady) { return; }

        // Nothing to draw
        if (!data.nrows) { return; }

        var margins = self.optionValue('margins');
        var xScale = self.optionValue('xScale');
        var yScale = self.optionValue('yScale');
        var cols = self.optionValue('cols');
        var xCol = cols[0];
        var yCol = cols[1];
        var valsLabel = self.optionValue('vals');

        var context = self.pendingCanvas[0].getContext('2d');

        var transform =
          vs.models.Transformer
            .scale(xScale, yScale)
            .translate({x: margins.left, y: margins.top});
        var items = u.array.range(data.nrows).map(function(i) {
          return new vs.models.DataRow(data, i);
        });

        items.forEach(function(d) {
          var point = transform.calc({x: d.val(xCol, valsLabel), y: d.val(yCol, valsLabel)});
          vs.ui.canvas.CanvasVis.circle(context, point.x, point.y, 3, '#ff6520');
        });

        resolve();
      }, reject);
  });
};


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
        var xScale = self.optionValue('xScale');
        var yScale = self.optionValue('yScale');
        var cols = self.optionValue('cols');
        var row = self.optionValue('rows')[0];
        var valsLabel = self.optionValue('vals');

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



goog.provide('vs.ui.plugins.svg.ScatterPlot');

goog.require('vs.ui');

/*
goog.require('vs.ui.svg.SvgVis');
goog.require('vs.models.DataRow');
*/

/**
 * @constructor
 * @extends vs.ui.svg.SvgVis
 */
vs.ui.plugins.svg.ScatterPlot = function() {
  vs.ui.svg.SvgVis.apply(this, arguments);
};

goog.inherits(vs.ui.plugins.svg.ScatterPlot, vs.ui.svg.SvgVis);

/**
 * @type {Object.<string, vs.ui.Setting>}
 */
vs.ui.plugins.svg.ScatterPlot.Settings = u.extend({}, vs.ui.VisHandler.Settings, {
  'vals': vs.ui.Setting.PredefinedSettings['vals'],
  'xBoundaries': vs.ui.Setting.PredefinedSettings['xBoundaries'],
  'yBoundaries': vs.ui.Setting.PredefinedSettings['yBoundaries'],
  'xScale': vs.ui.Setting.PredefinedSettings['xScale'],
  'yScale': vs.ui.Setting.PredefinedSettings['yScale'],
  'cols': vs.ui.Setting.PredefinedSettings['cols']
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
    vs.ui.svg.SvgVis.prototype.draw.apply(self, args)
      .then(function() {
        /** @type {vs.models.DataSource} */
        var data = self.data;

        // Nothing to draw
        if (!data.nrows) { return; }

        var margins = self.optionValue('margins');
        var xScale = self.optionValue('xScale');
        var yScale = self.optionValue('yScale');
        var cols = self.optionValue('cols');
        var xCol = cols[0];
        var yCol = cols[1];
        var valsLabel = self.optionValue('vals');

        var svg = d3.select(self.$element[0]).select('svg');

        var viewport = svg.select('.viewport');
        if (viewport.empty()) {
          viewport = svg.append('g')
            .attr('class', 'viewport');
        }
        viewport
          .attr('transform', 'translate(' + margins.left + ', ' + margins.top + ')');

        var items = u.array.range(data.nrows).map(function(i) {
          return new vs.models.DataRow(data, i);
        });
        var selection = viewport.selectAll('circle').data(items);

        selection.enter()
          .append('circle');

        selection
          .attr('r', 3)
          .attr('cx', function(d) { return xScale(d.val(xCol, valsLabel)); })
          .attr('cy', function(d) { return yScale(d.val(yCol, valsLabel)); })
          .attr('fill', '#ff6520');

        selection.exit()
          .remove();

        resolve();
      }, reject);
  });
};


goog.provide('vs.ui.plugins');

goog.require('vs.ui.plugins.canvas.ManhattanPlot');
goog.require('vs.ui.plugins.canvas.ScatterPlot');
goog.require('vs.ui.plugins.svg.ManhattanPlot');
goog.require('vs.ui.plugins.svg.ScatterPlot');
