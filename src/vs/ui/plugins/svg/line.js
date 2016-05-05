/**
 * Created by John on 3/1/2016.
 */
goog.provide('vs.ui.plugins.svg.Line');

if(COMPILED){
    goog.require('vs.ui');
}

/**
 *@constructor
 *@extends vs.ui.svg.SvgVis
 */
vs.ui.plugins.svg.Line = function(){
    vs.ui.svg.SvgVis.apply(this, arguments);
};

goog.inherits(vs.ui.plugins.svg.Line, vs.ui.svg.SvgVis);

/**
 * @type {Object.<string, vs.ui.Setting>}
 */
vs.ui.plugins.svg.Line.Settings = u.extend({}, vs.ui.VisHandler.Settings, {
    'rows': vs.ui.Setting.PredefinedSettings['rows'],
    'vals': vs.ui.Setting.PredefinedSettings['vals'],
    'xBoundaries': new vs.ui.Setting({key:'xBoundaries', type:'vs.models.Boundaries', defaultValue:vs.ui.Setting.rowBoundaries, label:'x boundaries', template:'_boundaries.html'}),
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
    'selectStrokeThickness': vs.ui.Setting.PredefinedSettings['selectStrokeThickness'],

    // Creating a filter for interpolate
    //'interpolate' : new vs.ui.Setting({key:'interpolation', 'type':vs.ui.Setting.Type.STRING, 'defaultValue': 'linear', label:'item ratio', template:'_boundaries.html'})
});

Object.defineProperties(vs.ui.plugins.svg.Line.prototype, {
    'settings': { get: /** @type {function (this:vs.ui.plugins.svg.Line)} */ (function() { return vs.ui.plugins.svg.Line.Settings; })}
});
/**
 * @override
 * @returns(Promise)
 */
vs.ui.plugins.svg.Line.prototype.endDraw = function() {
    var self = this;
    var args = arguments;

    return new Promise(function(resolve, reject) {
        var colorOption = ['blue', 'red'];
        var categories = ["tumor", "healthy"];

        var data = self.data;

        var margins = /** @type {vs.models.Margins} */ (self.optionValue('margins'));
        var xScale = /** @type {function(number): number} */ (self.optionValue('xScale'));
        var yScale = /** @type {function(number): number} */ (self.optionValue('yScale'));
        var cols = /** @type {Array.<string>} */ (self.optionValue('cols'));
        var row = (/** @type {Array.<string>} */ (self.optionValue('rows')))[0];
        var valsLabel = /** @type {string} */ (self.optionValue('vals'));
        var fill = /** @type {string} */ (self.optionValue('fill'));
        var stroke = /** @type {string} */ (self.optionValue('stroke'));
        var strokeThickness = /** @type {number} */ (self.optionValue('strokeThickness'));
        var itemRatio = /** @type {number} */ (self.optionValue('itemRatio'));
        var width = /** @type {number} */ (self.optionValue('width'));
        var height = /** @type {number} */ (self.optionValue('height'));
        var itemRadius = Math.min(Math.abs(width), Math.abs(height)) * itemRatio;
        var svg = d3.select(self.$element[0]).select('svg');

        var vis  = svg.select('.viewport');
        if (vis.empty()) {
            vis = svg.append('g')
                .attr('class', 'viewport');
        }

        vis.attr('transform', 'translate(' + margins.left + ', ' + margins.top + ')');

        // Function to create a line graph based on the data, also determines interpolation
        var chooseLine = function(i){
            return d3.svg.line()
                .x(function (d) {
                    return xScale(parseFloat(d.info(row)));
                })
                .y(function (d) {
                    return yScale(d.val(cols[i], valsLabel));
                })
                .interpolate('linear');
        }


        var items = data.asDataRowArray();
        var highlight = vis.selectAll('circle').data(items, vs.models.DataSource.key);
        highlight.enter()
            .append('circle')
            .attr('class','vs-item');
        highlight
            .attr('r', itemRadius)
            .attr('cx', function(d) { return xScale(parseFloat(d.info(row))); })
            .attr('cy', function(d) { return yScale(d.val(cols[0], valsLabel)); })
            .attr('fill', 'none')
            .style('stroke', stroke)
            .style('opacity', 0)
            .style('stroke-width', strokeThickness);
        var pos = vis.selectAll('coords').data(items, vs.models.DataSource.key);

        pos.enter()
            .append('text')
            .attr('class', 'coords');
        pos
            .attr("x", 9)
            .attr("background", "blue")
            .attr("dy", ".35em")
            .attr("opacity", 0);

        var selections = [];
        for(var col = 0; col < cols.length; col++){
            var numStr = col.toString();
            var fullName = "path";

            if(col != 0){
                fullName = "path".concat(numStr);
            }

            selections[col] = vis.selectAll(fullName).data([0]);


            selections[col].enter()
                .append('path');

            selections[col]
                .attr('d', chooseLine(col)(items))
                .attr('stroke', colorOption[col])
                .attr("stroke-width", strokeThickness)
                .attr("id", 'tag' + categories[col])
                .attr('fill', 'none');

            selections[col].exit().remove();
        }


        highlight.exit().remove();

        resolve();
    }).then(function(){
        return vs.ui.svg.SvgVis.prototype.endDraw.apply(self, args);
    });
};

/**
 * @param {HTMLElement} viewport Can be canvas, svg, etc.
 * @param {vs.models.DataRow} d
 */
vs.ui.plugins.svg.Line.prototype.highlightItem = function(viewport, d) {
    var v = d3.select(viewport);
    var row = (/** @type {Array.<string>} */ (this.optionValue('rows')))[0];
    var selectFill = /** @type {string} */ (this.optionValue('selectFill'));
    var selectStroke = /** @type {string} */ (this.optionValue('selectStroke'));
    var selectStrokeThickness = /** @type {number} */ (this.optionValue('selectStrokeThickness'));
    var items = v.selectAll('.vs-item').data([d], vs.models.DataSource.key);
    items
        .style('opacity', 1)
        .style('stroke', selectStroke)
        .style('stroke-width', selectStrokeThickness)
        .style('fill', selectFill);

    v.selectAll('.coords').data([d], vs.models.DataSource.key)
        .text(d.info(row) + ", ")
        .attr('opacity', 1);
};

/**
 * @param {HTMLElement} viewport Can be canvas, svg, etc.
 * @param {vs.models.DataRow} d
 */
vs.ui.plugins.svg.Line.prototype.unhighlightItem = function(viewport, d) {
    var v = d3.select(viewport);
    var fill = /** @type {string} */ (this.optionValue('fill'));
    var stroke = /** @type {string} */ (this.optionValue('stroke'));
    var strokeThickness = /** @type {number} */ (this.optionValue('strokeThickness'));
    v.selectAll('.vs-item').data([d], vs.models.DataSource.key)
        .style('stroke', stroke)
        .style('opacity', 0)
        .style('stroke-width', strokeThickness)
        .style('fill', fill);

    v.selectAll('.coords').data([d], vs.models.DataSource.key)
        .attr('opacity', 0);

};