/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/22/2015
 * Time: 12:19 PM
 */

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
  'xField': vs.ui.Setting.PredefinedSettings['xField'],
  'yField': vs.ui.Setting.PredefinedSettings['yField'],
  'xBoundaries': vs.ui.Setting.PredefinedSettings['xBoundaries'],
  'yBoundaries': vs.ui.Setting.PredefinedSettings['yBoundaries'],
  'xScale': vs.ui.Setting.PredefinedSettings['xScale'],
  'yScale': vs.ui.Setting.PredefinedSettings['yScale'],
  'cols': vs.ui.Setting.PredefinedSettings['cols'],
  'itemRatio': new vs.ui.Setting({'key':'itemRatio', 'type':vs.ui.Setting.Type.NUMBER, 'defaultValue': 0.015, 'label':'item ratio', 'template':'_slider.html', 'possibleValues': {'min': 0.001, 'max': 0.1, 'step': 0.001}}),
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
    /*var xScale = /!** @type {function(number): number} *!/ (self.optionValue('xScale'));
    var yScale = /!** @type {function(number): number} *!/ (self.optionValue('yScale'));*/
    var xScale = /** @type {function(number): number} */ (self.optionFunctionValue('xScale'));
    var yScale = /** @type {function(number): number} */ (self.optionFunctionValue('yScale'));

    var x = /** @type {string} */ (self.optionValue('xField'));
    var y = /** @type {string} */ (self.optionValue('yField'));

    //var fills = /** @type {function(*):string} */ (self.optionValue('fills'));
    var fills = /** @type {function(*):string} */ (self.optionFunctionValue('fills'));
    var fillOpacity = /** @type {number} */ (self.optionValue('fillOpacity'));
    var strokes = /** @type {function(*):string} */ (self.optionFunctionValue('strokes'));
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
  if (!objects.length) { return; }

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

  var fills = /** @type {function(*):string} */ (this.optionFunctionValue('fills'));
  var strokes = /** @type {function(*):string} */ (this.optionFunctionValue('strokes'));
  var fillOpacity = /** @type {number} */ (this.optionValue('fillOpacity'));
  var strokeThickness = /** @type {number} */ (this.optionValue('strokeThickness'));

  elems
    .style('fill', function(d) { return u.hex2rgba(fills(d['__d__']), fillOpacity); })
    .style('stroke', function(d) { return strokes([d['__d__']]); })
    .style('stroke-width', strokeThickness);
};

vs.ui.plugins.svg.ManhattanPlot.prototype._key = function() {
  var x = /** @type {string} */ (this.optionValue('xField'));
  return function(d) { return d['__d__'] + '-' + d[x]; };
};
//endregion
