/**
 * Created by Siahpoosh on 3/1/16.
 */


goog.require('vs.ui.plugins.svg.LDHeatmap');

goog.exportSymbol('vs.ui.plugins.svg.LDHeatmap', vs.ui.plugins.svg.ScatterPlot);
goog.exportProperty(vs.ui.plugins.svg.ScatterPlot.prototype, 'endDraw', vs.ui.plugins.svg.ScatterPlot.prototype.endDraw);
