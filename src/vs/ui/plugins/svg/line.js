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
        var selection = vis.selectAll('path').data([0]);
        var selection2 = vis.selectAll('path2').data([0]);
        var xBox1 = vis.selectAll('g1').data([0]);
        var focus1 = vis.selectAll('G1').data([0]);
        var focus2 = vis.selectAll('G2').data([0]);

        focus1.enter()
            .append('g')
            .attr("class", "focus")
            .style("display", "none");
        focus1.append("circle")
            .attr("r", 4.5)
            .attr("fill", "blue")
            .attr("stroke: #9bffa9");
        focus1.append("text")
            .attr("x", 9)
            .attr("background", "black")
            .attr("dy", ".35em");

        focus2.enter()
            .append('g')
            .attr("class", "focus")
            .style("display", "none");
        focus2.append("circle")
            .attr("r", 4.5)
            .attr("fill", "red")
            .attr("stroke: #9bffa9");
        focus2.append("rect")
            .attr()
        focus2.append("text")
            .attr("x", 9)
            .attr("background", "black")
            .attr("dy", ".35em");

        selection.enter()
            .append('path')
            .attr('stroke', colorOption[0])
            .attr("stroke-width", strokeThickness)
            .attr("id", 'tag' + categories[0])
            .attr('fill', 'none');

        selection.attr('d', chooseLine(0)(items));

        selection2.enter()
            .append('path')
            .attr('stroke', colorOption[1])
            .attr("stroke-width", strokeThickness)
            .attr("id", 'tag' + categories[1])
            .attr('fill', 'none');

        selection2.attr('d', chooseLine(1)(items));

        xBox1.enter()
            .append('rect')
            .data(items);


        xBox1.attr("fill", "none")
            .attr("pointer-events", "all")
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", function () {
                focus1.style("display",null);
                focus2.style("display",null);
            })
            .on("mouseout", function () {
                focus1.style("display","none");
                focus2.style("display","none");
            })
            .on("mousemove", function (d, i) {

                var x0 = xScale.invert(d3.mouse(this)[0]);
                var y1 = items.map(function(item) { return item.val(cols[0], valsLabel); });
                var y2 = items.map(function(item) { return item.val(cols[1], valsLabel); });

                if(x0 > 550000){
                    focus1.select("text").attr("x", -100);
                    focus2.select("text").attr("x", -100);
                } else {
                    focus1.select("text").attr("x", 9);
                    focus2.select("text").attr("x", 9);
                }
                var xArray = items.map(function(item) { return parseFloat(item.info(row)); });
                var index1 = d3.bisectLeft(xArray,x0),
                    d0 = xArray[index1 - 1],
                    d1 = xArray[index1],
                    d2 = x0 - d0 > d1 - x0 ? d1 : d0;

                console.log(index1);

                    if(d2 == d0){
                        var showIndex = index1 - 1;
                    } else {
                        var showIndex = index1;
                    }

                focus1.attr("transform", "translate(" + xScale(d2) + "," + yScale(y1[showIndex]) + ")");
                focus1.select("text").text(d2 + ", " + y1[showIndex]);

                var index2 = d3.bisectLeft(xArray,x0),
                    h0 = xArray[index1 - 1],
                    h1 = xArray[index1],
                    h2 = x0 - h0 > h1 - x0 ? h1 : h0;

                focus2.attr("transform", "translate(" + xScale(h2) + "," + yScale(y2[showIndex]) + ")");
                focus2.select("text").text(h2 + ", " + y2[showIndex]);

            });

        selection.exit().remove();
        selection2.exit().remove();
        focus1.exit().remove();
        focus2.exit().remove();
        xBox1.exit().remove();


        resolve();
    }).then(function(){
        return vs.ui.svg.SvgVis.prototype.endDraw.apply(self, args);
    });
};
