/**
 * Created by John on 3/1/2016.
 */
goog.provide('vs.ui.plugins.svg.Line');

if (COMPILED) {
  goog.require('vs.ui');
}

/**
 *@constructor
 *@extends vs.ui.svg.SvgVis
 */
vs.ui.plugins.svg.Line = function () {
  vs.ui.svg.SvgVis.apply(this, arguments);
};

goog.inherits(vs.ui.plugins.svg.Line, vs.ui.svg.SvgVis);

/**
 * @type {Object.<string, vs.ui.Setting>}
 */
vs.ui.plugins.svg.Line.Settings = u.extend({}, vs.ui.VisHandler.Settings, {
  'xField': vs.ui.Setting.PredefinedSettings['xField'],
  'yField': vs.ui.Setting.PredefinedSettings['yField'],
  'xBoundaries': vs.ui.Setting.PredefinedSettings['xBoundaries'],
  'yBoundaries': vs.ui.Setting.PredefinedSettings['yBoundaries'],
  //'rows': vs.ui.Setting.PredefinedSettings['rows'],
  //'vals': vs.ui.Setting.PredefinedSettings['vals'],
  //'xBoundaries': new vs.ui.Setting({key: 'xBoundaries', type: 'vs.models.Boundaries', defaultValue: vs.ui.Setting.rowBoundaries, label: 'x boundaries', template: '_boundaries.html' }),
  //'yBoundaries': vs.ui.Setting.PredefinedSettings['yBoundaries'],
  'xScale': vs.ui.Setting.PredefinedSettings['xScale'],
  'yScale': vs.ui.Setting.PredefinedSettings['yScale'],
  'cols': vs.ui.Setting.PredefinedSettings['cols'],
  'itemRatio': new vs.ui.Setting({'key':'itemRatio', 'type':vs.ui.Setting.Type.NUMBER, 'defaultValue': 0.015, 'label':'item ratio', 'template':'_slider.html', 'possibleValues': {'min': 0.001, 'max': 0.1, 'step': 0.001}}),
  //'fill': vs.ui.Setting.PredefinedSettings['fill'],
  'fills': vs.ui.Setting.PredefinedSettings['fills'],
  'fillOpacity': vs.ui.Setting.PredefinedSettings['fillOpacity'],
  'strokes': vs.ui.Setting.PredefinedSettings['strokes'],
  //'stroke': vs.ui.Setting.PredefinedSettings['stroke'],
  'strokeThickness': vs.ui.Setting.PredefinedSettings['strokeThickness'],
  'selectFill': vs.ui.Setting.PredefinedSettings['selectFill'],
  'selectStroke': vs.ui.Setting.PredefinedSettings['selectStroke'],
  'selectStrokeThickness': vs.ui.Setting.PredefinedSettings['selectStrokeThickness'],
  // Settings to be added:
  // Color
  /*'colorOptions': new vs.ui.Setting({
    'key': 'colorOptions',
    'type': vs.ui.Setting.Type.ARRAY,
    'defaultValue': ['blue', 'red']
  }),*/
  'interpolation': new vs.ui.Setting({
    'key': 'interpolation',
    'type': vs.ui.Setting.Type.STRING,
    'defaultValue': 'linear'
  })


  // Creating a filter for interpolate
  //'interpolate' : new vs.ui.Setting({key:'interpolation', 'type':vs.ui.Setting.Type.STRING, 'defaultValue': 'linear', label:'item ratio', template:'_boundaries.html'})
});

Object.defineProperties(vs.ui.plugins.svg.Line.prototype, {
  'settings': {
    get: /** @type {function (this:vs.ui.plugins.svg.Line)} */ (function () {
      return vs.ui.plugins.svg.Line.Settings;
    })
  }
});
/**
 * @override
 * @returns(Promise)
 */
vs.ui.plugins.svg.Line.prototype.endDraw = function () {
  var self = this;
  var args = arguments;

  return new Promise(function (resolve, reject) {
    var data = self.data;

    var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));
    data = data.filter(function(d) { return cols.indexOf(d.id) >= 0; });

    // Nothing to draw
    if (!data.length || !vs.models.DataSource.allDataIsReady(data)) { resolve(); return; }

    //var colorOptions = (self.optionValue('colorOptions'));
    var margins = /** @type {vs.models.Margins} */ (self.optionValue('margins'));
    var xScale = /** @type {function(number): number} */ (self.optionFunctionValue('xScale'));
    var yScale = /** @type {function(number): number} */ (self.optionFunctionValue('yScale'));
    var x = /** @type {string} */ (self.optionValue('xField'));
    var y = /** @type {string} */ (self.optionValue('yField'));
    var fills = /** @type {function(*):string} */ (self.optionFunctionValue('fills'));
    var fillOpacity = /** @type {number} */ (self.optionValue('fillOpacity'));
    var strokes = /** @type {function(*):string} */ (self.optionFunctionValue('strokes'));
    var strokeThickness = /** @type {number} */ (self.optionValue('strokeThickness'));
    var itemRatio = /** @type {number} */ (self.optionValue('itemRatio'));
    var width = /** @type {number} */ (self.optionValue('width'));
    var height = /** @type {number} */ (self.optionValue('height'));
    var itemRadius = Math.min(Math.abs(width), Math.abs(height)) * itemRatio;
    var svg = d3.select(self.$element[0]).select('svg');
    var interpolation = (self.optionValue('interpolation'));

    var vis = svg.select('.viewport');
    if (vis.empty()) {
      vis = svg.append('g')
        .attr('class', 'viewport');
    }

    vis.attr('transform', 'translate(' + margins.left + ', ' + margins.top + ')');

    // var items = data.asDataRowArray();
    var items = u.fast.concat(u.fast.map(data, function(d) { return d.d; }));

    // The way highlight works is that there are circle items on each of the data points
    // The opacity starts at 0 but becomes 1 when the mouse is over the data point
    var highlight = vis.selectAll('circle').data(items, self._key());

    var dataMap = u.mapToObject(self['data'], function(d) { return {'key': d['id'], 'value': d}});
    highlight.enter()
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
    highlight
      .attr('r', itemRadius)
      .attr('cx', function (d) { return xScale(parseFloat(d[x])); })
      .attr('cy', function (d) { return yScale(parseFloat(d[y])); })
      .style('fill', function(d) { return u.hex2rgba(fills(d['__d__']), fillOpacity); })
      .style('stroke', function(d) { return strokes([d['__d__']]); })
      .style('stroke-width', strokeThickness)
      .style('opacity', 0);

    // The variable pos is used to show the x-coordinate that the mouse is currently on
    var pos = vis.selectAll('.coords').data(items, self._key());
    pos.enter()
      .append('text')
      .attr('class', 'coords');
    pos
      .attr('x', function (d) { return 9 + xScale(parseFloat(d[x])); })
      .attr('y', function (d) { return -9 + yScale(parseFloat(d[y])); })
      .attr("background", "blue")
      .attr("dy", ".35em")
      .attr("opacity", 0);

    // This for loop is to draw out each datarow and color them differently

    var line = d3.svg.line()
      .x(function (d) {
        return xScale(parseFloat(d[x]));
      })
      .y(function (d) {
        return yScale(parseFloat(d[y]));
      })
      .interpolate(interpolation);

    var paths = vis.selectAll('.line').data(data.map(function(d) { return d.d; }));
    paths
      .enter()
      .append('path')
      .attr('class', 'line');

    paths
      .attr('d', line)
      .attr('stroke', function(d, i) { return fills(data[i]['id']); })
      .attr("stroke-width", strokeThickness)
      .attr('fill', 'none');

    highlight.exit().remove();

    resolve();
  }).then(function () {
    return vs.ui.svg.SvgVis.prototype.endDraw.apply(self, args);
  });
};

/**
 * @param {vs.ui.BrushingEvent} e
 * @param {Array.<Object>} objects
 */
vs.ui.plugins.svg.Line.prototype.highlightItem = function (e, objects) {
  /*var v = d3.select(viewport);
  var row = (/!** @type {Array.<string>} *!/ (this.optionValue('rows')))[0];
  var cols = /!** @type {Array.<string>} *!/ (this.optionValue('cols'));
  var selectFill = /!** @type {string} *!/ (this.optionValue('selectFill'));
  var selectStroke = /!** @type {string} *!/ (this.optionValue('selectStroke'));
  var selectStrokeThickness = /!** @type {number} *!/ (this.optionValue('selectStrokeThickness'));
  var valsLabel = /!** @type {string} *!/ (this.optionValue('vals'));

  // After getting the item we make the overlying circle become opaque and thus visible
  var items = v.selectAll('.vs-item').data([d], vs.models.DataSource.key);
  items
    .style('opacity', 1)
    .style('stroke', selectStroke)
    .style('stroke-width', selectStrokeThickness)
    .style('fill', selectFill);

  v.selectAll('.coords').data([d], vs.models.DataSource.key)
    .text(d.info(row) + ", " + d.val(cols[0], valsLabel))
    .attr('opacity', 1);*/

  var x = /** @type {string} */ (this.optionValue('xField'));
  var y = /** @type {string} */ (this.optionValue('yField'));

  var viewport = d3.select(this.$element[0]).select('svg').select('.viewport');
  if (viewport.empty()) { return; }
  if (!objects.length) { return; }

  var key = this._key();
  var map = u.mapToObject(objects, function(d) { return {'key': key(d), 'value': true}; });
  var elems = viewport.selectAll('.vs-item').filter(function(d) { return key(d) in map; });
  var coords = viewport.selectAll('.coords').filter(function(d) { return key(d) in map; });
  if (elems.empty()) { return; }

  var selectFill = /** @type {string} */ (this.optionValue('selectFill'));
  var selectStroke = /** @type {string} */ (this.optionValue('selectStroke'));
  var selectStrokeThickness = /** @type {number} */ (this.optionValue('selectStrokeThickness'));

  // After getting the item we make the overlying circle become opaque and thus visible
  elems
    .style('opacity', 1)
    .style('stroke', selectStroke)
    .style('stroke-width', selectStrokeThickness)
    .style('fill', selectFill);

  coords
    .text(function(d) { return parseFloat(d[x]).toFixed(2) + ", " + parseFloat(d[y]).toFixed(2); })
    .attr('opacity', 1);

  $(elems[0]).appendTo($(viewport[0]));
};

/**
 * @param {vs.ui.BrushingEvent} e
 * @param {Array.<Object>} objects
 */
vs.ui.plugins.svg.Line.prototype.unhighlightItem = function(e, objects) {
  /*var v = d3.select(viewport);
  var fill = /!** @type {string} *!/ (this.optionValue('fill'));
  var stroke = /!** @type {string} *!/ (this.optionValue('stroke'));
  var strokeThickness = /!** @type {number} *!/ (this.optionValue('strokeThickness'));
  v.selectAll('.vs-item').data([d], vs.models.DataSource.key)
    .style('stroke', stroke)
    .style('opacity', 0)
    .style('stroke-width', strokeThickness)
    .style('fill', fill);

  v.selectAll('.coords').data([d], vs.models.DataSource.key)
    .attr('opacity', 0);*/


  var viewport = d3.select(this.$element[0]).select('svg').select('.viewport');
  if (viewport.empty()) { return; }

  var key = this._key();
  var map = u.mapToObject(objects, function(d) { return {'key': key(d), 'value': true}; });
  var elems = viewport.selectAll('.vs-item').filter(function(d) { return key(d) in map; });
  var coords = viewport.selectAll('.coords').filter(function(d) { return key(d) in map; });
  if (elems.empty()) { return; }

  var fills = /** @type {function(*):string} */ (this.optionFunctionValue('fills'));
  var strokes = /** @type {function(*):string} */ (this.optionFunctionValue('strokes'));
  var fillOpacity = /** @type {number} */ (this.optionValue('fillOpacity'));
  var strokeThickness = /** @type {number} */ (this.optionValue('strokeThickness'));

  elems
    .style('opacity', 0);

  coords
    .attr('opacity', 0);
};

vs.ui.plugins.svg.Line.prototype._key = function() {
  var x = /** @type {string} */ (this.optionValue('xField'));
  return function(d) { return d['__d__'] + '-' + d[x]; };
};