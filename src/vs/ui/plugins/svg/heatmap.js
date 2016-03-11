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
        return u.fast.map(cols, function(col) { return m[col]; });
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
    if (!objects.length) { return; }

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
      Promise.all(u.fast.map(self.data, function(d) { return d.ready; })).then(function() {
        var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));
        var xVal = /** @type {string} */ (self.optionValue('xVal'));

        var data = u.fast.map(cols, function(col) { return self.data[u.array.indexOf(self.data, function(d) {return d.id == col;})]; });
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

  /**
   * @private
   */
  Heatmap.prototype[_key] = function() {
    var key = /** @type {string} */ (this.optionValue('xVal'));
    return function(d, i) {
      return d == undefined ? i : (d['__d__'] + '-' + d[key]);
    }
  };
  //endregion

  return Heatmap;
})();
