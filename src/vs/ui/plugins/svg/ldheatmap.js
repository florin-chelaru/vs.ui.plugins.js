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

vs.ui.plugins.svg.LDHeatmap.prototype.endDraw = function() {

    var self = this;
    var args = arguments;
    return new Promise(function(resolve, reject) {
        var data = self.data;

        if (!data.nrows || !data.ncols) {
            resolve();
            return;
        }

        var svg = d3.select(self.$element[0]).select('svg');

        var viewport = svg.select('.viewport');
        if (viewport.empty()) {
            viewport = svg.append('g')
                .attr('class', 'viewport');
        }

        viewport.append('circle')
            .attr('cx',50)
            .attr('cy',50)
            .attr('r',20)
            .attr('fill','#fe5621')
            .style('stroke','#000000')
            .style('stroke-width',5);


        /*var labels = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

        var width = 900;
        var height = 700;
        var sideLength = 30;
        var dataSize = Math.sqrt(data.length);

        var color = d3.scale.linear()
            .domain([0, 1])
            .range(["white", "darkblue"]);


       /* var getData = function (d) {
            var usableData = [];
            var currentList = [];
            for (j = 0; j < 100; j++) {
                currentList.push(d[j]);
                if (j % 10 == 9) {
                    usableData.push(currentList);
                    currentList = [];
                }
            }
            return usableData;
        };*/

        /*var rects = viewport.selectAll("g")
            .data(data.asDataRowArray())
            .enter()
            .append("g")
            .each(function (d, i) {
                var row = i;
                d3.select(this)
                    .selectAll("rect")
                    .data(function (d) {
                        d.reverse();
                        return d.slice(0, dataSize - row);
                    })
                    .enter()
                    .append("rect")
                    .attr("width", sideLength)
                    .attr("height", sideLength)
                    .attr("x", function (d, i) {
                        return (i) * sideLength;
                    })
                    .attr("y", function (d, i) {
                        return sideLength * (row);
                    })
                    .attr("fill", function (d) {
                        return color(d);
                    });
            });

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

        var key = viewport.selectAll("text")
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
            });

        viewport
            .attr("transform", "translate(" + sideLength / 3 * 2 + "," + 6 * sideLength
                + ")rotate(45," + dataSize * sideLength + "," + dataSize / 2 * sideLength + ")");
*/
        resolve();
    }).then(function() {
        return vs.ui.svg.SvgVis.prototype.endDraw.apply(self, args);
    });

};

