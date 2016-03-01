goog.provide('vs.ui.plugins.svg.Demo');

if(COMPILED){
    goog.require('vs.ui');
}

/**
 * @constructor
 * @extends vs.ui.svg.SvgVis
 */

vs.ui.plugins.svg.Demo = function(){
    vs.ui.svg.SvgVis.apply(this, arguments);
};

goog.inherits(vs.ui.plugins.svg.Demo, vs.ui.svg.SvgVis);

/**
 *@override
 *@returns{Promise}
 */
vs.ui.plugins.svg.Demo.prototype.endDraw = function() {
    var self = this;
    var args = arguments;
    return new Promise(function(resolve, reject) {
        /**@type{vs.models.DataSource}*/
        var data = self.data;

        // Nothing to draw
        if (!data.nrows || !data.ncols){ resolve(); return; }

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

        resolve();
    }).then(function(){
        return vs.ui.svg.SvgVis.prototype.endDraw.apply(self, args);
    });
}; /**
 *@override
 *@returns{Promise}
 */
vs.ui.plugins.svg.Demo.prototype.endDraw = function() {
    var self = this;
    var args = arguments;
    return new Promise(function(resolve, reject) {
        /**@type{vs.models.DataSource}*/
        var data = self.data;

        // Nothing to draw
        if (!data.nrows || !data.ncols){ resolve(); return; }

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

        resolve();
    }).then(function(){
        return vs.ui.svg.SvgVis.prototype.endDraw.apply(self, args);
    });
};