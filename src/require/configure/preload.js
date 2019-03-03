
/**
 * @file Require preload configuration option
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfRequireConfigureAddOption*/
/*#endif*/

function _gpfRequireConfigurePreload (context, value) {
  _gpfArrayForEach(Object.keys(value), function (name) {
      context.preload[name] = value[name];
  }, this);
}

_gpfRequireConfigureAddOption("preload", _gpfRequireConfigurePreload);
