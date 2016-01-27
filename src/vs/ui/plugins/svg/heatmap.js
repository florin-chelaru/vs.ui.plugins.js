/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 1/25/2016
 * Time: 7:26 PM
 */

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
