/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 8/27/2015
 * Time: 2:20 PM
 */

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
