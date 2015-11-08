/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 8/27/2015
 * Time: 2:20 PM
 */

goog.provide('vs.ui.plugins.svg.ScatterPlot');

goog.require('vs.ui');

/*
goog.require('vs.ui.svg.SvgVis');
goog.require('vs.models.DataRow');
*/

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
  'cols': vs.ui.Setting.PredefinedSettings['cols']
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
    vs.ui.svg.SvgVis.prototype.draw.apply(self, args)
      .then(function() {
        /** @type {vs.models.DataSource} */
        var data = self.data;

        // Nothing to draw
        if (!data.nrows) { return; }

        var margins = self.optionValue('margins');
        var xScale = self.optionValue('xScale');
        var yScale = self.optionValue('yScale');
        var cols = self.optionValue('cols');
        var xCol = cols[0];
        var yCol = cols[1];
        var valsLabel = self.optionValue('vals');

        var svg = d3.select(self.$element[0]).select('svg');

        var viewport = svg.select('.viewport');
        if (viewport.empty()) {
          viewport = svg.append('g')
            .attr('class', 'viewport');
        }
        viewport
          .attr('transform', 'translate(' + margins.left + ', ' + margins.top + ')');

        var items = u.array.range(data.nrows).map(function(i) {
          return new vs.models.DataRow(data, i);
        });
        var selection = viewport.selectAll('circle').data(items);

        selection.enter()
          .append('circle');

        selection
          .attr('r', 3)
          .attr('cx', function(d) { return xScale(d.val(xCol, valsLabel)); })
          .attr('cy', function(d) { return yScale(d.val(yCol, valsLabel)); })
          .attr('fill', '#ff6520');

        selection.exit()
          .remove();

        resolve();
      }, reject);
  });
};
