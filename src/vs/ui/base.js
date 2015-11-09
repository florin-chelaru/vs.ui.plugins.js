/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 11/8/2015
 * Time: 1:23 AM
 */

/**
 * @fileoverview
 * @suppress {globalThis}
 */

if (COMPILED) {
  goog.provide('vs.ui');
}

// Extend the namespaces defined here with the ones in the base vis.js package
(function() {
  u.extend(vs, this['vs']);
  u.extend(vs.ui, this['vs']['ui']);
}).call(this);

