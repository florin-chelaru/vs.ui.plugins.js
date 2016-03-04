/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 8/27/2015
 * Time: 2:20 PM
 */

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

      var margins = /** @type {vs.models.Margins} */ (self.optionValue('margins'));
      var yBoundaries = /** @type {vs.models.Boundaries} */ (self.optionValue('yBoundaries'));
      var xScale = /** @type {function(number): number} */ (self.optionValue('xScale'));
      var yScale = /** @type {function(number): number} */ (self.optionValue('yScale'));

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
        .attr('cx', function(d) { return xScale(d[xCol] != undefined ? d[xCol][yVal] : yBoundaries.min); })
        .attr('cy', function(d) { return yScale(d[yCol] != undefined ? d[yCol][yVal] : yBoundaries.min); })
        .attr('fill', function(d) { return d[xCol] == undefined || d[yCol] == undefined ? 'rgba(170,170,170,0.5)' : fill; })
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
   * @param {HTMLElement} viewport Can be canvas, svg, etc.
   * @param {Object} d
   */
  ScatterPlot.prototype.highlightItem = function(viewport, d) {
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
  ScatterPlot.prototype.unhighlightItem = function(viewport, d) {
    /*var v = d3.select(viewport);
     var fill = /!** @type {string} *!/ (this.optionValue('fill'));
     var stroke = /!** @type {string} *!/ (this.optionValue('stroke'));
     var strokeThickness = /!** @type {number} *!/ (this.optionValue('strokeThickness'));
     v.selectAll('.vs-item').data([d], vs.models.DataSource.key)
     .style('stroke', stroke)
     .style('stroke-width', strokeThickness)
     .style('fill', fill);*/
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
