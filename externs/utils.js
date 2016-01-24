/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 11/6/2015
 * Time: 12:03 PM
 */

// Generated with http://www.dotnetwise.com/Code/Externs/
// Load: https://rawgit.com/florin-chelaru/utils.js/master/utils.min.js
var u = {
  "AbstractMethodException": function () {},
  "array": {
    "fromArguments": function () {},
    "fill": function () {},
    "range": function () {},
    "unique": function () {}
  },
  "async": {
    "all": function () {},
    "for": function () {},
    "each": function () {},
    "do": function () {},
    "Deferred": function () {}
  },
  "EventListener": function () {},

  /**
   * @constructor
   */
  "Event": function () {},

  /**
   * @constructor
   */
  "Exception": function () {},
  "Geolocation": function () {},
  "log": {
    "info": function () {},
    "warn": function () {},
    "error": function () {}
  },
  "math": {
    "floorPrecision": function () {},
    "scaleLinear": function () {}
  },
  "reflection": {
    "evaluateFullyQualifiedTypeName": function () {},
    "applyConstructor": function () {},
    "wrap": function () {},
    "ReflectionException": function () {}
  },
  "string": {
    "capitalizeFirstLetter": function () {}
  },
  "TimeSpan": function () {},
  "each": function () {},
  "map": function () {},
  "copy": function () {},
  "extend": function () {},
  "generatePseudoGUID": function () {},
  "httpGet": function () {},
  "parseLessConsts": function () {},
  "UnimplementedException": function () {}
};

/**
 * @name u.Event#fire
 */
u.Event.prototype.fire;

/**
 * @name u.Event#addListener
 */
u.Event.prototype.addListener;

/**
 * @param {number} x Offset
 * @param {number} y Offset
 * @param {number} w Width
 * @param {number} h Height
 * @param {number} minQuadrantRatio
 * @param {number} maxQuadrantCapacity
 * @constructor
 */
u.QuadTree = function(x, y, w, h, minQuadrantRatio, maxQuadrantCapacity) {};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {*} [value]
 */
u.QuadTree.prototype.insert = function(x, y, w, h, value) {};

/**
 * @param {number} x
 * @param {number} y
 * @returns {Array.<{x: number, y: number, w: number, h: number, value: *}>}
 */
u.QuadTree.prototype.collisions = function(x, y) {};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @returns {Array.<{x: number, y: number, w: number, h: number, value: *}>}
 */
u.QuadTree.prototype.overlaps = function(x, y, w, h) {};

/**
 * @returns {Array.<{x: number, y: number, w: number, h: number, items: Array}>}
 */
u.QuadTree.prototype.leaves = function() {};
