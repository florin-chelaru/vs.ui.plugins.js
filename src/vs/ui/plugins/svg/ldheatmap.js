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
    'selectStrokeThickness': vs.ui.Setting.PredefinedSettings['selectStrokeThickness'],
    'rotation': new vs.ui.Setting({'key': 'rotation', 'type': vs.ui.Setting.Type.BOOLEAN})
});

Object.defineProperties(vs.ui.plugins.svg.LDHeatmap.prototype, {
    'settings': { get: /** @type {function (this:vs.ui.plugins.svg.Heatmap)} */ (function() { return vs.ui.plugins.svg.LDHeatmap.Settings; })}
});


vs.ui.plugins.svg.LDHeatmap.prototype.endDraw = function() {

    var self = this;
    var args = arguments;
    return new Promise(function(resolve, reject) {
        var data = self.data;

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
        var rotation = /** @type {boolean} */ (self.optionValue('rotation'));


        var xScale = d3.scale.linear()
            .domain([0, data.ncols])
            .range([0, width - margins.left - margins.right-width/25]);

        var yScale = d3.scale.linear()
            .domain([0, data.nrows])
            .range([0, height - margins.top - margins.bottom]);

        var sideLengthScale = d3.scale.linear()
            .domain([0, data.nrows+1])
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
        var labels = data.rows[0]['d'];

        var selection = viewport.selectAll('g').data(items, vs.models.DataSource.key);

        selection.enter()
            .append('g')
            .attr('class', 'vs-item');

        if (rotation==false) {
            selection
                .attr('transform', function (d, i) {
                    return 'translate(0,' + yScale(i) + ')';
                })
                .each(function (d, i) {
                    col = [];
                    for (j = items.length - 1; j >= i; j--) {
                        col.push(cols[j]);
                    }
                    var cells = d3.select(this).selectAll('rect').data(col);
                    cells
                        .enter()
                        .append('rect')
                        .attr('class', 'vs-cell');
                    cells
                        .attr('x', function (col, j) {
                            return xScale(j);
                        })
                        .attr('width', xScale(1))
                        .attr('height', yScale(1))
                        .attr('fill', function (col) {
                            return colorScale(d.val(col, valsLabel));
                        });
                });

            var labelsGroup = svg.select('.labels');
            if (labelsGroup.empty()) {
                labelsGroup = svg.append('g').attr('class', 'labels');
            }

            var key = labelsGroup.selectAll("text")
                .data(items, vs.models.DataSource.key);

            key.enter()
                .append("text");

            key
                .attr("x", function(d,i) { return (items.length-i +.5) * xScale(1);})
                .attr("y", function(d,i) { return yScale(1) * (i+2)})
                .text(function(d,i) { return labels[i];});

            key.exit()
                .remove();

        }

        if (rotation == true) {
            var sideLength = Math.min(xScale(1) / Math.sqrt(2), sideLengthScale(1) * Math.sqrt(2));
            selection
                .attr('transform', function (d, i) {
                    return 'translate(0,' + sideLength * (i) + ')';
                })
                .each(function (d, i) {
                    col = [];
                    for (j = items.length - 1; j >= i; j--) {
                        col.push(cols[j]);
                    }
                    var cells = d3.select(this).selectAll('rect').data(col);
                    cells
                        .enter()
                        .append('rect')
                        .attr('class', 'vs-cell');
                    cells
                        .attr('x', function (col, j) {
                            return sideLength * j;
                        })
                        .attr('width', sideLength)
                        .attr('height', sideLength)
                        .attr('fill', function (col) {
                            return colorScale(d.val(col, valsLabel));
                        });
                });
            var translateX = width / 2 - sideLength * items.length / Math.sqrt(2);
            var translateY = sideLength*items.length/Math.sqrt(2) - sideLength*items.length;

            viewport
                .attr("transform", "translate(" + translateX + "," + translateY + ") rotate(45, 0, " + sideLength * items.length + ")");

            var labelsGroup = svg.select('.labels');
            if (labelsGroup.empty()) {
                labelsGroup = svg.append('g').attr('class', 'labels');
            }


            var key = labelsGroup.selectAll("text")
                .data(items, vs.models.DataSource.key);

            key.enter()
                .append("text");

            key
                .attr("x", function(d,i) { return (items.length-i) * xScale(1);})
                .attr("y", function(d,i) { return sideLength * items.length / Math.sqrt(2) + sideLength})
                .text(function(d,i) { return labels[i];});

            key.exit()
                .remove();
        }

        selection.exit()
            .remove();


        resolve();
    }).then(function() {
        return vs.ui.svg.SvgVis.prototype.endDraw.apply(self, args);
    });

};

vs.ui.plugins.svg.LDHeatmap.prototype.highlightItem = function(viewport, d) {
    var v = d3.select(viewport);
    var selectFill = /** @type {string} */ (this.optionValue('selectFill'));
    var selectStroke = /** @type {string} */ (this.optionValue('selectStroke'));
    var selectStrokeThickness = /** @type {number} */ (this.optionValue('selectStrokeThickness'));
    var valsLabel = /** @type {string} */ (this.optionValue('vals'));
    var yBoundaries = /** @type {vs.models.Boundaries} */ (this.optionValue('yBoundaries'));
    var cols = /** @type {Array.<string>} */ (this.optionValue('cols'));
    var margins = /** @type {vs.models.Margins} */ (this.optionValue('margins'));
    var width = /** @type {number} */ (this.optionValue('width'));
    var height = /** @type {number} */ (this.optionValue('height'));
    var rotation = /** @type {boolean} */ (this.optionValue('rotation'));

    var xScale = d3.scale.linear()
        .domain([0, cols.length])
        .range([0, width - margins.left - margins.right-width/25]);

    var yScale = d3.scale.linear()
        .domain([0, d.data.nrows])
        .range([0, height - margins.top - margins.bottom]);

    var sideLengthScale = d3.scale.linear()
        .domain([0, d.data.nrows+1])
        .range([0, height - margins.top - margins.bottom]);

    var colorScale = d3.scale.linear()
        .domain([yBoundaries.min, yBoundaries.max])
        .range(['#ffffff', selectFill]);

    v.on('mousemove', function () {
        mousePos = d3.mouse(this);
    });

    if (rotation==true) {
        var itemHeight = Math.min(xScale(1) / Math.sqrt(2), sideLengthScale(1) * Math.sqrt(2));
        var itemWidth = itemHeight;
    }
    else {
        var itemHeight = (height - margins.top - margins.bottom) / d.data.nrows;
        var itemWidth = xScale(1);
        var column = Math.floor(mousePos[0] / xScale(1));
    }

    var minHeight = Math.max(itemHeight, 25); // a selected row will increase size to this height if necessary
    var heightScale = minHeight / itemHeight;
    var dif = minHeight - itemHeight;
    var items = v.selectAll('.vs-item').data([d], vs.models.DataSource.key);

    v.append('rect')
        .attr('class', 'vs-item-border')
        .attr('x', -selectStrokeThickness)
        .attr('y', d.index * itemHeight - selectStrokeThickness - 0.5 * dif)
        .attr('width', (d.data.nrows - d.index) * itemWidth + 2*selectStrokeThickness)
        .attr('height', dif + itemHeight + 2 * selectStrokeThickness) // dif + itemHeight
        .style('stroke', selectStroke)
        .style('stroke-width', 4*selectStrokeThickness)
        .style('fill', 'none');

    if (rotation==true) { //Column rectangle
        v.append('rect')
            .attr('class', 'vs-item-border')
            .attr('x', column * itemWidth)
            .attr('y', -selectStrokeThickness)
            .attr('width', itemWidth)
            .attr('height', (d.data.ncols - column) * itemHeight)
            .style('stroke', selectStroke)
            .style('stroke-width', 4 * selectStrokeThickness)
            .style('fill', 'none');
    }

    items
        .attr('transform', function(d, i) {
            return 'translate(0, ' + (itemHeight * d.index - dif * 0.5) + ') scale(1, ' + heightScale + ')';
        });

    $(items[0]).appendTo($(viewport));
};

/**
 * @param {HTMLElement} viewport Can be canvas, svg, etc.
 * @param {vs.models.DataRow} d
 */

vs.ui.plugins.svg.LDHeatmap.prototype.unhighlightItem = function(viewport, d) {
    var v = d3.select(viewport);
    var fill = /** @type {string} */ (this.optionValue('fill'));
    var yBoundaries = /** @type {vs.models.Boundaries} */ (this.optionValue('yBoundaries'));
    var valsLabel = /** @type {string} */ (this.optionValue('vals'));
    var margins = /** @type {vs.models.Margins} */ (this.optionValue('margins'));
    var width = /** @type {number} */ (this.optionValue('width'));
    var height = /** @type {number} */ (this.optionValue('height'));
    var cols = /** @type {Array.<string>} */ (this.optionValue('cols'));
    var rotation = /** @type {boolean} */ (this.optionValue('rotation'));

    var xScale = d3.scale.linear()
        .domain([0, cols.length])
        .range([0, width - margins.left - margins.right-width/25]);
    var yScale = d3.scale.linear()
        .domain([0, d.data.nrows])
        .range([0, height - margins.top - margins.bottom]);
    var sideLengthScale = d3.scale.linear()
        .domain([0, d.data.nrows+1])
        .range([0, height - margins.top - margins.bottom]);
    var colorScale = d3.scale.linear()
        .domain([yBoundaries.min, yBoundaries.max])
        .range(['#ffffff', fill]);

    if (rotation==true) {
        var sideLength = Math.min(xScale(1) / Math.sqrt(2), sideLengthScale(1) * Math.sqrt(2));
    }

    v.selectAll('.vs-item').data([d], vs.models.DataSource.key)
        .each(function() {
            var item = d3.select(this);
            item.selectAll('.vs-cell')
                .attr('fill', function(col) { return colorScale(d.val(col, valsLabel)); });
        })
        .attr('transform', function(d, i) {
            if (rotation == true) {
                return 'translate(0,' + sideLength * d.index + ')';
            }
            else {
                return 'translate(0,' + yScale(d.index) + ')';
            }
        });
    v.selectAll('.vs-item-border').remove();
};

