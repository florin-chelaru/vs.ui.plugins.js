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
      function(){ return { 'cols': self.options['cols'], 'mergeField': self.options['mergeField'], 'mergeFields': self.options['mergeFields'] }; },
      function() { self.schedulePreProcessData().then(function() { self.scheduleRedraw(); }); },
      true);
  };

  goog.inherits(ScatterPlot, vs.ui.svg.SvgVis);

  //region Static Methods
  /**
   * @param {vs.ui.Setting} setting
   * @param {Object.<string, *>} options
   * @param $attrs Angular attrs
   * @param {Array.<vs.models.DataSource>} [data]
   * @param {Object.<string, vs.ui.Setting>} [settings]
   * @returns {*}
   */
  ScatterPlot.xLabelDefault = function (setting, options, $attrs, data, settings) {
    var deps = setting['dependencies'];
    if (!settings) { throw new vs.ui.UiException('Settings not provided for "' + setting['key'] + '", which depends on ' + JSON.stringify(deps)); }
    u.each(deps, function(key, dep) {
      if (!(dep in settings)) {
        throw new vs.ui.UiException('Missing dependency for "' + dep + '" in the "xLabel" defaultValue function');
      }
    });
    var xyFields = /** @type {Array.<string>} */ (settings[deps['xyFields']].getValue(options, $attrs, data, settings));
    return xyFields[0];
  };

  /**
   * @param {vs.ui.Setting} setting
   * @param {Object.<string, *>} options
   * @param $attrs Angular attrs
   * @param {Array.<vs.models.DataSource>} [data]
   * @param {Object.<string, vs.ui.Setting>} [settings]
   * @returns {*}
   */
  ScatterPlot.yLabelDefault = function (setting, options, $attrs, data, settings) {
    var deps = setting['dependencies'];
    if (!settings) { throw new vs.ui.UiException('Settings not provided for "' + setting['key'] + '", which depends on ' + JSON.stringify(deps)); }
    u.each(deps, function(key, dep) {
      if (!(dep in settings)) {
        throw new vs.ui.UiException('Missing dependency for "' + dep + '" in the "xLabel" defaultValue function');
      }
    });
    var xyFields = /** @type {Array.<string>} */ (settings[deps['xyFields']].getValue(options, $attrs, data, settings));
    return xyFields[1];
  };
  //endregion

  //region Constants
  /**
   * @type {Object.<string, vs.ui.Setting>}
   */
  ScatterPlot.Settings = u.extend({}, vs.ui.VisHandler.Settings, {
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

      var xyFields = /** @type {Array.<string>} */ (self.optionValue('xyFields'));
      var xCol = xyFields[0];
      var yCol = xyFields[1];

      var margins = /** @type {vs.models.Margins} */ (self.optionValue('margins'));
      var yBoundaries = /** @type {vs.models.Boundaries} */ (self.optionValue('yBoundaries'));
      //var xScale = /** @type {function(number): number} */ (self.optionValue('xScale'));
      //var yScale = /** @type {function(number): number} */ (self.optionValue('yScale'));
      var xScale = /** @type {function(number): number} */ (self.optionFunctionValue('xScale'));
      var yScale = /** @type {function(number): number} */ (self.optionFunctionValue('yScale'));

      var key = /** @type {string} */ (self.optionValue('mergeField'));
      var valueField = /** @type {string} */ (self.optionValue('valueField'));

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
        .attr('cx', function(d) { return xScale(d[xCol] != undefined ? d[xCol][valueField] : yBoundaries.min); })
        .attr('cy', function(d) { return yScale(d[yCol] != undefined ? d[yCol][valueField] : yBoundaries.min); })
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
    if (!objects.length) { return; }

    var mergeField = /** @type {string} */ (this.optionValue('mergeField'));
    var map = u.mapToObject(objects, function(d) { return {'key': d[mergeField], 'value': true}; });
    var elems = viewport.selectAll('.vs-item').filter(function(d) { return d[mergeField] in map; });
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

    var key = /** @type {string} */ (this.optionValue('mergeField'));
    var map = u.mapToObject(objects, function(d) { return {'key': d[key], 'value': true}; });
    var elems = viewport.selectAll('.vs-item').filter(function(d) { return d[key] in map; });
    if (elems.empty()) { return; }

    var fill = /** @type {string} */ (this.optionValue('fill'));
    var stroke = /** @type {string} */ (this.optionValue('stroke'));
    var strokeThickness = /** @type {number} */ (this.optionValue('strokeThickness'));

    var xyFields = /** @type {Array.<string>} */ (this.optionValue('xyFields'));
    var xField = xyFields[0];
    var yField = xyFields[1];

    elems
     .style('stroke-width', strokeThickness)
     .style('fill', function(d) { return d[xField] == undefined || d[yField] == undefined ? 'rgba(170,170,170,0.5)' : fill; })
     .style('stroke', function(d) { return d[xField] == undefined || d[yField] == undefined ? 'rgb(170,170,170)' : stroke; });
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
