/**
 * @file Require cache configuration option
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfRequireConfigureAddOption*/
/*#endif*/

function _gpfRequireConfigureCache (context, value) {
  _gpfArrayForEach(Object.keys(value), function (name) {
      context.cache[name] = Promise.resolve(value[name]);
  }, this);
}

_gpfRequireConfigureAddOption("cache", _gpfRequireConfigureCache);
