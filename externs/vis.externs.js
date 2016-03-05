/** @suppress {duplicate} */
var vs = {
async: {},
directives: {},
linking: {},
models: {},
ui: {
canvas: {},
svg: {},
decorators: {}
}
};
/**
* @license vis.js
* Copyright (c) 2015 Florin Chelaru
* License: MIT
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
* documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
* rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
* Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
* WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
* COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
* OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


/**
 * Argument details:
 *  - target: if defined, the label of the row/column/value array to test; if undefined, the index within the current structure is used
 *  - test: the filter to be applied on the data (>, <, ==, etc)
 *  - testArgs: arguments to test against
 *  - negate: take the complement of the result
 * @param {({target: string, test: string, testArgs: *, negate: (boolean|undefined)}|vs.models.Query)} opts
 * @constructor
 */
vs.models.Query = function(opts) {};

/**
 * @returns {string}
 */
vs.models.Query.prototype.toString = function() {};

/**
 * @param {({target: string, test: string, testArgs: *, negate: (boolean|undefined)}|vs.models.Query)} [other]
 * @returns {boolean}
 */
vs.models.Query.prototype.equals = function(other) {};

/**
 * @enum {string}
 */
vs.models.Query.Target = {
  'ROWS': 'rows',
  'COLS': 'cols',
  'VALS': 'vals'
};

/**
 * @enum {string}
 */
vs.models.Query.Test = {
  'EQUALS': '==',
  'GREATER_THAN': '>',
  'LESS_THAN': '<',
  'GREATER_OR_EQUALS': '>=',
  'LESS_OR_EQUALS': '<=',
  'CONTAINS': 'contains',
  'IN': 'in',
  'DEFINED': 'defined'
};


/**
 * @constructor
 */
vs.models.DataSource = function() {};

/**
 * @type {string}
 * @name vs.models.DataSource#id;
 */
vs.models.DataSource.prototype.id;

/**
 * @type {string}
 * @name vs.models.DataSource#label;
 */
vs.models.DataSource.prototype.label;

/**
 * An indicator of whether the data has changed or not. Data with the same id and state is considered identical.
 * @type {string}
 * @name vs.models.DataSource#state
 */
vs.models.DataSource.prototype.state;

/**
 * @type {Array.<vs.models.Query>}
 * @name vs.models.DataSource#query
 */
vs.models.DataSource.prototype.query;

/**
 * @type {Array.<{label: string, type: (string|undefined), boundaries: (undefined|{min:number, max:number})}>}
 * @name vs.models.DataSource#rowMetadata
 */
vs.models.DataSource.prototype.rowMetadata;

/**
 * @type {Array.<Object>}
 * @name vs.models.DataSource#d
 */
vs.models.DataSource.prototype.d;

/**
 * @type {Object}
 * @name vs.models.DataSource#metadata
 */
vs.models.DataSource.prototype.metadata;

/**
 * @type {Promise}
 * @name vs.models.DataSource#ready
 */
vs.models.DataSource.prototype.ready;

/**
 * @type {boolean}
 * @name vs.models.DataSource#isReady
 */
vs.models.DataSource.prototype.isReady;

/**
 * @type {u.Event.<vs.models.DataSource>}
 * @name vs.models.DataSource#changed
 */
vs.models.DataSource.prototype.changed;

/**
 * @type {u.Event.<vs.models.DataSource>}
 * @name vs.models.DataSource#changing
 */
vs.models.DataSource.prototype.changing;
/**
 * @param {vs.models.Query|Array.<vs.models.Query>} queries
 * @param {boolean} [copy] True if the result should be a copy instead of changing the current instance
 * @returns {Promise.<vs.models.DataSource>}
 */
vs.models.DataSource.prototype.applyQuery = function(queries, copy) {};

/**
 * For a static data source (that does not change over time), this does the exact same thing as applyQuery; for dynamic
 * data sources this simply filters out data already loaded in memory, without making any external calls.
 * @param {vs.models.Query|Array.<vs.models.Query>} queries
 * @returns {Promise.<vs.models.DataSource>}
 */
vs.models.DataSource.prototype.filter = function(queries) {};

/**
 * @param {vs.models.DataSource} data
 * @param {vs.models.Query} q
 * @returns {Promise.<vs.models.DataSource>}
 */
vs.models.DataSource.singleQuery = function(data, q) {};

/**
 * @returns {{query: *, nrows: *, ncols: *, rows: *, cols: *, vals: *, isReady: *}}
 */
vs.models.DataSource.prototype.raw = function() {};

/**
 * @param {string} label
 * @returns {{label: string, type: (string|undefined), boundaries: (undefined|{min:number, max:number})}|null}
 */
vs.models.DataSource.prototype.getRowMetadata = function(label) {};

/**
 * @param {Array.<vs.models.DataSource>} datas
 * @returns {Array.<string>}
 */
vs.models.DataSource.combinedArrayMetadata = function(datas) {};

/**
 * @param {Array.<vs.models.DataSource>} datas
 * @returns {boolean}
 */
vs.models.DataSource.allDataIsReady = function(datas) {};


/**
 * @param {vs.models.DataSource} data
 * @param {vs.ui.BrushingEvent.Action} action
 * @param {...Object} items
 * @constructor
 */
vs.ui.BrushingEvent = function(data, action, items) {};

/**
 * @enum {string}
 */
vs.ui.BrushingEvent.Action = {
  'MOUSEOVER': 'mouseover',
  'MOUSEOUT': 'mouseout',
  'SELECT': 'select',
  'DESELECT': 'deselect'
};


/**
 * @param {number} [min]
 * @param {number} [max]
 * @constructor
 */
vs.models.Boundaries = function(min, max) {};

/**
 * @type {number}
 * @name vs.models.Boundaries#min
 */
vs.models.Boundaries.prototype.min;

/**
 * @type {number}
 * @name vs.models.Boundaries#max
 */
vs.models.Boundaries.prototype.max;




/**
 * @param {number} top
 * @param {number} left
 * @param {number} bottom
 * @param {number} right
 * @constructor
 */
vs.models.Margins = function(top, left, bottom, right) {};

/**
 * @type {number}
 * @name vs.models.Margins#top
 */
vs.models.Margins.prototype.top;

/**
 * @type {number}
 * @name vs.models.Margins#left
 */
vs.models.Margins.prototype.left;

/**
 * @type {number}
 * @name vs.models.Margins#bottom
 */
vs.models.Margins.prototype.bottom;

/**
 * @type {number}
 * @name vs.models.Margins#right
 */
vs.models.Margins.prototype.right;

/**
 * @type {Array.<number>}
 * @name vs.models.Margins#x
 */
vs.models.Margins.prototype.x;

/**
 * @type {Array.<number>}
 * @name vs.models.Margins#y
 */
vs.models.Margins.prototype.y;
/**
 * @param {vs.models.Margins|{top: number, left: number, bottom: number, right: number}} offset
 */
vs.models.Margins.prototype.add = function(offset) {};

/**
 * @param {*} other
 * @returns {boolean}
 */
vs.models.Margins.prototype.equals = function(other) {};


//region goog...
// for predefined 'settings':
//endregion

/**
 * @param {{
 *  key: string,
 *  type: (vs.ui.Setting.Type|string),
 *  defaultValue: (function(Object.<string, *>, *, Array.<vs.models.DataSource>, Object.<string, vs.ui.Setting>)|*),
 *  label: (string|undefined),
 *  template: (string|undefined),
 *  hidden: (boolean|undefined),
 *  possibleValues: (Array|function(Object.<string, *>, *, Array.<vs.models.DataSource>, Object.<string, vs.ui.Setting>)|undefined)
 * }} args
 * @constructor
 */
vs.ui.Setting = function(args) {};

//region Methods
/**
 * Extracts value from a set of raw options and element attributes
 * @param {Object.<string, *>} options
 * @param $attrs Angular attrs
 * @param {Array.<vs.models.DataSource>} [data]
 * @param {Object.<string, vs.ui.Setting>} [settings]
 * @returns {*}
 */
vs.ui.Setting.prototype.getValue = function(options, $attrs, data, settings) {};

/**
 * @param {Object.<string, *>} options
 * @param $attrs Angular attrs
 * @param {Array.<vs.models.DataSource>} [data]
 * @param {Object.<string, vs.ui.Setting>} [settings]
 * @returns {*}
 */
vs.ui.Setting.prototype.possibleValues = function(options, $attrs, data, settings) {};
//endregion

//region Nested Types
/**
 * @enum {string}
 */
vs.ui.Setting.Type = {
  'NUMBER': 'number',
  'STRING': 'string',
  'ARRAY': 'array',
  'BOOLEAN': 'boolean',
  'OBJECT': 'object',
  'CATEGORICAL': 'categorical',
  'DATA_COL_LABEL': 'dataColLbl',
  'DATA_COL_ID': 'dataColId',
  'DATA_ROW_LABEL': 'dataRowLbl',
  'FUNCTION': 'function'
};
//endregion

//region Static Methods
/**
 * @param {Array.<vs.models.DataSource>} data
 */
vs.ui.Setting.getAllRowMetadata = function(data) {};

/**
 * @param {string} dep
 * @param {Object.<string, *>} options
 * @param $attrs Angular attrs
 * @param {Array.<vs.models.DataSource>} [data]
 * @param {Object.<string, vs.ui.Setting>} [settings]
 * @returns {*}
 */
vs.ui.Setting.boundaries = function (dep, options, $attrs, data, settings) {};

/**
 * @param {Object.<string, *>} options
 * @param $attrs Angular attrs
 * @param {Array.<vs.models.DataSource>} [data]
 * @param {Object.<string, vs.ui.Setting>} [settings]
 * @returns {*}
 */
vs.ui.Setting.xBoundaries = function (options, $attrs, data, settings) {};

/**
 * @param {Object.<string, *>} options
 * @param $attrs Angular attrs
 * @param {Array.<vs.models.DataSource>} [data]
 * @param {Object.<string, vs.ui.Setting>} [settings]
 * @returns {*}
 */
vs.ui.Setting.yBoundaries = function (options, $attrs, data, settings) {};

/**
 * @param {Object.<string, *>} options
 * @param $attrs Angular attrs
 * @param {Array.<vs.models.DataSource>} [data]
 * @param {Object.<string, vs.ui.Setting>} [settings]
 * @returns {*}
 */
vs.ui.Setting.firstColsId = function (options, $attrs, data, settings) {};

/**
 * @param {Object.<string, *>} options
 * @param $attrs Angular attrs
 * @param {Array.<vs.models.DataSource>} [data]
 * @param {Object.<string, vs.ui.Setting>} [settings]
 * @returns {*}
 */
vs.ui.Setting.firstRowsLabel = function (options, $attrs, data, settings) {};

/**
 * @param {Object.<string, *>} options
 * @param $attrs Angular attrs
 * @param {Array.<vs.models.DataSource>} [data]
 * @param {Object.<string, vs.ui.Setting>} [settings]
 * @returns {*}
 */
vs.ui.Setting.xScale = function (options, $attrs, data, settings) {};

/**
 * @param {Object.<string, *>} options
 * @param $attrs Angular attrs
 * @param {Array.<vs.models.DataSource>} [data]
 * @param {Object.<string, vs.ui.Setting>} [settings]
 * @returns {*}
 */
vs.ui.Setting.yScale = function (options, $attrs, data, settings) {};

/**
 * @const {function(*):string}
 */
vs.ui.Setting.defaultPalette = d3.scale.category20();

/**
 * @param {Object.<string, *>} options
 * @param $attrs Angular attrs
 * @param {Array.<vs.models.DataSource>} [data]
 * @param {Object.<string, vs.ui.Setting>} [settings]
 * @returns {*}
 */
vs.ui.Setting.mergeColsDefault = function (options, $attrs, data, settings) {};

/**
 * @param {string} xVal
 * @param {Array.<vs.models.DataSource>} ds
 * @returns {vs.models.DataSource}
 */
vs.ui.Setting.mergeCols = function(xVal, ds) {};
//endregion

//region Constants
/**
 * @const {Object.<string, vs.ui.Setting>}
 */
vs.ui.Setting.PredefinedSettings = {};
//endregion


/**
 * @param {function():Promise} func
 * @param {Object} [thisArg]
 * @constructor
 */
vs.async.Task = function(func, thisArg) {};

/**
 * @type {number}
 * @name vs.async.Task#id
 */
vs.async.Task.prototype.id;

/**
 * @type {Object|undefined}
 * @name vs.async.Task#thisArg
 */
vs.async.Task.prototype.thisArg;

/**
 * @type {function():Promise}
 * @name vs.async.Task#func
 */
vs.async.Task.prototype.func;

/**
 * @type {vs.async.Task}
 * @name vs.async.Task#prev
 */
vs.async.Task.prototype.prev;

/**
 * @type {vs.async.Task}
 * @name vs.async.Task#next
 */
vs.async.Task.prototype.next;

/**
 * @type {vs.async.Task}
 * @name vs.async.Task#first
 */
vs.async.Task.prototype.first;

/**
 * @type {vs.async.Task}
 * @name vs.async.Task#last
 */
vs.async.Task.prototype.last;
/**
 * @type {number}
 * @private
 */
vs.async.Task._nextId = 0;

/**
 * @returns {number}
 */
vs.async.Task.nextId = function() {};


/**
 * @param {function(Function, number)} $timeout Angular timeout service
 * @constructor
 */
vs.async.TaskService = function($timeout) {};

/**
 * @param {function():Promise} func
 * @param {Object} [thisArg]
 */
vs.async.TaskService.prototype.createTask = function(func, thisArg) {};

/**
 * @param {vs.async.Task|function():Promise} t1
 * @param {vs.async.Task|function():Promise} t2
 * @returns {vs.async.Task}
 */
vs.async.TaskService.prototype.chain = function(t1, t2) {};

/**
 * TODO: test!
 * @param {vs.async.Task} task
 * @param {boolean} [sequential] If true, the tasks will run sequentially
 * @returns {Promise}
 */
vs.async.TaskService.prototype.runChain = function(task, sequential) {};


//region goog...
//endregion

/**
 * @param {{$scope: angular.Scope, $element: jQuery, $attrs: angular.Attributes, $timeout: angular.$timeout, taskService: vs.async.TaskService, threadPool: parallel.ThreadPool}} $ng
 * @param {Object.<string, *>} options
 * @param {Array.<vs.models.DataSource>} data
 * @constructor
 */
vs.ui.VisHandler = function($ng, options, data) {};

//region Constants
/**
 * @const {Object.<string, vs.ui.Setting>}
 */
vs.ui.VisHandler.Settings = {};
//endregion

//region Properties

/**
 * @type {string}
 * @name vs.ui.VisHandler#render
 */
vs.ui.VisHandler.prototype.render;

/**
 * Gets a list of all settings (option definitions) for this type of visualization
 * @type {Object.<string, vs.ui.Setting>}
 * @name vs.ui.VisHandler#settings
 */
vs.ui.VisHandler.prototype.settings;

/**
 * @type {angular.Scope}
 * @name vs.ui.VisHandler#$scope
 */
vs.ui.VisHandler.prototype.$scope;

/**
 * @type {jQuery}
 * @name vs.ui.VisHandler#$element
 */
vs.ui.VisHandler.prototype.$element;

/**
 * @type {angular.Attributes}
 * @name vs.ui.VisHandler#$attrs
 */
vs.ui.VisHandler.prototype.$attrs;

/**
 * @type {angular.$timeout}
 * @name vs.ui.VisHandler#$timeout
 */
vs.ui.VisHandler.prototype.$timeout;

/**
 * The values for the visualization predefined settings
 * @type {Object.<string, *>}
 * @name vs.ui.VisHandler#options
 */
vs.ui.VisHandler.prototype.options;

/**
 * @type {Array.<vs.models.DataSource>}
 * @name vs.ui.VisHandler#data
 */
vs.ui.VisHandler.prototype.data;

/**
 * @type {parallel.SharedObject.<vs.models.DataSource>}
 * @name vs.ui.VisHandler#sharedData
 */
vs.ui.VisHandler.prototype.sharedData;

/**
 * @type {parallel.ThreadProxy}
 * @name vs.ui.VisHandler#thread
 */
vs.ui.VisHandler.prototype.thread;

/**
 * @type {vs.async.Task}
 * @name vs.ui.VisHandler#beginDrawTask
 */
vs.ui.VisHandler.prototype.beginDrawTask;

/**
 * @type {vs.async.Task}
 * @name vs.ui.VisHandler#endDrawTask
 */
vs.ui.VisHandler.prototype.endDrawTask;

/**
 * @type {vs.models.Margins}
 * @name vs.ui.VisHandler#margins
 */
vs.ui.VisHandler.prototype.margins;

/**
 * @type {number}
 * @name vs.ui.VisHandler#width
 */
vs.ui.VisHandler.prototype.width;

/**
 * @type {number}
 * @name vs.ui.VisHandler#height
 */
vs.ui.VisHandler.prototype.height;

/**
 * @type {u.Event.<vs.ui.BrushingEvent>}
 * @name vs.ui.VisHandler#brushing
 */
vs.ui.VisHandler.prototype.brushing;
//endregion

//region Methods

/**
 * @param {string} optionKey
 * @returns {*}
 */
vs.ui.VisHandler.prototype.optionValue = function(optionKey) {};

/**
 * @returns {Promise}
 */
vs.ui.VisHandler.prototype.beginDraw = function() {};

/**
 * @returns {Promise}
 */
vs.ui.VisHandler.prototype.endDraw = function() {};

/**
 * @returns {Promise}
 */
vs.ui.VisHandler.prototype.draw = function() {};

/**
 * @returns {Promise}
 */
vs.ui.VisHandler.prototype.scheduleRedraw = function() {};

/**
 * @param {vs.ui.BrushingEvent} e
 * @param {Array.<Object>} objects
 */
vs.ui.VisHandler.prototype.brush = function(e, objects) {};

/**
 * @param {vs.ui.BrushingEvent} e
 * @param {Array.<Object>} objects
 */
vs.ui.VisHandler.prototype.highlightItem = function(e, objects) {};

/**
 * @param {vs.ui.BrushingEvent} e
 * @param {Array.<Object>} objects
 */
vs.ui.VisHandler.prototype.unhighlightItem = function(e, objects) {};

/**
 * @returns {Promise}
 */
vs.ui.VisHandler.prototype.schedulePreProcessData = function() {};

/**
 * @returns {Promise}
 */
vs.ui.VisHandler.prototype.preProcessData = function() {};

//endregion


/**
 * @constructor
 * @extends vs.ui.VisHandler
 */
vs.ui.svg.SvgVis = function () {};

vs.ui.svg.SvgVis.prototype.beginDraw = function () {};


/**
 * @param {string} message
 * @param {Error} [innerException]
 * @constructor
 * @extends u.Exception
 */
vs.ui.UiException = function(message, innerException) {};

/**
 * @constructor
 * @extends {ngu.Configuration}
 */
vs.Configuration = function() {};

/**
 * @type {Object.<string, *>}
 * @name vs.Configuration#options
 */
vs.Configuration.prototype.options;
/**
 * @param {Object.<string, *>} options
 */
vs.Configuration.prototype.customize = function(options) {};


/**
 * @param {vs.Configuration} config
 * @constructor
 */
vs.async.ThreadPoolService = function(config) {};

/**
 * @type {parallel.ThreadPool}
 * @name vs.async.ThreadPoolService#pool
 */
vs.async.ThreadPoolService.prototype.pool;
/**
 * @param {vs.Configuration} config
 * @param {vs.async.TaskService} taskService
 * @param {Function} $timeout
 * @param {vs.async.ThreadPoolService} threadPool
 * @constructor
 */
vs.ui.VisualizationFactory = function(config, taskService, $timeout, threadPool) {};

/**
 * @param {angular.Scope} $scope
 * @param {jQuery} $element
 * @param {angular.Attributes} $attrs
 * @returns {vs.ui.VisHandler}
 */
vs.ui.VisualizationFactory.prototype.createNew = function($scope, $element, $attrs) {};


/**
 * @param {angular.Scope} $scope
 * @param $document
 * @constructor
 * @extends {ngu.Directive}
 */
vs.directives.Resizable = function($scope, $document) {};

/**
 * @param {angular.Scope} $scope
 * @param {jQuery} $element
 * @param {angular.Attributes} $attrs
 * @param controller
 * @override
 */
vs.directives.Resizable.prototype.link = function($scope, $element, $attrs, controller) {};

/**
 * @param {jQuery} $elem
 * @constructor
 */
vs.directives.Resizable.ResizeHandler = function($elem) {};

/**
 * @param {jQuery} $elem
 * @returns {vs.directives.Resizable.ResizeHandler}
 */
vs.directives.Resizable.ResizeHandler.topLeft = function($elem) {};

/**
 * @param {jQuery} $elem
 * @returns {vs.directives.Resizable.ResizeHandler}
 */
vs.directives.Resizable.ResizeHandler.topRight = function($elem) {};

/**
 * @param {jQuery} $elem
 * @returns {vs.directives.Resizable.ResizeHandler}
 */
vs.directives.Resizable.ResizeHandler.bottomLeft = function($elem) {};

/**
 * @param {jQuery} $elem
 * @returns {vs.directives.Resizable.ResizeHandler}
 */
vs.directives.Resizable.ResizeHandler.bottomRight = function($elem) {};

/**
 * @param {jQuery} $elem
 * @returns {vs.directives.Resizable.ResizeHandler}
 */
vs.directives.Resizable.ResizeHandler.left = function($elem) {};

/**
 * @param {jQuery} $elem
 * @returns {vs.directives.Resizable.ResizeHandler}
 */
vs.directives.Resizable.ResizeHandler.right = function($elem) {};

/**
 * @param {jQuery} $elem
 * @returns {vs.directives.Resizable.ResizeHandler}
 */
vs.directives.Resizable.ResizeHandler.bottom = function($elem) {};

/**
 * @param {jQuery} $element
 * @constructor
 */
vs.directives.Resizable.BoundingBox = function($element) {};

/**
 * @param {jQuery} $elem
 * @returns {vs.directives.Resizable.ResizeHandler}
 */
vs.directives.Resizable.BoundingBox.prototype.getHandler = function($elem) {};

/**
 * @param {vs.directives.Resizable.ResizeHandler} handler
 * @param {number} [minWidth]
 * @param {number} [minHeight]
 */
vs.directives.Resizable.BoundingBox.prototype.update = function(handler, minWidth, minHeight) {};

/**
 * @type {number}
 * @name vs.directives.Resizable.BoundingBox#left
 */
vs.directives.Resizable.BoundingBox.prototype.left;

/**
 * @type {number}
 * @name vs.directives.Resizable.BoundingBox#top
 */
vs.directives.Resizable.BoundingBox.prototype.top;

/**
 * @type {number}
 * @name vs.directives.Resizable.BoundingBox#width
 */
vs.directives.Resizable.BoundingBox.prototype.width;

/**
 * @type {number}
 * @name vs.directives.Resizable.BoundingBox#height
 */
vs.directives.Resizable.BoundingBox.prototype.height;
/**
 * @param {{$scope: angular.Scope, $element: jQuery, $attrs: angular.Attributes, $timeout: angular.$timeout, taskService: vs.async.TaskService}} $ng
 * @param {jQuery} $targetElement
 * @param {vs.ui.VisHandler} target
 * @param {Object.<string, *>} options
 * @constructor
 */
vs.ui.Decorator = function($ng, $targetElement, target, options) {};

/**
 * @type {angular.Scope}
 * @name vs.ui.Decorator#$scope
 */
vs.ui.Decorator.prototype.$scope;

/**
 * @type {jQuery}
 * @name vs.ui.Decorator#$element
 */
vs.ui.Decorator.prototype.$element;

/**
 * @type {angular.Attributes}
 * @name vs.ui.Decorator#$attrs
 */
vs.ui.Decorator.prototype.$attrs;

/**
 * @type {jQuery}
 * @name vs.ui.Decorator#$targetElement
 */
vs.ui.Decorator.prototype.$targetElement;

/**
 * @type {Array.<vs.models.DataSource>}
 * @name vs.ui.Decorator#data
 */
vs.ui.Decorator.prototype.data;

/**
 * @type {vs.ui.VisHandler}
 * @name vs.ui.Decorator#target
 */
vs.ui.Decorator.prototype.target;

/**
 * @type {Object.<string, *>}
 * @name vs.ui.Decorator#options
 */
vs.ui.Decorator.prototype.options;

/**
 * @type {Object.<string, vs.ui.Setting>}
 * @name vs.ui.Decorator#settings
 */
vs.ui.Decorator.prototype.settings;

/**
 * @type {vs.async.Task}
 * @name vs.ui.Decorator#beginDrawTask
 */
vs.ui.Decorator.prototype.beginDrawTask;

/**
 * @type {vs.async.Task}
 * @name vs.ui.Decorator#endDrawTask
 */
vs.ui.Decorator.prototype.endDrawTask;
/**
 * @param {string} optionKey
 * @returns {*}
 */
vs.ui.Decorator.prototype.optionValue = function(optionKey) {};

/**
 * @returns {Promise}
 */
vs.ui.Decorator.prototype.beginDraw = function() {};

/**
 * @returns {Promise}
 */
vs.ui.Decorator.prototype.endDraw = function() {};


/**
 * @param {{$scope: angular.Scope, $element: jQuery, $attrs: angular.Attributes, $timeout: angular.$timeout, taskService: vs.async.TaskService}} $ng
 * @param {jQuery} $targetElement
 * @param {vs.ui.VisHandler} target
 * @param {Object.<string, *>} options
 * @constructor
 * @extends vs.ui.Decorator
 */
vs.ui.decorators.Axis = function($ng, $targetElement, target, options) {};

/**
 * @type {Object.<string, vs.ui.Setting>}
 */
vs.ui.decorators.Axis.Settings = {};

/**
 * @enum {string}
 */
vs.ui.decorators.Axis.Orientation = {
  'x': 'bottom',
  'y': 'left'
};

/**
 * @type {string}
 * @name vs.ui.decorators.Axis#type
 */
vs.ui.decorators.Axis.prototype.type;

/**
 * @type {number}
 * @name vs.ui.decorators.Axis#ticks
 */
vs.ui.decorators.Axis.prototype.ticks;

/**
 * @type {string}
 * @name vs.ui.decorators.Axis#format
 */
vs.ui.decorators.Axis.prototype.format;
/**
 * @param {{$scope: angular.Scope, $element: jQuery, $attrs: angular.Attributes, $timeout: angular.$timeout, taskService: vs.async.TaskService}} $ng
 * @param {jQuery} $targetElement
 * @param {vs.ui.VisHandler} target
 * @param {Object.<string, *>} options
 * @constructor
 * @extends vs.ui.decorators.Axis
 */
vs.ui.svg.SvgAxis = function($ng, $targetElement, target, options) {};

/**
 * @returns {Promise}
 */
vs.ui.svg.SvgAxis.prototype.endDraw = function() {};


/**
 * @constructor
 * @extends {ngu.Configuration}
 */
vs.linking.LinkProvider = function() {};

/**
 * @param {string} dataId1
 * @param {string} dataId2
 * @param {function(vs.models.DataSource, Array.<Object>, vs.models.DataSource): Array.<Object>} link (d1, obj1, d2) => obj2
 */
vs.linking.LinkProvider.prototype.register = function(dataId1, dataId2, link) {};

/**
 * @param {vs.ui.BrushingEvent} brushingEvent
 * @param {Array.<vs.models.DataSource>} data
 * @returns {Array.<Object>}
 */
vs.linking.LinkProvider.prototype.brushingObjects = function(brushingEvent, data) {};


/**
 * @param {angular.Scope} $scope
 * @param {vs.ui.VisualizationFactory} visualizationFactory
 * @param {vs.async.TaskService} taskService
 * @param {angular.Scope} $rootScope
 * @param {vs.linking.LinkProvider} linkProvider
 * @constructor
 * @extends {ngu.Directive}
 */
vs.directives.Visualization = function($scope, visualizationFactory, taskService, $rootScope, linkProvider) {};

/**
 * @type {vs.async.TaskService}
 * @name vs.directives.Visualization#taskService
 */
vs.directives.Visualization.prototype.taskService;

/**
 * @type {vs.ui.VisHandler}
 * @name vs.directives.Visualization#handler
 */
vs.directives.Visualization.prototype.handler;
/**
 * @type {{pre: (undefined|function(angular.Scope, jQuery, angular.Attributes, (*|undefined))), post: (undefined|function(angular.Scope, jQuery, angular.Attributes, (*|undefined)))}|function(angular.Scope, jQuery, angular.Attributes, (*|undefined))}
 */
vs.directives.Visualization.prototype.link;


/**
 * @param {angular.Scope} $scope
 * @param {vs.async.TaskService} taskService
 * @param {angular.$timeout} $timeout
 * @param {boolean} [overridesVisHandler] If set to true, this flag will allow the decorator's draw methods to execute
 * before and after respectively of the VisHandler's beginDraw/endDraw methods.
 * @constructor
 * @extends {ngu.Directive}
 */
vs.directives.GraphicDecorator = function($scope, taskService, $timeout, overridesVisHandler) {};

/**
 * @type {vs.ui.Decorator}
 * @name vs.directives.GraphicDecorator#handler
 */
vs.directives.GraphicDecorator.prototype.handler;
/**
 * @param {angular.Scope} $scope
 * @param {jQuery} $element
 * @param {angular.Attributes} $attrs
 * @param controller
 * @override
 */
vs.directives.GraphicDecorator.prototype.link = function($scope, $element, $attrs, controller) {};

/**
 * @param {{$scope: angular.Scope, $element: jQuery, $attrs: angular.Attributes, $timeout: angular.$timeout, taskService: vs.async.TaskService}} $ng
 * @param {jQuery} $targetElement
 * @param {vs.ui.VisHandler} target
 * @param {Object.<string, *>} options
 * @returns {vs.ui.Decorator}
 */
vs.directives.GraphicDecorator.prototype.createDecorator = function($ng, $targetElement, target, options) {};


/**
 * @param {number} [x]
 * @param {number} [y]
 * @constructor
 */
vs.models.Point = function(x, y) {};

/**
 * @type {number}
 * @name vs.models.Point#x
 */
vs.models.Point.prototype.x;

/**
 * @type {number}
 * @name vs.models.Point#y
 */
vs.models.Point.prototype.y;


/**
 * @param {function((vs.models.Point|{x: (number|undefined), y: (number|undefined)})): vs.models.Point} transformation
 * @constructor
 */
vs.models.Transformer = function(transformation) {};

/**
 * @param {vs.models.Point|{x: (number|undefined), y: (number|undefined)}} point
 * @returns {vs.models.Point}
 */
vs.models.Transformer.prototype.calc = function(point) {};

/**
 * @param {vs.models.Point|{x: (number|undefined), y: (number|undefined)}} point
 * @returns {Array.<number>}
 */
vs.models.Transformer.prototype.calcArr = function(point) {};

/**
 * @param {number} x
 * @returns {number}
 */
vs.models.Transformer.prototype.calcX = function(x) {};

/**
 * @param {number} y
 * @returns {number}
 */
vs.models.Transformer.prototype.calcY = function(y) {};

/**
 * @param {vs.models.Transformer|function((vs.models.Point|{x: (number|undefined), y: (number|undefined)})): vs.models.Point} transformer
 * @returns {vs.models.Transformer}
 */
vs.models.Transformer.prototype.combine = function(transformer) {};

/**
 * @param {vs.models.Point|{x: (number|undefined), y: (number|undefined)}} offset
 * @returns {vs.models.Transformer}
 */
vs.models.Transformer.prototype.translate = function(offset) {};

/**
 * @param {function(number):number} xScale
 * @param {function(number):number} yScale
 * @returns {vs.models.Transformer}
 */
vs.models.Transformer.prototype.scale = function(xScale, yScale) {};

/**
 * @returns {vs.models.Transformer}
 */
vs.models.Transformer.prototype.intCoords = function() {};

/**
 * @param {vs.models.Point|{x: (number|undefined), y: (number|undefined)}} offset
 * @returns {vs.models.Transformer}
 */
vs.models.Transformer.translate = function(offset) {};

/**
 * @param {function(number):number} xScale
 * @param {function(number):number} yScale
 * @returns {vs.models.Transformer}
 */
vs.models.Transformer.scale = function(xScale, yScale) {};

/**
 * @returns {vs.models.Transformer}
 */
vs.models.Transformer.intCoords = function() {};


/**
 * @param {{$scope: angular.Scope, $element: jQuery, $attrs: angular.Attributes, $timeout: angular.$timeout, taskService: vs.async.TaskService}} $ng
 * @param {jQuery} $targetElement
 * @param {vs.ui.VisHandler} target
 * @param {Object.<string, *>} options
 * @constructor
 * @extends vs.ui.decorators.Axis
 */
vs.ui.canvas.CanvasAxis = function($ng, $targetElement, target, options) {};

/**
 * @returns {Promise}
 */
vs.ui.canvas.CanvasAxis.prototype.endDraw = function() {};


/**
 * @constructor
 * @extends {vs.directives.GraphicDecorator}
 */
vs.directives.Axis = function() {};

/**
 * @param {{$scope: angular.Scope, $element: jQuery, $attrs: angular.Attributes, $timeout: angular.$timeout, taskService: vs.async.TaskService}} $ng
 * @param {jQuery} $targetElement
 * @param {vs.ui.VisHandler} target
 * @param {Object.<string, *>} options
 * @returns {vs.ui.Decorator}
 * @override
 */
vs.directives.Axis.prototype.createDecorator = function($ng, $targetElement, target, options) {};


/**
 * @param {string} message
 * @param {Error} [innerException]
 * @constructor
 * @extends u.Exception
 */
vs.models.ModelsException = function(message, innerException) {};

/**
 * @param {string} chr
 * @param {number} start
 * @param {number} end
 * @constructor
 */
vs.models.GenomicRangeQuery = function(chr, start, end) {};

/**
 * @type {string}
 * @name vs.models.GenomicRangeQuery#chr
 */
vs.models.GenomicRangeQuery.prototype.chr;

/**
 * @type {number}
 * @name vs.models.GenomicRangeQuery#start
 */
vs.models.GenomicRangeQuery.prototype.start;

/**
 * @type {number}
 * @name vs.models.GenomicRangeQuery#end
 */
vs.models.GenomicRangeQuery.prototype.end;

/**
 * @type {Array.<vs.models.Query>}
 * @name vs.models.GenomicRangeQuery#query
 */
vs.models.GenomicRangeQuery.prototype.query;
/**
 * @param {Array.<vs.models.Query>} query
 * @returns {vs.models.GenomicRangeQuery}
 */
vs.models.GenomicRangeQuery.extract = function(query) {};


/**
 * @param {{$scope: angular.Scope, $element: jQuery, $attrs: angular.Attributes, $timeout: angular.$timeout, taskService: vs.async.TaskService}} $ng
 * @param {jQuery} $targetElement
 * @param {vs.ui.VisHandler} target
 * @param {Object.<string, *>} options
 * @constructor
 * @extends vs.ui.Decorator
 */
vs.ui.decorators.Grid = function($ng, $targetElement, target, options) {};

/**
 * @type {Object.<string, vs.ui.Setting>}
 */
vs.ui.decorators.Grid.Settings = {};

/**
 * @type {string}
 * @name vs.ui.decorators.Grid#type
 */
vs.ui.decorators.Grid.prototype.type;

/**
 * @type {number}
 * @name vs.ui.decorators.Grid#ticks
 */
vs.ui.decorators.Grid.prototype.ticks;

/**
 * @type {string}
 * @name vs.ui.decorators.Grid#format
 */
vs.ui.decorators.Grid.prototype.format;
/**
 * @param {{$scope: angular.Scope, $element: jQuery, $attrs: angular.Attributes, $timeout: angular.$timeout, taskService: vs.async.TaskService}} $ng
 * @param {jQuery} $targetElement
 * @param {vs.ui.VisHandler} target
 * @param {Object.<string, *>} options
 * @constructor
 * @extends vs.ui.decorators.Grid
 */
vs.ui.svg.SvgGrid = function($ng, $targetElement, target, options) {};

/**
 * @returns {Promise}
 */
vs.ui.svg.SvgGrid.prototype.endDraw = function() {};


/**
 * @param {{$scope: angular.Scope, $element: jQuery, $attrs: angular.Attributes, $timeout: angular.$timeout, taskService: vs.async.TaskService}} $ng
 * @param {jQuery} $targetElement
 * @param {vs.ui.VisHandler} target
 * @param {Object.<string, *>} options
 * @constructor
 * @extends vs.ui.decorators.Grid
 */
vs.ui.canvas.CanvasGrid = function($ng, $targetElement, target, options) {};

vs.ui.canvas.CanvasGrid.prototype.endDraw = function() {};


/**
 * @param {angular.Scope} $scope
 * @param {vs.async.TaskService} taskService
 * @param {angular.$timeout} $timeout
 * @constructor
 * @extends {vs.directives.GraphicDecorator}
 */
vs.directives.Grid = function($scope, taskService, $timeout) {};

/**
 * @param {{$scope: angular.Scope, $element: jQuery, $attrs: angular.Attributes, $timeout: angular.$timeout, taskService: vs.async.TaskService}} $ng
 * @param {jQuery} $targetElement
 * @param {vs.ui.VisHandler} target
 * @param {Object.<string, *>} options
 * @returns {vs.ui.Decorator}
 * @override
 */
vs.directives.Grid.prototype.createDecorator = function($ng, $targetElement, target, options) {};


/**
 * @constructor
 * @extends {ngu.Directive}
 */
vs.directives.Window = function() {};

/**
 * @type {jQuery}
 * @name vs.directives.Window#$window
 */
vs.directives.Window.prototype.$window;
/**
 * @type {{pre: (undefined|function(angular.Scope, jQuery, angular.Attributes, (*|undefined))), post: (undefined|function(angular.Scope, jQuery, angular.Attributes, (*|undefined)))}|function(angular.Scope, jQuery, angular.Attributes, (*|undefined))}
 */
vs.directives.Window.prototype.link;


/**
 * @param {angular.Scope} $scope
 * @param {vs.async.TaskService} taskService
 * @param {angular.$timeout} $timeout
 * @constructor
 * @extends {ngu.Directive}
 */
vs.directives.LoadingDecorator = function($scope, taskService, $timeout) {};

/**
 * @param {angular.Scope} $scope
 * @param {jQuery} $element
 * @param {angular.Attributes} $attrs
 * @param controller
 * @override
 */
vs.directives.LoadingDecorator.prototype.link = function($scope, $element, $attrs, controller) {};


/**
 * @param {{$scope: angular.Scope, $element: jQuery, $attrs: angular.Attributes, $timeout: angular.$timeout, taskService: vs.async.TaskService}} $ng
 * @param {jQuery} $targetElement
 * @param {vs.ui.VisHandler} target
 * @param {Object.<string, *>} options
 * @constructor
 * @extends vs.ui.Decorator
 */
vs.ui.decorators.Brushing = function($ng, $targetElement, target, options) {};

/**
 * @type {u.Event.<vs.ui.BrushingEvent>}
 * @name vs.ui.decorators.Brushing#brushing
 */
vs.ui.decorators.Brushing.prototype.brushing;

/**
 * @type {Object.<string, vs.ui.Setting>}
 */
vs.ui.decorators.Brushing.Settings = {};
/**
 * @param {vs.ui.BrushingEvent} e
 * @param {Array.<Object>} objects
 */
vs.ui.decorators.Brushing.prototype.brush = function(e, objects) {};


/**
 * @param {{$scope: angular.Scope, $element: jQuery, $attrs: angular.Attributes, $timeout: angular.$timeout, taskService: vs.async.TaskService}} $ng
 * @param {jQuery} $targetElement
 * @param {vs.ui.VisHandler} target
 * @param {Object.<string, *>} options
 * @constructor
 * @extends vs.ui.decorators.Brushing
 */
vs.ui.svg.SvgBrushing = function($ng, $targetElement, target, options) {};

/**
 * @returns {Promise}
 */
vs.ui.svg.SvgBrushing.prototype.beginDraw = function() {};

/**
 * @returns {Promise}
 */
vs.ui.svg.SvgBrushing.prototype.endDraw = function() {};

/**
 * @param {vs.ui.BrushingEvent} e
 * @param {Array.<Object>} objects
 */
vs.ui.svg.SvgBrushing.prototype.brush = function(e, objects) {};


/**
 * @param {{$scope: angular.Scope, $element: jQuery, $attrs: angular.Attributes, $timeout: angular.$timeout, taskService: vs.async.TaskService}} $ng
 * @param {jQuery} $targetElement
 * @param {vs.ui.VisHandler} target
 * @param {Object.<string, *>} options
 * @constructor
 * @extends vs.ui.decorators.Brushing
 */
vs.ui.canvas.CanvasBrushing = function($ng, $targetElement, target, options) {};

/**
 * @returns {Promise}
 */
vs.ui.canvas.CanvasBrushing.prototype.beginDraw = function() {};

/**
 * @returns {Promise}
 */
vs.ui.canvas.CanvasBrushing.prototype.endDraw = function() {};
/*

/!**
 * @param {vs.ui.BrushingEvent} e
 *!/
vs.ui.canvas.CanvasBrushing.prototype.brush = function(e) {};
*/


/**
 * @param {angular.Scope} $scope
 * @param {vs.async.TaskService} taskService
 * @param {angular.$timeout} $timeout
 * @param $rootScope Angular root scope
 * @param {vs.linking.LinkProvider} linkProvider
 * @constructor
 * @extends {vs.directives.GraphicDecorator}
 */
vs.directives.Brushing = function($scope, taskService, $timeout, $rootScope, linkProvider) {};

vs.directives.Brushing.prototype.link = function($scope, $element, $attrs, controller) {};

/**
 * @param {{$scope: angular.Scope, $element: jQuery, $attrs: angular.Attributes, $timeout: angular.$timeout, taskService: vs.async.TaskService}} $ng
 * @param {jQuery} $targetElement
 * @param {vs.ui.VisHandler} target
 * @param {Object.<string, *>} options
 * @returns {vs.ui.Decorator}
 * @override
 */
vs.directives.Brushing.prototype.createDecorator = function($ng, $targetElement, target, options) {};


/**
 * @param {angular.Scope} $scope
 * @param $document
 * @constructor
 * @extends {ngu.Directive}
 */
vs.directives.Movable = function($scope, $document) {};

/**
 * @param {angular.Scope} $scope
 * @param {jQuery} $element
 * @param {angular.Attributes} $attrs
 * @param controller
 * @override
 */
vs.directives.Movable.prototype.link = function($scope, $element, $attrs, controller) {};


/**
 * @param {{render: string, type: string}} construct
 * @param {Object.<string, *>} [options]
 * @param {{cls: Array.<string>, elem: Array.<{cls: string, options: Object.<string, *>}>}} [decorators]
 * @constructor
 */
vs.ui.VisualContext = function(construct, options, decorators) {};


/**
 * @param {vs.ui.DataHandler|{data: Array.<vs.models.DataSource>, visualizations: (Array.<vs.ui.VisualContext>|undefined), children: (Array.<vs.ui.DataHandler>|undefined), name: (string|undefined)}} options
 * @constructor
 */
vs.ui.DataHandler = function(options) {};

/**
 * @type {string}
 * @name vs.ui.DataHandler#name
 */
vs.ui.DataHandler.prototype.name;

/**
 * @type {Array.<vs.models.DataSource>}
 * @name vs.ui.DataHandler#data
 */
vs.ui.DataHandler.prototype.data;

/**
 * @type {u.Event.<vs.models.DataSource>}
 * @name vs.ui.DataHandler#dataChanged
 */
vs.ui.DataHandler.prototype.dataChanged;

/**
 * @type {Array.<vs.ui.DataHandler>}
 * @name vs.ui.DataHandler#children
 */
vs.ui.DataHandler.prototype.children;

/**
 * @type {Array.<vs.ui.VisualContext>}
 * @name vs.ui.DataHandler#visualizations
 */
vs.ui.DataHandler.prototype.visualizations;
/**
 * @param {vs.models.Query|Array.<vs.models.Query>} queries
 * @returns {Promise.<vs.models.DataSource>}
 */
vs.ui.DataHandler.prototype.query = function(queries) {};


/**
 * @param {angular.Scope} $scope
 * @param {angular.$templateCache} $templateCache
 * @constructor
 * @extends {ngu.Directive}
 */
vs.directives.DataContext = function($scope, $templateCache) {};

/**
 * @type {vs.ui.DataHandler}
 * @name vs.directives.DataContext#handler
 */
vs.directives.DataContext.prototype.handler;

/**
 * @type {string}
 * @name vs.directives.DataContext#template
 */
vs.directives.DataContext.prototype.template;
/**
 * @constructor
 * @extends {vs.ui.VisHandler}
 */
vs.ui.canvas.CanvasVis = function () {};

/**
 * @type {Object.<string, vs.ui.Setting>}
 */
vs.ui.canvas.CanvasVis.Settings = u.extend({}, vs.ui.VisHandler.Settings, {
  'doubleBuffer': vs.ui.Setting.PredefinedSettings['doubleBuffer']
});

/**
 * @type {jQuery}
 * @name vs.ui.canvas.CanvasVis#pendingCanvas
 */
vs.ui.canvas.CanvasVis.prototype.pendingCanvas;

/**
 * @type {jQuery}
 * @name vs.ui.canvas.CanvasVis#activeCanvas
 */
vs.ui.canvas.CanvasVis.prototype.activeCanvas;

/**
 * @type {boolean}
 * @name vs.ui.canvas.CanvasVis#doubleBuffer
 */
vs.ui.canvas.CanvasVis.prototype.doubleBuffer;
/**
 * @returns {Promise}
 */
vs.ui.canvas.CanvasVis.prototype.beginDraw = function () {};

/**
 * @returns {Promise}
 */
vs.ui.canvas.CanvasVis.prototype.endDraw = function() {};

/**
 * @param {number} x
 * @param {number} y
 * @returns {Array.<Object>}
 */
vs.ui.canvas.CanvasVis.prototype.getItemsAt = function(x, y) {};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {number} cx
 * @param {number} cy
 * @param {number} r
 * @param {string} [fill]
 * @param {string} [stroke]
 * @param {number} [strokeWidth]
 */
vs.ui.canvas.CanvasVis.circle = function(context, cx, cy, r, fill, stroke, strokeWidth) {};




/**/

