/**
 * Created by Siahpoosh on 3/1/16.
 */

goog.provide('vs.ui.plugins.svg.LDHeatmap');

if (COMPILED) {
    goog.require('vs.ui');
}

vs.ui.plugins.svg.LDHeatmap = function() {
    vs.ui.svg.SvgVis.apply(this, arguments);
};

goog.inherits(vs.ui.plugins.svg.LDHeatmap, vs.ui.svg.SvgVis);

vs.ui.plugins.svg.LDHeatmap.Settings = u.extend({}, vs.ui.VisHandler.Settings, {
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

Object.defineProperties(vs.ui.plugins.svg.LDHeatmap.prototype, {
    'settings': { get: /** @type {function (this:vs.ui.plugins.svg.Heatmap)} */ (function() { return vs.ui.plugins.svg.LDHeatmap.Settings; })}
});


vs.ui.plugins.svg.LDHeatmap.prototype.endDraw = function() {

    var self = this;
    var args = arguments;
    return new Promise(function(resolve, reject) {
        var data = self.data;

        /*var dataArray = {
            "nrows": 10,
            "ncols": 10,
            "rows": [
                {"label": "id", "d": ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]}
            ],
            "cols": [
                {"label": "id", "d": ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]}
            ],
            "vals":[
                {"label": "correlation", "boundaries": {"min": 0, "max": 1}, "d": [1, 0.599, 0.858, 0.5491, 0.521, 0.2598, 0.3858, 0.823, 0.6673, 0.3471, 0.599, 1, 0.5979, 0.5942, 0.8378, 0.5906, 0.9196, 0.708, 0.397, 0.9149, 0.858, 0.5979, 1, 0.6013, 0.3863, 0.21067, 0.5769, 0.18874, 0.48545, 0.7273, 0.5491, 0.5942, 0.6013, 1, 0.8163, 0.9261, 0.16882, 0.444, 0.6611, 0.02657, 0.521, 0.8378, 0.3863, 0.8163, 1, 0.3869, 0.223, 0.5229, 0.952, 0.177, 0.2598, 0.5906, 0.21067, 0.9261, 0.3869, 1, 0.06935, 0.13751, 0.539, 0.7744, 0.3858, 0.9196, 0.5769, 0.16882, 0.223, 0.06935, 1, 0.567, 0.6484, 0.2659, 0.823, 0.708, 0.18874, 0.444, 0.5229, 0.13751, 0.567, 1, 0.7609, 0.2278, 0.6673, 0.397, 0.48545, 0.6611, 0.952, 0.539, 0.6484, 0.7609, 1, 0.65442, 0.3471, 0.9149, 0.7273, 0.026576, 0.17701, 0.7744, 0.26593, 0.2278, 0.6544, 1]}
            ]
        };*/

        if (!data.nrows || !data.ncols) {
            resolve();
            return;
        }

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

        var color = d3.scale.linear()
            .domain([0, 1])
            .range(["white", "darkblue"]);

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

        var labels = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

        var sideLength = 30;
        //var data = dataArray["vals"][0]["d"];
        //var dataSize = Math.sqrt(data.length);

        var items = data.asDataRowArray();
        var selection = viewport.selectAll('g').data(items, vs.models.DataSource.key);
        console.log(items);
        /*var getData = function (d) {
            var usableData = [];
            var currentList = [];
            var i=0;
            while (i<100) {
                currentList.push(d[i]);
                if (i % 10 == 9) {
                    usableData.push(currentList);
                    currentList = [];
                }
                i=i+1;
            }
            return usableData;
        };*/

        //var selection = viewport.selectAll('g').data(getData(data));


        selection.enter()
            .append('g')
            .attr('class', 'vs-item');

        selection
            .attr('transform', function(d, i) { return 'translate(0,' + yScale(i) + ')'; })
            .each(function(d, i) {
                var row = i;
                var cells = d3.select(this).selectAll('rect').data(cols);
                /*.data(function (d) {
                        d.reverse();
                        console.log(d);
                        return d.slice(0, dataSize - row);
                    });*/
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
                    .attr('fill', function(d) { return color(d.val(col, valsLabel)); });
            });

        selection.exit()
            .remove();



        /*
        var rowSelector = viewport.append("rect")
            .attr("x", 0)
            .attr("id", "row")
            .attr("class", "border")
            .attr("y", 0)
            .attr("width", (dataSize - 1) * sideLength)
            .attr("height", sideLength)
            .style("fill", "none")
            .style("stroke-width", sideLength / 10);

        var columnSelector = viewport.append("rect")
            .attr("x", 0)
            .attr("id", "column")
            .attr("class", "border")
            .attr("y", 0)
            .attr("width", sideLength)
            .attr("height", (dataSize - 1) * sideLength)
            .style("fill", "none")
            .style("stroke-width", sideLength / 10);

        viewport.on('mousemove', function () {
            var mousePos = d3.mouse(this);
            if ((mousePos[0] + mousePos[1]) < dataSize * sideLength) {
                var row = (mousePos[1] - mousePos[1] % sideLength) / sideLength;
                var column = (mousePos[0] - mousePos[0] % sideLength) / sideLength;
                d3
                    .select("#row")
                    .attr("y", function () {
                        return row * sideLength;
                    })
                    .style("stroke", "black")
                    .attr("width", function () {
                        return (dataSize - row) * sideLength;
                    });
                d3
                    .select("#column")
                    .attr("x", function () {
                        return column * sideLength;
                    })
                    .style("stroke", "black")
                    .attr("height", function () {
                        return (dataSize - column) * sideLength;
                    })
            }
            else {
                d3
                    .selectAll(".border")
                    .style("stroke", "none");
            }
        });
*/
        /*var key = viewport.selectAll("text")
            .data(labels)
            .enter()
            .append("text")
            .attr("x", function (d, i) {
                return (dataSize - i) * sideLength + sideLength / 4;
            })
            .attr("y", function (d, i) {
                return (i + 1) * sideLength;
            })
            .text(function (d, i) {
                return d;
            });*/

        /*viewport
            .attr("transform", "translate(" + sideLength / 3 * 2 + "," + 6 * sideLength
                + ")rotate(45," + dataSize * sideLength + "," + dataSize / 2 * sideLength + ")");
*/
        resolve();
    }).then(function() {
        return vs.ui.svg.SvgVis.prototype.endDraw.apply(self, args);
    });

};

