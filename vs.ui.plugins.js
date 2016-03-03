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

/**
 * @override
 * @returns(Promise)
 */
vs.ui.plugins.svg.Line.prototype.endDraw = function() {
    var self = this;
    var args = arguments;

    return new Promise(function(resolve, reject) {
        var colorOption = ['blue', 'red'];
        var minX = 95741;
        var maxX = 601592;
        var categories = ["tumor", "healthy"];

        var data = {
            "nrows": 1000,
            "ncols": 2,
            "rows": [
                {
                    "label": "genomic location",
                    "boundaries": {"min": 95741, "max": 601592},
                    "d": [95741, 180688, 189444, 189499, 189586, 189649, 189743, 189899, 190123, 190295, 191787, 192733, 193154, 193921, 194572, 195152, 195323, 197014, 197455, 197725, 198236, 198507, 198804, 199405, 200083, 200784, 201289, 202440, 203382, 204709, 205092, 205598, 206079, 206640, 207000, 207102, 207171, 207296, 207359, 207440, 207572, 207688, 207878, 207924, 208038, 208267, 208507, 208656, 208736, 208796, 208864, 208991, 209113, 209313, 209530, 209797, 210610, 211079, 211883, 212302, 212728, 213666, 214493, 215323, 216261, 217554, 218751, 219007, 219351, 219864, 221989, 222566, 223218, 223522, 224497, 225822, 228085, 229787, 230548, 231111, 231988, 232879, 233167, 233688, 234706, 235165, 235674, 235962, 236135, 236239, 236309, 236437, 236496, 236634, 236838, 236921, 236998, 237138, 237269, 237556, 238531, 239756, 241738, 243308, 244461, 245641, 247329, 248099, 249104, 250286, 251063, 251727, 252235, 252476, 252855, 253313, 253882, 254862, 256079, 256251, 257229, 257795, 258371, 259229, 259526, 260086, 262331, 264646, 267454, 267789, 268116, 268425, 268923, 269200, 269488, 270045, 270840, 271133, 271740, 272313, 272526, 273033, 274624, 278013, 278421, 278984, 279185, 279293, 279352, 279442, 279513, 279581, 279689, 279806, 279936, 280062, 280170, 280246, 280314, 280427, 280519, 280591, 280678, 280763, 280868, 280950, 281043, 281117, 281297, 281390, 281495, 281659, 281834, 282651, 283602, 284016, 284296, 284527, 285078, 285294, 285855, 286144, 287083, 287911, 288146, 288252, 288347, 288523, 288648, 288737, 288819, 288888, 288971, 289024, 289087, 289156, 289368, 289679, 289877, 289979, 290315, 290490, 290822, 291337, 291577, 291751, 291949, 292120, 292472, 292901, 293218, 293578, 293878, 294278, 294576, 294922, 295107, 295463, 295805, 296095, 296421, 296634, 296824, 297278, 297725, 297945, 298268, 298621, 299108, 299371, 299500, 299668, 300225, 300605, 301298, 301883, 303631, 304037, 304147, 304226, 304311, 304471, 304721, 305761, 306063, 306625, 306858, 307414, 309305, 310077, 312327, 312786, 313719, 314350, 315318, 315784, 315902, 315959, 316016, 316100, 316221, 316307, 316384, 316527, 316671, 317043, 317932, 319686, 320579, 322991, 323837, 324340, 324792, 325034, 326045, 326532, 326952, 327504, 328128, 329422, 330334, 330625, 330916, 331074, 331273, 331784, 332759, 333078, 333757, 334298, 334606, 334833, 335867, 336380, 340362, 342593, 344231, 345115, 345901, 347508, 349495, 350873, 351249, 351636, 352717, 353281, 353735, 354147, 355470, 355710, 355885, 355981, 356113, 356324, 356399, 356793, 358264, 358368, 358595, 358819, 360662, 361027, 361303, 362552, 362871, 363700, 364325, 364633, 364809, 365084, 365408, 366030, 366375, 366794, 367369, 367625, 368384, 368614, 368906, 369252, 369419, 369481, 369629, 369695, 369791, 369878, 369951, 369997, 370146, 370207, 370424, 370673, 371809, 372237, 372671, 372902, 373083, 373249, 373574, 373802, 374117, 375379, 375669, 375803, 375964, 376088, 376243, 376455, 376664, 376779, 377102, 377216, 377322, 377660, 378148, 378657, 379176, 379368, 379458, 379541, 379620, 379705, 379849, 379951, 380018, 380193, 380294, 380420, 380567, 380726, 380911, 381779, 381952, 382331, 382928, 383496, 383777, 384090, 384418, 384675, 385727, 386011, 386610, 388069, 389169, 390063, 391011, 391309, 391551, 391801, 392017, 392250, 392476, 392615, 393029, 393606, 394099, 394277, 394391, 394474, 394576, 394844, 395097, 395410, 395787, 396330, 396757, 396892, 397045, 397150, 397282, 397389, 397650, 398987, 399151, 399887, 400124, 400230, 400362, 400479, 400555, 400694, 403066, 403214, 403399, 403681, 403930, 404101, 404334, 404683, 405243, 405754, 405970, 406217, 406439, 406637, 406760, 406851, 406938, 407114, 407186, 407405, 407478, 407572, 407698, 407961, 408587, 409149, 410032, 410307, 412836, 413350, 414686, 414953, 415430, 415622, 416276, 416449, 416583, 416655, 416754, 416840, 416901, 417009, 417150, 417217, 417346, 417412, 417488, 417615, 417831, 418195, 418544, 418734, 419112, 419425, 419809, 420163, 420351, 420495, 420586, 420687, 420780, 420928, 421087, 421321, 422064, 422310, 423699, 424956, 425285, 426254, 427082, 428050, 428322, 428532, 428661, 428840, 429550, 429688, 430023, 430157, 430369, 431688, 431962, 432269, 432597, 433081, 433337, 433622, 433873, 434082, 434310, 434509, 434736, 436101, 437326, 437675, 438107, 438565, 438804, 439491, 439802, 439955, 440690, 440894, 441421, 441700, 441939, 442077, 442670, 442922, 443766, 444063, 444678, 445865, 446187, 446642, 447266, 448096, 448166, 448247, 448396, 448631, 449212, 449493, 449677, 450033, 450176, 450288, 450369, 450424, 450482, 450550, 450614, 450716, 450812, 450894, 451000, 451124, 451379, 451616, 451899, 452181, 452651, 453173, 453425, 453768, 454107, 454745, 455320, 455725, 456035, 456270, 456839, 457338, 457609, 457970, 458779, 459681, 459930, 460228, 460474, 460650, 460750, 461035, 461526, 462034, 462599, 464139, 464465, 464621, 465015, 466378, 467316, 468072, 468440, 469569, 470107, 470258, 470523, 471567, 472356, 472612, 472871, 473003, 473130, 473397, 473697, 474029, 474542, 474876, 475002, 475148, 475275, 475466, 476079, 476370, 476656, 476884, 477450, 477668, 477888, 478042, 479029, 479295, 479593, 480133, 481221, 482165, 483855, 484211, 484553, 484833, 485247, 485422, 486014, 486282, 486384, 486882, 487121, 487411, 487619, 487877, 488165, 488383, 488555, 488728, 489023, 489261, 489432, 489537, 489686, 489857, 490035, 490196, 490489, 490669, 490848, 491131, 491341, 492572, 492810, 493054, 493210, 494030, 494281, 494661, 495007, 495138, 495364, 495834, 496718, 497091, 497386, 497704, 497875, 498164, 498530, 498733, 498952, 499362, 499754, 500048, 500316, 500557, 501151, 501453, 501673, 501973, 502242, 503163, 503505, 503807, 504190, 504261, 504406, 504562, 504756, 504941, 505561, 506209, 506411, 506522, 506620, 506751, 506864, 506911, 506985, 507052, 507131, 507227, 507290, 507351, 507484, 507575, 507638, 507720, 507792, 507883, 508001, 508423, 509474, 510221, 511516, 512521, 512952, 513398, 513643, 515013, 516131, 518473, 518728, 518791, 518849, 518978, 519033, 519201, 520717, 520940, 521081, 521637, 523315, 524249, 525923, 526384, 526658, 528189, 528328, 528653, 528831, 529061, 529164, 529774, 530311, 531578, 531864, 532213, 532552, 532700, 532939, 533189, 533308, 533503, 533675, 533860, 534197, 534509, 534712, 534794, 534885, 535042, 535123, 535181, 535266, 535333, 535385, 535486, 535538, 535598, 535674, 535742, 535864, 535939, 536030, 536105, 536207, 536390, 536836, 536905, 536963, 537015, 537110, 537213, 537279, 537357, 537435, 537558, 537686, 538297, 538732, 538890, 539935, 540543, 540873, 541327, 541643, 541810, 542683, 544037, 544541, 545120, 545573, 545992, 547226, 548855, 549271, 549503, 550040, 550283, 550599, 551196, 551319, 551688, 552042, 552523, 553102, 553502, 553865, 554076, 554550, 554755, 554909, 555003, 555120, 555296, 555415, 555535, 555665, 555770, 555828, 555900, 555979, 556060, 556132, 556197, 556259, 556372, 556462, 556639, 556925, 557154, 557525, 557915, 558400, 558659, 558863, 559082, 559355, 559908, 560294, 560474, 560580, 560868, 560969, 561027, 561085, 561149, 561213, 561264, 561364, 561434, 561538, 561785, 562158, 562344, 562587, 562939, 563434, 563860, 565335, 566438, 566703, 567233, 567564, 567840, 568051, 568157, 568291, 568364, 568432, 568523, 568584, 568643, 568704, 568770, 568831, 568950, 569008, 569079, 569245, 569375, 569559, 569867, 571707, 572250, 573335, 573692, 574754, 575092, 575306, 575426, 575518, 575604, 575701, 575749, 575859, 576028, 576121, 576219, 576355, 576493, 576548, 576607, 576685, 576736, 576965, 577069, 577283, 577618, 578366, 578912, 579612, 580078, 580395, 581272, 581592, 581925, 582104, 582835, 583855, 584371, 585130, 586586, 587019, 587206, 587409, 587926, 589187, 589639, 589860, 589989, 590315, 591082, 591408, 592289, 592581, 592712, 593015, 593425, 593554, 593801, 594241, 594532, 595232, 595769, 596247, 596659, 597016, 597231, 597505, 597676, 598117, 598390, 598487, 598696, 599090, 599710, 600229, 601592]
                }
            ],
            "cols": [
                {"label": "sample", "d": ["tumor", "healthy"]}
            ],
            "vals": [
                {
                    "label": "p-value", "boundaries": {"min": -7, "max": 7},
                    "d": [
                        // tumor
                        0.32, -0.47, 2.482, 2.417, 2.226, 2.032, 1.691, 1.111, 0.538, 0.386, -0.976, -0.563, -0.267, -0.217, -0.345, -0.395, -0.375, -0.39, 0.152, 0.586, 1.163, 1.25, 1.243, 1.115, 1.26, 1.493, 1.424, 0.974, 1.632, 2.818, 3.095, 3.014, 1.107, -4.899, -5.97, -5.951, -5.891, -5.717, -5.63, -5.551, -5.452, -5.39, -5.384, -5.401, -5.47, -5.54, -5.412, -5.341, -5.269, -5.168, -4.989, -4.426, -3.646, -2.064, -0.253, 1.231, 2.527, 2.323, 2.208, 2.222, 2.234, 2.171, 1.771, 1.974, 2.287, 2.485, 2.287, 2.21, 2.102, 1.953, 1.877, 1.949, 2.138, 2.27, 2.529, 2.413, 1.92, 1.767, 2.092, 2.433, 2.373, 2.602, 2.672, 2.834, 3.587, 2.385, -2.364, -5.05, -5.874, -6.18, -6.282, -6.274, -6.226, -6.067, -6.062, -6.109, -6.136, -6.041, -5.676, -3.751, 1.81, 2.021, 2.352, 1.901, 1.577, 1.517, 1.773, 1.882, 1.975, 1.665, 1.834, 2.196, 2.359, 2.324, 2.033, 1.518, 1.396, 1.666, 0.87, 0.785, 0.393, 0.187, 0.342, 0.657, 0.743, 0.842, 0.762, 0.782, -1.072, -1.354, -1.253, -1.268, -2.322, -2.503, -1.854, 0.56, 1.33, 1.108, 0.571, 0.615, 0.802, 1.289, 1.303, 0.482, -0.516, -1.039, -1.431, -1.635, -1.737, -1.887, -2.007, -2.139, -2.396, -2.75, -3.177, -3.556, -3.794, -3.893, -3.942, -3.924, -3.802, -3.657, -3.436, -3.182, -2.84, -2.58, -2.319, -2.152, -1.848, -1.695, -1.483, -1.025, -0.488, 0.009, 0.921, 1.531, 1.818, 1.961, 1.766, 1.553, 1.184, 1.251, 0.451, -1.294, -2.918, -3.565, -4.017, -4.569, -4.832, -4.963, -5.037, -5.047, -4.977, -4.883, -4.718, -4.466, -3.105, -0.174, 1.283, 1.818, 2.584, 2.489, 2.136, 2.067, 2.336, 2.572, 2.768, 2.85, 2.784, 2.434, 2.171, 2.002, 1.877, 2.048, 2.176, 2.271, 2.262, 2.098, 1.701, 1.4, 1.078, 0.847, 0.562, -0.407, -1.345, -1.47, -1.337, -1.064, -0.555, -0.075, 0.009, -0.177, -1.298, -1.29, 0.736, 1.367, 0.912, 1.749, 1.974, 2.126, 2.261, 2.272, 1.267, 0.639, 1.726, 2.87, 2.979, 1.84, -1.617, -2.086, -0.681, -0.684, -2.052, -3.223, -2.252, -2.323, -2.373, -2.411, -2.453, -2.509, -2.544, -2.531, -2.494, -2.343, -2.064, -1.242, -1.054, -2.83, -2.054, 1.678, 1.171, 0.971, 1.131, 1.519, 2.199, 0.78, -0.794, -0.831, 2.071, 2.216, 1.886, 1.748, 1.495, 1.458, 1.529, 2.117, 2.66, 2.309, 0.74, 0.241, 0.258, 0.251, -0.384, -0.864, 2.153, 2.131, 2.049, 2.027, 1.959, 1.753, 0.073, -0.317, 0.682, 1.675, 1.065, -0.754, -1.191, -0.68, -1.545, -2.768, -3.814, -4.244, -4.378, -3.104, -2.143, 4.121, 0.697, 0.703, 0.65, 0.498, 1.185, 1.426, 1.43, 1.399, 1.576, 1.583, -0.73, -0.972, -0.471, 0.752, 2.02, 1.271, 1.095, 1.107, 1.39, 1.133, -1.767, -2.68, -3.639, -4.52, -4.788, -4.804, -4.445, -4.049, -3.303, -2.632, -2.081, -1.743, -0.806, -0.505, 0.091, 0.045, 0.455, 1.028, 1.138, 1.017, 1.003, 1.103, 1.485, 1.735, 1.715, 1.771, 2.308, 2.498, 2.653, 2.733, 2.785, 2.749, 2.586, 2.47, 2.104, 1.894, 1.619, 0.549, -0.015, -0.128, 1.061, 1.719, 1.983, 2.174, 2.307, 2.397, 2.431, 2.407, 2.384, 2.307, 2.253, 2.142, 1.927, 1.616, 1.26, 0.682, 0.501, 0.123, 0.496, 0.929, 0.961, 0.965, 0.941, 0.998, 1.682, 1.761, 1.554, 0.577, 0.747, 0.29, -0.765, -0.291, 0.375, 1.186, 1.731, 1.787, 1.536, 1.312, 0.258, -0.857, -1.351, -1.508, -1.593, -1.632, -1.65, -1.548, -1.35, -1.04, -0.626, 0.438, 0.803, 0.892, 1.024, 1.142, 1.349, 1.564, 2.233, 2.703, 2.34, 1.937, 1.751, 1.586, 1.396, 1.279, 1.222, 1.176, 2.346, 2.3, 2.352, 2.532, 2.701, 2.687, 2.495, 2.342, 1.514, 0.917, 1.232, 1.446, 1.017, -0.118, -1.043, -1.739, -2.351, -3.134, -3.257, -2.794, -2.374, -1.682, -0.58, 1.457, 1.839, 1.362, 0.881, 0.892, 0.671, -0.772, -1.706, -2.006, -2.305, -1.879, -2.163, -2.942, -3.601, -3.942, -4.354, -4.618, -4.742, -4.825, -4.655, -4.474, -3.973, -3.642, -3.203, -2.378, -0.924, 1.084, 2.075, 2.351, 2.644, 2.38, 1.265, 0.865, 1.281, 1.736, 2.023, 2.28, 2.444, 2.532, 2.397, 2.124, 2.642, 2.304, 1.753, 1.564, 1.589, 2.425, 2.402, 2.655, 2.758, 2.64, 2.444, 2.04, 2.452, 2.436, 1.879, 1.666, 1.373, 2.608, 2.469, 2.315, 2.37, 2.511, 2.67, 2.812, 2.884, 2.755, 2.55, 2.48, 2.536, 1.865, 1.363, 1.368, 1.479, 1.573, 1.563, 1.695, 1.536, 1.335, -0.856, -1.186, -2.295, -2.989, -3.174, -2.982, -0.098, 1.112, 0.756, -0.023, -1.343, -1.288, -1.095, -0.958, -0.545, -4.199, -4.713, -5.005, -4.729, -2.698, 2.02, 2.054, 0.81, -3.12, -4.441, -5.099, -5.392, -5.526, -5.614, -5.645, -5.605, -5.426, -5.169, -4.906, -4.503, -3.861, -1.699, 0.896, 2.966, 3.384, 2.826, 2.408, 2.406, 2.364, 2.304, 1.964, 1.799, 2.003, 2.158, 2.151, 1.485, 1.08, 1.298, 1.953, 3.57, 3.13, 2.824, 2.598, 2.438, 2.501, 2.606, 3.002, 3.349, 2.77, 2.714, 3.136, 3.271, 3.28, 3.066, 2.244, 2.887, 2.677, 2.067, -0.821, -0.147, 0.266, 0.919, 2.902, 2.44, 2.728, 3.236, 3.373, 3.432, 3.36, 3.302, 3.171, 2.879, 2.739, 2.775, 2.792, 2.72, 2.54, 3.068, 3.167, 2.946, 2.553, 2.159, 2.308, 2.569, 2.738, 2.941, 2.83, 2.703, 2.561, 2.917, 3.213, 2.455, 2.285, 2.424, 2.883, 3.824, 3.722, 1.854, 1.82, 1.942, 2.507, 2.45, 2.097, 1.6, 1.192, 1.279, 1.714, 2.089, 2.35, 2.477, 2.471, 2.565, 2.703, 2.978, 3.29, 3.435, 3.359, 3.004, 2.786, 2.584, 2.445, 2.492, 1.658, 1.565, 1.527, 1.534, 1.585, 1.655, 2.085, 2.148, 2.032, 1.782, 1.409, 1.828, 2.681, 3.251, 3.514, 3.658, 3.676, 3.497, 3.572, 3.568, 3.649, 3.434, 3.168, 3.037, 2.826, 2.422, 2.308, 2.115, 1.947, 1.858, 1.251, 0.964, 0.862, 0.266, 0.138, -0.061, -0.17, -0.144, 0.047, 0.214, -3.665, -4.554, -4.915, -5.168, -5.414, -5.497, -5.506, -5.497, -5.45, -5.335, -5.119, -4.91, -4.641, -3.811, -3.066, -2.467, -1.613, -0.799, 0.311, 1.841, 5.094, 2.172, 2.031, 2.263, 2.344, 2.583, 2.742, 2.751, 1.935, 2.086, -3.554, -5.208, -5.274, -5.19, -4.453, -3.901, -1.397, 2.635, 2.474, 2.282, 1.568, 2.364, 2.084, 0.678, 0.657, 0.495, 2.224, 2.282, 1.996, 1.71, 1.508, 1.473, 1.331, 1.419, 1.778, 1.921, 2.063, 2.262, 2.348, 2.332, 2.233, 2.238, 2.368, 2.546, 2.919, 2.557, -0.647, -3.274, -4.097, -4.789, -5.481, -5.664, -5.745, -5.725, -5.629, -5.531, -5.308, -5.191, -5.074, -4.979, -4.89, -4.614, -4.379, -4.015, -3.678, -3.216, -2.436, -2.681, -3.035, -3.352, -3.645, -4.132, -4.455, -4.513, -4.447, -4.225, -3.575, -2.641, 1.426, 2.449, 2.631, 2.113, 2.027, 2.045, 1.972, 1.86, 1.772, 1.744, 1.818, 1.313, 1.433, 2.09, 2.624, 2.883, 1.157, 1.128, 1.238, 1.759, 2.198, 2.583, 1.624, 1.565, 1.552, 1.516, 1.459, 1.391, 1.181, 0.459, -0.087, -1.637, -2.387, -2.926, -3.201, -3.438, -3.589, -3.637, -3.686, -3.74, -3.73, -3.7, -3.623, -3.467, -3.242, -2.989, -2.711, -2.397, -1.718, -1.106, 0.169, 1.629, 1.859, 1.568, 1.165, 1.794, 1.79, 1.513, 0.979, 0.161, -1.1, -2.252, -3.15, -3.737, -4.99, -5.155, -5.186, -5.168, -5.091, -4.964, -4.829, -4.477, -4.158, -3.535, -1.559, 1.44, 2.416, 2.963, 2.998, 2.398, 1.941, 0.86, 1.811, 2.058, 1.956, 1.076, -0.145, -1.383, -2.015, -2.809, -3.202, -3.532, -3.895, -4.073, -4.185, -4.243, -4.241, -4.183, -3.917, -3.728, -3.459, -2.686, -1.979, -0.972, 0.427, 0.105, 0.916, 2.006, 1.591, -0.817, -2.401, -3.432, -3.824, -4.052, -4.224, -4.399, -4.485, -4.687, -4.984, -5.139, -5.294, -5.478, -5.647, -5.697, -5.729, -5.723, -5.686, -5.136, -4.712, -3.657, -2.009, -0.535, 0.684, 1.576, 1.725, 1.786, 2.075, 2.045, 1.971, 1.965, 2.06, 1.969, 2.096, 2.001, 1.526, 2.041, 2.042, 1.858, 1.06, 2.083, 2.529, 2.515, 2.43, 2.028, 1.584, 2.089, 2.74, 2.859, 2.963, 3.052, 2.914, 2.994, 3.156, 2.908, 2.706, 2.438, 1.922, 1.546, 1.856, 2.454, 2.74, 2.994, 3.025, 2.862, 2.738, 2.706, 2.672, 3.017, 3.748, 3.949, 3.118,
                        // normal
                        3.199, 3.065, 2.702, 2.176, 3.098, 3.565, 3.637, 3.598, 2.882, 1.366, 1.309, 1.908, 2.468, 2.709, 2.969, 3.119, 3.197, 3.273, 3.286, 2.992, 2.554, 2.241, 1.897, 1.945, 2.462, 2.868, 3.01, 2.806, 2.809, 2.424, 1.834, 1.377, 0.496, -0.555, 0.124, 1.042, 0.947, 0.595, -0.02, -0.103, 1.008, 1.214, 1.157, 0.694, 0.223, -0.551, -2.181, -3.679, -4.402, -4.586, -4.271, -3.768, 0.519, 1.199, 1.24, 1.462, 1.846, 2.03, 2.179, 2.349, 2.4, 2.327, 2.132, 1.992, 2.458, 2.928, 3.066, 2.852, 2.359, 0.759, 0.882, 1.125, 1.378, 1.506, 1.767, 2.509, 0.57, -0.428, -0.612, -0.669, -0.714, -0.723, -0.745, -0.56, -0.351, -0.928, -2.182, -2.972, -3.146, -3.187, -2.937, -2.433, -0.426, 2.609, 2.666, 2.097, 1.531, 0.934, -0.365, 0.191, 1.783, 2.427, 2.351, 2.632, 2.302, 1.119, 0.392, -0.135, -1.572, -2.716, -3.041, -3.207, -3.146, -2.936, -2.608, -2.358, -1.844, -1.4, -0.878, -0.16, 0.672, 0.687, 0.828, -0.237, -0.996, -1.482, -1.669, -1.825, -1.881, -1.899, -1.852, -1.583, -0.398, 0.047, 0.39, 1.089, 2.401, 2.598, 2.205, 1.255, 1.451, 2.387, 2.363, 2.254, 1.896, 1.422, 1.162, 1.388, 1.833, 2.317, 2.425, 2.938, 2.633, 2.236, 1.932, 0.794, 0.1, 0.242, 0.46, 2.191, 2.069, 0.989, 1.007, 1.78, 2.332, 2.218, 1.911, 1.856, 2.266, 2.557, 2.537, 2.138, 0.795, 0.297, 0.838, 2.147, 1.124, 0.785, 1.62, 3.001, 2.491, 2.33, 2.558, 2.841, 3.072, 3.291, 3.304, 2.158, 1.984, 2.241, 2.176, 2.494, 2.668, 2.796, 3.009, 2.87, 2.607, 2.372, 2.544, 2.308, 2.282, 2.49, 3.034, 3.529, 2.461, 2.461, 2.539, 2.618, 2.879, 2.852, 2.531, 2.201, 1.603, 0.16, 1.049, 1.922, 2.842, 2.838, 1.822, 0.81, 0.39, -0.645, -2.944, -3.264, -3.711, -4.212, -4.671, -5.093, -5.382, -5.602, -5.792, -5.902, -5.924, -5.834, -5.756, -5.698, -5.685, -5.715, -5.777, -5.952, -6.009, -5.982, -5.725, -5.017, 0.751, 1.487, 1.689, 1.951, 2.055, 2.618, 2.433, 2.103, 1.552, 1.002, 0.078, 0.129, 1.464, 1.48, 0.983, 0.138, -0.312, -0.443, -1.8, -2.298, -3.043, -3.121, -3.167, -3.195, -3.182, -3.064, -2.781, -1.742, -1.155, -0.385, -0.172, 0.368, 0.739, 0.584, 0.248, -0.353, -0.867, -1.148, -0.882, 0.244, 0.045, 0.611, 2.089, 0.75, 0.571, 1.695, 2.512, 2.639, 1.822, 0.477, -0.395, -1.17, -1.437, -1.767, -1.403, -0.901, -0.395, -0.156, -0.322, -0.268, 0.097, 0.341, 0.856, 1.288, 1.386, 1.619, 1.309, -1.349, -2.192, -2.73, -3.459, -4.272, -4.344, -4.07, -3.792, -3.298, -2.228, -0.929, 1.795, 0.605, -0.774, -1.381, -0.984, -0.115, -0.65, -0.929, 0.22, 1.138, 1.227, 1.283, 1.32, 1.527, -0.264, -0.402, 0.738, 1.901, 1.834, 1.8, 2.267, -1.436, -3.52, -4.491, -5.145, -5.501, -5.645, -5.68, -5.664, -5.621, -5.496, -5.418, -5.31, -5.097, -4.831, -4.529, -3.856, -2.975, 1.72, 2.406, 2.423, 2.181, 1.889, 1.89, 1.908, 2.564, 2.978, 1.336, -0.506, -0.708, -0.035, 0.71, 1.628, 1.844, 1.242, 1.072, 1.184, 1.407, 2.222, 2.76, 2.212, 2.384, 2.279, 2.189, 2.291, 2.539, 2.669, 2.126, 2, 1.849, 1.919, 2.086, 2.032, 1.534, 1.367, 0.867, -1.592, -4.701, -5.416, -5.869, -5.945, -5.932, -5.81, -5.735, -5.679, -5.66, -5.649, -5.637, -5.541, -5.346, -4.629, -1.916, 2.367, 2.454, 2.685, 2.866, 2.715, 1.738, 1.958, 1.8, 1.497, 0.267, -0.787, -1.595, -0.967, 2.427, 1.917, 1.411, 1.468, 1.909, 1.877, 1.347, 0.558, 0.266, 0.293, 0.521, -0.456, -1.866, -2.635, -2.593, -2.466, -1.835, -0.197, 0.851, 2.23, 3.001, 3.059, 2.983, 2.733, 2.15, 1.822, 1.616, 1.671, 1.985, 2.146, 2.109, 1.43, 0.92, -1.096, -2.088, -3.228, -4.209, -3.6, -3.347, -4.074, -5.121, -5.392, -5.564, -5.686, -5.686, -5.592, -5.366, -5.208, -4.956, -3.824, -2.229, 2.443, 2.893, 2.876, 2.811, 2.806, 2.89, 3.009, 3.01, 2.993, 3.033, 3.059, 3.072, 2.811, 2.202, 2.474, 2.646, 2.203, -0.389, -1.333, -3.171, -4.222, -4.848, -5.157, -5.266, -5.01, -4.797, -4.322, -3.579, -1.183, 0.897, -2.456, -4.597, -5.347, -5.545, -5.624, -5.653, -5.643, -5.556, -5.373, -5.153, -4.996, -4.426, -4.147, -3.537, -3.016, -1.332, 0.41, 1.65, 1.985, 1.69, 1.494, 2.037, 1.258, -1.92, -2.43, -3.665, -4.668, -5.155, -5.358, -5.433, -5.434, -5.366, -5.235, -5.027, -4.793, -4.173, -3.329, -1.819, 0.412, 1.04, 1.299, 1.543, 2.545, 2.342, 2.048, 1.463, 0.786, 0.146, -0.107, -0.239, -0.307, -0.364, -0.36, -0.246, -0.066, -0.475, -3.84, -4.207, -4.293, -4.282, -4.234, -4.098, -3.822, -3.226, -1.871, 1.308, 0.684, -0.131, -0.511, -0.817, -1.104, -1.24, -1.374, -1.436, -1.526, -1.555, -1.541, -1.494, -1.41, -1.293, -1.056, -0.874, -0.739, -0.014, 0.824, 1.38, 1.288, -0.257, -2.238, -3.7, -4.619, -5.063, -5.333, -5.522, -5.477, -5.098, -4.389, -3.985, -2.044, -0.983, -1.17, -1.076, 1.006, 1.606, 1.862, 1.804, 1.634, 1.167, 0.268, -0.123, 1.892, 1.891, 1.731, 1.457, 1.36, -3.054, -4.515, -5.043, -5.32, -5.536, -5.552, -5.536, -5.491, -5.433, -5.379, -5.286, -5.206, -5.021, -4.661, -4.425, -4.174, -3.274, -2.78, -2.735, -1.676, -0.82, -0.452, 0.431, 0.851, 0.822, 0.396, -0.014, -0.912, -2.089, -2.777, -3.728, -4.252, -4.281, -4.212, -3.56, -3.207, -2.896, -2.419, -2.123, -1.79, -1.303, -0.903, -0.625, -0.397, -0.313, -0.22, -0.044, 1.002, 0.847, 0.835, 1.083, 1.308, 1.323, 1.321, 1.446, 1.602, 1.529, 1.324, 0.914, 0.238, 0.148, 0.058, 0.85, 1.588, 1.733, 0.974, -1.015, -0.756, 0.312, 0.356, 0.27, -0.703, -0.572, -0.478, -0.408, -0.323, -0.338, -0.116, 0.055, 0.372, 0.639, 0.608, 0.576, 0.552, 0.532, 0.797, 1.487, 1.656, 1.439, 1.359, 2.128, 2.169, 1.92, 1.941, 1.859, 1.739, 1.853, 2.052, 1.99, 1.982, 1.862, 1.453, 1.4, 1.891, 1.283, 1.44, 1.938, 2.272, 2.275, 2.06, 2.101, 3.009, 2.561, 2.234, 2.224, 2.247, 2.327, 2.843, 3.043, 3.142, 3.183, 3.08, 2.442, 2.037, 2.072, 2.361, 3.126, 3.81, 3.451, 2.795, 2.733, 2.873, 3.13, 2.651, 2.453, 3.092, 3.283, 3.604, 3.15, 2.821, 2.568, 1.905, 1.755, 1.514, 1.68, 1.83, 1.889, 1.999, 2.317, 2.427, 2.134, 1.715, 1.512, 2.024, 1.662, 1.761, 2.193, 2.58, 2.898, 2.976, 3.194, 2.9, 2.623, 2.355, 2.4, 2.847, 3.015, 3.064, 3.097, 2.864, 2.433, 2.767, 2.583, 2.482, 3.171, 2.619, -1.972, -3.419, -4.138, -4.737, -4.84, -5.167, -5.339, -5.885, -6.388, -6.558, -6.526, -6.244, -5.407, -4.26, 1.45, 4.527, 1.158, 1.109, 1.207, 1.502, 1.51, 1.255, 0.658, 1.479, 1.843, 1.62, 1.319, 1.438, 1.657, 1.617, 1.461, 1.45, 0.813, 0.078, -0.964, -1.606, -2.076, -2.602, -2.866, -3.202, -3.494, -3.852, -4.145, -4.424, -4.706, -4.743, -3.259, 0.983, 0.891, -0.136, 0.52, 1.044, 1.409, 0.984, 0.374, 0.597, 1.413, 2.293, 2.202, 2.298, 2.125, 1.613, 1.034, 1.28, 1.554, 1.762, 1.714, 1.4, 1.974, 1.952, 1.617, 2.319, 0.923, 0.148, 0.188, 0.403, 0.288, 0.074, 0.398, 1.835, 2.304, 2.533, 2.392, 2.21, 1.978, 2.467, 2.602, 2.991, 2.99, 2.136, 1.283, 2.099, 2.298, 2.403, 2.884, 2.992, 1.71, 1.216, 1.14, 1.282, 2.195, 2.622, 2.706, 2.74, 2.703, 2.665, 2.647, 2.686, 3.236, 3.178, 2.678, 1.745, 1.411, 1.263, 1.538, 1.843, 2.35, 2.72, 2.891, 3.011, 2.558, 2.294, 2.217, 1.659, 1.54, 2.51, 2.647, 3.276, 3.455, 3.299, 2.916, 0.059, -0.25, 0.215, 1.45, 2.189, 2.272, 2.187, 2.482, 3.116, 3.156, 3.69, 3.843, 3.68, 3.282, 2.778, 2.815, 2.873, 2.825, 2.437, 1.337, 1.109, 1.393, 2.446, 2.792, 2.935, 2.975, 3.044, 3.209, 3.319, 3.388, 3.315, 1.14, 1.312, 1.528, 1.68, 2.166, 2.511, 2.401, 2.294, 2.467, 3.096, 2.937, 2.146, 2.09, 2.468, 2.69, 2.84, 2.82, 2.713, 2.531, 2.392, 2.234, 1.977, 1.871, 1.67, 1.709, 1.809, 2.404, 2.86, 3.108, 3.417, 3.466, 3.433, 3.322, 2.885, 2.159, 2.051, 2.059, 2.023, 2.274
                    ]
                }
            ]
        };

        var xy = [];
        for (var i = 0; i < data.ncols; i++) {
            var xytumor = [];
            for (var j = 0; j < data.nrows; j++) {
                xytumor.push({x: data.rows[0].d[j], y: data.vals[0].d[(i * 1000) + j]});
            }
            xy.push(xytumor);
        }

// This is to have a selector to my svg element
        var svg = d3.select(self.$element[0]).select('svg');
        /*
// These are variables that determine the size of my graph and margins
            WIDTH = 1000,
            HEIGHT = 500,
            MARGINS = {
                top: 20,
                right: 50,
                bottom: 20,
                left: 50
            },
// set up xrange to scale with the data we have
            xRange = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([d3.min(xy[0], function (d) {
                return d.x;
            }), d3.max(xy[0], function (d) {
                return d.x;
            })]),

// set up y range to scale with the data we have
            yRange = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([d3.min(xy[0], function (d) {
                return d.y;
            }), d3.max(xy[0], function (d) {
                return d.y;
            })]),

// Scaling axis and determing space of tickSize
            xAxis = d3.svg.axis()
                .scale(xRange)
                .tickSize(5),
            yAxis = d3.svg.axis()
                .scale(yRange)
                .tickSize(5)
                // Put the ticks on the left side
                .orient('left');
        var vis  = svg.select('.viewport');
        if (vis.empty()) {
            vis = svg.append('g')
                .attr('class', 'viewport');
        }
// append in groups to my svg plot in and add more attributes to make it fit
        vis.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + (HEIGHT - MARGINS.bottom) + ')')
            .call(xAxis);

        vis.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(' + (MARGINS.left) + ',0)')
            .call(yAxis);

// create our line element
        var lineFunc = d3.svg.line()
            .x(function (d) {
                return xRange(d.x);
            })
            .y(function (d) {
                return yRange(d.y);
            })
            .interpolate('linear');

        var bisection = d3.bisector(function (d) {
            return d.x;
        }).left;


        xy.forEach(function (d, i) {
            vis.append('path')
                .attr('d', lineFunc(d))
                .attr('stroke', colorOption[i])
                .attr("stroke-width", 2)
                .attr("id", 'tag' + categories[i])
                .attr('fill', 'none');

            // Add the Legend
            vis.append('text')
                .attr("x", 80 + 80 * i)
                .attr("y", 550)
                .attr("class", "legend")
                .attr("fill", colorOption[i])
                .on("click", function () {
                    var active = d.active ? false : true,
                        newOpacity = active ? 0 : 1;
                    d3.select("#tag" + categories[i])
                        .transition().duration(100)
                        .style("opacity", newOpacity);
                    // Update whether or not the elements are active
                    d.active = active;
                })
                .text(categories[i]);

            d.sort(function (a, b) {
                return a.x - b.x;
            });
        });

        var foci = [];

        for (var i = 0; i < xy.length; i++) {

            var focus = vis.append('g')
                .attr("class", "focus")
                .style("display", "none");
            focus.append("circle")
                .attr("r", 4.5);
            focus.append("text")
                .attr("x", 9)
                .attr("background", "black")
                .attr("dy", ".35em");

            foci.push(focus);
        }


        vis.append('rect')
            .attr("class", "overlay")
            .attr("width", WIDTH)
            .attr("height", HEIGHT)
            .on("mouseover", function () {
                xy.forEach(function (d, i) {
                    foci[i].style("display", null);
                });
            })
            .on("mouseout", function () {
                xy.forEach(function (d, i) {
                    foci[i].style("display", "none");
                });
            })
            .on("mousemove", function () {
                var x0 = xRange.invert(d3.mouse(this)[0]);
                xy.forEach(function (d, i) {
                    var index = bisection(d, x0, 1),
                        d0 = d[index - 1],
                        d1 = d[index],
                        d2 = x0 - d0.x > d1.x - x0 ? d1 : d0;
                    foci[i].attr("transform", "translate(" + xRange(d2.x) + "," + yRange(d2.y) + ")");
                    foci[i].select("text").text(d2.x + ", " + d2.y);
                });
            });
        */
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
goog.require('vs.ui.plugins.svg.ManhattanPlot');
goog.require('vs.ui.plugins.svg.ScatterPlot');
goog.require('vs.ui.plugins.svg.Heatmap');
goog.require('vs.ui.plugins.svg.Demo');
goog.require('vs.ui.plugins.svg.Line');
