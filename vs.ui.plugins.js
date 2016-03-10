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

/*
* John La
* LinePlot on Canvas
*/

goog.provide('vs.ui.plugins.canvas.Line');

if (COMPILED) {
    goog.require('vs.ui');
}

/**
 * @constructor
 * @extends vs.ui.canvas.CanvasVis
 */
vs.ui.plugins.canvas.Line = (function() {
    var _quadTree = Symbol('_quadTree');
    /**
     * @constructor
     * @extends vs.ui.canvas.CanvasVis
     */
    var Line = function() {
        vs.ui.canvas.CanvasVis.apply(this, arguments);
        /**
         * @type {u.QuadTree}
         * @private
         */
        this[_quadTree] = null;
    };

    goog.inherits(Line, vs.ui.canvas.CanvasVis);

    /**
     * @type {Object.<string, vs.ui.Setting>}
     */
    Line.Settings = u.extend({}, vs.ui.canvas.CanvasVis.Settings, {
        'rows': vs.ui.Setting.PredefinedSettings['rows'],
        'vals': vs.ui.Setting.PredefinedSettings['vals'],
        'xBoundaries': new vs.ui.Setting({
            key: 'xBoundaries',
            type: 'vs.models.Boundaries',
            defaultValue: vs.ui.Setting.rowBoundaries,
            label: 'x boundaries',
            template: '_boundaries.html'
        }),
        'yBoundaries': vs.ui.Setting.PredefinedSettings['yBoundaries'],
        'xScale': vs.ui.Setting.PredefinedSettings['xScale'],
        'yScale': vs.ui.Setting.PredefinedSettings['yScale'],
        'cols': vs.ui.Setting.PredefinedSettings['cols'],
        'itemRatio': new vs.ui.Setting({
            'key': 'itemRatio',
            'type': vs.ui.Setting.Type.NUMBER,
            'defaultValue': 0.015,
            'label': 'item ratio',
            'template': '_number.html'
        }),
        'fill': vs.ui.Setting.PredefinedSettings['fill'],
        'stroke': vs.ui.Setting.PredefinedSettings['stroke'],
        'strokeThickness': vs.ui.Setting.PredefinedSettings['strokeThickness'],
        'selectFill': vs.ui.Setting.PredefinedSettings['selectFill'],
        'selectStroke': vs.ui.Setting.PredefinedSettings['selectStroke'],
        'selectStrokeThickness': vs.ui.Setting.PredefinedSettings['selectStrokeThickness']
    });

    Object.defineProperties(Line.prototype, {
        'settings': {
            get: /** @type {function (this:Line)} */ (function () {
                return Line.Settings;
            })
        }
    });

    Line.prototype.beginDraw = function() {
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

    Line.prototype.endDraw = function () {
        var self = this;
        var args = arguments;
        return new Promise(function(resolve, reject) {
            /** @type {vs.models.DataSource} */
            var data = self.data;
            var colorOption = ["blue", "red"];

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

        });
    }
});



goog.provide('vs.ui.plugins.canvas.ManhattanPlot');

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

  /**
   * @type {Object.<string, vs.ui.Setting>}
   */
  ManhattanPlot.Settings = u.extend({}, vs.ui.canvas.CanvasVis.Settings, {
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

  Object.defineProperties(ManhattanPlot.prototype, {
    'settings': { get: /** @type {function (this:ManhattanPlot)} */ (function() { return ManhattanPlot.Settings; })}
  });

  ManhattanPlot.prototype.beginDraw = function() {
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

  ManhattanPlot.prototype.endDraw = function() {
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
  ManhattanPlot.prototype.getItemsAt = function(x, y) {
    if (!this[_quadTree]) { return []; }
    return this[_quadTree].collisions(x, y).map(function(v) { return v.value; });
  };

  /**
   * @param {HTMLElement} canvas
   * @param {vs.models.DataRow} d
   */
  ManhattanPlot.prototype.highlightItem = function(canvas, d) {
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

  return ManhattanPlot;
})();
goog.provide('vs.ui.plugins.svg.Demo');

if(COMPILED){
    goog.require('vs.ui');
}

/**
 * @constructor
 * @extends vs.ui.svg.SvgVis
 */

vs.ui.plugins.svg.Demo = function(){
    vs.ui.svg.SvgVis.apply(this, arguments);
    /**
   * @type {number}
   */
  this['publicField'] = 20;

  /**
   * @type {number}
   * @private
   */
  this._privateField = 10;
};

goog.inherits(vs.ui.plugins.svg.Demo, vs.ui.svg.SvgVis);

/**
 *@override
 *@returns{Promise}
 */
vs.ui.plugins.svg.Demo.prototype.endDraw = function() {
    var self = this;
    var args = arguments;
    return new Promise(function(resolve, reject) {
        /**@type{vs.models.DataSource}*/
        var data = self.data;

        // Nothing to draw
        if (!data.nrows || !data.ncols){ resolve(); return; }

        var svg = d3.select(self.$element[0]).select('svg');

        var viewport = svg.select('.viewport');
        if (viewport.empty()) {
            viewport = svg.append('g')
                .attr('class', 'viewport');
        }

        viewport.append('circle')
            .attr('cx',50)
            .attr('cy',50)
            .attr('r',20)
            .attr('fill','#fe5621')
            .style('stroke','#000000')
            .style('stroke-width',5);

        resolve();
    }).then(function(){
        return vs.ui.svg.SvgVis.prototype.endDraw.apply(self, args);
    });
}; 


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
    /** @type {vs.models.DataSource} */
    var data = self.data;

    // Nothing to draw
    if (!data.nrows) { resolve(); return; }

    var margins = /** @type {vs.models.Margins} */ (self.optionValue('margins'));
    var xScale = /** @type {function(number): number} */ (self.optionValue('xScale'));
    var yScale = /** @type {function(number): number} */ (self.optionValue('yScale'));
    var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));
    var row = (/** @type {Array.<string>} */ (self.optionValue('rows')))[0];
    var valsLabel = /** @type {string} */ (self.optionValue('vals'));
    var fill = /** @type {string} */ (self.optionValue('fill'));
    var stroke = /** @type {string} */ (self.optionValue('stroke'));
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

    var items = data.asDataRowArray();
    var selection = viewport.selectAll('circle').data(items, vs.models.DataSource.key);

    selection.enter()
      .append('circle')
      .attr('class', 'vs-item');

    selection
      .attr('r', itemRadius)
      .attr('cx', function(d) { return xScale(parseFloat(d.info(row))); })
      .attr('cy', function(d) { return yScale(d.val(cols[0], valsLabel)); })
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
 * @param {vs.models.DataRow} d
 */
vs.ui.plugins.svg.ManhattanPlot.prototype.highlightItem = function(viewport, d) {
  var v = d3.select(viewport);
  var selectFill = /** @type {string} */ (this.optionValue('selectFill'));
  var selectStroke = /** @type {string} */ (this.optionValue('selectStroke'));
  var selectStrokeThickness = /** @type {number} */ (this.optionValue('selectStrokeThickness'));
  var items = v.selectAll('.vs-item').data([d], vs.models.DataSource.key);
  items
    .style('stroke', selectStroke)
    .style('stroke-width', selectStrokeThickness)
    .style('fill', selectFill);
  $(items[0]).appendTo($(viewport));
};

/**
 * @param {HTMLElement} viewport Can be canvas, svg, etc.
 * @param {vs.models.DataRow} d
 */
vs.ui.plugins.svg.ManhattanPlot.prototype.unhighlightItem = function(viewport, d) {
  var v = d3.select(viewport);
  var fill = /** @type {string} */ (this.optionValue('fill'));
  var stroke = /** @type {string} */ (this.optionValue('stroke'));
  var strokeThickness = /** @type {number} */ (this.optionValue('strokeThickness'));
  v.selectAll('.vs-item').data([d], vs.models.DataSource.key)
    .style('stroke', stroke)
    .style('stroke-width', strokeThickness)
    .style('fill', fill);
};

goog.provide('vs.ui.plugins.svg.Line');

if(COMPILED){
    goog.require('vs.ui');
}

/**
 *@constructor
 *@extends vs.ui.svg.SvgVis
 */
vs.ui.plugins.svg.Line = function(){
    vs.ui.svg.SvgVis.apply(this, arguments);
};

goog.inherits(vs.ui.plugins.svg.Line, vs.ui.svg.SvgVis);

/**
 * @type {Object.<string, vs.ui.Setting>}
 */
vs.ui.plugins.svg.Line.Settings = u.extend({}, vs.ui.VisHandler.Settings, {
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

Object.defineProperties(vs.ui.plugins.svg.Line.prototype, {
    'settings': { get: /** @type {function (this:vs.ui.plugins.svg.Line)} */ (function() { return vs.ui.plugins.svg.Line.Settings; })}
});
/**
 * @override
 * @returns(Promise)
 */
vs.ui.plugins.svg.Line.prototype.endDraw = function() {
    var self = this;
    var args = arguments;

    return new Promise(function(resolve, reject) {
        var colorOption = ['blue', 'red'];
        var categories = ["tumor", "healthy"];

        var data = self.data;

        var margins = /** @type {vs.models.Margins} */ (self.optionValue('margins'));
        var xScale = /** @type {function(number): number} */ (self.optionValue('xScale'));
        var yScale = /** @type {function(number): number} */ (self.optionValue('yScale'));
        var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));
        var row = (/** @type {Array.<string>} */ (self.optionValue('rows')))[0];
        var valsLabel = /** @type {string} */ (self.optionValue('vals'));
        var fill = /** @type {string} */ (self.optionValue('fill'));
        var stroke = /** @type {string} */ (self.optionValue('stroke'));
        var strokeThickness = /** @type {number} */ (self.optionValue('strokeThickness'));
        var itemRatio = /** @type {number} */ (self.optionValue('itemRatio'));
        var width = /** @type {number} */ (self.optionValue('width'));
        var height = /** @type {number} */ (self.optionValue('height'));
        var itemRadius = Math.min(Math.abs(width), Math.abs(height)) * itemRatio;
        var svg = d3.select(self.$element[0]).select('svg');

        var vis  = svg.select('.viewport');
        if (vis.empty()) {
            vis = svg.append('g')
                .attr('class', 'viewport');
        }

        vis.attr('transform', 'translate(' + margins.left + ', ' + margins.top + ')');

        var chooseLine = function(i){
            return d3.svg.line()
                .x(function (d) {
                    return xScale(parseFloat(d.info(row)));
                })
                .y(function (d) {
                    return yScale(d.val(cols[i], valsLabel));
                })
                .interpolate('linear');
        }

        var items = data.asDataRowArray();
        var selection = vis.selectAll('path').data([0]);
        var selection2 = vis.selectAll('path2').data([0]);
        var xBox1 = vis.selectAll('g1').data([0]);
        var focus1 = vis.selectAll('G1').data([0]);
        var focus2 = vis.selectAll('G2').data([0]);

        focus1.enter()
            .append('g')
            .attr("class", "focus")
            .style("display", "none");
        focus1.append("circle")
            .attr("r", 4.5)
            .attr("fill", "blue")
            .attr("stroke: #9bffa9");
        focus1.append("text")
            .attr("x", 9)
            .attr("background", "black")
            .attr("dy", ".35em");

        focus2.enter()
            .append('g')
            .attr("class", "focus")
            .style("display", "none");
        focus2.append("circle")
            .attr("r", 4.5)
            .attr("fill", "red")
            .attr("stroke: #9bffa9");
        focus2.append("rect")
            .attr()
        focus2.append("text")
            .attr("x", 9)
            .attr("background", "black")
            .attr("dy", ".35em");

        selection.enter()
            .append('path')
            .attr('stroke', colorOption[0])
            .attr("stroke-width", strokeThickness)
            .attr("id", 'tag' + categories[0])
            .attr('fill', 'none');

        selection.attr('d', chooseLine(0)(items));

        selection2.enter()
            .append('path')
            .attr('stroke', colorOption[1])
            .attr("stroke-width", strokeThickness)
            .attr("id", 'tag' + categories[1])
            .attr('fill', 'none');

        selection2.attr('d', chooseLine(1)(items));

        xBox1.enter()
            .append('rect')
            .data(items);


        xBox1.attr("fill", "none")
            .attr("pointer-events", "all")
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", function () {
                focus1.style("display",null);
                focus2.style("display",null);
            })
            .on("mouseout", function () {
                focus1.style("display","none");
                focus2.style("display","none");
            })
            .on("mousemove", function (d, i) {

                var x0 = xScale.invert(d3.mouse(this)[0]);
                var y1 = items.map(function(item) { return item.val(cols[0], valsLabel); });
                var y2 = items.map(function(item) { return item.val(cols[1], valsLabel); });

                if(x0 > 550000){
                    focus1.select("text").attr("x", -100);
                    focus2.select("text").attr("x", -100);
                } else {
                    focus1.select("text").attr("x", 9);
                    focus2.select("text").attr("x", 9);
                }
                var xArray = items.map(function(item) { return parseFloat(item.info(row)); });
                var index1 = d3.bisectLeft(xArray,x0),
                    d0 = xArray[index1 - 1],
                    d1 = xArray[index1],
                    d2 = x0 - d0 > d1 - x0 ? d1 : d0;

                console.log(index1);

                    if(d2 == d0){
                        var showIndex = index1 - 1;
                    } else {
                        var showIndex = index1;
                    }

                focus1.attr("transform", "translate(" + xScale(d2) + "," + yScale(y1[showIndex]) + ")");
                focus1.select("text").text(d2 + ", " + y1[showIndex]);

                var index2 = d3.bisectLeft(xArray,x0),
                    h0 = xArray[index1 - 1],
                    h1 = xArray[index1],
                    h2 = x0 - h0 > h1 - x0 ? h1 : h0;

                focus2.attr("transform", "translate(" + xScale(h2) + "," + yScale(y2[showIndex]) + ")");
                focus2.select("text").text(h2 + ", " + y2[showIndex]);

            });

        selection.exit().remove();
        selection2.exit().remove();
        focus1.exit().remove();
        focus2.exit().remove();
        xBox1.exit().remove();


        resolve();
    }).then(function(){
        return vs.ui.svg.SvgVis.prototype.endDraw.apply(self, args);
    });
};


goog.provide('vs.ui.plugins.canvas.ScatterPlot');

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
vs.ui.plugins.canvas.ScatterPlot = (function() {
  var _quadTree = Symbol('_quadTree');

  /**
   * @constructor
   * @extends vs.ui.canvas.CanvasVis
   */
  var ScatterPlot = function() {
    vs.ui.canvas.CanvasVis.apply(this, arguments);

    /**
     * @type {u.QuadTree}
     * @private
     */
    this[_quadTree] = null;
  };

  goog.inherits(ScatterPlot, vs.ui.canvas.CanvasVis);

  /**
   * @type {Object.<string, vs.ui.Setting>}
   */
  ScatterPlot.Settings = u.extend({}, vs.ui.canvas.CanvasVis.Settings, {
    'vals': vs.ui.Setting.PredefinedSettings['vals'],
    'xBoundaries': vs.ui.Setting.PredefinedSettings['xBoundaries'],
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

  Object.defineProperties(ScatterPlot.prototype, {
    'settings': { get: /** @type {function (this:ScatterPlot)} */ (function() { return ScatterPlot.Settings; })}
  });

  ScatterPlot.prototype.beginDraw = function() {
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
        var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));
        var valsLabel = /** @type {string} */ (self.optionValue('vals'));
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
            .translate({x: margins.left, y: margins.top});
        var items = self.data.asDataRowArray();
        var w, h;
        w = h = itemRadius;

        items.forEach(function(d) {
          var initialPoint = {x: d.val(xCol, valsLabel), y: d.val(yCol, valsLabel)};
          var point = transform.calc(initialPoint);

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

      var fill = /** @type {string} */ (self.optionValue('fill'));
      var stroke = /** @type {string} */ (self.optionValue('stroke'));
      var strokeThickness = /** @type {number} */ (self.optionValue('strokeThickness'));

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
  ScatterPlot.prototype.getItemsAt = function(x, y) {
    if (!this[_quadTree]) { return []; }
    return this[_quadTree].collisions(x, y).map(function(v) { return v.value; });
  };

  /**
   * @param {HTMLElement} canvas
   * @param {vs.models.DataRow} d
   */
  ScatterPlot.prototype.highlightItem = function(canvas, d) {
    var margins = /** @type {vs.models.Margins} */ (this.optionValue('margins'));
    var xScale = /** @type {function(number): number} */ (this.optionValue('xScale'));
    var yScale = /** @type {function(number): number} */ (this.optionValue('yScale'));
    var cols = /** @type {Array.<string>} */ (this.optionValue('cols'));
    var valsLabel = /** @type {string} */ (this.optionValue('vals'));
    var itemRatio = /** @type {number} */ (this.optionValue('itemRatio'));
    var width = /** @type {number} */ (this.optionValue('width'));
    var height = /** @type {number} */ (this.optionValue('height'));

    var selectFill = /** @type {string} */ (this.optionValue('selectFill'));
    var selectStroke = /** @type {string} */ (this.optionValue('selectStroke'));
    var selectStrokeThickness = /** @type {number} */ (this.optionValue('selectStrokeThickness'));

    var transform =
      vs.models.Transformer
        .scale(xScale, yScale)
        .translate({x: margins.left, y: margins.top});

    var itemRadius = Math.min(Math.abs(width), Math.abs(height)) * itemRatio;

    var xCol = cols[0];
    var yCol = cols[1];
    var point = transform.calc({x: d.val(xCol, valsLabel), y: d.val(yCol, valsLabel)});

    var context = canvas.getContext('2d');
    vs.ui.canvas.CanvasVis.circle(context, point.x, point.y, itemRadius, selectFill, selectStroke, selectStrokeThickness);
  };

  return ScatterPlot;
})();


goog.provide('vs.ui.plugins.svg.Heatmap');

if (COMPILED) {
  goog.require('vs.ui');
}

/**
 * @constructor
 * @extends vs.ui.svg.SvgVis
 */
vs.ui.plugins.svg.Heatmap = function() {
  vs.ui.svg.SvgVis.apply(this, arguments);
};

goog.inherits(vs.ui.plugins.svg.Heatmap, vs.ui.svg.SvgVis);

/**
 * @type {Object.<string, vs.ui.Setting>}
 */
vs.ui.plugins.svg.Heatmap.Settings = u.extend({}, vs.ui.VisHandler.Settings, {
  'vals': vs.ui.Setting.PredefinedSettings['vals'],
  'xBoundaries': vs.ui.Setting.PredefinedSettings['xBoundaries'],
  'yBoundaries': vs.ui.Setting.PredefinedSettings['yBoundaries'],
  //'xScale': vs.ui.Setting.PredefinedSettings['xScale'],
  //'yScale': vs.ui.Setting.PredefinedSettings['yScale'],
  'cols': vs.ui.Setting.PredefinedSettings['cols'],
  //'itemRatio': new vs.ui.Setting({'key':'itemRatio', 'type':vs.ui.Setting.Type.NUMBER, 'defaultValue': 0.015, 'label':'item ratio', 'template':'_number.html'}),
  'fill': vs.ui.Setting.PredefinedSettings['fill'],
  'stroke': vs.ui.Setting.PredefinedSettings['stroke'],
  'strokeThickness': vs.ui.Setting.PredefinedSettings['strokeThickness'],
  'selectFill': vs.ui.Setting.PredefinedSettings['selectFill'],
  'selectStroke': vs.ui.Setting.PredefinedSettings['selectStroke'],
  'selectStrokeThickness': vs.ui.Setting.PredefinedSettings['selectStrokeThickness']
});

Object.defineProperties(vs.ui.plugins.svg.Heatmap.prototype, {
  'settings': { get: /** @type {function (this:vs.ui.plugins.svg.Heatmap)} */ (function() { return vs.ui.plugins.svg.Heatmap.Settings; })}
});

/**
 * @override
 */
vs.ui.plugins.svg.Heatmap.prototype.endDraw = function() {
  var self = this;
  var args = arguments;
  return new Promise(function(resolve, reject) {
    /** @type {vs.models.DataSource} */
    var data = self.data;

    // Nothing to draw
    if (!data.nrows) { resolve(); return; }

    var margins = /** @type {vs.models.Margins} */ (self.optionValue('margins'));
    var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));
    var valsLabel = /** @type {string} */ (self.optionValue('vals'));
    var width = /** @type {number} */ (self.optionValue('width'));
    var height = /** @type {number} */ (self.optionValue('height'));
    var yBoundaries = /** @type {vs.models.Boundaries} */ (self.optionValue('yBoundaries'));
    var fill = /** @type {string} */ (self.optionValue('fill'));
    var stroke = /** @type {string} */ (self.optionValue('stroke'));
    var strokeThickness = /** @type {number} */ (self.optionValue('strokeThickness'));

    var xScale = d3.scale.linear()
      .domain([0, cols.length])
      .range([0, width - margins.left - margins.right]);

    var yScale = d3.scale.linear()
      .domain([0, data.nrows])
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

    var items = data.asDataRowArray();
    var selection = viewport.selectAll('g').data(items, vs.models.DataSource.key);

    selection.enter()
      .append('g')
      .attr('class', 'vs-item');

    selection
      .attr('transform', function(d, i) { return 'translate(0,' + yScale(i) + ')'; })
      .each(function(d, i) {
        var cells = d3.select(this).selectAll('rect').data(cols);
        cells
          .enter()
          .append('rect')
          .attr('class', 'vs-cell');
        cells
          .attr('x', function(col, j) { return xScale(j); })
          //.attr('y', yScale(i))
          .attr('y', 0)
          .attr('width', xScale(1))
          .attr('height', yScale(1))
          .attr('fill', function(col) { return colorScale(d.val(col, valsLabel)); });
      });

    selection.exit()
      .remove();

    resolve();
  }).then(function() {
    return vs.ui.svg.SvgVis.prototype.endDraw.apply(self, args);
  });
};

/**
 * @param {HTMLElement} viewport Can be canvas, svg, etc.
 * @param {vs.models.DataRow} d
 */
vs.ui.plugins.svg.Heatmap.prototype.highlightItem = function(viewport, d) {
  var v = d3.select(viewport);
  var selectFill = /** @type {string} */ (this.optionValue('selectFill'));
  var selectStroke = /** @type {string} */ (this.optionValue('selectStroke'));
  var selectStrokeThickness = /** @type {number} */ (this.optionValue('selectStrokeThickness'));
  var valsLabel = /** @type {string} */ (this.optionValue('vals'));
  var yBoundaries = /** @type {vs.models.Boundaries} */ (this.optionValue('yBoundaries'));

  var margins = /** @type {vs.models.Margins} */ (this.optionValue('margins'));
  var width = /** @type {number} */ (this.optionValue('width'));
  var height = /** @type {number} */ (this.optionValue('height'));

  var yScale = d3.scale.linear()
    .domain([0, d.data.nrows])
    .range([0, height - margins.top - margins.bottom]);

  var colorScale = d3.scale.linear()
    .domain([yBoundaries.min, yBoundaries.max])
    .range(['#ffffff', selectFill]);
  var itemHeight = (height - margins.top - margins.bottom) / d.data.nrows;

  var minHeight = Math.max(itemHeight, 25); // a selected row will increase size to this height if necessary
  var heightScale = minHeight / itemHeight;
  var dif = minHeight - itemHeight;

  var items = v.selectAll('.vs-item').data([d], vs.models.DataSource.key);
  items
    .each(function() {
      var item = d3.select(this);
      item.selectAll('.vs-cell')
        .attr('fill', function(col) { return colorScale(d.val(col, valsLabel)); });
    });
  v.append('rect')
    .attr('class', 'vs-item-border')
    .attr('x', -selectStrokeThickness)
    .attr('y', d.index * itemHeight - selectStrokeThickness - 0.5 * dif)
    .attr('width', width - margins.left - margins.right + 2 * selectStrokeThickness)
    .attr('height', dif + itemHeight + 2 * selectStrokeThickness)
    .style('stroke', selectStroke)
    .style('stroke-width', selectStrokeThickness)
    .style('fill', 'none');
  items
    .attr('transform', function(d, i) {
      return 'translate(0, ' + (yScale(d.index) - dif * 0.5) + ') scale(1, ' + heightScale + ')';
    });
  $(items[0]).appendTo($(viewport));
};

/**
 * @param {HTMLElement} viewport Can be canvas, svg, etc.
 * @param {vs.models.DataRow} d
 */
vs.ui.plugins.svg.Heatmap.prototype.unhighlightItem = function(viewport, d) {
  var v = d3.select(viewport);
  var fill = /** @type {string} */ (this.optionValue('fill'));
  var yBoundaries = /** @type {vs.models.Boundaries} */ (this.optionValue('yBoundaries'));
  var valsLabel = /** @type {string} */ (this.optionValue('vals'));
  var margins = /** @type {vs.models.Margins} */ (this.optionValue('margins'));
  var width = /** @type {number} */ (this.optionValue('width'));
  var height = /** @type {number} */ (this.optionValue('height'));
  var yScale = d3.scale.linear()
    .domain([0, d.data.nrows])
    .range([0, height - margins.top - margins.bottom]);
  var colorScale = d3.scale.linear()
    .domain([yBoundaries.min, yBoundaries.max])
    .range(['#ffffff', fill]);
  v.selectAll('.vs-item').data([d], vs.models.DataSource.key)
    .each(function() {
      var item = d3.select(this);
      item.selectAll('.vs-cell')
        .attr('fill', function(col) { return colorScale(d.val(col, valsLabel)); });
    })
    .attr('transform', function(d, i) { return 'translate(0,' + yScale(d.index) + ')'; });
  v.selectAll('.vs-item-border').remove();
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
  'cols': vs.ui.Setting.PredefinedSettings['cols'],
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
    var data = self.data;

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

    var items = data.asDataRowArray();
    var selection = viewport.selectAll('circle').data(items, vs.models.DataSource.key);

    selection.enter()
      .append('circle')
      .attr('class', 'vs-item');

    selection
      .attr('r', itemRadius)
      .attr('cx', function(d) { return xScale(d.val(xCol, valsLabel)); })
      .attr('cy', function(d) { return yScale(d.val(yCol, valsLabel)); })
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
 * @param {vs.models.DataRow} d
 */
vs.ui.plugins.svg.ScatterPlot.prototype.highlightItem = function(viewport, d) {
  var v = d3.select(viewport);
  var selectFill = /** @type {string} */ (this.optionValue('selectFill'));
  var selectStroke = /** @type {string} */ (this.optionValue('selectStroke'));
  var selectStrokeThickness = /** @type {number} */ (this.optionValue('selectStrokeThickness'));
  var items = v.selectAll('.vs-item').data([d], vs.models.DataSource.key);
  items
    .style('stroke', selectStroke)
    .style('stroke-width', selectStrokeThickness)
    .style('fill', selectFill);
  $(items[0]).appendTo($(viewport));
};

/**
 * @param {HTMLElement} viewport Can be canvas, svg, etc.
 * @param {vs.models.DataRow} d
 */
vs.ui.plugins.svg.ScatterPlot.prototype.unhighlightItem = function(viewport, d) {
  var v = d3.select(viewport);
  var fill = /** @type {string} */ (this.optionValue('fill'));
  var stroke = /** @type {string} */ (this.optionValue('stroke'));
  var strokeThickness = /** @type {number} */ (this.optionValue('strokeThickness'));
  v.selectAll('.vs-item').data([d], vs.models.DataSource.key)
    .style('stroke', stroke)
    .style('stroke-width', strokeThickness)
    .style('fill', fill);
};


goog.provide('vs.ui.plugins');

goog.require('vs.ui.plugins.canvas.ManhattanPlot');
goog.require('vs.ui.plugins.canvas.ScatterPlot');
goog.require('vs.ui.plugins.canvas.Line');
goog.require('vs.ui.plugins.svg.ManhattanPlot');
goog.require('vs.ui.plugins.svg.ScatterPlot');
goog.require('vs.ui.plugins.svg.Heatmap');
goog.require('vs.ui.plugins.svg.Demo');
goog.require('vs.ui.plugins.svg.Line');
