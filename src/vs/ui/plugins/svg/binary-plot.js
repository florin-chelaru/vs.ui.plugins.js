/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 3/12/2016
 * Time: 12:22 PM
 */


//region goog...
goog.provide('vs.ui.plugins.svg.BinaryPlot');

if (COMPILED) {
  goog.require('vs.ui');
}
//endregion

/**
 * @constructor
 * @extends vs.ui.svg.SvgVis
 */
vs.ui.plugins.svg.BinaryPlot = function() {
  vs.ui.svg.SvgVis.apply(this, arguments);
};

goog.inherits(vs.ui.plugins.svg.BinaryPlot, vs.ui.svg.SvgVis);

//region Constants
/**
 * @type {Object.<string, vs.ui.Setting>}
 */
vs.ui.plugins.svg.BinaryPlot.Settings = u.extend({}, vs.ui.VisHandler.Settings, {
  'yVal': vs.ui.Setting.PredefinedSettings['yVal'],
  'yBoundaries': vs.ui.Setting.PredefinedSettings['yBoundaries'],
  'separator': new vs.ui.Setting({'key': 'separator', 'type':vs.ui.Setting.Type.FUNCTION, 'defaultValue': function() { return function(x) { return !!x; }; }, 'hidden': true}),
  'cols': vs.ui.Setting.PredefinedSettings['cols'],
  'fills': vs.ui.Setting.PredefinedSettings['fills'],
  'fillOpacity': vs.ui.Setting.PredefinedSettings['fillOpacity'],
  'strokes': vs.ui.Setting.PredefinedSettings['strokes'],
  'strokeThickness': vs.ui.Setting.PredefinedSettings['strokeThickness'],
  'selectFill': vs.ui.Setting.PredefinedSettings['selectFill'],
  'selectStroke': vs.ui.Setting.PredefinedSettings['selectStroke'],
  'selectStrokeThickness': vs.ui.Setting.PredefinedSettings['selectStrokeThickness'],
  'shape': new vs.ui.Setting({'key': 'shape', 'type':vs.ui.Setting.Type.STRING, 'defaultValue': "\uf111", 'hidden': true}),
  'shapeSize': new vs.ui.Setting({'key': 'shapeSize', 'type':vs.ui.Setting.Type.NUMBER, 'defaultValue': "20", 'hidden': true})
});
//endregion

//region Properties
Object.defineProperties(vs.ui.plugins.svg.BinaryPlot.prototype, {
  'settings': { get: /** @type {function (this:vs.ui.plugins.svg.BinaryPlot)} */ (function() { return vs.ui.plugins.svg.BinaryPlot.Settings; })}
});
//endregion

//region Methods
/**
 * @override
 */
vs.ui.plugins.svg.BinaryPlot.prototype.endDraw = function() {
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
    var y = /** @type {string} */ (self.optionValue('yVal'));

    var fills = /** @type {function(*):string} */ (self.optionValue('fills'));
    var fillOpacity = /** @type {number} */ (self.optionValue('fillOpacity'));
    var strokes = /** @type {function(*):string} */ (self.optionValue('strokes'));
    var strokeThickness = /** @type {number} */ (self.optionValue('strokeThickness'));
    var shapeSize = /** @type {number} */ (self.optionValue('shapeSize'));
    var width = /** @type {number} */ (self.optionValue('width'));
    var height = /** @type {number} */ (self.optionValue('height'));
    var shape = /** @type {string} */ (self.optionValue('shape'));
    var separator = /** @type {function(*):boolean} */ (self.optionValue('separator'));


    var svg = d3.select(self.$element[0]).select('svg');
    var viewport = svg.select('.viewport');
    if (viewport.empty()) {
      viewport = svg.append('g')
        .attr('class', 'viewport');
    }
    viewport
      .attr('transform', 'translate(' + margins.left + ', ' + margins.top + ')');

    var items = u.fast.concat(u.fast.map(data, function(d) { return d.d; }));
    var selection = viewport.selectAll('.vs-item').data(items);

    /** @type {Object.<string, vs.models.DataSource>} */
    var dataMap = u.mapToObject(self['data'], function(d) { return {'key': d['id'], 'value': d}});
    selection.enter()
      .append('text')
      .attr('text-anchor', 'start')
      .attr('alignment-baseline', 'text-before-edge')
      .attr('font-family', 'FontAwesome')
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

    var selectionLocations = new Array(items.length);

    selection
      .attr('font-size', shapeSize + 'px')
      .text(shape)
      .attr('fill', function(d) { return separator(d[y]) ? u.hex2rgba(fills(d['__d__']), fillOpacity) : '#ffffff'; })
      .attr('stroke', function(d) { return separator(d[y]) ? 'rgba(255,255,255,0)' : u.hex2rgba(strokes(d['__d__']), fillOpacity); })
      .attr('stroke-width', strokeThickness);

    var xOffset = 0;
    var yOffset = 0;
    var startPositions = [];

    self.$element.find('.vs-item')
      .each(function(i) {
        startPositions.push({'x':xOffset, 'y':yOffset});
        var box = this.getBBox();
        var w = box.width;
        xOffset += w + 5;
        if (xOffset + w >= width - margins.left - margins.right) {
          xOffset = 0;
          yOffset += box.height + 5;
        }
      });

    selection
      .attr('x', function(d, i) { return startPositions[i]['x']; })
      .attr('y', function(d, i) { return startPositions[i]['y']; });

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
vs.ui.plugins.svg.BinaryPlot.prototype.highlightItem = function(e, objects) {
};

/**
 * @param {vs.ui.BrushingEvent} e
 * @param {Array.<Object>} objects
 */
vs.ui.plugins.svg.BinaryPlot.prototype.unhighlightItem = function(e, objects) {
};
//endregion

