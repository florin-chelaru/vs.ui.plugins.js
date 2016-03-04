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
  var palette = d3.scale.category10();
  this.controller = {
    dataContexts: [
      /*u.reflection.wrap({
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
      }, vs.ui.DataHandler),*/
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
              cols: ['1jOD1q','5B0Aap'],
              xVal: 'start',
              yVal: 'gwasPval',
              fills: function() { return palette; },
              strokes: function() { return palette; }
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
              cols: ['1jOD1q','5B0Aap'],
              xVal: 'start',
              yVal: 'gwasPval'
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
              cols: ['1jOD1q','5B0Aap'],
              xVal: 'start',
              yVal: 'gwasPval',
              fills: function() { return palette; },
              strokes: function() { return palette; }
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
              cols: ['1jOD1q','5B0Aap'],
              xVal: 'start',
              yVal: 'gwasPval',
              fills: function() { return palette; },
              strokes: function() { return palette; }
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
              type: 'heatmap'
            },
            options: {
              x: 10,
              y: 290,
              width: 400,
              height: 200,
              margins: {
                left: 10,
                right: 10,
                bottom: 10,
                top: 10
              },
              cols: ['1jOD1q','5B0Aap','1jOD1q'],
              xVal: 'start',
              yVal: 'gwasPval',
              'fill': 'rgb(30,96,212)'
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
        data: [
          u.reflection.wrap({
            "id": "5B0Aap",
            "label": "disease1",
            "state": "static",
            "rowMetadata": [
              {
                "label": "snpid"
              },
              {
                "label": "chr"
              },
              {
                "label": "start",
                "boundaries": {
                  "min": 233430449,
                  "max": 233517394
                },
                "type": "number"
              },
              {
                "label": "end",
                "boundaries": {
                  "min": 233430449,
                  "max": 233517394
                },
                "type": "number"
              },
              {
                "label": "gwasPval",
                "type": "number",
                "boundaries": {
                  "min": 0,
                  "max": 1
                }
              }
            ],
            "d": [
              /*{
                "snpid": "rs114551744",
                "chr": "chr1",
                "start": 233430449,
                "end": 233430449,
                "gwasPval": 0.404408372,
                "__d__": "5B0Aap"
              },*/
              {
                "snpid": "rs10752752",
                "chr": "chr1",
                "start": 233430787,
                "end": 233430787,
                "gwasPval": 0.803992066,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs186333629",
                "chr": "chr1",
                "start": 233434167,
                "end": 233434167,
                "gwasPval": 0.507903609,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs12567310",
                "chr": "chr1",
                "start": 233440166,
                "end": 233440166,
                "gwasPval": 0.547426622,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs192416686",
                "chr": "chr1",
                "start": 233445488,
                "end": 233445488,
                "gwasPval": 0.871425707,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs183897471",
                "chr": "chr1",
                "start": 233451557,
                "end": 233451557,
                "gwasPval": 0.485113325,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs145193745",
                "chr": "chr1",
                "start": 233451592,
                "end": 233451592,
                "gwasPval": 0.942985046,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs186202256",
                "chr": "chr1",
                "start": 233454543,
                "end": 233454543,
                "gwasPval": 0.80968252,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs186081217",
                "chr": "chr1",
                "start": 233458743,
                "end": 233458743,
                "gwasPval": 0.59025104,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs192275158",
                "chr": "chr1",
                "start": 233460369,
                "end": 233460369,
                "gwasPval": 0.446705793,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs72751993",
                "chr": "chr1",
                "start": 233468388,
                "end": 233468388,
                "gwasPval": 0.367949548,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs1294299",
                "chr": "chr1",
                "start": 233468950,
                "end": 233468950,
                "gwasPval": 0.837335724,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs1294287",
                "chr": "chr1",
                "start": 233471626,
                "end": 233471626,
                "gwasPval": 0.149008212,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs183137223",
                "chr": "chr1",
                "start": 233472817,
                "end": 233472817,
                "gwasPval": 0.815750721,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs190017470",
                "chr": "chr1",
                "start": 233474525,
                "end": 233474525,
                "gwasPval": 0.093113352,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs114235520",
                "chr": "chr1",
                "start": 233475563,
                "end": 233475563,
                "gwasPval": 0.760738683,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs149955012",
                "chr": "chr1",
                "start": 233476091,
                "end": 233476091,
                "gwasPval": 0.930361486,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs1294266",
                "chr": "chr1",
                "start": 233476263,
                "end": 233476263,
                "gwasPval": 0.865139848,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs142045052",
                "chr": "chr1",
                "start": 233476611,
                "end": 233476611,
                "gwasPval": 0.287298789,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs75917843",
                "chr": "chr1",
                "start": 233477990,
                "end": 233477990,
                "gwasPval": 0.345222337,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs77516196",
                "chr": "chr1",
                "start": 233479122,
                "end": 233479122,
                "gwasPval": 0.265686873,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs192643817",
                "chr": "chr1",
                "start": 233479411,
                "end": 233479411,
                "gwasPval": 0.326640821,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs148457912",
                "chr": "chr1",
                "start": 233480171,
                "end": 233480171,
                "gwasPval": 0.780148806,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs77061983",
                "chr": "chr1",
                "start": 233482035,
                "end": 233482035,
                "gwasPval": 0.760738683,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs12566188",
                "chr": "chr1",
                "start": 233482794,
                "end": 233482794,
                "gwasPval": 0.188583291,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs190201031",
                "chr": "chr1",
                "start": 233485458,
                "end": 233485458,
                "gwasPval": 0.545830368,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs192453879",
                "chr": "chr1",
                "start": 233485758,
                "end": 233485758,
                "gwasPval": 0.660700041,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs183717127",
                "chr": "chr1",
                "start": 233485785,
                "end": 233485785,
                "gwasPval": 0.683667077,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs148650720",
                "chr": "chr1",
                "start": 233488494,
                "end": 233488494,
                "gwasPval": 0.568244947,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs962786",
                "chr": "chr1",
                "start": 233489054,
                "end": 233489054,
                "gwasPval": 0.931031203,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs185014438",
                "chr": "chr1",
                "start": 233490356,
                "end": 233490356,
                "gwasPval": 0.264302602,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "chr1:233490543",
                "chr": "chr1",
                "start": 233490543,
                "end": 233490543,
                "gwasPval": 0.272114888,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs143728354",
                "chr": "chr1",
                "start": 233490874,
                "end": 233490874,
                "gwasPval": 0.385857376,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs58507994",
                "chr": "chr1",
                "start": 233491638,
                "end": 233491638,
                "gwasPval": 0.184553922,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs192456647",
                "chr": "chr1",
                "start": 233491660,
                "end": 233491660,
                "gwasPval": 0.931031203,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs4649305",
                "chr": "chr1",
                "start": 233491811,
                "end": 233491811,
                "gwasPval": 0.545830368,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs188603098",
                "chr": "chr1",
                "start": 233493514,
                "end": 233493514,
                "gwasPval": 0.371864446,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs12093733",
                "chr": "chr1",
                "start": 233494747,
                "end": 233494747,
                "gwasPval": 0.345417064,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs183414162",
                "chr": "chr1",
                "start": 233498953,
                "end": 233498953,
                "gwasPval": 0.257295141,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs147666657",
                "chr": "chr1",
                "start": 233500924,
                "end": 233500924,
                "gwasPval": 0.747021106,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs185545182",
                "chr": "chr1",
                "start": 233502622,
                "end": 233502622,
                "gwasPval": 0.156752567,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs187596032",
                "chr": "chr1",
                "start": 233504063,
                "end": 233504063,
                "gwasPval": 0.896914644,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs140818495",
                "chr": "chr1",
                "start": 233508441,
                "end": 233508441,
                "gwasPval": 0.861281252,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs6669125",
                "chr": "chr1",
                "start": 233509349,
                "end": 233509349,
                "gwasPval": 0.039224306,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs12046622",
                "chr": "chr1",
                "start": 233510220,
                "end": 233510220,
                "gwasPval": 0.737350595,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs191178764",
                "chr": "chr1",
                "start": 233514010,
                "end": 233514010,
                "gwasPval": 0.814257925,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs142593417",
                "chr": "chr1",
                "start": 233515209,
                "end": 233515209,
                "gwasPval": 0.47957881,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs12021569",
                "chr": "chr1",
                "start": 233516041,
                "end": 233516041,
                "gwasPval": 0.49590813,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs1294244",
                "chr": "chr1",
                "start": 233516495,
                "end": 233516495,
                "gwasPval": 0.463224669,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs145593563",
                "chr": "chr1",
                "start": 233516539,
                "end": 233516539,
                "gwasPval": 0.468325228,
                "__d__": "5B0Aap"
              },
              {
                "snpid": "rs1294240",
                "chr": "chr1",
                "start": 233517394,
                "end": 233517394,
                "gwasPval": 0.411346765,
                "__d__": "5B0Aap"
              }
            ],
            "query": [
              new vs.models.Query({
                "target": "chr",
                "test": "==",
                "testArgs": "chr1"
              }),
              new vs.models.Query({
                "target": "start",
                "test": "<",
                "testArgs": "233517394"
              }),
              new vs.models.Query({
                "target": "end",
                "test": ">=",
                "testArgs": "233430449"
              })
            ],
            "metadata": {
              "name": "disease1",
              "id": 1
            }
          }, vs.models.DataSource),
          u.reflection.wrap({
            "id": "1jOD1q",
            "label": "disease2",
            "state": "static",
            "rowMetadata": [
              {
                "label": "snpid"
              },
              {
                "label": "chr"
              },
              {
                "label": "start",
                "boundaries": {
                  "min": 233430449,
                  "max": 233517394
                },
                "type": "number"
              },
              {
                "label": "end",
                "boundaries": {
                  "min": 233430449,
                  "max": 233517394
                },
                "type": "number"
              },
              {
                "label": "gwasPval",
                "type": "number",
                "boundaries": {
                  "min": 0,
                  "max": 1
                }
              }
            ],
            "d": [
              {
                "snpid": "rs114551744",
                "chr": "chr1",
                "start": 233430449,
                "end": 233430449,
                "gwasPval": 0.882708277,
                "__d__": "1jOD1q"
              },
              /*{
                "snpid": "rs10752752",
                "chr": "chr1",
                "start": 233430787,
                "end": 233430787,
                "gwasPval": 0.382179127,
                "__d__": "1jOD1q"
              },*/
              {
                "snpid": "rs186333629",
                "chr": "chr1",
                "start": 233434167,
                "end": 233434167,
                "gwasPval": 0.004464214,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs12567310",
                "chr": "chr1",
                "start": 233440166,
                "end": 233440166,
                "gwasPval": 0.956819961,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs192416686",
                "chr": "chr1",
                "start": 233445488,
                "end": 233445488,
                "gwasPval": 0.63578401,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs183897471",
                "chr": "chr1",
                "start": 233451557,
                "end": 233451557,
                "gwasPval": 0.006068026,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs145193745",
                "chr": "chr1",
                "start": 233451592,
                "end": 233451592,
                "gwasPval": 0.011369486,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs186202256",
                "chr": "chr1",
                "start": 233454543,
                "end": 233454543,
                "gwasPval": 0.849105131,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs186081217",
                "chr": "chr1",
                "start": 233458743,
                "end": 233458743,
                "gwasPval": 0.045518979,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs192275158",
                "chr": "chr1",
                "start": 233460369,
                "end": 233460369,
                "gwasPval": 0.073306556,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs72751993",
                "chr": "chr1",
                "start": 233468388,
                "end": 233468388,
                "gwasPval": 0.355315744,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs1294299",
                "chr": "chr1",
                "start": 233468950,
                "end": 233468950,
                "gwasPval": 0.836675429,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs1294287",
                "chr": "chr1",
                "start": 233471626,
                "end": 233471626,
                "gwasPval": 0.247715838,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs183137223",
                "chr": "chr1",
                "start": 233472817,
                "end": 233472817,
                "gwasPval": 0.878707621,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs190017470",
                "chr": "chr1",
                "start": 233474525,
                "end": 233474525,
                "gwasPval": 0.17187381,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs114235520",
                "chr": "chr1",
                "start": 233475563,
                "end": 233475563,
                "gwasPval": 0.975673874,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs149955012",
                "chr": "chr1",
                "start": 233476091,
                "end": 233476091,
                "gwasPval": 0.040117816,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs1294266",
                "chr": "chr1",
                "start": 233476263,
                "end": 233476263,
                "gwasPval": 0.814716033,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs142045052",
                "chr": "chr1",
                "start": 233476611,
                "end": 233476611,
                "gwasPval": 0.252212106,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs75917843",
                "chr": "chr1",
                "start": 233477990,
                "end": 233477990,
                "gwasPval": 0.250706362,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs77516196",
                "chr": "chr1",
                "start": 233479122,
                "end": 233479122,
                "gwasPval": 0.240120589,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs192643817",
                "chr": "chr1",
                "start": 233479411,
                "end": 233479411,
                "gwasPval": 0.213638592,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs148457912",
                "chr": "chr1",
                "start": 233480171,
                "end": 233480171,
                "gwasPval": 0.950169885,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs77061983",
                "chr": "chr1",
                "start": 233482035,
                "end": 233482035,
                "gwasPval": 0.975673874,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs12566188",
                "chr": "chr1",
                "start": 233482794,
                "end": 233482794,
                "gwasPval": 0.02665442,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs190201031",
                "chr": "chr1",
                "start": 233485458,
                "end": 233485458,
                "gwasPval": 0.732943237,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs192453879",
                "chr": "chr1",
                "start": 233485758,
                "end": 233485758,
                "gwasPval": 0.835452127,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs183717127",
                "chr": "chr1",
                "start": 233485785,
                "end": 233485785,
                "gwasPval": 0.292697145,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs148650720",
                "chr": "chr1",
                "start": 233488494,
                "end": 233488494,
                "gwasPval": 0.803356351,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs962786",
                "chr": "chr1",
                "start": 233489054,
                "end": 233489054,
                "gwasPval": 0.570762048,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs185014438",
                "chr": "chr1",
                "start": 233490356,
                "end": 233490356,
                "gwasPval": 0.25849114,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "chr1:233490543",
                "chr": "chr1",
                "start": 233490543,
                "end": 233490543,
                "gwasPval": 0.389962194,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs143728354",
                "chr": "chr1",
                "start": 233490874,
                "end": 233490874,
                "gwasPval": 0.677604718,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs58507994",
                "chr": "chr1",
                "start": 233491638,
                "end": 233491638,
                "gwasPval": 0.135996401,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs192456647",
                "chr": "chr1",
                "start": 233491660,
                "end": 233491660,
                "gwasPval": 0.570762048,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs4649305",
                "chr": "chr1",
                "start": 233491811,
                "end": 233491811,
                "gwasPval": 0.732943237,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs188603098",
                "chr": "chr1",
                "start": 233493514,
                "end": 233493514,
                "gwasPval": 0.206626417,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs12093733",
                "chr": "chr1",
                "start": 233494747,
                "end": 233494747,
                "gwasPval": 0.746734601,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs183414162",
                "chr": "chr1",
                "start": 233498953,
                "end": 233498953,
                "gwasPval": 0.140132017,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs147666657",
                "chr": "chr1",
                "start": 233500924,
                "end": 233500924,
                "gwasPval": 0.417547526,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs185545182",
                "chr": "chr1",
                "start": 233502622,
                "end": 233502622,
                "gwasPval": 0.991532188,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs187596032",
                "chr": "chr1",
                "start": 233504063,
                "end": 233504063,
                "gwasPval": 0.690396282,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs140818495",
                "chr": "chr1",
                "start": 233508441,
                "end": 233508441,
                "gwasPval": 0.179808891,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs6669125",
                "chr": "chr1",
                "start": 233509349,
                "end": 233509349,
                "gwasPval": 0.99351707,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs12046622",
                "chr": "chr1",
                "start": 233510220,
                "end": 233510220,
                "gwasPval": 0.588622432,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs191178764",
                "chr": "chr1",
                "start": 233514010,
                "end": 233514010,
                "gwasPval": 0.032090482,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs142593417",
                "chr": "chr1",
                "start": 233515209,
                "end": 233515209,
                "gwasPval": 0.478861261,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs12021569",
                "chr": "chr1",
                "start": 233516041,
                "end": 233516041,
                "gwasPval": 0.441972278,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs1294244",
                "chr": "chr1",
                "start": 233516495,
                "end": 233516495,
                "gwasPval": 0.402009328,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs145593563",
                "chr": "chr1",
                "start": 233516539,
                "end": 233516539,
                "gwasPval": 0.502378328,
                "__d__": "1jOD1q"
              },
              {
                "snpid": "rs1294240",
                "chr": "chr1",
                "start": 233517394,
                "end": 233517394,
                "gwasPval": 0.289511637,
                "__d__": "1jOD1q"
              }
            ],
            "query": [
              {
                "target": "chr",
                "test": "==",
                "testArgs": "chr1"
              },
              {
                "target": "start",
                "test": "<",
                "testArgs": "233517394"
              },
              {
                "target": "end",
                "test": ">=",
                "testArgs": "233430449"
              }
            ],
            "metadata": {
              "name": "disease2",
              "id": 2
            }
          }, vs.models.DataSource)
        ]
      }, vs.ui.DataHandler)
    ]
  };
}]);

main.controller('vs.DataContextController', ['$scope', function($scope) {
  /** @type {vs.ui.DataHandler} */
  var dataHandler = $scope['vsDataContext'].handler;
  var $window = $scope['vsWindow'].$window;
  var data = dataHandler.data;
  var range = vs.models.GenomicRangeQuery.extract(data[0].query);
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
