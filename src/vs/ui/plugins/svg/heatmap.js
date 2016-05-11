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
      function(){ return { 'dataSources': self.options['dataSources'], 'xVal': self.options['xVal'], 'mergeFields': self.options['mergeFields'] }; },
      function() { self.schedulePreProcessData().then(function() { self.scheduleRedraw(); }); },
      true);
  };

  goog.inherits(Heatmap, vs.ui.svg.SvgVis);


  //region Constants
  /**
   * @type {Object.<string, vs.ui.Setting>}
   */
  Heatmap.Settings = u.extend({}, vs.ui.VisHandler.Settings, {
    'mergeField': new vs.ui.Setting({'key':'mergeField', 'type':vs.ui.Setting.Type['DATA_ROW_LABEL'], 'defaultValue':vs.ui.Setting.firstRowsLabel, 'label':'merge field', 'template':'_categorical.html'}),
    'valueField': vs.ui.Setting.PredefinedSettings['yField'].copy({'key': 'valueField', 'label': 'value field'}),
    'mergeFields': vs.ui.Setting.PredefinedSettings['mergeCols'].copy({'key':'mergeFields', 'dependencies': {'xCol': 'mergeField'}}),
    'xScale': vs.ui.Setting.PredefinedSettings['xScale'],
    'yScale': vs.ui.Setting.PredefinedSettings['yScale'],
    'xBoundaries': vs.ui.Setting.PredefinedSettings['xBoundaries'].copy({'dependencies': {'xField': 'valueField'}}),
    'yBoundaries': vs.ui.Setting.PredefinedSettings['yBoundaries'].copy({'dependencies': {'yField': 'valueField'}}),
    'dataSources': vs.ui.Setting.PredefinedSettings['cols'].copy({'key': 'dataSources', 'label': 'data sources', 'defaultValue':function(setting, options, $attrs, data) { return u.fast.map(data, function(d) { return d['id']; }); }}),
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
      var dataSources = /** @type {Array.<string>} */ (self.optionValue('dataSources'));
      var valueField = /** @type {string} */ (self.optionValue('valueField'));
      var width = /** @type {number} */ (self.optionValue('width'));
      var height = /** @type {number} */ (self.optionValue('height'));
      var yBoundaries = /** @type {vs.models.Boundaries} */ (self.optionValue('yBoundaries'));
      var fill = /** @type {string} */ (self.optionValue('fill'));

      var hexAlpha = u.toHexAlpha(fill);

      var xScale = d3.scale.linear()
        .domain([0, data.d.length])
        .range([0, width - margins.left - margins.right]);

      var yScale = d3.scale.linear()
        .domain([0, dataSources.length])
        .range([0, height - margins.top - margins.bottom]);

      var colorScale = d3.scale.linear()
        .domain([yBoundaries.min, yBoundaries.max])
        .range(['#ffffff', hexAlpha['hex']]);

      var svg = d3.select(self.$element[0]).select('svg');

      var viewport = svg.select('.viewport');
      if (viewport.empty()) {
        viewport = svg.append('g')
          .attr('class', 'viewport');
      }
      viewport
        .attr('transform', 'translate(' + margins.left + ', ' + margins.top + ')');

      var items = u.fast.concat(u.fast.map(data.d, function(m) {
        return u.fast.map(dataSources, function(col) { return m[col]; });
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
        .attr('x', function(d, i) { return xScale(Math.floor(i / dataSources.length)); })
        .attr('y', function(d, i) { return yScale(i % dataSources.length); })
        .attr('width', cellWidth)
        .attr('height', cellHeight)
        .attr('fill', function(d) { return d ? colorScale(d[valueField]) : '#aaaaaa'; })
        .attr('fill-opacity', hexAlpha['alpha']);

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
    var valueField = /** @type {string} */ (this.optionValue('valueField'));

    var hexAlpha = u.toHexAlpha(selectFill);

    var colorScale = d3.scale.linear()
      .domain([yBoundaries.min, yBoundaries.max])
      .range(['#ffffff', hexAlpha['hex']]);

    elems.attr('fill', function(d) { return colorScale(d[valueField]); })
      .attr('fill-opacity', hexAlpha['alpha']);

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
    var valueField = /** @type {string} */ (this.optionValue('valueField'));

    var hexAlpha = u.toHexAlpha(fill);

    var colorScale = d3.scale.linear()
      .domain([yBoundaries.min, yBoundaries.max])
      .range(['#ffffff', hexAlpha['hex']]);

    elems.attr('fill', function(d) { return colorScale(d[valueField]); })
      .attr('fill-opacity', hexAlpha['alpha']);
  };

  Heatmap.prototype.preProcessData = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      Promise.all(u.fast.map(self.data, function(d) { return d.ready; })).then(function() {
        var dataSources = /** @type {Array.<string>} */ (self.optionValue('dataSources'));
        var mergeField = /** @type {string} */ (self.optionValue('mergeField'));

        var data = u.fast.map(dataSources, function(col) { return self.data[u.array.indexOf(self.data, function(d) {return d.id == col;})]; });
        if (data.length < 1) {
          self[_merged] = null;
          resolve();
        }
        if (data.length == 1) {
          self[_merged] = data[0];
          resolve();
        }

        var mergeFields = /** @type {function(string, Array.<vs.models.DataSource>):vs.models.DataSource} */ (self.optionValue('mergeFields'));

        self[_merged] = mergeFields(mergeField, data);
        resolve();
      });
    });
  };

  /**
   * @private
   */
  Heatmap.prototype[_key] = function() {
    var key = /** @type {string} */ (this.optionValue('mergeField'));
    return function(d, i) {
      return d == undefined ? i : (d['__d__'] + '-' + d[key]);
    }
  };
  //endregion

  return Heatmap;
})();
