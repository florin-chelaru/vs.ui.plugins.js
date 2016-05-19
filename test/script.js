/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 8/27/2015
 * Time: 10:11 AM
 */

goog.require('goog.string.format');

u.log.VERBOSE = 'info';

var main = angular.module('main', ['vs']);

main.config(['configurationProvider', function(configuration) {
  configuration.customize({
    visualizations: {
      scatterplot: {
        canvas: 'vs.ui.plugins.canvas.ScatterPlot',
        svg: 'vs.ui.plugins.svg.ScatterPlot',
        default: 'svg'
      },
      manhattan: {
        svg: 'vs.ui.plugins.svg.ManhattanPlot',
        canvas: 'vs.ui.plugins.canvas.ManhattanPlot',
        default: 'svg'
      },
      ldheatmap: {
        svg: 'vs.ui.plugins.svg.LDHeatmap'
      },
      heatmap: {
        svg: 'vs.ui.plugins.svg.Heatmap'
      }
    },
    parallel: {
      nthreads: 16,
      worker: '/vis-ui/test/worker.js'
    }
  })
}]);

main.controller('vs.MainController', ['$scope', '$templateCache', function($scope, $templateCache) {
  this.controller = {
    dataContexts: [
      u.reflection.wrap({
        'name': 'LD',
        'children': [],
        'dataChanged': new u.Event(),
        'visualizations': [
          {
            'construct': {
              'render': 'canvas',
              'type': 'scatterplot'
            },
            'options': {
              'doubleBuffer': true,
              'axisBoundaries': {},
              'x': 10,
              'y': 50,
              'width': 250,
              'height': 250,
              'margins': {
                'left': 10,
                'right': 10,
                'bottom': 10,
                'top': 10
              },
              'cols': [0, 1],
              'vals': 'correlation',
              'selectStrokeThickness': 4
            },
            'decorators': {
              'cls': [
                'vs-window',
                'vs-resizable',
                'vs-movable',
                'vs-loader'
              ],
              'elem': [
                {
                  'cls': 'vs-axis',
                  'options': {
                    'type': 'x',
                    'ticks': 10
                  }
                },
                {
                  'cls': 'vs-axis',
                  'options': {
                    'type': 'y'
                  }
                },
                {
                  'cls': 'vs-grid',
                  'options': {
                    'type': 'x',
                    'ticks': 10
                  }
                },
                {
                  'cls': 'vs-grid',
                  'options': {
                    'type': 'y'
                  }
                },
                {
                  'cls': 'vs-brushing'
                }
              ]
            }
          },
          {
            'construct': {
              'render': 'svg',
              'type': 'scatterplot'
            },
            'options': {
              'doubleBuffer': false,
              'axisBoundaries': {},
              'x': 270,
              'y': 50,
              'width': 250,
              'height': 250,
              'margins': {
                'left': 10,
                'right': 10,
                'bottom': 10,
                'top': 10
              },
              'cols': [0, 1],
              'vals': 'correlation',
              'fill': 'rgba(30,96,212,0.3)',
              'stroke': 'rgba(30,96,212,1)',
              'strokeThickness': 1
            },
            'decorators': {
              'cls': [
                'vs-window',
                'vs-resizable',
                'vs-movable',
                'vs-loader'
              ],
              'elem': [
                {
                  'cls': 'vs-axis',
                  'options': {
                    'type': 'x',
                    'ticks': 10
                  }
                },
                {
                  'cls': 'vs-axis',
                  'options': {
                    'type': 'y'
                  }
                },
                {
                  'cls': 'vs-grid',
                  'options': {
                    'type': 'x',
                    'ticks': 10
                  }
                },
                {
                  'cls': 'vs-grid',
                  'options': {
                    'type': 'y'
                  }
                },
                {
                  'cls': 'vs-brushing'
                }
              ]
            }
          },
          {
            'construct': {
              'render': 'canvas',
              'type': 'manhattan'
            },
            'options': {
              'doubleBuffer': true,
              //'xBoundaries': {'min': 1000, 'max': 100000},
              'yBoundaries': {'min': 0, 'max': 1},
              'x': 530,
              'y': 50,
              'width': 400,
              'height': 115,
              'fill': 'rgba(255,96,50,0.3)',
              'stroke': 'rgba(255,96,50,1)',
              'strokeThickness': 1,
              'itemRatio': 0.03,
              'selectFill': 'rgba(30,96,212,1)',
              'selectStroke': '#ff0000',
              'selectStrokeThickness': 4,
              'margins': {
                'left': 10,
                'right': 10,
                'bottom': 10,
                'top': 10
              },
              'cols': [0, 1],
              'vals': 'correlation',
              'rows': ['start', 'end']
            },
            'decorators': {
              'cls': [
                'vs-window',
                'vs-resizable',
                'vs-movable',
                'vs-loader'
              ],
              'elem': [
                {
                  'cls': 'vs-axis',
                  'options': {
                    'type': 'x',
                    'ticks': 10
                  }
                },
                {
                  'cls': 'vs-axis',
                  'options': {
                    'type': 'y'
                  }
                },
                {
                  'cls': 'vs-grid',
                  'options': {
                    'type': 'x',
                    'ticks': 10
                  }
                },
                {
                  'cls': 'vs-grid',
                  'options': {
                    'type': 'y'
                  }
                },
                {
                  'cls': 'vs-brushing'
                }
              ]
            }
          },
          {
            'construct': {
              'render': 'svg',
              'type': 'manhattan'
            },
            'options': {
              'yBoundaries': {'min': 0, 'max': 1},
              'x': 530,
              'y': 185,
              'width': 400,
              'height': 115,
              'itemRatio': 0.03,
              'margins': {
                'left': 10,
                'right': 10,
                'bottom': 10,
                'top': 10
              },
              'cols': [0, 1],
              'vals': 'correlation',
              'rows': ['start', 'end']
            },
            'decorators': {
              'cls': [
                'vs-window',
                'vs-resizable',
                'vs-movable',
                'vs-loader'
              ],
              'elem': [
                {
                  'cls': 'vs-axis',
                  'options': {
                    'type': 'x',
                    'ticks': 10
                  }
                },
                {
                  'cls': 'vs-axis',
                  'options': {
                    'type': 'y'
                  }
                },
                {
                  'cls': 'vs-grid',
                  'options': {
                    'type': 'x',
                    'ticks': 10
                  }
                },
                {
                  'cls': 'vs-grid',
                  'options': {
                    'type': 'y'
                  }
                },
                {
                  'cls': 'vs-brushing'
                }
              ]
            }
          },
          {
            'construct': {
              'render': 'svg',
              'type': 'heatmap'
            },
            'options': {
              'xBoundaries': {'min': 1000, 'max': 100000},
              'yBoundaries': {'min': 0, 'max': 1},
              'x': 10,
              'y': 320,
              'width': 500,
              'height': 400,
              'margins': {
                'left': 10,
                'right': 10,
                'bottom': 10,
                'top': 10
              },
              'cols': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              'vals': 'correlation',
              'rows': ['start', 'end'],
              'fill': 'rgb(30,96,212)'
            },
            'decorators': {
              'cls': [
                'vs-window',
                'vs-resizable',
                'vs-movable',
                'vs-loader'
              ],
              'elem': [
                {
                  'cls': 'vs-brushing'
                }
              ]
            }
          },
          {
            construct: {
              render: 'svg',
              type: 'ldheatmap'
            },
            options: {
              xBoundaries: {min: 1000, max: 100000},
              yBoundaries: {min: 0, max: 1},
              x: 530,
              y: 320,
              width: 400,
              height: 200,
              margins: {
                left: 10,
                right: 10,
                bottom: 10,
                top: 10
              },
              cols: u.array.range(10),
              vals: 'v0',
              rows: ['start', 'end'],
              'fill': 'rgb(30,96,212)',
              rotation: true
            },
            decorators: {
              cls: [
                'vs-window',
                'vs-resizable',
                'vs-movable'
              ],
              elem: [
                {
                  'cls': 'vs-brushing'
                }
              ]
            }
          }
        ],

        'data': u.reflection.wrap({
          "name": "LD",
          "nrows": 10,
          "ncols": 10,
          "rows": [
            {"label": "id", "d": ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]},
            {"label": "chr", "d": ["chr1", "chr1", "chr1", "chr1", "chr1", "chr1", "chr1", "chr1", "chr1", "chr1"]},
            {"label": "start", "d": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]},
            {"label": "end", "d": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
          ],
          "cols": [
            {"label": "id", "d": ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]},
            {"label": "chr", "d": ["chr1", "chr1", "chr1", "chr1", "chr1", "chr1", "chr1", "chr1", "chr1", "chr1"]},
            {"label": "start", "d": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]},
            {"label": "end", "d": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
          ],
          "vals": [
            {
              "label": "correlation",
              "boundaries": {"min": 0, "max": 1},
              d: [1, 0.599, 0.858, 0.5491, 0.521, 0.2598, 0.3858, 0.823, 0.6673, 0.3471, 0.599, 1, 0.5979, 0.5942, 0.8378, 0.5906, 0.9196, 0.708, 0.397, 0.9149, 0.858, 0.5979, 1, 0.6013, 0.3863, 0.21067, 0.5769, 0.18874, 0.48545, 0.7273, 0.5491, 0.5942, 0.6013, 1, 0.8163, 0.9261, 0.16882, 0.444, 0.6611, 0.02657, 0.521, 0.8378, 0.3863, 0.8163, 1, 0.3869, 0.223, 0.5229, 0.952, 0.177, 0.2598, 0.5906, 0.21067, 0.9261, 0.3869, 1, 0.06935, 0.13751, 0.539, 0.7744, 0.3858, 0.9196, 0.5769, 0.16882, 0.223, 0.06935, 1, 0.567, 0.6484, 0.2659, 0.823, 0.708, 0.18874, 0.444, 0.5229, 0.13751, 0.567, 1, 0.7609, 0.2278, 0.6673, 0.397, 0.48545, 0.6611, 0.952, 0.539, 0.6484, 0.7609, 1, 0.65442, 0.3471, 0.9149, 0.7273, 0.026576, 0.17701, 0.7744, 0.26593, 0.2278, 0.6544, 1]
            }
          ],
          'query': [
            new vs.models.Query({'target': 'rows', 'targetLabel': 'chr', 'test': '==', 'testArgs': 'chr1'}),
            //new vs.models.Query({'target': 'rows', 'targetLabel': 'start', 'test': '<', 'testArgs': '10000'}),
            new vs.models.Query({'target': 'rows', 'targetLabel': 'start', 'test': '<', 'testArgs': '10'}),
            new vs.models.Query({'target': 'rows', 'targetLabel': 'end', 'test': '>=', 'testArgs': '0'})
          ]
        }, vs.models.DataSource)
      }, vs.ui.DataHandler)
    ]
  };
  /*this.controller = {
    dataContexts: [
      u.reflection.wrap({
        name: 'Genetic Variants',
        children: [],
        dataChanged: new u.Event(),
        visualizations: [
          {
            construct: {
              render: 'svg',
              type: 'ldheatmap'
            },
            options: {
              xBoundaries: {min: 1000, max: 100000},
              yBoundaries: {min: 0, max: 1},
              x: 430,
              y: 290,
              width: 400,
              height: 200,
              margins: {
                left: 10,
                right: 10,
                bottom: 10,
                top: 10
              },
              cols: u.array.range(10),
              vals: 'v0',
              rows: ['start', 'end']
            },
            decorators: {
              cls: [
                'vs-window',
                'vs-resizable',
                'vs-movable'
              ],
              elem: [
              ]
            }
          },
          {
            construct: {
              render: 'svg',
              type: 'heatmap'
            },
            options: {
              xBoundaries: {min: 1000, max: 100000},
              yBoundaries: {min: 0, max: 1},
              x: 20,
              y: 20,
              width: 400,
              height: 200,
              margins: {
                left: 10,
                right: 10,
                bottom: 10,
                top: 10
              },
              cols: u.array.range(10),
              vals: 'v0',
              rows: ['start', 'end']
            },
            decorators: {
              cls: [
                'vs-window',
                'vs-resizable',
                'vs-movable'
              ],
              elem: [
              ]
            }
          }
        ],
        data: u.reflection.wrap({
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
        }, vs.models.DataSource)
      }, vs.ui.DataHandler)
      /!*u.reflection.wrap({
        name: 'Genetic Variants',
        children: [],
        dataChanged: new u.Event(),
        visualizations: [
          {
            construct: {
              render: 'canvas',
              type: 'scatterplot'
            },
            options: {
              doubleBuffer: true,
              axisBoundaries: {},
              x: 10,
              y: 60,
              width: 200,
              height: 200,
              margins: {
                left: 10,
                right: 10,
                bottom: 10,
                top: 10
              },
              cols: [0, 0],
              vals: 'dna methylation'
            },
            decorators: {
              cls: [
                'vs-window',
                'vs-resizable',
                'vs-movable'
              ],
              elem: [
                {
                  cls: 'vs-axis',
                  options: {
                    type: 'x',
                    ticks: 10
                  }
                },
                {
                  cls: 'vs-axis',
                  options: {
                    type: 'y'
                  }
                },
                {
                  cls: 'vs-grid',
                  options: {
                    type: 'x',
                    ticks: 10
                  }
                },
                {
                  cls: 'vs-grid',
                  options: {
                    type: 'y'
                  }
                }
              ]
            }
          },
          {
            construct: {
              render: 'svg',
              type: 'scatterplot'
            },
            options: {
              doubleBuffer: false,
              axisBoundaries: {},
              x: 220,
              y: 60,
              width: 200,
              height: 200,
              margins: {
                left: 10,
                right: 10,
                bottom: 10,
                top: 10
              },
              cols: [0, 1],
              vals: 'dna methylation'
            },
            decorators: {
              cls: [
                'vs-window',
                'vs-resizable',
                'vs-movable'
              ],
              elem: [
                {
                  cls: 'vs-axis',
                  options: {
                    type: 'x',
                    ticks: 10
                  }
                },
                {
                  cls: 'vs-axis',
                  options: {
                    type: 'y'
                  }
                },
                {
                  cls: 'vs-grid',
                  options: {
                    type: 'x',
                    ticks: 10
                  }
                },
                {
                  cls: 'vs-grid',
                  options: {
                    type: 'y'
                  }
                }
              ]
            }
          },
          {
            construct: {
              render: 'canvas',
              type: 'manhattan'
            },
            options: {
              doubleBuffer: true,
              xBoundries: {min: 1000, max: 100000},
              yBoundaries: {min: 0, max: 1},
              x: 430,
              y: 60,
              width: 400,
              height: 200,
              margins: {
                left: 10,
                right: 10,
                bottom: 10,
                top: 10
              },
              cols: [0, 1],
              vals: 'v0',
              rows: ['start', 'end']
            },
            decorators: {
              cls: [
                'vs-window',
                'vs-resizable',
                'vs-movable'
              ],
              elem: [
                {
                  cls: 'vs-axis',
                  options: {
                    type: 'x',
                    ticks: 10
                  }
                },
                {
                  cls: 'vs-axis',
                  options: {
                    type: 'y'
                  }
                },
                {
                  cls: 'vs-grid',
                  options: {
                    type: 'x',
                    ticks: 10
                  }
                },
                {
                  cls: 'vs-grid',
                  options: {
                    type: 'y'
                  }
                }
              ]
            }
          },
          {
            construct: {
              render: 'svg',
              type: 'manhattan'
            },
            options: {
              xBoundries: {min: 1000, max: 100000},
              yBoundaries: {min: 0, max: 1},
              x: 430,
              y: 290,
              width: 400,
              height: 200,
              margins: {
                left: 10,
                right: 10,
                bottom: 10,
                top: 10
              },
              cols: [0, 1],
              vals: 'v0',
              rows: ['start', 'end']
            },
            decorators: {
              cls: [
                'vs-window',
                'vs-resizable',
                'vs-movable'
              ],
              elem: [
                {
                  cls: 'vs-axis',
                  options: {
                    type: 'x',
                    ticks: 10
                  }
                },
                {
                  cls: 'vs-axis',
                  options: {
                    type: 'y'
                  }
                },
                {
                  cls: 'vs-grid',
                  options: {
                    type: 'x',
                    ticks: 10
                  }
                },
                {
                  cls: 'vs-grid',
                  options: {
                    type: 'y'
                  }
                }
              ]
            }
          }
        ],
        data: u.reflection.wrap({
          query: [
            new vs.models.Query({target: 'rows', targetLabel: 'chr', test: '==', testArgs: 'chr1'}),
            new vs.models.Query({target: 'rows', targetLabel: 'start', test: '<', testArgs: 20}),
            new vs.models.Query({target: 'rows', targetLabel: 'end', test: '>=', testArgs: 10})
          ],
          nrows: 2,
          ncols: 4,
          cols: [
            { label: 'name', d: ['florin','suze','wouter','apas'] },
            { label: 'id', d: [1,2,3,4] },
            { label: 'age', d: [30,24,35,22] },
            { label: 'sex', d: ['m','f','m','m'] }
          ],
          rows: [
            { label: 'name', d: ['gene1','gene2'] },
            { label: 'id', d: [1,2] },
            { label: 'start', d: [10,16] },
            { label: 'end', d: [15,19] },
            { label: 'chr', d: ['chr1','chr1'] }
          ],
          vals: [
            {
              label: 'gene expression',
              d: [0.67, 0.309, 0.737, 0.688, 0.011, 0.303, 0.937, 0.06],
              boundaries: { min: 0, max: 1 }
            },
            {
              label: 'dna methylation',
              d: [0.625, 0.998, 0.66, 0.595, 0.254, 0.849, 0.374, 0.701],
              boundaries: { min: 0, max: 1 }
            }
          ]
        }, vs.models.DataSource)
      }, vs.ui.DataHandler),
      u.reflection.wrap({
        name: 'Other data',
        children: [],
        dataChanged: new u.Event(),
        visualizations: [
          {
            construct: {
              render: 'canvas',
              type: 'scatterplot'
            },
            options: {
              doubleBuffer: true,
              axisBoundaries: {},
              x: 10,
              y: 60,
              width: 200,
              height: 200,
              margins: {
                left: 10,
                right: 10,
                bottom: 10,
                top: 10
              },
              cols: [0, 0],
              vals: 'dna methylation'
            },
            decorators: {
              cls: [
                'vs-window',
                'vs-resizable',
                'vs-movable'
              ],
              elem: [
                {
                  cls: 'vs-axis',
                  options: {
                    type: 'x',
                    ticks: 10
                  }
                },
                {
                  cls: 'vs-axis',
                  options: {
                    type: 'y'
                  }
                },
                {
                  cls: 'vs-grid',
                  options: {
                    type: 'x',
                    ticks: 10
                  }
                },
                {
                  cls: 'vs-grid',
                  options: {
                    type: 'y'
                  }
                }
              ]
            }
          },
          {
            construct: {
              render: 'svg',
              type: 'scatterplot'
            },
            options: {
              doubleBuffer: false,
              axisBoundaries: {},
              x: 220,
              y: 60,
              width: 200,
              height: 200,
              margins: {
                left: 10,
                right: 10,
                bottom: 10,
                top: 10
              },
              cols: [0, 1],
              vals: 'dna methylation'
            },
            decorators: {
              cls: [
                'vs-window',
                'vs-resizable',
                'vs-movable'
              ],
              elem: [
                {
                  cls: 'vs-axis',
                  options: {
                    type: 'x',
                    ticks: 10
                  }
                },
                {
                  cls: 'vs-axis',
                  options: {
                    type: 'y'
                  }
                },
                {
                  cls: 'vs-grid',
                  options: {
                    type: 'x',
                    ticks: 10
                  }
                },
                {
                  cls: 'vs-grid',
                  options: {
                    type: 'y'
                  }
                }
              ]
            }
          },
          {
            construct: {
              render: 'canvas',
              type: 'manhattan'
            },
            options: {
              doubleBuffer: true,
              x: 430,
              y: 60,
              width: 400,
              height: 200,
              margins: {
                left: 10,
                right: 10,
                bottom: 10,
                top: 10
              },
              cols: [0, 1],
              vals: 'v0',
              rows: ['start', 'end']
            },
            decorators: {
              cls: [
                'vs-window',
                'vs-resizable',
                'vs-movable'
              ],
              elem: [
                {
                  cls: 'vs-axis',
                  options: {
                    type: 'x',
                    ticks: 10
                  }
                },
                {
                  cls: 'vs-axis',
                  options: {
                    type: 'y'
                  }
                },
                {
                  cls: 'vs-grid',
                  options: {
                    type: 'x',
                    ticks: 10
                  }
                },
                {
                  cls: 'vs-grid',
                  options: {
                    type: 'y'
                  }
                }
              ]
            }
          },
          {
            construct: {
              render: 'svg',
              type: 'manhattan'
            },
            options: {
              yBoundaries: {min: 0, max: 1},
              x: 430,
              y: 290,
              width: 400,
              height: 200,
              margins: {
                left: 10,
                right: 10,
                bottom: 10,
                top: 10
              },
              cols: [0, 1],
              vals: 'v0',
              rows: ['start', 'end']
            },
            decorators: {
              cls: [
                'vs-window',
                'vs-resizable',
                'vs-movable'
              ],
              elem: [
                {
                  cls: 'vs-axis',
                  options: {
                    type: 'x',
                    ticks: 10
                  }
                },
                {
                  cls: 'vs-axis',
                  options: {
                    type: 'y'
                  }
                },
                {
                  cls: 'vs-grid',
                  options: {
                    type: 'x',
                    ticks: 10
                  }
                },
                {
                  cls: 'vs-grid',
                  options: {
                    type: 'y'
                  }
                }
              ]
            }
          }
        ],
        data: u.reflection.wrap({
          query: [
            new vs.models.Query({target: 'rows', targetLabel: 'chr', test: '==', testArgs: 'chr1'}),
            new vs.models.Query({target: 'rows', targetLabel: 'start', test: '<', testArgs: 233517394}),
            new vs.models.Query({target: 'rows', targetLabel: 'end', test: '>=', testArgs: 233430449})
          ],
          nrows: 51,
          ncols: 2,
          rows: [
            { label: 'snpid', d: ['rs114551744', 'rs10752752', 'rs186333629', 'rs12567310', 'rs192416686', 'rs183897471', 'rs145193745', 'rs186202256', 'rs186081217', 'rs192275158', 'rs72751993', 'rs1294299', 'rs1294287', 'rs183137223', 'rs190017470', 'rs114235520', 'rs149955012', 'rs1294266', 'rs142045052', 'rs75917843', 'rs77516196', 'rs192643817', 'rs148457912', 'rs77061983', 'rs12566188', 'rs190201031', 'rs192453879', 'rs183717127', 'rs148650720', 'rs962786', 'rs185014438', 'chr1:233490543', 'rs143728354', 'rs58507994', 'rs192456647', 'rs4649305', 'rs188603098', 'rs12093733', 'rs183414162', 'rs147666657', 'rs185545182', 'rs187596032', 'rs140818495', 'rs6669125', 'rs12046622', 'rs191178764', 'rs142593417', 'rs12021569', 'rs1294244', 'rs145593563', 'rs1294240'] },
            { label: 'chr', d: ['chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1', 'chr1'] },
            { label: 'start', boundaries: {min: 233430449, max: 233517394}, d: [233430449, 233430787, 233434167, 233440166, 233445488, 233451557, 233451592, 233454543, 233458743, 233460369, 233468388, 233468950, 233471626, 233472817, 233474525, 233475563, 233476091, 233476263, 233476611, 233477990, 233479122, 233479411, 233480171, 233482035, 233482794, 233485458, 233485758, 233485785, 233488494, 233489054, 233490356, 233490543, 233490874, 233491638, 233491660, 233491811, 233493514, 233494747, 233498953, 233500924, 233502622, 233504063, 233508441, 233509349, 233510220, 233514010, 233515209, 233516041, 233516495, 233516539, 233517394] },
            { label: 'end', boundaries: {min: 233430449, max: 233517394}, d: [233430449, 233430787, 233434167, 233440166, 233445488, 233451557, 233451592, 233454543, 233458743, 233460369, 233468388, 233468950, 233471626, 233472817, 233474525, 233475563, 233476091, 233476263, 233476611, 233477990, 233479122, 233479411, 233480171, 233482035, 233482794, 233485458, 233485758, 233485785, 233488494, 233489054, 233490356, 233490543, 233490874, 233491638, 233491660, 233491811, 233493514, 233494747, 233498953, 233500924, 233502622, 233504063, 233508441, 233509349, 233510220, 233514010, 233515209, 233516041, 233516495, 233516539, 233517394] }
          ],
          cols: [
            { label: 'name', d: ['disease1','disease2'] },
            { label: 'id', d: [1,2] }
          ],
          vals: [
            {
              label: 'gwasPval',
              d: [
                // disease1
                0.404408372, 0.803992066, 0.507903609, 0.547426622, 0.871425707, 0.485113325, 0.942985046, 0.80968252, 0.59025104, 0.446705793, 0.367949548, 0.837335724, 0.149008212, 0.815750721, 0.093113352, 0.760738683, 0.930361486, 0.865139848, 0.287298789, 0.345222337, 0.265686873, 0.326640821, 0.780148806, 0.760738683, 0.188583291, 0.545830368, 0.660700041, 0.683667077, 0.568244947, 0.931031203, 0.264302602, 0.272114888, 0.385857376, 0.184553922, 0.931031203, 0.545830368, 0.371864446, 0.345417064, 0.257295141, 0.747021106, 0.156752567, 0.896914644, 0.861281252, 0.039224306, 0.737350595, 0.814257925, 0.47957881, 0.49590813, 0.463224669, 0.468325228, 0.411346765,
                // disease2
                0.882708277, 0.382179127, 0.004464214, 0.956819961, 0.63578401, 0.006068026, 0.011369486, 0.849105131, 0.045518979, 0.073306556, 0.355315744, 0.836675429, 0.247715838, 0.878707621, 0.17187381, 0.975673874, 0.040117816, 0.814716033, 0.252212106, 0.250706362, 0.240120589, 0.213638592, 0.950169885, 0.975673874, 0.02665442, 0.732943237, 0.835452127, 0.292697145, 0.803356351, 0.570762048, 0.25849114, 0.389962194, 0.677604718, 0.135996401, 0.570762048, 0.732943237, 0.206626417, 0.746734601, 0.140132017, 0.417547526, 0.991532188, 0.690396282, 0.179808891, 0.99351707, 0.588622432, 0.032090482, 0.478861261, 0.441972278, 0.402009328, 0.502378328, 0.289511637
              ],
              t: true, // transpose
              boundaries: { min: 0, max: 1 }
            }]
        }, vs.models.DataSource)
      }, vs.ui.DataHandler)*!/
    ]
  };*/
}]);

main.controller('vs.DataContextController', ['$scope', function($scope) {
  /** @type {vs.ui.DataHandler} */
  var dataHandler = $scope['vsDataContext'].handler;
  var $window = $scope['vsWindow'].$window;
  var data = dataHandler.data;
  var range = vs.models.GenomicRangeQuery.extract(data.query);
  $scope.name = dataHandler.name;
  $scope.location = goog.string.format('%s:%s-%s', range.chr, range.start, range.end);

  var regex = /^\s*([a-zA-Z0-9]+)\s*\:\s*([0-9]+)\s*\-\s*([0-9]+)\s*$/;

  $scope.query = function() {
    var matches = $scope.location.match(regex);
    if (!matches || matches.length < 4) { throw new Error('Invalid location'); }

    var chr = matches[1];
    var start = parseInt(matches[2]);
    var end = parseInt(matches[3]);

    var q = new vs.models.GenomicRangeQuery(chr, start, end);

    data.applyQuery(q.query);

  };

  $scope.mousedown = function(e) {
    $window.trigger(new $.Event('mousedown', {target: $window[0], originalEvent: e, 'pageX': e.pageX, 'pageY': e.pageY}));
  };
}]);
