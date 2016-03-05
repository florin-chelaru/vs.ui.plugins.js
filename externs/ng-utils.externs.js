
var ngu = {};

/**
 * @param {angular.Scope} $scope Angular scope
 * @constructor
 */
ngu.Directive = function($scope) {};

/**
 * @type {angular.Scope}
 * @name ngu.Directive#$scope
 */
ngu.Directive.prototype.$scope;

/**
 * @type {jQuery}
 * @name ngu.Directive#$element
 */
ngu.Directive.prototype.$element;

/**
 * @type {angular.Attributes}
 * @name ngu.Directive#$attrs
 */
ngu.Directive.prototype.$attrs;

/**
 * @type {{pre: (undefined|function(angular.Scope, jQuery, angular.Attributes, (*|undefined))), post: (undefined|function(angular.Scope, jQuery, angular.Attributes, (*|undefined)))}|function(angular.Scope, jQuery, angular.Attributes, (*|undefined))}
 */
ngu.Directive.prototype.link = {
  'pre': function($scope, $element, $attrs, controller) {},
  'post': function($scope, $element, $attrs, controller) {}
};

/**
 * @param {string} name
 * @param {function(new: ngu.Directive)} controllerCtor
 * @param {Array} [args]
 * @param {Object.<string, *>} [options]
 * @returns {Object.<string, *>}
 */
ngu.Directive.createNew = function(name, controllerCtor, args, options) {};

/**
 * @param {angular.Scope} $scope Angular scope
 * @constructor
 */
ngu.Controller = function($scope) {};

/**
 * @type {string}
 * @name ngu.Controller#id
 */
ngu.Controller.prototype.id;

/**
 * @type {angular.Scope}
 * @name ngu.Controller#$scope
 */
ngu.Controller.prototype.$scope;

/**
 * @constructor
 */
ngu.Service = function() {};

/**
 * @type {string}
 * @name ngu.Service#id
 */
ngu.Service.prototype.id;


ngu.d = {};

/**
 * @param {angular.Scope} $scope
 * @constructor
 * @extends {ngu.Directive}
 */
ngu.d.Fade = function ($scope) {};

/**
 * @param {angular.Scope} $scope
 * @param {jQuery} $element
 * @param {angular.Attributes} $attrs
 * @override
 */
ngu.d.Fade.prototype.link = function ($scope, $element, $attrs) {};

/**
 * @param {angular.Scope} $scope
 * @constructor
 * @extends {ngu.Directive}
 */
ngu.d.IncludeReplace = function ($scope) {};

/**
 * @param {angular.Scope} $scope
 * @param {jQuery} $element
 * @param {angular.Attributes} $attrs
 * @override
 */
ngu.d.IncludeReplace.prototype.link = function ($scope, $element, $attrs) {};

/**
 * @param {angular.Scope} $scope
 * @constructor
 * @extends {ngu.Directive}
 */
ngu.d.ShowAfterTransition = function ($scope) {};

/**
 * @param {angular.Scope} $scope
 * @param {jQuery} $element
 * @param {angular.Attributes} $attrs
 * @override
 */
ngu.d.ShowAfterTransition.prototype.link = function ($scope, $element, $attrs) {};

/**
 * @param {angular.Scope} $scope
 * @constructor
 * @extends {ngu.Directive}
 */
ngu.d.TransitionEnd = function ($scope) {};

/**
 * @param {angular.Scope} $scope
 * @param {jQuery} $element
 * @param {angular.Attributes} $attrs
 * @override
 */
ngu.d.TransitionEnd.prototype.link = function ($scope, $element, $attrs) {};

/**
 * @constructor
 */
ngu.Configuration = function() {};

/**
 * @returns {ngu.Configuration}
 */
ngu.Configuration.prototype.$get = function() {};

/**
 * @param {function(new: ngu.ProviderService)} serviceCtor
 * @param {Array.<string>} [serviceArgs]
 * @constructor
 */
ngu.Provider = function(serviceCtor, serviceArgs) {};

/**
 * @type {string}
 * @name ngu.Provider#id
 */
ngu.Provider.prototype.id;

/**
 * @type {Array}
 * @name ngu.Provider#$get
 */
ngu.Provider.prototype.$get;

/**
 * @param {ngu.Provider} provider
 * @constructor
 * @extends {ngu.Service}
 */
ngu.ProviderService = function(provider) {};

/**
 * @type {ngu.Provider}
 * @name ngu.ProviderService#provider
 */
ngu.ProviderService.prototype.provider;

/**
 * @param {boolean} [keepScrollbar]
 * @returns {{$doc: jQuery, scrollTop: number}}
 */
ngu.disableBodyScroll = function(keepScrollbar) {};

/**
 * @param {{$doc: jQuery, scrollTop: number}} previousState
 */
ngu.reEnableBodyScroll = function(previousState) {};

/**
 * @param {string} ua
 * @returns {{browser: string, version: string}}
 */
ngu.uaMatch = function(ua) {};

/**
 * @returns {{chrome: (boolean|undefined), safari: (boolean|undefined), webkit: (boolean|undefined), mozilla: (boolean|undefined), version: (string|undefined)}}
 */
ngu.browser = function() {};
