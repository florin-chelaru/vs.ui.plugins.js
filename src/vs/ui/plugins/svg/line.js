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
    'selectStrokeThickness': vs.ui.Setting.PredefinedSettings['selectStrokeThickness']
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

        var xy = [];
        for (var i = 0; i < data.ncols; i++) {
            var xytumor = [];
            for (var j = 0; j < data.nrows; j++) {
                xytumor.push({x: data.rows[0].d[j], y: data.vals[0].d[(i * 1000) + j]});
            }
            xy.push(xytumor);
        }

        var lineFunc = d3.svg.line()
            .x(function (d) {
                return xScale(parseFloat(d.info(row)));
            })
            .y(function (d) {
                return yScale(d.val(cols[0], valsLabel));
            })
            .interpolate('linear');

        var bisection = d3.bisector(function (d) {
            return d.x;
        }).left;


        xy.forEach(function (d, i) {
            vis.append('path')
                .attr('d', lineFunc(d))
                .attr('stroke', colorOption[i])
                .attr("stroke-width", strokeThickness)
                .attr("id", 'tag' + categories[i])
                .attr('fill', 'none');

            // Add the Legend
            /*vis.append('text')
                .attr("x", 80 + 80 * i)
                .attr("y", 550)
                .attr("class", "legend")
                .attr("fill", colorOption[i])
                .on("click", function () {
                    var active = d.active ? false : true,
                        newOpacity = active ? 0 : 1;
                    d3.select("#tag" + categories[i])
                        .transition().duration(100)
                        .style("opacity", newOpacity);
                    // Update whether or not the elements are active
                    d.active = active;
                })
                .text(categories[i]);

            d.sort(function (a, b) {
                return a.x - b.x;
            });*/
        });
        /*
        var foci = [];

        for (var i = 0; i < xy.length; i++) {

            var focus = vis.append('g')
                .attr("class", "focus")
                .style("display", "none");
            focus.append("circle")
                .attr("r", 4.5);
            focus.append("text")
                .attr("x", 9)
                .attr("background", "black")
                .attr("dy", ".35em");

            foci.push(focus);
        }


        vis.append('rect')
            .attr("class", "overlay")
            .attr("width", WIDTH)
            .attr("height", HEIGHT)
            .on("mouseover", function () {
                xy.forEach(function (d, i) {
                    foci[i].style("display", null);
                });
            })
            .on("mouseout", function () {
                xy.forEach(function (d, i) {
                    foci[i].style("display", "none");
                });
            })
            .on("mousemove", function () {
                var x0 = xRange.invert(d3.mouse(this)[0]);
                xy.forEach(function (d, i) {
                    var index = bisection(d, x0, 1),
                        d0 = d[index - 1],
                        d1 = d[index],
                        d2 = x0 - d0.x > d1.x - x0 ? d1 : d0;
                    foci[i].attr("transform", "translate(" + xRange(d2.x) + "," + yRange(d2.y) + ")");
                    foci[i].select("text").text(d2.x + ", " + d2.y);
                });
            });*/

        resolve();
    }).then(function(){
        return vs.ui.svg.SvgVis.prototype.endDraw.apply(self, args);
    });
};
