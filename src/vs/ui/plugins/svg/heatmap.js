/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 1/25/2016
 * Time: 7:26 PM
 */

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
      var stroke = /** @type {string} */ (self.optionValue('stroke'));
      var strokeThickness = /** @type {number} */ (self.optionValue('strokeThickness'));

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

      var items = data.d;
      var selection = viewport.selectAll('g').data(items, JSON.stringify);

      selection.enter()
        .append('g')
        .attr('class', 'vs-item');

      selection
        .attr('transform', function(d, i) { return 'translate(' + xScale(i) + ',0)'; })
        .each(function(d, i) {
          var cells = d3.select(this).selectAll('rect').data(cols.map(function(col) { return d[col]; }));
          cells
            .enter()
            .append('rect')
            .attr('class', 'vs-cell');
          cells
            .attr('y', function(col, j) { return yScale(j); })
            //.attr('y', yScale(i))
            .attr('x', 0)
            .attr('width', xScale(1))
            .attr('height', yScale(1))
            .attr('fill', function(c) { return c ? colorScale(c[yVal]) : '#aaaaaa'; });
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
   * @param {Object} d
   */
  Heatmap.prototype.highlightItem = function(viewport, d) {
    /*var v = d3.select(viewport);
    var selectFill = /!** @type {string} *!/ (this.optionValue('selectFill'));
    var selectStroke = /!** @type {string} *!/ (this.optionValue('selectStroke'));
    var selectStrokeThickness = /!** @type {number} *!/ (this.optionValue('selectStrokeThickness'));
    var valsLabel = /!** @type {string} *!/ (this.optionValue('vals'));
    var yBoundaries = /!** @type {vs.models.Boundaries} *!/ (this.optionValue('yBoundaries'));

    var margins = /!** @type {vs.models.Margins} *!/ (this.optionValue('margins'));
    var width = /!** @type {number} *!/ (this.optionValue('width'));
    var height = /!** @type {number} *!/ (this.optionValue('height'));

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
    $(items[0]).appendTo($(viewport));*/
  };

  /**
   * @param {HTMLElement} viewport Can be canvas, svg, etc.
   * @param {Object} d
   */
  Heatmap.prototype.unhighlightItem = function(viewport, d) {
    /*var v = d3.select(viewport);
    var fill = /!** @type {string} *!/ (this.optionValue('fill'));
    var yBoundaries = /!** @type {vs.models.Boundaries} *!/ (this.optionValue('yBoundaries'));
    var valsLabel = /!** @type {string} *!/ (this.optionValue('vals'));
    var margins = /!** @type {vs.models.Margins} *!/ (this.optionValue('margins'));
    var width = /!** @type {number} *!/ (this.optionValue('width'));
    var height = /!** @type {number} *!/ (this.optionValue('height'));
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
    v.selectAll('.vs-item-border').remove();*/
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

  return Heatmap;
})();
